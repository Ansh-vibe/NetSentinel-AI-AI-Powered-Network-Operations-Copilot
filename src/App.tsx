import React, { useEffect, useState } from 'react';
import { NetworkKPIPayload, Incident, CellTowerNode } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { KPICard } from './components/KPICard';
import { NetworkChart } from './components/NetworkChart';
import { LiveNetworkMap } from './components/LiveNetworkMap';
import { AIAnalysisPanel } from './components/AIAnalysisPanel';
import { IncidentTable } from './components/IncidentTable';
import { IncidentModal } from './components/IncidentModal';
import { DataIngestion } from './components/DataIngestion';
import { AnalyticsView } from './components/AnalyticsView';
import { ArchitectureView } from './components/ArchitectureView';
import {
  Clock,
  Activity,
  Zap,
  CheckCircle2,
  Shield,
  Radio,
  Server,
  Sparkles,
  Cloud,
  Layers,
  ArrowRight,
  Flame,
  RotateCw,
  Cpu,
} from 'lucide-react';

export default function App() {
  const [kpis, setKpis] = useState<NetworkKPIPayload | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Show temporary toast notification
  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch initial telemetry and incidents
  const loadData = async () => {
    try {
      const [kpiData, incData] = await Promise.all([api.getKPIs(), api.getIncidents()]);
      setKpis(kpiData);
      setIncidents(incData);
    } catch (err: any) {
      console.warn('Network fetch fallback:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Telemetry auto-polling interval
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(async () => {
      try {
        const fresh = await api.getKPIs();
        setKpis(fresh);
      } catch (e) {
        // silent fail in polling
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleSimulate = async (scenario: string) => {
    try {
      setIsSimulating(true);
      const res = await api.simulateAnomaly(scenario);
      setKpis(res.kpis);
      const incs = await api.getIncidents();
      setIncidents(incs);
      notify(`Triggered synthetic network stress: "${scenario.replace(/_/g, ' ')}"`);
    } catch (err: any) {
      notify(`Simulation error: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsSimulating(true);
      const res = await api.resetNominal();
      setKpis(res.kpis);
      const incs = await api.getIncidents();
      setIncidents(incs);
      notify('All network telemetry restored to nominal baseline.');
    } catch (err: any) {
      notify(`Reset error: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleApplyRemediation = async (actionId: string) => {
    try {
      const res = await api.applyRemediation(actionId);
      setKpis(res.kpis);
      const incs = await api.getIncidents();
      setIncidents(incs);
      notify(res.message);
    } catch (err: any) {
      notify(`Remediation failed: ${err.message}`);
    }
  };

  const handleRunLiveAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      const freshAnalysis = await api.runAIAnalysis();
      if (kpis) {
        setKpis({ ...kpis, currentAIAnalysis: freshAnalysis });
      }
      notify('Gemini 3.8 Flash AI diagnostic sweep complete!');
    } catch (err: any) {
      notify(`AI analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!kpis) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <RotateCw className="h-8 w-8 text-cyan-400 animate-spin" />
          <p className="text-sm font-medium tracking-wide">Connecting to NetSentinel AI Core Telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        overallHealth={kpis.overallHealth}
        isSimulating={isSimulating}
        onSimulate={handleSimulate}
        onReset={handleReset}
        onManualRefresh={loadData}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-cyan-500/30 bg-slate-900/95 px-4 py-3 text-xs font-medium text-cyan-200 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Body */}
      <main className="flex-1 mx-auto w-full max-w-7xl p-4 sm:p-6 space-y-6">
        {/* Top Hero Brand Banner matching reference image */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6 sm:p-8 backdrop-blur-md">
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-400">
                <Sparkles className="h-3.5 w-3.5" />
                Autonomous Telecom Copilot
              </span>
              <span className="text-xs text-slate-400">Powered by AWS & Gemini 3.8 Flash</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Detect anomalies. Understand root causes. Keep networks nominal.
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Continuous 4G/5G radio telemetry, sub-second optical transport anomaly detection, and AI root-cause analysis with closed-loop autonomous remediation.
            </p>

            {/* 4 Feature Highlights matching screenshot */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Activity className="h-4 w-4" />
                </div>
                <span>Anomaly Detection</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span>AI Root-Cause Analysis</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span>Incident Reports</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Zap className="h-4 w-4" />
                </div>
                <span>Smart Remediation</span>
              </div>
            </div>
          </div>

          {/* Decorative Background Elements */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-cyan-500/10 to-transparent pointer-events-none" />
        </div>

        {/* View Router */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Primary KPI 4-Card Row matching reference image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="Latency"
                metric={kpis.metrics.latency}
                icon={<Clock className="h-4 w-4" />}
                accentColor="cyan"
              />
              <KPICard
                title="Packet Loss"
                metric={kpis.metrics.packetLoss}
                icon={<Activity className="h-4 w-4" />}
                accentColor="red"
              />
              <KPICard
                title="Throughput"
                metric={kpis.metrics.throughput}
                icon={<Zap className="h-4 w-4" />}
                accentColor="emerald"
              />
              <KPICard
                title="Availability"
                metric={kpis.metrics.availability}
                icon={<CheckCircle2 className="h-4 w-4" />}
                accentColor="emerald"
              />
            </div>

            {/* Sub-KPI Telemetry Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Network Jitter</span>
                  <span className="text-sm font-bold text-white">{kpis.metrics.jitter.value} ms</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Connected UEs</span>
                  <span className="text-sm font-bold text-white">
                    {kpis.metrics.connectedDevices.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Radio className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Active Cells</span>
                  <span className="text-sm font-bold text-white">{kpis.towers.length} gNodeB/MEC</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Server className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Transport Volume</span>
                  <span className="text-sm font-bold text-white">{kpis.metrics.networkTrafficGbps} Gbps</span>
                </div>
              </div>
            </div>

            {/* Central Two-Column Layout matching screenshot */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (2 Cols wide on large screen): Trends Chart + Live Map */}
              <div className="lg:col-span-2 space-y-6">
                <NetworkChart data={kpis.timeSeries} height={250} />
                <LiveNetworkMap towers={kpis.towers} />
              </div>

              {/* Right Column (1 Col wide): Dedicated AI Analysis Panel */}
              <div className="space-y-6">
                <AIAnalysisPanel
                  analysis={kpis.currentAIAnalysis}
                  onApplyRemediation={handleApplyRemediation}
                  onGenerateReport={() => setReportModalOpen(true)}
                  onRunLiveAnalysis={handleRunLiveAnalysis}
                  isAnalyzing={isAnalyzing}
                />

                {/* Quick Simulation Banner */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4.5 text-xs backdrop-blur-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5 text-amber-400" />
                      Live Chaos / Anomaly Simulator
                    </span>
                    <span className="text-[10px] text-slate-400">NOC Testing</span>
                  </div>
                  <p className="text-slate-400 mb-3 leading-relaxed text-[11px]">
                    Simulate real-world carrier outages to test autonomous AI anomaly detection and auto-remediation triggers.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSimulate('packet_loss_spike')}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 font-medium transition-colors text-[11px]"
                    >
                      Packet Loss Spike
                    </button>
                    <button
                      onClick={() => handleSimulate('5g_core_latency')}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 font-medium transition-colors text-[11px]"
                    >
                      5G Core Congestion
                    </button>
                    <button
                      onClick={() => handleSimulate('fiber_cut')}
                      className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 font-medium transition-colors text-[11px]"
                    >
                      Fiber Cable Cut
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 font-medium transition-colors text-[11px]"
                    >
                      Restore Nominal
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Incidents Table */}
            <div>
              <IncidentTable
                incidents={incidents}
                onMitigate={async (id) => {
                  await handleApplyRemediation('act-reroute');
                }}
              />
            </div>
          </div>
        )}

        {/* Upload Data View */}
        {currentTab === 'upload' && (
          <DataIngestion
            onIngestionComplete={(newKpis) => {
              setKpis(newKpis);
              notify('Telemetry batch ingested! Switch to Dashboard to view updated KPIs.');
            }}
          />
        )}

        {/* Incidents View */}
        {currentTab === 'incidents' && (
          <div className="space-y-6">
            <IncidentTable
              incidents={incidents}
              onMitigate={async (id) => {
                await handleApplyRemediation('act-reroute');
              }}
            />
          </div>
        )}

        {/* Analytics View */}
        {currentTab === 'analytics' && <AnalyticsView kpis={kpis} />}

        {/* Architecture & APIs View */}
        {currentTab === 'architecture' && <ArchitectureView />}
      </main>

      {/* Incident Report Modal */}
      <IncidentModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        analysis={kpis.currentAIAnalysis}
        towers={kpis.towers}
      />

      {/* Footer with AWS and AI Studio Architecture credits */}
      <footer className="mt-12 border-t border-slate-800/80 bg-slate-950/80 px-4 py-6 text-xs text-slate-500 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">NetSentinel AI</span>
            <span>•</span>
            <span>AI-Powered Autonomous Network Operations Copilot</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Amazon S3</span>
            <span>API Gateway</span>
            <span>AWS Lambda</span>
            <span>Amazon Bedrock / Gemini 3.8 Flash</span>
            <span>DynamoDB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
