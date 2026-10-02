# NetSentinel AI - Infrastructure & Serverless Architecture

NetSentinel AI is built on a resilient, high-throughput serverless telemetry architecture designed to process multi-gigabit cellular and edge network telemetry with sub-second anomaly detection and automated AI root-cause analysis.

## Architecture Overview

```
                      NetSentinel AI Cloud Pipeline
                                  │
    ┌─────────────────────────────┼─────────────────────────────┐
    │                             │                             │
Telemetry Ingestion         Serverless Compute           Intelligence Layer
    │                             │                             │
[Cell Towers (gNodeB/eNodeB)]    [AWS API Gateway]         [Google GenAI / Bedrock]
    │                             │                             │
[AWS S3 Telemetry Bucket]  ──►   [AWS Lambda Functions]   ──►  [Gemini 3.8 Flash AI]
                                  │                             │
                           [Amazon DynamoDB]             [Automated Remediation]
```

## Lambda Functions:
1. `getKpis.js`: Streams real-time aggregated metrics (Latency, Packet Loss, Throughput, Availability, Jitter, RSRP, SINR) across towers and regions.
2. `getIncidents.js`: Queries active and historical telecom incidents, MTTR stats, and mitigation audit trails.
3. `analyzeNetwork.js`: Synthesizes multi-variate telemetry spikes, performs statistical anomaly detection, and calls Gemini AI for root-cause diagnosis.
4. `health.js`: Provides liveness/readiness health probes for gateway monitoring.

## Local & Cloud Runtime:
- Local / AI Studio: Full-stack Express + Vite server with live simulated network telemetry, Gemini 3.8 Flash SDK integration, and interactive operations console.
- AWS Deployment: Deploy via `serverless deploy --stage prod`.
