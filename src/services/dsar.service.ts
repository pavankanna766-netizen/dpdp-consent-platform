import {
  createRequest,
  getRequestById,
  listRequests,
  updateRequestStatus,
} from "@/repositories/dsar.repository";

import {
  publishEvent,
  PlatformEvents,
} from "@/platform";

export async function createDsarRequest(values: {
  company_id: string;
  subject_identifier: string;
  request_type: string;
  description: string | null;
}) {
  const { data, error } =
    await createRequest(values);

  if (error) throw error;

  await publishEvent(
    PlatformEvents.REQUEST_CREATED,
    {
      requestId: data.id,
      companyId: data.company_id,
      subject: data.subject_identifier,
      type: data.request_type,
    }
  );

  return data;
}

export async function getCompanyRequests(
  companyId: string
) {
  const { data, error } =
    await listRequests(companyId);

  if (error) throw error;

  return data;
}

export async function getRequest(
  companyId: string,
  id: string
) {
  const { data, error } =
    await getRequestById(companyId, id);

  if (error) throw error;

  return data;
}

export async function completeRequest(
  companyId: string,
  id: string
) {
  const { data, error } =
    await updateRequestStatus(
      companyId,
      id,
      "completed"
    );

  if (error) throw error;

  await publishEvent(
    PlatformEvents.REQUEST_COMPLETED,
    {
      requestId: data.id,
      companyId: data.company_id,
      subject: data.subject_identifier,
    }
  );

  return data;
}

export async function getRequestStatistics(
  companyId: string
) {
  const requests =
    await getCompanyRequests(companyId);

  return {
    total: requests.length,

    pending: requests.filter(
      (r) => r.status === "pending"
    ).length,

    completed: requests.filter(
      (r) => r.status === "completed"
    ).length,
  };
}