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
    return '2.1.0';
  }
}

const adapters = {
  claude: claudeAdapter,
  cursor: cursorAdapter,
  windsurf: windsurfAdapter,
  copilot: copilotAdapter,
  agents: agentsAdapter,
};

// Tools that natively use directory-based output
const DIRECTORY_NATIVE_TOOLS = ['cursor', 'windsurf'];

// Tools that support optional directory mode
const DIRECTORY_OPTIONAL_TOOLS = ['claude', 'copilot'];

export async function run() {
  const args = process.argv.slice(2);
  const version = getVersion();

  initLang(args);

  if (args.includes('--help') || args.includes('-h')) {
    printHelp(version);
    return;
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log(`secure-coding-rules v${version}`);
    return;
  }

  // --remove flag
  if (args.includes('--remove')) {
    await removeRules();
    return;
  }

  const dryRun = args.includes('--dry-run');
  const config = await promptUser(args);

  if (config === null) return;

  console.log(`\n${t('loading')}`);
  const templates = await loadTemplates(config.categories);

  if (templates.size === 0) {
    console.error(t('noTemplates'));
    process.exit(1);
  }

  console.log(t('loaded', templates.size));

  const cwd = process.cwd();
  const options = { framework: config.framework, version };

  // Process each selected tool
  for (const toolName of config.tools) {
    const adapter = adapters[toolName];
    if (!adapter) continue;

    if (config.tools.length > 1) {
      console.log(`\n${t('generatingFor', adapter.name)}`);
    }

    if (dryRun) {
      dryRunPreview(adapter, toolName, config, templates, options, cwd);
      continue;
    }

    const useDirectory = shouldUseDirectory(toolName, config.outputMode);

    if (useDirectory) {
      await generateDirectoryMode(adapter, toolName, templates, options, config, cwd);
    } else if (DIRECTORY_NATIVE_TOOLS.includes(toolName)) {
      await generateMultipleFiles(adapter, templates, options, cwd);
    } else {
      await generateSingleFile(adapter, templates, options, cwd);
    }
  }

  if (!dryRun) {
    console.log(`\n✅ ${t('success')}`);
    console.log(`📖 ${t('reference')}`);
    console.log(`\n${t('runAgain')}\n`);
  }
}

function shouldUseDirectory(toolName, outputMode) {
  if (DIRECTORY_NATIVE_TOOLS.includes(toolName)) return false; // cursor/windsurf already directory-based
  if (DIRECTORY_OPTIONAL_TOOLS.includes(toolName) && outputMode === 'directory') return true;
  return false;
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
    console.log(`📝 ${t('updated', adapter.outputPath)}`);
  } else {
    await writeFile(outputPath, newContent, 'utf-8');
    console.log(`📝 ${t('created', adapter.outputPath)}`);
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

  console.log(`📝 ${t('generated', count, adapter.outputDir)}`);
}

async function generateDirectoryMode(adapter, toolName, templates, options, config, cwd) {
  // 1. Generate individual rule files in the rules directory
  const rulesDir = join(cwd, adapter.rulesDir);

  if (!existsSync(rulesDir)) {
    await mkdir(rulesDir, { recursive: true });
  }

  const files = adapter.formatMultiple(templates, options);
  let count = 0;

  for (const [filename, content] of files) {
    const filePath = join(rulesDir, filename);
    await writeFile(filePath, content, 'utf-8');
    count++;
  }

  console.log(`📝 ${t('generated', count, adapter.rulesDir)}`);

  // 2. Add/update reference in main file
  const mainPath = join(cwd, adapter.outputPath);
  const mainDir = dirname(mainPath);

  if (!existsSync(mainDir)) {
    await mkdir(mainDir, { recursive: true });
  }

  const refContent = adapter.formatReference(config.categories, options);

  if (existsSync(mainPath) && adapter.merge) {
    const existing = await readFile(mainPath, 'utf-8');
    const merged = adapter.merge(existing, refContent);
    await writeFile(mainPath, merged, 'utf-8');
    console.log(`📝 ${t('refUpdated', adapter.outputPath)}`);
  } else {
    await writeFile(mainPath, refContent, 'utf-8');
    console.log(`📝 ${t('refCreated', adapter.outputPath)}`);
  }
}

function dryRunPreview(adapter, toolName, config, templates, options, cwd) {
  console.log(`\n── ${t('dryRunTitle')} (${adapter.name}) ──────────────────`);
  console.log(`${t('dryRunFramework')}  ${config.framework}`);
  console.log(`${t('dryRunCategories')} ${config.categories.length}`);

  const useDirectory = shouldUseDirectory(toolName, config.outputMode);

  if (useDirectory) {
    const files = adapter.formatMultiple(templates, options);
    console.log(`\n${t('dryRunWouldGenerate', files.size, adapter.rulesDir)}`);
    for (const [filename] of files) {
      console.log(`  - ${filename}`);
    }
    console.log(`\n${t('dryRunWouldUpdate', adapter.outputPath)} (reference only)`);
  } else if (DIRECTORY_NATIVE_TOOLS.includes(toolName)) {
    const files = adapter.formatMultiple(templates, options);
    console.log(`\n${t('dryRunWouldGenerate', files.size, adapter.outputDir)}`);
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

  console.log(`── ${t('dryRunApply')} ───────────────────\n`);
}

async function removeRules() {
  const cwd = process.cwd();
  const SECTION_START = '<!-- js-secure-coding:start -->';
  const SECTION_END = '<!-- js-secure-coding:end -->';
  let removed = 0;

  // 1. Clean markers from single-file tools
  const singleFiles = ['CLAUDE.md', '.github/copilot-instructions.md', 'AGENTS.md'];
  for (const file of singleFiles) {
    const filePath = join(cwd, file);
    if (!existsSync(filePath)) continue;
    const content = await readFile(filePath, 'utf-8');
    if (!content.includes(SECTION_START)) continue;

    const before = content.substring(0, content.indexOf(SECTION_START));
    const after = content.substring(
      content.indexOf(SECTION_END) + SECTION_END.length
    );
    const cleaned = (before.trimEnd() + '\n' + after.trimStart()).trim();

    if (cleaned) {
      await writeFile(filePath, cleaned + '\n', 'utf-8');
      console.log(`🗑️  ${t('removedMarkers', file)}`);
    } else {
      const { unlink } = await import('node:fs/promises');
      await unlink(filePath);
      console.log(`🗑️  ${t('removedFile', file)}`);
    }
    removed++;
  }

  // 2. Remove security-* files from rule directories
  const ruleDirs = [
    { dir: '.cursor/rules', ext: '.mdc' },
    { dir: '.windsurf/rules', ext: '.md' },
    { dir: '.claude/rules', ext: '.md' },
    { dir: '.github/instructions', ext: '.md' },
  ];

  for (const { dir, ext } of ruleDirs) {
    const dirPath = join(cwd, dir);
    if (!existsSync(dirPath)) continue;

    const { readdir, unlink } = await import('node:fs/promises');
    const files = await readdir(dirPath);
    const securityFiles = files.filter(
      (f) => f.startsWith('security-') && f.endsWith(ext)
    );

    for (const file of securityFiles) {
      await unlink(join(dirPath, file));
      removed++;
    }

    if (securityFiles.length > 0) {
      console.log(`🗑️  ${t('removedDir', securityFiles.length, dir)}`);
    }
  }

  if (removed === 0) {
    console.log(`\n${t('noRulesFound')}`);
  } else {
    console.log(`\n✅ ${t('removeSuccess')}`);
  }
}

function printHelp(version) {
  console.log(`
secure-coding-rules v${version}

${t('helpDesc')}

Usage:
  npx secure-coding-rules              Interactive mode (multi-tool select)
  npx secure-coding-rules --yes        Smart defaults
  npx secure-coding-rules --check      Project status
  npx secure-coding-rules --dry-run    Preview
  npx secure-coding-rules --remove     Remove all generated rules
  npx secure-coding-rules --lang ko    한국어로 실행

Options:
  -y, --yes      Non-interactive mode
  --check        Show detected AI tools and frameworks
  --dry-run      Preview without writing files
  --remove       Remove all security rules (clean uninstall)
  --lang <code>  Language: en (default), ko
  -h, --help     Show this help
  -v, --version  Show version

Output Modes:
  inline         Embed all rules in main file (e.g. CLAUDE.md)
  directory      Separate rule files + reference in main file
                 (e.g. .claude/rules/security-*.md + CLAUDE.md reference)

Supported AI Tools (select multiple):
  - Claude Code    → CLAUDE.md or .claude/rules/
  - Cursor         → .cursor/rules/*.mdc
  - Windsurf       → .windsurf/rules/*.md
  - GitHub Copilot → .github/copilot-instructions.md or .github/instructions/
  - AGENTS.md      → AGENTS.md

OWASP Top 10 2025: A01-A10 + Frontend (XSS, CSRF, CSP, State)

Homepage: https://github.com/kwakseongjae/secure-coding-rules
`);
}
