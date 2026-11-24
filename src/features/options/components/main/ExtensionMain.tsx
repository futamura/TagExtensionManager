import React from 'react';

import { useExtensionContext } from '@/contexts';
import { ExtensionHeader, ExtensionList, ExtensionSearchBar, ExtensionTagList } from '@/features/options/components/main';
import { TagSelectorMain } from '@/features/options/components/selector';

/**
 * Simple loading spinner component
 */
const Spinner: React.FC = () => (
  <div className="h-full w-full flex items-center justify-center">
    <div
      className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-zinc-500"
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
    </div>
  </div>
);

/**
 * The component for managing extensions.
 * @returns
 */
export const ExtensionMain: React.FC = () => {
  const { isLoading, tagSelectorExtension, isTagSelectorOpen, closeTagSelector } = useExtensionContext();

  /**
   * The main component.
   * @returns
   */
  if (isLoading) {
    return (
      <main className="h-screen flex flex-col overflow-hidden">
        <Spinner />
      </main>
    );
  }
  return (
    <main className="h-screen flex flex-col overflow-hidden">
      <div className="container mx-auto max-w-6xl px-2 flex flex-col h-full gap-3">
        <div className="flex flex-col gap-3 px-4 pt-4 pb-0">
          <ExtensionHeader />
          <ExtensionTagList />
          <ExtensionSearchBar />
        </div>

        <div className="flex-1 overflow-y-auto" data-nav-scroll-container>
          <div className="h-full">
            <ExtensionList />
          </div>
        </div>
      </div>

      {/*
       * Rendered here instead of inside ExtensionCard so the dialog survives
       * card unmounts caused by list regrouping when tags are toggled.
       */}
      {tagSelectorExtension && <TagSelectorMain extension={tagSelectorExtension} isOpen={isTagSelectorOpen} onClose={closeTagSelector} />}
    </main>
  );
};
