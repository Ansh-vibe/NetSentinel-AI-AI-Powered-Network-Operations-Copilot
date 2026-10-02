export type HealthStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface MetricDetail {
  value: number;
  unit: string;
  deltaPct: number;
  isHigherWorse: boolean;
  history: number[];
  status: HealthStatus;
  thresholdWarn: number;
  thresholdCrit: number;
}

export interface NetworkKPIPayload {
  timestamp: string;
  overallHealth: HealthStatus;
  activeIncidentsCount: number;
  metrics: {
    latency: MetricDetail;
    packetLoss: MetricDetail;
    throughput: MetricDetail;
    availability: MetricDetail;
    jitter: MetricDetail;
    connectedDevices: number;
    activeTowers: number;
    networkTrafficGbps: number;
  };
  timeSeries: TimeSeriesPoint[];
  towers: CellTowerNode[];
  currentAIAnalysis?: AIAnalysisResult;
}

export interface TimeSeriesPoint {
  time: string;
  latency: number;
  packetLoss: number;
  throughput: number;
  jitter: number;
  anomaly?: boolean;
  anomalyNote?: string;
}

export interface CellTowerNode {
  id: string;
  name: string;
  region: string;
  coordinates: [number, number]; // [x pct, y pct] for world map projection or [lng, lat]
  city: string;
  country: string;
  type: '5G-gNodeB' | '4G-eNodeB' | 'Edge-MEC';
  status: HealthStatus;
  latency: number;
  packetLoss: number;
  throughput: number;
  jitter: number;
  activeUsers: number;
  rsrp: number; // dBm (-140 to -44)
  sinr: number; // dB (-20 to +30)
  ipAddress: string;
  lastUpdated: string;
}

export interface Incident {
  id: string;
  title: string;
  timestamp: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  status: 'Active' | 'Investigating' | 'Mitigated' | 'Resolved';
  region: string;
  towerId: string;
  towerName: string;
  metric: string;
  currentValue: string;
  baselineValue: string;
  rootCause: string;
  impact: string;
  recommendedActions: string[];
  remediationExecuted?: boolean;
  remediationLog?: string[];
}

export interface RemediationActionItem {
  id: string;
  title: string;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  actionType: 'reroute' | 'beamform' | 'restart_mec' | 'rate_limit' | 'optimize_qos';
  estimatedRecoverySec: number;
}

export interface AIAnalysisResult {
  incidentTitle: string;
  severity: HealthStatus;
  probableCause: string;
  confidenceScore: number;
  technicalDetails: string;
  correlatedMetrics: string[];
  impactAssessment: string;
  affectedNodes: string[];
  recommendedActions: RemediationActionItem[];
  telemetrySnapshot: {
    latency: number;
    packetLoss: number;
    throughput: number;
    jitter: number;
    rsrp?: number;
  };
  generatedAt: string;
  sourceModel?: string;
}

export interface CSVRowData {
  timestamp: string;
  tower_id: string;
  region: string;
  cell_type: string;
  latency_ms: number;
  packet_loss_pct: number;
  throughput_mbps: number;
  jitter_ms: number;
  availability_pct: number;
  rsrp_dbm: number;
  sinr_db: number;
  active_users: number;
  status: string;
}
