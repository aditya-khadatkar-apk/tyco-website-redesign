import { useState, useMemo } from 'react';
import { INDIA_STATES } from '../data/indiaMapData';
import { X, Factory, MapPin, Trophy } from 'lucide-react';

interface IndiaMapProps {
  title?: string;
  aggregates?: {
    total: number;
    min: number;
    max: number;
    byState: Record<string, number>;
  };
  getBreakdown?: (stateId: string) => any;
  getTopClients?: (stateId: string, limit?: number) => any[];
}

export default function IndiaMap({ title, aggregates, getBreakdown, getTopClients }: IndiaMapProps) {
  const [hoveredState, setHoveredState] = useState<{ id: string; name: string } | null>(null);
  const [selectedState, setSelectedState] = useState<{ id: string; name: string } | null>(null);

  // Strictly use database aggregates to determine presence
  const stateData = useMemo(() => {
    const data: Record<string, { active: boolean; count: number }> = {};
    
    // Map new aggregates
    if (aggregates?.byState) {
      Object.entries(aggregates.byState).forEach(([id, count]) => {
        data[id] = { active: count > 0, count };
      });
    }

    return data;
  }, [aggregates]);

  // Generate color based on count (choropleth logic)
  const getColor = (id: string, isHovered: boolean) => {
    const info = stateData[id];
    if (!info || !info.active) {
      return isHovered ? 'rgba(148, 163, 184, 0.3)' : 'rgba(148, 163, 184, 0.15)';
    }

    const { max = 0 } = aggregates || {};
    
    if (max === 0 || info.count === 0) {
      return isHovered ? 'url(#hoverGrad)' : 'url(#activeGrad)'; // fallback active color
    }

    // Calculate intensity (0.0 to 1.0)
    // Use a linear scale based purely on the maximum machine count, ensuring gradual fading
    const intensity = 0.3 + (0.7 * (info.count / (max || 1)));
    
    // Colors: #fdba74 (light orange) to #c2410c (dark orange)
    // RGB: (253,186,116) to (194,65,12)
    const r = Math.round(253 - (intensity * (253 - 194)));
    const g = Math.round(186 - (intensity * (186 - 65)));
    const b = Math.round(116 - (intensity * (116 - 12)));
    
    const opacity = isHovered ? 1 : 0.9;
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const activeCount = Object.values(stateData).filter(s => s.active).length;
  
  // Data for the currently selected modal
  const breakdown = selectedState && getBreakdown ? getBreakdown(selectedState.id) : null;
  const topClients = selectedState && getTopClients ? getTopClients(selectedState.id, 10) : [];

  return (
    <div className="flex flex-col items-center">
      {title && (
        <h3 className="text-2xl font-heading font-bold text-industrial-900 mb-2 text-center">{title}</h3>
      )}
      
      {aggregates && aggregates.total > 0 ? (
        <p className="text-industrial-500 text-sm mb-6 text-center">
          Over <span className="font-semibold text-primary-600">{aggregates.total.toLocaleString()}</span> machines delivered across <span className="font-semibold text-primary-600">{activeCount}</span> states
        </p>
      ) : (
        <p className="text-industrial-500 text-sm mb-6 text-center">
          Presence in <span className="font-semibold text-primary-600">{activeCount}</span> states & regions across India
        </p>
      )}

      <div className="relative w-full max-w-md mx-auto">
        <svg
          viewBox="0 0 612 696"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Map of India showing Tyco client presence"
        >
          {/* Background glow effect */}
          <defs>
            <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fdba74" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <linearGradient id="hoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#c2410c" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="shadow">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.1" />
            </filter>
          </defs>

          {/* Render states */}
          {INDIA_STATES.map((state) => {
            const info = stateData[state.id];
            const isActive = info?.active || false;
            const isHovered = hoveredState?.id === state.id;

            return (
              <path
                key={state.id}
                d={state.d}
                fill={getColor(state.id, isHovered)}
                stroke={isActive ? 'var(--st-primary-dark, #c2410c)' : 'rgba(148, 163, 184, 0.4)'}
                strokeWidth={isHovered ? '1.5' : '0.5'}
                strokeLinejoin="round"
                className={`transition-all duration-200 ${isActive ? 'cursor-pointer' : 'cursor-default'}`}
                style={{ filter: isHovered ? 'url(#glow)' : (isActive ? 'url(#shadow)' : 'none') }}
                onMouseEnter={() => setHoveredState({ id: state.id, name: state.name })}
                onMouseLeave={() => setHoveredState(null)}
                onClick={() => {
                  if (isActive) setSelectedState({ id: state.id, name: state.name });
                }}
              />
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredState && (
          <div
            className="absolute top-4 right-4 rounded-xl shadow-xl px-4 py-3 pointer-events-none z-10 animate-in fade-in zoom-in-95 duration-200"
            style={{
              background: 'var(--st-surface, rgba(255,255,255,0.97))',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--st-border, #e2e8f0)',
            }}
          >
            <p style={{ color: 'var(--st-text, #0f172a)', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>
              {hoveredState.name}
            </p>
            
            {stateData[hoveredState.id]?.active ? (
              <div className="mt-2">
                {stateData[hoveredState.id]?.count > 0 ? (
                  <>
                    <p className="text-primary-600 font-bold text-sm">
                      {stateData[hoveredState.id].count.toLocaleString()} Machines
                    </p>
                    <span style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '4px', display: 'block' }}>
                      Click to view detailed breakdown
                    </span>
                  </>
                ) : null}
              </div>
            ) : (
              <p style={{ color: 'var(--st-text-muted, #94a3b8)', fontSize: '0.75rem', marginTop: '2px' }}>
                ○ No clients listed
              </p>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      {aggregates && aggregates.max > 0 ? (
        <div className="mt-8 w-full max-w-sm">
          <div className="flex justify-between text-xs text-industrial-500 mb-1 font-medium">
            <span>Fewer Clients</span>
            <span>Max Clients</span>
          </div>
          <div className="h-3 rounded-full w-full bg-gradient-to-r from-[#fdba74] to-[#c2410c] shadow-inner"></div>
        </div>
      ) : (
        <div className="flex items-center gap-6 mt-6 text-xs text-industrial-500">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-sm shadow-sm" style={{ background: 'linear-gradient(to bottom right, #ea580c, #c2410c)' }}></div>
            <span>Client Presence</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-sm border" style={{ borderColor: 'rgba(148, 163, 184, 0.4)', background: 'rgba(148, 163, 184, 0.15)' }}></div>
            <span>No Clients</span>
          </div>
        </div>
      )}

      {/* State Detail Modal */}
      {selectedState && breakdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-industrial-900/60 backdrop-blur-sm" onClick={() => setSelectedState(null)}></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-industrial-100 flex justify-between items-center bg-industrial-50">
              <div className="flex items-center">
                <MapPin className="h-6 w-6 text-primary-600 mr-2" />
                <h2 className="text-xl font-heading font-bold text-industrial-900">
                  {selectedState.name}
                </h2>
                <span className="ml-4 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                  {breakdown.total.toLocaleString()} Total Machines
                </span>
              </div>
              <button 
                onClick={() => setSelectedState(null)}
                className="p-2 text-industrial-400 hover:text-industrial-600 hover:bg-industrial-200 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              
              {/* Machine Segregation Cards */}
              <h3 className="text-sm font-bold text-industrial-400 uppercase tracking-wider mb-4 flex items-center">
                <Factory className="h-4 w-4 mr-2" /> Machine Segregation
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                  <div className="text-orange-800 text-sm font-medium mb-1">Bagging M/C</div>
                  <div className="text-2xl font-bold text-orange-600">{breakdown.bagging_mc}</div>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="text-blue-800 text-sm font-medium mb-1">Pulverisers</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {breakdown.pulverisers}
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <div className="text-green-800 text-sm font-medium mb-1">Hammer Mill</div>
                  <div className="text-2xl font-bold text-green-600">{breakdown.hammer_mill}</div>
                </div>
                
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                  <div className="text-purple-800 text-sm font-medium mb-1">Air Classifier</div>
                  <div className="text-2xl font-bold text-purple-600">{breakdown.air_classifiers}</div>
                </div>
              </div>

              {/* Top Clients Table */}
              <h3 className="text-sm font-bold text-industrial-400 uppercase tracking-wider mb-4 flex items-center">
                <Trophy className="h-4 w-4 mr-2" /> Top Clients
              </h3>
              
              {topClients.length > 0 ? (
                <div className="bg-white border border-industrial-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-industrial-50 text-industrial-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Client Name</th>
                        <th className="px-4 py-3 font-medium">Area/City</th>
                        <th className="px-4 py-3 font-medium text-right">Machines</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-industrial-100">
                      {topClients.map((client, idx) => (
                        <tr key={idx} className="hover:bg-industrial-50">
                          <td className="px-4 py-3 font-medium text-industrial-900">{client.client_name}</td>
                          <td className="px-4 py-3 text-industrial-500">{client.area || '-'}</td>
                          <td className="px-4 py-3 font-bold text-primary-600 text-right">{client.total_machines}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-industrial-500 text-sm italic">No specific client data available for this state.</p>
              )}
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
