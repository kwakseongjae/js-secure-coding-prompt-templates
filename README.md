# secure-coding-rules

[![npm version](https://img.shields.io/npm/v/secure-coding-rules.svg)](https://www.npmjs.com/package/secure-coding-rules)
[![license](https://img.shields.io/npm/l/secure-coding-rules.svg)](https://github.com/kwakseongjae/js-secure-coding-prompt-templates/blob/main/LICENSE)
[![node](https://img.shields.io/node/v/secure-coding-rules.svg)](https://nodejs.org)

**OWASP Top 10 2025** 기반 JavaScript/TypeScript 보안 코딩 룰을 AI 코딩 어시스턴트에 자동 적용하는 CLI 도구입니다.

`npx secure-coding-rules` 한 줄이면 프로젝트의 CLAUDE.md, .cursor/rules, .windsurf/rules, copilot-instructions.md, AGENTS.md에 보안 룰이 적용됩니다.

---

## Quick Start

```bash
npx secure-coding-rules
```

인터랙티브 프롬프트:
1. AI 도구 선택 (Claude Code / Cursor / Windsurf / Copilot / AGENTS.md)
2. 프레임워크 선택 (React / Vue / Node.js / Vanilla) - **자동 감지됨**
3. 보안 카테고리 선택 (전체 또는 개별)

### Auto Mode

프로젝트를 분석하여 자동으로 최적의 설정을 적용합니다:

```bash
npx secure-coding-rules --yes
```

- 기존 AI 도구 설정 파일이 있으면 자동 감지 후 업데이트
- package.json에서 프레임워크 자동 감지 (React, Vue, Node.js 등)
- CI/CD 등 non-interactive 환경에서도 동작

### Status Check

현재 프로젝트의 보안 룰 상태만 확인:

```bash
npx secure-coding-rules --check
```

## 지원 AI 도구

| AI Tool | Output | 기존 파일 |
|---------|--------|----------|
| **Claude Code** | `CLAUDE.md` | 자동 병합 |
| **Cursor** | `.cursor/rules/*.mdc` | 개별 파일 생성 |
| **Windsurf** | `.windsurf/rules/*.md` | 개별 파일 생성 |
| **GitHub Copilot** | `.github/copilot-instructions.md` | 자동 병합 |
| **AGENTS.md** | `AGENTS.md` | 자동 병합 |

## 보안 카테고리 (OWASP Top 10 2025)

| Code | Category | Description |
|------|----------|-------------|
| A01 | Broken Access Control | RBAC/ABAC, IDOR 방지, 서버사이드 인가 |
| A02 | Security Misconfiguration | 보안 헤더, CORS, 환경변수 관리 |
| A03 | Supply Chain Failures | npm audit, lockfile 무결성, SRI **(2025 신규)** |
| A04 | Cryptographic Failures | 안전한 해싱, 암호화, 키 관리 |
| A05 | Injection | XSS, SQLi, NoSQLi, Command Injection |
| A06 | Insecure Design | Threat modeling, 최소 권한 원칙 |
| A07 | Authentication Failures | MFA, 세션 관리, 패스워드 정책 |
| A08 | Data Integrity Failures | SRI, 안전한 역직렬화, CI/CD 보안 |
| A09 | Logging & Alerting | 보안 로깅, 민감정보 마스킹, 알림 |
| A10 | Error Handling | Fail-safe 기본값, 에러 정보 노출 방지 **(2025 신규)** |

### Frontend Modules

| Code | Category | Description |
|------|----------|-------------|
| FE-01 | XSS Prevention | DOM 조작 보안, sanitization |
| FE-02 | CSRF Protection | 토큰 기반 방어, SameSite 쿠키 |
| FE-03 | Content Security Policy | CSP 헤더, nonce, 리포팅 |
| FE-04 | Secure State | 안전한 상태관리, 메모리 내 토큰 |

## 동작 방식

### 룰 형식

모든 보안 룰은 AI가 이해하기 쉬운 일관된 구조를 따릅니다:

```markdown
### 1. Rule Title
- **DO**: 구체적으로 해야 할 것
- **DON'T**: 하지 말아야 할 것
- **WHY**: 왜 중요한지

## Code Examples
### Bad Practice / Good Practice

## Quick Checklist
- [ ] 체크리스트 항목
```

### 기존 파일 병합

이미 CLAUDE.md 등이 있으면 기존 내용을 보존하고 보안 섹션만 추가/업데이트합니다:

```html
<!-- js-secure-coding:start -->
(이 영역만 업데이트됨)
<!-- js-secure-coding:end -->
```

다시 실행하면 해당 영역만 최신 버전으로 교체됩니다.

### 프로젝트 자동 감지

`secure-coding-rules`는 실행 시 현재 프로젝트를 분석합니다:

- **AI 도구 감지**: CLAUDE.md, .cursor/, .windsurf/, .github/ 존재 여부 확인
- **프레임워크 감지**: package.json의 dependencies에서 React/Vue/Express 등 파악
- **상태 표시**: 인터랙티브 모드에서 감지 결과를 보여주고, 관련 항목을 우선 추천

## 수동 사용

CLI 없이 `src/templates/` 마크다운 파일을 직접 복사하여 사용 가능합니다:

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
npx secure-coding-rules              인터랙티브 모드 (자동 감지)
npx secure-coding-rules --yes        스마트 기본값으로 자동 적용
npx secure-coding-rules --check      프로젝트 보안 상태 확인
npx secure-coding-rules --dry-run    미리보기 (파일 생성 없음)
npx secure-coding-rules --help       도움말
npx secure-coding-rules --version    버전
```

## Legacy Templates

v1.0 원본 템플릿은 `legacy/` 디렉토리에 보존되어 있습니다.

## 참고 자료

- [OWASP Top 10 2025](https://owasp.org/Top10/2025/)
- [Node.js Security Best Practices](https://nodejs.org/en/learn/getting-started/security-best-practices)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/IndexTopTen.html)
- [JavaScript Secure Coding Guide (KISA)](https://www.kisa.or.kr/2060204/form?postSeq=14&page=1)

## Contributing

PR을 환영합니다! 새로운 보안 룰, AI 도구 어댑터, 기존 내용 개선 등.

## License

[MIT](LICENSE) - 곽성재 (Gwak Seong-jae)
