import type {
  ComplianceFinding,
} from "../domain/compliance-rule";

export function mapFindings(
  scanId: string,
  findings: ComplianceFinding[]
) {
  return findings.map(
    (finding) => ({
      scan_id: scanId,

      severity:
        finding.severity,

      title:
        finding.title,

      recommendation:
        finding.recommendation,

      resolved: false,
    })
  );
}