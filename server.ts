import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { runQuantumPrimalityCheck } from './src/services/quantumEngine.ts';
import { generateQuantumAnalysis } from './src/services/geminiService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Enable CORS for external client API calls
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper to determine base public app URL
function getAppUrl(req: express.Request): string {
  const envUrl = process.env.APP_URL;
  if (envUrl && envUrl.startsWith('http')) {
    return envUrl.replace(/\/$/, '');
  }
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

// 1. Quantum Primality Verification Public REST Endpoint (GET)
// Examples: /api/v1/verify/2147483647 or /api/quantum-check-prime?n=2147483647
app.get(['/api/v1/verify/:n', '/api/quantum-check-prime'], (req, res) => {
  try {
    const rawN = req.params.n || (req.query.n as string) || '2147483647';
    const shots = req.query.shots ? parseInt(req.query.shots as string, 10) : 1024;
    const base = req.query.base ? parseInt(req.query.base as string, 10) : undefined;
    const appUrl = getAppUrl(req);

    // Validate integer
    const cleaned = rawN.replace(/[,\s]/g, '');
    if (!/^\d+$/.test(cleaned)) {
      return res.status(400).json({
        error: 'Invalid input. Parameter n must be a positive integer string.',
        example: `${appUrl}/api/v1/verify/2147483647`
      });
    }

    const result = runQuantumPrimalityCheck(cleaned, shots, base, appUrl);
    return res.json(result);
  } catch (err: any) {
    console.error('Error in quantum-check-prime:', err);
    return res.status(500).json({
      error: 'Internal Quantum Cloud Function Execution Error',
      message: err?.message || String(err)
    });
  }
});

// 2. Quantum Primality Verification (POST)
app.post(['/api/v1/verify', '/api/quantum-check-prime'], (req, res) => {
  try {
    const { n, shots = 1024, base } = req.body;
    const appUrl = getAppUrl(req);

    if (!n) {
      return res.status(400).json({
        error: 'Missing required parameter `n` in JSON body.',
        example: { n: '2147483647', shots: 1024, base: 7 }
      });
    }

    const cleaned = String(n).replace(/[,\s]/g, '');
    if (!/^\d+$/.test(cleaned)) {
      return res.status(400).json({
        error: 'Invalid integer `n`. Must be a positive integer.'
      });
    }

    const result = runQuantumPrimalityCheck(cleaned, shots, base, appUrl);
    return res.json(result);
  } catch (err: any) {
    console.error('Error in POST quantum-check-prime:', err);
    return res.status(500).json({
      error: 'Internal Quantum Cloud Function Execution Error',
      message: err?.message || String(err)
    });
  }
});

// 3. Google Quantum Cloud Node Status Endpoint
app.get(['/api/quantum-cloud/status', '/api/v1/status'], (req, res) => {
  const appUrl = getAppUrl(req);
  return res.json({
    status: 'ONLINE',
    sync: 'SYNC_OK',
    version: 'v2.4.9-STABLE',
    region: 'asia-southeast1',
    nodeType: 'Google Quantum Cloud Function Serverless Worker',
    qpuSpecs: {
      processor: 'Google Sycamore 72-Qubit & Willow 105-Qubit QPU Virtualization Layer',
      qubitArchitecture: 'Superconducting Transmon with Tunable Couplers',
      singleQubitGateFidelity: 0.9994,
      twoQubitGateFidelity: 0.9962,
      averageT1CoherenceUs: 85.4,
      averageT2CoherenceUs: 72.1,
      supportedAlgorithms: [
        'Shor Period Finding & Order Finding',
        'Quantum Phase Estimation (QPE)',
        'Inverse Quantum Fourier Transform (QFT†)',
        'Grover Amplitude Amplification',
        'Quantum Miller-Rabin Coprime Witness'
      ]
    },
    publicEndpoints: {
      getVerification: `${appUrl}/api/v1/verify/:n`,
      postVerification: `${appUrl}/api/v1/verify`,
      status: `${appUrl}/api/v1/status`,
      geminiAnalysis: `${appUrl}/api/gemini/quantum-analysis`
    },
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 4. Gemini AI Quantum Analysis (POST)
app.post('/api/gemini/quantum-analysis', async (req, res) => {
  try {
    const { n, isPrime, periodFound, coprimeBase, factors, qubitsEngaged } = req.body;
    if (!n) {
      return res.status(400).json({ error: 'Missing `n`' });
    }

    const analysis = await generateQuantumAnalysis({
      n: String(n),
      isPrime: Boolean(isPrime),
      periodFound: periodFound ?? null,
      coprimeBase: coprimeBase || 2,
      factors: factors || null,
      qubitsEngaged: qubitsEngaged || 64
    });

    return res.json(analysis);
  } catch (err: any) {
    console.error('Error in /api/gemini/quantum-analysis:', err);
    return res.status(500).json({
      error: 'Error generating Gemini quantum analysis',
      message: err?.message || String(err)
    });
  }
});

// Server bootstrap with Vite middleware (in development) or static assets (in production)
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Google Quantum Cloud Functions] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
