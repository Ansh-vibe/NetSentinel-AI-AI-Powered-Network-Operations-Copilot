import React, { useState } from 'react';
import { TimeSeriesPoint } from '../types';
import { AlertCircle } from 'lucide-react';

interface NetworkChartProps {
  data: TimeSeriesPoint[];
  height?: number;
  onPointClick?: (point: TimeSeriesPoint) => void;
}

export const NetworkChart: React.FC<NetworkChartProps> = ({
  data,
  height = 240,
  onPointClick,
}) => {
  const [activeMetrics, setActiveMetrics] = useState({
    latency: true,
    packetLoss: true,
    throughput: true,
    jitter: true,
  });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        No time-series telemetry data available
      </div>
    );
  }

  // Chart coordinate mapping
  const svgWidth = 700;
  const svgHeight = height;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };

  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Max scale values
  const maxLatency = Math.max(...data.map((d) => d.latency), 100);
  const maxLoss = Math.max(...data.map((d) => d.packetLoss), 15);
  const maxTp = Math.max(...data.map((d) => d.throughput), 200);
  const maxJitter = Math.max(...data.map((d) => d.jitter), 40);

  // Normalized scale 0 to 200 for aesthetic consistency with NOC dashboard
  const yTicks = [0, 50, 100, 150, 200];

  const getCoordinates = (val: number, maxVal: number, index: number) => {
    const x = padding.left + (index / (data.length - 1)) * plotWidth;
    const normalized = Math.min(200, (val / maxVal) * 200);
    const y = padding.top + plotHeight - (normalized / 200) * plotHeight;
    return { x, y };
  };

  const generateLinePath = (metricKey: 'latency' | 'packetLoss' | 'throughput' | 'jitter', maxVal: number) => {
    const points = data.map((d, i) => {
      const { x, y } = getCoordinates(d[metricKey], maxVal, i);
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  const toggleMetric = (key: keyof typeof activeMetrics) => {
    setActiveMetrics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hoveredPoint = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            Network KPI Trends
            <span className="text-xs font-normal text-slate-400">(Multi-Carrier Egress Telemetry)</span>
          </h3>
          <p className="text-xs text-slate-400">Synchronized 4G/5G metrics over the last active observation window</p>
        </div>

        {/* Time Window Buttons */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-800/80 p-0.5 border border-slate-700/60 text-xs">
          <button className="rounded px-2.5 py-1 text-cyan-400 bg-cyan-950/60 font-medium">Realtime</button>
          <button className="rounded px-2.5 py-1 text-slate-400 hover:text-slate-200">1h</button>
          <button className="rounded px-2.5 py-1 text-slate-400 hover:text-slate-200">6h</button>
          <button className="rounded px-2.5 py-1 text-slate-400 hover:text-slate-200">24h</button>
        </div>
      </div>

      {/* SVG Multi-Line Chart */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Y Axis Grid Lines & Labels */}
          {yTicks.map((tick) => {
            const y = padding.top + plotHeight - (tick / 200) * plotHeight;
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="sans-serif"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* X Axis Time Labels */}
          {data.map((d, i) => {
            const x = padding.left + (i / (data.length - 1)) * plotWidth;
            // Render alternate or all labels depending on density
            const showLabel = data.length <= 12 || i % 2 === 0 || i === data.length - 1;
            return (
              showLabel && (
                <text
                  key={i}
                  x={x}
                  y={svgHeight - 10}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {d.time}
                </text>
              )
            );
          })}

          {/* Throughput Area & Line (Teal/Emerald) */}
          {activeMetrics.throughput && (
            <path
              d={generateLinePath('throughput', maxTp)}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Jitter Line (Purple) */}
          {activeMetrics.jitter && (
            <path
              d={generateLinePath('jitter', maxJitter)}
              fill="none"
              stroke="#a855f7"
              strokeWidth="2"
              strokeDasharray="4 2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Packet Loss Line (Yellow/Orange) */}
          {activeMetrics.packetLoss && (
            <path
              d={generateLinePath('packetLoss', maxLoss)}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Latency Line (Cyan/Sky) */}
          {activeMetrics.latency && (
            <path
              d={generateLinePath('latency', maxLatency)}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Anomaly Markers */}
          {data.map((d, i) => {
            if (!d.anomaly) return null;
            const { x, y } = getCoordinates(d.latency, maxLatency, i);
            return (
              <g key={`anomaly-${i}`} className="animate-pulse">
                <circle cx={x} cy={y} r="6" fill="#f43f5e" fillOpacity="0.3" />
                <circle cx={x} cy={y} r="3.5" fill="#f43f5e" stroke="#fff" strokeWidth="1" />
              </g>
            );
          })}

          {/* Hover Crosshair & Indicator */}
          {hoveredIndex !== null && (
            <g>
              <line
                x1={padding.left + (hoveredIndex / (data.length - 1)) * plotWidth}
                y1={padding.top}
                x2={padding.left + (hoveredIndex / (data.length - 1)) * plotWidth}
                y2={padding.top + plotHeight}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            </g>
          )}

          {/* Invisible hover trigger columns */}
          {data.map((d, i) => {
            const colWidth = plotWidth / (data.length - 1);
            const x = padding.left + i * colWidth - colWidth / 2;
            return (
              <rect
                key={`trigger-${i}`}
                x={x}
                y={padding.top}
                width={colWidth}
                height={plotHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(i)}
                onClick={() => onPointClick && onPointClick(d)}
              />
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && hoveredIndex !== null && (
          <div
            className="pointer-events-none absolute z-20 rounded-lg border border-slate-700 bg-slate-950/95 p-3 text-xs shadow-2xl backdrop-blur-md"
            style={{
              left: `${Math.min(
                80,
                Math.max(10, ((hoveredIndex / (data.length - 1)) * plotWidth + padding.left) / (svgWidth / 100))
              )}%`,
              top: '15px',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-1.5 mb-2 font-medium text-slate-300">
              <span>Time: {hoveredPoint.time}</span>
              {hoveredPoint.anomaly && (
                <span className="flex items-center gap-1 text-rose-400 font-semibold">
                  <AlertCircle className="h-3 w-3" /> Anomaly
                </span>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-4 text-cyan-400">
                <span>Latency:</span>
                <span className="font-semibold">{hoveredPoint.latency} ms</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-amber-400">
                <span>Packet Loss:</span>
                <span className="font-semibold">{hoveredPoint.packetLoss}%</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-emerald-400">
                <span>Throughput:</span>
                <span className="font-semibold">{hoveredPoint.throughput} Mbps</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-purple-400">
                <span>Jitter:</span>
                <span className="font-semibold">{hoveredPoint.jitter} ms</span>
              </div>
              {hoveredPoint.anomalyNote && (
                <div className="mt-1 pt-1 border-t border-slate-800 text-[11px] text-rose-300">
                  {hoveredPoint.anomalyNote}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Legend & Series Filter Toggles */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-medium border-t border-slate-800/80 pt-3">
        <button
          onClick={() => toggleMetric('latency')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all ${
            activeMetrics.latency
              ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
              : 'bg-slate-800/40 border-slate-800 text-slate-500 line-through'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-[#38bdf8]" />
          <span>Latency (ms)</span>
        </button>

        <button
          onClick={() => toggleMetric('packetLoss')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all ${
            activeMetrics.packetLoss
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
              : 'bg-slate-800/40 border-slate-800 text-slate-500 line-through'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
          <span>Packet Loss (%)</span>
        </button>

        <button
          onClick={() => toggleMetric('throughput')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all ${
            activeMetrics.throughput
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
              : 'bg-slate-800/40 border-slate-800 text-slate-500 line-through'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-[#10b981]" />
          <span>Throughput (Mbps)</span>
        </button>

        <button
          onClick={() => toggleMetric('jitter')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all ${
            activeMetrics.jitter
              ? 'bg-purple-500/10 border-purple-500/40 text-purple-400'
              : 'bg-slate-800/40 border-slate-800 text-slate-500 line-through'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-[#a855f7]" />
          <span>Jitter (ms)</span>
        </button>
      </div>
    </div>
  );
};
