import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import './ScanningView.css';

const STEPS = [
  { label: 'Decompressing & AST Parsing files', detail: 'Extracting source tree structure...' },
  { label: 'Auditing classical primitives against NIST SP 800-131A', detail: 'Checking RSA, DSA, SHA-1, MD5, 3DES...' },
  { label: 'Evaluating quantum vulnerability & Shor\'s algorithm risk', detail: 'Mapping asymmetric keys to quantum threat model...' },
  { label: 'Generating Post-Quantum Cryptography (PQC) remediation paths', detail: 'Consulting ML-KEM, ML-DSA, SLH-DSA migration libraries...' },
];

export default function ScanningView({ target }) {
  const [step, setStep] = useState(0);
  const [stepVisible, setStepVisible] = useState(true);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 400);

    const stepInterval = setInterval(() => {
      setStepVisible(false);
      setTimeout(() => {
        setStep(s => (s + 1) % STEPS.length);
        setStepVisible(true);
      }, 350);
    }, 2800);

    return () => { clearInterval(dotInterval); clearInterval(stepInterval); };
  }, []);

  const current = STEPS[step];

  return (
    <div className="scanning-view">
      {/* Holographic Radar Ring */}
      <div className="radar-wrap">
        {/* Outer orbit */}
        <svg className="radar-orbit orbit-1" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,69,0,0.15)" strokeWidth="1.5" strokeDasharray="8 6" />
        </svg>
        {/* Middle orbit */}
        <svg className="radar-orbit orbit-2" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="65" fill="none" stroke="rgba(239,68,68,0.25)" strokeWidth="1" strokeDasharray="4 8" />
        </svg>
        {/* Sweep line */}
        <svg className="radar-orbit radar-sweep" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="sweepGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,69,0,0)" />
              <stop offset="100%" stopColor="rgba(255,69,0,0.7)" />
            </linearGradient>
          </defs>
          <line x1="100" y1="100" x2="190" y2="100" stroke="url(#sweepGrad)" strokeWidth="2" />
        </svg>
        {/* Core icon */}
        <div className="radar-core">
          <div className="radar-core-inner">
            <ShieldAlert size={28} className="radar-core-icon" />
          </div>
          <div className="radar-ping" />
          <div className="radar-ping radar-ping--delay" />
        </div>
        {/* Dots on orbits */}
        {[30, 120, 240].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = 100 + 90 * Math.cos(rad);
          const y = 100 + 90 * Math.sin(rad);
          return (
            <svg key={i} className="radar-dot-svg" viewBox="0 0 200 200">
              <circle cx={x} cy={y} r="4" fill="var(--accent-ember)" filter="url(#glow)" />
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
            </svg>
          );
        })}
      </div>

      {/* Status Text */}
      <div className="scanning-status">
        <div className="scanning-target font-mono">{target}</div>
        <div className={`scanning-step-wrap ${stepVisible ? 'step-visible' : 'step-hidden'}`}>
          <span className="scanning-step-num font-mono">[{step + 1}/{STEPS.length}]</span>
          <span className="scanning-step-label">{current.label}{dots}</span>
        </div>
        <div className="scanning-step-detail">{current.detail}</div>
      </div>

      {/* Progress Bar */}
      <div className="scanning-progress-wrap">
        <div
          className="scanning-progress-bar"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="step-indicators">
        {STEPS.map((s, i) => (
          <div key={i} className={`step-dot ${i <= step ? 'step-dot--active' : ''} ${i === step ? 'step-dot--current' : ''}`} />
        ))}
      </div>
    </div>
  );
}
