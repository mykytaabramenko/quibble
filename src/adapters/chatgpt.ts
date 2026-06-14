import type { SiteAdapter } from './types';
import { elementFromRange, insertIntoEditable, queryFirst } from './insert';

/**
 * ChatGPT's prompt input. Recent ChatGPT uses a ProseMirror contenteditable
 * with id `prompt-textarea`; older builds used a real <textarea>. Both are
 * covered, most-specific first.
 */
const PROMPT_SELECTORS = [
  '#prompt-textarea[contenteditable="true"]',
  'div.ProseMirror#prompt-textarea',
  'div.ProseMirror[contenteditable="true"]',
  'textarea#prompt-textarea',
  'form textarea',
];

/**
 * Never offer to comment on the composer itself. Everything else is fair game
 * (allow-by-default, exclude only the input) so we don't depend on a specific
 * message-container class that may change.
 */
const COMPOSER_GUARD =
  '#prompt-textarea, .ProseMirror, [contenteditable="true"], [role="textbox"], textarea, input';

export const chatgptAdapter: SiteAdapter = {
  id: 'chatgpt',
  label: 'ChatGPT',

  matches() {
    return location.hostname === 'chatgpt.com' || location.hostname === 'chat.openai.com';
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
