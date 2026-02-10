/**
 * secure-rules - OWASP 2025 Security Rules Generator for AI Coding Assistants
 *
 * Generates security coding rules in the format of your preferred AI tool:
 * - CLAUDE.md (Claude Code)
 * - .cursor/rules/*.mdc (Cursor)
 * - .windsurf/rules/*.md (Windsurf)
 * - .github/copilot-instructions.md (GitHub Copilot)
 * - AGENTS.md (vendor-neutral)
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promptUser } from './prompts.js';
import { loadTemplates } from './loader.js';

// Adapter imports
import * as claudeAdapter from './adapters/claude.js';
import * as cursorAdapter from './adapters/cursor.js';
import * as windsurfAdapter from './adapters/windsurf.js';
import * as copilotAdapter from './adapters/copilot.js';
import * as agentsAdapter from './adapters/agents.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getVersion() {
  try {
    const pkg = JSON.parse(
      readFileSync(join(__dirname, '..', 'package.json'), 'utf-8')
    );
    return pkg.version;
  } catch {
    return '2.0.0';
  }
}

const adapters = {
  claude: claudeAdapter,
  cursor: cursorAdapter,
  windsurf: windsurfAdapter,
  copilot: copilotAdapter,
  agents: agentsAdapter,
};

export async function run() {
  const args = process.argv.slice(2);
  const version = getVersion();

  // Help flag
  if (args.includes('--help') || args.includes('-h')) {
    printHelp(version);
    return;
  }

  // Version flag
  if (args.includes('--version') || args.includes('-v')) {
    console.log(`secure-coding-rules v${version}`);
    return;
  }

  const config = await promptUser(args);

  // --check returns null to signal early exit
  if (config === null) return;

  const adapter = adapters[config.tool];

  console.log(`\nLoading security templates...`);
  const templates = await loadTemplates(config.categories);

  if (templates.size === 0) {
    console.error('No templates found. Please check your installation.');
    process.exit(1);
  }

  console.log(`Loaded ${templates.size} security rule modules.`);

  const cwd = process.cwd();
  const options = { framework: config.framework, version };

  if (config.tool === 'cursor') {
    await generateMultipleFiles(cursorAdapter, templates, options, cwd);
  } else if (config.tool === 'windsurf') {
    await generateMultipleFiles(windsurfAdapter, templates, options, cwd);
  } else {
    await generateSingleFile(adapter, templates, options, cwd);
  }

  console.log('\n✅ Security rules generated successfully!');
  console.log('📖 Based on OWASP Top 10 2025 (https://owasp.org/Top10/2025/)');
  console.log('\nRun again anytime to update: npx secure-coding-rules\n');
}

async function generateSingleFile(adapter, templates, options, cwd) {
  const outputPath = join(cwd, adapter.outputPath);
  const dir = dirname(outputPath);

  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  const newContent = adapter.format(templates, options);

  if (existsSync(outputPath) && adapter.merge) {
    const existing = await readFile(outputPath, 'utf-8');
    const merged = adapter.merge(existing, newContent);
    await writeFile(outputPath, merged, 'utf-8');
    console.log(`\n📝 Updated: ${adapter.outputPath} (merged with existing content)`);
  } else {
    await writeFile(outputPath, newContent, 'utf-8');
    console.log(`\n📝 Created: ${adapter.outputPath}`);
  }
}

async function generateMultipleFiles(adapter, templates, options, cwd) {
  const outputDir = join(cwd, adapter.outputDir);

  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  const files = adapter.formatMultiple(templates, options);
  let count = 0;

  for (const [filename, content] of files) {
    const filePath = join(outputDir, filename);
    await writeFile(filePath, content, 'utf-8');
    count++;
  }

  console.log(`\n📝 Generated ${count} files in ${adapter.outputDir}/`);
}

function printHelp(version) {
  console.log(`
secure-coding-rules v${version}

OWASP 2025 기반 JavaScript 보안 코딩 룰을 AI 코딩 어시스턴트에 자동 적용

Usage:
  npx secure-coding-rules              Interactive mode (auto-detects project)
  npx secure-coding-rules --yes        Apply all rules with smart defaults
  npx secure-coding-rules --check      Show current project security status

Options:
  -y, --yes      Non-interactive mode (auto-detects tool & framework)
  --check        Show which AI tools and frameworks are detected
  -h, --help     Show this help
  -v, --version  Show version

Supported AI Tools:
  - Claude Code    → CLAUDE.md
  - Cursor         → .cursor/rules/*.mdc
  - Windsurf       → .windsurf/rules/*.md
  - GitHub Copilot → .github/copilot-instructions.md
  - AGENTS.md      → AGENTS.md (vendor-neutral)

Security Categories (OWASP Top 10 2025):
  A01: Broken Access Control
  A02: Security Misconfiguration
  A03: Supply Chain Failures (NEW in 2025)
  A04: Cryptographic Failures
  A05: Injection
  A06: Insecure Design
  A07: Authentication Failures
  A08: Data Integrity Failures
  A09: Logging & Alerting Failures
  A10: Error Handling (NEW in 2025)

  + Frontend: XSS, CSRF, CSP, Secure State Management

Homepage: https://github.com/kwakseongjae/js-secure-coding-prompt-templates
`);
}
