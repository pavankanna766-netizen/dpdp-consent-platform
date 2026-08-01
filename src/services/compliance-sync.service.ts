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
    const purpose = detection.tracker.description || "Web service tracking.";

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
        category: "Analytics & Marketing",
        data_categories: dataCategories,
        data_received: dataTypes,
        purpose: purpose,
        dpa_uploaded: false,
        country: "United States",
        scc_required: true,
        security_rating: "A",
        status: "under_review",
        scanner_discovered: true,
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
        processing_activity: "Web Analytics & Telemetry",
        data_subject: "Website Visitors",
        purpose: purpose,
        data_types: dataTypes,
        shared_with_processor: providerName,
        legal_basis: detection.tracker.requiresConsent ? "Consent (Section 6)" : "Legitimate Use",
        retention_period: "Until withdrawn",
        storage_location: "AWS ap-south-1 (Mumbai)",
        cross_border_transfer: true,
        transfer_countries: ["United States"],
        encryption_status: "AES-256 / TLS 1.3",
        status: "active",
        ai_classification_confidence: 0.96,
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
