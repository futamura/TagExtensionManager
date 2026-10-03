import React, { ChangeEventHandler, KeyboardEventHandler } from 'react';

interface SearchBarComponentProps {
  inputRef?: React.RefObject<HTMLInputElement>;
  id?: string;
  value: string;
  placeholder: string;
  onInputChange: ChangeEventHandler<HTMLInputElement>;
  onInputKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  icon: React.ReactNode;
  buttons?: React.ReactNode;
}

export const SearchBarComponent: React.FC<SearchBarComponentProps> = ({ inputRef, id, value, placeholder, icon, onInputChange, onInputKeyDown, buttons }) => {
  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">{icon}</div>
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={value}
            placeholder={placeholder}
            onChange={onInputChange}
            onKeyDown={onInputKeyDown}
            className="w-full h-10 pl-10 pr-3 py-1.5 rounded-full bg-white dark:bg-zinc-700 focus:outline-hidden focus:ring-1 focus:ring-zinc-200 dark:focus:ring-zinc-500"
          />
        </div>
        {buttons}
      </div>
    </div>
  );
};
