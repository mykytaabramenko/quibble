/**
 * Shared helpers for finding a chat's prompt input and writing text into it.
 * Used by every site adapter so the (fiddly) insertion logic lives in one place.
 */

/** Flip to true to trace selector matching and insertion in the console. */
export const DEBUG = false;

export function log(...args: unknown[]) {
  if (DEBUG) console.log('[Quibble]', ...args);
}

/** Short, copy-pasteable description of a DOM element for logs. */
export function describe(el: Element | null): string {
  if (!el) return 'null';
  const tag = el.tagName.toLowerCase();
  const cls =
    el.className && typeof el.className === 'string'
      ? `.${el.className.trim().split(/\s+/).join('.')}`
      : '';
  const id = el.id ? `#${el.id}` : '';
  const ce = el.getAttribute('contenteditable');
  const role = el.getAttribute('role');
  const text = (el.textContent ?? '').trim().slice(0, 40);
  return `<${tag}${id}${cls}> ce=${ce ?? '-'} role=${role ?? '-'} text="${text}"`;
}

/** Log every element that could plausibly be the prompt input (debug aid). */
export function dumpCandidates() {
  const candidates = document.querySelectorAll(
    '[contenteditable="true"], textarea, input, [role="textbox"], rich-textarea, .ql-editor, .ProseMirror',
  );
  log(`candidate input elements on page: ${candidates.length}`);
  candidates.forEach((el, i) => log(`  [${i}] ${describe(el)}`));
}

/** The nearest Element to a selection range's common ancestor. */
export function elementFromRange(range: Range): Element | null {
  const node = range.commonAncestorContainer;
  return node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element);
}

/** Return the first element matching any of the selectors, or null. */
export function queryFirst(selectors: string[]): HTMLElement | null {
  for (const selector of selectors) {
    const el = document.querySelector<HTMLElement>(selector);
    if (el) {
      log(`matched selector "${selector}":`, describe(el));
      return el;
    }
  }
  log('no selector matched from', selectors);
  return null;
}

/** True if the element is a plain form control (textarea/input). */
function isFormControl(el: HTMLElement): el is HTMLTextAreaElement | HTMLInputElement {
  return el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement;
}

/**
 * Append `text` to the prompt input `el`, returning true if the content
 * actually changed. Handles both rich-text editors (contenteditable, e.g.
 * Quill / ProseMirror) and plain textareas.
 */
export function insertIntoEditable(el: HTMLElement | null, text: string): boolean {
  if (!el) {
    log('❌ no editor found');
    dumpCandidates();
    return false;
  }
  return isFormControl(el) ? insertIntoFormControl(el, text) : insertIntoContentEditable(el, text);
}

function insertIntoFormControl(el: HTMLTextAreaElement | HTMLInputElement, text: string): boolean {
  const existing = el.value.trim();
  const payload = existing ? `${el.value}\n\n${text}` : text;

  // Use the native value setter so React-controlled inputs pick up the change,
  // then fire `input` to trigger their onChange handlers.
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (setter) setter.call(el, payload);
  else el.value = payload;

  el.focus();
  el.dispatchEvent(new Event('input', { bubbles: true }));
  log('textarea insert — value length now', el.value.length);
  return el.value.includes(text);
}

function insertIntoContentEditable(el: HTMLElement, text: string): boolean {
  const existing = (el.textContent ?? '').trim();
  const payload = existing ? `\n\n${text}` : text;

  // Rich editors (Quill, ProseMirror) ignore synthetic `paste` events (they are
  // untrusted). execCommand runs the browser's own editing path and emits the
  // trusted beforeinput/input events these editors listen for. insertParagraph
  // makes newlines through the editor's model rather than simulating Enter, so
  // it won't accidentally submit the prompt.
  el.focus();
  placeCaretAtEnd(el);

  const before = el.textContent ?? '';
  insertViaExecCommand(payload);
  const after = el.textContent ?? '';
  const changed = after !== before;

  log('execCommand insert — content len', before.length, '->', after.length, 'changed:', changed);
  return changed;
}

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
