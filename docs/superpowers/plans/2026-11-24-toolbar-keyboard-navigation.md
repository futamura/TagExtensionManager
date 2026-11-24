# Toolbar Keyboard Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the FUT-508 arrow-key navigation so toolbar buttons, the search field, group header Enable / Disable buttons, and extension cards form one navigation graph.

**Architecture:** Every navigable element gets a `data-nav-item` attribute. The existing position logic (`findAdjacentCard`) is generalized to `findAdjacentItem` over `getNavItems()`. Cards and the search field switch to the generalized helpers; `DefaultBackgroundButton` gains an opt-in `navigable` prop that adds the attribute and an arrow / Escape key handler.

**Tech Stack:** TypeScript, React 18, Tailwind CSS, webpack, pnpm.

**Spec:** `docs/superpowers/specs/2026-11-24-toolbar-keyboard-navigation-design.md`

## Global Constraints

- Package manager is pnpm; no dependency or tool version changes.
- Source comments in English, always block comments (`/** */`), even single-line.
- No visual change for mouse users (no class / layout / color changes).
- Tab order unchanged: buttons stay Tab stops, cards stay single Tab stops.
- `←` / `→` in the search field keep moving the caret (not handled).
- Guards on every new key handler: ignore while a dialog is open (`isDialogOpen()`), during IME composition, or with Ctrl / Meta / Alt. Arrow keys may repeat.
- No test suite exists. Verification = `pnpm type-check`, `pnpm eslint-check`, `pnpm prettier-check`, `pnpm build`, plus manual checks in Brave with `dist/dev`.

## Review Focus

1. Narrow side panel where toolbar chips wrap onto several rows: `↑` / `↓` must move to the visually nearest row, never skip a row. → Task 3 manual check.
2. Edit Tags / tag selector dialog open: arrow keys inside the dialog must not move focus behind it, and dialog buttons (`TagSelectorListItem`) must not be navigable. → Task 2 (prop is opt-in) + Task 3 manual check.
3. Search with no matches (no groups rendered): `↓` in the search field must do nothing and not throw. → Task 1 (null result = no-op) + Task 3 manual check.
4. IME composition in the search field (Japanese input): `↑` / `↓` while composing must stay with the IME. → Task 1 guard + Task 3 manual check.
5. Filter chips dimmed with `opacity-50` and the Untagged chip: still reachable by arrows. → Task 3 manual check.

---

### Task 1: Generalize navigation helpers; switch cards and search field

**Files:**
- Modify: `src/utils/cardNavigation.ts`
- Modify: `src/hooks/useCardKeyboardNavigation.ts`
- Modify: `src/features/options/components/main/ExtensionCard.tsx:178-183`
- Modify: `src/features/options/components/main/ExtensionSearchBar.tsx` (`handleInputKeyDown`)
- Modify: `src/components/SearchBarComponent.tsx` (forward a `data-nav-item` marker to the input)

**Interfaces:**
- Produces (in `src/utils/cardNavigation.ts`, exported via `@/utils`):
  - `NAV_ITEM_SELECTOR = '[data-nav-item]'`
  - `type NavDirection = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'` (replaces `CardDirection`)
  - `getNavItems(): HTMLElement[]` — all `[data-nav-item]` elements in DOM order
  - `findAdjacentItem(current: HTMLElement, direction: NavDirection, items: HTMLElement[], align: 'center' | 'start' = 'center'): HTMLElement | null` — same algorithm as today's `findAdjacentCard`; with `'start'`, the horizontal distance compares left edges instead of centers
  - `focusSearchInput()`, `isDialogOpen()`, `SEARCH_INPUT_ID` unchanged
  - Remove `CARD_SELECTOR`, `getCards`, `findAdjacentCard`, `CardDirection` once no caller remains

- [ ] **Step 1: Rename and extend the helpers** in `src/utils/cardNavigation.ts` per the Interfaces block. Keep the file name (renaming is out of scope).
- [ ] **Step 2: Cards** — in `ExtensionCard.tsx` replace `data-extension-card` with `data-nav-item`; in `useCardKeyboardNavigation.ts` use `findAdjacentItem(card, e.key as NavDirection, getNavItems())`.
- [ ] **Step 3: Search field** — `SearchBarComponent` gets an optional `navItem?: boolean` prop that renders `data-nav-item` on the input (the tag editor / selector search bars do not pass it). `ExtensionSearchBar` passes `navItem` and `handleInputKeyDown` handles:
  - `ArrowDown` → `findAdjacentItem(input, 'ArrowDown', getNavItems())`
  - `ArrowUp` → `findAdjacentItem(input, 'ArrowUp', getNavItems(), 'start')`
  - Ignore when composing, with Ctrl / Meta / Alt, or when a dialog is open. When the result is null, return without `preventDefault`.
- [ ] **Step 4: Verify**
  Run: `pnpm type-check && pnpm eslint-check && pnpm prettier-check && pnpm build`
  Expected: all exit 0. (Behavior is unchanged at this point: no toolbar or header button is navigable yet, so `↓` from search still lands on the first card and `↑` is a no-op.)
- [ ] **Step 5: Commit**

```bash
git add src/utils/cardNavigation.ts src/hooks/useCardKeyboardNavigation.ts src/components/SearchBarComponent.tsx src/features/options/components/main/ExtensionCard.tsx src/features/options/components/main/ExtensionSearchBar.tsx
git commit -m "refactor: generalize arrow-key navigation to any marked element (FUT-509)"
```

### Task 2: Make toolbar and group header buttons navigable

**Files:**
- Modify: `src/utils/cardNavigation.ts` (add the button key handler)
- Modify: `src/components/ButtonComponents.tsx` (`DefaultBackgroundButton`)
- Modify (pass `navigable`): `src/features/options/components/main/ExtensionHeader.tsx` (Export, Import), `ExtensionTagMetrics.tsx` (Total, Enabled, Disabled), `ExtensionToggleAllButtons.tsx` (Enable All, Disable All), `ExtensionTagListEditButton.tsx` (Edit Tags), `ExtensionTagListItem.tsx` (each tag chip), `ExtensionListHeader.tsx` (Enable, Disable)
- Do NOT modify: `src/features/options/components/selector/TagSelectorListItem.tsx` (dialog content)

**Interfaces:**
- Consumes: `findAdjacentItem`, `getNavItems`, `focusSearchInput`, `isDialogOpen`, `NavDirection` from Task 1.
- Produces:
  - `handleNavItemKeyDown(e: React.KeyboardEvent<HTMLElement>): void` in `src/utils/cardNavigation.ts` — arrows → `findAdjacentItem(e.currentTarget, key, getNavItems())?.focus()`; `Escape` → `focusSearchInput()`; `preventDefault` only for handled keys; applies the Global Constraints guards. `Space` / `Enter` are left to the native button.
  - `DefaultBackgroundButton` prop `navigable?: boolean` (default false). When true: render `data-nav-item` and `onKeyDown={handleNavItemKeyDown}`. No class change.

Decision: a plain function in `src/utils/` instead of a hook, because it holds no state or callbacks (the spec leaves this to the builder).

- [ ] **Step 1: Add `handleNavItemKeyDown`** per the Interfaces block.
- [ ] **Step 2: Add the `navigable` prop** to `DefaultBackgroundButton`.
- [ ] **Step 3: Pass `navigable`** at each call site listed under Files.
- [ ] **Step 4: Verify**
  Run: `pnpm type-check && pnpm eslint-check && pnpm prettier-check && pnpm build`
  Expected: all exit 0.
- [ ] **Step 5: Commit**

```bash
git add src/utils/cardNavigation.ts src/components/ButtonComponents.tsx src/features/options/components/main
git commit -m "feat: move between toolbar and group buttons with arrow keys (FUT-509)"
```

### Task 3: Manual verification in Brave

- [ ] **Step 1:** Run `pnpm dev`, load `dist/dev` in Brave, open both the side panel and the options page.
- [ ] **Step 2:** Check every row of the spec's key table, then each Review Focus item (narrow panel wrapping, Edit Tags dialog open, no-match search, IME composition, dimmed / Untagged chips).
- [ ] **Step 3:** Confirm FUT-508 card keys (`Space`, `Enter`, `M`, `Esc`, `/`) still work and mouse appearance is unchanged.
- [ ] **Step 4:** Fix anything found (re-run Task 2 Step 4 checks, commit as `fix: ... (FUT-509)`), then report results to the user.

---

## Scope extension: tag dialogs (2026-11-24)

Spec section: "Scope extension: tag dialogs" in the same spec. Tasks 1-3 are done (toolbar part verified in Brave).

### Additional Review Focus

1. Deleting a tag: the confirm dialog lives inside the deleted `TagEditorListItem` and unmounts with it; Headless UI focus restore must not override the planned focus target. → Task 5 manual check.
2. Rename input loses focus by blur (click elsewhere): no focus jump back to the name button (only `Enter` restores). → Task 5.
3. Select Tags with a search query that matches nothing: `↓` from the search input is a no-op. → Task 6 manual check.
4. Main page elements while a dialog is open: still ignored (scope rule). → Task 6 manual check.

### Task 4: Scope navigation to the containing dialog

**Files:**
- Modify: `src/utils/cardNavigation.ts`
- Modify: `src/components/DialogComponents.tsx` (`DialogHeader` close button)
- Modify: `src/components/ButtonComponents.tsx` (`AddButtonComponent` / `XLargeButtonComponent` get `navigable`)
- Modify: `src/features/options/components/selector/TagSelectorSearchBar.tsx`, `TagSelectorListItem.tsx`
- Modify: `src/features/options/components/editor/TagEditorSearchBar.tsx`, `TagEditorListItem.tsx`

**Interfaces:**
- `getNavItems(scope?: HTMLElement): HTMLElement[]` — when `scope` is given, return `[data-nav-item]` elements inside `scope` whose closest `[role="dialog"]` is `scope`'s dialog; without it, return elements not inside any dialog (main page, unchanged behavior).
- `getNavScope(element: HTMLElement): HTMLElement | undefined` — `element.closest('[role="dialog"]') ?? undefined`.
- `handleNavItemKeyDown`: if the element is inside a dialog, navigate within `getNavItems(scope)` and do not handle `Escape`; if outside, keep current behavior including the `isDialogOpen()` guard.
- New exported `handleNavInputKeyDown(e: KeyboardEvent<HTMLInputElement>): void` for search inputs (↑ with `'start'`, ↓ center; composing / modifier guards; no-op on null) used by the main search bar and both dialog search inputs. The main search bar keeps its `isDialogOpen()` guard via the scope rule.
- `DialogHeader` close button, `AddButtonComponent`, Select chips, Edit name buttons and × buttons are navigable (`data-nav-item` + `handleNavItemKeyDown`). Dialog search inputs pass `navItem`.

- [ ] **Step 1:** Implement per Interfaces. Card handler and main search bar keep working unchanged (page scope).
- [ ] **Step 2: Verify** `pnpm type-check && pnpm eslint-check && pnpm prettier-check && pnpm build` → exit 0.
- [ ] **Step 3: Commit** `feat: navigate inside tag dialogs with arrow keys (FUT-509)`

### Task 5: Focus restore in Edit Tags

**Files:** Modify `src/features/options/components/editor/TagEditorListItem.tsx`

- After `Enter` commits a rename, focus this tag's name button once it re-renders (flag set in the input's Enter handler, consumed in an effect when `editingTagId` leaves this tag). Blur commits do not restore focus.
- In `handleConfirmDelete`, before `deleteTag`, pick the target among the Edit Tags dialog's name buttons (marked `data-tag-name-button`): next, else previous, else the dialog's search input; focus it in `requestAnimationFrame` after deletion.
- [ ] **Step 1:** Implement.
- [ ] **Step 2: Verify** same commands → exit 0.
- [ ] **Step 3: Commit** `feat: keep keyboard focus after renaming or deleting a tag (FUT-509)`

### Task 6: Manual verification in Brave (dialogs)

- [ ] `pnpm start`, reload `dist/dev`; check every row of the dialog key table and the Additional Review Focus items in both side panel and options page; re-check the main page quickly.
