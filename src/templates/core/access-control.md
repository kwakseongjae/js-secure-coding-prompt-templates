# Access Control Security Rules

> OWASP Top 10 2025 - A01: Broken Access Control

## Rules

### 1. Enforce Server-Side Access Control
- **DO**: Validate all access control checks on the server side. Never rely solely on client-side checks.
- **DON'T**: Hide UI elements as the only means of restricting access. Attackers bypass client-side controls trivially.
- **WHY**: Client-side access control is purely cosmetic and can be bypassed by modifying requests directly.

### 2. Deny by Default
- **DO**: Implement a default-deny policy. Explicitly grant access only to resources the user is authorized for.
- **DON'T**: Use a default-allow model where you try to block specific unauthorized access patterns.
- **WHY**: Default-deny ensures new endpoints and resources are secure by default, reducing the risk of accidental exposure.

### 3. Use Role-Based or Attribute-Based Access Control
- **DO**: Implement RBAC or ABAC with clearly defined roles and permissions. Check permissions at every access point.
- **DON'T**: Hardcode user IDs or permission checks scattered throughout business logic.
- **WHY**: Centralized access control is easier to audit, maintain, and less prone to bypass.

### 4. Validate Object-Level Authorization (IDOR Prevention)
- **DO**: Verify the authenticated user has permission to access the specific resource identified by the request parameter.
- **DON'T**: Trust client-supplied IDs (e.g., `/api/users/123/orders`) without verifying the requester owns that resource.
- **WHY**: Insecure Direct Object Reference (IDOR) is one of the most common access control flaws, allowing users to access others' data.

### 5. Enforce Function-Level Access Control
- **DO**: Check authorization for every API endpoint and controller action, including admin functions.
- **DON'T**: Assume that obscure or undocumented endpoints are safe from unauthorized access.
- **WHY**: Attackers discover hidden endpoints through reconnaissance, API documentation leaks, or brute-force.

### 6. Implement Rate Limiting on Sensitive Operations
- **DO**: Apply rate limiting to authentication, password reset, and other sensitive endpoints.
- **DON'T**: Allow unlimited requests to access-controlled endpoints without throttling.
- **WHY**: Rate limiting mitigates brute-force attacks and automated enumeration of resources.

### 7. Use Secure Session and Token Management
- **DO**: Invalidate sessions and tokens on logout, password change, and after a configurable idle timeout.
- **DON'T**: Issue long-lived tokens without refresh mechanisms or allow sessions to persist indefinitely.
- **WHY**: Stale sessions and tokens expand the attack window for session hijacking.

## Code Examples

### Bad Practice
```javascript
// Trusting client-supplied user ID without authorization check
app.get("/api/users/:userId/profile", async (req, res) => {
  const profile = await db.getUserProfile(req.params.userId);
  res.json(profile); // No check if requester owns this profile
});

// Client-side only access control
function AdminPanel() {
  const { user } = useAuth();
  if (user.role !== "admin") return null; // Easily bypassed
  return <SensitiveAdminUI />;
}
```

### Good Practice
```javascript
// Server-side authorization check with IDOR prevention
app.get("/api/users/:userId/profile", authenticate, async (req, res) => {
  if (req.user.id !== req.params.userId && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const profile = await db.getUserProfile(req.params.userId);
  res.json(profile);
});

// Centralized RBAC middleware
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

app.delete("/api/users/:id", authenticate, authorize("admin"), deleteUser);

// Policy-based access control
class AccessPolicy {
  static canAccess(user, resource) {
    const policies = {
      "order:read": (u, r) => u.id === r.ownerId || u.role === "admin",
      "order:delete": (u, r) => u.role === "admin",
    };
    const check = policies[`${resource.type}:${resource.action}`];
    return check ? check(user, resource) : false; // Default deny
  }
}

app.get("/api/orders/:id", authenticate, async (req, res) => {
  const order = await db.getOrder(req.params.id);
  if (!AccessPolicy.canAccess(req.user, { ...order, type: "order", action: "read" })) {
    return res.status(403).json({ error: "Forbidden" });
  }
  res.json(order);
});
```

## Quick Checklist
- [ ] All access control is enforced server-side
- [ ] Default-deny policy is in place for all routes
- [ ] Every API endpoint checks authorization (not just authentication)
- [ ] Object-level authorization prevents IDOR attacks
- [ ] Admin functions require explicit role verification
- [ ] Sessions and tokens are invalidated on logout/password change
- [ ] Rate limiting is applied to sensitive endpoints
- [ ] Access control logic is centralized and reusable
