import React from 'react';

import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react';
import { Menu, MenuButton, MenuItems, Transition } from '@headlessui/react';
import { ArchiveBoxXMarkIcon, Cog6ToothIcon, EllipsisVerticalIcon, LockClosedIcon, LockOpenIcon, TagIcon } from '@heroicons/react/24/outline';

import { MenuItemComponent } from '@/components';
import { useExtensionContext } from '@/contexts';
import { ExtensionModel } from '@/models';
import { useExtensionStore } from '@/stores';

/**
 * Extension menu props.
 *
 * @param buttonRef - The button ref.
 * @param onUninstallClick - The callback to open the uninstall confirmation dialog.
 */
interface ExtensionCardMenuProps {
  extension: ExtensionModel;
  buttonRef: React.RefObject<HTMLButtonElement>;
  onUninstallClick: () => void;
}

/**
 * Extension card menu component.
 *
 * @param buttonRef - The button ref.
 * @param extensionName - The name of the extension.
 * @param isLocked - Whether the extension is locked.
 * @returns The extension card menu component.
 */
export const ExtensionCardMenu: React.FC<ExtensionCardMenuProps> = ({ extension, buttonRef, onUninstallClick }) => {
  /**
   * The use extension store.
   */
  const { openExtensionPage, openTagSelector } = useExtensionContext();

  /**
   * The toggle lock function.
   */
  const { toggleLock } = useExtensionStore();

  /**
   * The use floating hook.
   */
  const { refs, floatingStyles } = useFloating({
    elements: {
      reference: buttonRef.current,
    },
    middleware: [offset(4), flip(), shift()],
    whileElementsMounted: autoUpdate,
    placement: 'bottom-end',
    strategy: 'fixed',
  });

  /**
   * The handle lock toggle.
   *
   * @param close - The close callback.
   */
  const handleLockToggle = (close: () => void) => {
    toggleLock(extension.id, !extension.locked);
    close();
  };

  /**
   * The extension card menu component.
   *
   * @returns The extension card menu component.
   */
  return (
    <Menu>
      {({ close }) => (
        <>
          <MenuButton
            ref={buttonRef}
            tabIndex={-1}
            className="p-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg focus:outline-hidden transition-colors"
          >
            <EllipsisVerticalIcon className="w-5 h-5" />
          </MenuButton>

          <div ref={refs.setFloating} style={floatingStyles} className="w-36 z-[100]">
            <Transition
              enter="transition duration-200 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-100 ease-in"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <MenuItems className="bg-zinc-50 dark:bg-zinc-700 rounded-lg shadow-xl shadow-zinc-300 dark:shadow-zinc-900 focus:outline-hidden ring-1 ring-black/5">
                <div className="py-1">
                  <MenuItemComponent onClick={() => openTagSelector(extension)}>
                    <TagIcon className="w-4 h-4" />
                    Manage Tags
                  </MenuItemComponent>
                  <MenuItemComponent onClick={() => handleLockToggle(close)}>
                    {extension.locked ? (
                      <>
                        <LockOpenIcon className="w-4 h-4" />
                        Unlock Extension
                      </>
                    ) : (
                      <>
                        <LockClosedIcon className="w-4 h-4" />
                        Lock Extension
                      </>
                    )}
                  </MenuItemComponent>
                  <MenuItemComponent onClick={() => openExtensionPage(extension.id)}>
                    <Cog6ToothIcon className="w-4 h-4" />
                    View Details
                  </MenuItemComponent>
                  <MenuItemComponent className="!text-red-600 dark:!text-red-400" onClick={onUninstallClick}>
                    <ArchiveBoxXMarkIcon className="w-4 h-4" />
                    Uninstall Extension
                  </MenuItemComponent>
                </div>
              </MenuItems>
            </Transition>
          </div>
        </>
      )}
    </Menu>
  );
};
