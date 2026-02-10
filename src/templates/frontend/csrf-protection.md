# CSRF Protection Security Rules

> Frontend Security - Cross-Site Request Forgery (CSRF) Defense

## Rules

### 1. Implement Anti-CSRF Tokens
- **DO**: Generate a unique, unpredictable CSRF token per session or per request. Include it in every state-changing request.
- **DON'T**: Rely on cookies alone for authentication of state-changing requests.
- **WHY**: CSRF attacks exploit the browser's automatic cookie inclusion. Tokens add a second factor that attackers cannot obtain cross-origin.

### 2. Use SameSite Cookie Attribute
- **DO**: Set `SameSite=Strict` for session cookies where possible, or `SameSite=Lax` as a minimum.
- **DON'T**: Use `SameSite=None` without `Secure` flag, or omit the SameSite attribute entirely.
- **WHY**: SameSite prevents browsers from sending cookies with cross-origin requests, providing a strong defense-in-depth layer.

### 3. Verify Origin and Referer Headers
- **DO**: On the server, validate `Origin` or `Referer` headers match your domain for state-changing requests.
- **DON'T**: Accept requests without origin validation, especially for API endpoints that modify data.
- **WHY**: Origin/Referer verification is a supplementary defense that blocks cross-origin form submissions and fetch requests.

### 4. Use Custom Request Headers for APIs
- **DO**: Require a custom header (e.g., `X-Requested-With`) for all API requests. Simple forms cannot set custom headers.
- **DON'T**: Accept state-changing requests that could originate from simple HTML forms without additional verification.
- **WHY**: Browsers enforce that cross-origin requests with custom headers trigger a CORS preflight, which fails unless explicitly allowed.

### 5. Separate Read and Write Operations
- **DO**: Use GET only for read operations. Use POST, PUT, PATCH, DELETE for state-changing operations.
- **DON'T**: Use GET requests for actions that modify data (e.g., `/api/delete-account?confirm=true`).
- **WHY**: GET requests can be triggered by `<img>` tags, links, and redirects, making them trivially exploitable for CSRF.

### 6. Implement Double-Submit Cookie Pattern When Stateless
- **DO**: Set a random value in a cookie and require the same value in a request header or body. Compare both server-side.
- **DON'T**: Use a predictable or static value for the double-submit token.
- **WHY**: This pattern works without server-side token storage, suitable for stateless APIs and SPAs.

## Code Examples

### Bad Practice
```javascript
// State-changing GET request
app.get("/api/transfer", authenticate, async (req, res) => {
  await transferFunds(req.user.id, req.query.to, req.query.amount);
  res.json({ success: true });
});

// No CSRF protection on form submission
app.post("/api/change-email", authenticate, async (req, res) => {
  await db.updateEmail(req.user.id, req.body.email);
  res.json({ success: true });
});

// SameSite not set
res.cookie("session", token, { httpOnly: true, secure: true }); // Missing SameSite
```

### Good Practice
```javascript
import crypto from "node:crypto";

// CSRF token generation and validation middleware
function csrfProtection() {
  return (req, res, next) => {
    // Generate token for GET requests
    if (req.method === "GET") {
      const token = crypto.randomBytes(32).toString("hex");
      req.session.csrfToken = token;
      res.locals.csrfToken = token;
      return next();
    }

    // Validate token for state-changing requests
    const token = req.headers["x-csrf-token"] ?? req.body._csrf;
    if (!token || token !== req.session.csrfToken) {
      return res.status(403).json({ error: "Invalid CSRF token" });
    }
    next();
  };
}

// Apply CSRF protection
app.use(csrfProtection());

// Secure cookie with SameSite
res.cookie("session", token, {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 3600_000,
  path: "/",
});

// Origin validation middleware
function validateOrigin(allowedOrigins) {
  return (req, res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    const origin = req.headers.origin ?? req.headers.referer;
    if (!origin) {
      return res.status(403).json({ error: "Missing origin header" });
    }
    const requestOrigin = new URL(origin).origin;
    if (!allowedOrigins.includes(requestOrigin)) {
      return res.status(403).json({ error: "Invalid origin" });
    }
    next();
  };
}

app.use(validateOrigin(["https://myapp.example.com"]));

// Frontend: Include CSRF token in requests
async function securePost(url, data) {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
  return fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
      "X-Requested-With": "fetch",
    },
    body: JSON.stringify(data),
  });
}

// Double-submit cookie pattern for SPAs
function doubleSubmitCsrf() {
  return (req, res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      const token = crypto.randomBytes(32).toString("hex");
      res.cookie("csrf", token, { sameSite: "strict", secure: true });
      return next();
    }
    const cookieToken = req.cookies.csrf;
    const headerToken = req.headers["x-csrf-token"];
    if (!cookieToken || cookieToken !== headerToken) {
      return res.status(403).json({ error: "CSRF validation failed" });
    }
    next();
  };
}
```

## Quick Checklist
- [ ] CSRF tokens included in all state-changing requests
- [ ] Session cookies set with `SameSite=Strict` or `SameSite=Lax`
- [ ] `Origin` / `Referer` headers validated server-side
- [ ] GET requests never used for state-changing operations
- [ ] Custom headers required for API requests (`X-Requested-With`)
- [ ] CSRF tokens are cryptographically random and per-session
- [ ] Frontend fetch/axios includes CSRF token in headers
