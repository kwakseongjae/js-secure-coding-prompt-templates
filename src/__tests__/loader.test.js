import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadTemplate, loadTemplates, getCategoryInfo } from '../loader.js';

describe('loader', () => {
  describe('loadTemplate', () => {
    it('loads a core template', async () => {
      const content = await loadTemplate('access-control');
      assert.ok(content);
      assert.ok(content.includes('## Rules'));
      assert.ok(content.includes('## Quick Checklist'));
    });

    it('loads a frontend template', async () => {
      const content = await loadTemplate('xss-prevention');
      assert.ok(content);
      assert.ok(content.includes('## Rules'));
    });

    it('returns null for unknown category', async () => {
      const content = await loadTemplate('nonexistent-category');
      assert.equal(content, null);
    });
  });

  describe('loadTemplates', () => {
    it('loads multiple templates', async () => {
      const templates = await loadTemplates(['access-control', 'injection']);
      assert.equal(templates.size, 2);
      assert.ok(templates.has('access-control'));
      assert.ok(templates.has('injection'));
    });

    it('loads all 14 templates', async () => {
      const all = [
        'access-control', 'security-config', 'supply-chain', 'cryptographic',
        'injection', 'secure-design', 'authentication', 'data-integrity',
        'logging-alerting', 'error-handling', 'xss-prevention',
        'csrf-protection', 'csp', 'secure-state',
      ];
      const templates = await loadTemplates(all);
      assert.equal(templates.size, 14);
    });

    it('skips unknown categories gracefully', async () => {
      const templates = await loadTemplates(['access-control', 'fake']);
      assert.equal(templates.size, 1);
    });
  });

  describe('getCategoryInfo', () => {
    it('returns correct OWASP code for core categories', () => {
      assert.equal(getCategoryInfo('access-control').owasp, 'A01');
      assert.equal(getCategoryInfo('injection').owasp, 'A05');
      assert.equal(getCategoryInfo('error-handling').owasp, 'A10');
    });

    it('returns correct info for frontend categories', () => {
      assert.equal(getCategoryInfo('xss-prevention').group, 'frontend');
      assert.equal(getCategoryInfo('csp').owasp, 'FE-03');
    });

    it('returns fallback for unknown category', () => {
      const info = getCategoryInfo('unknown');
      assert.equal(info.owasp, '??');
    });
  });
});
