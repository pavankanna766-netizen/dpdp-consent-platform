export interface VariableDefinition {
  key: string;
  category: "company" | "scanner" | "inventory" | "vendors" | "policy" | "custom";
  label: string;
  description: string;
  example: string;
}

export const AVAILABLE_VARIABLES: VariableDefinition[] = [
  // Company Variables
  { key: "company.name", category: "company", label: "Company Name", description: "Legal entity name", example: "Acme Corp Ltd" },
  { key: "company.website", category: "company", label: "Company Website", description: "Primary domain website URL", example: "https://acme.com" },
  { key: "company.address", category: "company", label: "Company Address", description: "Registered business address", example: "Mumbai, Maharashtra, India" },
  { key: "company.email", category: "company", label: "Company Support Email", description: "Official support email address", example: "support@acme.com" },
  { key: "company.country", category: "company", label: "Jurisdiction / Country", description: "Primary legal jurisdiction", example: "India" },
  { key: "company.industry", category: "company", label: "Industry Sector", description: "Business classification category", example: "FinTech" },
  { key: "company.size", category: "company", label: "Company Size", description: "Employee count tier", example: "50-250 employees" },
  { key: "company.dpo", category: "company", label: "DPO Name & Contact", description: "Data Protection Officer details", example: "privacy@acme.com" },
  { key: "today", category: "company", label: "Current Date", description: "Today's date formatted", example: "August 2, 2026" },
  { key: "current_year", category: "company", label: "Current Year", description: "Four-digit current calendar year", example: "2026" },

  // Scanner Variables
  { key: "scanner.score", category: "scanner", label: "Privacy Compliance Score", description: "Overall audit score (0-100)", example: "98" },
  { key: "scanner.cookies", category: "scanner", label: "Total Cookie Count", description: "Total cookies detected on domain", example: "12" },
  { key: "scanner.trackers", category: "scanner", label: "Third-Party Trackers", description: "Count of third-party trackers detected", example: "3" },
  { key: "scanner.risk", category: "scanner", label: "Scanner Risk Classification", description: "Calculated risk rating", example: "Low Risk" },
  { key: "scanner.last_scan", category: "scanner", label: "Last Scan Timestamp", description: "Date of latest scanner audit", example: "2026-08-01" },

  // Inventory Variables
  { key: "inventory.categories", category: "inventory", label: "Data Categories", description: "List of processed data categories", example: "Identity Data, Financial Records, Technical Telemetry" },
  { key: "inventory.data_subjects", category: "inventory", label: "Data Subjects", description: "Types of data principal subjects", example: "Customers, Employees, Portal Visitors" },
  { key: "inventory.retention", category: "inventory", label: "Data Retention Schedule", description: "Summary retention policy window", example: "7 Years for Tax/Financial Data" },
  { key: "inventory.total_items", category: "inventory", label: "Inventory Record Count", description: "Total registered processing activities", example: "18" },

  // Vendor Variables
  { key: "vendors.count", category: "vendors", label: "Active Subprocessors Count", description: "Total registered third-party vendors", example: "6" },
  { key: "vendors.names", category: "vendors", label: "Subprocessor Vendor Names", description: "Comma-separated list of vendors", example: "AWS, Supabase, Stripe, Google Analytics" },
  { key: "vendors.third_country", category: "vendors", label: "Cross-Border Jurisdictions", description: "Countries where data is processed", example: "United States, Singapore, EU" },

  // Policy Variables
  { key: "policy.version", category: "policy", label: "Policy Version", description: "Version number of document", example: "v2.0" },
  { key: "policy.generated_date", category: "policy", label: "Generated Date", description: "Document generation timestamp", example: "August 2, 2026" },
  { key: "policy.published_date", category: "policy", label: "Published Date", description: "Legal publication timestamp", example: "August 2, 2026" },
];
