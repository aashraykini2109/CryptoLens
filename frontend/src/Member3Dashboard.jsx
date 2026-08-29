import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Cpu, AlertTriangle, FileCode } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function Member3Dashboard({ data }) {
  const [filter, setFilter] = useState('ALL');

  if (!data) return null;

  const filteredFindings = data.findings.filter(f => {
    if (filter === 'ALL') return true;
    return f.severity === filter;
  });

  // Chart Data Prep
  const chartData = [
    { name: 'Critical (Broken)', value: data.summary.critical, color: '#ef4444' },
    { name: 'Quantum Vulnerable', value: data.summary.quantum_vulnerable, color: '#f97316' },
    { name: 'Safe (PQC/Modern)', value: data.summary.safe, color: '#10b981' }
  ];

  return (
    <div className="space-y-6">
      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Health Score</span>
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white">{data.health_score} <span className="text-lg text-slate-400 font-normal">/ 100</span></div>
          <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full ${data.health_score < 70 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
            {data.health_score < 70 ? 'High Crypto Debt' : 'Secure Posture'}
          </span>
        </div>

        <div className="p-5 bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Quantum Readiness</span>
            <Cpu className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{data.quantum_score}%</div>
          <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/20 text-amber-300">
            NIST Standard Aligned
          </span>
        </div>

        <div className="p-5 bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Critical Flaws</span>
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-3xl font-black text-red-400">{data.summary.critical}</div>
          <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-300">
            Broken Algorithms
          </span>
        </div>

        <div className="p-5 bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Quantum Vulnerable</span>
            <ShieldCheck className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-3xl font-black text-orange-400">{data.summary.quantum_vulnerable}</div>
          <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full bg-orange-500/20 text-orange-300">
            Shor Vulnerable
          </span>
        </div>
      </div>

      {/* Analytics Chart Section */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center gap-8">
        <div className="w-full md:w-1/3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full md:w-2/3 space-y-4">
          <h3 className="text-xl font-bold text-white">Cryptographic Risk Distribution</h3>
          <p className="text-slate-400 text-sm">
            This codebase contains <strong className="text-red-400">{data.summary.critical} critical</strong> vulnerabilities that can be broken by classical computers, and <strong className="text-orange-400">{data.summary.quantum_vulnerable} quantum-vulnerable</strong> algorithms susceptible to Shor's Algorithm.
          </p>
        </div>
      </div>

      {/* Findings Table */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-900/60 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-slate-200">
            <FileCode className="w-5 h-5 text-indigo-400" />
            <span>Cryptographic Inventory & Analysis</span>
          </div>
          <div className="flex gap-2 text-xs">
            {['ALL', 'CRITICAL', 'QUANTUM_VULNERABLE', 'SAFE'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  filter === type ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-5 py-3">File Location</th>
                <th className="px-5 py-3">Algorithm</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Risk Severity</th>
                <th className="px-5 py-3">Code Snippet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredFindings.map((finding, idx) => (
                <tr key={idx} className="hover:bg-slate-700/30 transition">
                  <td className="px-5 py-3.5 font-mono text-xs text-indigo-300">
                    {finding.file}:{finding.line}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-white">{finding.algorithm}</td>
                  <td className="px-5 py-3.5 text-slate-400">{finding.category}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      finding.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      finding.severity === 'QUANTUM_VULNERABLE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {finding.severity.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-300 bg-slate-900/40 rounded max-w-xs truncate">
                    {finding.snippet}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}