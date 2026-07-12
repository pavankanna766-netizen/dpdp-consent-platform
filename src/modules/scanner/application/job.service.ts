import {
  getScanJob,
} from "@/repositories/scanner.repository";

import {
  mapScanJob,
} from "./job.mapper";

export class JobService {
  async get(
    id: string
  ) {
    const { data } =
      await getScanJob(id);

    if (!data) {
      return null;
    }

    return mapScanJob(data);
  }
}

export const jobService =
  new JobService();