/**
 * A single review note: a quoted fragment plus the user's comment about it.
 */
export interface Draft {
  id: string;
  quote: string;
  comment: string;
}

type Listener = () => void;

/**
 * Tiny observable store for the queue of pending drafts. Designed to plug into
 * React's useSyncExternalStore: `getSnapshot` returns a stable array reference
 * that only changes when the queue actually changes.
 */
function createDraftStore() {
  let drafts: Draft[] = [];
  const listeners = new Set<Listener>();

  function emit() {
    listeners.forEach((listener) => listener());
  }

  return {
    getSnapshot(): Draft[] {
      return drafts;
    },

    subscribe(listener: Listener): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    add(quote: string, comment: string): void {
      const draft: Draft = { id: crypto.randomUUID(), quote, comment };
      drafts = [...drafts, draft];
      emit();
    },

    remove(id: string): void {
      drafts = drafts.filter((draft) => draft.id !== id);
      emit();
    },

    clear(): void {
      if (drafts.length === 0) return;
      drafts = [];
      emit();
    },
  };
}

export const draftStore = createDraftStore();
