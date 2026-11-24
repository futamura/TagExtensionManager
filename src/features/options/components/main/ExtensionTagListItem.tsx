import React from 'react';

import { TagIcon } from '@heroicons/react/24/outline';

import { DefaultBackgroundButton } from '@/components';
import { useExtensionContext } from '@/contexts';
import { TagModel } from '@/models';
import { useTagStore } from '@/stores';

/**
 * The props for the ExtensionTagListItem component.
 *
 * @param tag - The tag to display.
 * @param extensionCount - The number of extensions with the tag.
 */
interface ExtensionTagListItemProps {
  tag: TagModel;
}

/**
 * The ExtensionTagListItem component.
 *
 * @param tag - The tag to display.
 * @param extensionCount - The number of extensions with the tag.
 * @returns The ExtensionTagListItem component.
 */
export const ExtensionTagListItem: React.FC<ExtensionTagListItemProps> = ({ tag }: ExtensionTagListItemProps) => {
  /**
   * The tag store.
   */
  const { extensionTags } = useTagStore();
  const { untaggedExtensions, visibleTagId, setVisibleTagId } = useExtensionContext();

  /**
   * The count of extensions with the tag.
   */
  const count = tag.id === 'untagged' ? (untaggedExtensions.length ?? 0) : extensionTags.filter(extTag => extTag.tagIds.includes(tag.id)).length;
  const isSelected = visibleTagId === tag.id;

  /**
   * The ExtensionTagListItem component.
   *
   * @returns The ExtensionTagListItem component.
   */
  return (
    <DefaultBackgroundButton
      navigable
      onClick={() => setVisibleTagId(isSelected ? null : tag.id)}
      className={`flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full transition-opacity ${isSelected ? '' : visibleTagId === null ? '' : 'opacity-50'}`}
    >
      <TagIcon className="w-3 h-3" />
      <span className="text-sm">{tag.name}</span>
      <span className="text-sm text-zinc-400 dark:text-zinc-500">{count}</span>
    </DefaultBackgroundButton>
  );
};
