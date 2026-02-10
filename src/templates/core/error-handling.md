# Error Handling Security Rules

> OWASP Top 10 2025 - A10: Mishandling of Exceptional Conditions (NEW)

## Rules

### 1. Implement Fail-Safe Defaults
- **DO**: Default to the most secure state when errors occur. Deny access, reject transactions, and close connections on failure.
- **DON'T**: Fail open by granting access or skipping validation when an error occurs.
- **WHY**: Attackers intentionally trigger errors to bypass security controls. Fail-safe defaults ensure errors never weaken security posture.

### 2. Use Structured Error Handling Patterns
- **DO**: Use try-catch blocks, Result/Either patterns, or error boundary components. Handle every possible error state explicitly.
- **DON'T**: Ignore promise rejections, leave catch blocks empty, or rely on uncaught exception handlers for control flow.
- **WHY**: Unhandled errors crash services, leak information, and create unpredictable system states that attackers exploit.

### 3. Separate Internal and External Error Messages
- **DO**: Log detailed errors internally with full context. Return generic, safe error messages to users with a reference ID.
- **DON'T**: Expose internal error details, stack traces, or database messages to clients.
- **WHY**: Detailed errors reveal technology stack, file paths, and database structure that aid targeted attacks.

### 4. Implement Graceful Degradation
- **DO**: Design fallback behavior for external service failures. Use circuit breakers, timeouts, and retry with backoff.
- **DON'T**: Let a single external dependency failure cascade into full application failure.
- **WHY**: Cascading failures cause outages. Graceful degradation maintains core functionality and prevents denial of service.

### 5. Handle All Promise Rejections and Async Errors
- **DO**: Attach `.catch()` to all promises or use `try-catch` with `await`. Register global `unhandledRejection` handlers as a safety net.
- **DON'T**: Fire and forget promises or assume async operations will always succeed.
- **WHY**: Unhandled promise rejections cause silent failures, memory leaks, and in Node.js 15+, process crashes.

### 6. Validate Error Objects Before Processing
- **DO**: Verify error types and properties before accessing them. Use `instanceof` checks or error codes.
- **DON'T**: Assume all caught errors are `Error` instances or have expected properties.
- **WHY**: JavaScript can throw any value. Accessing `.message` or `.stack` on non-Error values causes secondary failures.

### 7. Implement Request Timeouts and Resource Limits
- **DO**: Set timeouts for all external requests, database queries, and file operations. Limit request body size and processing time.
- **DON'T**: Allow requests or operations to run indefinitely without timeout boundaries.
- **WHY**: Missing timeouts lead to resource exhaustion, blocked event loops, and denial of service.

## Code Examples

### Bad Practice
```javascript
// Failing open - granting access on error
async function checkPermission(userId, resource) {
  try {
    const allowed = await authService.check(userId, resource);
    return allowed;
  } catch (error) {
    return true; // DANGEROUS: fail-open grants access on auth service failure
  }
}

// Empty catch block hiding errors
try {
  await processPayment(order);
} catch (e) {
  // silently swallowed - payment may have partially processed
}

// Leaking error details to client
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,
    sql: err.query,
  });
});

// No timeout on external request
const response = await fetch("https://external-api.com/data"); // Hangs forever if API is down
```

### Good Practice
```javascript
// Fail-safe: deny access on error
async function checkPermission(userId, resource) {
  try {
    return await authService.check(userId, resource);
  } catch (error) {
    logger.error({ userId, resource, error: error.message }, "Auth service failed");
    return false; // Fail-safe: deny access on error
  }
}

// Structured error handling with Result pattern
class Result {
  constructor(ok, value, error) {
    this.ok = ok;
    this.value = value;
    this.error = error;
  }
  static success(value) { return new Result(true, value, null); }
  static failure(error) { return new Result(false, null, error); }
}

async function processPayment(order) {
  try {
    const result = await paymentGateway.charge(order);
    return Result.success(result);
  } catch (error) {
    logger.error({ orderId: order.id, error: error.message }, "Payment failed");
    return Result.failure(new PaymentError("Payment processing failed", { cause: error }));
  }
}

// Safe error handler separating internal/external messages
app.use((err, req, res, next) => {
  const errorId = crypto.randomUUID();
  logger.error({ errorId, path: req.path, method: req.method, error: err.message, stack: err.stack });
  const status = err.status ?? 500;
  res.status(status).json({
    error: status < 500 ? err.message : "An internal error occurred",
    errorId,
  });
});

// Circuit breaker for external services
class CircuitBreaker {
  #failures = 0;
  #lastFailure = 0;
  #state = "closed"; // closed, open, half-open

  constructor(threshold = 5, resetTimeout = 30_000) {
    this.threshold = threshold;
    this.resetTimeout = resetTimeout;
  }

  async execute(fn) {
    if (this.#state === "open") {
      if (Date.now() - this.#lastFailure > this.resetTimeout) {
        this.#state = "half-open";
      } else {
        throw new Error("Circuit breaker is open");
      }
    }
    try {
      const result = await fn();
      this.#failures = 0;
      this.#state = "closed";
      return result;
    } catch (error) {
      this.#failures++;
      this.#lastFailure = Date.now();
      if (this.#failures >= this.threshold) this.#state = "open";
      throw error;
    }
  }
}

// Request with timeout
async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

// Global safety net (not a substitute for proper error handling)
process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason: String(reason) }, "Unhandled promise rejection");
  process.exitCode = 1;
});
```

## Quick Checklist
- [ ] All error paths fail-safe (deny access, reject transactions)
- [ ] No empty catch blocks in the codebase
- [ ] Internal errors logged with full detail; external responses are generic
- [ ] Circuit breakers implemented for external service calls
- [ ] All promises have `.catch()` or are inside try-catch with await
- [ ] Global `unhandledRejection` handler registered as safety net
- [ ] Timeouts set for all HTTP requests, database queries, and I/O operations
- [ ] Request body size limits enforced
- [ ] Error objects validated before accessing properties
