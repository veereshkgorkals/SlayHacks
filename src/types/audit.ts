export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type ArchLayer =
  | "FRONTEND"
  | "API"
  | "AI_SERVICE"
  | "DATABASE"
  | "EXTERNAL";

export interface VulnerabilityItem {
  id: string;
  title: string;
  severity: Severity;
  filePath: string;
  lineRange: string;
  category: string;
  description: string;
  exploitScenario: string;
  vulnerableCode: string;
  patchedCode: string;
}

export interface ArchNodeData {
  id: string;
  label: string;
  layer: ArchLayer;
  filePath: string;
  riskScore: number;
  summary: string;
}

export interface ArchEdgeData {
  id: string;
  source: string;
  target: string;
  label: string;
  protocol?: string;
}

export interface AuditStats {
  totalFiles: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export interface AuditReport {
  repoName: string;
  repoUrl: string;
  owner: string;
  analyzedAt: string;
  securityScore: number;
  summary: string;
  stats: AuditStats;
  nodes: ArchNodeData[];
  edges: ArchEdgeData[];
  vulnerabilities: VulnerabilityItem[];
}
