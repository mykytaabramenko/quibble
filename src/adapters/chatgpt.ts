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

/** Never offer to comment on the composer / form controls. */
const INPUT_GUARD_SELECTOR =
  '#prompt-textarea, .ProseMirror, textarea, input, [contenteditable="true"], form';

/**
 * Conversation messages. `[data-message-author-role]` is ChatGPT's stable
 * marker; `main` is a broad fallback so this keeps working if class names move.
 */
const MESSAGE_SELECTOR = '[data-message-author-role], .markdown, .prose, main';

export const chatgptAdapter: SiteAdapter = {
  id: 'chatgpt',
  label: 'ChatGPT',

  matches() {
    return location.hostname === 'chatgpt.com' || location.hostname === 'chat.openai.com';
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
