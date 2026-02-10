/**
 * Interactive CLI prompts using Node.js built-in readline
 * Zero dependencies - works with Node.js 18+
 */

import { createInterface } from 'node:readline';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { t } from './i18n.js';

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
    const marker = opt.detected ? ` (${t('detected')})` : '';
    console.log(`  ${i + 1}) ${opt.label}${marker}`);
  });
}

async function selectOne(question, options) {
  console.log(`\n${question}`);
  printOptions(options);
  const answer = await ask(`\n${t('selectPrompt')} (1-${options.length}): `);
  const idx = parseInt(answer, 10) - 1;
  if (idx >= 0 && idx < options.length) return options[idx].value;
  console.log(t('invalidSelection'));
  return options[0].value;
}

async function selectMultiple(question, options) {
  console.log(`\n${question}`);
  printOptions(options);
  console.log(`  0) ${t('selectAll')}`);
  const answer = await ask(`\n${t('selectPrompt')} (${t('selectAllComma')}): `);

  if (answer === '0' || answer.toLowerCase() === 'all') {
    return options.map((o) => o.value);
  }

  const indices = answer
    .split(',')
    .map((s) => parseInt(s.trim(), 10) - 1)
    .filter((i) => i >= 0 && i < options.length);

  if (indices.length === 0) {
    console.log(t('noValidSelection'));
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
  { label: 'TypeScript Security', value: 'typescript-security' },
  { label: 'Framework: React / Next.js', value: 'react-security' },
  { label: 'Framework: Express / Node.js', value: 'express-security' },
  { label: 'Framework: Next.js (App Router)', value: 'nextjs-security' },
];

// ─── Project state detection ─────────────────────────────────────

export function detectProjectState(cwd) {
  const state = {
    hasPackageJson: existsSync(join(cwd, 'package.json')),
    detectedTools: [],
    detectedFramework: null,
    existingRules: {},
  };

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

export function printProjectStatus(state) {
  console.log(`\n📋 ${t('projectStatus')}`);

  if (state.detectedTools.length > 0) {
    const toolNames = state.detectedTools
      .map((tool) => AI_TOOLS.find((a) => a.value === tool)?.label || tool)
      .join(', ');
    console.log(`  ${t('toolsDetected')} ${toolNames}`);
  } else {
    console.log(`  ${t('noToolsFound')}`);
  }

  if (state.detectedFramework) {
    const fwName =
      FRAMEWORKS.find((f) => f.value === state.detectedFramework)?.label ||
      state.detectedFramework;
    console.log(`  ${t('frameworkDetected')} ${fwName}`);
  }

  if (!state.hasPackageJson) {
    console.log(`  ${t('noPackageJson')}`);
  }
}

// ─── Main prompt flow ────────────────────────────────────────────

function isInteractive() {
  return process.stdin.isTTY === true;
}

export async function promptUser(args) {
  const cwd = process.cwd();
  const state = detectProjectState(cwd);

  // --check flag
  if (args.includes('--check')) {
    printProjectStatus(state);
    return null;
  }

  // Non-interactive mode
  if (args.includes('--yes') || args.includes('-y') || !isInteractive()) {
    if (!isInteractive() && !args.includes('--yes') && !args.includes('-y')) {
      console.log(t('nonInteractive'));
    }

    const tools =
      state.detectedTools.length > 0
        ? state.detectedTools
        : ['claude'];

    return {
      tools,
      outputMode: 'inline',
      framework: state.detectedFramework || 'vanilla',
      categories: SECURITY_CATEGORIES.map((c) => c.value),
      includeFrontend: (state.detectedFramework || 'vanilla') !== 'node',
    };
  }

  // Interactive mode
  console.log(`\n🔒 ${t('title')}\n`);
  console.log('─'.repeat(55));
  printProjectStatus(state);

  // AI tool selection (multiple)
  const toolOptions = AI_TOOLS.map((tool) => ({
    ...tool,
    detected: state.detectedTools.includes(tool.value),
  }));

  const tools = await selectMultiple(t('selectTools'), toolOptions);

  // Output mode selection
  // Only relevant for tools that support both modes (claude, copilot, agents)
  const supportsDirectory = tools.some((t) =>
    ['claude', 'copilot'].includes(t)
  );

  let outputMode = 'inline';
  if (supportsDirectory) {
    const modeOptions = [
      { label: `${t('outputInline')}`, value: 'inline' },
      { label: `${t('outputDirectory')}`, value: 'directory' },
    ];
    outputMode = await selectOne(t('selectOutputMode'), modeOptions);
  }

  // Framework selection
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

  const framework = await selectOne(t('selectFramework'), frameworkOptions);

  const allCategories = await confirm(t('includeAll'));

  let categories;
  if (allCategories) {
    categories = SECURITY_CATEGORIES.map((c) => c.value);
  } else {
    categories = await selectMultiple(t('selectCategories'), SECURITY_CATEGORIES);
  }

  const includeFrontend =
    framework !== 'node'
      ? await confirm(t('includeFrontend'))
      : false;

  if (includeFrontend) {
    const frontendCats = ['xss-prevention', 'csrf-protection', 'csp', 'secure-state'];
    frontendCats.forEach((c) => {
      if (!categories.includes(c)) categories.push(c);
    });
  }

  // Auto-include framework-specific and TypeScript rules
  autoIncludeExtras(categories, framework);

  return { tools, outputMode, framework, categories, includeFrontend };
}

/**
 * Auto-include TypeScript and framework-specific rules based on selection
 */
function autoIncludeExtras(categories, framework) {
  // Always include TypeScript rules (most JS projects use TS now)
  if (!categories.includes('typescript-security')) {
    categories.push('typescript-security');
  }

  const frameworkMap = {
    react: ['react-security', 'nextjs-security'],
    vue: [],
    node: ['express-security'],
    vanilla: [],
  };

  const extras = frameworkMap[framework] || [];
  extras.forEach((c) => {
    if (!categories.includes(c)) categories.push(c);
  });
}
