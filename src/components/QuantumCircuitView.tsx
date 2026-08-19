import React, { useState } from 'react';
import { CircuitGate } from '../services/quantumEngine';
import { Cpu, Play, FastForward, CheckCircle2 } from 'lucide-react';

interface QuantumCircuitViewProps {
  gates: CircuitGate[];
  controlQubits: number;
  targetQubits: number;
  coprimeBase: number;
  n: string;
}

export const QuantumCircuitView: React.FC<QuantumCircuitViewProps> = ({
  controlQubits,
  targetQubits,
  coprimeBase,
  n
}) => {
  const [activeStep, setActiveStep] = useState<number>(4);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Number of visible wires
  const displayControl = Math.min(controlQubits, 4);
  const displayTarget = Math.min(targetQubits, 2);
  const totalWires = displayControl + displayTarget;

  const circuitSteps = [
    { title: 'Ground State |0⟩', desc: 'Initialize counting qubits in |0⟩ and target in |1⟩' },
    { title: 'Hadamard Wall (H^⊗t)', desc: 'Parallel Hadamard transformations on control register' },
    { title: `Modular Exponentiation U_${coprimeBase}^(2^j)`, desc: `Entangled modular multiplication modulo N=${n}` },
    { title: 'Inverse QFT (QFT†)', desc: 'Controlled phase rotation ladder to extract periodic interference' },
    { title: 'Measurement ⟨M_z⟩', desc: 'Collapse counting statevector into computational phase measurement' }
  ];

  const handlePlaySimulation = () => {
    setIsPlaying(true);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= circuitSteps.length) {
        clearInterval(interval);
        setIsPlaying(false);
        setActiveStep(circuitSteps.length - 1);
      } else {
        setActiveStep(step);
      }
    }, 900);
  };

  return (
    <div id="quantum-circuit-view" className="p-4 bg-[#0a0f1a]/80 border border-white/10 rounded-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Cpu className="w-3 h-3 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              Shor's Circuit Architecture
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                {controlQubits + targetQubits} Qubits
              </span>
            </h3>
          </div>
        </div>

        {/* Step Controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-play-circuit"
            onClick={handlePlaySimulation}
            disabled={isPlaying}
            className="flex items-center gap-1 px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-[10px] font-medium rounded transition-colors disabled:opacity-50"
          >
            <Play className={`w-3 h-3 ${isPlaying ? 'animate-spin' : ''}`} />
            {isPlaying ? 'Simulating...' : 'Run Simulation'}
          </button>
          <div className="flex gap-1">
            {circuitSteps.map((_, idx) => (
              <button
                key={idx}
                id={`btn-circuit-step-${idx}`}
                onClick={() => setActiveStep(idx)}
                className={`w-5 h-5 rounded text-[10px] font-mono transition-all ${
                  activeStep === idx
                    ? 'bg-cyan-400 text-black font-bold shadow-[0_0_6px_rgba(34,211,238,0.5)]'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Stage Banner */}
      <div className="mb-3 p-2 bg-cyan-950/30 border border-cyan-500/30 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">
            Stage {activeStep + 1}: {circuitSteps[activeStep].title}
          </span>
        </div>
        <span className="text-[10px] text-slate-300 font-mono hidden sm:inline">
          {circuitSteps[activeStep].desc}
        </span>
      </div>

      {/* Quantum Circuit Canvas SVG */}
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[550px] p-2 bg-[#030712]/90 rounded-lg border border-white/5 relative">
          <svg className="w-full h-[180px]" viewBox="0 0 700 240">
            <defs>
              <linearGradient id="hadamardGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
              <linearGradient id="modExpGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#4c1d95" />
              </linearGradient>
              <linearGradient id="qftGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0891b2" />
                <stop offset="100%" stopColor="#0e7490" />
              </linearGradient>
              <linearGradient id="measureGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>

            {/* Column Guide lines & Stage markers */}
            <rect x="110" y="10" width="80" height="260" fill={activeStep >= 1 ? '#0284c7' : '#ffffff'} fillOpacity={activeStep === 1 ? '0.12' : '0.03'} rx="6" />
            <rect x="210" y="10" width="180" height="260" fill={activeStep >= 2 ? '#7c3aed' : '#ffffff'} fillOpacity={activeStep === 2 ? '0.12' : '0.03'} rx="6" />
            <rect x="410" y="10" width="160" height="260" fill={activeStep >= 3 ? '#0891b2' : '#ffffff'} fillOpacity={activeStep === 3 ? '0.12' : '0.03'} rx="6" />
            <rect x="590" y="10" width="80" height="260" fill={activeStep >= 4 ? '#10b981' : '#ffffff'} fillOpacity={activeStep === 4 ? '0.12' : '0.03'} rx="6" />

            {/* Qubit Wires */}
            {Array.from({ length: totalWires }).map((_, idx) => {
              const y = 35 + idx * 38;
              const isControl = idx < displayControl;
              return (
                <g key={idx}>
                  {/* Qubit Label */}
                  <text
                    x="15"
                    y={y + 4}
                    fill={isControl ? '#38bdf8' : '#c084fc'}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {isControl ? `|0⟩ c[${idx}]` : `|1⟩ w[${idx - displayControl}]`}
                  </text>

                  {/* Wire Line */}
                  <line
                    x1="80"
                    y1={y}
                    x2="680"
                    y2={y}
                    stroke={isControl ? '#38bdf8' : '#c084fc'}
                    strokeWidth="1.5"
                    strokeOpacity={activeStep >= 0 ? '0.7' : '0.2'}
                  />
                </g>
              );
            })}

            {/* Step 1: Hadamard Gates (H) on Control Qubits */}
            {Array.from({ length: displayControl }).map((_, idx) => {
              const y = 35 + idx * 38;
              const isActive = activeStep >= 1;
              return (
                <g key={`h-${idx}`} opacity={isActive ? 1 : 0.25}>
                  <rect x="130" y={y - 14} width="28" height="28" rx="4" fill="url(#hadamardGrad)" stroke="#38bdf8" strokeWidth="1.2" />
                  <text x="144" y={y + 4} fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                    H
                  </text>
                </g>
              );
            })}

            {/* Step 2: Target Qubit X Gate */}
            {displayTarget > 0 && (
              <g opacity={activeStep >= 0 ? 1 : 0.25}>
                <rect x="90" y={35 + displayControl * 38 - 14} width="26" height="26" rx="4" fill="#6b21a8" stroke="#c084fc" strokeWidth="1.2" />
                <text x="103" y={35 + displayControl * 38 + 4} fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  X
                </text>
              </g>
            )}

            {/* Step 3: Controlled Modular Multipliers U_{a}^{2^j} */}
            {Array.from({ length: displayControl }).map((_, idx) => {
              const controlY = 35 + idx * 38;
              const targetY = 35 + displayControl * 38;
              const x = 230 + idx * 40;
              const isActive = activeStep >= 2;
              return (
                <g key={`mod-${idx}`} opacity={isActive ? 1 : 0.2}>
                  {/* Control dot */}
                  <circle cx={x} cy={controlY} r="4.5" fill="#a855f7" stroke="#ffffff" strokeWidth="1" />
                  {/* Entanglement connecting line */}
                  <line x1={x} y1={controlY} x2={x} y2={targetY} stroke="#a855f7" strokeWidth="1.5" strokeDasharray="2 2" />
                  {/* Unitary Target Box */}
                  <rect x={x - 14} y={targetY - 14} width="28" height="28" rx="4" fill="url(#modExpGrad)" stroke="#c084fc" strokeWidth="1.2" />
                  <text x={x} y={targetY + 4} fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                    U^{2 ** idx}
                  </text>
                </g>
              );
            })}

            {/* Step 4: Inverse QFT (QFT†) Block & Controlled Phases */}
            <g opacity={activeStep >= 3 ? 1 : 0.2}>
              <rect x="420" y="20" width="140" height={displayControl * 38} rx="8" fill="url(#qftGrad)" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="490" y={20 + (displayControl * 38) / 2 + 5} fill="#ffffff" fontSize="14" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                QFT † (Inverse)
              </text>
            </g>

            {/* Step 5: Measurement Meters */}
            {Array.from({ length: displayControl }).map((_, idx) => {
              const y = 35 + idx * 38;
              const isActive = activeStep >= 4;
              return (
                <g key={`m-${idx}`} opacity={isActive ? 1 : 0.25}>
                  <rect x="610" y={y - 14} width="28" height="28" rx="4" fill="url(#measureGrad)" stroke="#10b981" strokeWidth="1.2" />
                  {/* Meter Icon in SVG */}
                  <path d={`M ${616} ${y + 8} A 8 8 0 0 1 ${632} ${y + 8}`} fill="none" stroke="#10b981" strokeWidth="1.2" />
                  <line x1="624" y1={y + 8} x2="629" y2={y - 3} stroke="#10b981" strokeWidth="1.2" />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-sky-600 inline-block border border-sky-400"></span>
            <span>H: Hadamard Superposition</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-purple-700 inline-block border border-purple-400"></span>
            <span>U_a^(2^j): Modular Exponentiation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-700 inline-block border border-cyan-400"></span>
            <span>QFT†: Phase Transformation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-800 inline-block border border-emerald-400"></span>
            <span>M: Z-Basis Measurement</span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-cyan-400">
          Circuit Complexity: <strong className="text-white">O((log N)³) = {Math.round(displayControl ** 3 + 12)} gate ops</strong>
        </div>
      </div>
    </div>
  );
};
