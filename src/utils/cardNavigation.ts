/**
 * Selector matching every focusable extension card.
 */
export const CARD_SELECTOR = '[data-extension-card]';

/**
 * The id of the extension search input.
 */
export const SEARCH_INPUT_ID = 'search-input';

/**
 * Arrow keys that move focus between extension cards.
 */
export type CardDirection = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

/**
 * Tolerance in pixels when comparing card positions.
 */
const POSITION_TOLERANCE = 1;

/**
 * Get all extension cards in DOM order.
 *
 * @returns The extension card elements.
 */
export const getCards = (): HTMLElement[] => Array.from(document.querySelectorAll<HTMLElement>(CARD_SELECTOR));

/**
 * Find the card to focus when moving from the current card in the given direction.
 * Left and right follow DOM order; up and down follow the rendered position,
 * because the number of grid columns changes with the viewport width.
 *
 * @param current - The currently focused card.
 * @param direction - The arrow key pressed.
 * @param cards - All cards in DOM order.
 * @returns The adjacent card, or null when there is none.
 */
export const findAdjacentCard = (current: HTMLElement, direction: CardDirection, cards: HTMLElement[]): HTMLElement | null => {
  const index = cards.indexOf(current);
  if (index === -1) return null;

  if (direction === 'ArrowLeft') return cards[index - 1] ?? null;
  if (direction === 'ArrowRight') return cards[index + 1] ?? null;

  const currentRect = current.getBoundingClientRect();
  const currentCenter = currentRect.left + currentRect.width / 2;
  const isDown = direction === 'ArrowDown';

  /** Cards strictly above or below the current card, with their vertical distance */
  const candidates = cards
    .filter(card => card !== current)
    .map(card => ({ card, rect: card.getBoundingClientRect() }))
    .map(item => ({ ...item, distance: isDown ? item.rect.top - currentRect.top : currentRect.top - item.rect.top }))
    .filter(item => item.distance > POSITION_TOLERANCE);
  if (candidates.length === 0) return null;

  /** Keep only the nearest row, then pick the horizontally closest card */
  const nearestDistance = Math.min(...candidates.map(item => item.distance));
  const nearestRow = candidates.filter(item => item.distance - nearestDistance <= POSITION_TOLERANCE);
  const horizontalDistance = (rect: DOMRect) => Math.abs(rect.left + rect.width / 2 - currentCenter);
  nearestRow.sort((a, b) => horizontalDistance(a.rect) - horizontalDistance(b.rect));
  return nearestRow[0].card;
};

/**
 * Move focus to the extension search input.
 */
export const focusSearchInput = (): void => {
  document.getElementById(SEARCH_INPUT_ID)?.focus();
};

/**
 * Whether a modal dialog is currently open.
 *
 * @returns True when a dialog element exists in the document.
 */
export const isDialogOpen = (): boolean => document.querySelector('[role="dialog"]') !== null;
