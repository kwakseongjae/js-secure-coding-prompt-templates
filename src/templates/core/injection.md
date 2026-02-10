# Injection Security Rules

> OWASP Top 10 2025 - A05: Injection

## Rules

### 1. Use Parameterized Queries for All Database Operations
- **DO**: Use parameterized queries, prepared statements, or ORM query builders for all SQL and NoSQL operations.
- **DON'T**: Concatenate or interpolate user input into query strings.
- **WHY**: SQL/NoSQL injection allows attackers to read, modify, or delete entire databases and potentially execute system commands.

### 2. Sanitize and Escape All Output
- **DO**: Context-encode output before rendering in HTML, JavaScript, CSS, or URL contexts. Use framework auto-escaping.
- **DON'T**: Insert raw user input into HTML templates or DOM elements using `innerHTML` or `dangerouslySetInnerHTML`.
- **WHY**: Cross-Site Scripting (XSS) enables session hijacking, credential theft, and defacement.

### 3. Validate and Sanitize User Input
- **DO**: Validate input against strict schemas (type, length, format, allowed characters). Use allowlists over denylists.
- **DON'T**: Accept any input and try to filter out known-bad patterns.
- **WHY**: Denylist-based filtering is always incomplete. Allowlisting ensures only expected input is processed.

### 4. Prevent Command Injection
- **DO**: Avoid shell commands. If necessary, use `execFile` with an argument array instead of `exec` with string interpolation.
- **DON'T**: Pass user input to `child_process.exec()`, `eval()`, `Function()`, or template literals in shell commands.
- **WHY**: Command injection gives attackers full control over the server operating system.

### 5. Guard Against Template Injection
- **DO**: Use logic-less templates or sandbox template rendering. Never pass user input as template source.
- **DON'T**: Allow users to control template strings that are compiled or rendered server-side.
- **WHY**: Server-Side Template Injection (SSTI) can lead to Remote Code Execution (RCE).

### 6. Prevent Path Traversal
- **DO**: Resolve file paths and verify they fall within the intended directory using `path.resolve()` and prefix checking.
- **DON'T**: Use user input directly in file system operations without path validation.
- **WHY**: Path traversal allows reading arbitrary files like `/etc/passwd` or application secrets.

### 7. Sanitize Regular Expressions
- **DO**: Escape user input used in regular expressions. Set timeouts or use RE2 for untrusted patterns.
- **DON'T**: Pass user input directly to `new RegExp()` without escaping.
- **WHY**: ReDoS (Regular Expression Denial of Service) can hang the event loop with crafted input.

## Code Examples

### Bad Practice
```javascript
// SQL Injection
const query = `SELECT * FROM users WHERE id = '${req.params.id}'`;
await db.query(query);

// NoSQL Injection
const user = await User.findOne({ username: req.body.username, password: req.body.password });

// Command Injection
const { exec } = require("child_process");
exec(`convert ${req.query.filename} output.png`);

// Path Traversal
const filePath = `./uploads/${req.params.filename}`;
res.sendFile(filePath);

// XSS via innerHTML
element.innerHTML = userInput;

// eval with user input
const result = eval(req.body.expression);
```

### Good Practice
```javascript
import { execFile } from "node:child_process";
import path from "node:path";

// Parameterized SQL query
const [rows] = await db.execute(
  "SELECT * FROM users WHERE id = ?",
  [req.params.id]
);

// Safe NoSQL query - validate types explicitly
const username = String(req.body.username);
const user = await User.findOne({ username });
const isValid = await verifyPassword(req.body.password, user.passwordHash);

// Safe command execution with execFile
execFile("convert", [validatedFilename, "output.png"], (error, stdout) => {
  if (error) handleError(error);
});

// Path traversal prevention
function getSafeFilePath(userInput, baseDir) {
  const resolved = path.resolve(baseDir, userInput);
  if (!resolved.startsWith(path.resolve(baseDir) + path.sep)) {
    throw new Error("Path traversal detected");
  }
  return resolved;
}

// Safe DOM manipulation
element.textContent = userInput; // Auto-escaped, no HTML parsing

// Input validation with schema
import { z } from "zod";
const UserInput = z.object({
  email: z.string().email().max(254),
  name: z.string().min(1).max(100).regex(/^[a-zA-Z\s'-]+$/),
  age: z.number().int().min(0).max(150),
});
const validated = UserInput.parse(req.body);

// Safe regex from user input
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const safePattern = new RegExp(escapeRegex(userInput), "i");
```

## Quick Checklist
- [ ] All database queries use parameterized statements or ORM query builders
- [ ] User input is never concatenated into SQL, NoSQL, LDAP, or OS commands
- [ ] Output is context-encoded for the rendering context (HTML, JS, URL, CSS)
- [ ] `eval()`, `Function()`, and `setTimeout(string)` are never used with user input
- [ ] File paths from user input are resolved and validated against a base directory
- [ ] Shell commands use `execFile` with argument arrays, not `exec` with string interpolation
- [ ] Input is validated with strict schemas (type, length, format, allowlist)
- [ ] Regular expressions from user input are escaped or use safe regex engines
