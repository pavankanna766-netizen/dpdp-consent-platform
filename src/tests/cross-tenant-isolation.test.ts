/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { supabaseAdmin } from "../lib/supabase/admin";

// Mock DB with two companies
const ORG_A_ID = 'org-a-uuid-1111';
const ORG_B_ID = 'org-b-uuid-2222';

const mockDbStore: Record<string, any[]> = {};

// Supabase Client Mock
const mockClient = {
  rpc: (name: string, args: any) => {
    return Promise.resolve({ data: null, error: null });
  },
  from: (table: string) => {
    if (!mockDbStore[table]) mockDbStore[table] = [];
    
    const createChain = (initialFilters: {col: string, val: any}[] = [], action: 'select' | 'update' | 'delete', updateValues?: any) => {
      const filters = [...initialFilters];
      
      const applyFilters = () => {
        return mockDbStore[table].filter(item => {
          return filters.every(f => item[f.col] === f.val);
        });
      };

      const chain: any = {
        eq: (col: string, val: any) => {
          filters.push({col, val});
          return chain;
        },
        order: () => chain,
        limit: () => chain,
        range: () => chain,
        single: () => {
          const results = applyFilters();
          if (action === 'select') {
            return Promise.resolve({ data: results.length > 0 ? results[0] : null, error: null });
          } else if (action === 'update') {
            if (results.length > 0) {
              Object.assign(results[0], updateValues);
              return Promise.resolve({ data: results[0], error: null });
            }
            return Promise.resolve({ data: null, error: null });
          } else if (action === 'delete') {
             if (results.length > 0) {
                 const toDelete = results[0];
                 mockDbStore[table] = mockDbStore[table].filter(item => item !== toDelete);
                 return Promise.resolve({ data: toDelete, error: null });
             }
             return Promise.resolve({ data: null, error: null });
          }
        },
        maybeSingle: () => chain.single(),
        then: (onfulfilled: any) => {
          const results = applyFilters();
          if (action === 'select') {
             return Promise.resolve({ data: results, error: null }).then(onfulfilled);
          } else if (action === 'update') {
             results.forEach(r => Object.assign(r, updateValues));
             return Promise.resolve({ data: results, error: null }).then(onfulfilled);
          } else if (action === 'delete') {
             const toDeleteIds = new Set(results.map(r => r.id));
             mockDbStore[table] = mockDbStore[table].filter(item => !toDeleteIds.has(item.id));
             return Promise.resolve({ data: results, error: null }).then(onfulfilled);
          }
        }
      };
      return chain;
    };

    return {
      insert: (values: any) => {
        const record = { id: `mock-uuid-${Date.now()}-${Math.random()}`, ...values };
        mockDbStore[table].push(record);
        return {
          select: () => ({
            single: () => Promise.resolve({ data: record, error: null }),
            maybeSingle: () => Promise.resolve({ data: record, error: null })
          })
        };
      },
      update: (values: any) => createChain([], 'update', values),
      select: (fields: string = "*") => createChain([], 'select'),
      delete: () => createChain([], 'delete')
    };
  }
};

// Override the methods of supabaseAdmin
Object.assign(supabaseAdmin, mockClient);

// Import repositories
import { createConsent, getConsentById } from "../repositories/consent.repository";
import { createAuditLog, listAuditLogs } from "../repositories/audit.repository";
import { createRequest as createDsarRequest, getRequestById as getDsarRequest } from "../repositories/dsar.repository";
import { createScan, getScan } from "../repositories/scanner.repository";
import { createPrivacyPolicy, getPrivacyPolicyById } from "../repositories/privacy-policy.repository";
import { createBanner, getCompanyBanner } from "../repositories/banner.repository";
import { createCompanySettings, getCompanySettings } from "../repositories/company-settings.repository";
import { createVendor, listVendors } from "../repositories/vendor.repository";
import { createInventoryItem, listInventoryItems } from "../repositories/inventory.repository";
import { createBillingTransaction, getBillingTransactions } from "../repositories/billing.repository";
import { createBreachIncident, listBreachIncidents } from "../repositories/breach.repository";

// Test assertion helper
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function runSuite(name: string, fn: () => Promise<void>) {
  console.log(`\n▶ Starting Test Suite: ${name}`);
  try {
    await fn();
    console.log(`🟢 Suite Passed: ${name}`);
  } catch (error: any) {
    console.error(`🔴 Suite Failed: ${name}`);
    console.error(error.stack || error.message || error);
    process.exit(1);
  }
}

// 1. Consent Repository Isolation
async function testConsentIsolation() {
  const result = await createConsent({
    company_id: ORG_A_ID,
    user_identifier: "user@orga.com",
    status: "granted",
    ip_address: "127.0.0.1",
    user_agent: "test"
  });
  const consentId = result.data!.id;

  // Attempt to read as Org A (Should succeed)
  const aRead = await getConsentById(ORG_A_ID, consentId);
  assert(!!aRead.data, "Org A should see its own consent");

  // Attempt to read as Org B (Should fail)
  const bRead = await getConsentById(ORG_B_ID, consentId);
  assert(!bRead.data, "Org B should NOT see Org A's consent");
}

// 2. Audit Log Isolation
async function testAuditLogIsolation() {
  await createAuditLog({
    company_id: ORG_A_ID,
    user_id: "user_a",
    action: "test_action",
    resource_type: "test_resource",
    resource_id: "res_1",
    ip_address: "127.0.0.1"
  });

  const bLogs = await listAuditLogs(ORG_B_ID, { limit: 10, offset: 0 });
  assert(bLogs.data?.length === 0, "Org B should NOT see Org A's audit logs");
}

// 3. DSAR Request Isolation
async function testDsarIsolation() {
  const result = await createDsarRequest({
    company_id: ORG_A_ID,
    subject_email: "test@orga.com",
    request_type: "access",
    status: "pending"
  });
  const dsarId = result.data!.id;

  const bRead = await getDsarRequest(ORG_B_ID, dsarId);
  assert(!bRead.data, "Org B should NOT see Org A's DSAR request");
}

// 4. Scanner Isolation
async function testScannerIsolation() {
  const result = await createScan({
    company_id: ORG_A_ID,
    url: "https://orga.com",
    status: "running",
    stage: "init",
    progress: 10,
    started_at: new Date().toISOString()
  });
  const scanId = result.data!.id;

  const bRead = await getScan(ORG_B_ID, scanId);
  assert(!bRead.data, "Org B should NOT see Org A's scan");
}

// 5. Policy Isolation
async function testPolicyIsolation() {
  const result = await createPrivacyPolicy({
    company_id: ORG_A_ID,
    html_content: "<h1>Org A Privacy Policy</h1>"
  });
  const policyId = result.data!.id;

  const bRead = await getPrivacyPolicyById(ORG_B_ID, policyId);
  assert(!bRead.data, "Org B should NOT see Org A's privacy policy");
}

// 6. Banner Isolation
async function testBannerIsolation() {
  const result = await createBanner({
    company_id: ORG_A_ID,
    name: "Org A Banner"
  });
  const bannerId = result.data!.id;

  const bRead = await getCompanyBanner(ORG_B_ID, bannerId);
  assert(!bRead.data, "Org B should NOT see Org A's banner");
}

// 7. Company Settings Isolation
async function testCompanySettingsIsolation() {
  await createCompanySettings({
    company_id: ORG_A_ID,
    default_language: "en"
  });

  const bRead = await getCompanySettings(ORG_B_ID);
  assert(!bRead.data, "Org B should NOT see Org A's settings");
}

// 8. Vendor Registry Isolation
async function testVendorIsolation() {
  await createVendor({
    company_id: ORG_A_ID,
    name: "Vendor A",
    category: "Analytics"
  });

  const bList = await listVendors(ORG_B_ID);
  assert(bList.data?.length === 0, "Org B should NOT see Org A's vendors");
}

// 9. Data Inventory Isolation
async function testInventoryIsolation() {
  await createInventoryItem({
    company_id: ORG_A_ID,
    data_category: "PII",
    purpose: "Testing",
    retention_period: "1 year"
  });

  const bList = await listInventoryItems(ORG_B_ID);
  assert(bList.data?.length === 0, "Org B should NOT see Org A's inventory");
}

// 10. Billing Isolation
async function testBillingIsolation() {
  await createBillingTransaction({
    company_id: ORG_A_ID,
    amount: 100,
    currency: "USD",
    status: "succeeded",
    transaction_type: "subscription"
  });

  const bList = await getBillingTransactions(ORG_B_ID);
  assert(bList.data?.length === 0, "Org B should NOT see Org A's billing transactions");
}

// 11. Breach Incident Isolation
async function testBreachIsolation() {
  await createBreachIncident({
    company_id: ORG_A_ID,
    title: "Breach A",
    description: "Details",
    status: "investigating",
    severity: "high"
  });

  const bList = await listBreachIncidents(ORG_B_ID);
  assert(bList.data?.length === 0, "Org B should NOT see Org A's breach incidents");
}

async function main() {
  console.log("==================================================");
  console.log("🚀 Cross-Tenant Data Isolation Test Suite");
  console.log("==================================================");

  await runSuite("Consent Repository Isolation", testConsentIsolation);
  await runSuite("Audit Log Isolation", testAuditLogIsolation);
  await runSuite("DSAR Request Isolation", testDsarIsolation);
  await runSuite("Scanner Isolation", testScannerIsolation);
  await runSuite("Policy Isolation", testPolicyIsolation);
  await runSuite("Banner Isolation", testBannerIsolation);
  await runSuite("Company Settings Isolation", testCompanySettingsIsolation);
  await runSuite("Vendor Registry Isolation", testVendorIsolation);
  await runSuite("Data Inventory Isolation", testInventoryIsolation);
  await runSuite("Billing Isolation", testBillingIsolation);
  await runSuite("Breach Incident Isolation", testBreachIsolation);

  console.log("\\n🎉 All cross-tenant isolation tests passed successfully!\\n");
  process.exit(0);
}

main();
