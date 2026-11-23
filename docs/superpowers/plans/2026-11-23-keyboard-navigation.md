# Keyboard Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the user filter, pick, toggle and open extensions with the keyboard only, with a visible keyboard focus ring.

**Architecture:** Each `ExtensionCard` root becomes a single focusable element (`tabIndex=0`, `data-extension-card`). A pure DOM utility finds the adjacent card (list order for `←`/`→`, rendered position for `↑`/`↓`), and a hook turns card key presses into actions. The search bar owns `↓` (to the first card) and the global `/` shortcut.

**Tech Stack:** React 18, TypeScript 5, Tailwind CSS 4.3, Headless UI 2.2 (`Switch`, `Menu`, `Dialog`).

**Spec:** `docs/superpowers/specs/2026-11-23-keyboard-navigation-design.md`

## Global Constraints

- No test suite exists. Verification = `pnpm type-check`, `pnpm eslint-check`, `pnpm prettier-check`, `pnpm build`, plus manual checks in Brave with `dist/dev`.
- Code comments in English, block style (`/** */`) even for one line.
- Do not change dependencies or tool versions.
- Mouse-only appearance must not change: focus styling uses `focus-visible` only.
- Focus ring: `ring-2`, `zinc-400` in light mode, `zinc-500` in dark mode.
- Do not call `chrome.*` directly; use existing context functions (`toggleEnabled`, `openOptionsPage`).
- Commit messages in English, no `Co-Authored-By`, reference `FUT-508`.

## Review Focus

- Typing `/` inside any text field (tag editor add field, tag rename field) must insert `/`, not jump to search.
- While any dialog is open (tag selector, tag editor, uninstall/delete confirm), `/` and card arrow keys must do nothing.
- After the card menu or the tag selector dialog closes, focus lands back on the menu button (`tabIndex=-1`); arrow keys, `Space`, `Enter`, `M` and `Esc` must still work as if the card were focused.
- When `Space` disables a card while the `Enabled` filter is active (or enables it under `Disabled`), the card unmounts; focus must move to the card now at the same position, or to the search field if none remain.
- Pressing `↓` in the search field while a Japanese IME is composing must not move focus.

Each line is verified manually in Task 4.

---

### Task 1: Keyboard focus ring on shared controls

**Files:**

- Create: `src/constants/styles.ts`
- Modify: `src/constants/index.ts`
- Modify: `src/components/ButtonComponents.tsx` (`DefaultBackgroundButton`, `XLargeButtonComponent`)
- Modify: `src/components/MenuItemComponent.tsx`
- Modify: `src/components/DialogComponents.tsx` (`DialogHeader` close button)

**Interfaces:**

- Produces: `export const FOCUS_RING_CLASS = 'focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500';` from `@/constants`.

- [ ] **Step 1: Add `FOCUS_RING_CLASS` in `src/constants/styles.ts` and re-export it from `src/constants/index.ts`.**
- [ ] **Step 2: Append `FOCUS_RING_CLASS` to the class lists of `DefaultBackgroundButton`, `XLargeButtonComponent` and the `DialogHeader` close button.** Keep the existing `focus:outline-hidden`.
- [ ] **Step 3: In `MenuItemComponent`, add `data-[focus]:bg-zinc-200 dark:data-[focus]:bg-zinc-600` to the button.** Headless UI menu items get keyboard focus as a `data-focus` attribute, not DOM focus, so a ring would never show; reuse the existing hover colors.
- [ ] **Step 4: Run `pnpm type-check && pnpm eslint-check && pnpm prettier-check && pnpm build`.** Expected: all pass.
- [ ] **Step 5: Commit.**

```bash
git add src/constants src/components
git commit -m "feat: show keyboard focus ring on shared controls (FUT-508)"
```

### Task 2: Card focus and in-card keys

**Files:**

- Create: `src/utils/cardNavigation.ts`
- Modify: `src/utils/index.ts` (re-export)
- Create: `src/hooks/useCardKeyboardNavigation.ts`
- Modify: `src/hooks/index.ts`
- Modify: `src/features/options/components/main/ExtensionCard.tsx`
- Modify: `src/features/options/components/main/ExtensionCardMenu.tsx`

**Interfaces:**

- Consumes: `FOCUS_RING_CLASS` (Task 1).
- Produces (`src/utils/cardNavigation.ts`):
  - `export const CARD_SELECTOR = '[data-extension-card]';`
  - `export const SEARCH_INPUT_ID = 'search-input';` (same value as the existing `id` in `ExtensionSearchBar`)
  - `export const getCards = (): HTMLElement[]`: all cards in DOM order.
  - `export type CardDirection = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';`
  - `export const findAdjacentCard = (current: HTMLElement, direction: CardDirection, cards: HTMLElement[]): HTMLElement | null`
  - `export const focusSearchInput = (): void`
  - `export const isDialogOpen = (): boolean`: true when `document.querySelector('[role="dialog"]')` exists.
- Produces (`src/hooks/useCardKeyboardNavigation.ts`):
  - `export const useCardKeyboardNavigation = (actions: { onToggle: () => void | Promise<void>; onOpen: () => void | Promise<void>; onOpenMenu: () => void }) => (e: React.KeyboardEvent<HTMLElement>) => void`

- [ ] **Step 1: Implement `findAdjacentCard`.** `←`/`→`: previous/next element in `cards` (no wrap; `null` at the ends). `↑`/`↓`: use `getBoundingClientRect()`; candidates are cards whose `top` is above (for `↑`) or below (for `↓`) the current card's `top` by more than 1px; take the candidates in the nearest row (smallest vertical distance between `top`s, with a 1px tolerance), then the one with the smallest horizontal distance between centers. `null` when there are no candidates.
- [ ] **Step 2: Implement `useCardKeyboardNavigation`.** The returned handler is attached as `onKeyDownCapture` on the card root. It returns immediately when `isDialogOpen()`, when `e.nativeEvent.isComposing`, when a modifier (`ctrl`/`meta`/`alt`) is held, or when `e.target` is inside `[role="menu"]`. If `e.target` is not the card itself but a control inside it (the menu button or the switch, after mouse use or after focus restore), focus the card first, then handle the key; for handled keys call `preventDefault()` and `stopPropagation()` so the Headless UI button handlers do not also fire. Key mapping:
  - Arrow keys → `findAdjacentCard(card, key, getCards())?.focus()`
  - `' '` → `onToggle()`
  - `'Enter'` → `onOpen()`
  - `'m'` / `'M'` → `onOpenMenu()`
  - `'Escape'` → `focusSearchInput()`
- [ ] **Step 3: Wire `ExtensionCard`.** On the root `div`: `ref={cardRef}`, `tabIndex={0}`, `data-extension-card`, `aria-label={extension.name}`, `onKeyDownCapture={handleKeyDown}`, and add `focus:outline-hidden ${FOCUS_RING_CLASS}` to its classes. Set `tabIndex={-1}` on the `Switch` and on the `MenuButton` (via `ExtensionCardMenu`). Actions:
  - `onToggle`: no-op when `extension.locked`; otherwise record the card's index in `getCards()`, `await toggleEnabled(extension.id, !extension.enabled)`, then on the next `requestAnimationFrame`, if `cardRef.current` is no longer connected or no longer the active element's card, focus `getCards()[min(index, length - 1)]`, or `focusSearchInput()` when the list is empty.
  - `onOpen`: reuse `handleCardClick` (it already no-ops when disabled or without an options page).
  - `onOpenMenu`: `buttonRef.current?.click()`. If the Headless UI `MenuButton` does not open on a synthetic click, focus the button and dispatch a `keydown` `Enter` instead; record which one worked in the commit message body.
- [ ] **Step 4: Run `pnpm type-check && pnpm eslint-check && pnpm prettier-check && pnpm build`.** Expected: all pass.
- [ ] **Step 5: Quick manual check in Brave (`pnpm dev`, reload `dist/dev`).** Tab from the search field lands on the first card with a ring; arrows move; `Space` toggles; `Enter` opens options; `M` opens the menu and arrow keys move inside it; `Esc` closes the menu, and a second `Esc` focuses search.
- [ ] **Step 6: Commit.**

```bash
git add src/utils src/hooks src/features/options/components/main/ExtensionCard.tsx src/features/options/components/main/ExtensionCardMenu.tsx
git commit -m "feat: navigate and act on extension cards with the keyboard (FUT-508)"
```

### Task 3: Search field `↓` and global `/`

**Files:**

- Modify: `src/features/options/components/main/ExtensionSearchBar.tsx`

**Interfaces:**

- Consumes: `getCards`, `focusSearchInput`, `isDialogOpen`, `SEARCH_INPUT_ID` (Task 2).

- [ ] **Step 1: Pass `onInputKeyDown` to `SearchBarComponent`.** On `ArrowDown` (and not `e.nativeEvent.isComposing`), `preventDefault()` and focus `getCards()[0]`. Do nothing when there are no cards. Use `SEARCH_INPUT_ID` for the `id` prop.
- [ ] **Step 2: Add a `document` `keydown` listener in a `useEffect` (cleaned up on unmount).** On `'/'` with no modifiers: ignore when `isDialogOpen()`, or when the event target is an `input`, `textarea`, `select` or `isContentEditable` element; otherwise `preventDefault()` and `focusSearchInput()`.
- [ ] **Step 3: Run `pnpm type-check && pnpm eslint-check && pnpm prettier-check && pnpm build`.** Expected: all pass.
- [ ] **Step 4: Commit.**

```bash
git add src/features/options/components/main/ExtensionSearchBar.tsx
git commit -m "feat: jump between search and cards with arrow and slash keys (FUT-508)"
```

### Task 4: Full manual verification

- [ ] **Step 1: Run `pnpm type-check && pnpm eslint-check && pnpm prettier-check && pnpm build`.** Expected: all pass.
- [ ] **Step 2: In Brave with `dist/dev`, check both the side panel and the options page, in light and dark mode.**
  - Every row of the spec's key table behaves as specified, including `↑`/`↓` across tag groups and with 1 and 2+ columns (resize the side panel).
  - Each card is one Tab stop; the switch and the menu button are skipped.
  - Mouse clicks on buttons, cards, the switch and menu items show no ring (same look as before).
  - Each Review Focus line above behaves as described.
- [ ] **Step 3: Report results to the user before merging.** Merging to `develop` is a separate checkpoint.
