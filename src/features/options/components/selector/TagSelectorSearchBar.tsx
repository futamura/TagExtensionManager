import React, { useEffect, useRef } from 'react';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import { SearchBarComponent } from '@/components';
import { useTagSelectorContext } from '@/contexts';
import { handleNavInputKeyDown } from '@/utils';

/**
 * The TagSelectorSearchBar component.
 *
 * @returns The TagSelectorSearchBar component.
 */
export const TagSelectorSearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useTagSelectorContext();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchInputRef.current) return;
    searchInputRef.current?.focus();
  }, [searchInputRef]);

  return (
    <SearchBarComponent
      inputRef={searchInputRef}
      value={searchQuery}
      placeholder="Search tags..."
      onInputChange={e => setSearchQuery(e.target.value)}
      onInputKeyDown={handleNavInputKeyDown}
      navItem
      icon={<MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />}
    />
  );
};
