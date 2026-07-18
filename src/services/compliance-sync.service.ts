import { createVendor, listVendors } from "@/repositories/vendor.repository";
import { createInventoryItem, listInventoryItems } from "@/repositories/inventory.repository";
import type { DetectionResult } from "@/modules/scanner/domain/detection";

export async function autoPopulateRegistry(
  companyId: string,
  detections: DetectionResult[]
) {
  // 1. Fetch existing vendors to avoid duplicates
  const { data: existingVendors = [] } = await listVendors(companyId);
  const existingVendorNames = new Set(existingVendors?.map((v) => v.name.toLowerCase()) || []);

  // 2. Fetch existing inventory items to avoid duplicates
  const { data: existingInventory = [] } = await listInventoryItems(companyId);
  const existingInventoryKeys = new Set(
    existingInventory?.map((i) => `${i.category.toLowerCase()}:${(i.shared_with_processor || "").toLowerCase()}`) || []
  );

  for (const detection of detections) {
    const providerName = detection.provider || detection.id;
    const providerLower = providerName.toLowerCase();

    // Mapping detection category to data categories/types
    let dataCategories = ["Usage Data", "Device Information"];
    let dataTypes = ["IP Address", "Browser User Agent", "Unique Cookie ID"];
    let purpose = detection.description || "Web service tracking.";

    if (detection.category === "marketing") {
      dataCategories = ["Advertising Preferences", "Online Identifiers"];
      dataTypes = ["Ad Interaction ID", "Targeting Cookie", "Pixel ID"];
    } else if (detection.category === "payments") {
      dataCategories = ["Transaction details", "Billing information"];
      dataTypes = ["Card network metadata", "Tokenized transaction ID"];
    } else if (detection.category === "support") {
      dataCategories = ["Customer communication logs", "Contact info"];
      dataTypes = ["Support chat history", "Email/Mobile ticket ID"];
    }

    // A. Add to Vendor Registry
    if (!existingVendorNames.has(providerLower)) {
      await createVendor({
        company_id: companyId,
        name: providerName,
        data_categories: dataCategories,
        purpose: purpose,
        agreement_clears_safeguard_bar: false, // Default to false (requires legal review)
        renewal_status: "Active",
        unconfirmed: true, // Scanner auto-discoveries start unconfirmed
      });
      existingVendorNames.add(providerLower);
    }

    // B. Add to Data Inventory
    const inventoryKey = `${detection.category.toLowerCase()}:${providerLower}`;
    if (!existingInventoryKeys.has(inventoryKey)) {
      await createInventoryItem({
        company_id: companyId,
        category: detection.category.charAt(0).toUpperCase() + detection.category.slice(1) + " Tracker",
        data_subject: "Website Visitors",
        purpose: purpose,
        data_types: dataTypes,
        shared_with_processor: providerName,
        legal_basis: detection.requiresConsent ? "Consent (Section 6)" : "Legitimate Use",
        retention_period: "Until withdrawn",
        unconfirmed: true, // Scanner auto-discoveries start unconfirmed
      });
      existingInventoryKeys.add(inventoryKey);
    }
  }
}
