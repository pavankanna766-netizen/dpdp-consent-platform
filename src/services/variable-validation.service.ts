import { AVAILABLE_VARIABLES } from "@/platform/variables/registry";

export interface TemplateValidationResult {
  isValid: boolean;
  detectedVariables: string[];
  unknownVariables: string[];
  warnings: string[];
}

export class VariableValidationService {
  validateTemplate(template: string): TemplateValidationResult {
    if (!template) {
      return { isValid: true, detectedVariables: [], unknownVariables: [], warnings: [] };
    }

    const matches = Array.from(template.matchAll(/\{\{([a-zA-Z0-9._]+)\}\}/g));
    const knownKeys = new Set(AVAILABLE_VARIABLES.map((v) => v.key).concat(["today", "current_year", "this.name", "this.category", "this.country"]));

    const detected = new Set<string>();
    const unknown = new Set<string>();

    for (const match of matches) {
      const key = match[1];
      detected.add(key);
      if (!knownKeys.has(key) && !key.startsWith("custom.")) {
        unknown.add(key);
      }
    }

    const warnings: string[] = Array.from(unknown).map(
      (k) => `Variable {{${k}}} is not a standard registered system variable.`
    );

    return {
      isValid: true, // Non-blocking: missing variables render warnings gracefully
      detectedVariables: Array.from(detected),
      unknownVariables: Array.from(unknown),
      warnings,
    };
  }
}

export const variableValidationService = new VariableValidationService();
