/**
 * AGENTS.md adapter - vendor-neutral format
 * Compatible with Sourcegraph Amp and other tools that support AGENTS.md
 */

import { getCategoryInfo } from '../loader.js';

export const name = 'AGENTS.md (Vendor-neutral)';
export const outputPath = 'AGENTS.md';
export const description = 'Generates AGENTS.md (vendor-neutral AI assistant rules)';

const SECTION_START = '<!-- js-secure-coding:start -->';
const SECTION_END = '<!-- js-secure-coding:end -->';

export function format(templates, options = {}) {
  const { framework = 'vanilla', version = '2.0.0' } = options;
  const lines = [];

  lines.push(SECTION_START);
  lines.push(`<!-- version: ${version} -->`);
  lines.push('');
  lines.push('# Security Guidelines');
  lines.push('');
  lines.push('Based on OWASP Top 10 2025. Follow these rules when writing or modifying JavaScript/TypeScript code.');
  lines.push(`Framework context: ${framework}`);
  lines.push('');

  for (const [category, content] of templates) {
    const info = getCategoryInfo(category);
    lines.push(`## ${info.owasp}: ${info.title}`);
    lines.push('');
    lines.push(content.replace(/^# .+\n+(?:>.*\n+)*/, ''));
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
