import type { SiteAdapter } from './types';

/** Flip to true to trace the prompt-insertion path in the console. */
const DEBUG = false;

function log(...args: unknown[]) {
  if (DEBUG) console.log('[ChatReview]', ...args);
}

/** Short, copy-pasteable description of a DOM element for logs. */
function describe(el: Element | null): string {
  if (!el) return 'null';
  const tag = el.tagName.toLowerCase();
  const cls = el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).join('.')}` : '';
  const id = el.id ? `#${el.id}` : '';
  const ce = el.getAttribute('contenteditable');
  const role = el.getAttribute('role');
  const text = (el.textContent ?? '').trim().slice(0, 40);
  return `<${tag}${id}${cls}> ce=${ce ?? '-'} role=${role ?? '-'} text="${text}"`;
}

/** Log every element that could plausibly be the prompt input. */
function dumpCandidates() {
  const candidates = document.querySelectorAll(
    '[contenteditable="true"], textarea, input, [role="textbox"], rich-textarea, .ql-editor',
  );
  log(`candidate input elements on page: ${candidates.length}`);
  candidates.forEach((el, i) => log(`  [${i}] ${describe(el)}`));
}

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
    if (el.closest(INPUT_GUARD_SELECTOR)) return false;
    return Boolean(el.closest(MESSAGE_SELECTOR));
  },

  getPromptInput() {
    for (const selector of PROMPT_SELECTORS) {
      const el = document.querySelector<HTMLElement>(selector);
      if (el) {
        log(`getPromptInput matched selector "${selector}":`, describe(el));
        return el;
      }
    }
    log('getPromptInput: no selector matched');
    return null;
  },

  insertText(text) {
    const editor = this.getPromptInput();
    if (!editor) {
      log('❌ no editor found');
      dumpCandidates();
      return false;
    }

    const existing = (editor.textContent ?? '').trim();
    const payload = existing ? `\n\n${text}` : text;

    // Quill ignores synthetic `paste` events (they are untrusted and its paste
    // pipeline relies on a real browser paste). execCommand, by contrast, runs
    // the browser's own editing path and emits the trusted beforeinput/input
    // events Quill listens for. insertParagraph creates newlines through
    // Quill's model rather than simulating Enter, so it won't submit the prompt.
    editor.focus();
    placeCaretAtEnd(editor);

    const before = editor.textContent ?? '';
    insertViaExecCommand(payload);
    const after = editor.textContent ?? '';
    const changed = after !== before;

    log('execCommand insert — content len', before.length, '->', after.length, 'changed:', changed);
    return changed;
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
