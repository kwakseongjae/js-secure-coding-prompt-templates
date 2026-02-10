# Security Configuration Rules

> OWASP Top 10 2025 - A02: Security Misconfiguration

## Rules

### 1. Disable Verbose Error Messages in Production
- **DO**: Return generic error responses to clients. Log detailed errors server-side only.
- **DON'T**: Expose stack traces, database errors, or internal paths in API responses.
- **WHY**: Verbose errors leak implementation details that attackers use for targeted exploitation.

### 2. Remove Default Credentials and Configurations
- **DO**: Change all default passwords, API keys, and configuration values before deployment.
- **DON'T**: Ship applications with default admin accounts, sample configurations, or debug settings enabled.
- **WHY**: Default credentials are the first thing attackers try and are widely documented.

### 3. Set Secure HTTP Headers
- **DO**: Configure security headers: `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, and `Permissions-Policy`.
- **DON'T**: Rely on framework defaults without verifying which security headers are actually set.
- **WHY**: Security headers provide defense-in-depth against XSS, clickjacking, MIME sniffing, and protocol downgrade attacks.

### 4. Disable Unnecessary Features and Services
- **DO**: Remove or disable unused routes, middleware, debug endpoints, and server features (e.g., directory listing, `X-Powered-By`).
- **DON'T**: Leave development tools, test endpoints, or administrative panels accessible in production.
- **WHY**: Every unnecessary feature expands the attack surface.

### 5. Enforce HTTPS Everywhere
- **DO**: Redirect all HTTP traffic to HTTPS. Use HSTS with a long `max-age` and `includeSubDomains`.
- **DON'T**: Allow mixed content or serve any resources over plain HTTP.
- **WHY**: Unencrypted traffic is vulnerable to interception, modification, and man-in-the-middle attacks.

### 6. Configure CORS Restrictively
- **DO**: Set `Access-Control-Allow-Origin` to specific trusted domains. Validate the `Origin` header server-side.
- **DON'T**: Use `Access-Control-Allow-Origin: *` with credentials or reflect any origin without validation.
- **WHY**: Overly permissive CORS allows malicious sites to make authenticated requests on behalf of users.

### 7. Harden Environment Configuration
- **DO**: Use environment variables or secret managers for sensitive configuration. Validate all config values at startup.
- **DON'T**: Commit secrets to version control or store them in plain-text config files.
- **WHY**: Leaked secrets in repositories are a leading cause of breaches.

## Code Examples

### Bad Practice
```javascript
// Leaking internal details in error responses
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,          // Exposes internals
    query: err.sql,            // Exposes database queries
  });
});

// Permissive CORS
app.use(cors({ origin: "*", credentials: true })); // Dangerous combination

// Hardcoded secrets
const JWT_SECRET = "super-secret-key-123";
const DB_PASSWORD = "admin123";
```

### Good Practice
```javascript
import helmet from "helmet";
import cors from "cors";

// Security headers with helmet
app.use(helmet());
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));

// Remove powered-by header
app.disable("x-powered-by");

// Restrictive CORS
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",") ?? [];
app.use(cors({
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  maxAge: 86400,
}));

// Safe error handler for production
app.use((err, req, res, next) => {
  const errorId = crypto.randomUUID();
  console.error({ errorId, message: err.message, stack: err.stack });
  res.status(err.status ?? 500).json({
    error: "An internal error occurred",
    errorId, // For support reference only
  });
});

// Validate required config at startup
const requiredEnvVars = ["JWT_SECRET", "DATABASE_URL", "ALLOWED_ORIGINS"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

## Quick Checklist
- [ ] No stack traces or internal details in production error responses
- [ ] All default credentials removed or changed
- [ ] Security headers configured (HSTS, CSP, X-Content-Type-Options, etc.)
- [ ] `X-Powered-By` and other fingerprinting headers disabled
- [ ] HTTPS enforced with HSTS
- [ ] CORS configured with specific allowed origins
- [ ] No secrets in source code or version control
- [ ] Unused routes, debug endpoints, and dev tools disabled in production
- [ ] Environment configuration validated at application startup
