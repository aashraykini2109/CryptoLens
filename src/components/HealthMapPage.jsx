import { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Lock } from 'lucide-react';
import './HealthMapPage.css';

/* ═══════════════════════════════════════════════
   STATIC DUMMY TREE DATA
═══════════════════════════════════════════════ */
const TREE = {
  root: { label: 'My Project', sublabel: 'Cryptographic Usage', x: 480, y: 68 },
  categories: [
    {
      id: 'hashing', label: 'Hashing', sublabel: '3 algorithms',
      x: 190, y: 228, color: '#a855f7', lineColor: '#a855f7',
      algos: [
        { id: 'md5',    label: 'MD5',     risk: 'HIGH RISK',   riskColor: '#ef4444', x: 80,  y: 400 },
        { id: 'sha1',   label: 'SHA-1',   risk: 'HIGH RISK',   riskColor: '#ef4444', x: 200, y: 400 },
        { id: 'sha256', label: 'SHA-256', risk: 'LOW RISK',    riskColor: '#22c55e', x: 320, y: 400 },
      ]
    },
    {
      id: 'symmetric', label: 'Symmetric Encryption', sublabel: '2 algorithms',
      x: 480, y: 228, color: '#3b82f6', lineColor: '#3b82f6',
      algos: [
        { id: 'aes', label: 'AES', risk: 'LOW RISK',  riskColor: '#22c55e', x: 425, y: 400 },
        { id: 'des', label: 'DES', risk: 'HIGH RISK', riskColor: '#ef4444', x: 545, y: 400 },
      ]
    },
    {
      id: 'asymmetric', label: 'Asymmetric Cryptography', sublabel: '1 algorithm',
      x: 770, y: 228, color: '#22c55e', lineColor: '#22c55e',
      algos: [
        { id: 'rsa', label: 'RSA', risk: 'MEDIUM RISK', riskColor: '#f59e0b', x: 770, y: 400 },
      ]
    },
  ]
};

/* SVG cubic bezier from (x1,y1) to (x2,y2) */
function cubicPath(x1, y1, x2, y2) {
  const my = (y1 + y2) / 2;
  return `M ${x1},${y1} C ${x1},${my} ${x2},${my} ${x2},${y2}`;
}

/* ── Root node ── */
function RootNode({ node }) {
  return (
    <g>
      <rect x={node.x - 88} y={node.y - 26} width={176} height={52} rx={10}
        fill="#0a0202"
        stroke="rgba(255,255,255,0.18)" strokeWidth="1"
      />
      {/* Top highlight */}
      <rect x={node.x - 86} y={node.y - 26} width={172} height={1} rx={1}
        fill="rgba(255,255,255,0.08)"
      />
      <text x={node.x} y={node.y - 5} textAnchor="middle"
        fill="rgba(245,235,235,0.92)" fontSize="13" fontWeight="700" fontFamily="Inter, sans-serif">
        🔒 {node.label}
      </text>
      <text x={node.x} y={node.y + 12} textAnchor="middle"
        fill="rgba(139,91,91,0.7)" fontSize="10" fontFamily="JetBrains Mono, monospace">
        {node.sublabel}
      </text>
    </g>
  );
}

/* ── Category node ── */
function CatNode({ cat }) {
  return (
    <g>
      <rect x={cat.x - 98} y={cat.y - 26} width={196} height={52} rx={8}
        fill="rgba(6,1,1,0.9)"
        stroke={cat.color + '55'} strokeWidth="1"
      />
      <rect x={cat.x - 96} y={cat.y - 26} width={192} height={1} rx={1}
        fill={cat.color + '30'}
      />
      <text x={cat.x} y={cat.y - 5} textAnchor="middle"
        fill="rgba(245,235,235,0.88)" fontSize="12" fontWeight="600" fontFamily="Inter, sans-serif">
        {cat.label}
      </text>
      <text x={cat.x} y={cat.y + 12} textAnchor="middle"
        fill={cat.color + 'cc'} fontSize="10" fontFamily="Inter, sans-serif">
        {cat.sublabel}
      </text>
    </g>
  );
}

/* ── Algo / leaf node ── */
function AlgoNode({ algo }) {
  return (
    <g>
      <rect x={algo.x - 52} y={algo.y - 26} width={104} height={52} rx={7}
        fill="rgba(4,1,1,0.95)"
        stroke={algo.riskColor + '55'} strokeWidth="1"
      />
      <rect x={algo.x - 50} y={algo.y - 26} width={100} height={1} rx={1}
        fill={algo.riskColor + '25'}
      />
      <text x={algo.x} y={algo.y - 4} textAnchor="middle"
        fill="rgba(245,235,235,0.88)" fontSize="13" fontWeight="700" fontFamily="Inter, sans-serif">
        {algo.label}
      </text>
      <text x={algo.x} y={algo.y + 13} textAnchor="middle"
        fill={algo.riskColor} fontSize="8.5" fontWeight="700"
        fontFamily="JetBrains Mono, monospace" letterSpacing="1">
        {algo.risk}
      </text>
    </g>
  );
}

/* ═══════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════ */
export default function HealthMapPage({ findings }) {
  const [scale, setScale] = useState(1);
  const [locked, setLocked] = useState(false);

  const { root, categories } = TREE;

  return (
    <div className="hm2-root">
      {/* Header */}
      <div className="hm2-header">
        <div>
          <h1 className="hm2-title">Crypto Health Map</h1>
          <p className="hm2-sub">Cryptographic usage across your project</p>
        </div>
        <button className="hm2-view-btn">View Full Map →</button>
      </div>

      {/* Canvas */}
      <div className="hm2-canvas-wrap">
        {/* Background dot grid */}
        <div className="hm2-dot-grid" />

        <div className="hm2-canvas-inner" style={{ transform: `scale(${scale})`, transformOrigin: 'center top', transition: 'transform 0.25s ease' }}>
          <svg
            viewBox="0 0 960 490"
            className="hm2-svg"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Glow filters for lines */}
              {['purple','blue','green'].map((id, i) => {
                const colors = ['#a855f7','#3b82f6','#22c55e'];
                return (
                  <filter key={id} id={`glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                );
              })}
            </defs>

            {/* ── Lines: root → categories (dashed) ── */}
            {categories.map(cat => (
              <path key={cat.id + '-root'}
                d={cubicPath(root.x, root.y + 26, cat.x, cat.y - 26)}
                fill="none" stroke={cat.color} strokeWidth="1.2"
                strokeDasharray="4 3" strokeOpacity="0.65"
              />
            ))}

            {/* ── Lines: categories → algos (solid, risk-colored) ── */}
            {categories.map(cat =>
              cat.algos.map(algo => (
                <path key={algo.id + '-line'}
                  d={cubicPath(cat.x, cat.y + 26, algo.x, algo.y - 26)}
                  fill="none" stroke={algo.riskColor} strokeWidth="1.2"
                  strokeOpacity="0.6"
                />
              ))
            )}

            {/* ── Connection dots ── */}
            {/* Dot at root bottom */}
            <circle cx={root.x} cy={root.y + 26} r={3} fill="rgba(255,255,255,0.5)" />

            {/* Dots at category tops */}
            {categories.map(cat => (
              <circle key={cat.id + '-top-dot'} cx={cat.x} cy={cat.y - 26} r={3} fill={cat.color} fillOpacity="0.8" />
            ))}

            {/* Dots at category bottoms */}
            {categories.map(cat => (
              <circle key={cat.id + '-bot-dot'} cx={cat.x} cy={cat.y + 26} r={2.5} fill={cat.color} fillOpacity="0.5" />
            ))}

            {/* ── Nodes ── */}
            <RootNode node={root} />
            {categories.map(cat => <CatNode key={cat.id} cat={cat} />)}
            {categories.flatMap(cat => cat.algos.map(a => <AlgoNode key={a.id} algo={a} />))}
          </svg>
        </div>

        {/* ── Zoom controls ── */}
        <div className="hm2-controls">
          <button className="hm2-ctrl-btn" onClick={() => setScale(s => Math.min(2, s + 0.15))} title="Zoom in">
            <ZoomIn size={14} />
          </button>
          <div className="hm2-ctrl-sep" />
          <button className="hm2-ctrl-btn" onClick={() => setScale(s => Math.max(0.4, s - 0.15))} title="Zoom out">
            <ZoomOut size={14} />
          </button>
          <div className="hm2-ctrl-sep" />
          <button className="hm2-ctrl-btn" onClick={() => setScale(1)} title="Fit">
            <Maximize2 size={14} />
          </button>
          <div className="hm2-ctrl-sep" />
          <button className={`hm2-ctrl-btn ${locked ? 'hm2-ctrl-btn--active' : ''}`} onClick={() => setLocked(l => !l)} title="Lock">
            <Lock size={14} />
          </button>
        </div>

        {/* ── Minimap ── */}
        <div className="hm2-minimap">
          <svg viewBox="0 0 960 490" className="hm2-minimap-svg">
            <rect x={0} y={0} width={960} height={490} fill="#080101" rx="2" />
            {/* Mini lines */}
            {categories.map(cat => (
              <path key={cat.id} d={cubicPath(480, 94, cat.x, cat.y - 26)} fill="none" stroke={cat.color} strokeWidth="4" strokeOpacity="0.4" strokeDasharray="8 6" />
            ))}
            {categories.map(cat => cat.algos.map(a => (
              <path key={a.id} d={cubicPath(cat.x, cat.y + 26, a.x, a.y - 26)} fill="none" stroke={a.riskColor} strokeWidth="4" strokeOpacity="0.35" />
            )))}
            {/* Mini nodes */}
            <rect x={393} y={42} width={174} height={52} rx={4} fill="#1a0404" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            {categories.map(cat => (
              <rect key={cat.id} x={cat.x - 96} y={cat.y - 26} width={192} height={52} rx={4} fill="#0a0202" stroke={cat.color + '80'} strokeWidth="1.5" />
            ))}
            {categories.flatMap(cat => cat.algos.map(a => (
              <rect key={a.id} x={a.x - 50} y={a.y - 26} width={100} height={52} rx={3} fill="#060101" stroke={a.riskColor + '80'} strokeWidth="1.5" />
            )))}
          </svg>
          <div className="hm2-minimap-label font-mono">NAVIGATION</div>
        </div>
      </div>
    </div>
  );
}
