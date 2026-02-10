# Authentication Security Rules

> OWASP Top 10 2025 - A07: Authentication Failures

## Rules

### 1. Implement Multi-Factor Authentication
- **DO**: Require MFA for all privileged accounts and offer it for all users. Use TOTP, WebAuthn, or push-based verification.
- **DON'T**: Rely solely on passwords for authentication, especially for admin and financial operations.
- **WHY**: Passwords alone are frequently compromised through phishing, credential stuffing, or data breaches.

### 2. Enforce Strong Password Policies
- **DO**: Require a minimum of 8 characters. Check against breached password databases (e.g., Have I Been Pwned API). Allow long passphrases.
- **DON'T**: Impose arbitrary complexity rules (uppercase + number + symbol) that lead to predictable patterns, or cap password length below 64 characters.
- **WHY**: NIST guidelines (SP 800-63B) recommend length over complexity. Breached password checks are more effective than complexity rules.

### 3. Protect Against Credential Stuffing and Brute Force
- **DO**: Implement rate limiting, account lockout with exponential backoff, and CAPTCHA after failed attempts.
- **DON'T**: Allow unlimited login attempts or reveal whether the username or password was incorrect.
- **WHY**: Credential stuffing uses leaked credentials from other breaches. Rate limiting and generic error messages slow automated attacks.

### 4. Secure Session Management
- **DO**: Generate random session IDs with high entropy. Set cookies with `HttpOnly`, `Secure`, `SameSite=Strict`, and appropriate expiry.
- **DON'T**: Store session tokens in `localStorage` or expose them in URLs. Never accept session IDs from query parameters.
- **WHY**: Predictable or exposed session tokens allow session hijacking. Secure cookie attributes prevent XSS and CSRF-based theft.

### 5. Implement Secure Password Reset
- **DO**: Use time-limited, single-use tokens for password reset. Send reset links only to verified email addresses. Invalidate all sessions on password change.
- **DON'T**: Use knowledge-based questions, send plaintext passwords, or allow token reuse.
- **WHY**: Weak password reset flows are as dangerous as weak passwords. They are a common target for account takeover.

### 6. Validate JWTs Properly
- **DO**: Verify signature, issuer (`iss`), audience (`aud`), and expiration (`exp`). Use asymmetric algorithms (RS256, ES256) for distributed systems.
- **DON'T**: Use `alg: "none"`, accept tokens without signature verification, or store sensitive data in JWT payloads.
- **WHY**: JWT misuse (algorithm confusion, missing validation) leads to authentication bypass and privilege escalation.

### 7. Implement Secure OAuth/OIDC Flows
- **DO**: Use Authorization Code flow with PKCE. Validate the `state` parameter and token claims. Store tokens securely.
- **DON'T**: Use Implicit flow for SPAs. Skip `state` validation or accept tokens from untrusted sources.
- **WHY**: OAuth misconfiguration enables token theft, CSRF, and account takeover through redirect manipulation.

## Code Examples

### Bad Practice
```javascript
// Revealing whether user exists
app.post("/api/login", async (req, res) => {
  const user = await db.findUser(req.body.email);
  if (!user) return res.status(401).json({ error: "User not found" }); // Info leak
  if (!checkPassword(req.body.password, user.password)) {
    return res.status(401).json({ error: "Wrong password" }); // Info leak
  }
  res.json({ token: jwt.sign({ id: user.id }, SECRET) });
});

// Insecure JWT validation
const payload = jwt.decode(token); // decode without verify!
if (payload.role === "admin") grantAdminAccess();

// Session token in localStorage
localStorage.setItem("token", response.data.token); // Accessible via XSS
```

### Good Practice
```javascript
import jwt from "jsonwebtoken";
import { rateLimit } from "express-rate-limit";

// Rate-limited login with generic error messages
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
});

app.post("/api/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  const user = await db.findUser(email);

  // Constant-time check - same response whether user exists or not
  const isValid = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!isValid) {
    return res.status(401).json({ error: "Invalid credentials" }); // Generic message
  }

  // Check for MFA
  if (user.mfaEnabled) {
    const mfaToken = crypto.randomBytes(32).toString("hex");
    await storeMfaChallenge(user.id, mfaToken, Date.now() + 300_000);
    return res.json({ requiresMFA: true, mfaToken });
  }

  setSessionCookie(res, user);
  res.json({ success: true });
});

// Secure session cookie
function setSessionCookie(res, user) {
  const sessionId = crypto.randomUUID();
  res.cookie("session", sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 3600_000, // 1 hour
    path: "/",
  });
}

// Proper JWT verification
function verifyToken(token) {
  return jwt.verify(token, PUBLIC_KEY, {
    algorithms: ["ES256"],     // Explicit algorithm
    issuer: "https://auth.example.com",
    audience: "https://api.example.com",
    clockTolerance: 30,
  });
}

// Secure password reset
app.post("/api/password-reset", async (req, res) => {
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  await db.storeResetToken(req.body.email, hashedToken, Date.now() + 3600_000);
  await sendResetEmail(req.body.email, token); // Send unhashed token
  res.json({ message: "If the email exists, a reset link has been sent" }); // Generic
});
```

## Quick Checklist
- [ ] MFA available and enforced for privileged accounts
- [ ] Passwords checked against breached password databases
- [ ] Login rate limiting and account lockout implemented
- [ ] Generic error messages for authentication failures (no user enumeration)
- [ ] Session cookies use `HttpOnly`, `Secure`, `SameSite=Strict`
- [ ] JWTs verified with explicit algorithm, issuer, and audience
- [ ] Password reset uses time-limited, single-use tokens
- [ ] All sessions invalidated on password change
- [ ] OAuth flows use PKCE and validate `state` parameter
