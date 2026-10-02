import React, { useState } from 'react';
import {
  Shield,
  Wifi,
  Radio,
  Flame,
  RotateCcw,
  RefreshCw,
  Sparkles,
  Cloud,
  FileSpreadsheet,
  AlertTriangle,
  BarChart2,
  LayoutDashboard,
  Layers,
  ChevronDown,
  Activity,
} from 'lucide-react';
import { HealthStatus } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  overallHealth: HealthStatus;
  isSimulating: boolean;
  onSimulate: (scenario: string) => void;
  onReset: () => void;
  onManualRefresh: () => void;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  overallHealth,
  isSimulating,
  onSimulate,
  onReset,
  onManualRefresh,
  autoRefresh,
  onToggleAutoRefresh,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getHealthBadge = () => {
    switch (overallHealth) {
      case 'CRITICAL':
        return {
          dot: 'bg-rose-500',
          text: 'text-rose-400',
          bg: 'bg-rose-500/10 border-rose-500/30',
          label: 'Critical SLA Breach',
        };
      case 'WARNING':
        return {
          dot: 'bg-amber-500',
          text: 'text-amber-400',
          bg: 'bg-amber-500/10 border-amber-500/30',
          label: 'Elevated Latency',
        };
      default:
        return {
          dot: 'bg-emerald-500',
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/10 border-emerald-500/30',
          label: 'All Systems Live',
        };
    }
  };

  const healthBadge = getHealthBadge();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/30">
            <Shield className="h-5 w-5 text-white" />
            <Wifi className="absolute h-3 w-3 text-cyan-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">
                NetSentinel <span className="text-cyan-400">AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300 border border-slate-700">
                v2.4-NOC
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 hidden sm:block">
              AI-Powered Network Operations Copilot
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800 text-xs font-medium">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              currentTab === 'dashboard'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onSelectTab('upload')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              currentTab === 'upload'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Upload Data</span>
          </button>

          <button
            onClick={() => onSelectTab('incidents')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              currentTab === 'incidents'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Incidents</span>
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              currentTab === 'analytics'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => onSelectTab('architecture')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              currentTab === 'architecture'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="h-3.5 w-3.5" />
            <span>Architecture & APIs</span>
          </button>
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Health Status Beacon */}
          <div
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-xs ${healthBadge.bg} ${healthBadge.text}`}
          >
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${healthBadge.dot}`} />
              <span className={`relative inline-flex h-2 w-2 rounded-full ${healthBadge.dot}`} />
            </span>
            <span className="hidden sm:inline">Network Health:</span>
            <span>{healthBadge.label}</span>
          </div>

          {/* Anomaly Simulator Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Simulate Stress</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Test Anomaly Scenarios
                </div>
                <button
                  onClick={() => onSimulate('packet_loss_spike')}
                  className="w-full text-left rounded-lg p-2 text-xs hover:bg-slate-800 text-rose-400 flex items-center justify-between"
                >
                  <span>⚡ Packet Loss Spike (Demo State)</span>
                </button>
                <button
                  onClick={() => onSimulate('5g_core_latency')}
                  className="w-full text-left rounded-lg p-2 text-xs hover:bg-slate-800 text-amber-400 flex items-center justify-between"
                >
                  <span>📶 5G Core Latency Surge</span>
                </button>
                <button
                  onClick={() => onSimulate('fiber_cut')}
                  className="w-full text-left rounded-lg p-2 text-xs hover:bg-slate-800 text-rose-400 flex items-center justify-between"
                >
                  <span>🌐 Subsea Fiber Cut / Route Drop</span>
                </button>
                <button
                  onClick={() => onSimulate('tower_overload')}
                  className="w-full text-left rounded-lg p-2 text-xs hover:bg-slate-800 text-amber-400 flex items-center justify-between"
                >
                  <span>👥 Cell Tower Overload (4G/5G)</span>
                </button>
                <div className="my-1 border-t border-slate-800" />
                <button
                  onClick={onReset}
                  className="w-full text-left rounded-lg p-2 text-xs hover:bg-slate-800 text-emerald-400 flex items-center justify-between font-medium"
                >
                  <span>🔄 Restore All Nominal</span>
                </button>
              </div>
            )}
          </div>

          {/* Refresh Buttons */}
          <button
            onClick={onManualRefresh}
            title="Refresh Telemetry"
            className="rounded-lg border border-slate-700 bg-slate-800/90 p-2 text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile Tab Navigation Strip */}
      <div className="flex md:hidden items-center justify-around border-t border-slate-800/80 bg-slate-950 px-2 py-1 text-xs">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`px-2 py-1 rounded ${currentTab === 'dashboard' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectTab('upload')}
          className={`px-2 py-1 rounded ${currentTab === 'upload' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          Upload
        </button>
        <button
          onClick={() => onSelectTab('incidents')}
          className={`px-2 py-1 rounded ${currentTab === 'incidents' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          Incidents
        </button>
        <button
          onClick={() => onSelectTab('analytics')}
          className={`px-2 py-1 rounded ${currentTab === 'analytics' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          Analytics
        </button>
        <button
          onClick={() => onSelectTab('architecture')}
          className={`px-2 py-1 rounded ${currentTab === 'architecture' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          APIs
        </button>
      </div>
    </header>
  );
};
