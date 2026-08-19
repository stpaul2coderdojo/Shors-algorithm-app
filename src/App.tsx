/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useTransition } from 'react';
import {
  runQuantumPrimalityCheck,
  QuantumVerificationResult
} from './services/quantumEngine';
import { QuantumCircuitView } from './components/QuantumCircuitView';
import { BlochSphereView } from './components/BlochSphereView';
import { PhaseHistogram } from './components/PhaseHistogram';
import { ApiDocsModal } from './components/ApiDocsModal';
import { GeminiQuantumCopilot } from './components/GeminiQuantumCopilot';
import {
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Globe,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Code,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  const [inputVal, setInputVal] = useState<string>('2147483647');
  const [activePreset, setActivePreset] = useState<string>('Mersenne Prime (2³¹ - 1)');
  const [shots] = useState<number>(1024);
  const [activeTab, setActiveTab] = useState<'overview' | 'circuit' | 'bloch' | 'phase' | 'copilot'>('overview');
  const [showApiModal, setShowApiModal] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [isCustomEditing, setIsCustomEditing] = useState<boolean>(false);

  const [, startTransition] = useTransition();

  // Presets
  const presets = [
    { label: 'Mersenne (2³¹ - 1)', value: '2147483647' },
    { label: 'Fermat (65537)', value: '65537' },
    { label: 'Shor (15 = 3×5)', value: '15' },
    { label: 'RSA (221 = 13×17)', value: '221' },
    { label: 'Mersenne (524287)', value: '524287' },
    { label: 'Carmichael (561)', value: '561' },
    { label: 'Mersenne (8191)', value: '8191' }
  ];

  // Base URL calculation for public API endpoints
  const [baseUrl, setBaseUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  // Compute quantum verification result
  const [result, setResult] = useState<QuantumVerificationResult>(() =>
    runQuantumPrimalityCheck('2147483647', 1024, undefined, typeof window !== 'undefined' ? window.location.origin : '')
  );

  const handleCompute = (val: string, shotCount = shots) => {
    const clean = val.replace(/[^\d]/g, '');
    if (!clean) return;
    startTransition(() => {
      try {
        const res = runQuantumPrimalityCheck(clean, shotCount, undefined, baseUrl);
        setResult(res);
      } catch (e) {
        console.error('Computation error:', e);
      }
    });
  };

  const handlePresetSelect = (p: typeof presets[0]) => {
    setInputVal(p.value);
    setActivePreset(p.label);
    setIsCustomEditing(false);
    handleCompute(p.value, shots);
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d]/g, '');
    setInputVal(val);
    setActivePreset('Custom Input');
  };

  const handleCustomInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCompute(inputVal, shots);
      setIsCustomEditing(false);
    }
  };

  // Debounced auto-compute when typing custom numbers
  useEffect(() => {
    if (!isCustomEditing || !inputVal) return;
    const timer = setTimeout(() => {
      handleCompute(inputVal, shots);
    }, 250);
    return () => clearTimeout(timer);
  }, [inputVal, isCustomEditing, shots]);

  const publicEndpointUrl = `${baseUrl || 'https://quantum.cloud.google'}/api/v1/verify/${result.n || '2147483647'}`;

  const copyPublicUrl = () => {
    navigator.clipboard.writeText(publicEndpointUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div
      id="app-root"
      className="h-screen w-screen max-h-screen bg-[#020408] text-[#e2e8f0] font-sans flex flex-col relative overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 25%, #1a1b3a 0%, transparent 60%), radial-gradient(circle at 10% 80%, #0c4a6e 0%, transparent 40%), radial-gradient(circle at 90% 10%, #4c1d95 0%, transparent 30%)',
      }}
    >
      {/* Background Dot-Grid Overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      ></div>

      {/* Decorative vertical energy beams */}
      <div className="absolute top-1/4 left-6 w-px h-48 bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent pointer-events-none hidden lg:block"></div>
      <div className="absolute bottom-1/4 right-6 w-px h-48 bg-gradient-to-b from-transparent via-purple-500/50 to-transparent pointer-events-none hidden lg:block"></div>

      {/* Navigation Header (Compact h-14) */}
      <nav className="h-14 px-6 flex items-center justify-between border-b border-white/5 backdrop-blur-md relative z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500/20 border border-cyan-400/30 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
              QUANTUM<span className="text-cyan-400">PRIME</span>
            </h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 mt-0.5">
              Google Cloud Quantum Functions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest hidden sm:inline">Q-Node:</span>
            <span className="text-[11px] text-green-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
              ONLINE // SYNC_OK
            </span>
          </div>
          <div className="w-[1px] h-5 bg-white/10 hidden sm:block"></div>
          <div className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-medium text-white font-mono">
            v2.4.9-STABLE
          </div>
        </div>
      </nav>

      {/* Main Screen Fitted Container */}
      <main className="flex-1 flex flex-col min-h-0 relative z-10 px-4 sm:px-6 py-2.5 max-w-6xl w-full mx-auto overflow-hidden">
        
        {/* Top Compact Section: Hero Input & Metric Cards */}
        <div className="shrink-0 space-y-2.5 mb-2">
          
          {/* Target Input Card */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
            
            <div className="relative bg-[#0a0f1a] border border-white/10 rounded-xl p-3.5 sm:p-4 flex items-center justify-between shadow-xl gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-0.5">
                  <label className="block text-[9px] text-cyan-400 uppercase tracking-[0.25em] font-bold">
                    Target Input (N)
                  </label>
                  <button
                    onClick={() => setIsCustomEditing(!isCustomEditing)}
                    className="text-[9px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-mono uppercase tracking-wider transition-colors"
                  >
                    <Sliders className="w-2.5 h-2.5" />
                    {isCustomEditing ? 'Confirm' : 'Edit'}
                  </button>
                  <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                    ({result.numericN > 0 ? BigInt(result.n).toString(2).length : 31} bits)
                  </span>
                </div>

                {isCustomEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      id="input-target-integer"
                      value={inputVal}
                      onChange={handleCustomInputChange}
                      onKeyDown={handleCustomInputKeyDown}
                      placeholder="e.g. 2147483647"
                      className="flex-1 text-2xl sm:text-3xl font-mono tracking-tighter text-white bg-black/60 border border-cyan-500/50 rounded-lg px-3 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      autoFocus
                    />
                    <button
                      id="btn-run-check"
                      onClick={() => {
                        handleCompute(inputVal, shots);
                        setIsCustomEditing(false);
                      }}
                      className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-all"
                    >
                      Run
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsCustomEditing(true)}
                    className="text-2xl sm:text-4xl font-mono tracking-tighter text-white cursor-pointer hover:text-cyan-300 transition-colors truncate select-all"
                    title="Click to edit custom integer"
                  >
                    {Number(result.n) ? Number(result.n).toLocaleString() : result.n}
                  </div>
                )}
              </div>

              {/* Status Box */}
              <div className="flex flex-col items-center justify-center px-4 py-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30 shrink-0 min-w-[130px]">
                <div
                  className={`text-xl sm:text-2xl font-bold tracking-wider ${
                    result.isPrime ? 'text-cyan-400' : 'text-amber-400'
                  }`}
                >
                  {result.status}
                </div>
                <div className="text-[9px] text-cyan-400/80 font-mono uppercase tracking-wider truncate max-w-[150px]">
                  {result.isPrime
                    ? `PROB: ${result.confidence}`
                    : result.factors
                    ? `${result.factors.p} × ${result.factors.q}`
                    : 'COMPOSITE'}
                </div>
              </div>
            </div>
          </div>

          {/* 3 Metric Cards + Benchmark Presets on Single Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
            {/* 3 Metrics (7 cols on md) */}
            <div className="md:col-span-7 grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider">Computation</p>
                <p className="text-base sm:text-lg font-mono text-white font-semibold">{result.computationTimeMs}ms</p>
              </div>

              <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider">Qubits Engaged</p>
                <p className="text-base sm:text-lg font-mono text-white font-semibold">{result.quantumMetrics.qubitsEngaged} Active</p>
              </div>

              <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider">Gate Depth</p>
                <p className="text-base sm:text-lg font-mono text-white font-semibold">{result.quantumMetrics.circuitDepth} Gates</p>
              </div>
            </div>

            {/* Presets Row (5 cols on md) */}
            <div className="md:col-span-5 flex items-center gap-1.5 overflow-x-auto p-1 bg-[#0a0f1a]/80 border border-white/5 rounded-lg">
              {presets.slice(0, 4).map((p, idx) => (
                <button
                  key={idx}
                  id={`btn-preset-${idx}`}
                  onClick={() => handlePresetSelect(p)}
                  className={`px-2 py-1 text-[10px] font-mono rounded whitespace-nowrap transition-all border ${
                    activePreset === p.label
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_8px_rgba(34,211,238,0.25)]'
                      : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex gap-1.5 border-b border-white/10 pb-1.5 overflow-x-auto">
            {[
              { id: 'overview', label: 'Verification Proof', icon: Zap },
              { id: 'circuit', label: 'Circuit & Wires', icon: Cpu },
              { id: 'bloch', label: 'Bloch Sphere 3D', icon: Layers },
              { id: 'phase', label: 'Phase Spectrum', icon: Sparkles },
              { id: 'copilot', label: 'Gemini Copilot', icon: Sparkles },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable / Screen-fitted Middle Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {/* 1. Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-2.5">
              <div className="p-4 bg-[#0a0f1a]/80 border border-white/10 rounded-xl backdrop-blur-md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Quantum Shor Subroutine & Group Order
                  </h3>
                  <span className="text-[11px] text-cyan-400 font-mono">
                    Coprime Base a = {result.coprimeBase}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                  <div className="p-2.5 bg-white/5 border border-white/5 rounded-lg space-y-0.5">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Quantum Algorithm</span>
                    <span className="text-xs font-semibold text-white">{result.algorithmUsed}</span>
                  </div>
                  <div className="p-2.5 bg-white/5 border border-white/5 rounded-lg space-y-0.5">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Quantum Order (r)</span>
                    <span className="text-xs font-mono text-cyan-300 font-bold">
                      {result.periodFound !== null
                        ? `r = ${result.periodFound}`
                        : `r divides ${BigInt(result.n) > 1n ? (BigInt(result.n) - 1n).toString() : '1'} (Euler's Totient)`}
                    </span>
                  </div>
                </div>

                {/* Mathematical Stages */}
                <div className="space-y-1.5">
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold block mb-1">
                    State Evolution (|ψ₀⟩ → |ψ_final⟩)
                  </span>
                  {result.circuitStages.slice(0, 3).map((stage, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-black/40 border border-white/5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs"
                    >
                      <div className="space-y-0.5">
                        <strong className="text-white block text-[11px] font-medium">{stage.stage}</strong>
                        <p className="text-slate-400 text-[10px]">{stage.description}</p>
                      </div>
                      <code className="text-cyan-300 font-mono text-[10px] bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-800/30 shrink-0">
                        {stage.mathNotation}
                      </code>
                    </div>
                  ))}
                </div>

                {/* Complexity Table */}
                <div className="mt-3 p-2.5 bg-cyan-950/20 border border-cyan-500/20 rounded-lg">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-1.5 bg-black/40 rounded">
                      <span className="text-[9px] text-slate-400 block">Shor (Quantum)</span>
                      <strong className="text-cyan-400 font-mono text-[11px]">{result.classicalComparison.shorQuantumComplexity}</strong>
                    </div>
                    <div className="p-1.5 bg-black/40 rounded">
                      <span className="text-[9px] text-slate-400 block">Miller-Rabin</span>
                      <strong className="text-slate-300 font-mono text-[11px]">O(k log³ N)</strong>
                    </div>
                    <div className="p-1.5 bg-black/40 rounded">
                      <span className="text-[9px] text-slate-400 block">AKS Primality</span>
                      <strong className="text-slate-300 font-mono text-[11px]">{result.classicalComparison.aksComplexity}</strong>
                    </div>
                    <div className="p-1.5 bg-black/40 rounded">
                      <span className="text-[9px] text-slate-400 block">Trial Division</span>
                      <strong className="text-slate-300 font-mono text-[11px]">{result.classicalComparison.trialDivisionComplexity}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Circuit Tab */}
          {activeTab === 'circuit' && (
            <QuantumCircuitView
              gates={result.gates}
              controlQubits={result.quantumMetrics.controlQubits}
              targetQubits={result.quantumMetrics.targetQubits}
              coprimeBase={result.coprimeBase}
              n={result.n}
            />
          )}

          {/* 3. Bloch Sphere Tab */}
          {activeTab === 'bloch' && (
            <BlochSphereView qubits={result.qubitStates} />
          )}

          {/* 4. Phase Histogram Tab */}
          {activeTab === 'phase' && (
            <PhaseHistogram
              measurements={result.measurements}
              periodFound={result.periodFound}
              coprimeBase={result.coprimeBase}
              n={result.n}
            />
          )}

          {/* 5. Gemini Copilot Tab */}
          {activeTab === 'copilot' && (
            <GeminiQuantumCopilot
              n={result.n}
              isPrime={result.isPrime}
              periodFound={result.periodFound}
              coprimeBase={result.coprimeBase}
              factors={result.factors}
              qubitsEngaged={result.quantumMetrics.qubitsEngaged}
            />
          )}
        </div>
      </main>

      {/* Screen-Fitted Footer with Public Endpoint URL (Compact h-14) */}
      <footer className="h-14 px-6 border-t border-white/5 bg-black/50 backdrop-blur-xl relative z-10 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden flex-1 max-w-xl">
          <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold shrink-0 hidden sm:inline">
            Public Endpoint:
          </span>
          <code className="text-cyan-300 text-xs font-mono bg-cyan-950/30 px-2.5 py-1 rounded border border-cyan-800/30 truncate select-all">
            {publicEndpointUrl}
          </code>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-copy-public-endpoint"
            onClick={copyPublicUrl}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(8,145,178,0.3)]"
          >
            {copiedUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copiedUrl ? 'Copied' : 'Copy URL'}
          </button>

          <button
            id="btn-open-api-docs"
            onClick={() => setShowApiModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 border border-white/20 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
          >
            <Code className="w-3 h-3" />
            API Explorer
          </button>

          <button
            id="btn-new-test"
            onClick={() => {
              setIsCustomEditing(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-transparent border border-white/20 hover:bg-white/5 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            New Test
          </button>
        </div>
      </footer>

      {/* API Explorer Modal */}
      {showApiModal && (
        <ApiDocsModal
          publicUrl={publicEndpointUrl}
          n={result.n}
          onClose={() => setShowApiModal(false)}
        />
      )}
    </div>
  );
}
