import { useState } from 'react';
import { MapPin, Navigation, ZoomIn, ZoomOut, Compass } from 'lucide-react';

export default function LightMap({ destination = 'Tokyo, Japan', stops = [] }) {
  const [zoom, setZoom] = useState(1);

  // Default coordinates / stops if none supplied
  const defaultStops = [
    { name: 'Arrival & Check-in', x: 80, y: 120, day: 1 },
    { name: 'City Center & Culture', x: 140, y: 170, day: 1 },
    { name: 'Historic District', x: 190, y: 110, day: 2 },
    { name: 'Scenic Park & Sunset', x: 210, y: 220, day: 3 },
  ];

  const mapStops = stops.length > 0
    ? stops.map((s, idx) => ({
        name: s.name || `Stop ${idx + 1}`,
        x: 70 + (idx * 45) % 150,
        y: 100 + (idx * 50) % 180,
        day: s.day || (idx % 3) + 1,
      }))
    : defaultStops;

  return (
    <div className="map-snippet-card">
      {/* Light Map SVG Canvas */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 300 380"
        style={{
          background: '#f8fafc',
          display: 'block',
          transform: `scale(${zoom})`,
          transition: 'transform 0.2s ease-out',
          transformOrigin: 'center center',
        }}
      >
        {/* Soft Background Grid / Neighborhoods */}
        <rect width="300" height="380" fill="#f8fafc" />

        {/* River / Water body */}
        <path
          d="M 0,160 Q 60,190 120,150 T 220,240 T 300,210 L 300,380 L 0,380 Z"
          fill="#e0f2fe"
          opacity="0.75"
        />

        {/* Parks / Green Areas */}
        <path
          d="M 30,50 Q 70,30 90,60 T 60,100 T 20,80 Z"
          fill="#dcfce7"
          opacity="0.85"
        />
        <path
          d="M 170,260 Q 230,240 250,280 T 210,340 T 160,300 Z"
          fill="#dcfce7"
          opacity="0.85"
        />

        {/* Primary Street Grid (Subtle Lines) */}
        <g stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round">
          {/* Horizontal avenues */}
          <line x1="10" y1="90" x2="290" y2="90" />
          <line x1="20" y1="140" x2="280" y2="140" />
          <line x1="10" y1="200" x2="290" y2="200" />
          <line x1="30" y1="270" x2="270" y2="270" />

          {/* Vertical streets */}
          <line x1="60" y1="20" x2="60" y2="360" />
          <line x1="120" y1="30" x2="120" y2="350" />
          <line x1="180" y1="20" x2="180" y2="360" />
          <line x1="240" y1="30" x2="240" y2="350" />

          {/* Diagonal highways */}
          <path d="M 10,40 L 290,320" stroke="#cbd5e1" strokeWidth="3" />
          <path d="M 280,40 L 20,300" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
        </g>

        {/* Itinerary Route Connection Path */}
        <path
          d={`M ${mapStops.map((s) => `${s.x},${s.y}`).join(' L ')}`}
          fill="none"
          stroke="#d96b4f"
          strokeWidth="2.5"
          strokeDasharray="5 4"
          opacity="0.8"
        />

        {/* Interactive Stops / Pins */}
        {mapStops.map((stop, idx) => (
          <g key={idx} style={{ cursor: 'pointer' }}>
            {/* Soft shadow circle */}
            <circle cx={stop.x} cy={stop.y + 2} r="12" fill="rgba(0,0,0,0.06)" />

            {/* Coral Pin Circle */}
            <circle
              cx={stop.x}
              cy={stop.y}
              r="10"
              fill={idx === 0 ? '#3b82f6' : '#d96b4f'}
              stroke="#ffffff"
              strokeWidth="2.5"
            />

            {/* Pulse wave on active stop */}
            {idx === 0 && (
              <circle
                cx={stop.x}
                cy={stop.y}
                r="16"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.5"
                opacity="0.4"
              >
                <animate
                  attributeName="r"
                  values="10;20;10"
                  dur="2.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.6;0;0.6"
                  dur="2.5s"
                  repeatCount="indefinite"
                />
              </circle>
            )}

            {/* Day number */}
            <text
              x={stop.x}
              y={stop.y + 3.5}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="9"
              fontWeight="700"
              fontFamily="system-ui"
            >
              {stop.day}
            </text>
          </g>
        ))}
      </svg>

      {/* Map Floating UI Badge (Destination Header) */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          right: 10,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          padding: '6px 12px',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#0f172a',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <MapPin size={13} color="#d96b4f" />
          <span>{destination || 'Overview Map'}</span>
        </div>
        <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>Interactive</span>
      </div>

      {/* Map Control Buttons (+ / -) */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.2, 1.8))}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            color: '#475569',
          }}
          title="Zoom In"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.2, 0.8))}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            color: '#475569',
          }}
          title="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>
      </div>
    </div>
  );
}
