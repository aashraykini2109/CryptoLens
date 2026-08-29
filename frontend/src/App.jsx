import React, { useEffect, useState } from 'react';
import {
  Lock,
  AlertCircle,
  CloudUpload,
  FileCode2,
  Cpu,
  Link,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function App() {
  const [appState, setAppState] = useState('idle');
  const [activeTab, setActiveTab] = useState('dashboard');

  const [repoUrl, setRepoUrl] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [scrambleText, setScrambleText] = useState('INITIALIZING SCAN...');

  const [report, setReport] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  /*
   * ------------------------------------------------------------
   * SCAN ANIMATION
   * ------------------------------------------------------------
   */

  useEffect(() => {
    if (appState !== 'scanning') {
      return;
    }

    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>{}';

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

      if (Math.random() > 0.4) {
        setScrambleText(
          messages[Math.floor(tick / 5) % messages.length]
        );
      } else {
        setScrambleText(randomStr);
      }

      tick++;
    }, 100);

    return () => clearInterval(textInterval);
  }, [appState]);

  /*
   * ------------------------------------------------------------
   * NORMALIZE BACKEND RESPONSE
   * ------------------------------------------------------------
   *
   * Backend currently returns:
   *
   * {
   *   "total_findings": 10,
   *   "findings": [...]
   * }
   *
   * This function makes the frontend tolerant of slightly
   * different field names from the scanner.
   */

  const normalizeReport = (backendResponse) => {
    const actualReport =
      backendResponse?.report || backendResponse || {};

    const rawFindings = Array.isArray(actualReport.findings)
      ? actualReport.findings
      : [];

    const findings = rawFindings.map((finding, index) => {
      const severityRaw =
        finding.severity ||
        finding.risk ||
        finding.level ||
        'UNKNOWN';

      const severity = String(severityRaw).toUpperCase();

      let normalizedSeverity = 'SAFE';

      if (
        severity.includes('CRITICAL') ||
        severity.includes('HIGH')
      ) {
        normalizedSeverity = 'CRITICAL';
      } else if (
        severity.includes('QUANTUM')
      ) {
        normalizedSeverity = 'QUANTUM_VULNERABLE';
      } else if (
        severity.includes('MEDIUM') ||
        severity.includes('WARNING')
      ) {
        normalizedSeverity = 'QUANTUM_VULNERABLE';
      }

      return {
        id: index,

        file:
          finding.file ||
          finding.file_path ||
          finding.path ||
          'Unknown file',

        line:
          finding.line ||
          finding.line_number ||
          '-',

        algorithm:
          finding.algorithm ||
          finding.name ||
          finding.crypto ||
          'Unknown',

        category:
          finding.category ||
          finding.type ||
          'Cryptographic Finding',

        severity: normalizedSeverity,

        originalSeverity: severity,

        snippet:
          finding.snippet ||
          finding.code ||
          finding.match ||
          finding.description ||
          'No snippet available',

        description:
          finding.description ||
          '',

        recommendation:
          finding.recommendation ||
          finding.remediation ||
          '',
      };
    });

    const critical = findings.filter(
      (finding) => finding.severity === 'CRITICAL'
    ).length;

    const quantumVulnerable = findings.filter(
      (finding) =>
        finding.severity === 'QUANTUM_VULNERABLE'
    ).length;

    const safe = findings.filter(
      (finding) => finding.severity === 'SAFE'
    ).length;

    const totalFindings =
      actualReport.total_findings ??
      findings.length;

    /*
     * Simple frontend health calculation.
     *
     * This is only used until we connect a dedicated
     * backend health-score calculation.
     */

    const calculatedHealthScore = Math.max(
      0,
      Math.min(
        100,
        100 -
          critical * 15 -
          quantumVulnerable * 5
      )
    );

    const calculatedQuantumScore = Math.max(
      0,
      Math.min(
        100,
        100 - quantumVulnerable * 10
      )
    );

    return {
      total_findings: totalFindings,
      findings,
      summary: {
        critical,
        quantum_vulnerable: quantumVulnerable,
        safe,
      },
      health_score: calculatedHealthScore,
      quantum_score: calculatedQuantumScore,
    };
  };

  /*
   * ------------------------------------------------------------
   * GITHUB SCAN
   * ------------------------------------------------------------
   */

  const handleUrlScan = async () => {
    const trimmedUrl = repoUrl.trim();

    if (!trimmedUrl) {
      return;
    }

    setErrorMessage('');
    setReport(null);
    setScanProgress(5);
    setScrambleText('CONNECTING TO SCANNER...');
    setAppState('scanning');

    try {
      setScanProgress(15);

      const response = await fetch(
        `${API_BASE_URL}/scan/github`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: trimmedUrl,
          }),
        }
      );

      setScanProgress(70);
      setScrambleText('PROCESSING SCAN RESULTS...');

      if (!response.ok) {
        let backendError = '';

        try {
          const errorData = await response.json();

          backendError =
            errorData.detail ||
            errorData.message ||
            JSON.stringify(errorData);
        } catch {
          backendError = await response.text();
        }

        throw new Error(
          backendError ||
            `Scanner returned HTTP ${response.status}`
        );
      }

      const backendData = await response.json();

      setScanProgress(90);
      setScrambleText('BUILDING SECURITY REPORT...');

      const normalizedReport =
        normalizeReport(backendData);

      setReport(normalizedReport);

      setScanProgress(100);
      setScrambleText('SCAN COMPLETE');

      setTimeout(() => {
        setAppState('complete');
        setActiveTab('dashboard');
      }, 500);
    } catch (error) {
      console.error('GitHub scan failed:', error);

      setAppState('idle');
      setScanProgress(0);

      setErrorMessage(
        error.message ||
          'Failed to connect to the scanner API.'
      );
    }
  };

  /*
   * ------------------------------------------------------------
   * ZIP UPLOAD
   * ------------------------------------------------------------
   *
   * We are intentionally leaving the ZIP API disabled until
   * we confirm the exact backend ZIP endpoint and parameter
   * name. GitHub integration is connected first.
   */

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.zip')) {
      setErrorMessage(
        'Please select a .zip file.'
      );

      event.target.value = '';
      return;
    }

    setErrorMessage(
      'ZIP upload UI is ready. We will connect it after confirming the backend ZIP endpoint.'
    );

    event.target.value = '';
  };

  /*
   * ------------------------------------------------------------
   * NEW SCAN
   * ------------------------------------------------------------
   */

  const handleNewScan = () => {
    setAppState('idle');
    setActiveTab('dashboard');
    setRepoUrl('');
    setReport(null);
    setErrorMessage('');
    setScanProgress(0);
    setScrambleText('INITIALIZING SCAN...');
  };

  /*
   * ------------------------------------------------------------
   * NAVIGATION STYLE
   * ------------------------------------------------------------
   */

  const getNavStyle = (tabName) => {
    return activeTab === tabName
      ? 'text-left px-4 py-2.5 bg-[#111827] text-white rounded-lg font-medium border border-slate-800 transition'
      : 'text-left px-4 py-2.5 text-slate-400 hover:bg-[#111827] hover:text-slate-200 rounded-lg transition';
  };

  /*
   * ------------------------------------------------------------
   * IDLE SCREEN
   * ------------------------------------------------------------
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
                <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />

                <div>
                  <p className="text-red-400 font-semibold text-sm">
                    Scan failed
                  </p>

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
                onChange={(event) =>
                  setRepoUrl(event.target.value)
                }
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

            <span className="text-slate-500 text-sm font-medium">
              OR
            </span>

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
   * ------------------------------------------------------------
   * SCANNING SCREEN
   * ------------------------------------------------------------
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
            style={{
              animationDuration: '2s',
              animationDirection: 'reverse',
            }}
          />

          <Cpu className="w-10 h-10 text-orange-400 animate-pulse relative z-10" />
        </div>

        <div className="bg-[#111827] border border-slate-800 p-6 rounded-lg w-full max-w-[600px] shadow-2xl relative overflow-hidden">

          <div className="absolute top-0 left-0 w-full h-0.5 bg-orange-500 shadow-[0_0_10px_#f97316]" />

          <div className="flex justify-between items-end mb-3">

            <div className="flex items-center gap-3 text-orange-400 font-mono font-bold text-sm sm:text-base">

              <FileCode2 className="w-5 h-5 shrink-0" />

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
              className="bg-orange-500 h-full transition-all duration-500 ease-out"
              style={{
                width: `${scanProgress}%`,
              }}
            />

          </div>

          <div className="flex items-center justify-center gap-2 mt-5 text-slate-500 text-sm">

            <Loader2 className="w-4 h-4 animate-spin" />

            <span>
              Scanner is analyzing the repository...
            </span>

          </div>

        </div>
      </div>
    );
  }

  /*
   * ------------------------------------------------------------
   * REPORT VALUES
   * ------------------------------------------------------------
   */

  const totalFindings =
    report?.total_findings ?? 0;

  const critical =
    report?.summary?.critical ?? 0;

  const quantumVulnerable =
    report?.summary?.quantum_vulnerable ?? 0;

  const safe =
    report?.summary?.safe ?? 0;

  const healthScore =
    report?.health_score ?? 0;

  const quantumScore =
    report?.quantum_score ?? 0;

  const findings =
    report?.findings ?? [];

  /*
   * ------------------------------------------------------------
   * COMPLETE DASHBOARD
   * ------------------------------------------------------------
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

        <div className="mt-auto">

          <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-lg p-3">

            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">

              <CheckCircle2 className="w-4 h-4" />

              Scanner Connected

            </div>

            <p className="text-slate-500 text-xs mt-1">
              API: {API_BASE_URL}
            </p>

          </div>

        </div>

      </div>

      {/* MAIN CONTENT */}

      <div className="flex-1 overflow-y-auto p-10 relative flex flex-col">

        <div className="flex justify-between items-start mb-8">

          <div>

            <h1 className="text-3xl font-bold text-white mb-1">

              {activeTab === 'dashboard' &&
                'Security Dashboard'}

              {activeTab === 'health_map' &&
                'Crypto Health Map'}

              {activeTab === 'findings' &&
                'Vulnerability Findings'}

              {activeTab === 'ai_insights' &&
                'AI Remediation Insights'}

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
            onClick={handleNewScan}
            className="bg-white text-black px-4 py-2 rounded-md font-semibold text-sm hover:bg-slate-200 transition"
          >
            + Scan New Repository
          </button>

        </div>

        {/* DASHBOARD */}

        {activeTab === 'dashboard' && (
          <>

            {/* SUMMARY CARDS */}

            <div className="grid grid-cols-4 gap-4 mb-6">

              <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl text-center flex flex-col justify-center">

                <h3 className="text-slate-400 text-sm font-medium mb-3">
                  Crypto Health Score
                </h3>

                <div className="text-4xl font-bold text-white mb-3">
                  {healthScore}
                  <span className="text-xl text-slate-500 font-normal">
                    /100
                  </span>
                </div>

                <span
                  className={`text-sm ${
                    healthScore >= 70
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}
                >
                  {healthScore >= 70
                    ? 'Good security posture'
                    : 'Security improvements required'}
                </span>

              </div>

              <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl text-center flex flex-col justify-center">

                <h3 className="text-slate-400 text-sm font-medium mb-3">
                  Total Findings
                </h3>

                <div className="text-4xl font-bold text-white mb-3">
                  {totalFindings}
                </div>

                <span className="text-slate-500 text-sm">
                  Detected by scanner
                </span>

              </div>

              <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl text-center flex flex-col justify-center">

                <h3 className="text-slate-400 text-sm font-medium mb-3">
                  Critical Risks
                </h3>

                <div className="text-4xl font-bold text-red-500 mb-3">
                  {critical}
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
                  {quantumVulnerable}
                </div>

                <span className="text-slate-500 text-sm">
                  Future migration required
                </span>

              </div>

            </div>

            {/* MAIN DASHBOARD GRID */}

            <div className="grid grid-cols-3 gap-6">

              {/* HEALTH SUMMARY */}

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

                <div className="flex-1 border border-slate-800/50 rounded bg-[#0a0f16] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] flex flex-col items-center justify-center">

                  <div className="text-5xl font-bold text-orange-400 mb-4">
                    {totalFindings}
                  </div>

                  <p className="text-slate-400">
                    Cryptographic findings detected
                  </p>

                  <div className="flex gap-8 mt-8">

                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">
                        {critical}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Critical
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-400">
                        {quantumVulnerable}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Quantum Risk
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-400">
                        {safe}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Safe
                      </div>
                    </div>

                  </div>

                </div>

              </div>

              {/* TOP FINDINGS */}

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

                <div className="space-y-4 overflow-y-auto">

                  {findings.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                      No findings detected.
                    </div>
                  )}

                  {findings.slice(0, 5).map((finding) => (

                    <div
                      key={finding.id}
                      className="flex items-start justify-between border-b border-slate-800 pb-4"
                    >

                      <div className="flex items-start gap-3">

                        <div className="mt-1 bg-red-500/10 p-1.5 rounded-full border border-red-500/20">

                          <AlertCircle
                            className={`w-5 h-5 ${
                              finding.severity === 'CRITICAL'
                                ? 'text-red-500'
                                : 'text-amber-500'
                            }`}
                          />

                        </div>

                        <div className="min-w-0">

                          <h4 className="font-bold text-white">
                            {finding.algorithm}
                          </h4>

                          <p className="text-xs text-slate-500 font-mono mt-1 break-all">
                            {finding.file}:{finding.line}
                          </p>

                        </div>

                      </div>

                      <span
                        className={`text-xs font-bold mt-1 tracking-wider ${
                          finding.severity === 'CRITICAL'
                            ? 'text-red-500'
                            : 'text-amber-500'
                        }`}
                      >
                        {finding.originalSeverity}
                      </span>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </>
        )}

        {/* HEALTH MAP */}

        {activeTab === 'health_map' && (

          <div className="flex-1 bg-[#111827] border border-slate-800 rounded-xl flex flex-col p-8">

            <h3 className="text-2xl font-bold text-white mb-2">
              Crypto Health Map
            </h3>

            <p className="text-slate-500 mb-8">
              Interactive dependency visualization will be connected here.
            </p>

            <div className="flex-1 border border-slate-800 rounded-lg bg-[#0a0f16] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] flex items-center justify-center">

              <div className="text-center">

                <Cpu className="w-12 h-12 text-orange-400 mx-auto mb-4" />

                <p className="text-slate-400">
                  {totalFindings} cryptographic findings available
                </p>

                <p className="text-slate-600 text-sm mt-2">
                  React Flow integration goes here.

                </p>

              </div>

            </div>

          </div>

        )}

        {/* FINDINGS */}

        {activeTab === 'findings' && (

          <div className="flex-1 bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">

            <div className="p-6 border-b border-slate-800">

              <h3 className="text-2xl font-bold text-white">
                All Cryptographic Findings
              </h3>

              <p className="text-slate-500 mt-1">
                {totalFindings} findings returned by the scanner.
              </p>

            </div>

            {findings.length === 0 ? (

              <div className="p-10 text-center text-slate-500">
                No findings detected.
              </div>

            ) : (

              <div className="overflow-auto">

                <table className="w-full text-left">

                  <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase">

                    <tr>

                      <th className="px-5 py-4">
                        File
                      </th>

                      <th className="px-5 py-4">
                        Algorithm
                      </th>

                      <th className="px-5 py-4">
                        Category
                      </th>

                      <th className="px-5 py-4">
                        Severity
                      </th>

                      <th className="px-5 py-4">
                        Snippet
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-800">

                    {findings.map((finding) => (

                      <tr
                        key={finding.id}
                        className="hover:bg-slate-800/50"
                      >

                        <td className="px-5 py-4 font-mono text-xs text-indigo-300">
                          {finding.file}:{finding.line}
                        </td>

                        <td className="px-5 py-4 font-bold text-white">
                          {finding.algorithm}
                        </td>

                        <td className="px-5 py-4 text-slate-400">
                          {finding.category}
                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                              finding.severity === 'CRITICAL'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : finding.severity === 'QUANTUM_VULNERABLE'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {finding.originalSeverity}
                          </span>

                        </td>

                        <td className="px-5 py-4 font-mono text-xs text-slate-300 max-w-md">
                          <div className="truncate">
                            {finding.snippet}
                          </div>
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        )}

        {/* AI INSIGHTS */}

        {activeTab === 'ai_insights' && (

          <div className="flex-1 bg-[#111827] border border-slate-800 rounded-xl flex flex-col items-center justify-center p-8">

            <div className="text-center max-w-xl">

              <Cpu className="w-16 h-16 text-orange-400 mx-auto mb-5" />

              <h3 className="text-2xl font-bold text-white mb-2">
                AI Remediation Copilot
              </h3>

              <p className="text-slate-500">
                AI remediation integration will be connected here.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-4">

                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="text-red-400 text-2xl font-bold">
                    {critical}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Critical
                  </div>
                </div>

                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="text-amber-400 text-2xl font-bold">
                    {quantumVulnerable}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Quantum
                  </div>
                </div>

                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="text-emerald-400 text-2xl font-bold">
                    {safe}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Safe
                  </div>
                </div>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}