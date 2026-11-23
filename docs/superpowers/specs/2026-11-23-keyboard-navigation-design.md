# Keyboard Navigation Design

Date: 2026-11-23
Status: Approved

## Intent

Let the user operate the extension list quickly without a mouse: filter by search, pick an extension, then toggle it or open its options page, all from the keyboard.

## Goals

- Move from the search field to the extension cards and between cards with arrow keys.
- Act on the focused card with single keys.
- Make the keyboard focus position visible.

## Non-goals

- Extra shortcuts such as number keys for tag filters, a `?` help overlay, or keys for enable all / disable all. These are deferred and will be added later only if this design turns out to be insufficient.
- Arrow-key navigation inside the tag filter list (it keeps plain Tab navigation).

## Anti-goals

- Changing how the UI looks for mouse users.

## Approaches considered

1. **Tab polish only**: add focus rings and make cards focusable. Minimal, but reaching the 10th card still takes about 20 Tab presses, so it does not make operation faster.
2. **Search-centered arrow navigation (chosen)**: arrow keys move between cards, single keys act on the focused card, and `/` returns to search. It covers the main flow with about five keys.
3. **Approach 2 plus a full shortcut set**: fastest, but much more to build and learn, and needs a new help UI. Deferred until approach 2 is tried.

## Design

### Keys

| Where | Key | Action |
| --- | --- | --- |
| Search field | `↓` | Focus the first card |
| Card | `←` / `→` | Focus the previous / next card in list order |
| Card | `↑` / `↓` | Focus the card visually above / below, based on rendered position (the column count changes with width), crossing tag groups |
| Card | `Space` | Toggle enabled / disabled (no-op when the extension is locked) |
| Card | `Enter` | Open the extension's options page (no-op when disabled or without an options page, same as clicking) |
| Card | `M` | Open the card's menu |
| Card | `Esc` | Focus the search field |
| Anywhere except the search field | `/` | Focus the search field |

### Tab order

Each card is a single Tab stop. The switch and the menu button inside a card are removed from the Tab order.

### Focus styling

Show a ring only for keyboard focus (`focus-visible`); mouse clicks look the same as today.

- Targets: extension cards and the shared buttons that currently hide focus with `focus:outline-hidden` (tags, header, menu items, etc.).
- Style: `ring-1`, `zinc-200` in light mode and `zinc-500` in dark mode, matching the existing search field focus ring (changed from `ring-2` / `zinc-400` after review on 2026-11-23).

## Left to the builder

- Put the arrow-key navigation logic in a hook under `src/hooks/`.
- The same extension can appear in several tag groups, so track focus by DOM element, not by extension ID.
