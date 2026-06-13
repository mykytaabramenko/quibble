import type { SiteAdapter } from './types';

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
const INPUT_GUARD_SELECTOR =
  'rich-textarea, .ql-editor, textarea, input, [role="textbox"]';

/** Containers that hold actual conversation messages. */
const MESSAGE_SELECTOR =
  'message-content, .model-response-text, .markdown, response-element, user-query, .conversation-container';

function elementFromRange(range: Range): Element | null {
  const node = range.commonAncestorContainer;
  return node.nodeType === Node.TEXT_NODE
    ? node.parentElement
    : (node as Element);
}

export const geminiAdapter: SiteAdapter = {
  id: 'gemini',
  label: 'Gemini',

  matches() {
    return location.hostname === 'gemini.google.com';
  },

  isSelectionAllowed(range) {
    const el = elementFromRange(range);
    if (!el) return false;
    // Never offer to comment on text inside the prompt box or other inputs.
    if (el.closest(INPUT_GUARD_SELECTOR)) return false;
    // Only offer on text that lives inside a conversation message.
    return Boolean(el.closest(MESSAGE_SELECTOR));
  },

  getPromptInput() {
    for (const selector of PROMPT_SELECTORS) {
      const el = document.querySelector<HTMLElement>(selector);
      if (el) return el;
    }
    return null;
  },

  insertText(text) {
    const editor = this.getPromptInput();
    if (!editor) return false;

    const existing = (editor.textContent ?? '').trim();
    const payload = existing ? `\n\n${text}` : text;

    editor.focus();
    placeCaretAtEnd(editor);

    // Strategy 1: simulate a paste. Quill's clipboard module handles multi-line
    // pasted text correctly, which a plain `insertText` execCommand does not.
    if (dispatchPaste(editor, payload)) return true;

    // Strategy 2: fall back to execCommand, inserting paragraphs by hand.
    return insertViaExecCommand(payload);
  },
};

function placeCaretAtEnd(editor: HTMLElement) {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(editor);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function dispatchPaste(editor: HTMLElement, text: string): boolean {
  try {
    const data = new DataTransfer();
    data.setData('text/plain', text);
    const event = new ClipboardEvent('paste', {
      clipboardData: data,
      bubbles: true,
      cancelable: true,
    });
    // Some browsers strip clipboardData passed to the constructor.
    if (!event.clipboardData || event.clipboardData.getData('text/plain') !== text) {
      return false;
    }
    editor.dispatchEvent(event);
    return true;
  } catch {
    return false;
  }
}

function insertViaExecCommand(text: string): boolean {
  const lines = text.split('\n');
  let ok = true;
  lines.forEach((line, index) => {
    if (index > 0) {
      ok = document.execCommand('insertParagraph') && ok;
    }
    if (line) {
      ok = document.execCommand('insertText', false, line) && ok;
    }
  });
  return ok;
}
