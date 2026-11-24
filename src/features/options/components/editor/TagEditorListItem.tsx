import React, { useEffect, useRef, useState } from 'react';

import { useDrag, useDrop } from 'react-dnd';

import { TagIcon, XMarkIcon } from '@heroicons/react/24/outline';

import { CancelButtonComponent, DefaultBackgroundDiv, DeleteButtonComponent, DialogHeader, DialogRoot } from '@/components';
import { useTagEditorContext } from '@/contexts';
import { TagModel } from '@/models';
import { handleNavItemKeyDown } from '@/utils';

/**
 * The props for the TagEditorListItem component.
 * @param tag - The tag data.
 * @param index - The index of the tag.
 */
interface TagEditorListItemProps {
  tag: TagModel;
  index: number;
}

/**
 * The TagEditorListItem component.
 *
 * @param tag - The tag data.
 * @param index - The index of the tag.
 */
export const TagEditorListItem: React.FC<TagEditorListItemProps> = React.memo(({ tag, index }: TagEditorListItemProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  /**
   * The data for the drag and drop operation.
   * @param id - The id of the tag.
   * @param index - The index of the tag.
   */
  interface DragData {
    id: string;
    index: number;
  }

  const { moveTag, editingTagId, editingTagName, changeTagName, deleteTag, startEditing } = useTagEditorContext();

  /**
   * The ref for the tag item.
   */
  const ref = useRef<HTMLDivElement>(null);

  /**
   * The ref for the input element.
   */
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * The name button, focused again after a rename is committed with Enter.
   */
  const nameButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * The drag and drop state.
   */
  const [{ isDragging }, drag] = useDrag({
    type: 'TAG',
    item: { id: tag.id, index },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  /**
   * The drop state.
   */
  const [, drop] = useDrop({
    accept: 'TAG',
    hover: (item: DragData, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) {
        return;
      }

      const hoverClientX = clientOffset.x - hoverBoundingRect.left;

      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
        return;
      }

      moveTag(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  /**
   * The drag and drop element.
   */
  drag(drop(ref));

  /**
   * The use effect for the tag item.
   */
  useEffect(() => {
    if (editingTagId === tag.id && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTagId]);

  /**
   * Whether the name button should take focus once the rename input closes.
   * Set only when the rename is committed with Enter, so a blur commit does not pull focus back.
   */
  const restoreFocusRef = useRef(false);

  /**
   * Focus the name button again after a rename committed with Enter.
   */
  useEffect(() => {
    if (editingTagId === tag.id || !restoreFocusRef.current) return;
    restoreFocusRef.current = false;
    nameButtonRef.current?.focus();
  }, [editingTagId]);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  /**
   * Pick where focus goes after this tag is deleted: the next tag's name button,
   * else the previous one, else the dialog's search input.
   *
   * @returns The element to focus, or null when none is found.
   */
  const findFocusTargetAfterDelete = (): HTMLElement | null => {
    const dialog = ref.current?.closest<HTMLElement>('[role="dialog"]');
    if (!dialog) return null;

    const nameButtons = Array.from(dialog.querySelectorAll<HTMLElement>('[data-tag-name-button]'));
    const index = nameButtonRef.current ? nameButtons.indexOf(nameButtonRef.current) : -1;
    const neighbor = index === -1 ? null : (nameButtons[index + 1] ?? nameButtons[index - 1] ?? null);
    return neighbor ?? dialog.querySelector<HTMLElement>('input[data-nav-item]');
  };

  const handleConfirmDelete = () => {
    const focusTarget = findFocusTargetAfterDelete();
    deleteTag(tag.id);
    setIsDeleteDialogOpen(false);
    /** Wait for the deleted item (and its confirm dialog) to unmount before moving focus */
    requestAnimationFrame(() => focusTarget?.focus());
  };

  /**
   * The tag item.
   */
  return (
    <>
      <div ref={ref} className={`relative group transition-all duration-200 ${isDragging ? 'opacity-50 scale-95' : ''}`} style={{ width: 'fit-content' }}>
        <DefaultBackgroundDiv className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium">
          <div className="cursor-grab active:cursor-grabbing touch-none select-none">
            <TagIcon className="w-3 h-3" />
          </div>
          <div>
            {editingTagId === tag.id ? (
              <input
                ref={inputRef}
                type="text"
                value={editingTagName}
                onChange={e => changeTagName(tag.id, e.target.value, false)}
                onBlur={() => changeTagName(tag.id, editingTagName, true)}
                onKeyDown={e => {
                  /** Enter that confirms an IME conversion must not commit the rename */
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    restoreFocusRef.current = true;
                    changeTagName(tag.id, editingTagName, true);
                  }
                }}
                size={Math.max(editingTagName.length, 1)}
                className="rounded-xs pl-1 bg-zinc-100 dark:bg-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-500 focus:outline-hidden transition-colors"
              />
            ) : (
              <button
                ref={nameButtonRef}
                onClick={() => startEditing(tag.id, tag.name)}
                data-nav-item
                data-tag-name-button
                onKeyDown={handleNavItemKeyDown}
                className="select-none"
              >
                {tag.name}
              </button>
            )}
          </div>
          <button
            onClick={handleDeleteClick}
            data-nav-item
            onKeyDown={handleNavItemKeyDown}
            className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-300"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </DefaultBackgroundDiv>
      </div>

      <DialogRoot isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <div className="flex flex-col gap-4">
          <DialogHeader title="Delete Tag" />
          <div className="flex ">Are you sure to delete "{tag.name}"? This action cannot be undone.</div>
          <div className="flex justify-end gap-2">
            <CancelButtonComponent onClick={() => setIsDeleteDialogOpen(false)} />
            <DeleteButtonComponent onClick={handleConfirmDelete} />
          </div>
        </div>
      </DialogRoot>
    </>
  );
});

TagEditorListItem.displayName = 'TagEditorListItem';
