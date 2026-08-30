import React from 'react';
import {
  GitBranch,
  Code2,
  FileCode2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

export default function ASTVisualizer({
  data,
  findings: propFindings,
}) {
  /*
   * ============================================================
   * GET FINDINGS
   * ============================================================
   *
   * Findings are passed separately from App.jsx because the
   * backend AST object may not contain the findings array.
   */

  const findings = Array.isArray(propFindings)
    ? propFindings
    : Array.isArray(data?.findings)
      ? data.findings
      : [];

  /*
   * ============================================================
   * USE REAL TREES IF BACKEND PROVIDES THEM
   *
   * Otherwise build useful AST-style branches from the
   * cryptographic findings returned by the scanner.
   * ============================================================
   */

  const backendTrees = Array.isArray(data?.trees)
    ? data.trees
    : [];

  const trees =
    backendTrees.length > 0
      ? backendTrees
      : findings.map((finding, index) => ({
          label:
            finding?.algorithm ||
            'Cryptographic API',

          line:
            finding?.line ?? '--',

          file:
            finding?.file ||
            'Unknown file',

          severity:
            finding?.severity ||
            'UNKNOWN',

          category:
            finding?.category ||
            'Cryptographic Usage',

          snippet:
            finding?.snippet ||
            '',

          children: [
            {
              label:
                finding?.algorithm ||
                'Crypto Function',

              children: [
                {
                  label:
                    finding?.snippet ||
                    `${finding?.algorithm || 'Crypto'} API call`,
                },
              ],
            },
          ],

          _index: index,
        }));

  /*
   * ============================================================
   * EMPTY STATE
   * ============================================================
   */

  if (trees.length === 0) {
    return (
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6">

        <div className="flex items-center gap-3 mb-4">

          <GitBranch className="w-5 h-5 text-orange-400" />

          <h2 className="text-xl font-bold text-white">
            AST Visualization
          </h2>

        </div>

        <p className="text-slate-500 text-sm">
          No cryptographic API usage was detected in this scan.
        </p>

      </div>
    );
  }

  /*
   * ============================================================
   * MAIN AST VISUALIZATION
   * ============================================================
   */

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-6">

      <div className="flex items-center justify-between mb-6">

        <div>

          <div className="flex items-center gap-3">

            <GitBranch className="w-5 h-5 text-orange-400" />

            <h2 className="text-xl font-bold text-white">
              AST Cryptographic Paths
            </h2>

          </div>

          <p className="text-sm text-slate-400 mt-1">
            Cryptographic branches detected from the scanned source.
          </p>

        </div>

        <span className="text-xs px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
          {trees.length} detected
        </span>

      </div>

      <div className="space-y-5">

        {trees.map((tree, index) => {

          const functionNode =
            tree?.children?.[0];

          const argumentNode =
            functionNode?.children?.[0];

          const severity =
            String(
              tree?.severity ||
              'UNKNOWN'
            ).toUpperCase();

          const isHighRisk =
            severity === 'CRITICAL' ||
            severity === 'HIGH';

          return (
            <div
              key={`${tree?.label}-${tree?.line}-${index}`}
              className="bg-[#0a0f16] border border-slate-800 rounded-xl p-5"
            >

              <div className="flex items-start justify-between mb-5">

                <div className="flex items-center gap-3">

                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isHighRisk
                        ? 'bg-red-500/10 border border-red-500/20'
                        : 'bg-emerald-500/10 border border-emerald-500/20'
                    }`}
                  >

                    {isHighRisk ? (
                      <AlertTriangle
                        className="w-5 h-5 text-red-400"
                      />
                    ) : (
                      <ShieldCheck
                        className="w-5 h-5 text-emerald-400"
                      />
                    )}

                  </div>

                  <div>

                    <div className="text-white font-bold text-lg">
                      {tree?.label || 'Cryptographic API'}
                    </div>

                    <div className="text-xs text-slate-500 mt-1">
                      {tree?.file || 'Unknown file'}
                    </div>

                  </div>

                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                    severity === 'CRITICAL'
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : severity === 'HIGH'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : severity === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : severity === 'LOW'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                  }`}
                >
                  {severity}
                </span>

              </div>

              <div className="bg-[#05080d] border border-slate-800 rounded-lg p-5 font-mono text-sm">

                <div className="flex items-center gap-2">

                  <span className="text-slate-600">
                    └──
                  </span>

                  <FileCode2 className="w-4 h-4 text-indigo-400" />

                  <span className="text-indigo-300">
                    {tree?.file || 'Unknown file'}
                  </span>

                </div>

                <div className="flex items-center gap-2 ml-8 mt-3">

                  <span className="text-slate-600">
                    └──
                  </span>

                  <span className="text-slate-400">
                    Line {tree?.line ?? '--'}
                  </span>

                </div>

                <div className="flex items-center gap-2 ml-16 mt-3">

                  <span className="text-slate-600">
                    └──
                  </span>

                  <Code2 className="w-4 h-4 text-orange-400" />

                  <span className="text-orange-400">
                    {functionNode?.label ||
                      tree?.label ||
                      'Cryptographic Function'}
                  </span>

                </div>

                <div className="flex items-start gap-2 ml-24 mt-3">

                  <span className="text-slate-600">
                    └──
                  </span>

                  <span className="text-emerald-400 break-all">

                    {argumentNode?.label ||
                      tree?.snippet ||
                      'Cryptographic API usage detected'}

                  </span>

                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">

                <div className="bg-[#111827] border border-slate-800 rounded-lg p-3">

                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Category
                  </div>

                  <div className="text-sm text-slate-300">
                    {tree?.category ||
                      'Cryptographic Usage'}
                  </div>

                </div>

                <div className="bg-[#111827] border border-slate-800 rounded-lg p-3">

                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Location
                  </div>

                  <div className="text-sm text-slate-300 font-mono break-all">
                    {tree?.file || 'Unknown'}:
                    {tree?.line ?? '--'}
                  </div>

                </div>

              </div>

            </div>
          );
        })}

      </div>

      <div className="mt-6 pt-4 border-t border-slate-800">

        <p className="text-xs text-slate-500">

          CryptoLens identified{' '}

          <span className="text-slate-300 font-semibold">
            {trees.length}
          </span>{' '}

          cryptographic usage path
          {trees.length !== 1 ? 's' : ''} in the scanned codebase.

          {backendTrees.length === 0 && (
            <>
              {' '}
              The visualization is derived from the scanner's
              cryptographic findings.
            </>
          )}

        </p>

      </div>

    </div>
  );
}
