# Insecure Design Security Rules

> OWASP Top 10 2025 - A06: Insecure Design

## Rules

### 1. Apply Threat Modeling During Design
- **DO**: Identify trust boundaries, data flows, and threat actors before writing code. Use STRIDE or similar frameworks.
- **DON'T**: Bolt security onto the application after implementation.
- **WHY**: Security flaws rooted in design cannot be fixed by better implementation alone. Architecture-level vulnerabilities require redesign.

### 2. Enforce Business Logic Limits
- **DO**: Implement server-side limits for business operations (e.g., max transaction amount, order quantity, API calls per user).
- **DON'T**: Rely on the UI to enforce business rules like purchase limits or booking constraints.
- **WHY**: Business logic abuse (e.g., buying items at negative prices, mass-redeeming coupons) bypasses client-side validation easily.

### 3. Implement Defense in Depth
- **DO**: Layer multiple security controls so that failure of one does not compromise the system. Combine input validation, access control, encryption, and monitoring.
- **DON'T**: Depend on a single security mechanism to protect critical assets.
- **WHY**: No single control is perfect. Layered defenses ensure that an attacker must defeat multiple barriers.

### 4. Follow the Principle of Least Privilege
- **DO**: Grant minimum necessary permissions to users, services, and processes. Use separate service accounts with scoped credentials.
- **DON'T**: Run services as root, use admin-level database credentials for application queries, or grant blanket permissions.
- **WHY**: Over-privileged components amplify the impact of any breach, turning a small vulnerability into full system compromise.

### 5. Design for Abuse Cases
- **DO**: For every feature, ask "how could this be abused?" and implement safeguards (rate limiting, CAPTCHA, fraud detection).
- **DON'T**: Only consider the happy path in feature design. Assume all input can be malicious.
- **WHY**: Attackers use features in unintended ways. Referral systems get exploited, file uploads deliver malware, search becomes a data exfiltration tool.

### 6. Separate Sensitive Operations
- **DO**: Require re-authentication or multi-factor confirmation for critical operations (password change, fund transfer, account deletion).
- **DON'T**: Allow destructive or sensitive operations with a single click or without additional verification.
- **WHY**: Session hijacking or CSRF can trigger sensitive operations. Step-up authentication adds a security boundary.

## Code Examples

### Bad Practice
```javascript
// No business logic validation on the server
app.post("/api/transfer", authenticate, async (req, res) => {
  const { amount, toAccount } = req.body;
  // Trusting client-sent amount without validation
  await transferFunds(req.user.id, toAccount, amount);
  res.json({ success: true });
});

// Feature without abuse consideration
app.post("/api/referral", authenticate, async (req, res) => {
  // No limit on referral bonuses - can be exploited with fake accounts
  await addReferralBonus(req.user.id, req.body.referralCode);
  res.json({ success: true });
});
```

### Good Practice
```javascript
import { z } from "zod";
import { rateLimit } from "express-rate-limit";

// Business logic with server-side validation and limits
const TransferSchema = z.object({
  amount: z.number().positive().max(10000), // Business limit
  toAccount: z.string().regex(/^\d{10,12}$/),
});

app.post("/api/transfer", authenticate, async (req, res) => {
  const { amount, toAccount } = TransferSchema.parse(req.body);

  // Check daily transfer limit
  const dailyTotal = await getDailyTransferTotal(req.user.id);
  if (dailyTotal + amount > req.user.dailyLimit) {
    return res.status(400).json({ error: "Daily transfer limit exceeded" });
  }

  // Require step-up authentication for large transfers
  if (amount > 1000) {
    const mfaVerified = await verifyMFA(req.user.id, req.body.mfaToken);
    if (!mfaVerified) {
      return res.status(403).json({ error: "MFA required for large transfers" });
    }
  }

  await transferFunds(req.user.id, toAccount, amount);
  await logAuditEvent("transfer", { userId: req.user.id, amount, toAccount });
  res.json({ success: true });
});

// Referral system with abuse prevention
const referralLimiter = rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 5 });

app.post("/api/referral", authenticate, referralLimiter, async (req, res) => {
  const referrer = await getUserByReferralCode(req.body.referralCode);

  // Abuse checks
  if (referrer.id === req.user.id) {
    return res.status(400).json({ error: "Cannot refer yourself" });
  }
  const existingReferral = await getReferral(req.user.id);
  if (existingReferral) {
    return res.status(400).json({ error: "Already used a referral" });
  }

  await addReferralBonus(referrer.id, req.user.id);
  res.json({ success: true });
});
```

## Quick Checklist
- [ ] Threat modeling performed for critical features
- [ ] Business logic limits enforced server-side (not just client-side)
- [ ] Multiple layers of security controls (defense in depth)
- [ ] Services run with minimum required privileges
- [ ] Abuse cases identified and mitigated for each feature
- [ ] Sensitive operations require step-up authentication or MFA
- [ ] Data flows and trust boundaries documented
