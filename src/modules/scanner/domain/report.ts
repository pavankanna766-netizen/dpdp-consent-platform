export interface ScanReport {
  id: string;

  url: string;

  generatedAt: string;

  score: number;

  risk: string;

  cookies: number;

  trackers: number;

  findings: number;

  detections: DetectionReport[];

  compliance: ComplianceReport[];
}

export interface DetectionReport {
  id: string;

  provider: string;

  category: string;
}

export interface ComplianceReport {
  id: string;

  title: string;

  recommendation: string;

  severity: string;
}