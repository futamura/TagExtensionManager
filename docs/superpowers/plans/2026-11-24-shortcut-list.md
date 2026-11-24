# Keyboard Shortcut List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Keyboard Shortcuts" dialog opened by the `?` key or a round `?` button in the header.

**Architecture:** `ExtensionHeader` owns the open state, renders the `?` button and the new `ExtensionShortcutDialog` (built on `DialogRoot` / `DialogHeader`). A hook `useShortcutListKey` listens for `?` on `document` with the same guards as the `/` handler in `ExtensionSearchBar.tsx`.

**Tech Stack:** TypeScript, React 18, Tailwind CSS v4, Headless UI, pnpm.

**Spec:** `docs/superpowers/specs/2026-11-24-shortcut-list-design.md`

## Global Constraints

- No dependency or tool version changes. Use pnpm.
- Source comments in English, always `/** */` block comments (even single line).
- No test suite: verification is `pnpm type-check`, `pnpm eslint-check`, `pnpm prettier-check`, `pnpm build`, plus manual check by the user in Brave (`pnpm start` → `dist/dev`, side panel and options page).
- Commit messages in English, Conventional Commits, suffix `(FUT-516)`, no AI signature, no Co-Authored-By.
- Look is fixed by the spec's "Panel" and "Header button" sections; no other UI changes.

## Review Focus

1. `?` typed in the main search field or a tag dialog input must insert `?` and not open the panel.
2. `?` while Select Tags / Edit Tags / the delete confirmation is open must do nothing.
3. `?` during IME composition (Japanese input) must do nothing.
4. `/` must still focus the search field, and `Shift+/` must not also focus it.
5. Closing the panel (Esc / ✕) must return focus to the element that had it (header button, or the card / search field when opened with `?`), and arrow navigation must work again afterwards.

These are checked manually in Task 3 (no test runner exists).

---

### Task 1: Shortcut dialog and header button

**Files:**
- Create: `src/features/options/components/main/ExtensionShortcutDialog.tsx`
- Modify: `src/features/options/components/main/ExtensionHeader.tsx`
- Modify: `src/features/options/components/main/index.ts` (export the dialog)

**Interfaces:**
- Produces: `export const ExtensionShortcutDialog: React.FC<{ isOpen: boolean; onClose: () => void }>`
- `ExtensionHeader` holds `const [isShortcutListOpen, setIsShortcutListOpen] = useState(false)`; Task 2 wires the hook to `() => setIsShortcutListOpen(true)`.

- [ ] **Step 1: Create `ExtensionShortcutDialog`**

`DialogRoot isOpen onClose` (default width) → `DialogHeader title="Keyboard Shortcuts" onClose={onClose}` → sections. Row data is a module constant (exact copy from the spec):

```ts
const SHORTCUT_SECTIONS: { title: string; rows: { label: string; keys: string[] }[] }[] = [
  { title: 'Anywhere', rows: [{ label: 'Show this list', keys: ['?'] }, { label: 'Focus the search field', keys: ['/'] }] },
  { title: 'Moving around', rows: [
    { label: 'Previous / next item', keys: ['←', '→'] },
    { label: 'Item above / below', keys: ['↑', '↓'] },
    { label: 'Back to the search field', keys: ['Esc'] },
  ] },
  { title: 'Extension card', rows: [
    { label: 'Enable / disable', keys: ['Space'] },
    { label: 'Open options page', keys: ['Enter'] },
    { label: 'Open menu', keys: ['M'] },
  ] },
  { title: 'Tag dialogs', rows: [
    { label: 'Move between items', keys: ['←', '→', '↑', '↓'] },
    { label: 'Toggle / rename a tag', keys: ['Space', 'Enter'] },
    { label: 'Close the dialog', keys: ['Esc'] },
  ] },
];
```

Styling (spec "Look"): section heading `text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400`; row `flex items-center justify-between gap-2 text-base py-0.5`; key cap `<kbd>` with `bg-zinc-200 dark:bg-zinc-700 rounded-sm px-1.5 min-w-5 text-center font-sans`. Use `<dl>`-free plain markup; key caps grouped in a `flex gap-1 shrink-0` span.

- [ ] **Step 2: Add the `?` button and dialog to `ExtensionHeader`**

After the hidden file input: `DefaultBackgroundButton navigable title="Keyboard Shortcuts" onClick={() => setIsShortcutListOpen(true)}` with a bold `?` and round shape sized to match the Export / Import pill height (e.g. `w-5 h-5 rounded-full text-sm font-bold inline-flex items-center justify-center`; adjust after the visual check). Render `<ExtensionShortcutDialog isOpen={isShortcutListOpen} onClose={() => setIsShortcutListOpen(false)} />`.

- [ ] **Step 3: Verify**

Run: `pnpm type-check && pnpm eslint-check && pnpm prettier-check`
Expected: all exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/features/options/components/main/ExtensionShortcutDialog.tsx src/features/options/components/main/ExtensionHeader.tsx src/features/options/components/main/index.ts
git commit -m "feat: add a keyboard shortcut list dialog to the header (FUT-516)"
```

### Task 2: `?` key opens the dialog

**Files:**
- Create: `src/hooks/useShortcutListKey.ts`
- Modify: `src/hooks/index.ts` (export)
- Modify: `src/features/options/components/main/ExtensionHeader.tsx` (call the hook)

**Interfaces:**
- Consumes: `isDialogOpen` from `@/utils`; `setIsShortcutListOpen` from Task 1.
- Produces: `export const useShortcutListKey = (onOpen: () => void): void`

- [ ] **Step 1: Implement `useShortcutListKey(onOpen)`**

`useEffect` adds a `document` `keydown` listener (removed on cleanup, re-subscribed when `onOpen` changes). Ignore when: `e.key !== '?'`, `e.ctrlKey || e.metaKey || e.altKey`, `e.isComposing`, `e.repeat`, `isDialogOpen()`, or the target is contenteditable / `INPUT` / `TEXTAREA` / `SELECT` (same check as `handleSlash` in `ExtensionSearchBar.tsx`). Otherwise `e.preventDefault()` and `onOpen()`. Shift is allowed.

- [ ] **Step 2: Call it in `ExtensionHeader`**

`useShortcutListKey(openShortcutList)` where `openShortcutList` is a `useCallback(() => setIsShortcutListOpen(true), [])`, shared with the button's `onClick`.

- [ ] **Step 3: Verify**

Run: `pnpm type-check && pnpm eslint-check && pnpm prettier-check`
Expected: all exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useShortcutListKey.ts src/hooks/index.ts src/features/options/components/main/ExtensionHeader.tsx
git commit -m "feat: open the shortcut list with the ? key (FUT-516)"
```

### Task 3: Build and manual check

- [ ] **Step 1: Build**

Run: `pnpm build`, then `pnpm start`
Expected: both succeed; `dist/dev` updated.

- [ ] **Step 2: Manual check by the user in Brave (side panel and options page)**

- Header `?` button looks like the mockup (round, same color as Export / Import), reachable with arrow keys, opens the panel.
- Panel matches the mockup in light and dark, no scroll in the side panel at normal height.
- The five Review Focus items above.
- Every listed key works as described.

- [ ] **Step 3: Fix and commit any findings** (one `fix:` commit per issue, suffix `(FUT-516)`).
