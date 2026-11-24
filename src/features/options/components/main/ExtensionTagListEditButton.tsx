import { PencilIcon } from 'lucide-react';

import React, { useState } from 'react';

import { DefaultBackgroundButton } from '@/components';
import { TagEditorMain } from '@/features/options/components/editor';

/**
 * The ExtensionTagListEditButton component.
 *
 * @returns The ExtensionTagListEditButton component.
 */
export const ExtensionTagListEditButton: React.FC = () => {
  const [isTagEditorOpen, setIsTagEditorOpen] = useState(false);

  /**
   * The ExtensionTagListEditButton component.
   *
   * @returns The ExtensionTagListEditButton component.
   */
  return (
    <>
      <DefaultBackgroundButton navigable onClick={() => setIsTagEditorOpen(true)} className="px-3 py-1 text-sm font-medium rounded-full">
        <PencilIcon className="w-3 h-3 inline-flex mr-1" strokeWidth={1} />
        <span className="">Edit Tags</span>
      </DefaultBackgroundButton>
      <TagEditorMain isOpen={isTagEditorOpen} onClose={() => setIsTagEditorOpen(false)} />
    </>
  );
};
