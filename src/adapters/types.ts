/**
 * A SiteAdapter encapsulates everything that is specific to one chat site
 * (Gemini today; ChatGPT / Claude later). The rest of the extension talks to
 * chat pages only through this interface, so adding a new site means writing
 * one new adapter and registering it — nothing else changes.
 */
export interface SiteAdapter {
  /** Stable identifier, e.g. "gemini". */
  readonly id: string;

  /** Human-readable name, shown in the UI. */
  readonly label: string;

  /** Does this adapter handle the page currently open? */
  matches(): boolean;

  /**
   * Is the given selection range something we should offer to comment on?
   * Used to ignore selections inside the prompt box, sidebars, menus, etc.
   */
  isSelectionAllowed(range: Range): boolean;

  /** The prompt input element to type into, or null if not found. */
  getPromptInput(): HTMLElement | null;

  /**
   * Insert text into the prompt input, appended after any existing content.
   * Returns true on success.
   */
  insertText(text: string): boolean;
}
