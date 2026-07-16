import {
  getScanJob,
} from "@/repositories/scanner.repository";

import {
  mapScanJob,
} from "./job.mapper";

export class JobService {
  async get(
    companyId: string,
    id: string
  ) {
    const { data } =
      await getScanJob(companyId, id);

    if (!data) {
      return null;
    }

    return mapScanJob(data);
  }
}

export const jobService =
  new JobService();