import type { Draft } from './draftStore';

/** Prefix every line of `text` with a markdown blockquote marker. */
function asBlockquote(text: string): string {
  return text
    .split('\n')
    .map((line) => (line ? `> ${line}` : '>'))
    .join('\n');
}

/** Render one draft as a blockquote followed by the comment. */
export function formatDraft(draft: Draft): string {
  const quote = asBlockquote(draft.quote.trim());
  const comment = draft.comment.trim();
  return comment ? `${quote}\n\n${comment}` : quote;
}

/**
 * Render the whole queue into a single markdown block ready to drop into the
 * prompt input. Drafts are separated by a blank line.
 */
export function formatDrafts(drafts: Draft[]): string {
  return drafts.map(formatDraft).join('\n\n');
}
