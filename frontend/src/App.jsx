import React, { useState, useEffect } from 'react';

import {
  Lock,
  AlertCircle,
  CloudUpload,
  FileCode2,
  Cpu,
  Link
} from 'lucide-react';

import CryptoHealthMap from './CryptoHealthMap';
import Findings from './Findings';

export default function App() {
  const [appState, setAppState] = useState('idle');
  const [activeTab, setActiveTab] = useState('dashboard');

  const [repoUrl, setRepoUrl] = useState('');
  const [scrambleText, setScrambleText] = useState('INITIALIZING SCAN...');
  const [scanProgress, setScanProgress] = useState(0);

  // =====================================================
  // HACKER TEXT EFFECT
  // =====================================================

  useEffect(() => {
    if (appState !== 'scanning') return;

    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>{}';

    const messages = [
      'ANALYZING ENCRYPTION...',
      'MAPPING NODE GRAPH...',
      'DECRYPTING DEPENDENCIES...',
      'ISOLATING VULNERABILITIES...'
    ];

    let tick = 0;

    const textInterval = setInterval(() => {
      const randomStr = Array.from(
        { length: 25 },
        () => chars[Math.floor(Math.random() * chars.length)]
      ).join('');

      setScrambleText(
        Math.random() > 0.4
          ? messages[Math.floor(tick / 5) % messages.length]
          : randomStr
      );

      tick++;
    }, 100);

    return () => clearInterval(textInterval);
  }, [appState]);

  // =====================================================
  // SCAN
  // =====================================================

  const startEngineScan = () => {
    setAppState('scanning');
    setScanProgress(0);

    const mockProgress = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 95) return 95;

        const jump =
          prev < 60
            ? Math.random() * 15 + 5
            : Math.random() * 3 + 1;

        return Math.min(Math.floor(prev + jump), 95);
      });
    }, 400);

    setTimeout(() => {
      clearInterval(mockProgress);

      setScanProgress(100);

      setTimeout(() => {
        setAppState('complete');
        setActiveTab('dashboard');
      }, 500);
    }, 6000);
  };

  // =====================================================
  // FILE UPLOAD
  // =====================================================

  const handleFileUpload = (e) => {
    if (!e.target.files || !e.target.files[0]) return;

    startEngineScan();
  };

  // =====================================================
  // URL SCAN
  // =====================================================

  const handleUrlScan = () => {
    if (!repoUrl.trim()) return;

    startEngineScan();
  };

  // =====================================================
  // NAVIGATION STYLE
  // =====================================================

  const getNavStyle = (tabName) => {
    return activeTab === tabName
      ? 'text-left px-4 py-2.5 bg-[#111827] text-white rounded-lg font-medium border border-slate-800 transition'
      : 'text-left px-4 py-2.5 text-slate-400 hover:bg-[#111827] hover:text-slate-200 rounded-lg transition';
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="flex h-screen bg-[#0a0f16] text-slate-300 font-sans overflow-hidden">

      {/* =================================================
          SIDEBAR
      ================================================= */}
      {appState === 'complete' && (

      <div className="w-64 border-r border-slate-800/60 p-4 flex flex-col gap-6 bg-[#0a0f16] z-10 relative">

        <div className="flex items-center gap-3 px-2 mt-2 mb-4">
          <Lock className="w-6 h-6 text-orange-400" />

          <span className="text-xl font-bold text-white tracking-wide">
            CryptoLens
          </span>
        </div>

        <nav className="flex flex-col gap-1">

          <button
            onClick={() => setActiveTab('dashboard')}
            className={getNavStyle('dashboard')}
          >
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('health_map')}
            className={getNavStyle('health_map')}
          >
            Health Map
          </button>

          <button
            onClick={() => setActiveTab('findings')}
            className={getNavStyle('findings')}
          >
            Findings
          </button>

          <button
            onClick={() => setActiveTab('ai_insights')}
            className={getNavStyle('ai_insights')}
          >
            AI Insights
          </button>

        </nav>
      </div>
      )}

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="flex-1 overflow-y-auto p-10 relative">

        {/* =================================================
            IDLE / UPLOAD SCREEN
        ================================================= */}

        {appState === 'idle' && (
          <div className="h-full flex flex-col items-center justify-center animate-[fadeIn_0.3s_ease-out]">

            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-10 text-center max-w-xl w-full shadow-xl">

              <h2 className="text-2xl font-bold text-white mb-2">
                Scan Repository
              </h2>

              <p className="text-slate-400 mb-8">
                Enter a repository URL or upload a .zip file.
              </p>

              {/* URL */}

              <div className="flex gap-3 mb-8">

                <div className="relative flex-1">

                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

                  <input
                    type="text"
                    placeholder="https://github.com/username/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="w-full bg-[#0a0f16] border border-slate-700 rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:border-orange-500 transition"
                  />

                </div>

                <button
                  onClick={handleUrlScan}
                  disabled={!repoUrl.trim()}
                  className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Scan URL
                </button>

              </div>

              {/* OR */}

              <div className="flex items-center gap-4 mb-8">

                <div className="flex-1 h-px bg-slate-800"></div>

                <span className="text-slate-500 text-sm font-medium">
                  OR
                </span>

                <div className="flex-1 h-px bg-slate-800"></div>

              </div>

              {/* FILE UPLOAD */}

              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 bg-[#0a0f16] rounded-xl p-10 hover:border-slate-500 transition cursor-pointer group">

                <input
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                <CloudUpload className="w-12 h-12 text-slate-600 mb-4 group-hover:text-white transition" />

                <span className="text-white font-semibold text-lg mb-1">
                  Click to upload .zip file
                </span>

                <span className="text-slate-500 text-sm">
                  Max file size: 50MB
                </span>

              </label>

            </div>

          </div>
        )}

        {/* =================================================
            SCANNING SCREEN
        ================================================= */}

        {appState === 'scanning' && (
          <div className="h-full flex flex-col items-center justify-center animate-[fadeIn_0.3s_ease-out]">

            <div className="relative flex items-center justify-center w-32 h-32 mb-8">

              <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 animate-pulse rounded-full"></div>

              <div
                className="absolute inset-0 border-t-2 border-r-2 border-orange-500/80 rounded-full animate-spin"
                style={{ animationDuration: '3s' }}
              ></div>

              <div
                className="absolute inset-3 border-b-2 border-l-2 border-emerald-400/80 rounded-full animate-spin"
                style={{
                  animationDuration: '2s',
                  animationDirection: 'reverse'
                }}
              ></div>

              <Cpu className="w-10 h-10 text-orange-400 animate-pulse relative z-10" />

            </div>

            <div className="bg-[#111827] border border-slate-800 p-6 rounded-lg w-full max-w-[500px] shadow-2xl relative overflow-hidden">

              <div className="absolute top-0 left-0 w-full h-0.5 bg-orange-500 shadow-[0_0_10px_#f97316] animate-[scan_2s_ease-in-out_infinite]"></div>

              <div className="flex justify-between items-end mb-3">

                <div className="flex items-center gap-3 text-orange-400 font-mono font-bold text-sm sm:text-base">

                  <FileCode2 className="w-5 h-5 animate-spin-slow shrink-0" />

                  <span className="tracking-widest">
                    {scrambleText}
                  </span>

                </div>

                <span className="text-white font-bold font-mono text-xl">
                  {scanProgress}%
                </span>

              </div>

              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">

                <div
                  className="bg-orange-500 h-full transition-all duration-75 ease-linear"
                  style={{ width: `${scanProgress}%` }}
                ></div>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            COMPLETE DASHBOARD
        ================================================= */}

        {appState === 'complete' && (
          <div className="animate-[fadeIn_0.5s_ease-out] flex flex-col h-full">

            {/* HEADER */}

            <div className="flex justify-between items-start mb-8">

              <div>

                <h1 className="text-3xl font-bold text-white mb-1">

                  {activeTab === 'dashboard' && 'Security Dashboard'}

                  {activeTab === 'health_map' && 'Crypto Health Map'}

                  {activeTab === 'findings' && 'Vulnerability Findings'}

                  {activeTab === 'ai_insights' && 'AI Remediation Insights'}

                </h1>

                <p className="text-slate-400">

                  {activeTab === 'dashboard' &&
                    "Understand your project's cryptographic health."}

                  {activeTab === 'health_map' &&
                    'Visual dependency graph of cryptography in your codebase.'}

                  {activeTab === 'findings' &&
                    'Detailed breakdown of all detected algorithms and flaws.'}

                  {activeTab === 'ai_insights' &&
                    'Automated suggestions for NIST-compliant migrations.'}

                </p>

              </div>

              <button
                onClick={() => {
                  setAppState('idle');
                  setRepoUrl('');
                  setScanProgress(0);
                }}
                className="bg-white text-black px-4 py-2 rounded-md font-semibold text-sm hover:bg-slate-200 transition"
              >
                + Scan New Repository
              </button>

            </div>

            {/* =================================================
                DASHBOARD TAB
            ================================================= */}

            {activeTab === 'dashboard' && (
              <>

                {/* OVERVIEW CARDS */}

                <div className="grid grid-cols-4 gap-4 mb-6">

                  <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl text-center flex flex-col justify-center">

                    <h3 className="text-slate-400 text-sm font-medium mb-3">
                      Crypto Health Score
                    </h3>

                    <div className="text-4xl font-bold text-white mb-3">
                      78
                      <span className="text-xl text-slate-500 font-normal">
                        /100
                      </span>
                    </div>

                    <span className="text-emerald-400 text-sm">
                      Good security posture
                    </span>

                  </div>

                  <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl text-center flex flex-col justify-center">

                    <h3 className="text-slate-400 text-sm font-medium mb-3">
                      Total Findings
                    </h3>

                    <div className="text-4xl font-bold text-white mb-3">
                      20
                    </div>

                    <span className="text-slate-500 text-sm">
                      Across your codebase
                    </span>

                  </div>

                  <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl text-center flex flex-col justify-center">

                    <h3 className="text-slate-400 text-sm font-medium mb-3">
                      Critical Risks
                    </h3>

                    <div className="text-4xl font-bold text-red-500 mb-3">
                      2
                    </div>

                    <span className="text-slate-500 text-sm">
                      Require immediate attention
                    </span>

                  </div>

                  <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl text-center flex flex-col justify-center">

                    <h3 className="text-slate-400 text-sm font-medium mb-3">
                      Quantum Risks
                    </h3>

                    <div className="text-4xl font-bold text-amber-500 mb-3">
                      5
                    </div>

                    <span className="text-slate-500 text-sm">
                      Future migration required
                    </span>

                  </div>

                </div>

                {/* DASHBOARD GRID */}

                <div className="grid grid-cols-3 gap-6">

                  {/* =================================================
                      MAP CARD
                  ================================================= */}

                  <div className="col-span-2 bg-[#111827] border border-slate-800 rounded-xl p-6 min-h-[400px] flex flex-col">

                    <div className="flex justify-between items-center mb-6">

                      <div>

                        <h2 className="text-xl font-bold text-white">
                          Crypto Health Map
                        </h2>

                        <p className="text-sm text-slate-400">
                          Cryptographic usage across your project
                        </p>

                      </div>

                      <button
                        onClick={() => setActiveTab('health_map')}
                        className="border border-slate-600 text-slate-300 px-4 py-1.5 rounded text-sm hover:bg-slate-800 transition"
                      >
                        View Full Map &rarr;
                      </button>

                    </div>

                    {/* ACTUAL REACT FLOW MAP */}

                    <div className="flex-1 border border-slate-800/50 rounded overflow-hidden bg-[#0a0f16] min-h-[500px]">

                      <CryptoHealthMap />

                    </div>

                  </div>

                  {/* =================================================
                      TOP FINDINGS
                  ================================================= */}

                  <div className="col-span-1 bg-[#111827] border border-slate-800 rounded-xl p-6 flex flex-col">

                    <div className="flex justify-between items-center mb-6">

                      <div>

                        <h2 className="text-xl font-bold text-white">
                          Top Findings
                        </h2>

                        <p className="text-sm text-slate-400">
                          Issues requiring attention
                        </p>

                      </div>

                      <button
                        onClick={() => setActiveTab('findings')}
                        className="text-orange-400 text-sm hover:underline"
                      >
                        See All
                      </button>

                    </div>

                    <div className="space-y-6">

                      {/* RSA */}

                      <div className="flex items-start justify-between border-b border-slate-800 pb-4">

                        <div className="flex items-start gap-4">

                          <div className="mt-1 bg-red-500/10 p-1.5 rounded-full border border-red-500/20">

                            <AlertCircle className="w-5 h-5 text-red-500" />

                          </div>

                          <div>

                            <h4 className="font-bold text-white">
                              RSA-1024
                            </h4>

                            <p className="text-sm text-slate-500 font-mono mt-1">
                              src/auth/login.js
                            </p>

                          </div>

                        </div>

                        <span className="text-xs font-bold text-red-500 mt-1 tracking-wider">
                          HIGH
                        </span>

                      </div>

                      {/* SHA */}

                      <div className="flex items-start justify-between border-b border-slate-800 pb-4">

                        <div className="flex items-start gap-4">

                          <div className="mt-1 bg-red-500/10 p-1.5 rounded-full border border-red-500/20">

                            <AlertCircle className="w-5 h-5 text-red-500" />

                          </div>

                          <div>

                            <h4 className="font-bold text-white">
                              SHA-1
                            </h4>

                            <p className="text-sm text-slate-500 font-mono mt-1">
                              src/security/hash.js
                            </p>

                          </div>

                        </div>

                        <span className="text-xs font-bold text-red-500 mt-1 tracking-wider">
                          HIGH
                        </span>

                      </div>

                      {/* OPENSSL */}

                      <div className="flex items-start justify-between">

                        <div className="flex items-start gap-4">

                          <div className="mt-1 bg-amber-500/10 p-1.5 rounded-full border border-amber-500/20">

                            <AlertCircle className="w-5 h-5 text-amber-500" />

                          </div>

                          <div>

                            <h4 className="font-bold text-white">
                              Old OpenSSL
                            </h4>

                            <p className="text-sm text-slate-500 font-mono mt-1">
                              package.json
                            </p>

                          </div>

                        </div>

                        <span className="text-xs font-bold text-amber-500 mt-1 tracking-wider">
                          MEDIUM
                        </span>

                      </div>

                    </div>

                  </div>

                </div>

              </>
            )}

            {/* =================================================
                FULL HEALTH MAP TAB
            ================================================= */}

            {activeTab === 'health_map' && (

              <div className="flex-1 bg-[#111827] border border-slate-800 rounded-xl p-4 overflow-hidden">

                <CryptoHealthMap />

              </div>

            )}

            {/* =================================================
                FINDINGS TAB
            ================================================= */}

            {activeTab === 'findings' && (
  <Findings
    onOpenAI={() => setActiveTab('ai_insights')}
  />
)}

            {/* =================================================
                AI INSIGHTS TAB
            ================================================= */}

            {activeTab === 'ai_insights' && (

              <div className="flex-1 bg-[#111827] border border-slate-800 rounded-xl flex flex-col items-center justify-center p-8">

                <h3 className="text-2xl font-bold text-white mb-2">
                  AI Remediation Copilot
                </h3>

                <p className="text-slate-500">
                  [ Member 4: Place the AI chat/prompt interface here ]
                </p>

              </div>

            )}

          </div>
        )}

      </div>

    </div>
  );
}