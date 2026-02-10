# React Security Rules

> Security rules for React and Next.js frontend applications, covering XSS prevention, state management, and secure component patterns.

## Rules

### 1. Never Use `dangerouslySetInnerHTML` Without Sanitization
- **DO**: Use DOMPurify or a trusted sanitization library to sanitize HTML before rendering. Prefer rendering structured data with JSX instead of raw HTML.
- **DON'T**: Pass user-supplied or external data directly to `dangerouslySetInnerHTML`. Never assume HTML content from APIs is safe.
- **WHY**: `dangerouslySetInnerHTML` bypasses React's built-in XSS protection and injects raw HTML into the DOM. Unsanitized input leads directly to stored or reflected XSS attacks.

### 2. Prevent Memory Leaks and Race Conditions in useEffect
- **DO**: Return a cleanup function from `useEffect` to cancel async operations (use `AbortController`), clear timers, and unsubscribe from listeners. Use the cleanup flag pattern for async effects.
- **DON'T**: Fire async requests in `useEffect` without cancellation logic. Ignoring cleanup causes state updates on unmounted components and race conditions.
- **WHY**: Uncancelled async operations can update state after unmount, causing errors and potentially processing stale or attacker-manipulated responses from superseded requests.

### 3. Never Store Sensitive Data in React State or Context
- **DO**: Keep tokens in `httpOnly` cookies managed by the server. If client-side storage is unavoidable, use short-lived tokens with secure refresh mechanisms.
- **DON'T**: Store JWTs, API keys, passwords, or PII in `useState`, `useContext`, Redux, or any client-side state. Never put secrets in `localStorage` or `sessionStorage`.
- **WHY**: Client-side state is fully accessible via browser DevTools, XSS attacks, and browser extensions. Any data in React state should be considered public to the client.

### 4. Never Pass Sensitive Data Through Props
- **DO**: Fetch sensitive data only where it is needed. Use server-side rendering or secure API calls within the consuming component itself.
- **DON'T**: Pass tokens, secrets, or full user records through component props chains. Props are visible in React DevTools and can leak through component trees.
- **WHY**: Prop drilling exposes sensitive data across the component tree. React DevTools displays all props in plaintext, and any parent component re-render can unintentionally log or expose prop values.

### 5. Guard Server Components Against Data Leakage
- **DO**: Separate server-only logic into files with `"server-only"` import guard. Verify that server component data is filtered before passing to client components.
- **DON'T**: Import server-side utilities or secrets into client components. Never pass database records or internal IDs directly from server to client components without filtering.
- **WHY**: Next.js server components run on the server but their return values are serialized and sent to the client. Sensitive data in server component output ends up in the client-side HTML or RSC payload.

### 6. Use Error Boundaries with React.lazy Code Splitting
- **DO**: Wrap `React.lazy` components with `<Suspense>` and an `<ErrorBoundary>`. Log errors securely without exposing internal paths or stack traces to users.
- **DON'T**: Let lazy-loaded component failures crash the entire app or display raw error messages to users.
- **WHY**: Failed chunk loads (network errors, deploy mismatches) can crash the app. Without error boundaries, users see raw error details that may reveal internal architecture, file paths, or API endpoints.

### 7. Sanitize URL Schemes in Dynamic Links and Redirects
- **DO**: Validate that dynamic `href` values use `https:` or safe schemes. Use an allowlist for URL schemes. Encode URL parameters with `encodeURIComponent`.
- **DON'T**: Render user-supplied URLs in `<a href>` or `window.location` without validation. Never allow `javascript:`, `data:`, or `vbscript:` schemes.
- **WHY**: React does not sanitize `href` attributes. A `javascript:` URI in an anchor tag executes arbitrary code when clicked, leading to XSS.

## Code Examples

### Bad Practice
```jsx
// XSS via dangerouslySetInnerHTML
function Comment({ body }) {
  return <div dangerouslySetInnerHTML={{ __html: body }} />;
}

// Race condition — no cleanup in useEffect
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => setUser(data)); // Runs even if unmounted
  }, [userId]);
}

// Token stored in React state
function App() {
  const [token, setToken] = useState(localStorage.getItem("jwt"));
  return <AppContext.Provider value={{ token }}>{/* ... */}</AppContext.Provider>;
}
```

### Good Practice
```jsx
import DOMPurify from "dompurify";

// Sanitized HTML rendering
function Comment({ body }) {
  const clean = DOMPurify.sanitize(body);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}

// Proper cleanup with AbortController
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/users/${userId}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      });
    return () => controller.abort();
  }, [userId]);
}

// Error boundary with lazy loading
const LazyDashboard = React.lazy(() => import("./Dashboard"));

function App() {
  return (
    <ErrorBoundary fallback={<p>Something went wrong.</p>}>
      <Suspense fallback={<p>Loading...</p>}>
        <LazyDashboard />
      </Suspense>
    </ErrorBoundary>
  );
}

// Safe URL validation
function SafeLink({ href, children }) {
  const isSafe = /^https?:\/\//i.test(href);
  return isSafe ? <a href={href}>{children}</a> : <span>{children}</span>;
}
```

## Quick Checklist
- [ ] No `dangerouslySetInnerHTML` without DOMPurify sanitization
- [ ] All `useEffect` async operations have cleanup / `AbortController`
- [ ] No tokens, passwords, or API keys stored in React state
- [ ] Sensitive data is not passed through props across component boundaries
- [ ] Server components use `"server-only"` guard and filter data before client handoff
- [ ] `React.lazy` components are wrapped with `ErrorBoundary` and `Suspense`
- [ ] Dynamic URLs are validated against an allowlist of safe schemes
