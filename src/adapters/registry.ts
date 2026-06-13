import { geminiAdapter } from './gemini';
import type { SiteAdapter } from './types';

/**
 * All known site adapters. To support a new chat (ChatGPT, Claude, ...),
 * write a new adapter implementing SiteAdapter and add it here.
 */
const adapters: SiteAdapter[] = [geminiAdapter];

/** The adapter for the page currently open, or null if none match. */
export function getActiveAdapter(): SiteAdapter | null {
  return adapters.find((adapter) => adapter.matches()) ?? null;
}
