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

/** Never offer to comment on the composer / form controls. */
const INPUT_GUARD_SELECTOR =
  '.ProseMirror, [contenteditable="true"], textarea, input, fieldset';

/**
 * Conversation messages. `.font-claude-message` marks assistant turns;
 * `main` is a broad fallback if class names change.
 */
const MESSAGE_SELECTOR =
  '.font-claude-message, [data-testid="user-message"], .prose, main';

export const claudeAdapter: SiteAdapter = {
  id: 'claude',
  label: 'Claude',

  matches() {
    return location.hostname === 'claude.ai';
  },

  isSelectionAllowed(range) {
    const el = elementFromRange(range);
    if (!el) return false;
    if (el.closest(INPUT_GUARD_SELECTOR)) return false;
    return Boolean(el.closest(MESSAGE_SELECTOR));
  },

  getPromptInput() {
    return queryFirst(PROMPT_SELECTORS);
  },

  insertText(text) {
    return insertIntoEditable(this.getPromptInput(), text);
  },
};
