import { TagsIcon, ToggleLeftIcon, ToggleRightIcon } from 'lucide-react';

import React from 'react';

import { DefaultBackgroundButton } from '@/components';
import { useExtensionContext } from '@/contexts';

/**
 * The ExtensionTagMetrics component.
 *
 * @returns The ExtensionTagMetrics component.
 */
export const ExtensionTagMetrics: React.FC = () => {
  /**
   * The extensions context.
   */
  const { allExtensions, setVisibleTagId } = useExtensionContext();

  /**
   * The total number of extensions.
   */
  const total = allExtensions.length;

  /**
   * The number of enabled extensions.
   */
  const enabled = allExtensions.filter(ext => ext.enabled).length;

  /**
   * The number of disabled extensions.
   */
  const disabled = total - enabled;

  /**
   * The ExtensionTagMetrics component.
   *
   * @returns The ExtensionTagMetrics component.
   */
  return (
    <div className="flex flex-row w-auto gap-[1px]">
      <DefaultBackgroundButton
        navigable
        className="flex-1 inline-flex items-center pl-3 pr-2 py-1 rounded-s-full text-sm"
        onClick={() => setVisibleTagId(null)}
      >
        <TagsIcon className="w-4 h-4 mr-1" strokeWidth={1} />
        <span className="text-sm mr-1">Total</span>
        <span className="text-sm text-blue-600 dark:text-blue-400">{total}</span>
      </DefaultBackgroundButton>
      <DefaultBackgroundButton
        navigable
        className="flex-1 inline-flex items-center pl-3 pr-2 py-1 rounded-none text-sm"
        onClick={() => setVisibleTagId('enabled')}
      >
        <ToggleRightIcon className="w-4 h-4 mr-1" strokeWidth={1} />
        <span className="text-sm mr-1">Enabled</span>
        <span className="text-sm text-green-600 dark:text-green-400">{enabled}</span>
      </DefaultBackgroundButton>
      <DefaultBackgroundButton
        navigable
        className="flex-1 inline-flex items-center pl-2 pr-3 py-1 rounded-r-full text-sm"
        onClick={() => setVisibleTagId('disabled')}
      >
        <ToggleLeftIcon className="w-4 h-4 mr-1" strokeWidth={1} />
        <span className="text-sm mr-1">Disabled</span>
        <span className="text-sm text-red-600 dark:text-red-400">{disabled}</span>
      </DefaultBackgroundButton>
    </div>
  );
};
