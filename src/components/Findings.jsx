import { useState } from 'react';
import { FileCode2, MapPin, Hash, ChevronRight, Search, SlidersHorizontal, Atom } from 'lucide-react';
import './Findings.css';

const SEV_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, SAFE: 4 };

export default function Findings({ findings, onSelectFinding }) {
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('ALL');
  const [sortBy, setSortBy]   = useState('severity');

  const filters = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  const displayed = findings
    .filter(f => {
      const matchesFilter = filter === 'ALL' || f.severity === filter;
      const matchesSearch = !search || 
        f.algorithm?.toLowerCase().includes(search.toLowerCase()) ||
        f.file?.toLowerCase().includes(search.toLowerCase()) ||
        f.context?.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'severity') return (SEV_ORDER[a.severity] ?? 99) - (SEV_ORDER[b.severity] ?? 99);
      if (sortBy === 'algo')     return (a.algorithm || '').localeCompare(b.algorithm || '');
      return 0;
    });

  return (
    <div className="findings-view">
      {/* Controls */}
      <div className="findings-controls glass">
        <div className="findings-search-wrap">
          <Search size={15} className="findings-search-icon" />
          <input
            id="findings-search"
            className="input findings-search"
            type="text"
            placeholder="Search algorithms, files, or contexts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="findings-filters">
          {filters.map(f => (
            <button
              key={f}
              id={`filter-${f.toLowerCase()}`}
              className={`filter-pill ${filter === f ? 'filter-pill--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="findings-sort">
          <SlidersHorizontal size={13} />
          <select
            id="findings-sort"
            className="sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="severity">Sort: Severity</option>
            <option value="algo">Sort: Algorithm</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="findings-count">
        <span className="font-mono" style={{ color: 'var(--accent-ember)' }}>{displayed.length}</span>
        <span style={{ color: 'var(--text-muted)' }}> finding{displayed.length !== 1 ? 's' : ''} {filter !== 'ALL' ? `· ${filter}` : ''}</span>
      </div>

      {/* Cards */}
      {displayed.length === 0 ? (
        <div className="findings-empty">
          <Search size={40} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
          <p>No findings match your filters.</p>
        </div>
      ) : (
        <div className="findings-list">
          {displayed.map((f, i) => (
            <FindingCard key={f.id ?? i} finding={f} onSelectFinding={onSelectFinding} />
          ))}
        </div>
      )}
    </div>
  );
}

function FindingCard({ finding, onSelectFinding }) {
  const { severity, algorithm, file, line, context, quantumVulnerable, description } = finding;

  const sevMap = {
    CRITICAL: 'badge-critical',
    HIGH: 'badge-high',
    MEDIUM: 'badge-medium',
    LOW: 'badge-low',
    SAFE: 'badge-safe',
  };

  return (
    <div className="finding-card card">
      <div className="finding-card-header">
        <div className="finding-left">
          <span className={`badge ${sevMap[severity] ?? 'badge-medium'}`}>{severity}</span>
          {quantumVulnerable && (
            <span className="badge" style={{ background: 'rgba(168,85,247,0.15)', color: '#C084FC', border: '1px solid rgba(168,85,247,0.3)', gap: 4 }}>
              <Atom size={10} /> Quantum
            </span>
          )}
          <h3 className="finding-algo font-mono">{algorithm}</h3>
        </div>
        <button
          id={`inspect-${algorithm?.replace(/\s+/g, '-').toLowerCase()}`}
          className="btn btn-ghost btn-sm inspect-btn"
          onClick={() => onSelectFinding(finding)}
        >
          Inspect &amp; Fix
          <ChevronRight size={14} />
        </button>
      </div>

      {description && <p className="finding-desc">{description}</p>}

      <div className="finding-meta">
        {file && (
          <span className="finding-meta-item font-mono">
            <FileCode2 size={12} />
            <span className="finding-file">{file}</span>
          </span>
        )}
        {line && (
          <span className="finding-meta-item font-mono">
            <MapPin size={12} />
            Line {line}
          </span>
        )}
        {context && (
          <span className="finding-meta-item font-mono">
            <Hash size={12} />
            <code className="finding-context-code">{context}</code>
          </span>
        )}
      </div>
    </div>
  );
}
