import React, { useCallback } from 'react';

import { CardDirection, findAdjacentCard, focusSearchInput, getCards, isDialogOpen } from '@/utils';

/**
 * Actions triggered by keys pressed on a focused extension card.
 */
interface CardKeyboardActions {
  onToggle: () => void | Promise<void>;
  onOpen: () => void | Promise<void>;
  onOpenMenu: () => void;
}

/**
 * Arrow keys that move focus between cards.
 */
const ARROW_KEYS: string[] = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

/**
 * Non-arrow keys handled on a card.
 */
const ACTION_KEYS: string[] = [' ', 'Enter', 'm', 'M', 'Escape'];

/**
 * The hook that turns key presses on an extension card into navigation and actions.
 * Attach the returned handler as onKeyDownCapture on the card root so it runs
 * before the handlers of the controls inside the card.
 *
 * @param actions - The card actions.
 * @returns The keydown handler for the card root.
 */
export const useCardKeyboardNavigation = ({ onToggle, onOpen, onOpenMenu }: CardKeyboardActions) => {
  return useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      /** Untrusted events are synthetic keys dispatched by the card itself (e.g. to open the menu) */
      if (!e.nativeEvent.isTrusted || isDialogOpen() || e.nativeEvent.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;

      const card = e.currentTarget;
      const target = e.target as HTMLElement;
      /** Keys inside the open menu belong to the menu */
      if (target.closest('[role="menu"]')) return;

      const isArrow = ARROW_KEYS.includes(e.key);
      if (!isArrow && !ACTION_KEYS.includes(e.key)) return;
      e.preventDefault();
      e.stopPropagation();

      /** Holding an action key must not toggle or open repeatedly; arrow keys may repeat */
      if (!isArrow && e.repeat) return;

      /** A control inside the card (after mouse use or focus restore) hands focus back to the card */
      if (target !== card) card.focus();

      if (isArrow) {
        findAdjacentCard(card, e.key as CardDirection, getCards())?.focus();
        return;
      }
      switch (e.key) {
        case ' ':
          void onToggle();
          break;
        case 'Enter':
          void onOpen();
          break;
        case 'Escape':
          focusSearchInput();
          break;
        default:
          onOpenMenu();
      }
    },
    [onToggle, onOpen, onOpenMenu]
  );
};
