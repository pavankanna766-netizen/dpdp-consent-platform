import { createVendor, listVendors } from "@/repositories/vendor.repository";
import { createInventoryItem, listInventoryItems, linkInventoryToVendor } from "@/repositories/inventory.repository";
import type { DetectionResult } from "@/modules/scanner/domain/detection";

export async function autoPopulateRegistry(
  companyId: string,
  detections: DetectionResult[]
) {
  // 1. Fetch existing vendors to check for duplicates
  const { data: existingVendors = [] } = await listVendors(companyId);

  // 2. Fetch existing inventory items to check for duplicates
  const { data: existingInventory = [] } = await listInventoryItems(companyId);

  for (const detection of detections) {
    const providerName = detection.tracker.provider || detection.tracker.id;
    const providerLower = providerName.toLowerCase();

    // Mapping detection category to data categories/types
    let dataCategories = ["Usage Data", "Device Information"];
    let dataTypes = ["IP Address", "Browser User Agent", "Unique Cookie ID"];
    let purpose = detection.tracker.description || "Web service tracking.";

    if (detection.tracker.category === "marketing") {
      dataCategories = ["Advertising Preferences", "Online Identifiers"];
      dataTypes = ["Ad Interaction ID", "Targeting Cookie", "Pixel ID"];
    } else if (detection.tracker.category === "payments") {
      dataCategories = ["Transaction details", "Billing information"];
      dataTypes = ["Card network metadata", "Tokenized transaction ID"];
    } else if (detection.tracker.category === "support") {
      dataCategories = ["Customer communication logs", "Contact info"];
      dataTypes = ["Support chat history", "Email/Mobile ticket ID"];
    }

    // A. Ensure Vendor exists
    let vendor = existingVendors?.find((v) => v.name.toLowerCase() === providerLower);
    if (!vendor) {
      const { data: newVendor } = await createVendor({
        company_id: companyId,
        name: providerName,
        data_categories: dataCategories,
        purpose: purpose,
        agreement_clears_safeguard_bar: false, // Default to false (requires legal review)
        renewal_status: "Active",
        unconfirmed: true, // Scanner auto-discoveries start unconfirmed
      });
      if (newVendor) {
        vendor = newVendor;
        existingVendors?.push(newVendor);
      }
    }

    // B. Ensure Data Inventory item exists
    const categoryName = detection.tracker.category.charAt(0).toUpperCase() + detection.tracker.category.slice(1) + " Tracker";
    let inventoryItem = existingInventory?.find(
      (i) => i.category.toLowerCase() === categoryName.toLowerCase() &&
             (i.shared_with_processor || "").toLowerCase() === providerLower
    );
    if (!inventoryItem) {
      const { data: newInventoryItem } = await createInventoryItem({
        company_id: companyId,
        category: categoryName,
        data_subject: "Website Visitors",
        purpose: purpose,
        data_types: dataTypes,
        shared_with_processor: providerName,
        legal_basis: detection.tracker.requiresConsent ? "Consent (Section 6)" : "Legitimate Use",
        retention_period: "Until withdrawn",
        unconfirmed: true, // Scanner auto-discoveries start unconfirmed
      });
      if (newInventoryItem) {
        inventoryItem = newInventoryItem;
        existingInventory?.push(newInventoryItem);
      }
    }

    // C. Create relational link inside the join table
    if (inventoryItem && vendor) {
      await linkInventoryToVendor(inventoryItem.id, vendor.id);
    }
  }
}
