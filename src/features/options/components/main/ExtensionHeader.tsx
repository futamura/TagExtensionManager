import React, { useCallback, useRef, useState } from 'react';

import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

import { DefaultBackgroundButton } from '@/components';
import { ExtensionShortcutDialog } from '@/features/options/components/main/ExtensionShortcutDialog';
import { useBackup, useShortcutListKey } from '@/hooks';

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
        <DefaultBackgroundButton navigable onClick={openShortcutList} className="w-8 py-1 rounded-full" title="Keyboard Shortcuts">
          <span className="text-sm font-bold">?</span>
        </DefaultBackgroundButton>
      </div>
      <ExtensionShortcutDialog isOpen={isShortcutListOpen} onClose={() => setIsShortcutListOpen(false)} />
    </div>
  );
};
