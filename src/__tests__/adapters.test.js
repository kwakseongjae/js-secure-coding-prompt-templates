import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as claude from '../adapters/claude.js';
import * as copilot from '../adapters/copilot.js';
import * as agents from '../adapters/agents.js';
import * as cursor from '../adapters/cursor.js';
import * as windsurf from '../adapters/windsurf.js';

const MOCK_TEMPLATE = `# Test Security Rules

> OWASP Top 10 2025 - A01: Test

## Rules

### 1. Test Rule One
- **DO**: Do the right thing.
- **DON'T**: Do the wrong thing.
- **WHY**: Because security matters.

### 2. Test Rule Two
- **DO**: Validate input.
- **DON'T**: Trust user data.
- **WHY**: Injection attacks are common.

## Code Examples

### Bad Practice
\`\`\`javascript
eval(userInput);
\`\`\`

### Good Practice
\`\`\`javascript
sanitize(userInput);
\`\`\`

## Quick Checklist
- [ ] Input validated
- [ ] Output encoded
`;

function mockTemplates() {
  return new Map([['access-control', MOCK_TEMPLATE]]);
}

describe('claude adapter', () => {
  it('formats templates with markers', () => {
    const output = claude.format(mockTemplates());
    assert.ok(output.includes('<!-- js-secure-coding:start -->'));
    assert.ok(output.includes('<!-- js-secure-coding:end -->'));
    assert.ok(output.includes('A01: Broken Access Control'));
  });

  it('extracts Rules and Checklist, not Code Examples', () => {
    const output = claude.format(mockTemplates());
    assert.ok(output.includes('Test Rule One'));
    assert.ok(output.includes('Input validated'));
    assert.ok(!output.includes('eval(userInput)'));
  });

  it('merges into existing content', () => {
    const existing = '# My Project\n\nSome content here.';
    const section = claude.format(mockTemplates());
    const merged = claude.merge(existing, section);
    assert.ok(merged.startsWith('# My Project'));
    assert.ok(merged.includes('<!-- js-secure-coding:start -->'));
  });

  it('replaces existing section on re-merge', () => {
    const first = claude.format(mockTemplates());
    const existing = `# Project\n\n${first}\n\n# Other stuff`;
    const newSection = claude.format(mockTemplates(), { framework: 'react' });
    const merged = claude.merge(existing, newSection);

    const starts = merged.match(/<!-- js-secure-coding:start -->/g);
    assert.equal(starts.length, 1, 'Should have exactly one start marker');
    assert.ok(merged.includes('Framework: react'));
    assert.ok(merged.includes('# Other stuff'));
  });

  it('handles empty file append without leading whitespace', () => {
    const merged = claude.merge('', claude.format(mockTemplates()));
    assert.ok(!merged.startsWith('\n'));
  });
});

describe('copilot adapter', () => {
  it('formats with correct markers', () => {
    const output = copilot.format(mockTemplates());
    assert.ok(output.includes('<!-- js-secure-coding:start -->'));
    assert.ok(output.includes('Security Coding Guidelines'));
  });

  it('extracts DO, DONT, and WHY rules', () => {
    const output = copilot.format(mockTemplates());
    assert.ok(output.includes('**DO**'));
    assert.ok(output.includes("**DON'T**"));
    assert.ok(output.includes('**WHY**'));
  });

  it('handles empty file merge', () => {
    const merged = copilot.merge('', copilot.format(mockTemplates()));
    assert.ok(!merged.startsWith('\n'));
  });
});

describe('agents adapter', () => {
  it('formats with markers and title', () => {
    const output = agents.format(mockTemplates());
    assert.ok(output.includes('# Security Guidelines'));
    assert.ok(output.includes('<!-- js-secure-coding:start -->'));
  });

  it('strips original title from template', () => {
    const output = agents.format(mockTemplates());
    assert.ok(!output.includes('# Test Security Rules'));
  });

  it('handles empty file merge', () => {
    const merged = agents.merge('', agents.format(mockTemplates()));
    assert.ok(!merged.startsWith('\n'));
  });
});

describe('cursor adapter', () => {
  it('generates multiple .mdc files', () => {
    const files = cursor.formatMultiple(mockTemplates());
    assert.equal(files.size, 1);
    assert.ok(files.has('security-access-control.mdc'));
  });

  it('includes frontmatter with description', () => {
    const files = cursor.formatMultiple(mockTemplates());
    const content = files.get('security-access-control.mdc');
    assert.ok(content.startsWith('---'));
    assert.ok(content.includes('description:'));
  });
});

describe('windsurf adapter', () => {
  it('generates multiple .md files', () => {
    const files = windsurf.formatMultiple(mockTemplates());
    assert.equal(files.size, 1);
    assert.ok(files.has('security-access-control.md'));
  });

  it('strips original title and adds own', () => {
    const files = windsurf.formatMultiple(mockTemplates());
    const content = files.get('security-access-control.md');
    assert.ok(content.startsWith('# A01: Broken Access Control'));
    assert.ok(!content.includes('# Test Security Rules'));
  });
});
