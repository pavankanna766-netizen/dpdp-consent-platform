export interface ScanContext {
  companyId: string;
  url: string;
}

export interface ScanPipeline {
  execute(
    context: ScanContext
  ): Promise<string>;
}

export class ScanOrchestrator {
  constructor(
    private readonly pipeline: ScanPipeline
  ) {}

  async scan(
    context: ScanContext
  ): Promise<string> {
    return this.pipeline.execute(
      context
    );
  }
}