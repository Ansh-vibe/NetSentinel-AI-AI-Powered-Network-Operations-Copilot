import React, { useState } from 'react';
import { CSVRowData, NetworkKPIPayload } from '../types';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, Download, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface DataIngestionProps {
  onIngestionComplete: (kpis: NetworkKPIPayload) => void;
}

export const DataIngestion: React.FC<DataIngestionProps> = ({ onIngestionComplete }) => {
  const [rows, setRows] = useState<CSVRowData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ingestedStats, setIngestedStats] = useState<{ count: number; anomalies: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sampleCSVContent = `timestamp,tower_id,region,cell_type,latency_ms,packet_loss_pct,throughput_mbps,jitter_ms,availability_pct,rsrp_dbm,sinr_db,active_users,status
2026-10-02T14:00:00Z,TWR-US-E1-04,us-east-1,5G-gNodeB,82.0,8.70,41.2,28.4,94.10,-104,6.4,2490,CRITICAL
2026-10-02T14:05:00Z,TWR-US-E1-04,us-east-1,5G-gNodeB,85.4,9.10,38.5,30.2,93.50,-106,5.2,2540,CRITICAL
2026-10-02T14:10:00Z,TWR-US-W2-02,us-west-2,5G-gNodeB,23.1,0.11,455.0,3.4,99.96,-80,18.5,1450,NORMAL
2026-10-02T14:15:00Z,TWR-EU-C1-01,eu-central-1,5G-gNodeB,19.0,0.07,515.2,2.6,99.99,-77,22.4,2010,NORMAL
2026-10-02T14:20:00Z,TWR-EU-W2-03,eu-west-2,Edge-MEC,61.5,4.10,172.0,15.2,97.20,-94,10.8,3190,WARNING
2026-10-02T14:25:00Z,TWR-AP-NE1-05,ap-northeast-1,5G-gNodeB,14.8,0.06,825.0,1.9,99.98,-75,24.9,4300,NORMAL
2026-10-02T14:30:00Z,TWR-SA-E1-07,sa-east-1,4G-eNodeB,66.2,3.10,91.0,17.4,96.80,-96,9.2,1680,WARNING`;

  const parseCSVText = (text: string) => {
    try {
      const lines = text.trim().split('\n');
      if (lines.length < 2) throw new Error('CSV must have a header and at least one data row');

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const parsedRows: CSVRowData[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const vals = line.split(',').map((v) => v.trim());
        if (vals.length < 6) continue;

        parsedRows.push({
          timestamp: vals[0] || new Date().toISOString(),
          tower_id: vals[1] || `TWR-${i}`,
          region: vals[2] || 'global',
          cell_type: vals[3] || '5G-gNodeB',
          latency_ms: parseFloat(vals[4]) || 20,
          packet_loss_pct: parseFloat(vals[5]) || 0.1,
          throughput_mbps: parseFloat(vals[6]) || 200,
          jitter_ms: parseFloat(vals[7]) || 4,
          availability_pct: parseFloat(vals[8]) || 99.9,
          rsrp_dbm: parseFloat(vals[9]) || -80,
          sinr_db: parseFloat(vals[10]) || 18,
          active_users: parseInt(vals[11], 10) || 1000,
          status: vals[12] || 'NORMAL',
        });
      }

      setRows(parsedRows);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse CSV file');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSVText(text);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = (scenario: 'default' | 'outage' | 'healthy') => {
    if (scenario === 'outage') {
      parseCSVText(sampleCSVContent);
    } else if (scenario === 'healthy') {
      const normalData = `timestamp,tower_id,region,cell_type,latency_ms,packet_loss_pct,throughput_mbps,jitter_ms,availability_pct,rsrp_dbm,sinr_db,active_users,status
2026-10-02T14:00:00Z,TWR-US-E1-04,us-east-1,5G-gNodeB,21.5,0.12,480.0,3.2,99.98,-81,20.4,1800,NORMAL
2026-10-02T14:05:00Z,TWR-US-W2-02,us-west-2,5G-gNodeB,22.0,0.10,490.0,3.0,99.99,-80,21.0,1750,NORMAL
2026-10-02T14:10:00Z,TWR-EU-C1-01,eu-central-1,5G-gNodeB,18.4,0.06,530.0,2.4,99.99,-78,23.0,2100,NORMAL
2026-10-02T14:15:00Z,TWR-AP-NE1-05,ap-northeast-1,5G-gNodeB,14.2,0.04,850.0,1.8,99.99,-74,26.0,4100,NORMAL`;
      parseCSVText(normalData);
    } else {
      parseCSVText(sampleCSVContent);
    }
  };

  const handleIngestToPipeline = async () => {
    if (rows.length === 0) return;
    try {
      setIsProcessing(true);
      const res = await api.ingestCSV(rows);
      setIngestedStats({ count: res.count, anomalies: res.anomaliesDetected });
      onIngestionComplete(res.kpis);
    } catch (err: any) {
      setErrorMsg(err.message || 'Ingestion failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCSVContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-network-kpis.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 mb-5">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-cyan-400" />
              Network Telemetry & CSV Ingestion Engine
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Ingest gNodeB/eNodeB cell logs, fiber transport metrics, and synthetic carrier telemetry
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSample}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Template (CSV)</span>
            </button>
          </div>
        </div>

        {/* Drag & Drop Input */}
        <label className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500/60 bg-slate-950/50 p-8 text-center cursor-pointer transition-colors group">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform mb-3">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <span className="text-sm font-semibold text-slate-200">
            Drop your carrier CSV file here, or <span className="text-cyan-400 underline">browse</span>
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Supports gNodeB latency, packet loss, throughput, jitter, and RSRP/SINR telemetry
          </span>
        </label>

        {/* Quick Presets */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400">Or load pre-configured test batches:</span>
          <button
            onClick={() => handleLoadSample('outage')}
            className="px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 font-medium"
          >
            ⚡ Ashburn 5G Cell Congestion Spike
          </button>
          <button
            onClick={() => handleLoadSample('healthy')}
            className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 font-medium"
          >
            🟢 Baseline Normal Multi-Carrier Batch
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Parsed Data Preview Table */}
      {rows.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 backdrop-blur-md overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-slate-800/80 bg-slate-950/40">
            <div>
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>Parsed Telemetry Rows ({rows.length})</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Ready for Ingestion
                </span>
              </h4>
            </div>

            <button
              disabled={isProcessing}
              onClick={handleIngestToPipeline}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-600/20 hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Ingesting & Running AI Triage...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Ingest & Run Autonomous AI Triage</span>
                </>
              )}
            </button>
          </div>

          {ingestedStats && (
            <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-5 py-3 text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                Successfully ingested {ingestedStats.count} telemetry records! Flagged {ingestedStats.anomalies} anomalies and updated live NOC dashboard.
              </span>
            </div>
          )}

          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-950 text-slate-400 border-b border-slate-800 z-10">
                <tr>
                  <th className="px-4 py-2.5">Timestamp</th>
                  <th className="px-4 py-2.5">Tower ID</th>
                  <th className="px-4 py-2.5">Region</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Latency</th>
                  <th className="px-4 py-2.5">Loss</th>
                  <th className="px-4 py-2.5">Throughput</th>
                  <th className="px-4 py-2.5">RSRP</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {rows.map((row, idx) => {
                  const isCrit = row.packet_loss_pct > 5 || row.latency_ms > 70;
                  const isWarn = row.packet_loss_pct > 2 || row.latency_ms > 45;
                  return (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="px-4 py-2 text-slate-400">{row.timestamp}</td>
                      <td className="px-4 py-2 text-cyan-400 font-semibold">{row.tower_id}</td>
                      <td className="px-4 py-2 text-slate-300">{row.region}</td>
                      <td className="px-4 py-2 text-slate-400">{row.cell_type}</td>
                      <td className={`px-4 py-2 ${isCrit ? 'text-rose-400 font-bold' : isWarn ? 'text-amber-400' : 'text-slate-200'}`}>
                        {row.latency_ms} ms
                      </td>
                      <td className={`px-4 py-2 ${isCrit ? 'text-rose-400 font-bold' : isWarn ? 'text-amber-400' : 'text-slate-200'}`}>
                        {row.packet_loss_pct}%
                      </td>
                      <td className="px-4 py-2 text-emerald-400">{row.throughput_mbps} Mbps</td>
                      <td className="px-4 py-2 text-slate-400">{row.rsrp_dbm} dBm</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-sans font-medium ${
                            isCrit
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : isWarn
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
