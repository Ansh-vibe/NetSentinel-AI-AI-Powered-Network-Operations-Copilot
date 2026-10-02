import React from 'react';
import { HealthStatus } from '../types';

interface StatusBadgeProps {
  status: HealthStatus | 'Active' | 'Investigating' | 'Mitigated' | 'Resolved' | 'LOW' | 'MEDIUM' | 'HIGH' | 'INFO';
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showPulse = false }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'CRITICAL':
      case 'Active':
      case 'HIGH':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-500',
          label: status,
        };
      case 'WARNING':
      case 'Investigating':
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-500',
          label: status,
        };
      case 'NORMAL':
      case 'Mitigated':
      case 'Resolved':
      case 'LOW':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-500',
          label: status,
        };
      case 'INFO':
        return {
          bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
          dot: 'bg-cyan-400',
          label: status,
        };
      default:
        return {
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          dot: 'bg-blue-500',
          label: status,
        };
    }
  };

  const { bg, dot, label } = getBadgeConfig();
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : size === 'lg'
      ? 'px-3 py-1.5 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-xs ${bg} ${sizeClasses}`}
    >
      <span className="relative flex h-2 w-2">
        {showPulse && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${dot}`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${dot}`} />
      </span>
      <span>{label}</span>
    </span>
  );
};
