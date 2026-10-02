import { CellTowerNode, Incident, NetworkKPIPayload, TimeSeriesPoint, AIAnalysisResult, HealthStatus, CSVRowData } from '../../src/types';
import { INITIAL_AI_ANALYSIS, INITIAL_INCIDENTS, INITIAL_TIME_SERIES, INITIAL_TOWERS } from '../sampleData';
import { runAIIncidentAnalysis } from './aiAnalyzer';

class NetworkStateManager {
  private towers: CellTowerNode[] = JSON.parse(JSON.stringify(INITIAL_TOWERS));
  private timeSeries: TimeSeriesPoint[] = JSON.parse(JSON.stringify(INITIAL_TIME_SERIES));
  private incidents: Incident[] = JSON.parse(JSON.stringify(INITIAL_INCIDENTS));
  private currentAIAnalysis: AIAnalysisResult = JSON.parse(JSON.stringify(INITIAL_AI_ANALYSIS));

  // Current global aggregated metrics
  private latency = 82.0;
  private latencyDelta = 34.0;
  private packetLoss = 8.7;
  private packetLossDelta = 12.0;
  private throughput = 41.2;
  private throughputDelta = -22.0;
  private availability = 98.2;
  private availabilityDelta = 0.8;
  private jitter = 28.4;
  private jitterDelta = 18.5;
  private connectedDevices = 16840;
  private networkTrafficGbps = 24.8;

  private currentScenario: string = 'packet_loss_spike';

  constructor() {
    // Start background telemetry tick for realistic NOC vitality
    setInterval(() => {
      this.tickTelemetry();
    }, 4000);
  }

  private tickTelemetry() {
    // Natural slight jitter around the active state
    const noise = (Math.random() - 0.5) * 0.8;
    const lossNoise = (Math.random() - 0.5) * 0.15;
    const tpNoise = (Math.random() - 0.5) * 1.2;

    this.latency = Math.max(12, Number((this.latency + noise * 0.5).toFixed(1)));
    this.packetLoss = Math.max(0.02, Number((this.packetLoss + lossNoise * 0.2).toFixed(2)));
    this.throughput = Math.max(10, Number((this.throughput + tpNoise).toFixed(1)));
    this.jitter = Math.max(1.5, Number((this.jitter + noise * 0.3).toFixed(1)));

    // Update the last time series point slightly or add a new point periodically
    const lastPoint = this.timeSeries[this.timeSeries.length - 1];
    if (lastPoint) {
      lastPoint.latency = this.latency;
      lastPoint.packetLoss = this.packetLoss;
      lastPoint.throughput = this.throughput;
      lastPoint.jitter = this.jitter;
    }
  }

  public getKpis(): NetworkKPIPayload {
    const overallHealth: HealthStatus =
      this.packetLoss > 5.0 || this.latency > 75
        ? 'CRITICAL'
        : this.packetLoss > 2.0 || this.latency > 45
        ? 'WARNING'
        : 'NORMAL';

    return {
      timestamp: new Date().toISOString(),
      overallHealth,
      activeIncidentsCount: this.incidents.filter((i) => i.status === 'Active' || i.status === 'Investigating').length,
      metrics: {
        latency: {
          value: this.latency,
          unit: 'ms',
          deltaPct: this.latencyDelta,
          isHigherWorse: true,
          history: this.timeSeries.map((t) => t.latency),
          status: this.latency > 70 ? 'CRITICAL' : this.latency > 45 ? 'WARNING' : 'NORMAL',
          thresholdWarn: 45,
          thresholdCrit: 70,
        },
        packetLoss: {
          value: this.packetLoss,
          unit: '%',
          deltaPct: this.packetLossDelta,
          isHigherWorse: true,
          history: this.timeSeries.map((t) => t.packetLoss),
          status: this.packetLoss > 5.0 ? 'CRITICAL' : this.packetLoss > 2.0 ? 'WARNING' : 'NORMAL',
          thresholdWarn: 2.0,
          thresholdCrit: 5.0,
        },
        throughput: {
          value: this.throughput,
          unit: 'Mbps',
          deltaPct: this.throughputDelta,
          isHigherWorse: false,
          history: this.timeSeries.map((t) => t.throughput),
          status: this.throughput < 50 ? 'WARNING' : 'NORMAL',
          thresholdWarn: 80,
          thresholdCrit: 40,
        },
        availability: {
          value: this.availability,
          unit: '%',
          deltaPct: this.availabilityDelta,
          isHigherWorse: false,
          history: [99.9, 99.8, 99.7, 99.5, 99.1, 98.6, 98.2],
          status: this.availability < 97 ? 'CRITICAL' : this.availability < 99 ? 'WARNING' : 'NORMAL',
          thresholdWarn: 99.0,
          thresholdCrit: 97.0,
        },
        jitter: {
          value: this.jitter,
          unit: 'ms',
          deltaPct: this.jitterDelta,
          isHigherWorse: true,
          history: this.timeSeries.map((t) => t.jitter),
          status: this.jitter > 20 ? 'CRITICAL' : this.jitter > 10 ? 'WARNING' : 'NORMAL',
          thresholdWarn: 10,
          thresholdCrit: 20,
        },
        connectedDevices: this.connectedDevices,
        activeTowers: this.towers.length,
        networkTrafficGbps: this.networkTrafficGbps,
      },
      timeSeries: this.timeSeries,
      towers: this.towers,
      currentAIAnalysis: this.currentAIAnalysis,
    };
  }

  public getIncidents(): Incident[] {
    return this.incidents;
  }

  public async triggerAnomalySimulation(scenario: string): Promise<NetworkKPIPayload> {
    this.currentScenario = scenario;
    const now = new Date();
    const timeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (scenario === 'packet_loss_spike') {
      this.latency = 82.0;
      this.latencyDelta = 34.0;
      this.packetLoss = 8.7;
      this.packetLossDelta = 12.0;
      this.throughput = 41.2;
      this.throughputDelta = -22.0;
      this.availability = 98.2;
      this.jitter = 28.4;

      // Mark US East Tower critical
      this.towers = this.towers.map((t) => {
        if (t.id === 'TWR-US-E1-04') {
          return {
            ...t,
            status: 'CRITICAL',
            latency: 82.0,
            packetLoss: 8.7,
            throughput: 41.2,
            jitter: 28.4,
            rsrp: -104,
            sinr: 6.4,
          };
        }
        return t;
      });

      this.timeSeries.push({
        time: timeLabel,
        latency: 82,
        packetLoss: 8.7,
        throughput: 41,
        jitter: 28.4,
        anomaly: true,
        anomalyNote: 'Packet Loss Anomaly Triggered',
      });
      if (this.timeSeries.length > 15) this.timeSeries.shift();
    } else if (scenario === '5g_core_latency') {
      this.latency = 124.5;
      this.latencyDelta = 68.0;
      this.packetLoss = 4.2;
      this.packetLossDelta = 8.4;
      this.throughput = 35.0;
      this.throughputDelta = -35.0;
      this.availability = 97.4;
      this.jitter = 42.0;

      this.towers = this.towers.map((t) => {
        if (t.id === 'TWR-EU-W2-03' || t.id === 'TWR-US-E1-04') {
          return { ...t, status: 'CRITICAL', latency: 125, packetLoss: 4.8, jitter: 44 };
        }
        return t;
      });

      this.timeSeries.push({
        time: timeLabel,
        latency: 124.5,
        packetLoss: 4.2,
        throughput: 35,
        jitter: 42,
        anomaly: true,
        anomalyNote: '5G Core Gateway Congestion',
      });
      if (this.timeSeries.length > 15) this.timeSeries.shift();
    } else if (scenario === 'fiber_cut') {
      this.latency = 94.0;
      this.latencyDelta = 52.0;
      this.packetLoss = 14.5;
      this.packetLossDelta = 28.0;
      this.throughput = 18.0;
      this.throughputDelta = -55.0;
      this.availability = 94.8;
      this.jitter = 36.5;

      this.towers = this.towers.map((t) => {
        if (t.id === 'TWR-SA-E1-07') {
          return { ...t, status: 'CRITICAL', packetLoss: 16.8, latency: 110 };
        }
        return t;
      });

      this.timeSeries.push({
        time: timeLabel,
        latency: 94,
        packetLoss: 14.5,
        throughput: 18,
        jitter: 36.5,
        anomaly: true,
        anomalyNote: 'Subsea Fiber Cable Cut / Transport Fallback',
      });
      if (this.timeSeries.length > 15) this.timeSeries.shift();
    } else if (scenario === 'tower_overload') {
      this.latency = 65.0;
      this.latencyDelta = 26.0;
      this.packetLoss = 3.6;
      this.packetLossDelta = 5.2;
      this.throughput = 62.0;
      this.throughputDelta = -18.0;
      this.availability = 98.9;
      this.jitter = 19.2;

      this.towers = this.towers.map((t) => {
        if (t.id === 'TWR-AP-NE1-05') {
          return { ...t, status: 'WARNING', activeUsers: 8900, latency: 62, throughput: 110 };
        }
        return t;
      });

      this.timeSeries.push({
        time: timeLabel,
        latency: 65,
        packetLoss: 3.6,
        throughput: 62,
        jitter: 19.2,
        anomaly: true,
        anomalyNote: 'Cell Tower Capacity Saturation',
      });
      if (this.timeSeries.length > 15) this.timeSeries.shift();
    } else {
      // Normal / Baseline
      return this.resetToNominal();
    }

    // Refresh AI analysis on the anomaly
    this.currentAIAnalysis = await runAIIncidentAnalysis({
      towers: this.towers,
      activeMetrics: {
        latency: this.latency,
        packetLoss: this.packetLoss,
        throughput: this.throughput,
        jitter: this.jitter,
        availability: this.availability,
      },
      anomalyDescription: `Anomaly simulation triggered: ${scenario}`,
    });

    return this.getKpis();
  }

  public async resetToNominal(): Promise<NetworkKPIPayload> {
    this.latency = 22.5;
    this.latencyDelta = -12.4;
    this.packetLoss = 0.12;
    this.packetLossDelta = -85.0;
    this.throughput = 485.0;
    this.throughputDelta = 18.0;
    this.availability = 99.98;
    this.availabilityDelta = 1.2;
    this.jitter = 3.2;
    this.jitterDelta = -24.0;

    this.towers = this.towers.map((t) => ({
      ...t,
      status: 'NORMAL',
      latency: Number((18 + Math.random() * 8).toFixed(1)),
      packetLoss: Number((0.05 + Math.random() * 0.1).toFixed(2)),
      throughput: Number((420 + Math.random() * 120).toFixed(1)),
      jitter: Number((2.0 + Math.random() * 2).toFixed(1)),
      rsrp: -78,
      sinr: 21.5,
    }));

    const now = new Date();
    const timeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.timeSeries.push({
      time: timeLabel,
      latency: 22.5,
      packetLoss: 0.12,
      throughput: 485.0,
      jitter: 3.2,
      anomaly: false,
    });
    if (this.timeSeries.length > 15) this.timeSeries.shift();

    // Mark active incidents as mitigated or resolved
    this.incidents = this.incidents.map((inc) => ({
      ...inc,
      status: 'Resolved',
      remediationExecuted: true,
      remediationLog: [
        ...(inc.remediationLog || []),
        `${new Date().toLocaleTimeString()} - Autonomous resolution verified. All KPIs returned to SLA baseline.`,
      ],
    }));

    this.currentAIAnalysis = await runAIIncidentAnalysis({
      towers: this.towers,
      activeMetrics: {
        latency: this.latency,
        packetLoss: this.packetLoss,
        throughput: this.throughput,
        jitter: this.jitter,
        availability: this.availability,
      },
      anomalyDescription: 'All network services operating within normal baseline specifications.',
    });

    return this.getKpis();
  }

  public async applyRemediation(actionId: string, incidentId?: string): Promise<{ success: boolean; message: string; kpis: NetworkKPIPayload }> {
    // Execute smart remediation step
    const targetAction = this.currentAIAnalysis.recommendedActions.find((a) => a.id === actionId) || {
      id: actionId,
      title: 'Automated Network Path Optimization',
      description: 'Diverted traffic and recalibrated RF parameters.',
    };

    // Recover network to nominal healthy range
    this.latency = 24.8;
    this.latencyDelta = -42.0;
    this.packetLoss = 0.18;
    this.packetLossDelta = -94.0;
    this.throughput = 460.0;
    this.throughputDelta = 45.0;
    this.availability = 99.95;
    this.jitter = 3.8;

    // Set affected towers back to normal
    this.towers = this.towers.map((t) => ({
      ...t,
      status: 'NORMAL',
      latency: Number((20 + Math.random() * 6).toFixed(1)),
      packetLoss: 0.14,
      throughput: 440.0,
      jitter: 3.2,
      rsrp: -80,
      sinr: 19.8,
    }));

    const now = new Date();
    const timeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.timeSeries.push({
      time: timeLabel,
      latency: 24.8,
      packetLoss: 0.18,
      throughput: 460,
      jitter: 3.8,
      anomaly: false,
    });
    if (this.timeSeries.length > 15) this.timeSeries.shift();

    // Update incident status
    const targetIncident = incidentId
      ? this.incidents.find((i) => i.id === incidentId)
      : this.incidents.find((i) => i.status === 'Active' || i.status === 'Investigating');

    if (targetIncident) {
      targetIncident.status = 'Mitigated';
      targetIncident.remediationExecuted = true;
      targetIncident.remediationLog = [
        ...(targetIncident.remediationLog || []),
        `${new Date().toLocaleTimeString()} - Executed action: "${targetAction.title}". Recovery confirmed.`,
      ];
    }

    // Refresh AI analysis to show mitigated status
    this.currentAIAnalysis = {
      incidentTitle: 'Anomaly Mitigated - Remediation Successful',
      severity: 'NORMAL',
      probableCause: `Automated remediation '${targetAction.title}' executed successfully. Secondary transport path engaged and radio interference mitigated.`,
      confidenceScore: 97.4,
      technicalDetails: `Sub-second BGP fast-reroute complete. Interfaces reporting zero frame drops. Round trip time restored from 82ms to 24.8ms. Packet loss reduced from 8.7% to 0.18%.`,
      correlatedMetrics: ['Zero Packet Drops', 'Optimal SINR (+21dB)', 'SFP Rx Signal Normal (-14dBm)'],
      impactAssessment: 'All 2,490 subscribers successfully restored to full 5G bandwidth.',
      affectedNodes: [],
      recommendedActions: [],
      telemetrySnapshot: {
        latency: this.latency,
        packetLoss: this.packetLoss,
        throughput: this.throughput,
        jitter: this.jitter,
      },
      generatedAt: new Date().toISOString(),
      sourceModel: 'NetSentinel AI Operations Engine',
    };

    return {
      success: true,
      message: `Successfully executed: ${targetAction.title}. Core telemetry restored to baseline SLA.`,
      kpis: this.getKpis(),
    };
  }

  public async runLiveAnalysis(): Promise<AIAnalysisResult> {
    this.currentAIAnalysis = await runAIIncidentAnalysis({
      towers: this.towers,
      activeMetrics: {
        latency: this.latency,
        packetLoss: this.packetLoss,
        throughput: this.throughput,
        jitter: this.jitter,
        availability: this.availability,
      },
      anomalyDescription: 'Operator-initiated ad-hoc AI deep diagnostic sweep',
    });
    return this.currentAIAnalysis;
  }

  public async ingestCSVData(rows: CSVRowData[]): Promise<{ count: number; anomaliesDetected: number; kpis: NetworkKPIPayload }> {
    if (!rows || rows.length === 0) {
      return { count: 0, anomaliesDetected: 0, kpis: this.getKpis() };
    }

    let anomalies = 0;
    // Update or populate towers from rows
    const towerMap = new Map<string, CellTowerNode>();
    for (const t of this.towers) {
      towerMap.set(t.id, t);
    }

    // Generate new time series points from rows
    const newTimeSeries: TimeSeriesPoint[] = [];

    rows.forEach((r) => {
      const isAnomaly = r.packet_loss_pct > 3.0 || r.latency_ms > 60 || r.status === 'CRITICAL' || r.status === 'WARNING';
      if (isAnomaly) anomalies++;

      // Update tower in map if matching
      const existing = towerMap.get(r.tower_id);
      if (existing) {
        existing.latency = r.latency_ms;
        existing.packetLoss = r.packet_loss_pct;
        existing.throughput = r.throughput_mbps;
        existing.jitter = r.jitter_ms;
        existing.activeUsers = r.active_users;
        existing.rsrp = r.rsrp_dbm;
        existing.sinr = r.sinr_db;
        existing.status = r.packet_loss_pct > 5.0 || r.latency_ms > 75 ? 'CRITICAL' : r.packet_loss_pct > 2.0 || r.latency_ms > 45 ? 'WARNING' : 'NORMAL';
      }

      const timeOnly = r.timestamp.includes('T') ? r.timestamp.split('T')[1].substring(0, 5) : r.timestamp;
      newTimeSeries.push({
        time: timeOnly,
        latency: r.latency_ms,
        packetLoss: r.packet_loss_pct,
        throughput: r.throughput_mbps,
        jitter: r.jitter_ms,
        anomaly: isAnomaly,
        anomalyNote: isAnomaly ? `Ingested anomaly: Loss ${r.packet_loss_pct}%, Latency ${r.latency_ms}ms` : undefined,
      });
    });

    if (newTimeSeries.length > 0) {
      this.timeSeries = newTimeSeries.slice(-15);
      const lastRow = rows[rows.length - 1];
      this.latency = lastRow.latency_ms;
      this.packetLoss = lastRow.packet_loss_pct;
      this.throughput = lastRow.throughput_mbps;
      this.jitter = lastRow.jitter_ms;
      this.availability = lastRow.availability_pct;
    }

    this.towers = Array.from(towerMap.values());

    // Trigger AI triage on ingested data
    this.currentAIAnalysis = await runAIIncidentAnalysis({
      towers: this.towers,
      activeMetrics: {
        latency: this.latency,
        packetLoss: this.packetLoss,
        throughput: this.throughput,
        jitter: this.jitter,
        availability: this.availability,
      },
      anomalyDescription: `CSV Ingestion: Processed ${rows.length} telemetric rows with ${anomalies} anomalies flagged`,
    });

    return {
      count: rows.length,
      anomaliesDetected: anomalies,
      kpis: this.getKpis(),
    };
  }
}

export const networkState = new NetworkStateManager();
