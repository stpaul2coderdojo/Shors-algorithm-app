import React, { useState } from 'react';
import { Terminal, Copy, Check, ExternalLink, Code2, Globe } from 'lucide-react';

interface ApiDocsModalProps {
  publicUrl: string;
  n: string;
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ publicUrl, n, onClose }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'curl' | 'python' | 'node' | 'json'>('curl');

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const curlSnippet = `curl -X GET "${publicUrl}" \\
  -H "Accept: application/json"`;

  const pythonSnippet = `import requests

# Google Cloud Quantum Functions Primality API
endpoint = "${publicUrl}"
response = requests.get(endpoint)
data = response.json()

print(f"Number: {data['n']}")
print(f"Status: {data['status']}")
print(f"Qubits: {data['quantumMetrics']['qubitsEngaged']}")
print(f"Execution Time: {data['computationTimeMs']} ms")`;

  const nodeSnippet = `// Node.js Fetch Quantum Primality Verifier
async function checkQuantumPrime(n) {
  const res = await fetch(\`${publicUrl}\`);
  const data = await res.json();
  console.log(\`Primality Status: \${data.status}\`);
  console.log(\`QPU Gate Depth: \${data.quantumMetrics.circuitDepth}\`);
  return data;
}

checkQuantumPrime("${n}");`;

  const jsonSnippet = `{
  "n": "${n}",
  "numericN": ${Number(n) > 0 && Number(n) < 1e12 ? n : `"${n}"`},
  "isPrime": true,
  "confidence": 0.99999,
  "status": "PRIME",
  "computationTimeMs": 14.2,
  "algorithmUsed": "Google Quantum Phase Estimation & Shor's Order Finding Subroutine",
  "coprimeBase": 7,
  "periodFound": ${n === '2147483647' ? '2147483646' : '6'},
  "factors": null,
  "quantumMetrics": {
    "qubitsEngaged": 64,
    "controlQubits": 32,
    "targetQubits": 32,
    "circuitDepth": 1024,
    "quantumGateCount": 2450,
    "entanglementEntropy": 0.962,
    "quantumFidelity": 0.9984,
    "qpuArchitecture": "Google Sycamore 72-Qubit / Willow 105-Qubit QPU"
  },
  "publicEndpoint": "${publicUrl}",
  "timestamp": "${new Date().toISOString()}"
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        id="api-docs-modal"
        className="w-full max-w-2xl bg-[#0a0f1a] border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(34,211,238,0.15)] flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
              <Globe className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Public Quantum Cloud Function REST API
              </h2>
              <p className="text-xs text-slate-400">
                Direct programmatic access to Google Quantum primality verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm px-3 py-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Public Endpoint URL Box */}
        <div className="mt-4 p-3.5 bg-black/60 rounded-xl border border-cyan-500/30 flex items-center justify-between gap-3">
          <div className="flex-1 overflow-hidden">
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest block font-bold mb-0.5">
              Live Public Endpoint URL (GET / POST)
            </span>
            <code className="text-xs text-cyan-300 font-mono break-all select-all">
              {publicUrl}
            </code>
          </div>
          <div className="flex gap-2">
            <button
              id="btn-copy-public-url"
              onClick={() => copyToClipboard(publicUrl, 'url')}
              className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-colors shadow-[0_0_12px_rgba(8,145,178,0.4)]"
            >
              {copiedType === 'url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedType === 'url' ? 'Copied' : 'Copy URL'}
            </button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open
            </a>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="flex gap-2 mt-5 border-b border-white/5 pb-2">
          {[
            { id: 'curl', label: 'cURL', icon: Terminal },
            { id: 'python', label: 'Python', icon: Code2 },
            { id: 'node', label: 'Node.js', icon: Code2 },
            { id: 'json', label: 'JSON Schema', icon: Globe }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code Snippet Box */}
        <div className="mt-3 flex-1 overflow-y-auto bg-black/80 p-4 rounded-xl border border-white/5 font-mono text-xs text-slate-300 relative group">
          <button
            onClick={() => {
              const textMap = {
                curl: curlSnippet,
                python: pythonSnippet,
                node: nodeSnippet,
                json: jsonSnippet
              };
              copyToClipboard(textMap[activeTab], activeTab);
            }}
            className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] rounded transition-colors"
          >
            {copiedType === activeTab ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            {copiedType === activeTab ? 'Copied' : 'Copy'}
          </button>
          <pre className="whitespace-pre-wrap">
            {activeTab === 'curl' && curlSnippet}
            {activeTab === 'python' && pythonSnippet}
            {activeTab === 'node' && nodeSnippet}
            {activeTab === 'json' && jsonSnippet}
          </pre>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Rate Limit: Unlimited // Authenticated via Google Cloud Functions</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
