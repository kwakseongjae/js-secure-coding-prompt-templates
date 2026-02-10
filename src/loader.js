/**
 * Template loader - reads modular security rule files
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEMPLATES_DIR = join(__dirname, 'templates');

const CATEGORY_DIRS = {
  // OWASP Top 10 2025
  'access-control': 'core',
  'security-config': 'core',
  'supply-chain': 'core',
  'cryptographic': 'core',
  'injection': 'core',
  'secure-design': 'core',
  'authentication': 'core',
  'data-integrity': 'core',
  'logging-alerting': 'core',
  'error-handling': 'core',
  // Frontend
  'xss-prevention': 'frontend',
  'csrf-protection': 'frontend',
  'csp': 'frontend',
  'secure-state': 'frontend',
  // TypeScript
  'typescript-security': 'typescript',
  // Frameworks
  'react-security': 'frameworks',
  'express-security': 'frameworks',
  'nextjs-security': 'frameworks',
};

/**
 * Load a single template file by category name
 */
export async function loadTemplate(category) {
  const subdir = CATEGORY_DIRS[category];
  if (!subdir) {
    console.warn(`Warning: Template not found: ${category}`);
    return null;
  }
  const filePath = join(TEMPLATES_DIR, subdir, `${category}.md`);
  try {
    return await readFile(filePath, 'utf-8');
  } catch {
    console.warn(`Warning: Template not found: ${category}`);
    return null;
  }
}

/**
 * Load multiple templates and return as Map<category, content>
 */
export async function loadTemplates(categories) {
  const templates = new Map();
  const results = await Promise.all(
    categories.map(async (cat) => {
      const content = await loadTemplate(cat);
      return [cat, content];
    })
  );
  for (const [cat, content] of results) {
    if (content) templates.set(cat, content);
  }
  return templates;
}

/**
 * Get category metadata
 */
export function getCategoryInfo(category) {
  const info = {
    'access-control': { owasp: 'A01', title: 'Broken Access Control', group: 'core' },
    'security-config': { owasp: 'A02', title: 'Security Misconfiguration', group: 'core' },
    'supply-chain': { owasp: 'A03', title: 'Supply Chain Failures', group: 'core' },
    'cryptographic': { owasp: 'A04', title: 'Cryptographic Failures', group: 'core' },
    'injection': { owasp: 'A05', title: 'Injection', group: 'core' },
    'secure-design': { owasp: 'A06', title: 'Insecure Design', group: 'core' },
    'authentication': { owasp: 'A07', title: 'Authentication Failures', group: 'core' },
    'data-integrity': { owasp: 'A08', title: 'Data Integrity Failures', group: 'core' },
    'logging-alerting': { owasp: 'A09', title: 'Logging & Alerting Failures', group: 'core' },
    'error-handling': { owasp: 'A10', title: 'Error Handling', group: 'core' },
    'xss-prevention': { owasp: 'FE-01', title: 'XSS Prevention', group: 'frontend' },
    'csrf-protection': { owasp: 'FE-02', title: 'CSRF Protection', group: 'frontend' },
    'csp': { owasp: 'FE-03', title: 'Content Security Policy', group: 'frontend' },
    'secure-state': { owasp: 'FE-04', title: 'Secure State Management', group: 'frontend' },
    'typescript-security': { owasp: 'TS-01', title: 'TypeScript Security', group: 'typescript' },
    'react-security': { owasp: 'FW-01', title: 'React Security', group: 'frameworks' },
    'express-security': { owasp: 'FW-02', title: 'Express Security', group: 'frameworks' },
    'nextjs-security': { owasp: 'FW-03', title: 'Next.js Security', group: 'frameworks' },
  };
  return info[category] || { owasp: '??', title: category, group: 'unknown' };
}
