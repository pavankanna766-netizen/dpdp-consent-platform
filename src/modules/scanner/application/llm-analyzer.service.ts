import { getPublishedPrivacyPolicy } from "@/repositories/privacy-policy.repository";
import { getPublishedCookiePolicy } from "@/repositories/cookie-policy.repository";
import { createFindings } from "@/repositories/finding.repository";
import type { DetectionResult } from "../domain/detection";
import type { CookieInfo } from "../domain/types";
import { logger } from "@/platform/logger";

export async function runLlmGapAnalysis(
  companyId: string,
  scanId: string,
  detections: DetectionResult[],
  cookies: CookieInfo[]
) {
  // 1. Fetch any published policies for context
  const { data: privacyPolicy } = await getPublishedPrivacyPolicy(companyId);
  const { data: cookiePolicy } = await getPublishedCookiePolicy(companyId);

  const policyText = `
    [PRIVACY POLICY CONTENT]
    ${privacyPolicy?.html_content || "No privacy policy found."}
    
    [COOKIE POLICY CONTENT]
    ${cookiePolicy?.html_content || "No cookie policy found."}
  `;

  const observedTrackers = detections.map((d) => d.tracker.provider || d.tracker.id);
  const observedCookies = cookies.map((c) => c.name);

  const apiKey = process.env.GEMINI_API_KEY;

  let report = {
    disclosed: [] as string[],
    observed: observedTrackers,
    mismatches: [] as string[],
    recommendations: [] as string[],
  };

  if (!apiKey) {
    logger.warn("GEMINI_API_KEY is not defined. Skipping live LLM gap analysis, generating mock report.");
    
    // Quick heuristic comparison
    const policyLower = policyText.toLowerCase();
    const missed = observedTrackers.filter((t) => !policyLower.includes(t.toLowerCase()));
    
    report.mismatches = missed.map((t) => `${t} is active on the website but is not disclosed in the privacy policy.`);
    report.recommendations = missed.map((t) => `Add disclosures regarding the data collection, categories, and purpose of ${t} to satisfy DPDP Section 5 notice requirements.`);
  } else {
    try {
      const prompt = `
        You are a compliance officer auditing a website under the Indian Digital Personal Data Protection (DPDP) Act, 2023.
        Analyze the observed tracking scripts and cookies running on the website against the existing policy text.
        
        Observed Trackers: ${JSON.stringify(observedTrackers)}
        Observed Cookies: ${JSON.stringify(observedCookies)}
        Existing Policy Text:
        ${policyText}
        
        Generate a structured JSON gap report comparing what is running (observed) vs. what the company declares (disclosed).
        
        Return ONLY a JSON object of this structure:
        {
          "disclosed": ["list of vendors declared in the policy text"],
          "observed": ["list of observed trackers"],
          "mismatches": ["list of statements describing trackers that are running but missing from policy disclosures"],
          "recommendations": ["list of actions describing policy updates required to satisfy DPDP Section 5"]
        }
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const responseText = json.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        report = JSON.parse(responseText);
      } else {
        logger.error("Gemini API call failed:", response.statusText);
      }
    } catch (error) {
      logger.error("Failed to execute live LLM Gap Analysis:", error);
    }
  }

  // 3. Persist the gap report as a high-severity finding in the audit trail
  if (report.mismatches.length > 0) {
    const findingsList = report.mismatches.map((mismatch, idx) => ({
      scan_id: scanId,
      severity: "high" as const,
      title: mismatch.slice(0, 100),
      recommendation: report.recommendations[idx] || "Update notice disclosures.",
      resolved: false,
    }));
    await createFindings(findingsList);
  }

  return report;
}
