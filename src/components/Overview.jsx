import { useMemo } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, TrendingDown, Atom, KeyRound, Hash } from 'lucide-react';
import './Overview.css';

/* ── Security Score Dial ── */
function ScoreDial({ score }) {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const grade = score >= 80 ? { label: 'Quantum-Ready', color: '#F59E0B' }
    : score >= 60 ? { label: 'Acceptable', color: '#FF6B35' }
    : score >= 40 ? { label: 'High Risk', color: '#EF4444' }
    : { label: 'Critical Risk', color: '#DC2626' };

  return (
    <div className="score-dial-wrap">
      <div className="score-dial-label-top">Crypto-Hygiene Score</div>
      <div className="score-dial">
        <svg viewBox="0 0 180 180" className="score-svg">
          {/* Track */}
          <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,69,0,0.1)" strokeWidth="10" />
          {/* Progress */}
          <circle
            cx="90" cy="90" r={radius}
            fill="none"
            stroke={grade.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 90 90)"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 8px ${grade.color})` }}
          />
          {/* Center text */}
          <text x="90" y="85" textAnchor="middle" fill={grade.color} fontSize="34" fontWeight="800" fontFamily="Inter, sans-serif">{score}</text>
          <text x="90" y="108" textAnchor="middle" fill="#8B5B5B" fontSize="11" fontFamily="Inter, sans-serif">/ 100</text>
        </svg>
      </div>
      <div className="score-grade" style={{ color: grade.color }}>
        {grade.label}
      </div>
    </div>
  );
}

const METRIC_DEFS = [
  { key: 'total',    label: 'Total Primitives',      icon: Hash,         color: '#C4A0A0', desc: 'Cryptographic calls detected' },
  { key: 'deprecated', label: 'Deprecated Classical', icon: TrendingDown, color: '#FF6B35', desc: 'RSA-1024, MD5, SHA-1, 3DES…' },
  { key: 'quantum',  label: 'Quantum Vulnerable',    icon: Atom,         color: '#EF4444', desc: 'Vulnerable to Shor\'s algorithm' },
  { key: 'safe',     label: 'Post-Quantum Ready',    icon: CheckCircle2, color: '#4ADE80', desc: 'ML-KEM, ML-DSA, SLH-DSA' },
];

export default function Overview({ findings }) {
  const metrics = useMemo(() => {
    if (!findings || findings.length === 0) {
      return { total: 0, deprecated: 0, quantum: 0, safe: 0, score: 0 };
    }
    const total      = findings.length;
    const deprecated = findings.filter(f => ['CRITICAL','HIGH'].includes(f.severity)).length;
    const quantum    = findings.filter(f => f.quantumVulnerable).length;
    const safe       = findings.filter(f => f.severity === 'SAFE').length;
    const rawScore   = Math.max(0, 100 - (deprecated * 18) - (quantum * 12) - (findings.filter(f => f.severity === 'MEDIUM').length * 5));
    const score      = Math.min(100, Math.round(rawScore));
    return { total, deprecated, quantum, safe, score };
  }, [findings]);

  return (
    <div className="overview-view">
      {/* Top row: Dial + Risk cards */}
      <div className="overview-top">
        <div className="card overview-dial-card">
          <ScoreDial score={metrics.score} />
        </div>

        <div className="overview-metrics">
          {METRIC_DEFS.map(({ key, label, icon: Icon, color, desc }) => (
            <div key={key} className="card metric-card" style={{ '--metric-color': color }}>
              <div className="metric-card-header">
                <div className="metric-icon-wrap" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <span className="metric-value font-mono" style={{ color }}>{metrics[key]}</span>
              </div>
              <div className="metric-label">{label}</div>
              <div className="metric-desc">{desc}</div>
              <div className="metric-bar-wrap">
                <div
                  className="metric-bar"
                  style={{
                    width: metrics.total > 0 ? `${Math.round((metrics[key] / metrics.total) * 100)}%` : '0%',
                    background: `linear-gradient(90deg, ${color}60, ${color})`,
                    boxShadow: `0 0 8px ${color}60`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Severity breakdown */}
      <div className="card overview-breakdown">
        <h3 className="breakdown-title">
          <ShieldAlert size={16} style={{ color: 'var(--accent-ember)' }} />
          Severity Distribution
        </h3>
        <div className="breakdown-bars">
          {[
            { label: 'CRITICAL', cls: 'badge-critical', sev: 'CRITICAL', color: '#EF4444' },
            { label: 'HIGH',     cls: 'badge-high',     sev: 'HIGH',     color: '#FF6B35' },
            { label: 'MEDIUM',   cls: 'badge-medium',   sev: 'MEDIUM',   color: '#F59E0B' },
            { label: 'LOW',      cls: 'badge-low',      sev: 'LOW',      color: '#4ADE80' },
          ].map(({ label, cls, sev, color }) => {
            const count = findings.filter(f => f.severity === sev).length;
            const pct   = findings.length > 0 ? (count / findings.length) * 100 : 0;
            return (
              <div key={sev} className="breakdown-row">
                <span className={`badge ${cls} breakdown-badge`}>{label}</span>
                <div className="breakdown-bar-track">
                  <div
                    className="breakdown-bar-fill"
                    style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}60, ${color})`, boxShadow: `0 0 6px ${color}60` }}
                  />
                </div>
                <span className="breakdown-count font-mono">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status callout */}
      {metrics.quantum > 0 && (
        <div className="card overview-alert">
          <AlertTriangle size={18} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
          <div>
            <div className="overview-alert-title">Quantum Threat Detected</div>
            <div className="overview-alert-body">
              {metrics.quantum} algorithm{metrics.quantum > 1 ? 's are' : ' is'} vulnerable to Shor's algorithm on a cryptographically-relevant quantum computer (CRQC).
              Immediate migration to NIST FIPS 203/204/205 post-quantum algorithms is recommended.
            </div>
          </div>
        </div>
      )}
      {metrics.quantum === 0 && findings.length > 0 && (
        <div className="card overview-safe">
          <ShieldCheck size={18} style={{ color: '#4ADE80', flexShrink: 0 }} />
          <div>
            <div className="overview-alert-title" style={{ color: '#4ADE80' }}>No Quantum-Vulnerable Primitives Found</div>
            <div className="overview-alert-body">No asymmetric algorithms vulnerable to quantum attacks were detected. Review classical deprecations.</div>
          </div>
        </div>
      )}
    </div>
  );
}
