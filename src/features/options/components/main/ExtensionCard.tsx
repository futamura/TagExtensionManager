import React, { useEffect, useRef, useState } from 'react';

import { Switch } from '@headlessui/react';
import { LockClosedIcon } from '@heroicons/react/24/outline';

import { useExtensionContext } from '@/contexts';
import { ExtensionCardMenu } from '@/features/options/components/main';
import { ExtensionModel } from '@/models';

/**
 * Extension card props.
 *
 * @param extension - The extension to display.
 * @param onToggle - The callback to toggle the extension.
 * @param onSettingsClick - The callback to open the settings page.
 */

interface ExtensionCardProps {
  extension: ExtensionModel;
}

/**
 * Extension card component.
 *
 * @param extension - The extension to display.
 * @param onToggle - The callback to toggle the extension.
 * @param onLockToggle - The callback to lock the extension.
 * @returns The extension card component.
 */
export const ExtensionCard: React.FC<ExtensionCardProps> = ({ extension }) => {
  /**
   * The hovered state.
   */
  const [isHovered, setIsHovered] = useState(false);
  /**
   * The has options page state.
   */
  const [hasOptionsPage, setHasOptionsPage] = useState(false);
  /**
   * The use extensions hook.
   */
  const { toggleEnabled, openOptionsPage } = useExtensionContext();
  /**
   * The button ref.
   */
  const buttonRef = useRef<HTMLButtonElement>(null);

  /**
   * Check if extension has options page on mount.
   */
  useEffect(() => {
    const checkOptionsPage = async () => {
      setHasOptionsPage(!!extension.optionsUrl);
    };
    checkOptionsPage();
  }, [extension.id]);

  /**
   * Handle card click to open the extension.
   */
  const handleCardClick = async () => {
    if (!extension.enabled || !hasOptionsPage) return;

    await openOptionsPage(extension.id);
  };

  /**
   * Handle mouse enter on controls.
   *
   * @param e - The mouse event.
   */
  const handleControlsMouseEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHovered(false);
  };

  /**
   * Handle mouse leave on controls.
   *
   * @param e - The mouse event.
   */
  const handleControlsMouseLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHovered(true);
  };

  /**
   * Handle controls click to prevent event propagation.
   *
   * @param e - The mouse event.
   */
  const handleControlsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  /**
   * Render the extension card.
   * @returns
   */
  return (
    <div
      className={`rounded-xl px-3 py-2 ${extension.enabled && hasOptionsPage ? 'cursor-pointer' : ''} ${
        isHovered && extension.enabled && hasOptionsPage ? 'bg-zinc-50 dark:bg-zinc-600' : 'bg-white dark:bg-zinc-700'
      } transition-colors`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2">
        <img src={extension.iconUrl} alt={extension.name} className={`w-6 h-6 rounded-sm transition-opacity ${!extension.enabled ? 'opacity-30' : ''}`} />
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm select-none font-medium truncate transition-opacity ${!extension.enabled ? 'opacity-30' : ''}`}>{extension.name}</h3>
          <p className={`text-xs text-zinc-500 dark:text-zinc-400 select-none transition-opacity ${!extension.enabled ? 'opacity-50' : ''}`}>
            {extension.version}
          </p>
        </div>
        <div
          className="flex items-center space-x-2"
          onMouseEnter={handleControlsMouseEnter}
          onMouseLeave={handleControlsMouseLeave}
          onClick={handleControlsClick}
        >
          {extension.locked && <LockClosedIcon className="w-3 h-3" />}
          <Switch
            checked={extension.enabled}
            onChange={async checked => toggleEnabled(extension.id, checked)}
            disabled={extension.locked}
            className={`${extension.enabled ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-600'} relative inline-flex h-4 w-7 items-center rounded-full focus:outline-hidden transition-opacity ${
              extension.locked ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span
              className={`${extension.enabled ? 'translate-x-4' : 'translate-x-0.5'} inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <div className="relative">
            <ExtensionCardMenu extension={extension} buttonRef={buttonRef} />
          </div>
        </div>
      </div>
    </div>
  );
};
