/**
 * GitHub Copilot adapter - generates .github/copilot-instructions.md
 */

import { getCategoryInfo } from '../loader.js';

export const name = 'GitHub Copilot';
export const outputPath = '.github/copilot-instructions.md';
export const description = 'Generates .github/copilot-instructions.md';

const SECTION_START = '<!-- js-secure-coding:start -->';
const SECTION_END = '<!-- js-secure-coding:end -->';

export function format(templates, options = {}) {
  const { framework = 'vanilla' } = options;
  const lines = [];

  lines.push(SECTION_START);
  lines.push('<!-- version: 2.0.0 -->');
  lines.push('');
  lines.push('## Security Coding Guidelines (OWASP 2025)');
  lines.push('');
  lines.push(
    'When writing or reviewing JavaScript/TypeScript code, follow these security rules:'
  );
  lines.push('');

  for (const [category, content] of templates) {
    const info = getCategoryInfo(category);
    // Copilot instructions should be concise - extract rules only
    lines.push(`### ${info.owasp}: ${info.title}`);
    lines.push('');
    lines.push(extractRulesOnly(content));
    lines.push('');
  }

  lines.push(SECTION_END);

  return lines.join('\n');
}

export function merge(existingContent, newSection) {
  if (existingContent.includes(SECTION_START)) {
    const before = existingContent.substring(
      0,
      existingContent.indexOf(SECTION_START)
    );
    const after = existingContent.substring(
      existingContent.indexOf(SECTION_END) + SECTION_END.length
    );
    return before.trimEnd() + '\n\n' + newSection + '\n' + after.trimStart();
  }
  const trimmed = existingContent.trimEnd();
  return (trimmed ? trimmed + '\n\n' : '') + newSection + '\n';
}

function extractRulesOnly(content) {
  const lines = content.split('\n');
  const result = [];
  let inRules = false;

  for (const line of lines) {
    if (line.startsWith('## Rules')) {
      inRules = true;
      continue;
    }
    if (line.startsWith('## ') && inRules) {
      inRules = false;
      continue;
    }
    if (inRules) {
      // Convert ### to bullet points for Copilot's flatter format
      if (line.startsWith('### ')) {
        result.push(`- **${line.replace('### ', '').replace(/^\d+\.\s*/, '')}**`);
      } else if (line.startsWith('- **DO') || line.startsWith('- **DON\'T') || line.startsWith('- **WHY')) {
        result.push(`  ${line}`);
      }
    }
  }

  return result.join('\n').trim();
}
