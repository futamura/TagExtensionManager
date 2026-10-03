import React from 'react';

interface DefaultBackgroundButtonProps {
  className?: string;
  title?: string;
  onClick: () => void;
  children?: React.ReactNode;
}

export const DefaultBackgroundButton: React.FC<DefaultBackgroundButtonProps> = ({ className, title, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 focus:outline-hidden transition-colors ${className}`}
    >
      {children}
    </button>
  );
};

interface DefaultBackgroundDivProps {
  className?: string;
  children?: React.ReactNode;
}

export const DefaultBackgroundDiv: React.FC<DefaultBackgroundDivProps> = ({ className, children }) => {
  return (
    <div className={`bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 focus:outline-hidden transition-colors ${className}`}>
      {children}
    </div>
  );
};

interface XLargeButtonComponentProps {
  className?: string;
  onClick: () => void;
  children?: React.ReactNode;
}

export const XLargeButtonComponent: React.FC<XLargeButtonComponentProps> = ({
  className = 'bg-zinc-600 dark:bg-zinc-500 hover:bg-zinc-300 dark:hover:bg-zinc-600',
  onClick,
  children,
}) => {
  return (
    <button onClick={onClick} className={`h-10 px-3 py-2 text-lg font-medium rounded-full text-zinc-100 focus:outline-hidden transition-colors ${className}`}>
      {children}
    </button>
  );
};

export const AddButtonComponent: React.FC<XLargeButtonComponentProps> = ({ onClick }) => {
  return (
    <XLargeButtonComponent className="bg-zinc-600 dark:bg-zinc-500 hover:bg-zinc-300 dark:hover:bg-zinc-600" onClick={onClick}>
      Add
    </XLargeButtonComponent>
  );
};

export const DeleteButtonComponent: React.FC<XLargeButtonComponentProps> = ({ onClick }) => {
  return (
    <XLargeButtonComponent className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500" onClick={onClick}>
      Delete
    </XLargeButtonComponent>
  );
};

export const CancelButtonComponent: React.FC<XLargeButtonComponentProps> = ({ onClick }) => {
  return (
    <XLargeButtonComponent className="bg-zinc-400 dark:bg-zinc-600 hover:bg-zinc-500 dark:hover:bg-zinc-500" onClick={onClick}>
      Cancel
    </XLargeButtonComponent>
  );
};
