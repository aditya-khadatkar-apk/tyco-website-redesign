import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { X, Search, Filter, ChevronDown, RotateCcw, MapPin, Factory, Users } from 'lucide-react';
import { INDIA_STATES } from '../data/indiaMapData';
import type { MachineData } from '../hooks/useMachineData';

interface ClientDirectoryProps {
  isOpen: boolean;
  onClose: () => void;
  data: MachineData[];
}

// Build a state name lookup map
const STATE_NAME_MAP: Record<string, string> = {};
INDIA_STATES.forEach(s => { STATE_NAME_MAP[s.id] = s.name; });

// Get unique sorted values for filter dropdowns
function getUniqueValues(data: MachineData[], key: keyof MachineData): string[] {
  const set = new Set<string>();
  data.forEach(row => {
    const val = row[key];
    if (val && typeof val === 'string' && val.trim()) set.add(val.trim());
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

interface AggregatedClient {
  client_name: string;
  area: string;
  state: string;
  state_id: string;
  bagging_mc: number;
  pulverisers: number;
  hammer_mill: number;
  air_classifiers: number;
  total_machines: number;
}

const ITEMS_PER_PAGE = 15;

export default function ClientDirectory({ isOpen, onClose, data }: ClientDirectoryProps) {
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [machineTypeFilter, setMachineTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'machines'>('machines');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isClosing, setIsClosing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Unique filter values
  const states = useMemo(() => {
    const stateIds = getUniqueValues(data, 'state_id' as keyof MachineData);
    return stateIds
      .map(id => ({ id, name: STATE_NAME_MAP[id] || id }))
      .filter(s => s.name)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  const areas = useMemo(() => getUniqueValues(data, 'area'), [data]);

  // Aggregate by client (deduplicate)
  const aggregatedClients = useMemo(() => {
    const map = new Map<string, AggregatedClient>();

    data.forEach(row => {
      const key = (row.client_name || '').trim().toLowerCase();
      if (!key) return;

      const existing = map.get(key);
      if (existing) {
        existing.total_machines += (row.total_machines || 0);
        existing.bagging_mc += (row.bagging_mc || 0);
        existing.pulverisers += (row.pulverisers || 0);
        existing.hammer_mill += (row.hammer_mill || 0);
        existing.air_classifiers += (row.air_classifiers || 0);
        if (row.area && !existing.area.toLowerCase().includes(row.area.toLowerCase())) {
          existing.area = existing.area ? `${existing.area}, ${row.area}` : row.area;
        }
      } else {
        map.set(key, {
          client_name: row.client_name,
          area: row.area || '',
          state: row.state || '',
          state_id: row.state_id || '',
          total_machines: row.total_machines || 0,
          bagging_mc: row.bagging_mc || 0,
          pulverisers: row.pulverisers || 0,
          hammer_mill: row.hammer_mill || 0,
          air_classifiers: row.air_classifiers || 0,
        });
      }
    });

    return Array.from(map.values());
  }, [data]);

  // Apply filters
  const filtered = useMemo(() => {
    let result = aggregatedClients;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(c =>
        c.client_name.toLowerCase().includes(q) ||
        c.area.toLowerCase().includes(q) ||
        (STATE_NAME_MAP[c.state_id] || '').toLowerCase().includes(q)
      );
    }

    if (stateFilter) {
      // Need to go back to raw data for state-level filtering since a client can span states
      const clientsInState = new Set<string>();
      data.forEach(row => {
        if (row.state_id === stateFilter) {
          clientsInState.add((row.client_name || '').trim().toLowerCase());
        }
      });
      result = result.filter(c => clientsInState.has(c.client_name.trim().toLowerCase()));
    }

    if (areaFilter) {
      const clientsInArea = new Set<string>();
      data.forEach(row => {
        if (row.area === areaFilter) {
          clientsInArea.add((row.client_name || '').trim().toLowerCase());
        }
      });
      result = result.filter(c => clientsInArea.has(c.client_name.trim().toLowerCase()));
    }

    if (machineTypeFilter) {
      result = result.filter(c => {
        switch (machineTypeFilter) {
          case 'bagging_mc': return c.bagging_mc > 0;
          case 'pulverisers': return c.pulverisers > 0;
          case 'hammer_mill': return c.hammer_mill > 0;
          case 'air_classifiers': return c.air_classifiers > 0;
          default: return true;
        }
      });
    }

    // Sort
    if (sortBy === 'name') {
      result.sort((a, b) => a.client_name.localeCompare(b.client_name));
    } else {
      result.sort((a, b) => b.total_machines - a.total_machines);
    }

    return result;
  }, [aggregatedClients, search, stateFilter, areaFilter, machineTypeFilter, sortBy, data]);

  const visibleClients = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Reset scroll and count when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
    scrollRef.current?.scrollTo(0, 0);
  }, [search, stateFilter, areaFilter, machineTypeFilter, sortBy]);

  // Infinite scroll observer
  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, filtered.length));
  }, [filtered.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !isOpen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) loadMore();
      },
      { root: scrollRef.current, rootMargin: '100px', threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore, isOpen]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  }, [onClose]);

  const resetFilters = () => {
    setSearch('');
    setStateFilter('');
    setAreaFilter('');
    setMachineTypeFilter('');
    setSortBy('machines');
  };

  const hasActiveFilters = search || stateFilter || areaFilter || machineTypeFilter;

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isClosing ? 'animate-lightbox-out' : 'animate-lightbox-in'
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-industrial-900/70 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-industrial-100 bg-industrial-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Users className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-bold text-industrial-900">Client Directory</h2>
              <p className="text-xs text-industrial-500">
                Search and filter across all {aggregatedClients.length.toLocaleString()} clients
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-industrial-400 hover:text-industrial-600 hover:bg-industrial-200 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search + Filters */}
        <div className="px-6 py-4 border-b border-industrial-100 bg-white flex-shrink-0 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client name, area, or state..."
              className="w-full pl-10 pr-4 py-2.5 bg-industrial-50 border border-industrial-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-industrial-400"
              autoFocus
            />
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-4 h-4 text-industrial-400 flex-shrink-0" />

            {/* State filter */}
            <div className="relative">
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-industrial-200 rounded-lg text-xs font-medium text-industrial-700 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer"
              >
                <option value="">All States</option>
                {states.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-industrial-400 pointer-events-none" />
            </div>

            {/* Area filter */}
            <div className="relative">
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-industrial-200 rounded-lg text-xs font-medium text-industrial-700 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer"
              >
                <option value="">All Areas</option>
                {areas.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-industrial-400 pointer-events-none" />
            </div>

            {/* Machine type filter */}
            <div className="relative">
              <select
                value={machineTypeFilter}
                onChange={(e) => setMachineTypeFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-industrial-200 rounded-lg text-xs font-medium text-industrial-700 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer"
              >
                <option value="">All Machine Types</option>
                <option value="bagging_mc">Bagging M/C</option>
                <option value="pulverisers">Pulverisers</option>
                <option value="hammer_mill">Hammer Mill</option>
                <option value="air_classifiers">Air Classifier</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-industrial-400 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'machines')}
                className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-industrial-200 rounded-lg text-xs font-medium text-industrial-700 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer"
              >
                <option value="machines">Sort: Most Machines</option>
                <option value="name">Sort: Name (A–Z)</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-industrial-400 pointer-events-none" />
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between text-xs text-industrial-400">
            <span>
              {filtered.length === aggregatedClients.length
                ? `${filtered.length.toLocaleString()} clients`
                : `${filtered.length.toLocaleString()} of ${aggregatedClients.length.toLocaleString()} clients`}
            </span>
            {filtered.length > 0 && (
              <span className="text-industrial-300">
                Showing {Math.min(visibleCount, filtered.length)}
              </span>
            )}
          </div>
        </div>

        {/* Results Table */}
        <div className="flex-1 overflow-auto" ref={scrollRef}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="w-12 h-12 text-industrial-200 mb-4" />
              <h3 className="text-lg font-bold text-industrial-900 mb-1">No clients found</h3>
              <p className="text-sm text-industrial-500 max-w-sm">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <table className="w-full text-left text-sm">
                <thead className="bg-industrial-50 text-industrial-500 sticky top-0 z-10 border-b border-industrial-200">
                  <tr>
                    <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider w-10">#</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider min-w-[150px]">Client</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider min-w-[120px]">Area</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider min-w-[100px]">State</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-center min-w-[80px]">Bagging</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-center min-w-[80px]">Pulv.</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-center min-w-[80px]">H.Mill</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-center min-w-[80px]">Air Cl.</th>
                    <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-right min-w-[80px]">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-industrial-100">
                  {visibleClients.map((client, idx) => (
                    <tr
                      key={`${client.client_name}-${idx}`}
                      className="hover:bg-primary-50/40 transition-colors duration-150"
                      style={{
                        animation: idx >= visibleCount - ITEMS_PER_PAGE && idx >= ITEMS_PER_PAGE
                          ? 'fadeSlideIn 0.25s ease-out'
                          : 'none',
                      }}
                    >
                      <td className="px-6 py-3 text-industrial-300 text-xs font-mono">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-industrial-900">{client.client_name}</span>
                      </td>
                      <td className="px-4 py-3 text-industrial-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-industrial-300 flex-shrink-0" />
                          <span className="truncate max-w-[180px]">{client.area || '–'}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-industrial-100 rounded text-xs font-medium text-industrial-600 whitespace-nowrap">
                          {STATE_NAME_MAP[client.state_id] || client.state || '–'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {client.bagging_mc > 0 ? (
                          <span className="text-orange-600 font-semibold">{client.bagging_mc}</span>
                        ) : (
                          <span className="text-industrial-200">–</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {client.pulverisers > 0 ? (
                          <span className="text-blue-600 font-semibold">{client.pulverisers}</span>
                        ) : (
                          <span className="text-industrial-200">–</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {client.hammer_mill > 0 ? (
                          <span className="text-green-600 font-semibold">{client.hammer_mill}</span>
                        ) : (
                          <span className="text-industrial-200">–</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {client.air_classifiers > 0 ? (
                          <span className="text-purple-600 font-semibold">{client.air_classifiers}</span>
                        ) : (
                          <span className="text-industrial-200">–</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 font-bold text-primary-600">
                          <Factory className="w-3.5 h-3.5 hidden sm:inline" />
                          {client.total_machines}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Scroll sentinel */}
              <div ref={sentinelRef} className="h-1" />

              {hasMore && (
                <div className="flex items-center justify-center py-4 bg-industrial-50/50 border-t border-industrial-100">
                  <div className="flex items-center gap-2 text-xs text-industrial-400">
                    <div className="w-4 h-4 border-2 border-primary-300 border-t-transparent rounded-full animate-spin" />
                    <span>Scroll for more…</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
