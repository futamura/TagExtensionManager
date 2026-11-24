import { ToggleLeftIcon, ToggleRightIcon } from 'lucide-react';

import React from 'react';

import { DefaultBackgroundButton } from '@/components';
import { useExtensionContext } from '@/contexts';
import { useBulkToggle } from '@/hooks';

/**
 * The ExtensionToggleAllButtons component.
 * Bulk enable/disable buttons that target every extension regardless of tags.
 *
 * @returns The ExtensionToggleAllButtons component.
 */
export const ExtensionToggleAllButtons: React.FC = () => {
  /**
   * The extensions context.
   */
  const { allExtensions } = useExtensionContext();

  /**
   * The bulk toggle hook.
   */
  const { bulkToggle } = useBulkToggle();

  /**
   * The ExtensionToggleAllButtons component.
   *
   * @returns The ExtensionToggleAllButtons component.
   */
  return (
    /**
     * Segmented pill pair. Both halves share one capsule with a 1px seam and
     * fold to the next line together on narrow layouts.
     */
    <div className="flex">
      <DefaultBackgroundButton
        navigable
        className="inline-flex items-center gap-1 ps-3 pe-2 py-1 text-sm rounded-l-full mr-[1px]"
        onClick={() => bulkToggle(allExtensions, true)}
      >
        <ToggleRightIcon className="w-4 h-4" strokeWidth={1} />
        <span className="text-sm">Enable All</span>
      </DefaultBackgroundButton>
      <DefaultBackgroundButton
        navigable
        className="inline-flex items-center gap-1 ps-2 pe-3 py-1 text-sm rounded-r-full"
        onClick={() => bulkToggle(allExtensions, false)}
      >
        <ToggleLeftIcon className="w-4 h-4" strokeWidth={1} />
        <span className="text-sm">Disable All</span>
      </DefaultBackgroundButton>
    </div>
  );
};
