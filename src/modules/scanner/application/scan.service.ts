import {
  ScanOrchestrator,
  type ScanContext,
} from "./scan-orchestrator";

export class ScanService {
  constructor(
    private readonly orchestrator: ScanOrchestrator
  ) {}

  async scan(
    context: ScanContext
  ): Promise<string> {
    return this.orchestrator.scan(
      context
    );
  }
}