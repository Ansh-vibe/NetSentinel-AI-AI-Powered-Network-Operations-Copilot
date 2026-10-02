import React, { useState } from 'react';
import { Incident } from '../types';
import { Search, Filter, ShieldAlert, CheckCircle2, ChevronRight, Activity, ArrowRight, Zap } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface IncidentTableProps {
  incidents: Incident[];
  onSelectIncident?: (incident: Incident) => void;
  onMitigate?: (incidentId: string) => void;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({
  incidents,
  onSelectIncident,
  onMitigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.towerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 backdrop-blur-md overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-cyan-400" />
              Telecom Incident Log & Audit Trail
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical breaches, carrier alarms, and autonomous remediation history
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search tower, id, cause..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 sm:w-60 rounded-lg border border-slate-700 bg-slate-950/60 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950/60 px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Info</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950/60 px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Investigating">Investigating</option>
              <option value="Mitigated">Mitigated</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3 font-medium">Incident ID</th>
              <th className="px-4 py-3 font-medium">Severity</th>
              <th className="px-4 py-3 font-medium">Affected Cell / Tower</th>
              <th className="px-4 py-3 font-medium">Breached Telemetry</th>
              <th className="px-4 py-3 font-medium">Root Cause</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredIncidents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No incidents found matching current filters
                </td>
              </tr>
            ) : (
              filteredIncidents.map((incident) => {
                const isCritical = incident.severity === 'CRITICAL';
                return (
                  <tr
                    key={incident.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectIncident && onSelectIncident(incident)}
                  >
                    <td className="px-4 py-3.5 font-mono text-cyan-400 font-medium">
                      {incident.id}
                      <span className="block text-[10px] text-slate-500 font-sans">{incident.timestamp}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={incident.severity} size="sm" showPulse={isCritical && incident.status === 'Active'} />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-slate-200 block">{incident.towerName}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wide">{incident.region}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`font-semibold ${isCritical ? 'text-rose-400' : 'text-amber-400'}`}>
                        {incident.currentValue}
                      </span>
                      <span className="block text-[10px] text-slate-500">Baseline: {incident.baselineValue}</span>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs truncate text-slate-300">
                      {incident.rootCause}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={incident.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {incident.status === 'Active' || incident.status === 'Investigating' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onMitigate) onMitigate(incident.id);
                          }}
                          className="inline-flex items-center gap-1 rounded bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 text-[11px] font-medium text-cyan-400 hover:bg-cyan-500/20 transition-all"
                        >
                          <Zap className="h-3 w-3" />
                          <span>Remediate</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Remediated</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
