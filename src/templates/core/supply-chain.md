# Software Supply Chain Security Rules

> OWASP Top 10 2025 - A03: Software Supply Chain Failures (NEW)

## Rules

### 1. Audit Dependencies Regularly
- **DO**: Run `npm audit` in CI/CD pipelines. Use tools like Socket.dev or Snyk to detect malicious or vulnerable packages.
- **DON'T**: Ignore audit warnings or suppress them without reviewing each finding.
- **WHY**: Known vulnerabilities in dependencies are a top attack vector. Automated auditing catches issues before deployment.

### 2. Pin Dependency Versions
- **DO**: Use exact versions or lockfiles (`package-lock.json`, `pnpm-lock.yaml`) and commit them to version control.
- **DON'T**: Use loose version ranges (e.g., `^` or `*`) for production dependencies without lockfile enforcement.
- **WHY**: Unpinned versions allow silent upgrades that may introduce vulnerabilities or malicious code.

### 3. Verify Lockfile Integrity
- **DO**: Enable lockfile-only installs in CI (`npm ci` or `--frozen-lockfile`). Detect and reject unexpected lockfile changes.
- **DON'T**: Run `npm install` in CI, which can modify the lockfile and pull in unreviewed versions.
- **WHY**: Lockfile manipulation is a supply chain attack vector. Strict installs ensure reproducible, verified builds.

### 4. Use Subresource Integrity (SRI)
- **DO**: Add `integrity` attributes to all external `<script>` and `<link>` tags loading from CDNs.
- **DON'T**: Load external scripts without integrity verification.
- **WHY**: SRI ensures the browser rejects tampered CDN assets, preventing supply chain attacks via compromised CDNs.

### 5. Minimize Dependency Surface
- **DO**: Evaluate each dependency for necessity, maintenance status, and security posture before adding it.
- **DON'T**: Add packages for trivial functionality that can be implemented in a few lines of code.
- **WHY**: Each dependency is a trust relationship. Fewer dependencies mean a smaller attack surface and less risk of transitive vulnerabilities.

### 6. Monitor for Typosquatting and Malicious Packages
- **DO**: Double-check package names before installing. Use scoped packages (`@org/package`) where possible.
- **DON'T**: Install packages without verifying the publisher, download count, and repository link.
- **WHY**: Typosquatting attacks publish packages with similar names to popular libraries, injecting malicious code.

### 7. Enforce Build Reproducibility
- **DO**: Use deterministic builds. Pin Node.js versions, use lockfiles, and build in controlled environments.
- **DON'T**: Allow builds to fetch latest versions at build time or rely on mutable tags like `latest`.
- **WHY**: Non-reproducible builds make it impossible to verify that deployed code matches reviewed source.

### 8. Restrict Install Scripts
- **DO**: Use `--ignore-scripts` flag when installing untrusted packages. Review `preinstall` and `postinstall` scripts.
- **DON'T**: Allow arbitrary install scripts to run without review, especially from new or unvetted dependencies.
- **WHY**: Malicious install scripts can execute arbitrary code during `npm install`, compromising the build environment.

## Code Examples

### Bad Practice
```json
// package.json with loose version ranges
{
  "dependencies": {
    "lodash": "*",
    "express": "^4",
    "some-unknown-pkg": "latest"
  }
}
```

```html
<!-- Loading CDN scripts without integrity check -->
<script src="https://cdn.example.com/lib/v3/analytics.min.js"></script>
```

```yaml
# CI pipeline using npm install (modifies lockfile)
steps:
  - run: npm install
  - run: npm run build
```

### Good Practice
```json
// package.json with pinned versions
{
  "dependencies": {
    "lodash": "4.17.21",
    "express": "4.21.2"
  },
  "overrides": {
    "vulnerable-transitive-dep": ">=2.0.1"
  }
}
```

```html
<!-- CDN scripts with SRI -->
<script
  src="https://cdn.example.com/lib/v3/analytics.min.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8w"
  crossorigin="anonymous"
></script>
```

```yaml
# CI pipeline with frozen lockfile and audit
steps:
  - run: npm ci --ignore-scripts   # Frozen lockfile, no scripts
  - run: npm audit --audit-level=high
  - run: npx lockfile-lint --path package-lock.json --type npm --allowed-hosts npm
  - run: npm run build
```

```javascript
// Runtime dependency verification helper
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

async function verifyFileIntegrity(filePath, expectedHash) {
  const content = await readFile(filePath);
  const hash = createHash("sha384").update(content).digest("base64");
  if (hash !== expectedHash) {
    throw new Error(`Integrity check failed for ${filePath}`);
  }
}
```

## Quick Checklist
- [ ] `npm audit` (or equivalent) runs in CI on every build
- [ ] `package-lock.json` is committed and CI uses `npm ci`
- [ ] No wildcard (`*`) or `latest` version ranges in production dependencies
- [ ] External CDN scripts use SRI `integrity` attributes
- [ ] New dependencies are reviewed for security posture before adoption
- [ ] Install scripts are reviewed or disabled for untrusted packages
- [ ] Node.js version is pinned in `.nvmrc` or `engines` field
- [ ] Dependency update PRs are reviewed for unexpected changes
