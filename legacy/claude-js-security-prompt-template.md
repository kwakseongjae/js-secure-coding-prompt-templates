# JavaScript Secure Development Guide for Claude

## Introduction

I'm a JavaScript developer working on web applications. Help me create robust and secure code while maintaining good frontend design principles. Please provide guidance, examples, and best practices for secure JavaScript development.

## Development Context

- **App Type:** ${app_type} (e.g., React SPA, Node.js backend, etc.)
- **Framework:** ${framework} (e.g., React, Vue, Express, etc.)
- **Security Requirements:** ${requirements} (e.g., handling PII, payment processing, etc.)
- **Code Snippet (if applicable):** 
```javascript
${code}
```

## Security Analysis Request

Please review my approach/code and provide feedback on:

1. **Vulnerability Analysis**
2. **Secure Coding Recommendations**
3. **Best Practices Implementation**

## Security Focus Areas

### 1. Input Validation & Sanitization

Help me implement proper validation for:
- User input fields (forms, URL parameters)
- API responses
- File uploads
- Data serialization/deserialization

**Example concern:**
```javascript
// How should I validate this input?
function processUserData(userData) {
  const { name, email, id } = userData;
  // What validation should I add?
}
```

### 2. Authentication & Authorization

Guidance on:
- Secure login implementation
- Session management
- JWT handling and security
- Role-based access control
- Multi-factor authentication
- Password policies

**Example concern:**
```javascript
// Is this auth approach secure?
function login(username, password) {
  // Current implementation
}
```

### 3. Data Protection

Advice on:
- Sensitive data handling
- Secure storage practices
- HTTPS implementation
- API security
- Encryption best practices
- Secure cookie settings

**Example concern:**
```javascript
// How should I store this sensitive data?
const userToken = generateToken(userData);
localStorage.setItem('auth', userToken);
```

### 4. Frontend Security

Recommendations for:
- XSS prevention strategies
- CSRF protection
- Content Security Policy
- Secure state management
- DOM-based vulnerabilities
- Secure forms and inputs

**Example concern:**
```javascript
// Is this component vulnerable to XSS?
function UserProfile({ userData }) {
  return <div dangerouslySetInnerHTML={{ __html: userData.bio }} />;
}
```

### 5. Dependency Management

Help with:
- Package security
- Dependency auditing
- Updating vulnerable libraries
- Creating a secure SBOM
- Avoiding prototype pollution

**Example concern:**
```javascript
// How do I check if these dependencies have vulnerabilities?
// package.json snippet
{
  "dependencies": {
    "react": "^17.0.2",
    "axios": "^0.21.1"
  }
}
```

## Design Principles to Maintain

While securing my code, help me maintain these frontend design principles:

### 1. Readability
- Abstract complex security logic into clear, dedicated components
- Name security-related constants meaningfully
- Simplify complex validation logic
- Use appropriate comments for security-critical code

**Example:**
```javascript
// How can I make this validation more readable?
function validateInput(input) {
  return input && 
    input.length >= 8 && 
    input.length <= 20 && 
    /[A-Z]/.test(input) && 
    /[a-z]/.test(input) && 
    /[0-9]/.test(input) && 
    /[^A-Za-z0-9]/.test(input);
}
```

### 2. Predictability
- Standardize return types for security functions
- Avoid hidden security side effects
- Use descriptive names for security wrappers
- Ensure consistent error handling

**Example:**
```javascript
// How can I make this authentication function more predictable?
async function authenticate(credentials) {
  // Sometimes returns user object, sometimes boolean, sometimes throws
}
```

### 3. Cohesion
- Organize security code by feature/domain
- Implement validation at appropriate levels (field vs. form)
- Keep security constants near related logic
- Group related security functions together

**Example:**
```javascript
// Is this validation at the right level?
function PaymentForm() {
  // Form implementation with scattered validation logic
}
```

### 4. Low Coupling
- Break down broad security state management
- Use composition to avoid props drilling with security contexts
- Balance security abstractions carefully
- Minimize dependencies between components

**Example:**
```javascript
// Is this security context implementation too tightly coupled?
function SecurityProvider({ children }) {
  // Implementation details
}
```

## Output Format Preferences

For each security concern you identify, please provide:

1. **Issue Description:** Clear explanation of the vulnerability
2. **Risk Assessment:** Potential impact if exploited
3. **Code Example:** Both vulnerable and secure alternatives
4. **Security Principle:** The underlying concept being applied
5. **Implementation Tips:** Practical guidance for my specific context

Example format:

```
### Input Validation Vulnerability

**Issue Description:**
The application directly concatenates user input into an SQL query without validation or parameterization, creating an SQL injection vulnerability.

**Risk Assessment:**
High - Attackers could execute arbitrary SQL commands, potentially accessing, modifying, or deleting data in the database.

**Vulnerable Code:**
```javascript
function getUser(userId) {
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  return database.execute(query);
}
```

**Secure Alternative:**
```javascript
function getUser(userId) {
  const query = 'SELECT * FROM users WHERE id = ?';
  return database.execute(query, [userId]);
}
```

**Security Principle:**
Always use parameterized queries to separate SQL code from data, preventing attackers from injecting malicious SQL.

**Implementation Tips:**
- Use your ORM's built-in parameterization features
- Validate userId to ensure it matches expected format
- Consider additional access controls to verify the requesting user has permission to access this data
```

Please be thorough but practical, focusing on real-world risks and maintainable solutions that balance security with good design.
