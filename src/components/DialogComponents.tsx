import React, { Fragment } from 'react';

import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface DialogRootProps {
  isOpen: boolean;
  onClose: () => void;
  width?: 'max-w-sm' | 'max-w-md' | 'max-w-lg';
  children: React.ReactNode;
}

export const DialogRoot: React.FC<DialogRootProps> = ({ isOpen, onClose, width = 'max-w-md', children }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xs" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel
                className={`w-full ${width} transform overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 p-6 shadow-xl shadow-zinc-300 dark:shadow-zinc-900 transition-all`}
              >
                {children}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

interface DialogHeaderProps {
  title: string;
  onClose?: () => void;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ title, onClose }) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold">{title}</h2>
      {onClose && (
        <button onClick={onClose} className="dialog-close-button">
          <XMarkIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};
