import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { MetricDetail } from '../types';

interface KPICardProps {
  title: string;
  metric: MetricDetail;
  icon: React.ReactNode;
  accentColor?: 'red' | 'amber' | 'emerald' | 'cyan' | 'purple';
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  metric,
  icon,
  accentColor = 'cyan',
  onClick,
}) => {
  const isBadTrend = metric.isHigherWorse ? metric.deltaPct > 0 : metric.deltaPct < 0;

  // Generate SVG path for sparkline
  const generateSparkline = (data: number[]) => {
    if (!data || data.length < 2) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 120;
    const height = 36;
    const padding = 4;

    const points = data.map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((val - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  const sparklinePath = generateSparkline(metric.history);

  // Border & Glow based on status
  const getCardStyle = () => {
    if (metric.status === 'CRITICAL') {
      return {
        border: 'border-rose-500/40 hover:border-rose-500/70',
        glow: 'shadow-[0_0_20px_-3px_rgba(244,63,94,0.15)]',
        sparkStroke: '#f43f5e',
        sparkFill: 'rgba(244, 63, 94, 0.1)',
        badgeText: 'text-rose-400',
        badgeBg: 'bg-rose-500/10 border-rose-500/30',
        iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      };
    }
    if (metric.status === 'WARNING') {
      return {
        border: 'border-amber-500/40 hover:border-amber-500/70',
        glow: 'shadow-[0_0_20px_-3px_rgba(245,158,11,0.15)]',
        sparkStroke: '#f59e0b',
        sparkFill: 'rgba(245, 158, 11, 0.1)',
        badgeText: 'text-amber-400',
        badgeBg: 'bg-amber-500/10 border-amber-500/30',
        iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      };
    }
    return {
      border: 'border-slate-800/80 hover:border-slate-700',
      glow: 'shadow-lg shadow-black/20',
      sparkStroke: '#10b981',
      sparkFill: 'rgba(16, 185, 129, 0.08)',
      badgeText: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
  };

  const style = getCardStyle();

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border bg-slate-900/80 p-4.5 backdrop-blur-md transition-all duration-200 ${style.border} ${style.glow} cursor-pointer group`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg border ${style.iconBg}`}>{icon}</div>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</span>
        </div>
        <div
          className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold border ${
            isBadTrend ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}
        >
          {metric.deltaPct > 0 ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          <span>{Math.abs(metric.deltaPct)}%</span>
        </div>
      </div>

      {/* Metric Value & Sparkline */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-white">{metric.value}</span>
            <span className="text-xs font-medium text-slate-400">{metric.unit}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {metric.status === 'CRITICAL' ? (
              <span className="text-rose-400 font-medium">Critical SLA breached</span>
            ) : metric.status === 'WARNING' ? (
              <span className="text-amber-400 font-medium">Elevated threshold</span>
            ) : (
              <span className="text-emerald-400 font-medium">Within nominal range</span>
            )}
          </p>
        </div>

        {/* Mini SVG Sparkline */}
        <div className="relative w-28 h-9 flex items-center justify-end">
          <svg viewBox="0 0 120 36" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={style.sparkStroke} stopOpacity="0.3" />
                <stop offset="100%" stopColor={style.sparkStroke} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {sparklinePath && (
              <>
                <path d={`${sparklinePath} L 116 36 L 4 36 Z`} fill={`url(#gradient-${title})`} />
                <path
                  d={sparklinePath}
                  fill="none"
                  stroke={style.sparkStroke}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Sub-threshold progress bar */}
      <div className="mt-3 h-1 w-full rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            metric.status === 'CRITICAL'
              ? 'bg-rose-500'
              : metric.status === 'WARNING'
              ? 'bg-amber-500'
              : 'bg-emerald-500'
          }`}
          style={{
            width: `${Math.min(100, Math.max(10, (metric.value / (metric.thresholdCrit * 1.2 || 100)) * 100))}%`,
          }}
        />
      </div>
    </div>
  );
};
