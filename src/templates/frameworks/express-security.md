# Express/Node.js Security Rules

> Security rules for Express.js and Node.js server applications, covering middleware hardening, input validation, and secure error handling.

## Rules

### 1. Use Helmet Middleware for HTTP Security Headers
- **DO**: Install and apply `helmet()` as early as possible in the middleware chain. Fine-tune individual headers (CSP, HSTS, X-Frame-Options) based on your application's needs.
- **DON'T**: Serve responses without security headers. Never rely on the browser's default behavior to protect against clickjacking, MIME sniffing, or missing HSTS.
- **WHY**: Helmet sets critical HTTP response headers that mitigate entire classes of attacks (XSS, clickjacking, MIME confusion) with minimal configuration effort.

### 2. Configure CORS Explicitly — Never Use Wildcard Origins
- **DO**: Set specific allowed origins in your CORS configuration. Validate the `Origin` header against a strict allowlist. Restrict `methods` and `allowedHeaders` to only what the client needs.
- **DON'T**: Use `origin: "*"` or reflect the request `Origin` header back without validation. Never combine `credentials: true` with a wildcard origin.
- **WHY**: Wildcard CORS allows any website to make cross-origin requests to your API. Combined with credentials, this lets attackers perform authenticated actions on behalf of users via malicious sites.

### 3. Apply Rate Limiting to All Endpoints
- **DO**: Use `express-rate-limit` (or similar) globally, with stricter limits on authentication, password reset, and payment endpoints. Include `keyGenerator` based on authenticated user ID where possible.
- **DON'T**: Leave endpoints unprotected from high-volume requests. Never rely solely on IP-based rate limiting behind shared proxies without `trust proxy` configuration.
- **WHY**: Rate limiting prevents brute-force attacks, credential stuffing, and denial-of-service. Without it, attackers can enumerate users, brute-force passwords, or exhaust server resources.

### 4. Set Body Parser Size Limits
- **DO**: Configure explicit size limits on `express.json()` and `express.urlencoded()` (e.g., `limit: "100kb"`). Set even stricter limits for file uploads using multer or busboy.
- **DON'T**: Accept unlimited request body sizes. Never use default parser settings in production without reviewing limits.
- **WHY**: Oversized payloads can exhaust server memory, cause out-of-memory crashes, or be used in denial-of-service attacks. A 10MB JSON body can block the event loop during parsing.

### 5. Configure `trust proxy` Correctly
- **DO**: Set `trust proxy` to the exact number of proxies in front of your app (e.g., `app.set("trust proxy", 1)` for one reverse proxy). Validate your setup by logging `req.ip` in staging.
- **DON'T**: Set `trust proxy` to `true` (trusts all proxies) in production. Never leave it unconfigured when behind a load balancer.
- **WHY**: Incorrect `trust proxy` settings make `req.ip` unreliable. Attackers can spoof `X-Forwarded-For` headers to bypass IP-based rate limiting and access controls.

### 6. Never Expose Stack Traces or Internal Details in Error Responses
- **DO**: Use a centralized error handler that returns generic error messages to clients and logs full error details (stack trace, query, context) server-side only.
- **DON'T**: Send `err.stack`, `err.message`, or database error details in API responses. Never use Express's default error handler in production.
- **WHY**: Stack traces reveal file paths, library versions, database schemas, and internal logic. Attackers use this information for targeted exploitation.

### 7. Use Parameterized Queries for All Database Operations
- **DO**: Use parameterized queries, prepared statements, or ORM query builders (Knex, Prisma, Sequelize) for all database operations. Validate and sanitize inputs before they reach the query layer.
- **DON'T**: Concatenate or template-literal user input into SQL or NoSQL query strings. Never build MongoDB queries with unsanitized `req.body` objects.
- **WHY**: SQL and NoSQL injection remain top attack vectors. Parameterized queries separate code from data, making injection structurally impossible regardless of input content.

## Code Examples

### Bad Practice
```javascript
const express = require("express");
const app = express();

// No helmet, no security headers
app.use(express.json()); // No size limit

// Wildcard CORS — any site can call this API
const cors = require("cors");
app.use(cors({ origin: "*", credentials: true }));

// Stack trace leaked in error response
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message, stack: err.stack });
});

// SQL injection via string concatenation
app.get("/api/users", async (req, res) => {
  const query = `SELECT * FROM users WHERE name = '${req.query.name}'`;
  const users = await db.raw(query);
  res.json(users);
});

// No rate limiting on login
app.post("/api/login", async (req, res) => {
  const user = await authenticate(req.body.email, req.body.password);
  res.json({ token: generateToken(user) });
});
```

### Good Practice
```javascript
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

// Security headers
app.use(helmet());

// Strict CORS
app.use(cors({
  origin: ["https://app.example.com"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// Body size limit
app.use(express.json({ limit: "100kb" }));

// Trust proxy (behind one reverse proxy)
app.set("trust proxy", 1);

// Global rate limit
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Strict rate limit on auth
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
app.post("/api/login", authLimiter, async (req, res) => {
  const user = await authenticate(req.body.email, req.body.password);
  res.json({ token: generateToken(user) });
});

// Parameterized query (Knex example)
app.get("/api/users", async (req, res) => {
  const users = await db("users").where("name", req.query.name);
  res.json(users);
});

// Centralized error handler — no stack trace leakage
app.use((err, req, res, next) => {
  console.error(err); // Full details server-side only
  res.status(err.status || 500).json({ error: "Internal server error" });
});
```

## Quick Checklist
- [ ] `helmet()` is applied before all route handlers
- [ ] CORS `origin` is set to specific allowed domains, not `"*"`
- [ ] `express-rate-limit` is applied globally and with stricter limits on auth endpoints
- [ ] `express.json()` and `express.urlencoded()` have explicit `limit` set
- [ ] `trust proxy` is set to the correct number of proxies, not `true`
- [ ] Error handler returns generic messages; stack traces are logged server-side only
- [ ] All database queries use parameterized queries or ORM query builders
