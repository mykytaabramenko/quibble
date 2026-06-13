# Quibble — Design

## Goal

A browser extension that lets you review an AI chat's answer like a GitHub PR:
select a fragment of a response, attach a comment/clarifying question to it,
accumulate several such notes, then inject them all into the prompt box as
quoted markdown so you can send one consolidated follow-up.

First target: **Gemini** (`gemini.google.com`). Designed to extend to ChatGPT
and Claude later without touching core code.

## Decisions

| Question | Decision |
| --- | --- |
| Add-comment trigger | Floating **Comment** button on selection → popover (GitHub-style) |
| Multiple fragments | Accumulate in a queue, then **Insert all** at once |
| Inserted format | Markdown blockquote of the fragment + the comment below |
| Browser target | Chromium (Chrome/Arc/Edge/Brave); Firefox target wired up too |
| Stack | WXT (MV3) + React + TypeScript |

## Architecture

```
content script (entrypoints/content)
  └─ Shadow DOM root  ← isolates our styles from the page
       └─ <App adapter={activeAdapter}>
            ├─ SelectionButton   (appears on a valid selection)
            ├─ CommentPopover    (write the note)
            └─ DraftPanel        (the queue + "Insert into prompt")

core/
  draftStore   – observable queue of {id, quote, comment}
  format       – drafts → markdown

adapters/
  types        – SiteAdapter interface (the extensibility seam)
  gemini       – Gemini selectors + prompt insertion
  registry     – pick the adapter matching the current page
```

### SiteAdapter (the seam)

```ts
interface SiteAdapter {
  id; label;
  matches(): boolean;                      // is this the right page?
  isSelectionAllowed(range: Range): bool;  // ignore the prompt box, menus, …
  getPromptInput(): HTMLElement | null;
  insertText(text: string): boolean;       // append to the prompt input
}
```

Adding a chat = one new adapter + one registry line + one `matches` URL.

## Data flow

1. `mouseup`/`keyup` → read selection → if inside a message, show `SelectionButton`.
2. Click → open `CommentPopover` with the captured quote (selection text is
   captured up front so losing the live selection doesn't matter).
3. **Add** → `draftStore.add(quote, comment)` → popover closes, panel count++.
4. **Insert into prompt** → `adapter.insertText(formatDrafts(queue))`; on
   success the queue clears.

## Risk

Gemini's prompt input is a Quill editor; programmatic insertion is the fragile
part. Strategy: dispatch a synthetic `paste` (Quill handles multi-line paste),
fall back to `execCommand`. Isolated in `geminiAdapter.insertText`.

## Out of scope (for now)

ChatGPT/Claude adapters, persistence across reloads, editing a note after it's
added, keyboard-only selection workflow.
