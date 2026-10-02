import React, { useState } from 'react';
import { CellTowerNode } from '../types';
import { Radio, Signal, Wifi, Server, CheckCircle2, AlertTriangle, XCircle, ArrowUpRight } from 'lucide-react';

interface LiveNetworkMapProps {
  towers: CellTowerNode[];
  onSelectTower?: (tower: CellTowerNode) => void;
}

export const LiveNetworkMap: React.FC<LiveNetworkMapProps> = ({ towers, onSelectTower }) => {
  const [selectedNode, setSelectedNode] = useState<CellTowerNode | null>(towers[0] || null);
  const [filterType, setFilterType] = useState<string>('all');

  const filteredTowers = towers.filter((t) => {
    if (filterType === 'all') return true;
    if (filterType === '5g') return t.type === '5G-gNodeB';
    if (filterType === '4g') return t.type === '4G-eNodeB';
    if (filterType === 'edge') return t.type === 'Edge-MEC';
    return true;
  });

  const handleNodeClick = (node: CellTowerNode) => {
    setSelectedNode(node);
    if (onSelectTower) onSelectTower(node);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Radio className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Live Network Map & Cell Topology</h3>
            <p className="text-xs text-slate-400">Global edge nodes, 5G gNodeB arrays & optical backhauls</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`rounded px-2.5 py-1 transition-all ${
              filterType === 'all' ? 'bg-cyan-500/20 text-cyan-400 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Nodes ({towers.length})
          </button>
          <button
            onClick={() => setFilterType('5g')}
            className={`rounded px-2.5 py-1 transition-all ${
              filterType === '5g' ? 'bg-cyan-500/20 text-cyan-400 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            5G gNodeB
          </button>
          <button
            onClick={() => setFilterType('4g')}
            className={`rounded px-2.5 py-1 transition-all ${
              filterType === '4g' ? 'bg-cyan-500/20 text-cyan-400 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            4G eNodeB
          </button>
          <button
            onClick={() => setFilterType('edge')}
            className={`rounded px-2.5 py-1 transition-all ${
              filterType === 'edge' ? 'bg-cyan-500/20 text-cyan-400 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Edge MEC
          </button>
        </div>
      </div>

      {/* Interactive Map Canvas / SVG Topology */}
      <div className="relative h-64 w-full overflow-hidden rounded-lg border border-slate-800/80 bg-slate-950/80">
        {/* Holographic grid and world silhouette overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, #06b6d4 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)`,
            backgroundSize: '40px 40px, 20px 20px, 20px 20px',
          }}
        />

        {/* Global interconnect curves */}
        <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Connect node lines */}
          {towers.slice(0, -1).map((tower, idx) => {
            const next = towers[idx + 1];
            return (
              <line
                key={`conn-${tower.id}-${next.id}`}
                x1={tower.coordinates[0]}
                y1={tower.coordinates[1]}
                x2={next.coordinates[0]}
                y2={next.coordinates[1]}
                stroke="url(#lineGrad)"
                strokeWidth="0.4"
                strokeDasharray="1 1"
              />
            );
          })}
        </svg>

        {/* Dynamic Nodes */}
        {filteredTowers.map((tower) => {
          const isSelected = selectedNode?.id === tower.id;
          const isCritical = tower.status === 'CRITICAL';
          const isWarning = tower.status === 'WARNING';

          return (
            <div
              key={tower.id}
              onClick={() => handleNodeClick(tower)}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125"
              style={{
                left: `${tower.coordinates[0]}%`,
                top: `${tower.coordinates[1]}%`,
              }}
            >
              <div className="relative group">
                {/* Ping wave for critical/warning */}
                {(isCritical || isWarning) && (
                  <span
                    className={`absolute -inset-2 rounded-full animate-ping opacity-60 ${
                      isCritical ? 'bg-rose-500' : 'bg-amber-500'
                    }`}
                  />
                )}

                {/* Node Center Dot */}
                <div
                  className={`relative flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all shadow-md ${
                    isCritical
                      ? 'border-rose-400 bg-rose-500 text-white shadow-rose-500/50'
                      : isWarning
                      ? 'border-amber-400 bg-amber-500 text-white shadow-amber-500/50'
                      : 'border-emerald-400 bg-emerald-500 text-white shadow-emerald-500/50'
                  } ${isSelected ? 'ring-4 ring-cyan-400/40 scale-110' : ''}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>

                {/* Micro Label */}
                <div
                  className={`absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide backdrop-blur-xs border transition-opacity ${
                    isSelected
                      ? 'bg-slate-900/90 text-cyan-300 border-cyan-500/50 opacity-100 z-20'
                      : 'bg-slate-950/70 text-slate-300 border-slate-800 opacity-80 group-hover:opacity-100'
                  }`}
                >
                  {tower.city} ({tower.latency}ms)
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Tower Quick Telemetry Inspector Drawer */}
      {selectedNode && (
        <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-white">{selectedNode.name}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {selectedNode.type}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-medium ${
                  selectedNode.status === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : selectedNode.status === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {selectedNode.status}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">IP: {selectedNode.ipAddress}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-900/80 rounded p-2 border border-slate-800/80">
              <div className="text-slate-400">Round-Trip Latency</div>
              <div
                className={`text-sm font-bold mt-0.5 ${
                  selectedNode.latency > 70 ? 'text-rose-400' : selectedNode.latency > 40 ? 'text-amber-400' : 'text-white'
                }`}
              >
                {selectedNode.latency} ms
              </div>
            </div>
            <div className="bg-slate-900/80 rounded p-2 border border-slate-800/80">
              <div className="text-slate-400">Packet Loss Rate</div>
              <div
                className={`text-sm font-bold mt-0.5 ${
                  selectedNode.packetLoss > 4 ? 'text-rose-400' : selectedNode.packetLoss > 1 ? 'text-amber-400' : 'text-white'
                }`}
              >
                {selectedNode.packetLoss} %
              </div>
            </div>
            <div className="bg-slate-900/80 rounded p-2 border border-slate-800/80">
              <div className="text-slate-400">Downlink Throughput</div>
              <div className="text-sm font-bold text-white mt-0.5">{selectedNode.throughput} Mbps</div>
            </div>
            <div className="bg-slate-900/80 rounded p-2 border border-slate-800/80">
              <div className="text-slate-400">Active UE / Signal (RSRP)</div>
              <div className="text-sm font-bold text-cyan-400 mt-0.5">
                {selectedNode.activeUsers.toLocaleString()} users / {selectedNode.rsrp} dBm
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
