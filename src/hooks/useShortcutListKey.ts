import { useEffect } from 'react';

import { isDialogOpen } from '@/utils';

/**
 * Call onOpen when "?" is pressed outside of text fields and dialogs.
 * Shift is allowed because it is needed to type "?".
 *
 * @param onOpen - The callback to open the shortcut list.
 */
export const useShortcutListKey = (onOpen: () => void): void => {
  useEffect(() => {
    const handleQuestionMark = (e: KeyboardEvent) => {
      if (e.key !== '?' || e.ctrlKey || e.metaKey || e.altKey || e.isComposing || e.repeat || isDialogOpen()) return;

      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;

      e.preventDefault();
      onOpen();
    };

    document.addEventListener('keydown', handleQuestionMark);
    return () => document.removeEventListener('keydown', handleQuestionMark);
  }, [onOpen]);
};
