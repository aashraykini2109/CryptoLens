import { useState, useEffect, useRef } from 'react';
import { Bot, Send, Copy, Check, Zap, ShieldAlert, ArrowRight, Loader2, ChevronDown } from 'lucide-react';
import './AICopilot.css';

const QUICK_PROMPTS = [
  'How do I test this migration in Node.js?',
  "Explain Shor's attack on this algorithm",
  'Show a Python implementation of the fix',
  'What is the performance overhead of the replacement?',
  'Is this FIPS 140-3 compliant after migration?',
];

/* ── Code diff renderer ── */
function CodeDiff({ code }) {
  const [copied, setCopied] = useState(false);
  const lines = (code || '').split('\n');

  const copy = () => {
    navigator.clipboard.writeText(code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-diff-wrap">
      <div className="code-diff-header">
        <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Migration Diff</span>
        <button id="copy-diff-btn" className="btn btn-ghost btn-sm copy-btn" onClick={copy}>
          {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
        </button>
      </div>
      <div className="code-block">
        {lines.map((line, i) => {
          const cls = line.startsWith('-') ? 'code-line-removed'
            : line.startsWith('+') ? 'code-line-added'
            : 'code-line-context';
          return <span key={i} className={cls}>{line || ' '}</span>;
        })}
      </div>
    </div>
  );
}

/* ── Chat bubble ── */
function ChatBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`chat-bubble ${isUser ? 'chat-bubble--user' : 'chat-bubble--bot'}`}>
      {!isUser && (
        <div className="chat-avatar">
          <Bot size={14} />
        </div>
      )}
      <div className={`chat-text ${isUser ? 'chat-text--user' : 'chat-text--bot'}`}>
        {msg.content}
      </div>
    </div>
  );
}

export default function AICopilot({ finding, onBack }) {
  const [remediation, setRemediation]   = useState(null);
  const [loadingRem,  setLoadingRem]    = useState(false);
  const [remError,    setRemError]      = useState('');

  const [messages,    setMessages]      = useState([]);
  const [chatInput,   setChatInput]     = useState('');
  const [loadingChat, setLoadingChat]   = useState(false);

  const chatEndRef = useRef(null);

  // Load remediation on mount or finding change
  useEffect(() => {
    if (!finding) return;
    setRemediation(null);
    setRemError('');
    setMessages([{
      role: 'bot',
      content: `Hello! I'm your PQC Copilot. I've loaded the analysis for **${finding.algorithm}**. Ask me anything about this vulnerability, how to migrate, or best practices.`,
    }]);
    fetchRemediation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finding?.algorithm, finding?.file]);

  const fetchRemediation = async () => {
    setLoadingRem(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/remediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algo: finding?.algorithm,
          file: finding?.file,
          code_context: finding?.context,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRemediation(data);
    } catch (err) {
      setRemError(err.message || 'Failed to load remediation. Is the backend running?');
      // Use mock data for demonstration
      setRemediation(getMockRemediation(finding));
    } finally {
      setLoadingRem(false);
    }
  };

  const sendChat = async (question) => {
    const q = question || chatInput.trim();
    if (!q) return;
    setChatInput('');
    setMessages(m => [...m, { role: 'user', content: q }]);
    setLoadingChat(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, algo: finding?.algorithm }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages(m => [...m, { role: 'bot', content: data.response || data.answer || 'No response.' }]);
    } catch {
      setMessages(m => [...m, { role: 'bot', content: getMockChatResponse(q, finding?.algorithm) }]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingChat]);

  if (!finding) {
    return (
      <div className="copilot-empty">
        <Bot size={44} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
        <p>Select a finding from the Vulnerability tab to get AI-powered remediation.</p>
        <button id="go-to-findings-btn" className="btn btn-ghost" onClick={onBack}>
          <ArrowRight size={15} /> View Findings
        </button>
      </div>
    );
  }

  const rem = remediation;

  return (
    <div className="copilot-layout">
      {/* ── Left Panel ── */}
      <div className="copilot-left scroll-panel">
        {/* Finding Header */}
        <div className="copilot-finding-header">
          <ShieldAlert size={16} style={{ color: 'var(--accent-ember)' }} />
          <div>
            <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {finding.algorithm}
            </div>
            <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-mono)' }}>
              {finding.file}{finding.line ? `:${finding.line}` : ''}
            </div>
          </div>
        </div>

        {loadingRem ? (
          <div className="copilot-loading">
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent-ember)' }} />
            <span>Loading remediation analysis...</span>
          </div>
        ) : (
          <>
            {remError && <div className="copilot-error">{remError} (Showing demo data)</div>}

            {/* Risk Assessment */}
            {rem && (
              <>
                <div className="card copilot-section">
                  <div className="copilot-section-title">
                    <Zap size={14} style={{ color: 'var(--accent-amber)' }} />
                    Risk Assessment
                  </div>
                  <div className="risk-pills">
                    <div className="risk-pill risk-pill--nist">
                      <span className="risk-pill-label">NIST Status</span>
                      <span className="risk-pill-value">{rem.nistStatus || 'Deprecated'}</span>
                    </div>
                    <div className="risk-pill risk-pill--quantum">
                      <span className="risk-pill-label">Quantum Risk</span>
                      <span className="risk-pill-value">{rem.quantumRisk || 'Critical'}</span>
                    </div>
                    <div className="risk-pill risk-pill--deadline">
                      <span className="risk-pill-label">Sunset Date</span>
                      <span className="risk-pill-value">{rem.sunsetDate || '2025'}</span>
                    </div>
                  </div>
                  <p className="copilot-section-body">{rem.riskDescription || `${finding.algorithm} is deprecated under NIST SP 800-131A and vulnerable to quantum attacks. Immediate migration recommended.`}</p>
                </div>

                {/* Migration Path */}
                <div className="card copilot-section">
                  <div className="copilot-section-title">
                    <ArrowRight size={14} style={{ color: '#4ADE80' }} />
                    Recommended Migration Path
                  </div>
                  <div className="migration-path">
                    <div className="migration-from font-mono">{finding.algorithm}</div>
                    <div className="migration-arrow">
                      <ArrowRight size={16} style={{ color: 'var(--accent-ember)' }} />
                    </div>
                    <div className="migration-to font-mono">{rem.migrateTo || 'ML-KEM-768'}</div>
                  </div>
                  <p className="copilot-section-body">{rem.migrationReason || 'ML-KEM-768 (FIPS 203) provides equivalent security with post-quantum resistance against Shor\'s algorithm.'}</p>
                </div>

                {/* Code Diff */}
                <div className="card copilot-section">
                  <div className="copilot-section-title">
                    <Copy size={14} style={{ color: 'var(--accent-ember)' }} />
                    Code Migration
                  </div>
                  <CodeDiff code={rem.codeDiff || getDefaultDiff(finding)} />
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* ── Right Panel: Chat ── */}
      <div className="copilot-right">
        <div className="copilot-chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="chat-bot-avatar"><Bot size={16} /></div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>PQC Copilot</div>
              <div style={{ fontSize: '0.7rem', color: '#4ADE80', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', display: 'inline-block', boxShadow: '0 0 6px #4ADE80' }} />
                Online
              </div>
            </div>
          </div>
        </div>

        <div className="copilot-chat-messages scroll-panel">
          {messages.map((m, i) => <ChatBubble key={i} msg={m} />)}
          {loadingChat && (
            <div className="chat-bubble chat-bubble--bot">
              <div className="chat-avatar"><Bot size={14} /></div>
              <div className="chat-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="copilot-quick-prompts">
          {QUICK_PROMPTS.map((p, i) => (
            <button
              key={i}
              id={`quick-prompt-${i}`}
              className="quick-prompt-pill"
              onClick={() => sendChat(p)}
              disabled={loadingChat}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <form
          className="copilot-input-bar"
          onSubmit={(e) => { e.preventDefault(); sendChat(); }}
        >
          <input
            id="copilot-chat-input"
            className="input copilot-chat-input"
            type="text"
            placeholder="Ask about this vulnerability, migration, or best practices..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            disabled={loadingChat}
          />
          <button
            id="copilot-send-btn"
            type="submit"
            className="btn btn-primary copilot-send-btn"
            disabled={loadingChat || !chatInput.trim()}
          >
            {loadingChat ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Mock data helpers ── */
function getMockRemediation(finding) {
  const algo = finding?.algorithm || 'RSA-2048';
  const migrations = {
    'RSA-1024': { migrateTo: 'ML-KEM-768', nistStatus: 'Disallowed (2024)', quantumRisk: 'Critical', sunsetDate: '2023' },
    'RSA-2048': { migrateTo: 'ML-KEM-1024', nistStatus: 'Deprecated (2030)', quantumRisk: 'High', sunsetDate: '2030' },
    'SHA-1':    { migrateTo: 'SHA-3-256',   nistStatus: 'Disallowed (2014)', quantumRisk: 'Medium', sunsetDate: '2014' },
    'MD5':      { migrateTo: 'SHA-3-512',   nistStatus: 'Disallowed',        quantumRisk: 'High',   sunsetDate: '2009' },
    'ECDH-P256':{ migrateTo: 'ML-KEM-768',  nistStatus: 'Transitioning',     quantumRisk: 'High',   sunsetDate: '2035' },
  };
  const m = migrations[algo] || { migrateTo: 'ML-KEM-768', nistStatus: 'Deprecated', quantumRisk: 'High', sunsetDate: '2030' };
  return {
    ...m,
    riskDescription: `${algo} is deprecated under NIST SP 800-131A Rev2. A cryptographically-relevant quantum computer (CRQC) running Shor's algorithm can break the underlying mathematical hardness assumption in polynomial time. Migration to NIST FIPS 203 (ML-KEM) is mandated for federal systems.`,
    migrationReason: `${m.migrateTo} (NIST FIPS 203) is a Module-Lattice Key Encapsulation Mechanism with 128-bit post-quantum security. It is a drop-in replacement for RSA-based key exchange with comparable performance on modern hardware.`,
    codeDiff: getDefaultDiff(finding),
  };
}

function getDefaultDiff(finding) {
  const algo = finding?.algorithm || 'RSA';
  if (algo.includes('RSA')) return `- // Legacy RSA Key Exchange
- const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
-   modulusLength: 1024,
-   publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
-   privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
- });
- const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(secret));

+ // Post-Quantum ML-KEM-768 (NIST FIPS 203)
+ import { ml_kem768 } from '@noble/post-quantum/ml-kem';
+ const { secretKey, publicKey } = ml_kem768.keygen();
+ const { cipherText, sharedSecret } = ml_kem768.encapsulate(publicKey);
+ // sharedSecret is the derived key (no separate encrypt needed)`;

  if (algo.includes('SHA-1')) return `- // Deprecated SHA-1 hash
- const hash = crypto.createHash('sha1').update(data).digest('hex');

+ // SHA-3-256 (NIST FIPS 202 - Quantum-resistant)
+ const hash = crypto.createHash('sha3-256').update(data).digest('hex');`;

  if (algo.includes('MD5')) return `- // Broken MD5 hash
- import hashlib
- digest = hashlib.md5(data).hexdigest()

+ # SHA3-512 replacement (collision-resistant, quantum-safe)
+ import hashlib
+ digest = hashlib.sha3_512(data).hexdigest()`;

  return `- // ${algo} - Deprecated/Vulnerable
- const legacy = useLegacyCrypto('${algo}');

+ // ML-KEM-768 - NIST FIPS 203 Approved
+ import { ml_kem768 } from '@noble/post-quantum/ml-kem';
+ const { secretKey, publicKey } = ml_kem768.keygen();`;
}

function getMockChatResponse(question, algo) {
  const q = question.toLowerCase();
  if (q.includes('node')) return `In Node.js, you can use the \`@noble/post-quantum\` library (v1.0+) which provides pure-JS implementations of ML-KEM, ML-DSA and SLH-DSA. Install with \`npm install @noble/post-quantum\`. The API is straightforward: generate a keypair, encapsulate a shared secret, and derive a symmetric key using HKDF.`;
  if (q.includes("shor")) return `Shor's algorithm (1994) runs on a quantum computer and factors large integers in O((log N)³) time — breaking RSA — and also solves discrete logarithm problems, breaking ECDH/ECDSA. A CRQC with ~4000 logical qubits could break RSA-2048. ${algo} uses asymmetric math that Shor's directly targets. ML-KEM relies on Module-LWE (Learning With Errors), which has no known quantum speedup.`;
  if (q.includes('python')) return `In Python, use the \`pyca/cryptography\` library (v43+) or \`liboqs-python\` bindings:\n\n\`\`\`python\nfrom oqs import KeyEncapsulation\nkem = KeyEncapsulation('ML-KEM-768')\npublic_key = kem.generate_keypair()\nciphertext, shared_secret_enc = kem.encap_secret(public_key)\n\`\`\``;
  if (q.includes('performance')) return `ML-KEM-768 key generation is ~4x faster than RSA-2048. Encapsulation/decapsulation together take ~0.1ms on modern hardware vs ~5ms for RSA-2048. The public key is 1184 bytes (vs RSA's 256 bytes), but this is an acceptable trade-off for quantum resistance.`;
  if (q.includes('fips')) return `Yes. ML-KEM is standardized as NIST FIPS 203 (August 2024). Using ML-KEM-768 ensures compliance with FIPS 140-3 requirements. CMVP validation certificates for hardware modules supporting ML-KEM are being issued. For software, using a FIPS-validated library implementation is required.`;
  return `Great question about ${algo}! Post-quantum cryptography migration is critical for long-term security. The key principle is "harvest now, decrypt later" — adversaries may be collecting encrypted data today to decrypt once quantum computers become powerful enough. I recommend reviewing the NIST PQC documentation and the migration guide at csrc.nist.gov for detailed implementation guidance.`;
}
