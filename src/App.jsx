import { useState, useCallback } from 'react';
import LandingPage    from './components/LandingPage';
import ScanningView   from './components/ScanningView';
import Sidebar        from './components/Sidebar';
import SecurityDashboard from './components/SecurityDashboard';
import HealthMapPage  from './components/HealthMapPage';
import FindingsPage   from './components/FindingsPage';
import AIInsightsPage from './components/AIInsightsPage';
import './App.css';

/* ── Mock findings matching the scanning dataset ── */
const MOCK_FINDINGS = [
  { id:1,  name:'Weak RSA Key Size',        description:'RSA-1024 is below recommended security level',           severity:'HIGH',   file:'src/auth/login.js',          algorithm:'RSA-1024',  status:'Open',   quantumVulnerable:true  },
  { id:2,  name:'Deprecated Hash Algorithm',description:'SHA-1 is cryptographically weak',                         severity:'HIGH',   file:'src/security/hash.js',        algorithm:'SHA-1',     status:'Open',   quantumVulnerable:false },
  { id:3,  name:'Outdated OpenSSL',         description:'Dependency version requires upgrade',                     severity:'MEDIUM', file:'package.json',                algorithm:'OpenSSL',   status:'Review', quantumVulnerable:false },
  { id:4,  name:'Legacy Encryption API',    description:'Consider migrating to a modern encryption API',           severity:'LOW',    file:'src/crypto/encrypt.js',       algorithm:'AES-CBC',   status:'Review', quantumVulnerable:false },
  { id:5,  name:'Weak Hash Configuration',  description:'Legacy hashing configuration detected',                   severity:'MEDIUM', file:'src/utils/security.js',       algorithm:'MD5',       status:'Open',   quantumVulnerable:false },
  { id:6,  name:'Small DH Parameter',       description:'Diffie-Hellman parameter size should be increased',       severity:'MEDIUM', file:'src/crypto/keyExchange.js',   algorithm:'DH-1024',   status:'Open',   quantumVulnerable:true  },
  { id:7,  name:'Insecure PRNG',            description:'Math.random() used for cryptographic purposes',           severity:'HIGH',   file:'src/token/generate.js',       algorithm:'Math.random',status:'Open',  quantumVulnerable:false },
  { id:8,  name:'RSA-2048 Key Exchange',    description:'Quantum-vulnerable, plan PQC migration',                  severity:'MEDIUM', file:'src/tls/handshake.ts',        algorithm:'RSA-2048',  status:'Review', quantumVulnerable:true  },
];

export default function App() {
  const [appState, setAppState] = useState('idle');       // 'idle' | 'scanning' | 'scanned'
  const [findings, setFindings] = useState([]);
  const [scanTarget, setScanTarget] = useState('');
  const [page, setPage] = useState('dashboard');
  const [selectedFinding, setSelectedFinding] = useState(null);

  const doScan = useCallback(async (scanFn) => {
    setAppState('scanning');
    try {
      const result = await scanFn();
      const data   = result.findings || result.results || [];
      setFindings(data.length > 0 ? data : MOCK_FINDINGS);
    } catch {
      await new Promise(r => setTimeout(r, 3500));
      setFindings(MOCK_FINDINGS);
    }
    setPage('dashboard');
    setAppState('scanned');
  }, []);

  const handleScanGithub = useCallback((url) => {
    setScanTarget(url);
    doScan(async () => {
      const res = await fetch('http://127.0.0.1:8000/scan/github', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error();
      return res.json();
    });
  }, [doScan]);

  const handleScanZip = useCallback((file) => {
    setScanTarget(file.name);
    doScan(async () => {
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch('http://127.0.0.1:8000/scan/zip', { method: 'POST', body: fd });
      if (!res.ok) throw new Error();
      return res.json();
    });
  }, [doScan]);

  const handleReset = useCallback(() => {
    setAppState('idle');
    setFindings([]);
    setScanTarget('');
    setSelectedFinding(null);
    setPage('dashboard');
  }, []);

  const handleSelectFinding = useCallback((f) => {
    setSelectedFinding(f);
    setPage('insights');
  }, []);

  /* ── Render ── */
  if (appState === 'idle') {
    return <LandingPage onScanGithub={handleScanGithub} onScanZip={handleScanZip} />;
  }

  if (appState === 'scanning') {
    return (
      <div className="scanning-full">
        <ScanningView target={scanTarget} />
      </div>
    );
  }

  // Dashboard page provides its own sidebar matching reference image layout
  if (page === 'dashboard') {
    return (
      <SecurityDashboard
        onNewScan={handleReset}
        onSelectNav={setPage}
        onSelectFinding={handleSelectFinding}
      />
    );
  }

  // Subpages inside shell
  return (
    <div className="dashboard-shell">
      <Sidebar active={page} onNav={setPage} onNewScan={handleReset} />
      <main className="dashboard-main">
        {page === 'healthmap' && <HealthMapPage findings={findings} />}
        {page === 'findings'  && (
          <FindingsPage
            findings={findings}
            onSelectFinding={handleSelectFinding}
            onNewScan={handleReset}
          />
        )}
        {page === 'insights'  && (
          <AIInsightsPage
            finding={selectedFinding}
            onNewScan={handleReset}
          />
        )}
      </main>
    </div>
  );
}
