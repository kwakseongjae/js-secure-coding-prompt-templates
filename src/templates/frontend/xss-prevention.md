# XSS Prevention Security Rules

> Frontend Security - Cross-Site Scripting (XSS) Defense

## Rules

### 1. Never Use `innerHTML` or `dangerouslySetInnerHTML` with User Input
- **DO**: Use `textContent` for plain text insertion. Use a trusted sanitization library (DOMPurify) when HTML rendering is absolutely necessary.
- **DON'T**: Assign user-controlled strings to `innerHTML`, `outerHTML`, or React's `dangerouslySetInnerHTML`.
- **WHY**: Direct HTML insertion is the primary XSS vector. Any unsanitized markup can execute arbitrary JavaScript in the user's browser.

### 2. Leverage Framework Auto-Escaping
- **DO**: Use React JSX expressions `{variable}`, Vue template interpolation `{{ variable }}`, or Angular template binding `{{ variable }}` which auto-escape by default.
- **DON'T**: Bypass framework escaping mechanisms unless absolutely necessary and with sanitized input.
- **WHY**: Modern frameworks escape output by default, preventing the majority of XSS attacks without extra effort.

### 3. Sanitize Rich Text and Markdown
- **DO**: Use DOMPurify with a strict allowlist of tags and attributes when rendering user-generated HTML or Markdown.
- **DON'T**: Trust Markdown-to-HTML conversion output without post-sanitization. Never allow `<script>`, `<iframe>`, event handlers, or `javascript:` URIs.
- **WHY**: Markdown parsers may produce raw HTML. Even "safe" tags can carry malicious attributes like `onerror` or `onload`.

### 4. Validate and Sanitize URLs
- **DO**: Validate that user-provided URLs use `https:` or `http:` protocols. Reject `javascript:`, `data:`, and `vbscript:` URIs.
- **DON'T**: Render user-supplied URLs in `href`, `src`, or `action` attributes without protocol validation.
- **WHY**: `javascript:` URIs execute code when clicked or loaded, bypassing typical XSS defenses.

### 5. Avoid Dynamic Code Execution
- **DO**: Use static templates and data binding. Parse JSON with `JSON.parse()`.
- **DON'T**: Use `eval()`, `Function()`, `setTimeout(string)`, or `setInterval(string)` with any data derived from user input.
- **WHY**: Dynamic code execution converts data into code, the fundamental cause of injection attacks.

### 6. Escape Data in Non-HTML Contexts
- **DO**: Apply context-specific encoding when inserting data into JavaScript strings, CSS values, or URL parameters.
- **DON'T**: Assume HTML escaping is sufficient for all contexts. Each context (JS, CSS, URL) needs its own encoding.
- **WHY**: HTML-encoded data inserted into a `<script>` block or inline CSS can still execute as code.

### 7. Implement DOM-Based XSS Prevention
- **DO**: Treat all client-side data sources (URL parameters, `location.hash`, `document.referrer`, `postMessage`) as untrusted. Validate before use.
- **DON'T**: Read from `window.location`, `document.cookie`, or `localStorage` and insert directly into the DOM.
- **WHY**: DOM-based XSS occurs entirely in the browser without server involvement, bypassing server-side sanitization.

## Code Examples

### Bad Practice
```javascript
// Direct innerHTML with user input
document.getElementById("output").innerHTML = userComment;

// React dangerouslySetInnerHTML without sanitization
function Comment({ body }) {
  return <div dangerouslySetInnerHTML={{ __html: body }} />;
}

// javascript: URI in href
function UserLink({ url, label }) {
  return <a href={url}>{label}</a>; // url could be "javascript:alert(1)"
}

// DOM-based XSS via URL hash
const name = decodeURIComponent(window.location.hash.slice(1));
document.getElementById("greeting").innerHTML = `Hello, ${name}!`;

// eval with user data
const config = eval(`(${searchParams.get("config")})`);
```

### Good Practice
```javascript
import DOMPurify from "dompurify";

// Safe text insertion
document.getElementById("output").textContent = userComment;

// React with DOMPurify for rich content
function Comment({ body }) {
  const sanitized = DOMPurify.sanitize(body, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li"],
    ALLOWED_ATTR: ["href", "title"],
  });
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

// Safe URL validation
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return ["https:", "http:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function UserLink({ url, label }) {
  const safeUrl = isValidUrl(url) ? url : "#";
  return <a href={safeUrl} rel="noopener noreferrer">{label}</a>;
}

// Safe DOM-based rendering
const name = decodeURIComponent(window.location.hash.slice(1));
const greeting = document.getElementById("greeting");
greeting.textContent = `Hello, ${name}!`; // textContent, not innerHTML

// Safe postMessage handling
window.addEventListener("message", (event) => {
  if (event.origin !== "https://trusted-domain.com") return; // Origin check
  const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
  // Validate schema before use
  if (typeof data.action === "string" && typeof data.value === "string") {
    handleMessage(data);
  }
});

// Safe JSON parsing instead of eval
const config = JSON.parse(searchParams.get("config") ?? "{}");
```

## Quick Checklist
- [ ] No `innerHTML` or `dangerouslySetInnerHTML` with unsanitized user input
- [ ] DOMPurify used for any user-generated HTML/Markdown rendering
- [ ] Framework auto-escaping relied upon for standard output
- [ ] User-provided URLs validated for safe protocols (`https:`, `http:`)
- [ ] No `eval()`, `Function()`, or `setTimeout(string)` with user data
- [ ] `postMessage` handlers validate `event.origin`
- [ ] URL parameters, hash, and referrer treated as untrusted input
- [ ] Context-specific encoding applied (HTML, JS, CSS, URL contexts)
