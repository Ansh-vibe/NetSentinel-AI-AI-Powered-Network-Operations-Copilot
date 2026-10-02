import React, { useState } from 'react';
import { Cloud, Server, Database, Brain, Sparkles, Terminal, Play, CheckCircle2, Shield, Radio } from 'lucide-react';
import { api } from '../services/api';

export const ArchitectureView: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/kpis');
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST'>('GET');
  const [apiPayload, setApiPayload] = useState<string>('{}');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const endpoints = [
    { path: '/api/kpis', method: 'GET', description: 'Fetch synchronized 4G/5G metrics, cell nodes, and live time-series' },
    { path: '/api/incidents', method: 'GET', description: 'Retrieve active and mitigated incident audit trail from DynamoDB' },
    { path: '/api/analyze', method: 'POST', description: 'Invoke Gemini 3.8 Flash to run real-time root-cause AI triage' },
    { path: '/api/simulate-anomaly', method: 'POST', description: 'Trigger synthetic network stress test (packet loss, fiber cut, 5G surge)', defaultBody: '{"scenario": "packet_loss_spike"}' },
    { path: '/api/health', method: 'GET', description: 'Liveness and readiness probe for API Gateway' },
  ];

  const handleSelectEndpoint = (ep: typeof endpoints[0]) => {
    setSelectedEndpoint(ep.path);
    setApiMethod(ep.method as 'GET' | 'POST');
    setApiPayload(ep.defaultBody || '{}');
    setApiResponse(null);
  };

  const handleExecuteRequest = async () => {
    try {
      setIsLoading(true);
      const start = performance.now();
      let resData;

      if (selectedEndpoint === '/api/kpis') {
        resData = await api.getKPIs();
      } else if (selectedEndpoint === '/api/incidents') {
        resData = await api.getIncidents();
      } else if (selectedEndpoint === '/api/analyze') {
        resData = await api.runAIAnalysis();
      } else if (selectedEndpoint === '/api/simulate-anomaly') {
        const parsed = JSON.parse(apiPayload || '{}');
        resData = await api.simulateAnomaly(parsed.scenario || 'packet_loss_spike');
      } else if (selectedEndpoint === '/api/health') {
        resData = await api.getHealth();
      } else {
        const res = await fetch(selectedEndpoint);
        resData = await res.json();
      }

      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
      setApiResponse(resData);
    } catch (err: any) {
      setApiResponse({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual System Architecture Diagram matching user prompt */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-6">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Cloud className="h-5 w-5 text-cyan-400" />
              NetSentinel AI - Production Serverless & AI Architecture
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              End-to-end telemetry ingestion, serverless compute, and autonomous Gemini AI reasoning pipeline
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              AWS Serverless + Gemini 3.8 Flash
            </span>
          </div>
        </div>

        {/* 5-Stage Visual Workflow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {/* Stage 1: Telemetry Ingest */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                <span>01. Ingestion</span>
                <Radio className="h-4 w-4 text-cyan-400" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Network Telemetry</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                4G/5G Cell towers (gNodeB/eNodeB) streaming eCPRI, GTP-U, and IP backhaul KPIs into Amazon S3.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-cyan-400 font-mono">
              Amazon S3 • Telemetry Bucket
            </div>
          </div>

          {/* Stage 2: Gateway */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                <span>02. Transport</span>
                <Server className="h-4 w-4 text-indigo-400" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">API Gateway</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Sub-millisecond REST routing with TLS termination, rate-limiting, and telemetry validation.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-indigo-400 font-mono">
              AWS API Gateway
            </div>
          </div>

          {/* Stage 3: Serverless Compute */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                <span>03. Compute</span>
                <Terminal className="h-4 w-4 text-amber-400" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">AWS Lambda</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Event-driven handlers (getKpis, analyzeNetwork) running statistical Z-score anomaly detection.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-amber-400 font-mono">
              Node.js 20.x Runtime
            </div>
          </div>

          {/* Stage 4: AI Engine */}
          <div className="rounded-xl border border-purple-500/40 bg-purple-950/20 p-4 flex flex-col justify-between shadow-[0_0_20px_-3px_rgba(168,85,247,0.15)]">
            <div>
              <div className="flex items-center justify-between text-xs text-purple-400 mb-2 font-mono">
                <span>04. Intelligence</span>
                <Sparkles className="h-4 w-4 text-purple-400" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Gemini 3.8 Flash</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Correlates cross-layer telecom anomalies, diagnoses root-causes, and drafts automated remediation plans.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-purple-900/60 text-[10px] text-purple-300 font-mono">
              Google GenAI / Bedrock
            </div>
          </div>

          {/* Stage 5: State Store & Remediation */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                <span>05. Persistence</span>
                <Database className="h-4 w-4 text-emerald-400" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">DynamoDB & Control</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Persists incident logs, MTTR audit events, and autonomous closed-loop remediation actions.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-mono">
              Amazon DynamoDB
            </div>
          </div>
        </div>
      </div>

      {/* Interactive REST API Explorer */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <h4 className="text-sm font-semibold text-white">Live Serverless API Console & Explorer</h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">Base URL: http://0.0.0.0:3000</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Endpoint Selector Column */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-slate-400 block mb-2">
              Available Endpoints
            </label>
            {endpoints.map((ep) => (
              <div
                key={ep.path}
                onClick={() => handleSelectEndpoint(ep)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedEndpoint === ep.path
                    ? 'bg-slate-800/90 border-cyan-500/60 text-white'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 font-mono text-xs font-semibold mb-1">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                      ep.method === 'GET' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span>{ep.path}</span>
                </div>
                <p className="text-[11px] text-slate-400">{ep.description}</p>
              </div>
            ))}
          </div>

          {/* Request / Response Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-xs font-mono font-semibold text-cyan-400 border border-slate-700">
                {apiMethod}
              </span>
              <input
                type="text"
                readOnly
                value={selectedEndpoint}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
              />
              <button
                disabled={isLoading}
                onClick={handleExecuteRequest}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{isLoading ? 'Executing...' : 'Send Request'}</span>
              </button>
            </div>

            {apiMethod === 'POST' && (
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Request Body (JSON)</label>
                <textarea
                  rows={3}
                  value={apiPayload}
                  onChange={(e) => setApiPayload(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/80 p-3 font-mono text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            )}

            {/* Response Console */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Response Output</span>
                {latencyMs !== null && (
                  <span className="text-emerald-400 font-mono font-medium">Status: 200 OK ({latencyMs} ms)</span>
                )}
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/90 p-3.5 font-mono text-xs max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="text-cyan-400 animate-pulse">Invoking Serverless Handler & Gemini Model...</div>
                ) : apiResponse ? (
                  <pre className="text-slate-300 whitespace-pre-wrap">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                ) : (
                  <span className="text-slate-600">// Click "Send Request" to test endpoint live</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
