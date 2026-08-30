import React, { useEffect, useState } from 'react';
import {
  Lock,
  AlertCircle,
  CloudUpload,
  FileCode2,
  Cpu,
  Link,
} from 'lucide-react';
import AICopilot from './AICopilot';
import Member3Dashboard from './Member3Dashboard';
import CryptoHealthMap from './CryptoHealthMap';
import Findings from './Findings';

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function App() {
  const [appState, setAppState] = useState('idle');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [selectedFinding, setSelectedFinding] = useState(null);

  const handleOpenAiCopilot = (finding) => {
    setSelectedFinding(finding);
    setActiveTab('ai_insights');
  };

  const [repoUrl, setRepoUrl] = useState('');
  const [scanData, setScanData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [scrambleText, setScrambleText] = useState('INITIALIZING SCAN...');
  const [scanProgress, setScanProgress] = useState(0);

  /*
   * ============================================================
   * HACKER TEXT / SCANNER ANIMATION
   * ============================================================
   */

  useEffect(() => {
    if (appState !== 'scanning') {
      return;
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*<>{}';

    const messages = [
      'ANALYZING ENCRYPTION...',
      'MAPPING NODE GRAPH...',
      'DECRYPTING DEPENDENCIES...',
      'ISOLATING VULNERABILITIES...',
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

  /*
   * ============================================================
   * PREPARE DASHBOARD DATA
   * ============================================================
   */

  const prepareDashboardData = (report) => {
    const findings = Array.isArray(report?.findings)
      ? report.findings
      : [];

    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;
    let quantumVulnerable = 0;

    findings.forEach((finding) => {
      const severity = String(
        finding?.severity || ''
      ).toUpperCase();

      if (severity === 'CRITICAL') {
        critical += 1;
      } else if (severity === 'HIGH') {
        high += 1;
      } else if (severity === 'MEDIUM') {
        medium += 1;
      } else if (severity === 'LOW') {
        low += 1;
      }

      /*
       * RSA is currently treated as quantum-vulnerable.
       */
      if (
        finding?.algorithm &&
        String(finding.algorithm).toUpperCase() === 'RSA'
      ) {
        quantumVulnerable += 1;
      }
    });

    const totalFindings = findings.length;

    let healthScore = 100;

    healthScore -= critical * 25;
    healthScore -= high * 15;
    healthScore -= medium * 8;
    healthScore -= low * 2;

    healthScore = Math.max(0, Math.min(100, healthScore));

    const quantumScore =
      totalFindings === 0
        ? 100
        : Math.max(
            0,
            Math.min(
              100,
              Math.round(
                ((totalFindings - quantumVulnerable) / totalFindings) * 100
              )
            )
          );

    return {
      ...report,
      health_score: healthScore,
      quantum_score: quantumScore,
      summary: {
        critical,
        high,
        medium,
        low,
        quantum_vulnerable: quantumVulnerable,
        safe: Math.max(
          0,
          totalFindings - critical - high - medium - quantumVulnerable
        ),
      },
    };
  };

  /*
   * ============================================================
   * GITHUB URL SCAN
   * ============================================================
   */

  const handleUrlScan = async () => {
    if (!repoUrl.trim()) {
      return;
    }

    setErrorMessage('');
    setScanData(null);
    setAppState('scanning');
    setScanProgress(10);
    setScrambleText('CONNECTING TO BACKEND...');

    try {
      setScanProgress(20);

      const response = await fetch(`${API_BASE_URL}/scan/github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: repoUrl.trim() }),
      });

      setScanProgress(70);

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData?.detail || 'GitHub scan failed.');
      }

      setScanProgress(100);

      const dashboardData = prepareDashboardData(responseData);
      setScanData(dashboardData);

      setTimeout(() => {
        setAppState('complete');
        setActiveTab('dashboard');
      }, 400);
    } catch (error) {
      console.error('GitHub scan error:', error);
      setErrorMessage(
        error?.message || 'Failed to connect to the CryptoLens backend.'
      );
      setAppState('idle');
      setScanProgress(0);
    }
  };

  /*
   * ============================================================
   * ZIP FILE SCAN
   * ============================================================
   */

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.zip')) {
      setErrorMessage('Please select a .zip file.');
      event.target.value = '';
      return;
    }

    setErrorMessage('');
    setScanData(null);
    setAppState('scanning');
    setScanProgress(10);
    setScrambleText('UPLOADING ZIP FILE...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      setScanProgress(25);

      const response = await fetch(`${API_BASE_URL}/scan/zip`, {
        method: 'POST',
        body: formData,
      });

      setScanProgress(70);

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData?.detail || 'ZIP scan failed.');
      }

      setScanProgress(100);

      const dashboardData = prepareDashboardData(responseData);
      setScanData(dashboardData);

      setTimeout(() => {
        setAppState('complete');
        setActiveTab('dashboard');
      }, 400);
    } catch (error) {
      console.error('ZIP scan error:', error);
      setErrorMessage(
        error?.message || 'Failed to connect to the CryptoLens backend.'
      );
      setAppState('idle');
      setScanProgress(0);
    }

    event.target.value = '';
  };

  /*
   * ============================================================
   * NAVIGATION STYLE
   * ============================================================
   */

  const getNavStyle = (tabName) => {
    if (tabName === 'ai_insights') {
      return activeTab === tabName
        ? 'text-left px-4 py-2.5 bg-orange-500/10 text-orange-400 rounded-lg font-medium border border-orange-500/20 transition'
        : 'text-left px-4 py-2.5 text-slate-400 hover:bg-[#111827] hover:text-slate-200 rounded-lg transition';
    }
    
    return activeTab === tabName
      ? 'text-left px-4 py-2.5 bg-[#111827] text-white rounded-lg font-medium border border-slate-800 transition'
      : 'text-left px-4 py-2.5 text-slate-400 hover:bg-[#111827] hover:text-slate-200 rounded-lg transition';
  };

  /*
   * ============================================================
   * IDLE SCREEN
   * ============================================================
   */

  if (appState === 'idle') {
    return (
      <div className="flex h-screen w-screen bg-[#0a0f16] text-slate-300 font-sans items-center justify-center p-6 overflow-hidden">
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-10 text-center max-w-xl w-full shadow-2xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Lock className="w-8 h-8 text-orange-400" />
            <span className="text-2xl font-bold text-white tracking-wide">
              CryptoLens
            </span>
          </div>

          <p className="text-slate-400 mb-8">
            Enter a repository URL or upload a .zip file to begin security analysis.
          </p>

          {errorMessage && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-left">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-semibold">Scan failed</p>
                  <p className="text-red-300/80 text-sm mt-1 break-words">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mb-8">
            <div className="relative flex-1">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="https://github.com/username/repo"
                value={repoUrl}
                onChange={(event) => {
                  setRepoUrl(event.target.value);
                  setErrorMessage('');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleUrlScan();
                  }
                }}
                className="w-full bg-[#0a0f16] border border-slate-700 rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:border-orange-500 transition"
              />
            </div>

            <button
              onClick={handleUrlScan}
              disabled={!repoUrl.trim()}
              className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
            >
              Scan URL
            </button>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-slate-500 text-sm font-medium">OR</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

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
    );
  }

  /*
   * ============================================================
   * SCANNING SCREEN
   * ============================================================
   */

  if (appState === 'scanning') {
    return (
      <div className="flex h-screen w-screen bg-[#0a0f16] text-slate-300 font-sans items-center justify-center p-6 overflow-hidden flex-col">
        <div className="relative flex items-center justify-center w-32 h-32 mb-8">
          <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 animate-pulse rounded-full" />
          <div
            className="absolute inset-0 border-t-2 border-r-2 border-orange-500/80 rounded-full animate-spin"
            style={{ animationDuration: '3s' }}
          />
          <div
            className="absolute inset-3 border-b-2 border-l-2 border-emerald-400/80 rounded-full animate-spin"
            style={{ animationDuration: '2s', animationDirection: 'reverse' }}
          />
          <Cpu className="w-10 h-10 text-orange-400 animate-pulse relative z-10" />
        </div>

        <div className="bg-[#111827] border border-slate-800 p-6 rounded-lg w-full max-w-[500px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-orange-500 shadow-[0_0_10px_#f97316]" />
          <div className="flex justify-between items-end mb-3">
            <div className="flex items-center gap-3 text-orange-400 font-mono font-bold text-sm sm:text-base">
              <FileCode2 className="w-5 h-5 shrink-0" />
              <span className="tracking-widest">{scrambleText}</span>
            </div>
            <span className="text-white font-bold font-mono text-xl">
              {scanProgress}%
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-orange-500 h-full transition-all duration-300 ease-linear"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * COMPLETE / DASHBOARD STATE
   * ============================================================
   */

  return (
    <div className="flex h-screen bg-[#0a0f16] text-slate-300 font-sans overflow-hidden">
      {/* SIDEBAR */}
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

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto p-10 relative flex flex-col">
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
              {activeTab === 'dashboard' && "Understand your project's cryptographic health."}
              {activeTab === 'health_map' && 'Visual dependency graph of cryptography in your codebase.'}
              {activeTab === 'findings' && 'Detailed breakdown of all detected algorithms and flaws.'}
              {activeTab === 'ai_insights' && 'Automated suggestions for NIST-compliant migrations.'}
            </p>
          </div>

          <button
            onClick={() => {
              setAppState('idle');
              setRepoUrl('');
              setScanData(null);
              setErrorMessage('');
              setScanProgress(0);
            }}
            className="bg-white text-black px-4 py-2 rounded-md font-semibold text-sm hover:bg-slate-200 transition"
          >
            + Scan New Repository
          </button>
        </div>

        {/* =====================================================
            DASHBOARD
        ===================================================== */}
        {activeTab === 'dashboard' && (
          <>
            {/* SCORE CARDS */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {/* HEALTH SCORE */}
              <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl text-center flex flex-col justify-center">
                <h3 className="text-slate-400 text-sm font-medium mb-3">
                  Crypto Health Score
                </h3>
                <div className="text-4xl font-bold text-white mb-3">
                  {scanData?.health_score ?? '--'}
                  <span className="text-xl text-slate-500 font-normal">/100</span>
                </div>
                <span
                  className={`text-sm ${
                    (scanData?.health_score ?? 0) >= 70
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}
                >
                  {scanData
                    ? scanData.health_score >= 70
                      ? 'Good security posture'
                      : 'Needs attention'
                    : 'Scan data unavailable'}
                </span>
              </div>

              {/* TOTAL FINDINGS */}
              <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl text-center flex flex-col justify-center">
                <h3 className="text-slate-400 text-sm font-medium mb-3">
                  Total Findings
                </h3>
                <div className="text-4xl font-bold text-white mb-3">
                  {scanData?.total_findings ?? 0}
                </div>
                <span className="text-slate-500 text-sm">
                  Across your codebase
                </span>
              </div>

              {/* CRITICAL RISKS */}
              <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl text-center flex flex-col justify-center">
                <h3 className="text-slate-400 text-sm font-medium mb-3">
                  Critical Risks
                </h3>
                <div className="text-4xl font-bold text-red-500 mb-3">
                  {scanData?.summary?.critical ?? 0}
                </div>
                <span className="text-slate-500 text-sm">
                  Require immediate attention
                </span>
              </div>

              {/* QUANTUM RISKS */}
              <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl text-center flex flex-col justify-center">
                <h3 className="text-slate-400 text-sm font-medium mb-3">
                  Quantum Risks
                </h3>
                <div className="text-4xl font-bold text-amber-500 mb-3">
                  {scanData?.summary?.quantum_vulnerable ?? 0}
                </div>
                <span className="text-slate-500 text-sm">
                  Future migration required
                </span>
              </div>
            </div>

            {/* HEALTH MAP + TOP FINDINGS */}
            <div className="grid grid-cols-3 gap-6">
              {/* HEALTH MAP */}
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
                    View Full Map →
                  </button>
                </div>

                <div className="flex-1 border border-slate-800/50 rounded bg-[#0a0f16] flex items-center justify-center text-slate-500 overflow-hidden">
                  <CryptoHealthMap />
                </div>
              </div>

              {/* TOP FINDINGS */}
              <div className="col-span-1 bg-[#111827] border border-slate-800 rounded-xl p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Top Findings</h2>
                    <p className="text-sm text-slate-400">Issues requiring attention</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('findings')}
                    className="text-orange-400 text-sm hover:underline"
                  >
                    See All
                  </button>
                </div>

                <div className="space-y-6">
                  {scanData?.findings?.length > 0 ? (
                    scanData.findings.slice(0, 3).map((finding, index) => {
                      const severity = String(
                        finding?.severity || 'UNKNOWN'
                      ).toUpperCase();

                      const severityColor =
                        severity === 'CRITICAL' || severity === 'HIGH'
                          ? 'text-red-500'
                          : severity === 'MEDIUM'
                          ? 'text-amber-500'
                          : 'text-emerald-400';

                      return (
                        <div
                          key={`${finding?.file}-${finding?.line}-${index}`}
                          className="flex items-start justify-between border-b border-slate-800 pb-4"
                        >
                          <div className="flex items-start gap-4">
                            <div className="mt-1 bg-red-500/10 p-1.5 rounded-full border border-red-500/20">
                              <AlertCircle
                                className={`w-5 h-5 ${severityColor}`}
                              />
                            </div>
                            <div>
                              <h4 className="font-bold text-white">
                                {finding?.algorithm || 'Unknown'}
                              </h4>
                              <p className="text-sm text-slate-500 font-mono mt-1 break-all">
                                {finding?.file || 'Unknown file'}:
                                {finding?.line ?? '--'}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-bold mt-1 tracking-wider ${severityColor}`}
                          >
                            {severity}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-slate-500 text-sm">
                      No findings were returned by the backend.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* =====================================================
            HEALTH MAP TAB
        ===================================================== */}
        {activeTab === 'health_map' && (
          <div className="flex-1 bg-[#111827] border border-slate-800 rounded-xl p-6 overflow-hidden">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">
                Full Crypto Health Map
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Visualize cryptographic dependencies across the scanned project.
              </p>
            </div>
            <div className="h-[calc(100%-80px)] min-h-[500px] bg-[#0a0f16] rounded-xl border border-slate-800 overflow-hidden">
              <CryptoHealthMap />
            </div>
          </div>
        )}

        {/* =====================================================
            FINDINGS TAB
        ===================================================== */}
        {activeTab === 'findings' && (
          <div className="flex-1">
            {scanData ? (
              <Findings
                scanData={scanData}
                onSelectFinding={handleOpenAiCopilot}
              />
            ) : (
              <div className="bg-[#111827] border border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 min-h-[400px]">
                <h3 className="text-2xl font-bold text-white mb-2">
                  All Cryptographic Findings
                </h3>
                <p className="text-slate-500">
                  No scan data available.
                </p>
              </div>
            )}
          </div>
        )}

        {/* =====================================================
            AI INSIGHTS TAB
        ===================================================== */}
        {activeTab === 'ai_insights' && (
          <div className="flex-1">
            <AICopilot initialFinding={selectedFinding} />
          </div>
        )}

      </div>
    </div>
  );
}