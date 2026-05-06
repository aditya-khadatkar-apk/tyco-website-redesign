import { useState } from 'react';
import { INDIA_STATES } from '../data/indiaMapData';

// Map of internal IDs used in CMS → SVG IDs from the geographic data
// Some CMS IDs use different codes than the svg-maps/india package
const CMS_TO_SVG: Record<string, string> = {
  cg: 'ct',  // Chhattisgarh
  or: 'or',  // Odisha
  ts: 'tg',  // Telangana
  ne: 'ar',  // "North East" maps to Arunachal Pradesh
  as: 'as',
  uk: 'ut',  // Uttarakhand (CMS uses 'uk', SVG uses 'ut')
  // All others: same ID
};

// Reverse map: SVG ID → friendly name for tooltip
const SVG_TO_CMS: Record<string, string> = {};
Object.entries(CMS_TO_SVG).forEach(([cms, svg]) => {
  SVG_TO_CMS[svg] = cms;
});

interface IndiaMapProps {
  statePresence: Record<string, boolean>;
  title?: string;
}

export default function IndiaMap({ statePresence, title }: IndiaMapProps) {
  const [hoveredState, setHoveredState] = useState<{ id: string; name: string } | null>(null);

  // Convert CMS state presence to SVG IDs
  const svgPresence: Record<string, boolean> = {};
  Object.entries(statePresence).forEach(([cmsId, active]) => {
    const svgId = CMS_TO_SVG[cmsId] || cmsId;
    if (active) svgPresence[svgId] = true;
  });

  // Also mark related NE states active when "ne" is active
  if (statePresence['ne']) {
    ['ar', 'mn', 'ml', 'mz', 'nl', 'tr', 'sk'].forEach(id => {
      svgPresence[id] = true;
    });
  }

  const activeCount = Object.values(statePresence).filter(Boolean).length;

  return (
    <div className="flex flex-col items-center">
      {title && (
        <h3 className="text-2xl font-heading font-bold text-industrial-900 mb-2 text-center">{title}</h3>
      )}
      <p className="text-industrial-500 text-sm mb-6 text-center">
        Presence in <span className="font-semibold text-primary-600">{activeCount}</span> states & regions across India
      </p>

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
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="hoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#2563eb" />
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
            const isActive = svgPresence[state.id] ?? false;
            const isHovered = hoveredState?.id === state.id;

            return (
              <path
                key={state.id}
                d={state.d}
                fill={
                  isHovered
                    ? (isActive ? 'url(#hoverGrad)' : '#cbd5e1')
                    : (isActive ? 'url(#activeGrad)' : '#e2e8f0')
                }
                stroke={isActive ? '#1e40af' : '#94a3b8'}
                strokeWidth={isHovered ? '1.5' : '0.5'}
                strokeLinejoin="round"
                className="transition-all duration-200 cursor-pointer"
                style={{
                  filter: isHovered ? 'url(#glow)' : (isActive ? 'url(#shadow)' : 'none'),
                }}
                onMouseEnter={() => setHoveredState({ id: state.id, name: state.name })}
                onMouseLeave={() => setHoveredState(null)}
              />
            );
          })}
        </svg>

        {/* Tooltip — uses inline styles to stay readable in both light & dark mode */}
        {hoveredState && (
          <div
            className="absolute top-4 right-4 rounded-xl shadow-xl px-4 py-3 pointer-events-none z-10"
            style={{
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(8px)',
              border: '1px solid #e2e8f0',
            }}
          >
            <p style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>
              {hoveredState.name}
            </p>
            <p style={{
              color: svgPresence[hoveredState.id] ? '#c2410c' : '#94a3b8',
              fontSize: '0.75rem',
              marginTop: '2px',
              fontWeight: svgPresence[hoveredState.id] ? 500 : 400,
            }}>
              {svgPresence[hoveredState.id] ? '● Active client presence' : '○ No clients listed'}
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-6 text-xs text-industrial-500">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-sm bg-gradient-to-br from-blue-500 to-blue-700 shadow-sm"></div>
          <span>Client Presence</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-sm bg-slate-200 border border-slate-300"></div>
          <span>No Clients</span>
        </div>
      </div>
    </div>
  );
}
