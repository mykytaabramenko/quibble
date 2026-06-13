import { useSyncExternalStore } from 'react';
import { draftStore } from '../core/draftStore';

/** Subscribe a component to the draft queue. */
export function useDrafts() {
  return useSyncExternalStore(draftStore.subscribe, draftStore.getSnapshot);
}
