import React, { useState } from 'react';
import { AIAnalysisResult, RemediationActionItem } from '../types';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Play,
  RotateCw,
  FileText,
  ShieldCheck,
  Server,
  Zap,
  Check,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface AIAnalysisPanelProps {
  analysis?: AIAnalysisResult;
  onApplyRemediation: (actionId: string) => Promise<void>;
  onGenerateReport: () => void;
  onRunLiveAnalysis: () => Promise<void>;
  isAnalyzing?: boolean;
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({
  analysis,
  onApplyRemediation,
  onGenerateReport,
  onRunLiveAnalysis,
  isAnalyzing = false,
}) => {
  const [remediatingId, setRemediatingId] = useState<string | null>(null);
  const [appliedActions, setAppliedActions] = useState<Record<string, boolean>>({});

  if (!analysis) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur-md flex flex-col items-center justify-center min-h-[360px]">
        <RotateCw className="h-8 w-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-sm text-slate-300">NetSentinel AI Correlating Telemetry...</p>
      </div>
    );
  }

  const handleRemediate = async (action: RemediationActionItem) => {
    try {
      setRemediatingId(action.id);
      await onApplyRemediation(action.id);
      setAppliedActions((prev) => ({ ...prev, [action.id]: true }));
    } finally {
      setRemediatingId(null);
    }
  };

  const isCritical = analysis.severity === 'CRITICAL';
  const isWarning = analysis.severity === 'WARNING';
  const isHealthy = analysis.severity === 'NORMAL';

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-slate-900/95 p-5 backdrop-blur-md transition-all duration-300 ${
        isCritical
          ? 'border-rose-500/40 shadow-[0_0_30px_-5px_rgba(244,63,94,0.18)]'
          : isWarning
          ? 'border-amber-500/40 shadow-[0_0_30px_-5px_rgba(245,158,11,0.15)]'
          : 'border-emerald-500/30 shadow-[0_0_20px_-5px_rgba(16,185,129,0.12)]'
      }`}
    >
      {/* Glow highlight header background */}
      <div
        className={`absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
        }`}
      />

      {/* Top Header Row */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-white flex items-center gap-1.5">
              AI Analysis
              <span className="text-[10px] font-medium text-slate-400 font-mono">
                {analysis.sourceModel ? `(${analysis.sourceModel})` : '(Gemini 3.8 Flash)'}
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={analysis.severity} size="sm" showPulse={isCritical} />
        </div>
      </div>

      {/* Anomaly Heading */}
      <div className="mb-4">
        <div className="flex items-start gap-2.5">
          {isCritical ? (
            <div className="mt-0.5 rounded-md bg-rose-500/20 p-1 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          ) : isWarning ? (
            <div className="mt-0.5 rounded-md bg-amber-500/20 p-1 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          ) : (
            <div className="mt-0.5 rounded-md bg-emerald-500/20 p-1 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
          )}
          <div>
            <h4
              className={`text-base font-bold ${
                isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {analysis.incidentTitle}
            </h4>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
              <span>Confidence: <strong className="text-white">{analysis.confidenceScore}%</strong></span>
              <span>•</span>
              <span>Updated: <strong className="text-slate-300">Just now</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Probable Cause Section */}
      <div className="mb-4 rounded-lg bg-slate-950/60 p-3.5 border border-slate-800/80">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
          Probable Cause
        </span>
        <p className="text-xs leading-relaxed text-slate-200">
          {analysis.probableCause}
        </p>
        {analysis.technicalDetails && (
          <p className="mt-2 text-[11px] text-slate-400 border-t border-slate-900 pt-2 leading-relaxed">
            {analysis.technicalDetails}
          </p>
        )}
      </div>

      {/* Correlated Metrics Chips */}
      {analysis.correlatedMetrics && analysis.correlatedMetrics.length > 0 && (
        <div className="mb-4">
          <span className="text-[11px] font-medium text-slate-400 block mb-1.5">Correlated Telemetry:</span>
          <div className="flex flex-wrap gap-1.5">
            {analysis.correlatedMetrics.map((item, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-cyan-300 border border-slate-700/60"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Actions List (matching screenshot checkmark list) */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Recommended Actions
          </span>
          <span className="text-[10px] text-slate-400">
            {analysis.recommendedActions.length} auto-executable step{analysis.recommendedActions.length === 1 ? '' : 's'}
          </span>
        </div>

        {analysis.recommendedActions.length === 0 ? (
          <div className="text-xs text-emerald-400/90 py-2 flex items-center gap-1.5 bg-emerald-500/5 rounded p-2 border border-emerald-500/20">
            <CheckCircle2 className="h-4 w-4" />
            <span>Network parameters are nominal. No remediation required.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {analysis.recommendedActions.map((action) => {
              const isRemediating = remediatingId === action.id;
              const isDone = appliedActions[action.id];

              return (
                <div
                  key={action.id}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/40 p-2.5 transition-colors hover:border-slate-700 hover:bg-slate-950/80"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        isDone ? 'bg-emerald-500 text-white' : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {isDone ? <Check className="h-3 w-3 stroke-3" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                        {action.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{action.description}</p>
                    </div>
                  </div>

                  <button
                    disabled={isRemediating || isDone}
                    onClick={() => handleRemediate(action)}
                    className={`shrink-0 flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium border transition-all ${
                      isDone
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default'
                        : isRemediating
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                        : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400'
                    }`}
                  >
                    {isRemediating ? (
                      <>
                        <RotateCw className="h-3 w-3 animate-spin" />
                        <span>Applying...</span>
                      </>
                    ) : isDone ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Applied</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-3 w-3" />
                        <span>Execute</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="space-y-2">
        <button
          onClick={onGenerateReport}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-600/20 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-500 transition-all active:scale-[0.99]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>✨ Generate Incident Report →</span>
        </button>

        <button
          disabled={isAnalyzing}
          onClick={onRunLiveAnalysis}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-750 hover:text-white transition-all disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <RotateCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
              <span>Analyzing Network Live with Gemini 3.8 Flash...</span>
            </>
          ) : (
            <>
              <RotateCw className="h-3.5 w-3.5 text-slate-400" />
              <span>Run Ad-Hoc AI Diagnostic Sweep</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
