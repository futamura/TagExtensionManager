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
