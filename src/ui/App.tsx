import { useCallback, useEffect, useState } from 'react';
import type { SiteAdapter } from '../adapters/types';
import { draftStore } from '../core/draftStore';
import { formatDrafts } from '../core/format';
import { CommentPopover } from './CommentPopover';
import { DraftPanel } from './DraftPanel';
import { SelectionButton } from './SelectionButton';
import { useDrafts } from './useDrafts';

interface Anchor {
  text: string;
  x: number;
  y: number;
}

interface AppProps {
  adapter: SiteAdapter;
}

/**
 * Root of the injected UI. Watches text selections inside chat messages,
 * surfaces the comment button + popover, and renders the draft queue.
 */
export function App({ adapter }: AppProps) {
  const drafts = useDrafts();
  const [selection, setSelection] = useState<Anchor | null>(null);
  const [editing, setEditing] = useState<Anchor | null>(null);

  // Track text selections in the conversation.
  useEffect(() => {
    function readSelection() {
      // Defer so the browser has committed the final selection on mouseup.
      requestAnimationFrame(() => {
        if (editing) return; // don't fight the open popover
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
          setSelection(null);
          return;
        }
        const text = sel.toString().trim();
        const range = sel.getRangeAt(0);
        if (!text || !adapter.isSelectionAllowed(range)) {
          setSelection(null);
          return;
        }
        const rect = range.getBoundingClientRect();
        setSelection({ text, x: rect.right, y: rect.bottom + 6 });
      });
    }

    document.addEventListener('mouseup', readSelection);
    document.addEventListener('keyup', readSelection);
    return () => {
      document.removeEventListener('mouseup', readSelection);
      document.removeEventListener('keyup', readSelection);
    };
  }, [adapter, editing]);

  // A stale anchor after scrolling is worse than none — drop it.
  useEffect(() => {
    function onScroll() {
      setSelection(null);
    }
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, []);

  const openEditor = useCallback(() => {
    if (!selection) return;
    setEditing(selection);
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, [selection]);

  const submitComment = useCallback(
    (comment: string) => {
      if (editing) draftStore.add(editing.text, comment);
      setEditing(null);
    },
    [editing],
  );

  const insertAll = useCallback(() => {
    const ok = adapter.insertText(formatDrafts(draftStore.getSnapshot()));
    if (ok) {
      draftStore.clear();
    } else {
      // eslint-disable-next-line no-alert
      alert('Could not find the prompt input to insert into.');
    }
  }, [adapter]);

  return (
    <>
      {selection && !editing && (
        <SelectionButton x={selection.x} y={selection.y} onClick={openEditor} />
      )}

      {editing && (
        <CommentPopover
          quote={editing.text}
          x={editing.x}
          y={editing.y}
          onSubmit={submitComment}
          onCancel={() => setEditing(null)}
        />
      )}

      <DraftPanel
        drafts={drafts}
        onRemove={draftStore.remove}
        onClear={draftStore.clear}
        onInsert={insertAll}
      />
    </>
  );
}
