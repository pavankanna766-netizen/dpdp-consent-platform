import type {
  DetectionResult,
} from "../domain/detection";

export function mapDetections(
  scanId: string,
  detections: DetectionResult[]
) {
  return detections.map(
    (detection) => ({
      scan_id: scanId,

      provider:
        detection.tracker.provider,

      category:
        detection.tracker.category,

      confidence:
        detection.confidence,

      matched_by:
        detection.matchedBy.join(","),

      requires_consent:
        detection.tracker.requiresConsent,

      description:
        detection.tracker.description,
    })
  );
}