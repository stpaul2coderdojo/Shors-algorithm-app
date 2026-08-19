import React from 'react';
import { QuantumPhaseMeasurement } from '../services/quantumEngine';
import { BarChart3, Binary, Compass } from 'lucide-react';

interface PhaseHistogramProps {
  measurements: QuantumPhaseMeasurement[];
  periodFound: number | null;
  coprimeBase: number;
  n: string;
}

export const PhaseHistogram: React.FC<PhaseHistogramProps> = ({
  measurements,
  periodFound,
  coprimeBase,
  n
}) => {
  const maxProbability = Math.max(...measurements.map(m => m.probability), 0.01);

  return (
    <div id="phase-histogram-card" className="p-4 bg-[#0a0f1a]/80 border border-white/10 rounded-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-white">
              Quantum Phase Estimation Spectrum
            </h3>
          </div>
          <p className="text-[10px] text-slate-400">
            Constructive interference peaks from QFT† register (|y⟩/2^t ≈ s/r)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-400 font-mono">Period:</span>
          <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-bold rounded">
            r = {periodFound !== null ? periodFound : `divides (${BigInt(n) > 1n ? (BigInt(n) - 1n).toString() : '1'})`}
          </span>
        </div>
      </div>

      {/* Probability Bar Chart */}
      <div className="space-y-2 mb-3">
        {measurements.map((m, idx) => {
          const barWidthPercent = Math.max(8, (m.probability / maxProbability) * 100);
          return (
            <div key={idx} className="group relative">
              <div className="flex items-center justify-between text-[11px] font-mono mb-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold w-16">{m.binary}</span>
                  <span className="text-slate-400 text-[10px]">
                    (φ = {m.phase.toFixed(3)} ≈ {m.fractionEstimate})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className="text-slate-400 font-mono text-[10px]">{m.hits} shots</span>
                  <span className="text-cyan-300 font-bold w-12 text-[11px]">
                    {(m.probability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Progress Bar with Glow */}
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-purple-500 shadow-[0_0_8px_rgba(34,211,238,0.4)] transition-all duration-700 ease-out"
                  style={{ width: `${barWidthPercent}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continued Fraction Table */}
      <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-white mb-1.5 uppercase tracking-wider">
          <Compass className="w-3 h-3 text-cyan-400" />
          Continued Fraction Convergence
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-1.5 bg-white/5 rounded border border-white/5">
            <span className="text-[9px] text-slate-400 block uppercase">Base a</span>
            <span className="font-mono text-cyan-300 font-bold text-xs">{coprimeBase}</span>
          </div>
          <div className="p-1.5 bg-white/5 rounded border border-white/5">
            <span className="text-[9px] text-slate-400 block uppercase">Fraction s/r</span>
            <span className="font-mono text-white text-xs">
              {measurements[1]?.fractionEstimate || '1/2'}
            </span>
          </div>
          <div className="p-1.5 bg-white/5 rounded border border-white/5">
            <span className="text-[9px] text-slate-400 block uppercase">Verification</span>
            <span className="font-mono text-emerald-400 text-xs">
              {coprimeBase}^{periodFound || 'r'} ≡ 1 (mod {n})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
