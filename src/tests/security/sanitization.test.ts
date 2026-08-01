import { stripHtml, sanitizeHtml, escapeHtml, sanitizeIdentifier } from "../../platform/security/sanitize";
import { XSS_PAYLOADS, assertSanitized } from "./xss-payloads";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

async function runSuite(name: string, fn: () => Promise<void> | void) {
  console.log(`\n▶ ${name}`);
  try {
    await fn();
    console.log(`  🟢 Passed`);
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error(`  🔴 Failed: ${err.message}`);
    process.exit(1);
  }
}

async function main() {
  console.log("=== Input Sanitization Test Suite ===\n");

  await runSuite("stripHtml removes all HTML tags", () => {
    assert(stripHtml("<b>hello</b>") === "hello", "should strip bold tags");
    assert(stripHtml('<script>alert("xss")</script>') === 'alert("xss")', "should strip script tags");
    assert(stripHtml("plain text") === "plain text", "should pass through plain text");
    assert(stripHtml('<a href="http://evil.com">click</a>') === "click", "should strip links");
  });

  await runSuite("sanitizeHtml allows safe tags only", () => {
    assert(sanitizeHtml("<p>hello</p>").includes("<p>"), "should keep <p>");
    assert(sanitizeHtml("<b>bold</b>").includes("<b>"), "should keep <b>");
    assert(!sanitizeHtml('<script>alert("xss")</script>').includes("<script"), "should remove script");
    assert(!sanitizeHtml('<iframe src="evil.com">').includes("<iframe"), "should remove iframe");
  });

  await runSuite("sanitizeHtml strips event handlers", () => {
    const result = sanitizeHtml('<img src="x" onerror="alert(1)">');
    assert(!result.includes("onerror"), "should remove onerror");
  });

  await runSuite("sanitizeHtml strips javascript: URLs", () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">click</a>');
    assert(!result.includes("javascript:"), "should remove javascript: URL");
  });

  await runSuite("All XSS payloads are neutralized by sanitizeHtml", () => {
    for (const payload of XSS_PAYLOADS) {
      const sanitized = sanitizeHtml(payload);
      assertSanitized(sanitized);
    }
  });

  await runSuite("All XSS payloads are neutralized by stripHtml", () => {
    for (const payload of XSS_PAYLOADS) {
      const stripped = stripHtml(payload);
      assertSanitized(stripped);
    }
  });

  await runSuite("escapeHtml encodes special characters", () => {
    assert(escapeHtml("<") === "&lt;", "should encode <");
    assert(escapeHtml(">") === "&gt;", "should encode >");
    assert(escapeHtml('"') === "&quot;", "should encode quotes");
    assert(escapeHtml("&") === "&amp;", "should encode &");
  });

  await runSuite("sanitizeIdentifier strips dangerous characters", () => {
    assert(sanitizeIdentifier("user@example.com") === "user@example.com", "should keep email chars");
    assert(!sanitizeIdentifier("user'; DROP TABLE --").includes("'"), "should strip quotes");
    assert(!sanitizeIdentifier("user<script>").includes("<"), "should strip angle brackets");
  });

  console.log("\n🎉 All sanitization tests passed!\n");
}

main();
