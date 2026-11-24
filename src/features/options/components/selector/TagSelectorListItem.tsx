import React from 'react';

import { TagIcon } from '@heroicons/react/24/outline';
import { TagIcon as TagSolidIcon } from '@heroicons/react/24/solid';

import { DefaultBackgroundButton } from '@/components';
import { useTagSelectorContext } from '@/contexts';
import { TagModel } from '@/models';

interface TagSelectorListItemProps {
  tag: TagModel;
}

export const TagSelectorListItem: React.FC<TagSelectorListItemProps> = ({ tag }) => {
  const { currentTagIds, selectTag } = useTagSelectorContext();
  return (
    <DefaultBackgroundButton
      navigable
      onClick={() => selectTag(tag.id)}
      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-opacity ${
        currentTagIds.includes(tag.id) ? '' : 'opacity-50 hover:opacity-100'
      } flex items-center gap-1`}
    >
      {currentTagIds.includes(tag.id) ? <TagSolidIcon className="w-3 h-3" /> : <TagIcon className="w-3 h-3" />}
      <span className="">{tag.name}</span>
    </DefaultBackgroundButton>
  );
};
