interface SelectionButtonProps {
  /** Viewport-relative anchor (bottom-right of the selection). */
  x: number;
  y: number;
  onClick: () => void;
}

/**
 * The little floating "comment" button that appears next to a text selection,
 * GitHub-style. Uses onMouseDown→preventDefault so clicking it does not clear
 * the underlying text selection before onClick fires.
 */
export function SelectionButton({ x, y, onClick }: SelectionButtonProps) {
  return (
    <button
      type="button"
      className="cr-selection-button"
      style={{ left: `${x}px`, top: `${y}px` }}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title="Add a comment on this selection"
    >
      <CommentIcon />
      <span>Comment</span>
    </button>
  );
}

function CommentIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
