# Next.js Security Rules

> Security rules for Next.js applications using the App Router, covering Server Actions, middleware authentication, environment variable safety, and secure data fetching patterns.

## Rules

### 1. Validate All Inputs in Server Actions with Schema Validation
- **DO**: Use Zod or a similar library to validate every input in Server Actions. Treat Server Actions as public API endpoints — validate, sanitize, and authorize before processing.
- **DON'T**: Trust form data or arguments passed to Server Actions without validation. Never assume the client-side form structure limits what can be submitted.
- **WHY**: Server Actions are HTTP POST endpoints under the hood. Attackers can call them directly with arbitrary payloads, bypassing all client-side validation and form structure.

### 2. Enforce Authentication and Authorization in `middleware.ts`
- **DO**: Use `middleware.ts` to protect routes by verifying session tokens or JWTs before the request reaches any page or API route. Define public routes explicitly via matcher config.
- **DON'T**: Rely on individual page components or layouts to check authentication. Never skip authorization checks assuming middleware already handled them.
- **WHY**: Middleware runs at the edge before any rendering occurs, providing a centralized and reliable enforcement point. Component-level checks are too late — data may already be fetched and serialized.

### 3. Understand `NEXT_PUBLIC_` Environment Variable Exposure
- **DO**: Only prefix environment variables with `NEXT_PUBLIC_` when the value is intentionally public. Keep API keys, database URLs, and secrets without the prefix so they remain server-only.
- **DON'T**: Add `NEXT_PUBLIC_` to secrets or internal service URLs. Never store sensitive values in `NEXT_PUBLIC_` variables "for convenience" in client components.
- **WHY**: `NEXT_PUBLIC_` variables are inlined into the client-side JavaScript bundle at build time. They are visible to anyone who views your page source — this is by design and cannot be reversed.

### 4. Validate HTTP Methods in API Routes
- **DO**: Explicitly check and handle each HTTP method in API route handlers. Use Next.js App Router's named exports (`GET`, `POST`, `PUT`, `DELETE`) to restrict allowed methods.
- **DON'T**: Handle all methods in a single catch-all handler without method validation. Never allow `GET` requests to perform state-changing operations.
- **WHY**: API routes that accept any method can be exploited via CSRF (GET requests with image tags), method confusion, or unintended side effects from HEAD/OPTIONS requests.

### 5. Never Include Sensitive Data in ISR/SSG Pages
- **DO**: Fetch only public data during static generation (`generateStaticParams`, page-level data fetching). Load user-specific or sensitive data client-side or in server components that are not cached.
- **DON'T**: Include tokens, internal IDs, admin data, or PII in statically generated pages. Never pass sensitive data through `searchParams` that end up in cached pages.
- **WHY**: ISR/SSG pages are cached as static HTML files and served from CDN edges. Sensitive data in these pages is shared across all users and persists until the next revalidation.

### 6. Use `next/headers` and `next/cookies` Securely
- **DO**: Set cookies with `httpOnly`, `secure`, `sameSite: "strict"`, and appropriate `path` / `maxAge`. Read cookies and headers only in server components or route handlers.
- **DON'T**: Store sensitive tokens in cookies without `httpOnly` and `secure` flags. Never trust cookie values without server-side validation.
- **WHY**: Cookies without `httpOnly` are accessible to JavaScript and vulnerable to XSS theft. Without `secure`, cookies transmit over HTTP. Without `sameSite`, cookies are vulnerable to CSRF.

### 7. Protect Server-Only Code with `server-only` Package
- **DO**: Add `import "server-only"` at the top of files containing database queries, secrets access, or internal business logic. This causes a build error if the file is imported by a client component.
- **DON'T**: Rely on convention alone to separate server and client code. Never assume that a file without `"use client"` is safe from client bundling.
- **WHY**: Next.js's bundler may include server-side files in the client bundle if they are transitively imported by a client component. The `server-only` package provides a compile-time guarantee that prevents accidental exposure.

## Code Examples

### Bad Practice
```typescript
// Server Action without validation
"use server";
async function updateProfile(formData: FormData) {
  const name = formData.get("name") as string;
  await db.user.update({ where: { id: userId }, data: { name } }); // No validation
}

// Secret exposed via NEXT_PUBLIC_
// .env
// NEXT_PUBLIC_DB_URL=postgresql://admin:password@db.internal:5432/prod
// NEXT_PUBLIC_API_SECRET=sk-secret-key-12345

// API route accepting any method
export async function handler(req: NextRequest) {
  // GET, POST, DELETE all hit the same code path
  const data = await req.json();
  await db.user.delete({ where: { id: data.id } });
  return Response.json({ success: true });
}

// Sensitive data in ISR page
export const revalidate = 3600;
export default async function AdminPage() {
  const users = await db.user.findMany({
    select: { id: true, email: true, ssn: true }, // SSN in static page!
  });
  return <UserTable users={users} />;
}
```

### Good Practice
```typescript
// Server Action with Zod validation and authorization
"use server";
import { z } from "zod";
import { auth } from "@/lib/auth";

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).trim(),
});

async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const result = UpdateProfileSchema.safeParse({ name: formData.get("name") });
  if (!result.success) throw new Error("Invalid input");
  await db.user.update({
    where: { id: session.user.id },
    data: { name: result.data.name },
  });
}

// middleware.ts — centralized auth
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/register", "/api/health"];

export function middleware(request: NextRequest) {
  if (publicPaths.some((p) => request.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next();
  }
  const token = request.cookies.get("session-token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|favicon.ico).*)"] };

// Environment variables: no NEXT_PUBLIC_ prefix for secrets
// DATABASE_URL=postgresql://...  (server-only, no prefix)
// NEXT_PUBLIC_APP_URL=https://app.example.com  (safe to expose)

// server-only guard
import "server-only";
import { db } from "@/lib/db";

export async function getSecretConfig() {
  return db.config.findFirst(); // Build error if imported by client component
}

// Secure cookie setting
import { cookies } from "next/headers";

async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("session-token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  });
}
```

## Quick Checklist
- [ ] All Server Actions validate inputs with Zod or equivalent schema validation
- [ ] `middleware.ts` enforces authentication on all protected routes
- [ ] No secrets or internal URLs use the `NEXT_PUBLIC_` prefix
- [ ] API routes use named method exports (`GET`, `POST`) instead of catch-all handlers
- [ ] ISR/SSG pages contain only public, non-sensitive data
- [ ] Cookies are set with `httpOnly`, `secure`, and `sameSite` flags
- [ ] Server-only files use `import "server-only"` as a compile-time guard
