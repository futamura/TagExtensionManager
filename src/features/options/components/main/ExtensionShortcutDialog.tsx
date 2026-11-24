import React from 'react';

import { DialogHeader, DialogRoot } from '@/components';

interface ShortcutRow {
  label: string;
  keys: string[];
}

interface ShortcutSection {
  title: string;
  rows: ShortcutRow[];
}

/**
 * The shortcuts shown in the dialog. Keep in sync with the implemented key handlers.
 */
const SHORTCUT_SECTIONS: ShortcutSection[] = [
  {
    title: 'Anywhere',
    rows: [
      { label: 'Show this list', keys: ['?'] },
      { label: 'Focus the search field', keys: ['/'] },
    ],
  },
  {
    title: 'Moving around',
    rows: [
      { label: 'Previous / next item', keys: ['←', '→'] },
      { label: 'Item above / below', keys: ['↑', '↓'] },
      { label: 'Back to the search field', keys: ['Esc'] },
    ],
  },
  {
    title: 'Extension card',
    rows: [
      { label: 'Enable / disable', keys: ['Space'] },
      { label: 'Open options page', keys: ['Enter'] },
      { label: 'Open menu', keys: ['M'] },
    ],
  },
  {
    title: 'Tag dialogs',
    rows: [
      { label: 'Move between items', keys: ['←', '→', '↑', '↓'] },
      { label: 'Toggle / rename a tag', keys: ['Space', 'Enter'] },
      { label: 'Add a tag / finish renaming', keys: ['Enter'] },
      { label: 'Close the dialog', keys: ['Esc'] },
    ],
  },
];

/**
 * The note on arrow keys inside text fields, where only up and down move between items.
 */
const TEXT_FIELD_NOTE = 'In text fields, ← → move the cursor instead.';

interface ExtensionShortcutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * The dialog that lists the keyboard shortcuts.
 *
 * @param isOpen - Whether the dialog is open.
 * @param onClose - The callback to close the dialog.
 * @returns The ExtensionShortcutDialog component.
 */
export const ExtensionShortcutDialog: React.FC<ExtensionShortcutDialogProps> = ({ isOpen, onClose }) => {
  return (
    <DialogRoot isOpen={isOpen} onClose={onClose}>
      <DialogHeader title="Keyboard Shortcuts" onClose={onClose} />
      <div className="mt-3 flex flex-col gap-3">
        {SHORTCUT_SECTIONS.map(section => (
          <section key={section.title}>
            <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{section.title}</h3>
            <ul>
              {section.rows.map(row => (
                <li key={row.label} className="flex items-center justify-between gap-2 py-0.5 text-base">
                  <span>{row.label}</span>
                  <span className="flex shrink-0 gap-1">
                    {row.keys.map(key => (
                      <kbd key={key} className="min-w-5 rounded-sm bg-zinc-200 px-1.5 text-center font-sans dark:bg-zinc-700">
                        {key}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <p className="text-base text-zinc-500 dark:text-zinc-400">{TEXT_FIELD_NOTE}</p>
      </div>
    </DialogRoot>
  );
};
