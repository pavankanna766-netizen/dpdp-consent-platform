import { listAuditLogs } from "@/repositories/audit.repository";
import { listVendors } from "@/repositories/vendor.repository";
import { listInventoryItems } from "@/repositories/inventory.repository";
import { listRequests as listDsarRequests } from "@/repositories/dsar.repository";
import { listBreachIncidents } from "@/repositories/breach.repository";

export type ComplianceReportType = "audit" | "vendors" | "inventory" | "dsar" | "breach" | "full_compliance";

export async function generateEnterpriseComplianceReport(
  companyId: string,
  reportType: ComplianceReportType,
  format: "json" | "csv" = "json"
): Promise<{ filename: string; content: string; contentType: string }> {
  const timestamp = new Date().toISOString().split("T")[0];

  if (reportType === "audit") {
    const { data: logs } = await listAuditLogs(companyId, { pageSize: 1000 });
    const content = format === "json" ? JSON.stringify(logs || [], null, 2) : convertToCSV(logs || []);
    return {
      filename: `privystack_audit_report_${companyId}_${timestamp}.${format}`,
      content,
      contentType: format === "json" ? "application/json" : "text/csv",
    };
  }

  if (reportType === "vendors") {
    const { data: vendors } = await listVendors(companyId);
    const content = format === "json" ? JSON.stringify(vendors || [], null, 2) : convertToCSV(vendors || []);
    return {
      filename: `privystack_vendor_registry_${companyId}_${timestamp}.${format}`,
      content,
      contentType: format === "json" ? "application/json" : "text/csv",
    };
  }

  if (reportType === "inventory") {
    const { data: inventory } = await listInventoryItems(companyId);
    const content = format === "json" ? JSON.stringify(inventory || [], null, 2) : convertToCSV(inventory || []);
    return {
      filename: `privystack_data_inventory_${companyId}_${timestamp}.${format}`,
      content,
      contentType: format === "json" ? "application/json" : "text/csv",
    };
  }

  if (reportType === "dsar") {
    const { data: dsar } = await listDsarRequests(companyId);
    const content = format === "json" ? JSON.stringify(dsar || [], null, 2) : convertToCSV(dsar || []);
    return {
      filename: `privystack_dsar_report_${companyId}_${timestamp}.${format}`,
      content,
      contentType: format === "json" ? "application/json" : "text/csv",
    };
  }

  if (reportType === "breach") {
    const { data: breach } = await listBreachIncidents(companyId);
    const content = format === "json" ? JSON.stringify(breach || [], null, 2) : convertToCSV(breach || []);
    return {
      filename: `privystack_breach_report_${companyId}_${timestamp}.${format}`,
      content,
      contentType: format === "json" ? "application/json" : "text/csv",
    };
  }

  // Full Compliance Aggregate
  const [vendorsRes, inventoryRes, dsarRes, breachRes] = await Promise.all([
    listVendors(companyId),
    listInventoryItems(companyId),
    listDsarRequests(companyId),
    listBreachIncidents(companyId),
  ]);

  const fullReport = {
    company_id: companyId,
    generated_at: new Date().toISOString(),
    vendors_count: vendorsRes.data?.length ?? 0,
    inventory_items_count: inventoryRes.data?.length ?? 0,
    dsar_requests_count: dsarRes.data?.length ?? 0,
    breach_incidents_count: breachRes.data?.length ?? 0,
    vendors: vendorsRes.data ?? [],
    inventory: inventoryRes.data ?? [],
    dsar: dsarRes.data ?? [],
    breach: breachRes.data ?? [],
  };

  return {
    filename: `privystack_enterprise_compliance_${companyId}_${timestamp}.json`,
    content: JSON.stringify(fullReport, null, 2),
    contentType: "application/json",
  };
}

function convertToCSV(items: Array<Record<string, unknown>>): string {
  if (!items || items.length === 0) return "";
  const headers = Object.keys(items[0]);
  const csvRows = [headers.join(",")];

  for (const row of items) {
    const values = headers.map((header) => {
      const val = row[header];
      const escaped = String(val ?? "").replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}
