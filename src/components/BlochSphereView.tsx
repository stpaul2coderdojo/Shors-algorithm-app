import React, { useState } from 'react';
import { QubitState } from '../services/quantumEngine';
import { Layers, RotateCcw } from 'lucide-react';

interface BlochSphereViewProps {
  qubits: QubitState[];
}

export const BlochSphereView: React.FC<BlochSphereViewProps> = ({ qubits }) => {
  const [selectedQubitIdx, setSelectedQubitIdx] = useState<number>(0);
  const [rotX, setRotX] = useState<number>(20);
  const [rotY, setRotY] = useState<number>(35);

  const activeQubit = qubits[selectedQubitIdx] || qubits[0];

  // 3D vector coordinates on unit sphere
  const theta = activeQubit ? activeQubit.theta : Math.PI / 2;
  const phi = activeQubit ? activeQubit.phi : 0;

  const vx = Math.sin(theta) * Math.cos(phi);
  const vy = Math.sin(theta) * Math.sin(phi);
  const vz = Math.cos(theta);

  // Simple 3D projection onto 2D SVG canvas
  const radX = (rotX * Math.PI) / 180;
  const radY = (rotY * Math.PI) / 180;

  const project = (x: number, y: number, z: number, scale = 90, cx = 130, cy = 130) => {
    // Rotate around Y
    const x1 = x * Math.cos(radY) + z * Math.sin(radY);
    const y1 = y;
    const z1 = -x * Math.sin(radY) + z * Math.cos(radY);

    // Rotate around X
    const x2 = x1;
    const y2 = y1 * Math.cos(radX) - z1 * Math.sin(radX);
    const z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX);

    return {
      px: cx + x2 * scale,
      py: cy - y2 * scale,
      depth: z2
    };
  };

  const center = { cx: 130, cy: 130 };
  const vecTip = project(vx, vy, vz);
  const poleNorth = project(0, 0, 1);
  const poleSouth = project(0, 0, -1);
  const axisX = project(1, 0, 0);
  const axisY = project(0, 1, 0);

  return (
    <div id="bloch-sphere-container" className="p-4 bg-[#0a0f1a]/80 border border-white/10 rounded-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-white">
            Bloch Sphere Statevector Projection
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-400 font-mono">Qubit:</span>
          <div className="flex gap-1">
            {qubits.slice(0, 6).map((q, idx) => (
              <button
                key={q.index}
                id={`btn-select-qubit-${idx}`}
                onClick={() => setSelectedQubitIdx(idx)}
                className={`px-1.5 py-0.5 text-[9px] font-mono rounded transition-all ${
                  selectedQubitIdx === idx
                    ? 'bg-cyan-500 text-black font-bold shadow-[0_0_8px_rgba(34,211,238,0.4)]'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                q[{idx}]
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* 3D SVG Bloch Sphere */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-[180px] h-[180px]">
            <svg
              className="w-full h-full cursor-grab active:cursor-grabbing"
              viewBox="0 0 260 260"
              onMouseDown={(e) => {
                const startX = e.clientX;
                const startY = e.clientY;
                const startRotX = rotX;
                const startRotY = rotY;

                const onMouseMove = (moveEvent: MouseEvent) => {
                  const dx = moveEvent.clientX - startX;
                  const dy = moveEvent.clientY - startY;
                  setRotY(startRotY + dx * 0.5);
                  setRotX(Math.max(-60, Math.min(60, startRotX - dy * 0.5)));
                };

                const onMouseUp = () => {
                  window.removeEventListener('mousemove', onMouseMove);
                  window.removeEventListener('mouseup', onMouseUp);
                };

                window.addEventListener('mousemove', onMouseMove);
                window.addEventListener('mouseup', onMouseUp);
              }}
            >
              <defs>
                <radialGradient id="sphereGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#0c4a6e" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="#1e1b4b" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#020408" stopOpacity="0.8" />
                </radialGradient>
                <linearGradient id="vectorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>

              {/* Sphere Outer Rim */}
              <circle
                cx={center.cx}
                cy={center.cy}
                r={90}
                fill="url(#sphereGrad)"
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeOpacity="0.3"
              />

              {/* Equator Ellipse */}
              <ellipse
                cx={center.cx}
                cy={center.cy}
                rx={90}
                ry={90 * Math.sin((rotX * Math.PI) / 180)}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="0.8"
                strokeDasharray="3 3"
                strokeOpacity="0.35"
              />

              {/* Coordinate Axes */}
              {/* Z Axis (|0> to |1>) */}
              <line
                x1={poleSouth.px}
                y1={poleSouth.py}
                x2={poleNorth.px}
                y2={poleNorth.py}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2 2"
                strokeOpacity="0.6"
              />
              {/* X Axis */}
              <line
                x1={center.cx}
                y1={center.cy}
                x2={axisX.px}
                y2={axisX.py}
                stroke="#e2e8f0"
                strokeWidth="0.9"
                strokeOpacity="0.4"
              />
              {/* Y Axis */}
              <line
                x1={center.cx}
                y1={center.cy}
                x2={axisY.px}
                y2={axisY.py}
                stroke="#e2e8f0"
                strokeWidth="0.9"
                strokeOpacity="0.4"
              />

              {/* Axis Labels */}
              <text x={poleNorth.px + 4} y={poleNorth.py - 6} fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">
                |0⟩ (+Z)
              </text>
              <text x={poleSouth.px + 4} y={poleSouth.py + 14} fill="#c084fc" fontSize="11" fontWeight="bold" fontFamily="monospace">
                |1⟩ (-Z)
              </text>
              <text x={axisX.px + 4} y={axisX.py + 4} fill="#94a3b8" fontSize="9" fontFamily="monospace">
                |+⟩ (+X)
              </text>
              <text x={axisY.px + 4} y={axisY.py + 4} fill="#94a3b8" fontSize="9" fontFamily="monospace">
                |+i⟩ (+Y)
              </text>

              {/* State Vector Line */}
              <line
                x1={center.cx}
                y1={center.cy}
                x2={vecTip.px}
                y2={vecTip.py}
                stroke="url(#vectorGrad)"
                strokeWidth="2.5"
              />

              {/* State Vector Tip */}
              <circle
                cx={vecTip.px}
                cy={vecTip.py}
                r={5}
                fill="#22d3ee"
                stroke="#ffffff"
                strokeWidth="1.5"
                className="animate-pulse shadow-[0_0_12px_#22d3ee]"
              />

              {/* Projected Shadow on Equator */}
              <circle
                cx={vecTip.px}
                cy={center.cy}
                r={2.5}
                fill="#a855f7"
                fillOpacity="0.6"
              />
            </svg>
            <div className="absolute bottom-1 right-1 text-[9px] text-slate-500 font-mono flex items-center gap-1">
              <RotateCcw className="w-2.5 h-2.5" /> Drag to rotate
            </div>
          </div>
        </div>

        {/* Statevector Math & Qubit Info */}
        <div className="md:col-span-7 space-y-2">
          <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>Register: <strong className="text-white font-mono">{activeQubit?.name}</strong></span>
              <span className="text-cyan-400 font-mono text-[9px] uppercase">{activeQubit?.role} Qubit</span>
            </div>
            <div className="text-xs font-mono text-cyan-300 bg-black/40 p-1.5 rounded border border-cyan-950/60 overflow-x-auto">
              |ψ⟩ = {activeQubit?.amplitude0.real.toFixed(3)}|0⟩ + ({activeQubit?.amplitude1.real.toFixed(3)} + {activeQubit?.amplitude1.imag.toFixed(3)}i)|1⟩
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-white/5 border border-white/5 rounded-lg">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Polar θ</span>
              <span className="text-[11px] font-mono text-white">{(theta * 180 / Math.PI).toFixed(1)}° ({(theta / Math.PI).toFixed(2)}π)</span>
            </div>
            <div className="p-2 bg-white/5 border border-white/5 rounded-lg">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Azimuth φ (Phase)</span>
              <span className="text-[11px] font-mono text-cyan-400">{(phi * 180 / Math.PI).toFixed(1)}° ({(phi / Math.PI).toFixed(2)}π)</span>
            </div>
          </div>

          <div className="p-2 bg-cyan-950/20 border border-cyan-500/20 rounded-lg text-[10px] text-slate-300 leading-normal">
            <div className="flex items-center gap-1 text-cyan-400 font-medium mb-0.5">
              <Layers className="w-2.5 h-2.5" /> Quantum Superposition & Phase
            </div>
            During modular exponentiation, counting qubits maintain equal superposition (θ = 90°) while encoding factors into phase angle φ.
          </div>
        </div>
      </div>
    </div>
  );
};
