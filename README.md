# secure-coding-rules

[![npm version](https://img.shields.io/npm/v/secure-coding-rules.svg)](https://www.npmjs.com/package/secure-coding-rules)
[![license](https://img.shields.io/npm/l/secure-coding-rules.svg)](https://github.com/kwakseongjae/js-secure-coding-prompt-templates/blob/main/LICENSE)
[![node](https://img.shields.io/node/v/secure-coding-rules.svg)](https://nodejs.org)

Apply **OWASP Top 10 2025** JavaScript/TypeScript security rules to your AI coding assistant with one command.

Auto-generates security guidelines for CLAUDE.md, .cursor/rules, .windsurf/rules, copilot-instructions.md, and AGENTS.md.

---

## Quick Start

```bash
npx secure-coding-rules
```

Interactive prompts:
1. Select AI tool (Claude Code / Cursor / Windsurf / Copilot / AGENTS.md)
2. Select framework (React / Vue / Node.js / Vanilla) - **auto-detected**
3. Select security categories (all or individual)

### Auto Mode

Analyzes your project and applies optimal settings automatically:

```bash
npx secure-coding-rules --yes
```

- Auto-detects existing AI tool config files and updates them
- Auto-detects framework from package.json (React, Vue, Node.js, etc.)
- Works in CI/CD and other non-interactive environments

### Status Check

Check current project security rule status:

```bash
npx secure-coding-rules --check
```

## Supported AI Tools

| AI Tool | Output | Existing files |
|---------|--------|----------------|
| **Claude Code** | `CLAUDE.md` | Auto-merge |
| **Cursor** | `.cursor/rules/*.mdc` | Per-category files |
| **Windsurf** | `.windsurf/rules/*.md` | Per-category files |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Auto-merge |
| **AGENTS.md** | `AGENTS.md` | Auto-merge |

## Security Categories (OWASP Top 10 2025)

| Code | Category | Description |
|------|----------|-------------|
| A01 | Broken Access Control | RBAC/ABAC, IDOR prevention, server-side authz |
| A02 | Security Misconfiguration | Security headers, CORS, env vars |
| A03 | Supply Chain Failures | npm audit, lockfile integrity, SRI **(New in 2025)** |
| A04 | Cryptographic Failures | Secure hashing, encryption, key management |
| A05 | Injection | XSS, SQLi, NoSQLi, Command Injection |
| A06 | Insecure Design | Threat modeling, least privilege |
| A07 | Authentication Failures | MFA, session management, password policy |
| A08 | Data Integrity Failures | SRI, safe deserialization, CI/CD security |
| A09 | Logging & Alerting | Security logging, sensitive data masking |
| A10 | Error Handling | Fail-safe defaults, error info leakage **(New in 2025)** |

### Frontend Modules

| Code | Category | Description |
|------|----------|-------------|
| FE-01 | XSS Prevention | Safe DOM manipulation, sanitization |
| FE-02 | CSRF Protection | Token-based defense, SameSite cookies |
| FE-03 | Content Security Policy | CSP headers, nonce, reporting |
| FE-04 | Secure State | Safe state management, in-memory tokens |

## How It Works

### Rule Format

All security rules follow a consistent, AI-friendly structure:

```markdown
### 1. Rule Title
- **DO**: What to do (specific instruction)
- **DON'T**: What to avoid
- **WHY**: Why it matters

## Code Examples
### Bad Practice / Good Practice

## Quick Checklist
- [ ] Checklist items
```

### File Merging

If CLAUDE.md or other config files already exist, existing content is preserved and only the security section is added/updated:

```html
<!-- js-secure-coding:start -->
(only this region is updated)
<!-- js-secure-coding:end -->
```

Re-running replaces only the marked region with the latest version.

### Auto-Detection

`secure-coding-rules` analyzes your project at runtime:

- **AI tools**: Checks for CLAUDE.md, .cursor/, .windsurf/, .github/
- **Framework**: Reads package.json dependencies (React, Vue, Express, etc.)
- **Smart prompts**: Detected items are highlighted and prioritized in interactive mode

## Manual Usage

You can also copy markdown files from `src/templates/` directly without the CLI:

```
src/templates/
├── core/           # OWASP Top 10 2025 (A01-A10)
│   ├── access-control.md
│   ├── authentication.md
│   ├── cryptographic.md
│   ├── data-integrity.md
│   ├── error-handling.md
│   ├── injection.md
│   ├── logging-alerting.md
│   ├── secure-design.md
│   ├── security-config.md
│   └── supply-chain.md
└── frontend/       # Frontend 특화 보안 룰
    ├── xss-prevention.md
    ├── csrf-protection.md
    ├── csp.md
    └── secure-state.md
```

## CLI Options

```
npx secure-coding-rules              Interactive mode (auto-detect)
npx secure-coding-rules --yes        Smart defaults
npx secure-coding-rules --check      Project security status
npx secure-coding-rules --dry-run    Preview (no file writes)
npx secure-coding-rules --lang ko    Run in Korean (한국어)
npx secure-coding-rules --help       Help
npx secure-coding-rules --version    Version
```

### Language / 다국어

Auto-detects system locale (`LANG` env). Override with `--lang`:

```bash
npx secure-coding-rules --lang en    # English (default)
npx secure-coding-rules --lang ko    # 한국어
```

## Legacy Templates

Original v1.0 prompt templates are preserved in the `legacy/` directory.

## References

- [OWASP Top 10 2025](https://owasp.org/Top10/2025/)
- [Node.js Security Best Practices](https://nodejs.org/en/learn/getting-started/security-best-practices)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/IndexTopTen.html)
- [JavaScript Secure Coding Guide (KISA)](https://www.kisa.or.kr/2060204/form?postSeq=14&page=1)

## Contributing

PRs welcome! New security rules, AI tool adapters, or improvements to existing content.

## License

[MIT](LICENSE)
