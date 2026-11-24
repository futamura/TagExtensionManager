# Toolbar Keyboard Navigation Design

Date: 2026-11-24
Status: Approved
Issue: FUT-509 (follows FUT-508, see `2026-11-23-keyboard-navigation-design.md`)

## Intent

Reach every button on the page from the keyboard as quickly as the extension cards: the toolbar buttons above the search field (Export / Import, Total / Enabled / Disabled, Enable All / Disable All, Edit Tags, tags) and the per-group Enable / Disable buttons in the list. Today the toolbar needs repeated Shift+Tab from the search field, and the group buttons are only reachable with Tab.

## Goals

- Arrow keys move focus between toolbar buttons, the search field, group header buttons, and cards.
- Movement works the same way everywhere, so there is nothing new to learn beyond the card navigation.

## Non-goals

- New single-key shortcuts (number keys, `?` help, etc.).
- Changing the Tab order. Buttons stay Tab stops as today.

## Anti-goals

- Changing how the UI looks for mouse users.
- Breaking text editing in the search field (`←` / `→` keep moving the caret there).

## Approaches considered

1. **One shared navigation graph (chosen)**: every navigable element on the page follows the card rule: `←` / `→` by DOM order, `↑` / `↓` by rendered position. Reuses `findAdjacentCard` with a wider selector. Consistent and small.
2. **Separate toolbar and list regions**: each region has its own movement logic and the search field links them. Allows exceptions such as `↓` from search jumping straight to the first card, but adds cross-region code.

The per-group Enable / Disable buttons are included (decided 2026-11-24): crossing a group boundary with `↑` / `↓` stops on the group header once.

## Design

### Navigable elements

Toolbar buttons, the search field, group header Enable / Disable buttons, and extension cards. The hidden file input of Import is excluded.

### Keys

| Where | Key | Action |
| --- | --- | --- |
| Toolbar / group header button | `←` / `→` | Previous / next navigable element in DOM order |
| Toolbar / group header button | `↑` / `↓` | Element visually above / below (nearest row, horizontally closest) |
| Toolbar / group header button | `Space` / `Enter` | Press the button (native behavior) |
| Toolbar / group header button | `Esc` | Focus the search field |
| Search field | `↑` | Leftmost element of the nearest row above (the tag row) |
| Search field | `↓` | Nearest element below (the first group's Enable / Disable) |
| Card | arrows | Same rule, now also stopping on toolbar / header buttons and the search field |

All other card keys (`Space`, `Enter`, `M`, `Esc`) and `/` stay as in the FUT-508 design.

Behavior change from FUT-508: `↓` in the search field now lands on the first group header button instead of the first card (one extra press).

### Guards

Same as the card handler: ignore keys while a dialog is open, during IME composition, or with Ctrl / Meta / Alt. Arrow keys may repeat.

## Left to the builder

- Generalize the card selector and `findAdjacentCard` in `src/utils/cardNavigation.ts` (naming is the builder's call); mark navigable elements with a data attribute.
- Where the shared button handler lives (a hook under `src/hooks/` is preferred).
- Focus ring styling already exists for the shared buttons (FUT-508); no styling change expected.

## Scope extension: tag dialogs (2026-11-24, Approved)

The toolbar / list part above is implemented and manually verified. FUT-509 was extended to cover the Select Tags and Edit Tags dialogs.

### Approach

Reuse the same navigation graph, scoped to the dialog that holds focus. A dedicated per-dialog handler was rejected (two behaviors to learn and maintain); replacing the chips with Headless UI Listbox was rejected (changes markup and look).

### Scope rule

- An element inside a dialog navigates only among navigable elements inside the same dialog.
- An element outside any dialog navigates only among elements outside dialogs (unchanged), and stays ignored while a dialog is open.

### Navigable elements in dialogs

| Dialog | Elements |
| --- | --- |
| Both | Header close button, search input |
| Select Tags | Tag chips |
| Edit Tags | Add button, each tag's name button and delete (×) button |

The delete confirmation dialog (Cancel / Delete) is not included; it keeps Tab.

### Keys in dialogs

| Where | Key | Action |
| --- | --- | --- |
| Any navigable element | arrows | Same rule as the main page, within the dialog |
| Search input | `↑` / `↓` | Same as the main search input; `←` / `→` keep moving the caret |
| Select Tags chip | `Space` / `Enter` | Toggle the tag (native button) |
| Edit Tags name button | `Space` / `Enter` | Start renaming (native button; the input is focused as today) |
| Edit Tags rename input | `←` / `→` | Move the caret (not handled) |
| Edit Tags rename input | `Enter` | Commit (as today), then focus that tag's name button |
| Edit Tags × button | `Space` / `Enter` | Open the delete confirmation (as today) |
| Any | `Esc` | Not handled by navigation; the dialog closes as today |

### Focus after changes

- After a tag is deleted: focus the next tag's name button, else the previous one, else the dialog's search input.
- Closing a dialog returns focus to the button that opened it (Headless UI default, unchanged).

### Non-goals

- Reordering tags with the keyboard (drag only, may be added later).
