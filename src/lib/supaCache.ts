/**
 * supaCache — Stale-While-Revalidate cache for Supabase data.
 *
 * Architecture:
 *  Memory Map (instant) → sessionStorage (survives refresh) → Supabase fetch
 *
 * Design:
 *  - CacheProvider interface makes the storage backend swappable
 *    (sessionStorage today, React Query / Redis tomorrow)
 *  - Per-source TTLs with hardcoded defaults, overridable from the `settings` table
 *  - Only public-facing pages use the cache; admin pages always hit Supabase directly
 */

import { supabase } from './supabase';

// ─── CacheProvider Interface ──────────────────────────────────────────────────
// Implement this interface to swap storage backends in the future.
export interface CacheProvider {
  get<T>(key: string): CacheEntry<T> | null;
  set<T>(key: string, entry: CacheEntry<T>): void;
  remove(key: string): void;
  removeByPrefix(prefix: string): void;
}

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
}

// ─── Default TTLs (milliseconds) ──────────────────────────────────────────────
const DEFAULT_TTLS: Record<string, number> = {
  cms:      15 * 60 * 1000,   // 15 minutes
  products: 10 * 60 * 1000,   // 10 minutes
  machines:  5 * 60 * 1000,   //  5 minutes
};

const STORAGE_PREFIX = 'tyco:cache:';

// ─── SessionStorage + Memory Provider ─────────────────────────────────────────
class SessionStorageCacheProvider implements CacheProvider {
  private memory = new Map<string, CacheEntry>();

  get<T>(key: string): CacheEntry<T> | null {
    // 1. Check in-memory first (fastest)
    const memEntry = this.memory.get(key);
    if (memEntry) return memEntry as CacheEntry<T>;

    // 2. Fall back to sessionStorage (survives page refresh)
    try {
      const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
      if (raw) {
        const parsed: CacheEntry<T> = JSON.parse(raw);
        // Hydrate memory for next access
        this.memory.set(key, parsed);
        return parsed;
      }
    } catch {
      // sessionStorage unavailable or corrupt — silently skip
    }
    return null;
  }

  set<T>(key: string, entry: CacheEntry<T>): void {
    this.memory.set(key, entry);
    try {
      sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
    } catch {
      // Storage full or unavailable — memory-only is fine
    }
  }

  remove(key: string): void {
    this.memory.delete(key);
    try {
      sessionStorage.removeItem(STORAGE_PREFIX + key);
    } catch {
      // no-op
    }
  }

  removeByPrefix(prefix: string): void {
    // Memory
    for (const key of this.memory.keys()) {
      if (key.startsWith(prefix)) this.memory.delete(key);
    }
    // SessionStorage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const storageKey = sessionStorage.key(i);
        if (storageKey?.startsWith(STORAGE_PREFIX + prefix)) {
          keysToRemove.push(storageKey);
        }
      }
      keysToRemove.forEach(k => sessionStorage.removeItem(k));
    } catch {
      // no-op
    }
  }
}

// ─── SupaCache Singleton ──────────────────────────────────────────────────────
class SupaCache {
  private provider: CacheProvider;
  private ttls: Record<string, number>;
  private ttlsLoaded = false;

  constructor(provider?: CacheProvider) {
    this.provider = provider || new SessionStorageCacheProvider();
    this.ttls = { ...DEFAULT_TTLS };
    // Fire-and-forget: load custom TTLs from settings table
    this.loadCustomTTLs();
  }

  /**
   * Core method: Get data with stale-while-revalidate semantics.
   *
   * @param key     Cache key (e.g. 'cms:home', 'products:list')
   * @param fetcher Async function that fetches fresh data from Supabase
   * @param ttlMs   Optional override TTL; otherwise resolved from key prefix
   * @returns       { data, isFromCache }
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs?: number
  ): Promise<{ data: T; isFromCache: boolean }> {
    const ttl = ttlMs ?? this.resolveTTL(key);
    const cached = this.provider.get<T>(key);

    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < ttl) {
        // Fresh — return cached, no revalidation
        return { data: cached.data, isFromCache: true };
      }
      // Stale — return cached immediately, revalidate in background
      this.revalidate(key, fetcher);
      return { data: cached.data, isFromCache: true };
    }

    // Cache miss — fetch synchronously
    const data = await fetcher();
    this.provider.set(key, { data, timestamp: Date.now() });
    return { data, isFromCache: false };
  }

  /**
   * Get cached data synchronously (for instant render on mount).
   * Returns null if nothing is cached.
   */
  getCached<T>(key: string): T | null {
    const cached = this.provider.get<T>(key);
    return cached ? cached.data : null;
  }

  /**
   * Manually set/update cached data (used by realtime handlers
   * that receive the new data in the payload).
   */
  set<T>(key: string, data: T): void {
    this.provider.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Invalidate a specific cache key.
   */
  invalidate(key: string): void {
    this.provider.remove(key);
  }

  /**
   * Invalidate all keys matching a prefix (e.g. 'products:' clears
   * both 'products:list' and 'products:detail:some-slug').
   */
  invalidatePrefix(prefix: string): void {
    this.provider.removeByPrefix(prefix);
  }

  /**
   * Update TTL config at runtime (called from admin Settings).
   */
  updateTTLs(newTtls: Partial<Record<string, number>>): void {
    Object.assign(this.ttls, newTtls);
  }

  /**
   * Get current TTL config (for displaying in admin UI).
   */
  getTTLs(): Record<string, number> {
    return { ...this.ttls };
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private resolveTTL(key: string): number {
    const prefix = key.split(':')[0];
    return this.ttls[prefix] ?? 5 * 60 * 1000; // Default 5 min
  }

  private async revalidate<T>(key: string, fetcher: () => Promise<T>): Promise<void> {
    try {
      const data = await fetcher();
      this.provider.set(key, { data, timestamp: Date.now() });
    } catch (err) {
      console.warn(`[SupaCache] Background revalidation failed for "${key}":`, err);
    }
  }

  private async loadCustomTTLs(): Promise<void> {
    if (this.ttlsLoaded) return;
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'cache_ttl_config')
        .maybeSingle();

      if (!error && data?.value) {
        const custom = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        // custom is expected to be { cms: number, products: number, machines: number } in minutes
        if (custom.cms) this.ttls.cms = custom.cms * 60 * 1000;
        if (custom.products) this.ttls.products = custom.products * 60 * 1000;
        if (custom.machines) this.ttls.machines = custom.machines * 60 * 1000;
      }
    } catch {
      // Settings table may not have this row yet — use defaults silently
    } finally {
      this.ttlsLoaded = true;
    }
  }
}

// Export singleton instance
export const supaCache = new SupaCache();
