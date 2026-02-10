# Security Logging and Alerting Rules

> OWASP Top 10 2025 - A09: Security Logging and Alerting Failures

## Rules

### 1. Log All Security-Relevant Events
- **DO**: Log authentication attempts (success and failure), access control failures, input validation failures, and administrative actions.
- **DON'T**: Rely on generic application logs to detect security incidents.
- **WHY**: Without security event logging, breaches go undetected. Mean time to detect a breach averages 200+ days without proper logging.

### 2. Never Log Sensitive Data
- **DO**: Sanitize logs to exclude passwords, tokens, credit card numbers, PII, and session IDs. Use structured logging with redaction.
- **DON'T**: Log request bodies, full headers, or raw user input without sanitization.
- **WHY**: Logs are often stored with weaker access controls than primary data stores. Leaked logs expose credentials and PII.

### 3. Use Structured, Consistent Log Formats
- **DO**: Use JSON-structured logging with consistent fields (timestamp, level, event type, user ID, IP, request ID).
- **DON'T**: Use unstructured `console.log()` for security events or mix log formats.
- **WHY**: Structured logs enable automated parsing, correlation, and alerting by SIEM tools.

### 4. Implement Tamper-Evident Logging
- **DO**: Send logs to a centralized, append-only logging service. Implement log integrity checks.
- **DON'T**: Store security logs only on the application server where an attacker could modify them.
- **WHY**: Attackers routinely delete or modify local logs to cover their tracks.

### 5. Set Up Real-Time Alerting for Critical Events
- **DO**: Configure alerts for brute-force attempts, privilege escalation, unusual data access patterns, and authentication anomalies.
- **DON'T**: Only review logs manually or after an incident is reported by users.
- **WHY**: Real-time alerting reduces breach detection time from months to minutes, limiting damage.

### 6. Protect Log Injection
- **DO**: Sanitize log inputs to prevent log injection (newlines, control characters). Use parameterized logging.
- **DON'T**: Directly interpolate user input into log messages.
- **WHY**: Log injection can forge log entries, corrupt log analysis, or exploit log viewer vulnerabilities.

### 7. Ensure Adequate Log Retention
- **DO**: Retain security logs for at least 90 days (hot) and 1 year (cold) per compliance requirements.
- **DON'T**: Delete logs immediately after processing or keep them indefinitely without retention policies.
- **WHY**: Incident investigation often requires historical log analysis. Retention policies balance security with storage costs and privacy regulations.

## Code Examples

### Bad Practice
```javascript
// Logging sensitive data
console.log(`User login: ${email}, password: ${password}`);
console.log(`Payment processed: card=${cardNumber}, amount=${amount}`);

// Log injection vulnerability
const username = req.body.username; // Could contain "\nAdmin login successful"
console.log(`Login attempt for user: ${username}`);

// No security event logging
app.post("/api/login", async (req, res) => {
  const user = await authenticate(req.body);
  if (user) res.json({ token: createToken(user) });
  else res.status(401).json({ error: "Invalid" });
  // No logging of success or failure
});
```

### Good Practice
```javascript
import pino from "pino";

// Structured logger with redaction
const logger = pino({
  level: "info",
  redact: {
    paths: ["password", "token", "authorization", "cookie", "*.password", "*.token"],
    censor: "[REDACTED]",
  },
  serializers: {
    req: pino.stdSerializers.req,
    err: pino.stdSerializers.err,
  },
});

// Security event logger
function logSecurityEvent(event) {
  logger.info({
    type: "security",
    event: event.action,
    userId: event.userId ?? "anonymous",
    ip: event.ip,
    userAgent: event.userAgent,
    resource: event.resource,
    outcome: event.outcome,
    timestamp: new Date().toISOString(),
    requestId: event.requestId,
  });
}

// Login with comprehensive security logging
app.post("/api/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  const requestId = crypto.randomUUID();
  const user = await db.findUser(email);
  const isValid = user ? await verifyPassword(password, user.passwordHash) : false;

  logSecurityEvent({
    action: isValid ? "login_success" : "login_failure",
    userId: user?.id,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    resource: "/api/login",
    outcome: isValid ? "success" : "failure",
    requestId,
  });

  if (!isValid) {
    return res.status(401).json({ error: "Invalid credentials", requestId });
  }

  setSessionCookie(res, user);
  res.json({ success: true });
});

// Safe log message - prevent log injection
function sanitizeForLog(input) {
  if (typeof input !== "string") return String(input);
  return input.replace(/[\n\r\t]/g, "").substring(0, 500);
}

// Access control failure logging middleware
function logAccessDenied(req, res, next) {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode === 403) {
      logSecurityEvent({
        action: "access_denied",
        userId: req.user?.id,
        ip: req.ip,
        userAgent: req.get("user-agent"),
        resource: `${req.method} ${req.originalUrl}`,
        outcome: "denied",
        requestId: req.id,
      });
    }
    return originalJson(body);
  };
  next();
}
```

## Quick Checklist
- [ ] Authentication successes and failures are logged
- [ ] Access control violations are logged
- [ ] No passwords, tokens, or PII in log output
- [ ] Structured JSON logging format with consistent fields
- [ ] Logs sent to centralized, tamper-resistant storage
- [ ] Real-time alerts configured for critical security events
- [ ] Log inputs sanitized to prevent log injection
- [ ] Log retention policy defined and enforced (90 days+)
- [ ] Each log entry includes timestamp, user ID, IP, and request ID
