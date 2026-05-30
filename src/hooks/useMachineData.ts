import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { supaCache } from '../lib/supaCache';

export interface MachineData {
  id: string;
  sr_no: number | null;
  date: string | null;
  client_name: string;
  area: string | null;
  state: string;
  state_id: string | null;
  bagging_mc: number;
  pulverisers: number;
  hammer_mill: number;
  air_classifiers: number;
  total_machines: number;
}

export interface StateAggregates {
  total: number;
  min: number;
  max: number;
  byState: Record<string, number>;
  clientsByState: Record<string, number>;
}

export function useMachineData() {
  // Try to serve cached data instantly
  const cached = supaCache.getCached<MachineData[]>('machines:all');
  const [data, setData] = useState<MachineData[]>(cached || []);
  const [loading, setLoading] = useState(!cached);
  const [aggregates, setAggregates] = useState<StateAggregates>({
    total: 0,
    min: 0,
    max: 0,
    byState: {},
    clientsByState: {},
  });

  const computeAggregates = useCallback((machines: MachineData[]) => {
    const byState: Record<string, number> = {};
    const clientSets: Record<string, Set<string>> = {};
    let total = 0;

    machines.forEach(m => {
      if (m.state_id) {
        byState[m.state_id] = (byState[m.state_id] || 0) + (m.total_machines || 0);
        const clientKey = (m.client_name || '').trim().toLowerCase();
        if (clientKey) {
          if (!clientSets[m.state_id]) clientSets[m.state_id] = new Set();
          clientSets[m.state_id].add(clientKey);
        }
      }
      total += (m.total_machines || 0);
    });

    const counts = Object.values(byState);
    const clientsByState: Record<string, number> = {};
    Object.entries(clientSets).forEach(([stateId, set]) => {
      clientsByState[stateId] = set.size;
    });

    setAggregates({
      total,
      min: counts.length > 0 ? Math.min(...counts) : 0,
      max: counts.length > 0 ? Math.max(...counts) : 0,
      byState,
      clientsByState,
    });
  }, []);

  // Compute aggregates from cached data on first render
  useEffect(() => {
    if (cached && cached.length > 0) {
      computeAggregates(cached);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = useCallback(async () => {
    if (!cached) setLoading(true);
    try {
      const { data: result } = await supaCache.get(
        'machines:all',
        async () => {
          const { data: machines, error } = await supabase
            .from('client_machines')
            .select('*');

          if (error) {
            console.error('[MachineData] Error fetching:', error.message);
            return [] as MachineData[];
          }
          return (machines || []) as MachineData[];
        }
      );

      setData(result);
      computeAggregates(result);
    } catch (err) {
      console.error('[MachineData] Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computeAggregates]);

  useEffect(() => {
    fetchData();

    // Subscribe to realtime changes for the machine data table
    const channel = supabase.channel('public:client_machines')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'client_machines' },
        (payload) => {
          console.log('[MachineData Realtime] Data updated:', payload);
          // Invalidate cache and refetch
          supaCache.invalidate('machines:all');
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const getStateMachineBreakdown = useCallback((stateId: string) => {
    const stateMachines = data.filter(m => m.state_id === stateId);
    
    return stateMachines.reduce((acc, curr) => ({
      bagging_mc: acc.bagging_mc + (curr.bagging_mc || 0),
      pulverisers: acc.pulverisers + (curr.pulverisers || 0),
      hammer_mill: acc.hammer_mill + (curr.hammer_mill || 0),
      air_classifiers: acc.air_classifiers + (curr.air_classifiers || 0),
      total: acc.total + (curr.total_machines || 0),
    }), {
      bagging_mc: 0, pulverisers: 0, hammer_mill: 0, air_classifiers: 0, total: 0
    });
  }, [data]);

  const getTopClients = useCallback((stateId: string) => {
    const stateMachines = data.filter(m => m.state_id === stateId);
    
    // Aggregate by client_name to eliminate duplicates
    const clientMap = new Map<string, {
      client_name: string;
      area: string;
      total_machines: number;
      bagging_mc: number;
      pulverisers: number;
      hammer_mill: number;
      air_classifiers: number;
    }>();

    stateMachines.forEach(m => {
      const key = (m.client_name || '').trim().toLowerCase();
      if (!key) return;
      
      const existing = clientMap.get(key);
      if (existing) {
        existing.total_machines += (m.total_machines || 0);
        existing.bagging_mc += (m.bagging_mc || 0);
        existing.pulverisers += (m.pulverisers || 0);
        existing.hammer_mill += (m.hammer_mill || 0);
        existing.air_classifiers += (m.air_classifiers || 0);
        // Collect unique areas
        if (m.area && !existing.area.toLowerCase().includes(m.area.toLowerCase())) {
          existing.area = existing.area ? `${existing.area}, ${m.area}` : m.area;
        }
      } else {
        clientMap.set(key, {
          client_name: m.client_name,
          area: m.area || '',
          total_machines: m.total_machines || 0,
          bagging_mc: m.bagging_mc || 0,
          pulverisers: m.pulverisers || 0,
          hammer_mill: m.hammer_mill || 0,
          air_classifiers: m.air_classifiers || 0,
        });
      }
    });

    // Sort by total machines descending
    return Array.from(clientMap.values())
      .sort((a, b) => b.total_machines - a.total_machines);
  }, [data]);

  return { 
    data, 
    loading, 
    aggregates,
    getStateMachineBreakdown,
    getTopClients,
    refreshData: fetchData
  };
}
