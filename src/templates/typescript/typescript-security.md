# TypeScript Security Rules

> TypeScript-specific security rules for leveraging the type system to prevent vulnerabilities at compile time and enforce runtime safety boundaries.

## Rules

### 1. Enable Strict Mode and strictNullChecks
- **DO**: Set `"strict": true` and `"strictNullChecks": true` in `tsconfig.json`. Treat compiler warnings as errors in CI.
- **DON'T**: Disable strict checks to "fix" type errors quickly. Loosening strictness hides real bugs.
- **WHY**: Strict mode catches null/undefined dereferences, implicit `any` usage, and other unsafe patterns at compile time before they become runtime vulnerabilities.

### 2. Never Use `as any` or Excessive Type Assertions
- **DO**: Fix type errors by correcting the underlying types. Use type narrowing (`instanceof`, `in`, discriminated unions) to safely refine types.
- **DON'T**: Use `as any`, `as unknown as T`, or `@ts-ignore` to silence type errors. Each assertion is an unverified trust boundary.
- **WHY**: Type assertions bypass the compiler's safety checks. `as any` effectively disables TypeScript's protection, allowing injection, null dereference, and data integrity bugs to slip through.

### 3. Use `unknown` Instead of `any` for External Data
- **DO**: Type all external inputs (API responses, user input, file reads, environment variables) as `unknown` and narrow with validation before use.
- **DON'T**: Type external data as `any` or trust its shape without validation. Never pass unvalidated external data directly to business logic.
- **WHY**: External data is the primary attack surface. `unknown` forces explicit validation, preventing injection, prototype pollution, and type confusion attacks.

### 4. Validate External Data at Runtime with Schema Libraries
- **DO**: Use Zod, io-ts, or similar libraries to define schemas and validate all data crossing trust boundaries (API inputs, webhook payloads, config files).
- **DON'T**: Rely solely on TypeScript interfaces for external data — interfaces are erased at compile time and provide zero runtime protection.
- **WHY**: TypeScript's type system exists only at compile time. Attackers send raw HTTP requests; runtime validation is the only real defense against malformed or malicious payloads.

### 5. Use Generics for Type-Safe API Response Handling
- **DO**: Define generic API client functions that return validated, typed responses. Pair generics with runtime schema validation.
- **DON'T**: Cast API responses with `as T` without validation. A generic function that skips validation gives false confidence.
- **WHY**: Generic + validation patterns ensure that API response handling is both type-safe and runtime-safe, preventing type confusion from unexpected server responses.

### 6. Prefer `as const` Assertions Over Enums
- **DO**: Use `as const` objects or union types for fixed value sets. This provides better type narrowing and tree-shaking.
- **DON'T**: Use numeric enums, which can be accessed with arbitrary numbers at runtime (`MyEnum[999]` returns `undefined` without error).
- **WHY**: Numeric enums allow reverse mapping that accepts any number, bypassing intended value restrictions. `as const` objects are immutable and provide exact literal types.

### 7. Audit `declare module` and Ambient Type Declarations
- **DO**: Keep ambient declarations (`declare module`, `declare global`, `.d.ts` files) minimal and review them carefully. Ensure they accurately reflect the runtime API.
- **DON'T**: Use `declare module` to paper over missing types with permissive definitions (e.g., `declare module '*' { const x: any; export default x; }`).
- **WHY**: Ambient declarations override the compiler's type checking. Incorrect declarations create a false sense of safety — the compiler trusts them unconditionally, so inaccurate declarations hide real vulnerabilities.

## Code Examples

### Bad Practice
```typescript
// Using 'any' for API response — no safety at all
async function getUser(id: string): Promise<any> {
  const res = await fetch(`/api/users/${id}`);
  return res.json(); // any — caller has no type safety
}

// Type assertion without validation
interface Config {
  apiKey: string;
  dbUrl: string;
}
const config = JSON.parse(rawInput) as Config; // Blindly trusted

// Numeric enum allows arbitrary values
enum Status {
  Active = 0,
  Inactive = 1,
}
const s: Status = 999; // No compile error!
```

### Good Practice
```typescript
import { z } from "zod";

// Runtime schema validation with Zod
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(["admin", "user", "viewer"]),
});
type User = z.infer<typeof UserSchema>;

// Type-safe API client with runtime validation
async function fetchApi<T>(url: string, schema: z.ZodType<T>): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: unknown = await res.json();
  return schema.parse(data); // Throws if invalid
}

const user = await fetchApi("/api/users/123", UserSchema);

// as const instead of enum
const STATUS = {
  Active: "active",
  Inactive: "inactive",
} as const;
type Status = (typeof STATUS)[keyof typeof STATUS]; // "active" | "inactive"

// unknown + narrowing for external data
function processInput(input: unknown): string {
  if (typeof input !== "string") {
    throw new Error("Expected string input");
  }
  return input.trim(); // Now safely narrowed to string
}
```

## Quick Checklist
- [ ] `tsconfig.json` has `"strict": true` enabled
- [ ] No `as any` or `@ts-ignore` in production code
- [ ] All external data is typed as `unknown` and validated at runtime
- [ ] Zod or equivalent schema validation is used at trust boundaries
- [ ] Generic API functions include runtime validation, not just type assertions
- [ ] `as const` is used instead of numeric enums for fixed value sets
- [ ] Ambient type declarations are reviewed and accurately reflect runtime behavior
