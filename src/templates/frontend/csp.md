# Content Security Policy Rules

> Frontend Security - Content Security Policy (CSP)

## Rules

### 1. Implement a Strict CSP
- **DO**: Define a Content-Security-Policy header that restricts script sources. Start with `default-src 'self'` and add specific directives as needed.
- **DON'T**: Use a permissive CSP (`default-src *`) or skip CSP entirely.
- **WHY**: CSP is the strongest browser-level defense against XSS. A strict policy prevents execution of injected scripts even if an XSS vulnerability exists.

### 2. Use Nonce-Based or Hash-Based Script Loading
- **DO**: Generate a unique cryptographic nonce per request and apply it to all `<script>` tags via `nonce` attribute. Set `script-src 'nonce-<value>'` in the CSP header.
- **DON'T**: Use `'unsafe-inline'` or `'unsafe-eval'` in `script-src`.
- **WHY**: `'unsafe-inline'` defeats the purpose of CSP. Nonces ensure only server-generated scripts execute.

### 3. Restrict Object and Frame Sources
- **DO**: Set `object-src 'none'` and `frame-ancestors 'self'` (or specific origins) to prevent plugin abuse and clickjacking.
- **DON'T**: Allow unrestricted embedding of your site in iframes or loading of Flash/Java plugins.
- **WHY**: Plugins can bypass other security controls. Unrestricted framing enables clickjacking attacks.

### 4. Enable CSP Reporting
- **DO**: Set `report-uri` or `report-to` directives to collect CSP violation reports. Monitor them for XSS attempts and policy issues.
- **DON'T**: Deploy CSP without monitoring. Use `Content-Security-Policy-Report-Only` for testing before enforcement.
- **WHY**: CSP reports reveal real attack attempts and policy misconfigurations without breaking the application.

### 5. Avoid Overly Broad Whitelists
- **DO**: Whitelist specific origins (e.g., `script-src 'self' https://cdn.specific.com`). Use `strict-dynamic` with nonces for dynamically loaded scripts.
- **DON'T**: Whitelist entire CDN domains like `*.cloudflare.com` or `*.googleapis.com` that host arbitrary user content.
- **WHY**: Broad domain whitelists can be bypassed using JSONP endpoints or user-uploaded scripts on those domains.

### 6. Apply CSP to All Response Types
- **DO**: Set CSP headers on HTML responses, error pages, and API responses that might be rendered by browsers.
- **DON'T**: Only apply CSP to your main pages, leaving error pages, login pages, or admin panels unprotected.
- **WHY**: Attackers target pages without CSP protection. Consistent application ensures no gaps.

## Code Examples

### Bad Practice
```javascript
// Permissive CSP that provides minimal protection
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src *; script-src * 'unsafe-inline' 'unsafe-eval'");
  next();
});

// Inline script without nonce (blocked by strict CSP)
// <script>doSomething();</script>
```

### Good Practice
```javascript
import crypto from "node:crypto";

// Strict nonce-based CSP middleware
function cspMiddleware(req, res, next) {
  const nonce = crypto.randomBytes(16).toString("base64");
  res.locals.cspNonce = nonce;

  const csp = [
    `default-src 'self'`,
    `script-src 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' data: https:`,
    `font-src 'self'`,
    `connect-src 'self' https://api.example.com`,
    `frame-ancestors 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `report-uri /csp-report`,
  ].join("; ");

  res.setHeader("Content-Security-Policy", csp);
  next();
}

app.use(cspMiddleware);

// CSP violation report endpoint
app.post("/csp-report", express.json({ type: "application/csp-report" }), (req, res) => {
  const report = req.body["csp-report"];
  logger.warn({
    type: "csp_violation",
    blockedUri: report["blocked-uri"],
    violatedDirective: report["violated-directive"],
    documentUri: report["document-uri"],
    sourceFile: report["source-file"],
    lineNumber: report["line-number"],
  });
  res.sendStatus(204);
});

// HTML template using nonce
function renderPage(res, content) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <link rel="stylesheet" href="/styles/main.css" nonce="${res.locals.cspNonce}">
    </head>
    <body>
      ${content}
      <script nonce="${res.locals.cspNonce}" src="/js/app.js"></script>
    </body>
    </html>
  `;
}

// Next.js CSP configuration (next.config.js)
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'", // Next.js requires unsafe-inline; use nonce in custom server
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "object-src 'none'",
              "frame-ancestors 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};
```

## Quick Checklist
- [ ] CSP header set on all HTML responses
- [ ] `default-src 'self'` as baseline
- [ ] `script-src` uses nonces or hashes (no `'unsafe-inline'` or `'unsafe-eval'`)
- [ ] `object-src 'none'` set to block plugins
- [ ] `frame-ancestors` set to prevent clickjacking
- [ ] `base-uri 'self'` to prevent base tag hijacking
- [ ] CSP reporting configured and monitored
- [ ] `Content-Security-Policy-Report-Only` used for testing before enforcement
- [ ] No overly broad CDN domain whitelists
