/**
 * Cursor adapter - generates .cursor/rules/*.mdc format
 */

import { getCategoryInfo } from '../loader.js';

export const name = 'Cursor';
export const outputDir = '.cursor/rules';
export const description = 'Generates .cursor/rules/*.mdc files';

/**
 * Format templates into individual .mdc files
 * Returns Map<filename, content>
 */
export function formatMultiple(templates, options = {}) {
  const files = new Map();

  for (const [category, content] of templates) {
    const info = getCategoryInfo(category);
    const filename = `security-${category}.mdc`;
    const mdc = formatMdc(category, content, info, options);
    files.set(filename, mdc);
  }

  return files;
}

/**
 * Format a single template into .mdc format
 * MDC files have frontmatter with description and globs
 */
function formatMdc(category, content, info, options = {}) {
  const { framework = 'vanilla' } = options;

  const globs = getGlobsForCategory(category, framework);
  const lines = [];

  lines.push('---');
  lines.push(`description: "${info.owasp} ${info.title} - OWASP 2025 Security Rules"`);
  if (globs) {
    lines.push(`globs: "${globs}"`);
  }
  lines.push('---');
  lines.push('');
  lines.push(content);

  return lines.join('\n');
}

function getGlobsForCategory(category, framework) {
  const isReact = ['react', 'next', 'nextjs'].includes(framework);
  const codeExts = isReact ? '{jsx,tsx,js,ts}' : '{js,ts,jsx,tsx}';

  const globMap = {
    'authentication': `**/{auth,login,signup,session}*.${codeExts}`,
    'access-control': `**/{middleware,guard,policy,permission,role}*.${codeExts}`,
    'injection': `**/{api,route,handler,query,db}*.${codeExts}`,
    'cryptographic': `**/{crypto,hash,encrypt,token,secret}*.${codeExts}`,
    'xss-prevention': isReact ? '**/*.{jsx,tsx}' : '**/*.{jsx,tsx,vue,svelte}',
    'csrf-protection': `**/{form,api,fetch,request}*.${codeExts}`,
    'csp': '**/{middleware,header,config,server}*.{js,ts}',
    'secure-state': `**/{store,context,state,reducer}*.${codeExts}`,
    'supply-chain': '**/package.json',
    'logging-alerting': '**/{log,logger,monitor,alert}*.{js,ts}',
    'error-handling': `**/{error,handler,middleware,catch}*.${codeExts}`,
  };
  return globMap[category] || null;
}
