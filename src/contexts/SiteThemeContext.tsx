import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type SiteThemeSlug = 'default' | 'forge' | 'clean-pro';

export interface SiteThemeContextType {
  siteTheme: SiteThemeSlug;
  previewTheme: SiteThemeSlug | null;
  startPreview: (slug: SiteThemeSlug) => void;
  cancelPreview: () => void;
  applyTheme: (slug: SiteThemeSlug) => Promise<void>;
  saving: boolean;
}

export const SiteThemeContext = createContext<SiteThemeContextType | undefined>(undefined);

export const THEME_SETTING_KEY  = 'active_theme';
export const THEME_PREVIEW_KEY  = 'tyco-preview-theme'; // localStorage key for cross-tab preview

export function applyDataTheme(slug: SiteThemeSlug | null) {
  if (slug) {
    document.documentElement.setAttribute('data-theme', slug);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider — wraps PUBLIC routes only
// ─────────────────────────────────────────────────────────────────────────────
export function SiteThemeProvider({ children }: { children: React.ReactNode }) {
  const [siteTheme, setSiteTheme]       = useState<SiteThemeSlug>('default');
  const [previewTheme, setPreviewTheme] = useState<SiteThemeSlug | null>(null);
  const [saving, setSaving]             = useState(false);

  // Fetch persisted active theme on mount
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const { data } = await supabase
          .from('settings')
          .select('value')
          .eq('key', THEME_SETTING_KEY)
          .maybeSingle();
        const slug = (data?.value as SiteThemeSlug) || 'default';
        setSiteTheme(slug);

        // Check if admin has set a cross-tab preview
        const preview = localStorage.getItem(THEME_PREVIEW_KEY) as SiteThemeSlug | null;
        const effective = preview ?? slug;
        applyDataTheme(effective);
        if (preview) setPreviewTheme(preview);
        // Force-remove dark class for fixed-palette themes
        if (effective !== 'default') {
          document.documentElement.classList.remove('dark');
        }
      } catch {
        applyDataTheme('default');
      }
    };
    fetchTheme();

    const channel = supabase.channel('public:settings:active_theme')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settings', filter: `key=eq.${THEME_SETTING_KEY}` },
        (payload) => {
          console.log('[SiteTheme Realtime] Theme updated:', payload);
          if (payload.new && (payload.new as any).value) {
            setSiteTheme((payload.new as any).value as SiteThemeSlug);
          }
        }
      )
      .subscribe();

    // Listen for cross-tab preview changes from admin portal
    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_PREVIEW_KEY) return;
      if (e.newValue) {
        const slug = e.newValue as SiteThemeSlug;
        setPreviewTheme(slug);
        applyDataTheme(slug);
        if (slug !== 'default') {
          document.documentElement.classList.remove('dark');
        }
      } else {
        // Preview cancelled — revert to active theme
        setPreviewTheme(null);
        setSiteTheme(prev => { applyDataTheme(prev); return prev; });
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
      supabase.removeChannel(channel);
      document.documentElement.removeAttribute('data-theme');
    };
  }, []);

  // Keep DOM in sync with state changes within this tab
  useEffect(() => {
    const effective = previewTheme ?? siteTheme;
    applyDataTheme(effective);
    // For fixed-palette themes, force-remove the dark class to avoid bleed-through
    if (effective !== 'default') {
      document.documentElement.classList.remove('dark');
    }
  }, [previewTheme, siteTheme]);

  const startPreview  = useCallback((slug: SiteThemeSlug) => setPreviewTheme(slug), []);
  const cancelPreview = useCallback(() => setPreviewTheme(null), []);

  const applyTheme = useCallback(async (slug: SiteThemeSlug) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key: THEME_SETTING_KEY, value: slug, updated_at: new Date().toISOString() });
      if (error) throw error;
      setSiteTheme(slug);
      setPreviewTheme(null);
      applyDataTheme(slug);
    } finally {
      setSaving(false);
    }
  }, []);

  return (
    <SiteThemeContext.Provider value={{ siteTheme, previewTheme, startPreview, cancelPreview, applyTheme, saving }}>
      {children}
    </SiteThemeContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// useSiteTheme — for PUBLIC components inside SiteThemeProvider
// ─────────────────────────────────────────────────────────────────────────────
export function useSiteTheme(): SiteThemeContextType {
  const ctx = useContext(SiteThemeContext);
  if (!ctx) throw new Error('useSiteTheme must be used within a SiteThemeProvider');
  return ctx;
}

// ─────────────────────────────────────────────────────────────────────────────
// useAdminSiteTheme — standalone hook for ADMIN portal (no provider needed)
// Cross-tab preview: writes to localStorage so the public tab reacts instantly.
// ─────────────────────────────────────────────────────────────────────────────
export function useAdminSiteTheme() {
  const [siteTheme, setSiteTheme]       = useState<SiteThemeSlug>('default');
  const [previewTheme, setPreviewTheme] = useState<SiteThemeSlug | null>(null);
  const [saving, setSaving]             = useState(false);
  const [loaded, setLoaded]             = useState(false);

  // Fetch current active theme on mount
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await supabase
          .from('settings')
          .select('value')
          .eq('key', THEME_SETTING_KEY)
          .maybeSingle();
        setSiteTheme((data?.value as SiteThemeSlug) || 'default');
      } catch { /* ignore */ } finally {
        setLoaded(true);
      }
    };
    fetch();

    // Clean up any lingering preview when admin navigates away
    return () => {
      localStorage.removeItem(THEME_PREVIEW_KEY);
    };
  }, []);

  /**
   * Writes slug to localStorage → the `storage` event fires in all OTHER tabs
   * (same origin) → public SiteThemeProvider picks it up and applies data-theme.
   * If the public site is open in another tab, it will change instantly.
   */
  const startPreview = useCallback((slug: SiteThemeSlug) => {
    setPreviewTheme(slug);
    localStorage.setItem(THEME_PREVIEW_KEY, slug);
  }, []);

  /**
   * Removes the preview key → public tab reverts to the persisted active theme.
   */
  const cancelPreview = useCallback(() => {
    setPreviewTheme(null);
    localStorage.removeItem(THEME_PREVIEW_KEY);
  }, []);

  const applyTheme = useCallback(async (slug: SiteThemeSlug) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key: THEME_SETTING_KEY, value: slug, updated_at: new Date().toISOString() });
      if (error) throw error;
      setSiteTheme(slug);
      setPreviewTheme(null);
      localStorage.removeItem(THEME_PREVIEW_KEY); // clear preview — theme is now live
    } finally {
      setSaving(false);
    }
  }, []);

  return { siteTheme, previewTheme, startPreview, cancelPreview, applyTheme, saving, loaded };
}
