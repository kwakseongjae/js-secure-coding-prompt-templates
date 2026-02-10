# Secure State Management and DOM Security Rules

> Frontend Security - Safe State Management and DOM Manipulation

## Rules

### 1. Never Store Sensitive Data in Client-Side State
- **DO**: Store only non-sensitive UI state in the browser. Keep tokens in `HttpOnly` cookies managed by the server.
- **DON'T**: Store JWTs, API keys, passwords, or PII in `localStorage`, `sessionStorage`, Redux/Zustand stores, or global variables.
- **WHY**: All client-side storage is accessible via XSS. A single XSS vulnerability exposes all data in `localStorage` and JavaScript state.

### 2. Sanitize Data Before DOM Insertion
- **DO**: Use `textContent` for text, framework bindings for dynamic content, and DOMPurify for user-generated HTML.
- **DON'T**: Use `innerHTML`, `outerHTML`, `document.write()`, or jQuery's `.html()` with any user-influenced data.
- **WHY**: Unsafe DOM APIs parse strings as HTML, enabling XSS through injected `<script>` tags, event handlers, or malicious attributes.

### 3. Validate postMessage Communication
- **DO**: Always check `event.origin` against an allowlist. Validate the message schema before processing.
- **DON'T**: Accept messages from any origin or use `targetOrigin: "*"` when sending sensitive data.
- **WHY**: Without origin validation, any page can send messages to your application, enabling XSS and data injection attacks.

### 4. Avoid Exposing Sensitive State in URLs
- **DO**: Use POST requests for sensitive data. Keep tokens and PII out of URL parameters and fragments.
- **DON'T**: Pass tokens, session IDs, or sensitive data in URL query strings or hash fragments.
- **WHY**: URLs are logged in browser history, server logs, referrer headers, and analytics tools, leaking sensitive data.

### 5. Implement Immutable State Updates
- **DO**: Use immutable update patterns (spread operator, `structuredClone()`, Immer). Never mutate state directly.
- **DON'T**: Modify state objects directly or share mutable references between components.
- **WHY**: Mutable state causes unpredictable UI updates, race conditions, and can mask security-relevant state changes (e.g., permission levels).

### 6. Secure Third-Party Widget Integration
- **DO**: Load third-party widgets in sandboxed `<iframe>` elements with minimal `allow` attributes. Use `sandbox` attribute.
- **DON'T**: Load third-party scripts directly into your page's DOM context.
- **WHY**: Third-party scripts have full access to the page's DOM, cookies, and state. A compromised widget compromises your entire application.

### 7. Clear Sensitive State on Logout and Navigation
- **DO**: Clear all sensitive in-memory state, revoke tokens, and invalidate sessions when users log out.
- **DON'T**: Leave sensitive data in memory or storage after logout or session expiry.
- **WHY**: Residual state can be accessed by subsequent users on shared devices or by malicious scripts after session expiry.

## Code Examples

### Bad Practice
```javascript
// Storing JWT in localStorage
localStorage.setItem("authToken", response.token);

// Direct DOM manipulation with user data
document.getElementById("bio").innerHTML = user.bio;

// postMessage without origin check
window.addEventListener("message", (event) => {
  updateProfile(event.data); // Accepts from any origin
});

// Sending sensitive data via postMessage to any origin
parent.postMessage({ token: authToken }, "*");

// Sensitive data in URL
window.location.href = `/dashboard?token=${authToken}&ssn=${user.ssn}`;

// Mutating state directly
state.user.role = "admin"; // Direct mutation
```

### Good Practice
```javascript
// Auth tokens in HttpOnly cookies (set by server, not accessible via JS)
// Server-side:
res.cookie("session", sessionToken, {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 3600_000,
});

// Client-side: cookies are sent automatically, no JS storage needed
async function fetchProfile() {
  return fetch("/api/profile", { credentials: "same-origin" });
}

// Safe DOM update
document.getElementById("bio").textContent = user.bio;

// Secure postMessage with origin validation
const TRUSTED_ORIGINS = new Set(["https://trusted-widget.example.com"]);

window.addEventListener("message", (event) => {
  if (!TRUSTED_ORIGINS.has(event.origin)) return;
  const schema = z.object({ type: z.string(), payload: z.unknown() });
  const result = schema.safeParse(event.data);
  if (!result.success) return;
  handleValidatedMessage(result.data);
});

// Send with specific target origin
widgetFrame.contentWindow.postMessage(
  { type: "theme", value: "dark" },
  "https://trusted-widget.example.com" // Specific origin, not "*"
);

// Immutable state updates (React example)
function userReducer(state, action) {
  switch (action.type) {
    case "UPDATE_PROFILE":
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case "LOGOUT":
      return { ...initialState }; // Reset to clean state
    default:
      return state;
  }
}

// Sandboxed third-party widget
function ThirdPartyWidget({ src }) {
  return (
    <iframe
      src={src}
      sandbox="allow-scripts allow-same-origin"
      referrerPolicy="no-referrer"
      loading="lazy"
      style={{ border: "none" }}
      title="Widget"
    />
  );
}

// Comprehensive logout
async function secureLogout() {
  await fetch("/api/logout", { method: "POST", credentials: "same-origin" });
  // Clear any client-side state
  sessionStorage.clear();
  // Reset application state
  store.dispatch({ type: "RESET" });
  // Navigate to prevent back-button access
  window.location.replace("/login");
}

// Clear sensitive data from memory (for sensitive forms)
function SecureForm() {
  const [formData, setFormData] = useState({ cardNumber: "", cvv: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await submitPayment(formData);
    } finally {
      setFormData({ cardNumber: "", cvv: "" }); // Clear immediately after use
    }
  }

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

## Quick Checklist
- [ ] No JWTs, API keys, or PII in `localStorage` or `sessionStorage`
- [ ] Auth tokens stored in `HttpOnly`, `Secure`, `SameSite` cookies
- [ ] `textContent` used instead of `innerHTML` for user data
- [ ] `postMessage` handlers validate `event.origin` against allowlist
- [ ] `postMessage` sends specify exact `targetOrigin` (not `"*"`)
- [ ] No sensitive data in URL parameters or hash fragments
- [ ] Immutable state update patterns used consistently
- [ ] Third-party widgets loaded in sandboxed iframes
- [ ] All sensitive state cleared on logout
- [ ] Shared device considerations addressed (no residual state)
