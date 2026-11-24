import React, { useCallback, useRef, useState } from 'react';

import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

import { DefaultBackgroundButton } from '@/components';
import { ExtensionShortcutDialog } from '@/features/options/components/main/ExtensionShortcutDialog';
import { useBackup, useShortcutListKey } from '@/hooks';

/**
 * The question mark of Heroicons' outline QuestionMarkCircleIcon without the outer circle,
 * so the round button background acts as the circle.
 *
 * @param className - The class name of the svg element.
 * @returns The QuestionMarkIcon component.
 */
const QuestionMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="4 4 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 17.25h.008v.008H12v-.008Z" />
  </svg>
);

/**
 * The component for managing profile export/import.
 * @returns The ExtensionHeader component
 */
export const ExtensionHeader: React.FC = () => {
  const { exportFile, importFile } = useBackup();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isShortcutListOpen, setIsShortcutListOpen] = useState(false);
  const openShortcutList = useCallback(() => setIsShortcutListOpen(true), []);
  useShortcutListKey(openShortcutList);

  /**
   * Handle the import profile event.
   * @param event - The change event
   */
  const handleImportProfile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await importFile(file);
  };

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-xl font-bold">Tag Extension Manager</h1>
      <div className="flex items-center gap-1">
        <DefaultBackgroundButton navigable onClick={exportFile} className="pl-2 pr-3 py-1 rounded-full" title="Export Profile">
          <ArrowDownTrayIcon className="w-3 h-3 inline-flex mr-1" />
          <span className="text-sm">Export</span>
        </DefaultBackgroundButton>
        <DefaultBackgroundButton navigable onClick={() => fileInputRef.current?.click()} className="pl-2 pr-3 py-1 rounded-full" title="Import Profile">
          <ArrowUpTrayIcon className="w-3 h-3 inline-flex mr-1" />
          <span className="text-sm">Import</span>
        </DefaultBackgroundButton>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportProfile} className="hidden" />
        {/**
         * Same height as Export / Import (py-1 + one inherited line box), not a fixed size:
         * the inherited font size differs between the extension page (body 75%) and a normal page.
         */}
        <DefaultBackgroundButton
          navigable
          onClick={openShortcutList}
          className="h-[calc(0.5rem+1lh)] w-[calc(0.5rem+1lh)] shrink-0 rounded-full inline-flex items-center justify-center"
          title="Keyboard Shortcuts"
        >
          <QuestionMarkIcon className="w-3.5 h-3.5" />
        </DefaultBackgroundButton>
      </div>
      <ExtensionShortcutDialog isOpen={isShortcutListOpen} onClose={() => setIsShortcutListOpen(false)} />
    </div>
  );
};
