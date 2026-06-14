import type { SiteAdapter } from './types';
import { elementFromRange, insertIntoEditable, queryFirst } from './insert';

/**
 * Claude's composer is a ProseMirror contenteditable inside the input fieldset.
 */
const PROMPT_SELECTORS = [
  'div.ProseMirror[contenteditable="true"]',
  'div[contenteditable="true"][role="textbox"]',
  'fieldset div[contenteditable="true"]',
  'div[contenteditable="true"]',
];

/**
 * Never offer to comment on the composer itself. Everything else on the page
 * is fair game — Claude doesn't put its conversation in a stable container we
 * can reliably match, so we allow-by-default and just exclude the input.
 */
const COMPOSER_GUARD =
  '.ProseMirror, [contenteditable="true"], [role="textbox"], textarea, input';

export const claudeAdapter: SiteAdapter = {
  id: 'claude',
  label: 'Claude',

  matches() {
    return location.hostname === 'claude.ai';
  },

  isSelectionAllowed(range) {
    const el = elementFromRange(range);
    if (!el) return false;
    return !el.closest(COMPOSER_GUARD);
  },

  getPromptInput() {
    return queryFirst(PROMPT_SELECTORS);
  },

  insertText(text) {
    return insertIntoEditable(this.getPromptInput(), text);
  },
};
