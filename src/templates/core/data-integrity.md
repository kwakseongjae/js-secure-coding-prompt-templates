# Software and Data Integrity Security Rules

> OWASP Top 10 2025 - A08: Software or Data Integrity Failures

## Rules

### 1. Verify CI/CD Pipeline Integrity
- **DO**: Sign commits and artifacts. Use protected branches, required reviews, and immutable build environments.
- **DON'T**: Allow unapproved changes to CI/CD configuration or build scripts without review.
- **WHY**: Compromised pipelines can inject malicious code into production builds, affecting all users.

### 2. Validate Data Integrity on Deserialization
- **DO**: Validate and sanitize all deserialized data against strict schemas. Use safe serialization formats (JSON with schema validation).
- **DON'T**: Deserialize untrusted data without validation, especially with `eval()`, `Function()`, or `node:vm`.
- **WHY**: Insecure deserialization can lead to Remote Code Execution (RCE) or data tampering.

### 3. Implement Integrity Checks for Critical Data
- **DO**: Use HMAC or digital signatures to verify integrity of sensitive data (tokens, cookies, inter-service messages).
- **DON'T**: Trust data from cookies, hidden form fields, or client-side storage without integrity verification.
- **WHY**: Client-side data can be tampered with. Signed data ensures it hasn't been modified.

### 4. Secure Auto-Update Mechanisms
- **DO**: Verify digital signatures on all updates before applying them. Use TLS for update channels.
- **DON'T**: Download and execute updates without cryptographic verification.
- **WHY**: Unsigned updates can be replaced with malicious payloads through MITM attacks or compromised update servers.

### 5. Protect Database Migrations and Seeds
- **DO**: Review and version-control all database migrations. Use checksums to verify migration integrity.
- **DON'T**: Run auto-generated migrations in production without review or allow dynamic schema changes from user input.
- **WHY**: Malicious migrations can alter database structure, delete data, or create backdoor accounts.

### 6. Validate Webhook and API Payloads
- **DO**: Verify webhook signatures using HMAC. Validate the payload schema and source IP where possible.
- **DON'T**: Process webhook payloads without signature verification or trust arbitrary callback URLs.
- **WHY**: Unverified webhooks allow attackers to inject fake events (payment confirmations, deploy triggers).

## Code Examples

### Bad Practice
```javascript
// Deserializing untrusted data unsafely
const userData = eval(`(${req.body.data})`); // RCE vulnerability

// Trusting client-side data without integrity check
app.post("/api/checkout", (req, res) => {
  const { price } = req.body; // Client can modify price
  processPayment(price);
});

// Processing webhook without signature verification
app.post("/webhook/payment", (req, res) => {
  const event = req.body;
  if (event.type === "payment_success") {
    fulfillOrder(event.orderId); // Could be forged
  }
});
```

### Good Practice
```javascript
import crypto from "node:crypto";
import { z } from "zod";

// Safe deserialization with schema validation
const UserDataSchema = z.object({
  name: z.string().max(100),
  email: z.string().email(),
  role: z.enum(["user", "editor"]),
});

app.post("/api/profile", authenticate, (req, res) => {
  const userData = UserDataSchema.parse(JSON.parse(req.body.data));
  updateProfile(req.user.id, userData);
});

// Signed data for client-side integrity
function signData(data, secret) {
  const payload = JSON.stringify(data);
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return { payload, signature };
}

function verifyData(payload, signature, secret) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new Error("Data integrity verification failed");
  }
  return JSON.parse(payload);
}

// Server-side price validation (never trust client price)
app.post("/api/checkout", authenticate, async (req, res) => {
  const { itemId, quantity } = req.body;
  const item = await db.getItem(itemId);        // Get real price from DB
  const totalPrice = item.price * quantity;      // Calculate server-side
  await processPayment(req.user.id, totalPrice);
});

// Webhook signature verification (Stripe example pattern)
function verifyWebhookSignature(payload, signature, secret) {
  const [timestamp, hash] = parseSignatureHeader(signature);

  // Prevent replay attacks
  if (Date.now() / 1000 - Number(timestamp) > 300) {
    throw new Error("Webhook timestamp too old");
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expected))) {
    throw new Error("Invalid webhook signature");
  }
  return JSON.parse(payload);
}

app.post("/webhook/payment", express.raw({ type: "application/json" }), (req, res) => {
  const event = verifyWebhookSignature(
    req.body.toString(),
    req.headers["x-signature"],
    process.env.WEBHOOK_SECRET,
  );
  processVerifiedEvent(event);
  res.sendStatus(200);
});
```

## Quick Checklist
- [ ] CI/CD pipeline changes require review and approval
- [ ] All deserialization uses schema validation, never `eval()`
- [ ] Critical client-facing data is signed with HMAC or digital signatures
- [ ] Server-side calculation for prices, totals, and business-critical values
- [ ] Webhook payloads verified with signature before processing
- [ ] Auto-updates verify digital signatures before applying
- [ ] Database migrations are version-controlled and reviewed
- [ ] `timingSafeEqual` used for all signature comparisons
