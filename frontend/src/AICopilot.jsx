import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, AlertTriangle, Code2, Send, Terminal } from 'lucide-react';

export default function AICopilot({ initialFinding }) {
  const [targetAlgo, setTargetAlgo] = useState(
  initialFinding?.algorithm || initialFinding?.algo || 'RSA-1024'
);
  const [targetFile, setTargetFile] = useState(
  initialFinding?.file || 'src/auth/login.js'
);

const [targetCode, setTargetCode] = useState(
  initialFinding?.code_context ||
  initialFinding?.code ||
  ''
);
  const [loading, setLoading] = useState(false);
  const [remediationData, setRemediationData] = useState(null);
  
  const [chatMessages, setChatMessages] = useState([]);
  const [inputQuestion, setInputQuestion] = useState('');

  const fetchRemediation = async (algo, file, codeContext = '') => {
  setLoading(true);

  try {
    const response = await fetch(
      'http://127.0.0.1:8000/api/remediate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          algo,
          file,
          code_context: codeContext,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.detail || 'AI remediation failed.'
      );
    }

    setRemediationData(data);

    setChatMessages([
      {
        role: 'assistant',
        text: `I've analyzed **${algo}** in \`${file}\`. Here is the NIST-compliant migration path.`,
      },
    ]);
  } catch (err) {
    console.error('Remediation Error:', err);

    setRemediationData(null);

    setChatMessages([
      {
        role: 'assistant',
        text: 'Unable to generate AI remediation. Make sure Ollama and the FastAPI backend are running.',
      },
    ]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
  if (initialFinding) {
    const algo =
      initialFinding.algorithm ||
      initialFinding.algo ||
      'RSA-1024';

    const file =
      initialFinding.file ||
      'unknown';

    const code =
      initialFinding.code_context ||
      initialFinding.code ||
      '';

    setTargetAlgo(algo);
    setTargetFile(file);
    setTargetCode(code);

    fetchRemediation(algo, file, code);
  } else {
    fetchRemediation(
      'RSA-1024',
      'src/auth/login.js',
      ''
    );
  }
}, [initialFinding]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputQuestion.trim()) return;

    const userText = inputQuestion;
    setInputQuestion('');
    
    // Add user question to UI
    setChatMessages((prev) => [...prev, { role: 'user', text: userText }]);

    try {
      // Send the question to your FastAPI backend
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userText,
          algo: targetAlgo || 'Cryptography'
        }),
      });

      const data = await response.json();

      // Add the live AI response to the chat UI
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.reply },
      ]);

    } catch (error) {
      console.error("Chat Error:", error);
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: "Connection error: Make sure your Python FastAPI server is running." },
      ]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full pb-10">
      {/* LEFT: Remediation Details & Code Diff */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {targetAlgo} Remediation
                </h2>
                <p className="text-slate-400 font-mono text-sm">{targetFile}</p>
              </div>
            </div>
            <button
              onClick={() =>
  fetchRemediation(
    targetAlgo,
    targetFile,
    targetCode
  )
}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              {loading ? 'Analyzing...' : 'Re-Analyze'}
            </button>
          </div>
        </div>

        {remediationData && (
          <>
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-red-400 flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4" /> FIPS/NIST Risk Assessment
                </h3>
                <p className="text-slate-300 leading-relaxed text-sm bg-[#0a0f16] p-4 rounded-lg border border-slate-800/80">
                  {remediationData.explanation}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4" /> Recommended Migration Path
                </h3>
                <p className="text-slate-300 leading-relaxed text-sm bg-[#0a0f16] p-4 rounded-lg border border-slate-800/80">
                  {remediationData.fix}
                </p>
              </div>
            </div>
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
                <Code2 className="w-4 h-4 text-orange-400" /> Automated Code Fix
              </h3>
              <pre className="bg-[#0a0f16] text-emerald-300 font-mono text-sm p-4 rounded-lg border border-slate-800/80 overflow-x-auto whitespace-pre-wrap">
  {typeof remediationData.codeSnippet === 'string'
    ? remediationData.codeSnippet
    : remediationData.codeSnippet?.insecure ||
      remediationData.codeSnippet?.secure
      ? `// ❌ Insecure Code\n${remediationData.codeSnippet.insecure || ''}\n\n// ✅ Secure Replacement\n${remediationData.codeSnippet.secure || ''}`
      : JSON.stringify(remediationData.codeSnippet, null, 2)}
</pre>
            </div>
          </>
        )}
      </div>

      {/* RIGHT: Interactive Copilot Chat */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl flex flex-col h-[650px]">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-orange-400" />
          <h3 className="text-white font-semibold text-sm">Remediation Copilot</h3>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-sm">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-xl max-w-[90%] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-orange-500/20 text-orange-200 ml-auto border border-orange-500/30'
                  : 'bg-[#0a0f16] text-slate-300 border border-slate-800'
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            placeholder="Ask follow-up questions..."
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            className="flex-1 bg-[#0a0f16] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
          />
          <button type="submit" className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}