import React, { useState } from 'react';

import {
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Code2,
  ArrowRight
} from 'lucide-react';

export default function Findings({ onOpenAI }) {

  // ============================================================
  // STATE
  // ============================================================

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // ============================================================
  // FINDINGS DATA
  // ============================================================

  const findings = [
    {
      id: 1,
      title: 'Weak RSA Key Size',
      description: 'RSA-1024 is below recommended security level',
      severity: 'HIGH',
      file: 'src/auth/login.js',
      algorithm: 'RSA-1024',
      status: 'Open'
    },

    {
      id: 2,
      title: 'Deprecated Hash Algorithm',
      description: 'SHA-1 is cryptographically weak',
      severity: 'HIGH',
      file: 'src/security/hash.js',
      algorithm: 'SHA-1',
      status: 'Open'
    },

    {
      id: 3,
      title: 'Outdated OpenSSL',
      description: 'Dependency version requires upgrade',
      severity: 'MEDIUM',
      file: 'package.json',
      algorithm: 'OpenSSL',
      status: 'Review'
    },

    {
      id: 4,
      title: 'Legacy Encryption API',
      description: 'Consider migrating to a modern encryption API',
      severity: 'LOW',
      file: 'src/crypto/encrypt.js',
      algorithm: 'AES-CBC',
      status: 'Review'
    },

    {
      id: 5,
      title: 'Weak Hash Configuration',
      description: 'Legacy hashing configuration detected',
      severity: 'MEDIUM',
      file: 'src/utils/security.js',
      algorithm: 'MD5',
      status: 'Open'
    },

    {
      id: 6,
      title: 'Small DH Parameter',
      description: 'Diffie-Hellman parameter size should be increased',
      severity: 'MEDIUM',
      file: 'src/crypto/keyExchange.js',
      algorithm: 'DH-1024',
      status: 'Open'
    }
  ];

  // ============================================================
  // FILTER FINDINGS
  // ============================================================

  const filteredFindings = findings.filter((finding) => {

    const matchesSearch =
      finding.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finding.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finding.file.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finding.algorithm.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      activeFilter === 'All' ||
      finding.severity === activeFilter.toUpperCase();

    return matchesSearch && matchesFilter;
  });

  // ============================================================
  // SEVERITY ICON
  // ============================================================

  const getSeverityIcon = (severity) => {

    if (severity === 'HIGH') {
      return (
        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <ShieldAlert className="w-4 h-4 text-red-500" />
        </div>
      );
    }

    if (severity === 'MEDIUM') {
      return (
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="w-4 h-4 text-amber-500" />
        </div>
      );
    }

    return (
      <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <Code2 className="w-4 h-4 text-blue-400" />
      </div>
    );
  };

  // ============================================================
  // SEVERITY BADGE
  // ============================================================

  const getSeverityBadge = (severity) => {

    if (severity === 'HIGH') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold">
          HIGH
        </span>
      );
    }

    if (severity === 'MEDIUM') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold">
          MEDIUM
        </span>
      );
    }

    return (
      <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold">
        LOW
      </span>
    );
  };

  // ============================================================
  // STATUS
  // ============================================================

  const getStatus = (status) => {

    if (status === 'Open') {
      return (
        <span className="flex items-center gap-2 text-xs text-red-400">
          <Clock className="w-3.5 h-3.5" />
          Open
        </span>
      );
    }

    return (
      <span className="flex items-center gap-2 text-xs text-amber-400">
        <Clock className="w-3.5 h-3.5" />
        Review
      </span>
    );
  };

  // ============================================================
  // OPEN AI
  // ============================================================

  const handleOpenAI = (finding) => {

    if (onOpenAI) {
      onOpenAI(finding);
    }

  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="grid grid-cols-4 gap-4">

        {/* TOTAL */}

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">

          <div className="flex items-center justify-between mb-3">

            <span className="text-slate-400 text-sm">
              Total Findings
            </span>

            <AlertCircle className="w-5 h-5 text-slate-500" />

          </div>

          <div className="text-3xl font-bold text-white">
            20
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Across your codebase
          </p>

        </div>


        {/* HIGH */}

        <div className="bg-[#111827] border border-red-500/20 rounded-xl p-5">

          <div className="flex items-center justify-between mb-3">

            <span className="text-slate-400 text-sm">
              High Risk
            </span>

            <ShieldAlert className="w-5 h-5 text-red-500" />

          </div>

          <div className="text-3xl font-bold text-red-500">
            2
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Requires immediate attention
          </p>

        </div>


        {/* MEDIUM */}

        <div className="bg-[#111827] border border-amber-500/20 rounded-xl p-5">

          <div className="flex items-center justify-between mb-3">

            <span className="text-slate-400 text-sm">
              Medium Risk
            </span>

            <AlertCircle className="w-5 h-5 text-amber-500" />

          </div>

          <div className="text-3xl font-bold text-amber-500">
            8
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Should be reviewed
          </p>

        </div>


        {/* RESOLVED */}

        <div className="bg-[#111827] border border-emerald-500/20 rounded-xl p-5">

          <div className="flex items-center justify-between mb-3">

            <span className="text-slate-400 text-sm">
              Resolved
            </span>

            <ShieldCheck className="w-5 h-5 text-emerald-400" />

          </div>

          <div className="text-3xl font-bold text-emerald-400">
            10
          </div>

          <p className="text-xs text-slate-500 mt-2">
            No action required
          </p>

        </div>

      </div>


      {/* ======================================================
          FINDINGS TABLE CONTAINER
      ====================================================== */}

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">

        {/* ====================================================
            TABLE HEADER
        ==================================================== */}

        <div className="p-6 border-b border-slate-800">

          <div className="flex justify-between items-center mb-5">

            {/* TITLE */}

            <div>

              <h2 className="text-xl font-bold text-white">
                Cryptographic Findings
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                Detailed security issues detected across your project
              </p>

            </div>


            {/* SEARCH + FILTER */}

            <div className="flex gap-3">

              {/* SEARCH */}

              <div className="relative">

                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

                <input
                  type="text"
                  placeholder="Search findings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#0a0f16] border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500 w-56"
                />

              </div>


              {/* FILTER BUTTON */}

              <button
                className="flex items-center gap-2 px-4 py-2 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition"
              >

                <Filter className="w-4 h-4" />

                Filter

                <ChevronDown className="w-4 h-4" />

              </button>

            </div>

          </div>


          {/* ==================================================
              FILTER PILLS
          ================================================== */}

          <div className="flex gap-2">

            <button
              onClick={() => setActiveFilter('All')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                activeFilter === 'All'
                  ? 'bg-white text-black'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All (20)
            </button>


            <button
              onClick={() => setActiveFilter('High')}
              className={`px-3 py-1.5 rounded-full text-xs transition ${
                activeFilter === 'High'
                  ? 'bg-red-500 text-white'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              High (2)
            </button>


            <button
              onClick={() => setActiveFilter('Medium')}
              className={`px-3 py-1.5 rounded-full text-xs transition ${
                activeFilter === 'Medium'
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              Medium (8)
            </button>


            <button
              onClick={() => setActiveFilter('Low')}
              className={`px-3 py-1.5 rounded-full text-xs transition ${
                activeFilter === 'Low'
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              }`}
            >
              Low (10)
            </button>

          </div>

        </div>


        {/* ====================================================
            TABLE
        ==================================================== */}

        <div className="overflow-x-auto">

          <table className="w-full">

            {/* TABLE HEAD */}

            <thead>

              <tr className="border-b border-slate-800 text-left">

                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Finding
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Severity
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  File
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Algorithm
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>

                <th className="px-6 py-4">
                </th>

              </tr>

            </thead>


            {/* TABLE BODY */}

            <tbody>

              {filteredFindings.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="px-6 py-16 text-center"
                  >

                    <Search className="w-8 h-8 text-slate-600 mx-auto mb-3" />

                    <p className="text-slate-400 font-medium">
                      No findings found
                    </p>

                    <p className="text-xs text-slate-600 mt-1">
                      Try changing your search or filter
                    </p>

                  </td>

                </tr>

              ) : (

                filteredFindings.map((finding) => (

                  <tr
                    key={finding.id}
                    className="border-b border-slate-800/70 hover:bg-[#151d2c] transition"
                  >

                    {/* =================================================
                        FINDING
                    ================================================= */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        {getSeverityIcon(finding.severity)}

                        <div>

                          <div className="font-semibold text-white">
                            {finding.title}
                          </div>

                          <div className="text-xs text-slate-500 mt-1">
                            {finding.description}
                          </div>

                        </div>

                      </div>

                    </td>


                    {/* =================================================
                        SEVERITY
                    ================================================= */}

                    <td className="px-6 py-5">

                      {getSeverityBadge(finding.severity)}

                    </td>


                    {/* =================================================
                        FILE
                    ================================================= */}

                    <td className="px-6 py-5">

                      <span className="text-sm text-slate-300 font-mono">
                        {finding.file}
                      </span>

                    </td>


                    {/* =================================================
                        ALGORITHM
                    ================================================= */}

                    <td className="px-6 py-5">

                      <span className="text-sm text-slate-400">
                        {finding.algorithm}
                      </span>

                    </td>


                    {/* =================================================
                        STATUS
                    ================================================= */}

                    <td className="px-6 py-5">

                      {getStatus(finding.status)}

                    </td>


                    {/* =================================================
                        AI BUTTON
                    ================================================= */}

                    <td className="px-6 py-5">

                      <button
                        onClick={() => handleOpenAI(finding)}
                        title="View AI remediation"
                        className="text-orange-400 hover:text-orange-300 transition"
                      >

                        <ArrowRight className="w-5 h-5" />

                      </button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>


        {/* ====================================================
            TABLE FOOTER
        ==================================================== */}

        <div className="px-6 py-4 border-t border-slate-800 flex justify-between items-center">

          <span className="text-xs text-slate-500">

            Showing {filteredFindings.length} of 20 findings

          </span>


          <div className="flex gap-2">

            <button
              className="px-3 py-1.5 border border-slate-700 rounded text-xs text-slate-400 hover:bg-slate-800 transition"
            >
              Previous
            </button>


            <button
              className="px-3 py-1.5 bg-slate-800 rounded text-xs text-white"
            >
              1
            </button>


            <button
              className="px-3 py-1.5 border border-slate-700 rounded text-xs text-slate-400 hover:bg-slate-800 transition"
            >
              2
            </button>


            <button
              className="px-3 py-1.5 border border-slate-700 rounded text-xs text-slate-400 hover:bg-slate-800 transition"
            >
              Next
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}