import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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
}

export function useMachineData() {
  const [data, setData] = useState<MachineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [aggregates, setAggregates] = useState<StateAggregates>({
    total: 0,
    min: 0,
    max: 0,
    byState: {},
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: machines, error } = await supabase
        .from('client_machines')
        .select('*');

      if (error) {
        console.error('[MachineData] Error fetching:', error.message);
      }

      if (machines) {
        setData(machines as MachineData[]);
        
        // Calculate aggregates
        const byState: Record<string, number> = {};
        let total = 0;
        
        machines.forEach(m => {
          if (m.state_id) {
            byState[m.state_id] = (byState[m.state_id] || 0) + (m.total_machines || 0);
          }
          total += (m.total_machines || 0);
        });

        const counts = Object.values(byState);
        setAggregates({
          total,
          min: counts.length > 0 ? Math.min(...counts) : 0,
          max: counts.length > 0 ? Math.max(...counts) : 0,
          byState
        });
      }
    } catch (err) {
      console.error('[MachineData] Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Subscribe to realtime changes for the machine data table
    const channel = supabase.channel('public:client_machines')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'client_machines' },
        (payload) => {
          console.log('[MachineData Realtime] Data updated:', payload);
          // For simplicity, just refetch all data since aggregates need recalculation
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

  const getTopClients = useCallback((stateId: string, limit = 10) => {
    const stateMachines = data.filter(m => m.state_id === stateId);
    // Sort by total machines descending
    return [...stateMachines]
      .sort((a, b) => (b.total_machines || 0) - (a.total_machines || 0))
      .slice(0, limit);
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
