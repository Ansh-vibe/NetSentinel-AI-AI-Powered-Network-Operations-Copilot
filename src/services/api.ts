import { AIAnalysisResult, Incident, NetworkKPIPayload, CSVRowData } from '../types';

export const api = {
  async getKPIs(): Promise<NetworkKPIPayload> {
    const res = await fetch('/api/kpis');
    if (!res.ok) throw new Error(`Failed to fetch KPIs: ${res.statusText}`);
    return res.json();
  },

  async getIncidents(): Promise<Incident[]> {
    const res = await fetch('/api/incidents');
    if (!res.ok) throw new Error(`Failed to fetch incidents: ${res.statusText}`);
    return res.json();
  },

  async runAIAnalysis(): Promise<AIAnalysisResult> {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`AI analysis failed: ${res.statusText}`);
    return res.json();
  },

  async simulateAnomaly(scenario: string): Promise<{ success: boolean; scenario: string; kpis: NetworkKPIPayload }> {
    const res = await fetch('/api/simulate-anomaly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario }),
    });
    if (!res.ok) throw new Error(`Failed to trigger simulation: ${res.statusText}`);
    return res.json();
  },

  async resetNominal(): Promise<{ success: boolean; kpis: NetworkKPIPayload }> {
    const res = await fetch('/api/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`Failed to reset: ${res.statusText}`);
    return res.json();
  },

  async applyRemediation(actionId: string, incidentId?: string): Promise<{ success: boolean; message: string; kpis: NetworkKPIPayload }> {
    const res = await fetch('/api/remediate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId, incidentId }),
    });
    if (!res.ok) throw new Error(`Remediation failed: ${res.statusText}`);
    return res.json();
  },

  async ingestCSV(rows: CSVRowData[]): Promise<{ count: number; anomaliesDetected: number; kpis: NetworkKPIPayload }> {
    const res = await fetch('/api/ingest-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows }),
    });
    if (!res.ok) throw new Error(`CSV ingestion failed: ${res.statusText}`);
    return res.json();
  },

  async getHealth(): Promise<any> {
    const res = await fetch('/api/health');
    return res.json();
  },
};
