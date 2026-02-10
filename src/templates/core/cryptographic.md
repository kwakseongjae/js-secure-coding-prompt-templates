# Cryptographic Failures Security Rules

> OWASP Top 10 2025 - A04: Cryptographic Failures

## Rules

### 1. Use Strong, Modern Encryption Algorithms
- **DO**: Use AES-256-GCM for symmetric encryption and RSA-OAEP or ECDH for asymmetric encryption. Use the Web Crypto API or `node:crypto` module.
- **DON'T**: Use deprecated algorithms like DES, 3DES, RC4, MD5, or SHA-1 for security purposes.
- **WHY**: Weak algorithms are vulnerable to known attacks and can be broken with modern hardware.

### 2. Never Hardcode Secrets or Keys
- **DO**: Store keys in environment variables, secret managers (AWS Secrets Manager, HashiCorp Vault), or hardware security modules.
- **DON'T**: Embed encryption keys, API keys, or passwords directly in source code or config files.
- **WHY**: Hardcoded secrets in source code are easily extracted from repositories and compiled artifacts.

### 3. Hash Passwords with Adaptive Algorithms
- **DO**: Use bcrypt, scrypt, or Argon2id for password hashing with appropriate work factors.
- **DON'T**: Use plain hashing (SHA-256, MD5) or unsalted hashes for passwords.
- **WHY**: Adaptive hashing algorithms are designed to resist GPU-based brute force and rainbow table attacks.

### 4. Generate Cryptographically Secure Random Values
- **DO**: Use `crypto.randomBytes()`, `crypto.randomUUID()`, or `crypto.getRandomValues()` for tokens, IDs, and nonces.
- **DON'T**: Use `Math.random()` for any security-sensitive value (tokens, session IDs, OTPs).
- **WHY**: `Math.random()` is predictable and not cryptographically secure. Attackers can predict its output.

### 5. Encrypt Sensitive Data at Rest and in Transit
- **DO**: Use TLS 1.2+ for data in transit. Encrypt PII, financial data, and health records at rest with field-level encryption where appropriate.
- **DON'T**: Store sensitive data in plaintext in databases, logs, or local storage.
- **WHY**: Data breaches expose plaintext data. Encryption limits the impact of unauthorized access.

### 6. Use Authenticated Encryption
- **DO**: Use AEAD modes like AES-GCM that provide both confidentiality and integrity.
- **DON'T**: Use ECB mode or CBC without HMAC. Never implement custom encryption schemes.
- **WHY**: Unauthenticated encryption is vulnerable to padding oracle and ciphertext manipulation attacks.

### 7. Manage Key Rotation and Lifecycle
- **DO**: Implement key rotation policies. Support decryption with old keys while encrypting with current keys.
- **DON'T**: Use the same encryption key indefinitely without rotation.
- **WHY**: Key rotation limits the impact of key compromise and meets compliance requirements.

## Code Examples

### Bad Practice
```javascript
import crypto from "node:crypto";

// Using Math.random for tokens
const resetToken = Math.random().toString(36).substring(2);

// MD5 for password hashing (no salt, fast hash)
const hashedPassword = crypto.createHash("md5").update(password).digest("hex");

// Hardcoded encryption key
const ENCRYPTION_KEY = "my-super-secret-key-12345678";

// ECB mode (insecure - identical blocks produce identical ciphertext)
const cipher = crypto.createCipheriv("aes-256-ecb", key, null);
```

### Good Practice
```javascript
import crypto from "node:crypto";
import { hash, verify } from "@node-rs/argon2"; // or bcrypt

// Cryptographically secure random token
const resetToken = crypto.randomBytes(32).toString("hex");
const sessionId = crypto.randomUUID();

// Argon2id password hashing
async function hashPassword(password) {
  return hash(password, {
    memoryCost: 65536,  // 64 MB
    timeCost: 3,
    parallelism: 4,
  });
}

async function verifyPassword(password, hashedPassword) {
  return verify(hashedPassword, password);
}

// AES-256-GCM authenticated encryption
function encrypt(plaintext, key) {
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

function decrypt(ciphertext, key) {
  const data = Buffer.from(ciphertext, "base64");
  const iv = data.subarray(0, 12);
  const authTag = data.subarray(12, 28);
  const encrypted = data.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

// Key from environment / secret manager
const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, "base64");
```

## Quick Checklist
- [ ] Only modern algorithms used (AES-256-GCM, SHA-256+, Argon2id/bcrypt)
- [ ] No hardcoded keys or secrets in source code
- [ ] Passwords hashed with Argon2id, bcrypt, or scrypt
- [ ] All random values use `crypto.randomBytes()` or `crypto.getRandomValues()`
- [ ] Sensitive data encrypted at rest and in transit (TLS 1.2+)
- [ ] Authenticated encryption mode (GCM) used for symmetric encryption
- [ ] Key rotation policy defined and implemented
- [ ] No sensitive data in logs, URLs, or client-side storage
