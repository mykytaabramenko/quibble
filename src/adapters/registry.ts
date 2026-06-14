import { chatgptAdapter } from './chatgpt';
import { claudeAdapter } from './claude';
import { geminiAdapter } from './gemini';
import type { SiteAdapter } from './types';

/**
 * All known site adapters. To support a new chat, write a new adapter
 * implementing SiteAdapter and add it here (plus its URL in the content
 * script's `matches`).
 */
const adapters: SiteAdapter[] = [geminiAdapter, chatgptAdapter, claudeAdapter];

/** The adapter for the page currently open, or null if none match. */
export function getActiveAdapter(): SiteAdapter | null {
  return adapters.find((adapter) => adapter.matches()) ?? null;
}
