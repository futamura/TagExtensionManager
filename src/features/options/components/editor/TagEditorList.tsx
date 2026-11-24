import React from 'react';

import { useTagEditorContext } from '@/contexts';
import { TagEditorListItem } from '@/features/options/components/editor';

export const TagEditorList: React.FC = () => {
  const { sortedTags } = useTagEditorContext();

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4" data-nav-scroll-container>
      <div className="flex flex-wrap gap-2">
        {sortedTags.map((tag, index) => (
          <TagEditorListItem key={tag.id} tag={tag} index={index} />
        ))}
      </div>
    </div>
  );
};
