import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { networkState } from './server/services/networkState';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '10mb' }));

  // REST API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      service: 'NetSentinel AI Operations Engine',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/kpis', (req, res) => {
    try {
      const kpis = networkState.getKpis();
      res.json(kpis);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/incidents', (req, res) => {
    try {
      const incidents = networkState.getIncidents();
      res.json(incidents);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/analyze', async (req, res) => {
    try {
      const analysis = await networkState.runLiveAnalysis();
      res.json(analysis);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/simulate-anomaly', async (req, res) => {
    try {
      const { scenario } = req.body;
      const kpis = await networkState.triggerAnomalySimulation(scenario || 'packet_loss_spike');
      res.json({ success: true, scenario, kpis });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/reset', async (req, res) => {
    try {
      const kpis = await networkState.resetToNominal();
      res.json({ success: true, kpis });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/remediate', async (req, res) => {
    try {
      const { actionId, incidentId } = req.body;
      const result = await networkState.applyRemediation(actionId, incidentId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/ingest-csv', async (req, res) => {
    try {
      const { rows } = req.body;
      const result = await networkState.ingestCSVData(rows || []);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[NetSentinel AI] Server listening on port ${PORT}`);
  });
}

startServer();
