import { AVAILABLE_VARIABLES, type VariableDefinition } from "@/platform/variables/registry";
import { resolverService, type ResolvedContext } from "./resolver.service";
import { variableValidationService } from "./variable-validation.service";

export class VariableService {
  listAvailable(): VariableDefinition[] {
    return AVAILABLE_VARIABLES;
  }

  async resolveDocumentTemplate(companyId: string, templateHtml: string): Promise<string> {
    const context = await resolverService.buildContext(companyId);
    return resolverService.resolveTemplate(templateHtml, context);
  }

  async getContext(companyId: string): Promise<ResolvedContext> {
    return resolverService.buildContext(companyId);
  }

  validateTemplate(templateHtml: string) {
    return variableValidationService.validateTemplate(templateHtml);
  }
}

export const variableService = new VariableService();
