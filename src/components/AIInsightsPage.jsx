import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle, Code2, Send, Loader2, Copy, Check, RotateCcw, Zap } from 'lucide-react';
import './AIInsightsPage.css';

/* ── Mock data helpers ── */
function getMockRemediation(finding) {
  const algo = finding?.algorithm || 'RSA-1024';
  const MAP = {
    'RSA-1024': {
      nistRisk: `RSA-1024 is considered insecure because its 1024-bit modulus provides insufficient security against modern classical factorization attacks. RSA security relies on the difficulty of factoring large integers. RSA is also vulnerable to sufficiently capable quantum computers because Shor's algorithm can efficiently factor large integers.`,
      migration: `For classical RSA deployments, migrate RSA-1024 to at least RSA-2048, with RSA-3072 or RSA-4096 providing a stronger classical security margin where appropriate. Increasing the RSA key size improves classical security but does NOT make RSA post-quantum secure. For long-term post-quantum readiness, evaluate standardized PQC mechanisms appropriate to the use case, such as ML-KEM for key establishment or ML-DSA for digital signatures.`,
      insecure: `const crypto = require('crypto');\n\nconst keyPair = crypto.generateKeyPairSync('rsa', {\n  modulusLength: 1024,\n});`,
      insecureLabel: 'Insecure: RSA-1024',
      secure: `const secureKeyPair = crypto.generateKeyPairSync('rsa', {\n  modulusLength: 4096,\n});\n\n// RSA-4096 provides stronger classical security.\n// It does NOT make RSA post-quantum secure.`,
      secureLabel: 'Stronger classical RSA: RSA-4096',
    },
    'SHA-1': {
      nistRisk: `SHA-1 is cryptographically broken. The SHAttered collision attack (2017) demonstrated practical full collision attacks. NIST disallowed SHA-1 for digital signatures in 2014 and all applications by 2030. Its 160-bit digest is insufficient for modern security requirements.`,
      migration: `Migrate SHA-1 to SHA-256 or SHA-3-256 for digital signatures and integrity checks. For password hashing, use Argon2id or bcrypt. For post-quantum secure hashing, SHA-3 (FIPS 202) is recommended as it uses the Keccak sponge construction which has no known quantum speedup beyond Grover's algorithm.`,
      insecure: `const crypto = require('crypto');\n\n// Deprecated SHA-1\nconst hash = crypto.createHash('sha1')\n  .update(data).digest('hex');`,
      insecureLabel: 'Insecure: SHA-1',
      secure: `// SHA-3-256 (NIST FIPS 202)\nconst hash = crypto.createHash('sha3-256')\n  .update(data).digest('hex');\n\n// Quantum-resistant and collision-resistant.`,
      secureLabel: 'Secure replacement: SHA-3-256',
    },
  };
  return MAP[algo] || {
    nistRisk: `${algo} is deprecated under NIST SP 800-131A Rev2. Immediate migration to NIST FIPS 203/204/205 post-quantum algorithms is recommended.`,
    migration: `Evaluate ML-KEM-768 (FIPS 203) for key encapsulation or ML-DSA-65 (FIPS 204) for digital signatures as post-quantum drop-in replacements.`,
    insecure: `// Legacy ${algo} usage\nconst result = useLegacy('${algo}', data);`,
    insecureLabel: `Insecure: ${algo}`,
    secure: `// Post-quantum replacement\nimport { ml_kem768 } from '@noble/post-quantum/ml-kem';\nconst { secretKey, publicKey } = ml_kem768.keygen();`,
    secureLabel: 'Secure: ML-KEM-768 (NIST FIPS 203)',
  };
}

function getMockChat(q, algo) {
  const lower = q.toLowerCase();
  if (lower.includes('node'))     return `In Node.js, use the \`@noble/post-quantum\` package (npm install @noble/post-quantum). It provides pure-JS implementations of ML-KEM, ML-DSA, and SLH-DSA with no native dependencies:\n\nimport { ml_kem768 } from '@noble/post-quantum/ml-kem';\nconst { secretKey, publicKey } = ml_kem768.keygen();\nconst { cipherText, sharedSecret } = ml_kem768.encapsulate(publicKey);`;
  if (lower.includes('shor'))     return `Shor's algorithm runs on a quantum computer and can factor large integers in polynomial time — directly breaking RSA, DSA, and ECDSA. It also solves discrete logarithm, breaking DH and ECDH. A CRQC with ~4,000 logical qubits could break RSA-2048. ${algo} is directly vulnerable. ML-KEM uses Module-LWE hardness, which has no known quantum speedup beyond a square-root Grover speedup.`;
  if (lower.includes('python'))   return `In Python, use the \`liboqs-python\` bindings:\n\npip install liboqs-python\n\nfrom oqs import KeyEncapsulation\nkem = KeyEncapsulation('ML-KEM-768')\npublic_key = kem.generate_keypair()\nct, ss = kem.encap_secret(public_key)`;
  if (lower.includes('fips'))     return `Yes — ML-KEM is standardized as NIST FIPS 203 (August 2024). Using ML-KEM-768 ensures FIPS 140-3 compliance for post-quantum key encapsulation. CMVP validation certificates are being issued for hardware modules. For software, use a FIPS-validated library implementation and consult NIST CMVP at csrc.nist.gov.`;
  if (lower.includes('performance')) return `ML-KEM-768 is faster than RSA-2048: keygen ~4x faster, encap+decap ~0.1ms vs ~5ms for RSA. The public key is 1184 bytes vs RSA's 256 bytes, but this is an acceptable trade-off. ML-KEM is designed for efficiency on constrained hardware too.`;
  return `Great question about ${algo}. The "harvest now, decrypt later" threat means adversaries collect encrypted traffic today to decrypt once quantum computers mature. NIST's post-quantum migration guide (NIST IR 8413) recommends completing migration to FIPS 203/204/205 by 2035 for most federal systems. I can help you plan your specific migration path.`;
}

/* ── Code block ── */
function CodeDiff({ insecure, insecureLabel, secure, secureLabel }) {
  const [copied, setCopied] = useState(false);
  const copyText = `// ❌ ${insecureLabel}\n${insecure}\n\n// ✅ ${secureLabel}\n${secure}`;
  const copy = () => { navigator.clipboard.writeText(copyText); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="ai-code-block">
      <div className="ai-code-label ai-code-label--bad">
        <span className="ai-code-x">✕</span> {insecureLabel}
      </div>
      <pre className="ai-code-pre ai-code-pre--bad">{insecure}</pre>
      <div className="ai-code-label ai-code-label--good">
        <span className="ai-code-check">■</span> {secureLabel}
      </div>
      <pre className="ai-code-pre ai-code-pre--good">{secure}</pre>
      <button id="copy-code-btn" className="ai-copy-btn" onClick={copy}>
        {copied ? <><Check size={13}/> Copied!</> : <><Copy size={13}/> Copy</>}
      </button>
    </div>
  );
}

/* ── Chat bubble ── */
function Bubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`ai-bubble ${isUser ? 'ai-bubble--user' : 'ai-bubble--bot'}`}>
      <div className={`ai-bubble-text ${isUser ? 'ai-bubble-text--user' : 'ai-bubble-text--bot'}`}>
        {msg.content}
      </div>
    </div>
  );
}

export default function AIInsightsPage({ finding, onNewScan }) {
  const rem = finding ? getMockRemediation(finding) : null;
  const [messages,  setMessages]  = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [remLoading, setRemLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!finding) return;
    setRemLoading(true);
    setMessages([{
      role: 'bot',
      content: `I've analyzed **${finding.algorithm}** in \`${finding.file || 'your codebase'}\`. Here is the NIST-compliant migration path.`,
    }]);
    // Simulate API call
    const t = setTimeout(() => setRemLoading(false), 600);
    return () => clearTimeout(t);
  }, [finding?.algorithm, finding?.file]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const sendChat = async (q) => {
    const question = q || chatInput.trim();
    if (!question) return;
    setChatInput('');
    setMessages(m => [...m, { role: 'user', content: question }]);
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, algo: finding?.algorithm }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: 'bot', content: data.response || data.answer }]);
    } catch {
      await new Promise(r => setTimeout(r, 700));
      setMessages(m => [...m, { role: 'bot', content: getMockChat(question, finding?.algorithm) }]);
    }
    setLoading(false);
  };

  if (!finding) {
    return (
      <div className="ai-root">
        <div className="ai-header">
          <div>
            <h1 className="ai-title">AI Remediation Insights</h1>
            <p className="ai-subtitle">Automated suggestions for NIST-compliant migrations.</p>
          </div>
          <button className="fp-new-btn" onClick={onNewScan}>+ Scan New Repository</button>
        </div>
        <div className="ai-empty">
          <Zap size={40} style={{ color: '#3B1616', opacity: 0.5 }} />
          <p>Select a finding from the <strong>Findings</strong> tab to view AI-powered remediation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-root">
      {/* Header */}
      <div className="ai-header">
        <div>
          <h1 className="ai-title">AI Remediation Insights</h1>
          <p className="ai-subtitle">Automated suggestions for NIST-compliant migrations.</p>
        </div>
        <button className="fp-new-btn" onClick={onNewScan}>+ Scan New Repository</button>
      </div>

      <div className="ai-layout">
        {/* ── Left Panel ── */}
        <div className="ai-left">
          {/* Finding card */}
          <div className="ai-finding-card">
            <div className="ai-finding-icon"><Zap size={18} /></div>
            <div className="ai-finding-info">
              <div className="ai-finding-name">{finding.algorithm} Remediation</div>
              <div className="ai-finding-file font-mono">{finding.file}</div>
            </div>
            <button id="re-analyze-btn" className="ai-reanalyze-btn">
              <RotateCcw size={13} /> Re-Analyze
            </button>
          </div>

          {remLoading ? (
            <div className="ai-loading"><Loader2 size={20} className="ai-spin" /> Loading analysis...</div>
          ) : rem && (
            <>
              {/* FIPS/NIST Risk */}
              <div className="ai-section">
                <div className="ai-section-title ai-section-title--warn">
                  <AlertTriangle size={14} /> FIPS/NIST RISK ASSESSMENT
                </div>
                <div className="ai-section-body">{rem.nistRisk}</div>
              </div>

              {/* Migration Path */}
              <div className="ai-section">
                <div className="ai-section-title ai-section-title--ok">
                  <CheckCircle size={14} /> RECOMMENDED MIGRATION PATH
                </div>
                <div className="ai-section-body">{rem.migration}</div>
              </div>

              {/* Code Fix */}
              <div className="ai-section">
                <div className="ai-section-title ai-section-title--code">
                  <Code2 size={14} /> AUTOMATED CODE FIX
                </div>
                <CodeDiff
                  insecure={rem.insecure}
                  insecureLabel={rem.insecureLabel}
                  secure={rem.secure}
                  secureLabel={rem.secureLabel}
                />
              </div>
            </>
          )}
        </div>

        {/* ── Right Panel: Copilot ── */}
        <div className="ai-right">
          <div className="ai-chat-header">
            <span className="ai-chat-title-icon">{'>'}_</span>
            <span className="ai-chat-title">Remediation Copilot</span>
          </div>

          <div className="ai-chat-messages">
            {messages.map((m, i) => <Bubble key={i} msg={m} />)}
            {loading && (
              <div className="ai-bubble ai-bubble--bot">
                <div className="ai-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="ai-chat-input-bar" onSubmit={e => { e.preventDefault(); sendChat(); }}>
            <input
              id="copilot-input"
              className="ai-chat-input"
              type="text"
              placeholder="Ask follow up questions..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              disabled={loading}
            />
            <button id="copilot-send" type="submit" className="ai-chat-send" disabled={loading || !chatInput.trim()}>
              {loading ? <Loader2 size={15} className="ai-spin" /> : <Send size={15} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
