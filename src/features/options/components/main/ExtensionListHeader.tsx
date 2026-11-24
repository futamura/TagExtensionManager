import React from 'react';

import { DefaultBackgroundButton } from '@/components';
import { useBulkToggle } from '@/hooks';
import { ExtensionModel, TagModel } from '@/models';

/**
 * The props for the ExtensionListHeader component.
 *
 * @param tag - The tag to display.
 * @param extensions - The extensions to display.
 * @param extensionCount - The number of extensions.
 */
interface ExtensionListHeaderProps {
  tag: TagModel;
  extensions: ExtensionModel[];
}

/**
 * The ExtensionListHeader component.
 *
 * @param tag - The tag to display.
 * @param extensions - The extensions to display.
 * @returns The ExtensionListHeader component.
 */
export const ExtensionListHeader: React.FC<ExtensionListHeaderProps> = ({
  tag,
  extensions,
  // onToggle,
}: ExtensionListHeaderProps) => {
  /**
   * The bulk toggle hook.
   */
  const { bulkToggle } = useBulkToggle();

  /**
   * The ExtensionListHeader component.
   *
   * @returns The ExtensionListHeader component.
   */
  return (
    <div className="flex items-center justify-between p-1">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold">{tag.name}</h3>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex">
          <DefaultBackgroundButton
            navigable
            onClick={() => bulkToggle(extensions, true)}
            className={`ps-3 pe-2 py-1 text-sm font-medium rounded-l-full mr-[1px]`}
          >
            Enable
          </DefaultBackgroundButton>
          <DefaultBackgroundButton navigable onClick={() => bulkToggle(extensions, false)} className={`ps-2 pe-3 py-1 text-sm font-medium rounded-r-full`}>
            Disable
          </DefaultBackgroundButton>
        </div>
      </div>
    </div>
  );
};
