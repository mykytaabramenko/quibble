import type { SiteAdapter } from './types';
import { elementFromRange, insertIntoEditable, queryFirst } from './insert';

/**
 * Selectors that identify Gemini's prompt input. Gemini uses a Quill-based
 * rich text editor (`.ql-editor`) inside a `<rich-textarea>` element.
 */
const PROMPT_SELECTORS = [
  'rich-textarea .ql-editor',
  '.ql-editor[contenteditable="true"]',
  'div[contenteditable="true"][role="textbox"]',
];

/** Elements that should NEVER be treated as commentable content. */
const INPUT_GUARD_SELECTOR = 'rich-textarea, .ql-editor, textarea, input, [role="textbox"]';

/** Containers that hold actual conversation messages. */
const MESSAGE_SELECTOR =
  'message-content, .model-response-text, .markdown, response-element, user-query, .conversation-container';

export const geminiAdapter: SiteAdapter = {
  id: 'gemini',
  label: 'Gemini',

  matches() {
    return location.hostname === 'gemini.google.com';
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
