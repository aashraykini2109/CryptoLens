import { useState, useRef } from 'react';
import { GitBranch, Upload, Zap, Shield, Lock } from 'lucide-react';
import './IdleView.css';

const QUICK_TESTS = [
  { id: 'rsa', label: 'Test RSA-1024 Sample', icon: '🔑', algo: 'RSA-1024' },
  { id: 'sha1', label: 'Test SHA-1 Collision', icon: '💥', algo: 'SHA-1' },
  { id: 'md5', label: 'Test MD5 Hash', icon: '⚠️', algo: 'MD5' },
  { id: 'ec', label: 'Test ECDH P-256', icon: '📡', algo: 'ECDH-P256' },
];

const MOCK_URLS = {
  rsa: 'https://github.com/demo/legacy-rsa-app',
  sha1: 'https://github.com/demo/sha1-vuln-service',
  md5: 'https://github.com/demo/md5-auth-lib',
  ec: 'https://github.com/demo/ec-key-exchange',
};

export default function IdleView({ onScanGithub, onScanZip, isLoading }) {
  const [url, setUrl] = useState('');
  const [dragging, setDragging] = useState(false);
  const [urlError, setUrlError] = useState('');
  const fileInputRef = useRef(null);

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) { setUrlError('Please enter a GitHub repository URL'); return; }
    if (!url.startsWith('http')) { setUrlError('URL must start with https://'); return; }
    setUrlError('');
    onScanGithub(url.trim());
  };

  const handleQuickTest = (testId) => {
    const testUrl = MOCK_URLS[testId];
    setUrl(testUrl);
    onScanGithub(testUrl);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.zip') || file.type === 'application/zip')) {
      onScanZip(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onScanZip(file);
  };

  return (
    <div className="idle-view">
      {/* Hero Banner */}
      <div className="hero animate-fade-in-up">
        <div className="hero-icon-ring">
          <Shield size={32} className="hero-shield-icon" />
        </div>
        <div className="hero-badge badge badge-amber">
          <Zap size={11} />
          NIST FIPS 203/204/205 Compliant
        </div>
        <h1 className="hero-title">
          <span className="hero-title-crypto">Crypto</span>
          <span className="hero-title-lens">Lens</span>
        </h1>
        <p className="hero-sub">Post-Quantum Cryptographic Migration Auditor</p>
        <p className="hero-desc">
          Detect deprecated classical primitives. Evaluate quantum vulnerability. Get AI-powered
          migration paths to NIST-approved post-quantum algorithms.
        </p>
      </div>

      {/* Dual Input Container */}
      <div className="input-container glass animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {/* GitHub Scanner */}
        <div className="input-section">
          <div className="input-section-label">
            <GitBranch size={15} />
            <span>GitHub Repository Scanner</span>
          </div>
          <form onSubmit={handleUrlSubmit} className="url-form">
            <div className="url-input-wrap">
              <GitBranch size={16} className="url-icon" />
              <input
                id="github-url-input"
                className="input url-input"
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setUrlError(''); }}
                placeholder="https://github.com/org/repo"
                disabled={isLoading}
              />
            </div>
            {urlError && <p className="url-error">{urlError}</p>}
            <button
              id="analyze-repo-btn"
              type="submit"
              className="btn btn-primary btn-lg url-submit-btn"
              disabled={isLoading}
            >
              <Lock size={16} />
              Analyze Repository
            </button>
          </form>
        </div>

        <div className="input-divider">
          <div className="input-divider-line" />
          <span className="input-divider-text">or</span>
          <div className="input-divider-line" />
        </div>

        {/* Dropzone */}
        <div className="input-section">
          <div className="input-section-label">
            <Upload size={15} />
            <span>Upload ZIP Archive</span>
          </div>
          <div
            id="zip-dropzone"
            className={`dropzone ${dragging ? 'dropzone--dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <div className="dropzone-icon-wrap">
              <Upload size={28} className="dropzone-icon" />
            </div>
            <p className="dropzone-primary">
              {dragging ? 'Release to scan archive' : 'Drop your ZIP archive here'}
            </p>
            <p className="dropzone-secondary">or click to browse &middot; .zip files only</p>
            <p className="dropzone-hint font-mono">.zip cryptographic archives supported</p>
          </div>
        </div>
      </div>

      {/* Quick Test Pills */}
      <div className="quick-tests animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <span className="quick-tests-label">Quick Test Samples:</span>
        <div className="quick-tests-pills">
          {QUICK_TESTS.map((t) => (
            <button
              key={t.id}
              id={`quick-test-${t.id}`}
              className="btn btn-ghost btn-sm quick-pill"
              onClick={() => handleQuickTest(t.id)}
              disabled={isLoading}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
