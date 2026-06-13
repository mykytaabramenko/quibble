# Chat Review

Review AI chat answers like a GitHub pull request. Select any fragment of a
chat response, leave a comment or clarifying question on it, collect several
such notes, then inject them all back into the prompt box as quoted markdown.

Built for **Gemini** first, with an adapter layer so other chats (ChatGPT,
Claude, …) can be added later.

## How it works

1. Select text inside a Gemini message → a **Comment** button appears.
2. Click it, write your note, press **Add** (or ⌘/Ctrl+Enter).
3. Repeat for as many fragments as you like — they collect in the panel at the
   bottom-right.
4. Click **Insert into prompt** and every note is dropped into the prompt box as:

   ```markdown
   > the fragment you selected

   your comment

   > another fragment

   another comment
   ```

## Tech

- [WXT](https://wxt.dev) (Manifest V3) + React + TypeScript
- UI is injected into an isolated Shadow DOM, so it never collides with the
  host page's styles.
- Works in Chrome, Arc, Edge, Brave (all Chromium). A Firefox build target is
  wired up too (`npm run dev:firefox`).

## Develop

```bash
npm install
npm run dev          # launches Chrome with the extension loaded + HMR
```

For Arc (or any Chromium browser), build once and load the unpacked folder:

```bash
npm run build        # outputs to .output/chrome-mv3
```

Then in the browser: Extensions → Developer mode → **Load unpacked** →
select `.output/chrome-mv3`.

## Adding another chat

Everything site-specific lives behind the `SiteAdapter` interface
(`src/adapters/types.ts`):

1. Write `src/adapters/<site>.ts` implementing `SiteAdapter` (URL match,
   which selections are commentable, where the prompt input is, how to insert
   text into it).
2. Register it in `src/adapters/registry.ts`.
3. Add the site's URL to `matches` in `entrypoints/content/index.tsx`.

No other code changes.

## Known rough edge

Gemini's prompt box is a Quill rich-text editor. Insertion is done by
simulating a paste (with an `execCommand` fallback). If Google changes the
editor, `geminiAdapter.insertText` is the one place to adjust.
