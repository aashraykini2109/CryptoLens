import { useState } from 'react';
import {
  Lock, Shield, ShieldAlert, AlertTriangle, Layers, Zap, Activity,
  ChevronRight, RefreshCw, LayoutDashboard, Map, Bug, Bot, ArrowRight,
  CheckCircle2, Clock, Sparkles
} from 'lucide-react';

export default function SecurityDashboard({ onNewScan, onSelectNav, onSelectFinding }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (onSelectNav) onSelectNav(id);
  };

  return (
    <div className="min-h-screen bg-[#070303] text-slate-100 font-sans flex antialiased selection:bg-orange-500/30 selection:text-orange-200">
      {/* ════════════════════════════════════════════════════════════
         LEFT SIDEBAR
      ════════════════════════════════════════════════════════════ */}
      <aside className="w-64 min-w-[16rem] bg-[#110505] border-r border-red-900/30 flex flex-col justify-between p-4 min-h-screen sticky top-0 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <div>
          {/* Logo Area */}
          <div className="flex items-center gap-3 px-2 py-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-900/60 to-red-950 border border-orange-500/40 flex items-center justify-center text-orange-500 shadow-[0_0_15px_rgba(255,69,0,0.3)]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                CryptoLens
              </div>
              <div className="text-[10px] font-mono text-red-500/50 tracking-widest font-semibold uppercase">
                v2.0 CORE
              </div>
            </div>
          </div>

          {/* Engine Status */}
          <div className="bg-[#0c0303] border border-red-900/25 rounded-xl p-3 mb-6 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[9px] font-mono tracking-widest text-red-500/60 font-semibold uppercase">
                  ANALYSIS ENGINE
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500 shadow-[0_0_8px_rgba(255,69,0,0.9)]"></span>
                </span>
                <span className="text-[10px] font-mono font-bold text-orange-400 tracking-wider">
                  ONLINE
                </span>
              </div>
            </div>
          </div>

          {/* Nav Section Header */}
          <div className="text-[10px] font-mono tracking-widest text-red-500/40 uppercase mb-3 px-3 font-bold">
            WORKSPACE
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] cursor-pointer group ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-red-950/80 to-red-950/20 border-l-4 border-orange-500 text-white font-semibold shadow-[0_0_20px_rgba(255,69,0,0.15)] border-y border-r border-red-900/30'
                  : 'text-red-400/60 hover:text-slate-200 hover:bg-red-950/30 hover:border-orange-500/40 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-orange-500' : 'text-red-500/50 group-hover:text-orange-400'}`} />
                <div>
                  <div className="text-sm font-semibold leading-tight">Dashboard</div>
                  <div className="text-[10px] font-mono text-red-500/40 leading-tight mt-0.5">Security overview</div>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${activeTab === 'dashboard' ? 'text-orange-500' : 'text-red-500/30'}`} />
            </button>

            <button
              onClick={() => handleNavClick('healthmap')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] cursor-pointer group ${
                activeTab === 'healthmap'
                  ? 'bg-gradient-to-r from-red-950/80 to-red-950/20 border-l-4 border-orange-500 text-white font-semibold shadow-[0_0_20px_rgba(255,69,0,0.15)] border-y border-r border-red-900/30'
                  : 'text-red-400/60 hover:text-slate-200 hover:bg-red-950/30 hover:border-orange-500/40 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Map className={`w-4 h-4 ${activeTab === 'healthmap' ? 'text-orange-500' : 'text-red-500/50 group-hover:text-orange-400'}`} />
                <div>
                  <div className="text-sm font-semibold leading-tight">Health Map</div>
                  <div className="text-[10px] font-mono text-red-500/40 leading-tight mt-0.5">Crypto topology</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleNavClick('findings')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] cursor-pointer group ${
                activeTab === 'findings'
                  ? 'bg-gradient-to-r from-red-950/80 to-red-950/20 border-l-4 border-orange-500 text-white font-semibold shadow-[0_0_20px_rgba(255,69,0,0.15)] border-y border-r border-red-900/30'
                  : 'text-red-400/60 hover:text-slate-200 hover:bg-red-950/30 hover:border-orange-500/40 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bug className={`w-4 h-4 ${activeTab === 'findings' ? 'text-orange-500' : 'text-red-500/50 group-hover:text-orange-400'}`} />
                <div>
                  <div className="text-sm font-semibold leading-tight">Findings</div>
                  <div className="text-[10px] font-mono text-red-500/40 leading-tight mt-0.5">Detected risks</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleNavClick('insights')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] cursor-pointer group ${
                activeTab === 'insights'
                  ? 'bg-gradient-to-r from-red-950/80 to-red-950/20 border-l-4 border-orange-500 text-white font-semibold shadow-[0_0_20px_rgba(255,69,0,0.15)] border-y border-r border-red-900/30'
                  : 'text-red-400/60 hover:text-slate-200 hover:bg-red-950/30 hover:border-orange-500/40 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bot className={`w-4 h-4 ${activeTab === 'insights' ? 'text-orange-500' : 'text-red-500/50 group-hover:text-orange-400'}`} />
                <div>
                  <div className="text-sm font-semibold leading-tight">AI Insights</div>
                  <div className="text-[10px] font-mono text-red-500/40 leading-tight mt-0.5">Remediation copilot</div>
                </div>
              </div>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-red-900/20 text-[10px] font-mono text-red-500/40 space-y-1">
          <div className="flex justify-between">
            <span>CORE VERSION</span>
            <span className="text-slate-400 font-semibold">2.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>POST-QUANTUM</span>
            <span className="text-orange-400 font-bold">READY</span>
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════════
         MAIN CONTENT AREA
      ════════════════════════════════════════════════════════════ */}
      <main className="flex-1 p-8 overflow-y-auto max-w-[1600px] mx-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-mono tracking-widest text-red-500/50 uppercase font-semibold flex items-center gap-2">
              <span>CRYPTO LENS</span>
              <span>&gt;</span>
              <span className="text-orange-500 font-bold">DASHBOARD</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
              Security Dashboard
            </h1>
            <p className="text-sm text-red-400/50 font-normal mt-1 max-w-2xl">
              Comprehensive analysis of your project's cryptographic security posture.
            </p>
          </div>

          <button
            onClick={onNewScan}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#170707] hover:bg-orange-950/40 border border-orange-500/40 hover:border-orange-500 text-orange-400 hover:text-orange-300 font-mono text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(255,69,0,0.15)] transform transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>NEW SCAN</span>
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════
           TOP METRICS GRID (4 CARDS)
        ════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {/* Card 1: Crypto Health Score */}
          <div className="bg-[#110505] border border-red-900/30 hover:border-orange-500/50 rounded-2xl p-5 transform transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-red-900/20 cursor-pointer relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-red-950/50 border border-red-900/30 flex items-center justify-center text-orange-500 shadow-inner">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                STABLE
              </span>
            </div>
            <div className="text-[10px] font-mono tracking-widest text-red-500/60 uppercase font-bold">
              CRYPTO HEALTH SCORE
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white tracking-tight">78</span>
              <span className="text-sm font-mono text-red-500/50 font-semibold">/100</span>
            </div>
            <div className="h-2 w-full bg-red-950/50 rounded-full overflow-hidden mt-4 border border-red-900/20">
              <div className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 rounded-full shadow-[0_0_12px_rgba(255,69,0,0.6)] w-[78%] transition-all duration-1000"></div>
            </div>
            <div className="text-[10px] font-mono tracking-widest text-red-500/50 mt-3 font-semibold">
              GOOD SECURITY POSTURE
            </div>
          </div>

          {/* Card 2: Total Findings */}
          <div className="bg-[#110505] border border-red-900/30 hover:border-orange-500/50 rounded-2xl p-5 transform transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-red-900/20 cursor-pointer relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-red-950/50 border border-red-900/30 flex items-center justify-center text-orange-500 shadow-inner">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono text-red-500/40 font-semibold">
                02
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono tracking-widest text-red-500/60 uppercase font-bold">
                  TOTAL FINDINGS
                </div>
                <div className="text-4xl font-extrabold text-white tracking-tight mt-2">
                  20
                </div>
              </div>

              {/* Animated Radar Graphic */}
              <div className="relative w-16 h-16 flex items-center justify-center mr-1">
                <div className="absolute inset-0 rounded-full border border-orange-500/20"></div>
                <div className="absolute inset-2 rounded-full border border-orange-500/40"></div>
                <div className="absolute inset-4 rounded-full border border-orange-500/60"></div>
                <div className="w-full h-full rounded-full border-t-2 border-orange-500 animate-[spin_3s_linear_infinite] opacity-70"></div>
                <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_#FF4500] animate-ping"></span>
              </div>
            </div>
            <div className="text-[10px] font-mono tracking-widest text-red-500/50 mt-4 font-semibold">
              ACROSS SCANNED DIRECTORIES
            </div>
          </div>

          {/* Card 3: Critical Risks */}
          <div className="bg-[#110505] border border-red-900/30 hover:border-orange-500/50 rounded-2xl p-5 transform transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-red-900/20 cursor-pointer relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-red-950/50 border border-red-900/30 flex items-center justify-center text-red-500 shadow-inner">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold text-red-400 tracking-wider">
                HIGH PRIORITY
              </span>
            </div>
            <div className="text-[10px] font-mono tracking-widest text-red-500/60 uppercase font-bold">
              CRITICAL RISKS
            </div>
            <div className="text-4xl font-extrabold text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)] tracking-tight mt-2">
              2
            </div>
            <div className="text-[10px] font-mono tracking-widest text-red-500/50 mt-4 font-semibold">
              REQUIRE IMMEDIATE MITIGATION
            </div>
          </div>

          {/* Card 4: Quantum Risks */}
          <div className="bg-[#110505] border border-red-900/30 hover:border-orange-500/50 rounded-2xl p-5 transform transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-red-900/20 cursor-pointer relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-red-950/50 border border-red-900/30 flex items-center justify-center text-amber-500 shadow-inner">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                PQC
              </span>
            </div>
            <div className="text-[10px] font-mono tracking-widest text-red-500/60 uppercase font-bold">
              QUANTUM RISKS
            </div>
            <div className="text-4xl font-extrabold text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)] tracking-tight mt-2">
              5
            </div>
            <div className="text-[10px] font-mono tracking-widest text-red-500/50 mt-4 font-semibold">
              POST-QUANTUM UPGRADE REQUIRED
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
           BOTTOM GRID (SPLIT 2/3 & 1/3)
        ════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel: Crypto Health Map (2 cols) */}
          <div className="lg:col-span-2 bg-[#110505] border border-red-900/30 rounded-2xl p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.3)] relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[10px] font-mono tracking-widest text-red-500/50 uppercase font-bold">
                  SYSTEM TOPOLOGY
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
                  Crypto Health Map
                </h2>
                <p className="text-xs text-red-400/50 mt-0.5">
                  Component mapping & dependency relationships
                </p>
              </div>

              <button
                onClick={() => onSelectNav && onSelectNav('healthmap')}
                className="text-xs font-mono font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1.5 transition-all transform hover:scale-105 cursor-pointer"
              >
                <span>VIEW FULL MAP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Topology Canvas Container */}
            <div className="bg-[#0c0303] border border-red-900/20 rounded-xl p-6 relative overflow-hidden min-h-[360px] flex flex-col justify-between bg-[radial-gradient(#ff4500_1px,transparent_1px)] [background-size:24px_24px] [background-position:0_0] opacity-95">
              {/* Live Topology Tag */}
              <div className="absolute top-4 right-4 z-10">
                <span className="px-2.5 py-1 bg-red-950/80 border border-red-900/40 rounded-full text-[9px] font-mono text-red-400 font-bold tracking-widest shadow-inner">
                  LIVE TOPOLOGY
                </span>
              </div>

              {/* Topology Nodes Diagram */}
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center my-auto py-4">
                {/* Root Node */}
                <div className="bg-[#160606] border border-orange-500/40 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(255,69,0,0.2)] flex items-center gap-2 mb-8 transform transition-transform hover:scale-105 cursor-pointer">
                  <Lock className="w-3.5 h-3.5 text-orange-500" />
                  <span>My Project</span>
                  <span className="text-[9px] font-mono text-red-400/60 font-normal">Cryptographic Usage</span>
                </div>

                {/* SVG Connecting Lines */}
                <div className="w-full max-w-xl mb-6 relative">
                  <svg className="w-full h-12 overflow-visible stroke-orange-500/30">
                    <path d="M 50% 0 L 16% 48" fill="none" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
                    <path d="M 50% 0 L 50% 48" fill="none" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
                    <path d="M 50% 0 L 84% 48" fill="none" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
                  </svg>
                </div>

                {/* Category Nodes Row */}
                <div className="grid grid-cols-3 gap-4 w-full max-w-2xl mb-8">
                  {/* Hashing */}
                  <div className="bg-[#110505] border border-purple-500/40 rounded-xl p-3 text-center transform transition-transform hover:scale-105 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                    <div className="text-xs font-bold text-white">Hashing</div>
                    <div className="text-[9px] font-mono text-purple-400/70 mt-0.5">3 algorithms</div>
                  </div>

                  {/* Symmetric */}
                  <div className="bg-[#110505] border border-blue-500/40 rounded-xl p-3 text-center transform transition-transform hover:scale-105 cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    <div className="text-xs font-bold text-white">Symmetric Encryption</div>
                    <div className="text-[9px] font-mono text-blue-400/70 mt-0.5">2 algorithms</div>
                  </div>

                  {/* Asymmetric */}
                  <div className="bg-[#110505] border border-emerald-500/40 rounded-xl p-3 text-center transform transition-transform hover:scale-105 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                    <div className="text-xs font-bold text-white">Asymmetric Cryptography</div>
                    <div className="text-[9px] font-mono text-emerald-400/70 mt-0.5">1 algorithm</div>
                  </div>
                </div>

                {/* Leaf Nodes Row */}
                <div className="grid grid-cols-6 gap-2 w-full max-w-2xl">
                  <div className="bg-[#140606] border border-red-500/40 rounded-lg p-2 text-center">
                    <div className="text-xs font-bold text-white">MD5</div>
                    <div className="text-[8px] font-mono font-bold text-red-500 tracking-wider">HIGH RISK</div>
                  </div>
                  <div className="bg-[#140606] border border-red-500/40 rounded-lg p-2 text-center">
                    <div className="text-xs font-bold text-white">SHA-1</div>
                    <div className="text-[8px] font-mono font-bold text-red-500 tracking-wider">HIGH RISK</div>
                  </div>
                  <div className="bg-[#140606] border border-emerald-500/40 rounded-lg p-2 text-center">
                    <div className="text-xs font-bold text-white">SHA-256</div>
                    <div className="text-[8px] font-mono font-bold text-emerald-400 tracking-wider">LOW RISK</div>
                  </div>
                  <div className="bg-[#140606] border border-emerald-500/40 rounded-lg p-2 text-center">
                    <div className="text-xs font-bold text-white">AES</div>
                    <div className="text-[8px] font-mono font-bold text-emerald-400 tracking-wider">LOW RISK</div>
                  </div>
                  <div className="bg-[#140606] border border-red-500/40 rounded-lg p-2 text-center">
                    <div className="text-xs font-bold text-white">DES</div>
                    <div className="text-[8px] font-mono font-bold text-red-500 tracking-wider">HIGH RISK</div>
                  </div>
                  <div className="bg-[#140606] border border-amber-500/40 rounded-lg p-2 text-center">
                    <div className="text-xs font-bold text-white">RSA</div>
                    <div className="text-[8px] font-mono font-bold text-amber-400 tracking-wider">MED RISK</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Top Findings (1 col) */}
          <div className="lg:col-span-1 bg-[#110505] border border-red-900/30 rounded-2xl p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-red-500/50 uppercase font-bold">
                    THREAT SURFACE
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
                    Top Findings
                  </h2>
                  <p className="text-xs text-red-400/50 mt-0.5">
                    High priority concerns
                  </p>
                </div>

                <button
                  onClick={() => onSelectNav && onSelectNav('findings')}
                  className="text-xs font-mono font-bold text-orange-400 hover:text-orange-300 transition-all transform hover:scale-105 cursor-pointer"
                >
                  SEE ALL
                </button>
              </div>

              {/* Findings List Items */}
              <div className="space-y-3 mt-4">
                {/* Item 01 */}
                <div
                  onClick={() => onSelectFinding && onSelectFinding({ name: 'Weak RSA Key Size', algorithm: 'RSA-1024', file: 'src/auth/login.js', severity: 'HIGH' })}
                  className="bg-[#0c0303] border border-red-900/25 rounded-xl p-3.5 flex items-center justify-between transform transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-lg hover:shadow-red-900/20 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-red-500/40 font-semibold">01</span>
                    <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-500 shadow-inner">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                        RSA-1024
                      </div>
                      <div className="font-mono text-[11px] text-red-400/50 mt-0.5">
                        src/auth/login.js
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-bold text-red-500 bg-red-950/80 border border-red-800/50 px-2.5 py-0.5 rounded-md">
                      HIGH
                    </span>
                    <ChevronRight className="w-4 h-4 text-red-500/30 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                {/* Item 02 */}
                <div
                  onClick={() => onSelectFinding && onSelectFinding({ name: 'Deprecated Hash Algorithm', algorithm: 'SHA-1', file: 'src/security/hash.js', severity: 'HIGH' })}
                  className="bg-[#0c0303] border border-red-900/25 rounded-xl p-3.5 flex items-center justify-between transform transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-lg hover:shadow-red-900/20 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-red-500/40 font-semibold">02</span>
                    <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-500 shadow-inner">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                        SHA-1
                      </div>
                      <div className="font-mono text-[11px] text-red-400/50 mt-0.5">
                        src/security/hash.js
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-bold text-red-500 bg-red-950/80 border border-red-800/50 px-2.5 py-0.5 rounded-md">
                      HIGH
                    </span>
                    <ChevronRight className="w-4 h-4 text-red-500/30 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                {/* Item 03 */}
                <div
                  onClick={() => onSelectFinding && onSelectFinding({ name: 'Outdated OpenSSL', algorithm: 'Old OpenSSL', file: 'package.json', severity: 'MEDIUM' })}
                  className="bg-[#0c0303] border border-red-900/25 rounded-xl p-3.5 flex items-center justify-between transform transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-lg hover:shadow-red-900/20 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-red-500/40 font-semibold">03</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-500 shadow-inner">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                        Old OpenSSL
                      </div>
                      <div className="font-mono text-[11px] text-red-400/50 mt-0.5">
                        package.json
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/80 border border-amber-800/50 px-2.5 py-0.5 rounded-md">
                      MEDIUM
                    </span>
                    <ChevronRight className="w-4 h-4 text-red-500/30 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
