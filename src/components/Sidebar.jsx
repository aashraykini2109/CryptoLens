import { Lock, LayoutDashboard, Map, Bug, Bot, Plus } from 'lucide-react';
import './Sidebar.css';

const NAV = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'healthmap', label: 'Health Map', icon: Map },
  { id: 'findings',  label: 'Findings',   icon: Bug },
  { id: 'insights',  label: 'AI Insights',icon: Bot },
];

export default function Sidebar({ active, onNav, onNewScan }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Lock size={16} />
        </div>
        <span className="sidebar-logo-text">CryptoLens</span>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`nav-${id}`}
            className={`sidebar-nav-item ${active === id ? 'active' : ''}`}
            onClick={() => onNav(id)}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button id="sidebar-new-scan" className="btn-new-scan" onClick={onNewScan}>
          <Plus size={14} />
          New Scan
        </button>
      </div>
    </aside>
  );
}
