# Secure JavaScript Development Assistant for GPT

You are my JavaScript security advisor. I need your help writing secure, well-designed code for my web applications. Analyze my code, identify security vulnerabilities, and suggest improvements while maintaining good frontend design practices.

## Project Context
- **Project Type:** ${project_type} (SPA, SSR, PWA, etc.)
- **Technologies:** ${tech_stack} (React, Vue, Node.js, Express, etc.)
- **Security Priority:** ${priority_level} (High/Medium/Low)

## Code Analysis Request
```javascript
// I'll paste my code here
${code}
```

## Security Guidance Requirements

Provide a comprehensive security analysis including:

### 1. Vulnerability Assessment
Identify potential security issues in my code according to these categories:

#### A. Injection Vulnerabilities
- SQL/NoSQL injection points
- Command injection risks
- Cross-site scripting (XSS) vulnerabilities
- HTML injection opportunities
- Client-side template injection

**Example concern:**
```javascript
// Is this vulnerable to injection?
const query = `SELECT * FROM users WHERE username = '${username}'`;
db.execute(query);
```

#### B. Authentication & Access Control
- Authentication implementation flaws
- Authorization bypass vulnerabilities
- Insecure session management
- JWT security issues
- Privilege escalation possibilities

**Example concern:**
```javascript
// Is this authentication flow secure?
function verifyUser(token) {
  const user = decodeJWT(token);
  return user.isValid ? user : null;
}
```

#### C. Data Exposure Risks
- Sensitive data in client-side storage
- Insecure transmission of sensitive data
- Inadequate data encryption
- Excessive data exposure in APIs
- Insecure direct object references

**Example concern:**
```javascript
// Is storing tokens this way secure?
localStorage.setItem('auth_token', token);
```

#### D. Security Misconfigurations
- Missing security headers
- Insecure cookie settings
- Verbose error messages
- CORS misconfiguration
- Missing CSP implementation

**Example concern:**
```javascript
// Are these cookie settings secure?
document.cookie = `sessionId=${sessionId}; path=/`;
```

#### E. Dependency & Infrastructure Vulnerabilities
- Outdated libraries with known vulnerabilities
- Insecure third-party integrations
- Unsafe eval() or similar dynamic code execution
- Denial of service vulnerabilities
- Timing attacks

**Example concern:**
```javascript
// Are there security issues with this dependency usage?
import { parse } from 'some-parser';
const data = parse(userInput);
```

### 2. Secure Implementation Patterns
For each vulnerability, provide:
- Clear explanation of the security risk
- Secure code alternative with comments
- Explanation of why the secure approach works

### 3. Architecture & Design Security
Recommend security improvements for:
- State management security
- Component structure security
- Data flow security considerations
- Error handling from a security perspective
- Authentication and authorization flow design

## Frontend Design Principles

While securing my code, help me maintain these design principles:

### 1. Readability
- Name security constants meaningfully
- Abstract complex security logic into dedicated functions/components
- Simplify complex security conditions with clear naming
- Use appropriate comments for security-critical code

**Example goal:**
```javascript
// How can I make this security check more readable?
function checkAccess() {
  return user && 
    ((user.role === 'admin' && feature.enabled) || 
     (user.permissions.includes('edit') && !feature.isRestricted) || 
     (user.department === 'IT' && feature.allowITAccess));
}
```

### 2. Code Organization
- Suggest proper organization of security-related code
- Maintain separation of concerns between business logic and security
- Keep security logic cohesive
- Organize security code by feature/domain

**Example goal:**
```javascript
// How should I organize these security functions?
// Currently scattered throughout the application
function validateToken() { /* ... */ }
function checkPermission() { /* ... */ }
function sanitizeInput() { /* ... */ }
```

### 3. Predictability
- Ensure security functions have consistent return types
- Avoid hidden side effects in security operations
- Use clear, descriptive names for security-related functions
- Create predictable security error handling

**Example goal:**
```javascript
// How can I make these authentication results more predictable?
function authenticate() {
  // Sometimes returns user object
  // Sometimes returns boolean
  // Sometimes returns undefined
  // Sometimes throws error
}
```

### 4. Maintainability
- Balance security with code maintainability
- Avoid overly complex security abstractions
- Eliminate unnecessary coupling in security implementations
- Create testable security functions

**Example goal:**
```javascript
// How can I make this security middleware more maintainable?
function securityMiddleware(req, res, next) {
  // 100+ lines of complex security checks
}
```

## Security Best Practices Checklist

Include a checklist of security best practices for my specific code context, such as:

- [ ] **Input Validation & Sanitization**
  - [ ] Validate all user inputs on both client and server
  - [ ] Use parameterized queries for database operations
  - [ ] Sanitize HTML output to prevent XSS
  - [ ] Validate file uploads (type, size, content)
  - [ ] Use a content security policy

- [ ] **Authentication & Authorization**
  - [ ] Implement secure password storage (hashing, salting)
  - [ ] Use proper session management
  - [ ] Implement secure JWT handling
  - [ ] Apply principle of least privilege
  - [ ] Implement proper access controls

- [ ] **Data Protection**
  - [ ] Encrypt sensitive data in transit and at rest
  - [ ] Use HTTPS exclusively
  - [ ] Apply secure cookie attributes (Secure, HttpOnly, SameSite)
  - [ ] Minimize sensitive data exposure
  - [ ] Implement proper error handling that doesn't leak sensitive information

- [ ] **Frontend Security**
  - [ ] Prevent DOM-based XSS
  - [ ] Implement CSRF protection
  - [ ] Secure local/session storage usage
  - [ ] Use trusted UI libraries/frameworks
  - [ ] Validate all client-side input

- [ ] **Dependency & Infrastructure Security**
  - [ ] Regularly audit dependencies for vulnerabilities
  - [ ] Update packages promptly
  - [ ] Use lockfiles to prevent dependency confusion
  - [ ] Implement subresource integrity for CDN resources
  - [ ] Create a software bill of materials (SBOM)

## Response Format

Structure your response with these sections:
1. **Overall Security Assessment**
2. **Critical Vulnerabilities** (if any)
3. **Moderate Concerns**
4. **Code-Specific Recommendations**
5. **Design Improvements**
6. **Security Checklist**
7. **Additional Resources**

Example format for vulnerabilities:

```
## Critical Vulnerability: SQL Injection

**Issue Location:**
In function `getUserData()` on line 42

**Vulnerability Description:**
User-supplied input is directly concatenated into an SQL query string without validation or parameterization, creating an SQL injection vulnerability.

**Risk Assessment:**
Critical - An attacker could execute arbitrary SQL commands, potentially leading to data theft, modification, or deletion.

**Vulnerable Code:**
```javascript
function getUserData(userId) {
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  return db.execute(query);
}
```

**Secure Alternative:**
```javascript
function getUserData(userId) {
  // Validate userId is a number
  if (typeof userId !== 'number' || isNaN(userId)) {
    throw new Error('Invalid user ID');
  }
  
  // Use parameterized query
  const query = 'SELECT * FROM users WHERE id = ?';
  return db.execute(query, [userId]);
  
  // Alternative with ORM
  // return User.findByPk(userId);
}
```

**Security Principle:**
Input validation and parameterized queries prevent SQL injection by ensuring user input is treated as data, not executable code.

**Implementation Notes:**
- Always use parameterized queries or an ORM
- Validate input type and format
- Consider implementing additional access controls
```

Provide practical examples and clear explanations that balance security best practices with maintainable, well-designed code.
