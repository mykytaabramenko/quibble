import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface CommentPopoverProps {
  /** The text fragment being commented on. */
  quote: string;
  /** Viewport-relative anchor (bottom-right of the selection). */
  x: number;
  y: number;
  onSubmit: (comment: string) => void;
  onCancel: () => void;
}

const POPOVER_WIDTH = 320;

/**
 * The comment editor that opens after clicking the selection button. Shows the
 * quoted fragment and a textarea. Cmd/Ctrl+Enter submits, Escape cancels.
 */
export function CommentPopover({
  quote,
  x,
  y,
  onSubmit,
  onCancel,
}: CommentPopoverProps) {
  const [comment, setComment] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: x, top: y });

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Keep the popover inside the viewport.
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const { height } = card.getBoundingClientRect();
    const margin = 8;
    let left = x;
    let top = y;
    if (left + POPOVER_WIDTH + margin > window.innerWidth) {
      left = window.innerWidth - POPOVER_WIDTH - margin;
    }
    if (top + height + margin > window.innerHeight) {
      top = Math.max(margin, y - height - 24);
    }
    setPosition({ left: Math.max(margin, left), top });
  }, [x, y]);

  function submit() {
    onSubmit(comment);
  }

  return (
    <div
      ref={cardRef}
      className="cr-popover"
      style={{ left: `${position.left}px`, top: `${position.top}px`, width: POPOVER_WIDTH }}
      onMouseDown={(e) => e.stopPropagation()}
      // Some chat apps (e.g. Claude) refocus their own composer on any
      // keystroke heard at the document level. Stop our key/input events from
      // bubbling out so they stay in this popover's textarea.
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
      onKeyPress={(e) => e.stopPropagation()}
      onInput={(e) => e.stopPropagation()}
      onBeforeInput={(e) => e.stopPropagation()}
    >
      <blockquote className="cr-popover__quote">{quote}</blockquote>
      <textarea
        ref={textareaRef}
        className="cr-popover__input"
        placeholder="Ask a question or leave a note about this fragment…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
          }
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            submit();
          }
        }}
        rows={3}
      />
      <div className="cr-popover__actions">
        <span className="cr-popover__hint">⌘/Ctrl + Enter</span>
        <div className="cr-popover__buttons">
          <button type="button" className="cr-btn cr-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="cr-btn cr-btn--primary" onClick={submit}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
