import { useState } from 'react';
import type { Draft } from '../core/draftStore';

interface DraftPanelProps {
  drafts: Draft[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onInsert: () => void;
}

/**
 * The persistent queue widget pinned to the bottom-right. Collapsed it is a
 * pill showing the count; expanded it lists every pending note with the option
 * to remove one, clear all, or insert everything into the prompt.
 */
export function DraftPanel({ drafts, onRemove, onClear, onInsert }: DraftPanelProps) {
  const [open, setOpen] = useState(true);

  if (drafts.length === 0) return null;

  return (
    <div className="cr-panel" onMouseDown={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="cr-panel__header"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="cr-panel__title">
          Review notes <span className="cr-badge">{drafts.length}</span>
        </span>
        <span className="cr-panel__chevron" data-open={open}>
          ▾
        </span>
      </button>

      {open && (
        <>
          <ul className="cr-panel__list">
            {drafts.map((draft, index) => (
              <li key={draft.id} className="cr-panel__item">
                <div className="cr-panel__item-body">
                  <blockquote className="cr-panel__quote">{draft.quote}</blockquote>
                  {draft.comment && (
                    <p className="cr-panel__comment">{draft.comment}</p>
                  )}
                </div>
                <button
                  type="button"
                  className="cr-panel__remove"
                  title="Remove this note"
                  onClick={() => onRemove(draft.id)}
                >
                  ✕
                </button>
                <span className="cr-panel__index">{index + 1}</span>
              </li>
            ))}
          </ul>

          <div className="cr-panel__footer">
            <button type="button" className="cr-btn cr-btn--ghost" onClick={onClear}>
              Clear
            </button>
            <button type="button" className="cr-btn cr-btn--primary" onClick={onInsert}>
              Insert into prompt
            </button>
          </div>
        </>
      )}
    </div>
  );
}
