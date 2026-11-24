import type { KeyboardEvent } from 'react';

/**
 * Selector matching every element reachable with arrow-key navigation
 * (toolbar buttons, the search input, group header buttons and extension cards).
 */
export const NAV_ITEM_SELECTOR = '[data-nav-item]';

/**
 * Selector matching every focusable extension card.
 */
export const CARD_SELECTOR = '[data-extension-card]';

/**
 * The id of the extension search input.
 */
export const SEARCH_INPUT_ID = 'search-input';

/**
 * Arrow keys that move focus between navigable elements.
 */
export type NavDirection = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

/**
 * Tolerance in pixels when comparing element positions.
 */
const POSITION_TOLERANCE = 1;

/**
 * Selector matching the scroll container that holds the extension list.
 */
export const NAV_SCROLL_CONTAINER_SELECTOR = '[data-nav-scroll-container]';

/**
 * Get the vertical position of an element as if its scroll container were not scrolled.
 * Without this, list items scrolled out of view above the list would sit at the same
 * height as the toolbar and be picked when moving up or down from it.
 *
 * @param element - The element.
 * @param rect - The element's bounding rect.
 * @returns The unscrolled top position.
 */
const getLayoutTop = (element: HTMLElement, rect: DOMRect): number => rect.top + (element.closest(NAV_SCROLL_CONTAINER_SELECTOR)?.scrollTop ?? 0);

/**
 * Get all navigable elements in DOM order.
 *
 * @returns The navigable elements.
 */
export const getNavItems = (): HTMLElement[] => Array.from(document.querySelectorAll<HTMLElement>(NAV_ITEM_SELECTOR));

/**
 * Get all extension cards in DOM order.
 *
 * @returns The extension card elements.
 */
export const getCards = (): HTMLElement[] => Array.from(document.querySelectorAll<HTMLElement>(CARD_SELECTOR));

/**
 * Find the element to focus when moving from the current element in the given direction.
 * Left and right follow DOM order; up and down follow the rendered position,
 * because toolbar rows wrap and the number of grid columns changes with the viewport width.
 *
 * @param current - The currently focused element.
 * @param direction - The arrow key pressed.
 * @param items - All navigable elements in DOM order.
 * @param align - How to pick within the nearest row: 'center' compares horizontal centers,
 * 'start' compares left edges.
 * @returns The adjacent element, or null when there is none.
 */
export const findAdjacentItem = (
  current: HTMLElement,
  direction: NavDirection,
  items: HTMLElement[],
  align: 'center' | 'start' = 'center'
): HTMLElement | null => {
  const index = items.indexOf(current);
  if (index === -1) return null;

  if (direction === 'ArrowLeft') return items[index - 1] ?? null;
  if (direction === 'ArrowRight') return items[index + 1] ?? null;

  const currentRect = current.getBoundingClientRect();
  const currentTop = getLayoutTop(current, currentRect);
  const anchorX = (rect: DOMRect) => (align === 'start' ? rect.left : rect.left + rect.width / 2);
  const currentX = anchorX(currentRect);
  const isDown = direction === 'ArrowDown';

  /** Elements strictly above or below the current element, with their vertical distance */
  const candidates = items
    .filter(item => item !== current)
    .map(item => ({ item, rect: item.getBoundingClientRect() }))
    .map(entry => ({ ...entry, top: getLayoutTop(entry.item, entry.rect) }))
    .map(entry => ({ ...entry, distance: isDown ? entry.top - currentTop : currentTop - entry.top }))
    .filter(entry => entry.distance > POSITION_TOLERANCE);
  if (candidates.length === 0) return null;

  /** Keep only the nearest row, then pick the horizontally closest element */
  const nearestDistance = Math.min(...candidates.map(entry => entry.distance));
  const nearestRow = candidates.filter(entry => entry.distance - nearestDistance <= POSITION_TOLERANCE);
  const horizontalDistance = (rect: DOMRect) => Math.abs(anchorX(rect) - currentX);
  nearestRow.sort((a, b) => horizontalDistance(a.rect) - horizontalDistance(b.rect));
  return nearestRow[0].item;
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

/**
 * Arrow keys handled on a navigable button.
 */
const NAV_ARROW_KEYS: string[] = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

/**
 * Keydown handler for navigable buttons (toolbar and group header buttons).
 * Arrow keys move focus to the adjacent navigable element and Escape returns to the search input.
 * Space and Enter are left to the native button.
 *
 * @param e - The keyboard event.
 */
export const handleNavItemKeyDown = (e: KeyboardEvent<HTMLElement>): void => {
  if (isDialogOpen() || e.nativeEvent.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;

  if (e.key === 'Escape') {
    e.preventDefault();
    focusSearchInput();
    return;
  }
  if (!NAV_ARROW_KEYS.includes(e.key)) return;

  e.preventDefault();
  findAdjacentItem(e.currentTarget, e.key as NavDirection, getNavItems())?.focus();
};
