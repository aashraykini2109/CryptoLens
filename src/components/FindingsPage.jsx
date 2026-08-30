import { useState } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, CircleDot, Search, Filter, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import './FindingsPage.css';

const SEV_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2, SAFE: 3 };

const SEV_STYLE = {
  HIGH:   { cls: 'sev-high',   label: 'HIGH' },
  MEDIUM: { cls: 'sev-medium', label: 'MEDIUM' },
  LOW:    { cls: 'sev-low',    label: 'LOW' },
  SAFE:   { cls: 'sev-safe',   label: 'SAFE' },
  CRITICAL: { cls: 'sev-high', label: 'HIGH' },
};

const FINDING_ICON = {
  HIGH:     <div className="fi-icon fi-icon--high"><ShieldAlert size={14} /></div>,
  CRITICAL: <div className="fi-icon fi-icon--high"><ShieldAlert size={14} /></div>,
  MEDIUM:   <div className="fi-icon fi-icon--medium"><AlertTriangle size={14} /></div>,
  LOW:      <div className="fi-icon fi-icon--low"><CircleDot size={14} /></div>,
  SAFE:     <div className="fi-icon fi-icon--safe"><ShieldCheck size={14} /></div>,
};

const PAGE_SIZE = 6;

export default function FindingsPage({ findings, onSelectFinding, onNewScan }) {
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('ALL');
  const [page,    setPage]    = useState(1);

  const high   = findings.filter(f => ['HIGH','CRITICAL'].includes(f.severity));
  const medium = findings.filter(f => f.severity === 'MEDIUM');
  const low    = findings.filter(f => ['LOW','SAFE'].includes(f.severity));

  const filtered = findings
    .filter(f => {
      if (filter === 'HIGH')   return ['HIGH','CRITICAL'].includes(f.severity);
      if (filter === 'MEDIUM') return f.severity === 'MEDIUM';
      if (filter === 'LOW')    return ['LOW','SAFE'].includes(f.severity);
      return true;
    })
    .filter(f =>
      !search ||
      f.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.algorithm?.toLowerCase().includes(search.toLowerCase()) ||
      f.file?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (SEV_ORDER[a.severity] ?? 99) - (SEV_ORDER[b.severity] ?? 99));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const displayed  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goPage = (p) => setPage(Math.max(1, Math.min(totalPages, p)));

  return (
    <div className="fp-root">
      {/* Page header */}
      <div className="fp-header">
        <div>
          <h1 className="fp-title">Vulnerability Findings</h1>
          <p className="fp-subtitle">Detailed breakdown of all detected algorithms and flaws.</p>
        </div>
        <button id="fp-new-scan" className="fp-new-btn" onClick={onNewScan}>
          + Scan New Repository
        </button>
      </div>

      {/* Stat cards */}
      <div className="fp-stats">
        <StatCard label="Total Findings" value={findings.length} icon={<AlertCircle size={18} />} color="neutral" desc="Across your codebase" />
        <StatCard label="High Risk"      value={high.length}     icon={<ShieldAlert size={18} />} color="high"    desc="Requires immediate attention" />
        <StatCard label="Medium Risk"    value={medium.length}   icon={<AlertTriangle size={18} />} color="medium" desc="Should be reviewed" />
        <StatCard label="Resolved"       value={low.length}      icon={<ShieldCheck size={18} />} color="safe"   desc="No action required" />
      </div>

      {/* Table section */}
      <div className="fp-table-section">
        <div className="fp-table-header">
          <div>
            <h2 className="fp-table-title">Cryptographic Findings</h2>
            <p className="fp-table-sub">Detailed security issues detected across your project</p>
          </div>
          <div className="fp-controls">
            <div className="fp-search-wrap">
              <Search size={14} className="fp-search-icon" />
              <input
                id="findings-search"
                className="fp-search"
                type="text"
                placeholder="Search findings..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <button className="fp-filter-btn">
              <Filter size={14} /> Filter <ChevronRight size={12} style={{ transform:'rotate(90deg)' }} />
            </button>
          </div>
        </div>

        {/* Filter pills */}
        <div className="fp-pills">
          {[
            { id: 'ALL',    label: `All (${findings.length})` },
            { id: 'HIGH',   label: `High (${high.length})`,   cls: 'pill-high' },
            { id: 'MEDIUM', label: `Medium (${medium.length})`, cls: 'pill-medium' },
            { id: 'LOW',    label: `Low (${low.length})`,     cls: 'pill-low' },
          ].map(({ id, label, cls }) => (
            <button
              key={id}
              id={`pill-${id.toLowerCase()}`}
              className={`fp-pill ${cls || ''} ${filter === id ? 'active' : ''}`}
              onClick={() => { setFilter(id); setPage(1); }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="fp-table-wrap">
          <table className="fp-table">
            <thead>
              <tr>
                <th>FINDING</th>
                <th>SEVERITY</th>
                <th>FILE</th>
                <th>ALGORITHM</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr><td colSpan={6} className="fp-empty">No findings match your filters.</td></tr>
              ) : displayed.map((f, i) => (
                <FindingRow key={f.id ?? i} finding={f} onSelect={() => onSelectFinding(f)} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="fp-pagination">
          <span className="fp-pg-info">Showing {Math.min(displayed.length, PAGE_SIZE)} of {filtered.length} findings</span>
          <div className="fp-pg-controls">
            <button className="fp-pg-btn" onClick={() => goPage(page - 1)} disabled={page === 1}>Previous</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i+1}
                className={`fp-pg-btn fp-pg-num ${page === i+1 ? 'active' : ''}`}
                onClick={() => goPage(i+1)}
              >{i+1}</button>
            ))}
            <button className="fp-pg-btn" onClick={() => goPage(page + 1)} disabled={page === totalPages}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, desc }) {
  return (
    <div className={`fp-stat-card stat-${color}`}>
      <div className="fp-stat-top">
        <span className="fp-stat-label">{label}</span>
        <span className={`fp-stat-icon icon-${color}`}>{icon}</span>
      </div>
      <div className={`fp-stat-value val-${color}`}>{value}</div>
      <div className="fp-stat-desc">{desc}</div>
    </div>
  );
}

function FindingRow({ finding, onSelect }) {
  const { severity, name, description, file, algorithm, status } = finding;
  const sev = SEV_STYLE[severity] || SEV_STYLE.MEDIUM;
  const isOpen = status === 'Open' || !status;

  return (
    <tr className="fp-row" onClick={onSelect}>
      <td className="fp-cell-finding">
        {FINDING_ICON[severity] || FINDING_ICON.MEDIUM}
        <div>
          <div className="fp-finding-name">{name || algorithm}</div>
          <div className="fp-finding-desc">{description || `${algorithm} cryptographic issue detected`}</div>
        </div>
      </td>
      <td><span className={`fp-sev ${sev.cls}`}>{sev.label}</span></td>
      <td className="fp-cell-file font-mono">{file}</td>
      <td className="fp-cell-algo font-mono">{algorithm}</td>
      <td>
        <span className={`fp-status ${isOpen ? 'status-open' : 'status-review'}`}>
          <Clock size={12} />
          {status || 'Open'}
        </span>
      </td>
      <td>
        <button className="fp-row-arrow" onClick={onSelect}><ChevronRight size={16} /></button>
      </td>
    </tr>
  );
}
