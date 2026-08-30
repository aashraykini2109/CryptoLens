import { useState, useRef, useEffect } from 'react';
import { Upload, Zap, Shield, ChevronRight, Terminal, GitBranch } from 'lucide-react';
import FluidCanvas from './FluidCanvas';
import './LandingPage.css';

const QUICK = [
  { id: 'rsa',  label: 'RSA-1024 Sample',    url: 'https://github.com/demo/legacy-rsa-app' },
  { id: 'sha1', label: 'SHA-1 Collision',     url: 'https://github.com/demo/sha1-vuln-service' },
  { id: 'md5',  label: 'MD5 Auth Library',    url: 'https://github.com/demo/md5-auth-lib' },
  { id: 'pqc',  label: 'PQC Migration Demo',  url: 'https://github.com/demo/pqc-migration' },
];

function useBlink(delay = 520) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setOn(v => !v), delay);
    return () => clearInterval(id);
  }, [delay]);
  return on;
}

export default function LandingPage({ onScanGithub, onScanZip }) {
  const [url,   setUrl]   = useState('');
  const [err,   setErr]   = useState('');
  const [drag,  setDrag]  = useState(false);
  const [focus, setFocus] = useState(false);
  const fileRef = useRef(null);
  const cursorOn = useBlink();

  const submit = (e) => {
    e?.preventDefault();
    if (!url.trim()) { setErr('no target specified — enter a GitHub URL'); return; }
    if (!url.startsWith('http')) { setErr('invalid protocol — must begin with https://'); return; }
    setErr('');
    onScanGithub(url.trim());
  };

  const drop = (e) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) onScanZip(f);
  };

  return (
    <div className="lp-root">
      <FluidCanvas />

      <div className="lp-overlay">
        {/* ── Hero ── */}
        <header className="lp-hero">
          <div className="lp-badge">
            <Zap size={10} />
            <span>NIST FIPS 203 / 204 / 205 · POST-QUANTUM READY</span>
          </div>

          <div className="lp-title-row">
            <div className="lp-shield">
              <Shield size={22} />
            </div>
            <h1 className="lp-title">
              <span className="lp-t-crypto">Crypto</span><span className="lp-t-lens">Lens</span>
            </h1>
          </div>

          <p className="lp-descriptor">
            Post-quantum cryptographic migration auditor — detects deprecated primitives,
            evaluates Shor vulnerability, and generates NIST-compliant migration paths.
          </p>
        </header>

        {/* ── Panel ── */}
        <div className="lp-panel">
          {/* Decorative corner ticks */}
          <div className="lp-tick lp-tick--tl" />
          <div className="lp-tick lp-tick--tr" />
          <div className="lp-tick lp-tick--bl" />
          <div className="lp-tick lp-tick--br" />

          {/* ── GitHub CLI scanner ── */}
          <section className="lp-section">
            <div className="lp-section-label">
              <Terminal size={10} />
              <span>GITHUB REPOSITORY SCANNER</span>
              <div className="lp-section-label-line" />
            </div>

            <form onSubmit={submit} className="lp-cli-form">
              {/* Terminal window */}
              <div className={`lp-cli-window ${focus ? 'lp-cli-window--focused' : ''}`}>
                <div className="lp-cli-titlebar">
                  <span className="lp-cli-dot lp-cli-dot--red" />
                  <span className="lp-cli-dot lp-cli-dot--amber" />
                  <span className="lp-cli-dot lp-cli-dot--green" />
                  <span className="lp-cli-titlebar-label">cryptolens-scanner</span>
                </div>
                <div className="lp-cli-body">
                  <span className="lp-cli-prompt">
                    <span className="lp-cli-user">scan</span>
                    <span className="lp-cli-at">@</span>
                    <span className="lp-cli-host">cryptolens</span>
                    <span className="lp-cli-sep">:~$</span>
                  </span>
                  <div className="lp-cli-input-row">
                    <input
                      id="github-url-input"
                      className="lp-cli-input"
                      type="text"
                      placeholder="https://github.com/org/repository"
                      value={url}
                      onChange={e => { setUrl(e.target.value); setErr(''); }}
                      onFocus={() => setFocus(true)}
                      onBlur={() => setFocus(false)}
                      spellCheck={false}
                      autoComplete="off"
                    />
                    {focus && <span className={`lp-cli-cursor ${cursorOn ? '' : 'lp-cli-cursor--off'}`}>▊</span>}
                  </div>
                </div>
              </div>
              {err && <div className="lp-err"><span className="lp-err-arrow">✕</span>{err}</div>}

              {/* Mechanical action button */}
              <button id="analyze-repo-btn" type="submit" className="lp-mech-btn">
                <div className="lp-mech-btn-glow" />
                <span className="lp-mech-btn-inner">
                  <Shield size={13} />
                  <span>INITIATE SCAN</span>
                  <ChevronRight size={13} className="lp-mech-chevron" />
                </span>
              </button>
            </form>
          </section>

          <div className="lp-divider">
            <div className="lp-div-line" />
            <span className="lp-div-or">OR</span>
            <div className="lp-div-line" />
          </div>

          {/* ── Scanning Bay / Drop Zone ── */}
          <section className="lp-section">
            <div className="lp-section-label">
              <Upload size={10} />
              <span>UPLOAD ARCHIVE / SCANNING BAY</span>
              <div className="lp-section-label-line" />
            </div>

            <div
              id="zip-dropzone"
              className={`lp-bay ${drag ? 'lp-bay--active' : ''}`}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={drop}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".zip" style={{display:'none'}} onChange={e => e.target.files[0] && onScanZip(e.target.files[0])} />

              {/* Corner reticles */}
              <span className="lp-bay-corner lp-bay-corner--tl" />
              <span className="lp-bay-corner lp-bay-corner--tr" />
              <span className="lp-bay-corner lp-bay-corner--bl" />
              <span className="lp-bay-corner lp-bay-corner--br" />

              {/* Scan line */}
              <span className={`lp-bay-scanline ${drag ? 'lp-bay-scanline--active' : ''}`} />

              {/* Grid overlay */}
              <div className="lp-bay-grid" />

              <div className="lp-bay-content">
                <div className="lp-bay-icon-ring">
                  <Upload size={18} />
                </div>
                <div className="lp-bay-text-main">
                  {drag ? 'RELEASE TO INITIALIZE SCAN' : 'DROP .ZIP ARCHIVE HERE'}
                </div>
                <div className="lp-bay-text-sub font-mono">
                  or click to select file · ACCEPTS: .zip · MAX SIZE: 50 MB
                </div>
                <div className="lp-bay-spec font-mono">
                  [ SRC-SCAN-v2.4.1 ] · AES-256-GCM encrypted transit
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ── Quick tests ── */}
        <nav className="lp-quick" aria-label="Quick test samples">
          <span className="lp-quick-label font-mono">// QUICK TEST VECTORS →</span>
          <div className="lp-quick-pills">
            {QUICK.map(q => (
              <button
                key={q.id}
                id={`quick-${q.id}`}
                className="lp-qpill"
                onClick={() => { setUrl(q.url); onScanGithub(q.url); }}
              >
                <GitBranch size={10} />
                {q.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
