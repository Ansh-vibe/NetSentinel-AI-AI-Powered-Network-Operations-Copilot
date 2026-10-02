import React from 'react';
import { CellTowerNode, NetworkKPIPayload } from '../types';
import { BarChart3, Wifi, Radio, Zap, Clock, ShieldCheck, TrendingDown, Cpu } from 'lucide-react';

interface AnalyticsViewProps {
  kpis: NetworkKPIPayload;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ kpis }) => {
  const g5Towers = kpis.towers.filter((t) => t.type === '5G-gNodeB');
  const g4Towers = kpis.towers.filter((t) => t.type === '4G-eNodeB');
  const mecNodes = kpis.towers.filter((t) => t.type === 'Edge-MEC');

  const avgLatency5G = g5Towers.reduce((acc, t) => acc + t.latency, 0) / (g5Towers.length || 1);
  const avgLatency4G = g4Towers.reduce((acc, t) => acc + t.latency, 0) / (g4Towers.length || 1);

  const avgTp5G = g5Towers.reduce((acc, t) => acc + t.throughput, 0) / (g5Towers.length || 1);
  const avgTp4G = g4Towers.reduce((acc, t) => acc + t.throughput, 0) / (g4Towers.length || 1);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-medium">5G gNodeB Cells</span>
            <Wifi className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{g5Towers.length} Active</div>
          <div className="text-xs text-slate-400 mt-1">
            Avg Latency: <span className="text-cyan-400 font-semibold">{avgLatency5G.toFixed(1)} ms</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-medium">4G LTE / eNodeB</span>
            <Radio className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{g4Towers.length} Active</div>
          <div className="text-xs text-slate-400 mt-1">
            Avg Latency: <span className="text-indigo-400 font-semibold">{avgLatency4G.toFixed(1)} ms</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-medium">Autonomous MTTR</span>
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">28.4 sec</div>
          <div className="text-xs text-slate-400 mt-1">
            vs 42 mins manual operator triage (-98.8%)
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-medium">Connected Devices</span>
            <Cpu className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {kpis.metrics.connectedDevices.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Across {kpis.towers.length} carrier radio sectors
          </div>
        </div>
      </div>

      {/* 5G vs 4G Comparative Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur-md">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-cyan-400" />
            5G Standalone vs 4G LTE Performance Comparison
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Round-Trip Latency (Lower is better)</span>
                <span>5G: {avgLatency5G.toFixed(1)}ms | 4G: {avgLatency4G.toFixed(1)}ms</span>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1 p-0.5">
                <div
                  className="bg-cyan-500 rounded-full h-full transition-all"
                  style={{ width: `${Math.min(100, (avgLatency5G / (avgLatency4G + avgLatency5G)) * 100)}%` }}
                  title="5G Latency"
                />
                <div
                  className="bg-indigo-500 rounded-full h-full transition-all"
                  style={{ width: `${Math.min(100, (avgLatency4G / (avgLatency4G + avgLatency5G)) * 100)}%` }}
                  title="4G Latency"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Downlink Throughput (Higher is better)</span>
                <span>5G: {avgTp5G.toFixed(1)} Mbps | 4G: {avgTp4G.toFixed(1)} Mbps</span>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1 p-0.5">
                <div
                  className="bg-cyan-500 rounded-full h-full transition-all"
                  style={{ width: `${Math.min(100, (avgTp5G / (avgTp5G + avgTp4G)) * 100)}%` }}
                />
                <div
                  className="bg-indigo-500 rounded-full h-full transition-all"
                  style={{ width: `${Math.min(100, (avgTp4G / (avgTp5G + avgTp4G)) * 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                <div className="text-cyan-400 font-semibold mb-1">5G gNodeB Highlights</div>
                <div className="text-slate-400">Beamforming active (64T64R massive MIMO), URLLC slice enabled, sub-6GHz & mmWave aggregation.</div>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                <div className="text-indigo-400 font-semibold mb-1">4G LTE Highlights</div>
                <div className="text-slate-400">Carrier aggregation (3xCA), 4x4 MIMO fallback, high coverage density for legacy edge terminals.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Radio Link Signal & SINR Quality Breakdown */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur-md">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Radio className="h-4 w-4 text-emerald-400" />
            Carrier Radio Frequency (RF) Signal Matrix
          </h3>

          <div className="space-y-3">
            {kpis.towers.slice(0, 5).map((tower) => (
              <div key={tower.id} className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-white">{tower.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{tower.region}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">RSRP: </span>
                    <strong className={tower.rsrp < -100 ? 'text-rose-400' : 'text-emerald-400'}>
                      {tower.rsrp} dBm
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">SINR: </span>
                    <strong className={tower.sinr < 10 ? 'text-amber-400' : 'text-emerald-400'}>
                      {tower.sinr} dB
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Subscribers: </span>
                    <strong className="text-cyan-400">{tower.activeUsers.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
