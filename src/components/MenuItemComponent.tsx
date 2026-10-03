import React from 'react';

import { MenuItem } from '@headlessui/react';

interface MenuItemComponentProps {
  className?: string;
  onClick: () => void;
  children: React.ReactNode;
}

export const MenuItemComponent: React.FC<MenuItemComponentProps> = ({ className = '', onClick, children }) => {
  return (
    <MenuItem>
      <button
        onClick={onClick}
        className={`block w-full text-left px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-600 focus:outline-hidden transition-colors ${className}`}
      >
        <span className="flex items-center gap-2">{children}</span>
      </button>
    </MenuItem>
  );
};
