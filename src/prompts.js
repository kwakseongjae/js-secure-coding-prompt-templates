/**
 * Interactive CLI prompts using Node.js built-in readline
 * Zero dependencies - works with Node.js 18+
 */

import { createInterface } from 'node:readline';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// ─── Readline helpers ────────────────────────────────────────────

const rl = () =>
  createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise((resolve) => {
    const r = rl();
    r.question(question, (answer) => {
      r.close();
      resolve(answer.trim());
    });
  });
}

function printOptions(options) {
  options.forEach((opt, i) => {
    const marker = opt.detected ? ' (detected)' : '';
    console.log(`  ${i + 1}) ${opt.label}${marker}`);
  });
}

async function selectOne(question, options) {
  console.log(`\n${question}`);
  printOptions(options);
  const answer = await ask(`\nSelect (1-${options.length}): `);
  const idx = parseInt(answer, 10) - 1;
  if (idx >= 0 && idx < options.length) return options[idx].value;
  console.log('Invalid selection, defaulting to first option.');
  return options[0].value;
}

async function selectMultiple(question, options) {
  console.log(`\n${question}`);
  printOptions(options);
  console.log(`  0) All`);
  const answer = await ask(
    `\nSelect (comma-separated, e.g. 1,3,5 or 0 for all): `
  );

  if (answer === '0' || answer.toLowerCase() === 'all') {
    return options.map((o) => o.value);
  }

  const indices = answer
    .split(',')
    .map((s) => parseInt(s.trim(), 10) - 1)
    .filter((i) => i >= 0 && i < options.length);

  if (indices.length === 0) {
    console.log('No valid selection, selecting all.');
    return options.map((o) => o.value);
  }

  return indices.map((i) => options[i].value);
}

async function confirm(question) {
  const answer = await ask(`\n${question} (Y/n): `);
  return answer.toLowerCase() !== 'n';
}

// ─── Constants ───────────────────────────────────────────────────

export const AI_TOOLS = [
  { label: 'Claude Code (CLAUDE.md)', value: 'claude' },
  { label: 'Cursor (.cursor/rules/)', value: 'cursor' },
  { label: 'Windsurf (.windsurf/rules/)', value: 'windsurf' },
  { label: 'GitHub Copilot (.github/copilot-instructions.md)', value: 'copilot' },
  { label: 'AGENTS.md (vendor-neutral)', value: 'agents' },
];

export const FRAMEWORKS = [
  { label: 'React / Next.js', value: 'react' },
  { label: 'Vue / Nuxt', value: 'vue' },
  { label: 'Node.js / Express', value: 'node' },
  { label: 'Vanilla JavaScript / TypeScript', value: 'vanilla' },
];

export const SECURITY_CATEGORIES = [
  { label: 'A01: Broken Access Control', value: 'access-control' },
  { label: 'A02: Security Misconfiguration', value: 'security-config' },
  { label: 'A03: Supply Chain Failures', value: 'supply-chain' },
  { label: 'A04: Cryptographic Failures', value: 'cryptographic' },
  { label: 'A05: Injection', value: 'injection' },
  { label: 'A06: Insecure Design', value: 'secure-design' },
  { label: 'A07: Authentication Failures', value: 'authentication' },
  { label: 'A08: Data Integrity Failures', value: 'data-integrity' },
  { label: 'A09: Logging & Alerting Failures', value: 'logging-alerting' },
  { label: 'A10: Error Handling', value: 'error-handling' },
  { label: 'Frontend: XSS Prevention', value: 'xss-prevention' },
  { label: 'Frontend: CSRF Protection', value: 'csrf-protection' },
  { label: 'Frontend: CSP', value: 'csp' },
  { label: 'Frontend: Secure State Management', value: 'secure-state' },
];

// ─── Project state detection ─────────────────────────────────────

/**
 * Detect the current project environment:
 * - Which AI tool configs already exist
 * - What framework is being used (via package.json)
 * - Whether this is a new or existing project
 */
export function detectProjectState(cwd) {
  const state = {
    hasPackageJson: existsSync(join(cwd, 'package.json')),
    detectedTools: [],
    detectedFramework: null,
    existingRules: {},
  };

  // Detect existing AI tool configs
  const toolPaths = {
    claude: 'CLAUDE.md',
    cursor: '.cursor/rules',
    windsurf: '.windsurf/rules',
    copilot: '.github/copilot-instructions.md',
    agents: 'AGENTS.md',
  };

  for (const [tool, path] of Object.entries(toolPaths)) {
    const fullPath = join(cwd, path);
    if (existsSync(fullPath)) {
      state.detectedTools.push(tool);
      state.existingRules[tool] = fullPath;
    }
  }

  // Detect framework from package.json dependencies
  if (state.hasPackageJson) {
    try {
      const pkg = JSON.parse(
        readFileSync(join(cwd, 'package.json'), 'utf-8')
      );
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };
      if (allDeps.next || allDeps.react) state.detectedFramework = 'react';
      else if (allDeps.nuxt || allDeps.vue) state.detectedFramework = 'vue';
      else if (allDeps.express || allDeps.fastify || allDeps.koa)
        state.detectedFramework = 'node';
      else state.detectedFramework = 'vanilla';
    } catch {
      // Ignore parse errors
    }
  }

  return state;
}

/**
 * Print a summary of the detected project state
 */
export function printProjectStatus(state) {
  console.log('\n📋 Project Status:');

  if (state.detectedTools.length > 0) {
    const toolNames = state.detectedTools
      .map((t) => AI_TOOLS.find((a) => a.value === t)?.label || t)
      .join(', ');
    console.log(`  AI tools detected: ${toolNames}`);
  } else {
    console.log('  No AI tool configs found (new setup)');
  }

  if (state.detectedFramework) {
    const fwName =
      FRAMEWORKS.find((f) => f.value === state.detectedFramework)?.label ||
      state.detectedFramework;
    console.log(`  Framework detected: ${fwName}`);
  }

  if (!state.hasPackageJson) {
    console.log('  No package.json found (works fine - rules will be created in current directory)');
  }
}

// ─── Main prompt flow ────────────────────────────────────────────

function isInteractive() {
  return process.stdin.isTTY === true;
}

export async function promptUser(args) {
  const cwd = process.cwd();
  const state = detectProjectState(cwd);

  // --check flag: just show status and exit (must be before auto-mode check)
  if (args.includes('--check')) {
    printProjectStatus(state);
    return null; // Signal to index.js to exit early
  }

  // Non-interactive mode: --yes flag or non-TTY environment
  if (args.includes('--yes') || args.includes('-y') || !isInteractive()) {
    if (!isInteractive() && !args.includes('--yes') && !args.includes('-y')) {
      console.log('Non-interactive environment detected, using defaults.');
    }

    // Smart defaults based on detection
    const tool =
      state.detectedTools.length === 1
        ? state.detectedTools[0]
        : state.detectedTools.includes('claude')
          ? 'claude'
          : 'claude';

    return {
      tool,
      framework: state.detectedFramework || 'vanilla',
      categories: SECURITY_CATEGORIES.map((c) => c.value),
      includeFrontend: (state.detectedFramework || 'vanilla') !== 'node',
    };
  }

  // Interactive mode
  console.log('\n🔒 Secure Coding Rules - OWASP 2025 Security Rules Generator\n');
  console.log('─'.repeat(55));
  printProjectStatus(state);

  // AI tool selection - highlight detected ones
  const toolOptions = AI_TOOLS.map((t) => ({
    ...t,
    detected: state.detectedTools.includes(t.value),
  }));

  // If only one tool detected, suggest it first
  if (state.detectedTools.length === 1) {
    const detected = state.detectedTools[0];
    const idx = toolOptions.findIndex((t) => t.value === detected);
    if (idx > 0) {
      const [item] = toolOptions.splice(idx, 1);
      toolOptions.unshift(item);
    }
  }

  const tool = await selectOne('Which AI coding tool do you use?', toolOptions);

  // Framework selection - auto-suggest detected
  const frameworkOptions = FRAMEWORKS.map((f) => ({
    ...f,
    detected: f.value === state.detectedFramework,
  }));
  if (state.detectedFramework) {
    const idx = frameworkOptions.findIndex(
      (f) => f.value === state.detectedFramework
    );
    if (idx > 0) {
      const [item] = frameworkOptions.splice(idx, 1);
      frameworkOptions.unshift(item);
    }
  }

  const framework = await selectOne(
    'What is your primary framework?',
    frameworkOptions
  );

  // Update or fresh install message
  if (state.existingRules[tool]) {
    console.log(`\n  ℹ Existing rules found - will update security section only.`);
  }

  const allCategories = await confirm(
    'Include all OWASP 2025 security categories?'
  );

  let categories;
  if (allCategories) {
    categories = SECURITY_CATEGORIES.map((c) => c.value);
  } else {
    categories = await selectMultiple(
      'Select security categories:',
      SECURITY_CATEGORIES
    );
  }

  const includeFrontend =
    framework !== 'node'
      ? await confirm('Include frontend-specific security rules?')
      : false;

  if (includeFrontend) {
    const frontendCats = [
      'xss-prevention',
      'csrf-protection',
      'csp',
      'secure-state',
    ];
    frontendCats.forEach((c) => {
      if (!categories.includes(c)) categories.push(c);
    });
  }

  return { tool, framework, categories, includeFrontend };
}
