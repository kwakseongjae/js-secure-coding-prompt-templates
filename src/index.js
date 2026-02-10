/**
 * secure-coding-rules - OWASP 2025 Security Rules Generator for AI Coding Assistants
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initLang, t } from './i18n.js';
import { promptUser } from './prompts.js';
import { loadTemplates } from './loader.js';

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

  // Init i18n before anything else
  initLang(args);

  if (args.includes('--help') || args.includes('-h')) {
    printHelp(version);
    return;
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log(`secure-coding-rules v${version}`);
    return;
  }

  const dryRun = args.includes('--dry-run');
  const config = await promptUser(args);

  if (config === null) return;

  const adapter = adapters[config.tool];

  console.log(`\n${t('loading')}`);
  const templates = await loadTemplates(config.categories);

  if (templates.size === 0) {
    console.error(t('noTemplates'));
    process.exit(1);
  }

  console.log(t('loaded', templates.size));

  const cwd = process.cwd();
  const options = { framework: config.framework, version };

  if (dryRun) {
    dryRunPreview(adapter, config, templates, options, cwd);
    return;
  }

  if (config.tool === 'cursor') {
    await generateMultipleFiles(cursorAdapter, templates, options, cwd);
  } else if (config.tool === 'windsurf') {
    await generateMultipleFiles(windsurfAdapter, templates, options, cwd);
  } else {
    await generateSingleFile(adapter, templates, options, cwd);
  }

  console.log(`\n✅ ${t('success')}`);
  console.log(`📖 ${t('reference')}`);
  console.log(`\n${t('runAgain')}\n`);
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
    console.log(`\n📝 ${t('updated', adapter.outputPath)}`);
  } else {
    await writeFile(outputPath, newContent, 'utf-8');
    console.log(`\n📝 ${t('created', adapter.outputPath)}`);
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

  console.log(`\n📝 ${t('generated', count, adapter.outputDir)}`);
}

function dryRunPreview(adapter, config, templates, options, cwd) {
  console.log(`\n── ${t('dryRunTitle')} ──────────────────────────────────`);
  console.log(`${t('dryRunTool')}       ${adapter.name}`);
  console.log(`${t('dryRunFramework')}  ${config.framework}`);
  console.log(`${t('dryRunCategories')} ${config.categories.length}`);

  if (config.tool === 'cursor' || config.tool === 'windsurf') {
    const multiAdapter = config.tool === 'cursor' ? cursorAdapter : windsurfAdapter;
    const files = multiAdapter.formatMultiple(templates, options);
    console.log(`\n${t('dryRunWouldGenerate', files.size, multiAdapter.outputDir)}`);
    for (const [filename] of files) {
      console.log(`  - ${filename}`);
    }
  } else {
    const outputPath = join(cwd, adapter.outputPath);
    const content = adapter.format(templates, options);
    const exists = existsSync(outputPath);
    console.log(
      `\n${exists ? t('dryRunWouldUpdate', adapter.outputPath) : t('dryRunWouldCreate', adapter.outputPath)}`
    );
    console.log(t('dryRunSize', (content.length / 1024).toFixed(1)));
  }

  console.log(`\n── ${t('dryRunApply')} ───────────────────\n`);
}

function printHelp(version) {
  console.log(`
secure-coding-rules v${version}

${t('helpDesc')}

Usage:
  npx secure-coding-rules              Interactive mode
  npx secure-coding-rules --yes        Smart defaults
  npx secure-coding-rules --check      Project status
  npx secure-coding-rules --dry-run    Preview
  npx secure-coding-rules --lang ko    한국어로 실행

Options:
  -y, --yes      Non-interactive mode
  --check        Show detected AI tools and frameworks
  --dry-run      Preview without writing files
  --lang <code>  Language: en (default), ko
  -h, --help     Show this help
  -v, --version  Show version

Supported AI Tools:
  - Claude Code    → CLAUDE.md
  - Cursor         → .cursor/rules/*.mdc
  - Windsurf       → .windsurf/rules/*.md
  - GitHub Copilot → .github/copilot-instructions.md
  - AGENTS.md      → AGENTS.md (vendor-neutral)

OWASP Top 10 2025: A01-A10 + Frontend (XSS, CSRF, CSP, State)

Homepage: https://github.com/kwakseongjae/js-secure-coding-prompt-templates
`);
}
