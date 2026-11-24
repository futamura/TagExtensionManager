# Keyboard Shortcut List Design

Date: 2026-11-24
Status: Approved
Issue: FUT-516 (follows FUT-508 and FUT-509, see `2026-11-23-keyboard-navigation-design.md` and `2026-11-24-toolbar-keyboard-navigation-design.md`)

## Intent

Keyboard shortcuts now cover cards, the toolbar, group headers and the tag dialogs, but nothing on screen tells the user they exist. Add a panel that lists them, reachable both from the keyboard and with the mouse. This is the `?` help that the FUT-508 design deferred.

## Goals

- Open the list with the `?` key or a header button.
- The list matches the implemented keys.

## Non-goals

- Changing any existing key or adding other new shortcuts.
- Customizable key bindings.
- Listing native browser behavior (e.g. `Space` / `Enter` pressing a focused button, `Tab`).

## Anti-goals

- Breaking text input: `?` typed into the search field or a tag dialog input must stay a character.
- Conflicting with `/` (focus search).

## Approaches considered

1. **Self-contained in the header (chosen)**: `ExtensionHeader` owns the open state, the `?` button and the dialog; the `?` key is a small hook under `src/hooks/`. Same shape as the Edit Tags button owning its dialog.
2. **Open state in `ExtensionContext`**: like the Select Tags dialog. Rejected: only two entry points (button, `?` key), both in the header, so widening the context buys nothing.

## Design

### Opening

| Trigger | Condition |
| --- | --- |
| `?` key | Outside text fields (`input`, `textarea`, `select`, contenteditable), not during IME composition, no Ctrl / Meta / Alt (Shift is needed to type `?`), and no dialog open (`isDialogOpen()`) |
| Header `?` button | Click, or `Space` / `Enter` when focused |

`?` arrives as `e.key === '?'` (Shift+/ on both US and JIS layouts), so the existing `/` handler (`e.key !== '/'`) never sees it.

While the panel is open, `?` does nothing (the dialog guard applies). It closes with `Esc` or the ✕ button; focus returns to the element that opened it (Headless UI default).

### Header button

- A round button showing a bold `?`, placed after Export / Import.
- Same background and focus ring as Export / Import (`DefaultBackgroundButton`), `title="Keyboard Shortcuts"`.
- Takes part in arrow-key navigation (`navigable`), like the other toolbar buttons.

### Panel

Built with `DialogRoot` / `DialogHeader`, title "Keyboard Shortcuts". Only the header ✕ button is a navigation item (unchanged `DialogHeader`).

Rows are grouped under small uppercase section headings; each row has the description on the left and key caps on the right:

| Section | Description | Keys |
| --- | --- | --- |
| Anywhere | Show this list | `?` |
| Anywhere | Focus the search field | `/` |
| Moving around | Previous / next item | `←` `→` |
| Moving around | Item above / below | `↑` `↓` |
| Moving around | Back to the search field | `Esc` |
| Extension card | Enable / disable | `Space` |
| Extension card | Open options page | `Enter` |
| Extension card | Open menu | `M` |
| Tag dialogs | Move between items | `←` `→` `↑` `↓` |
| Tag dialogs | Toggle / rename a tag | `Space` `Enter` |
| Tag dialogs | Close the dialog | `Esc` |

Look (approved from the mockup on 2026-11-24):

- Section heading: `text-sm` (10px), semibold, uppercase, muted zinc.
- Row text: `text-base` (12px).
- Key cap: same background as the shared buttons (`zinc-200` / `zinc-700`), small rounded rectangle, centered text, min width so single-character keys look square.
- Fits the side panel without scrolling at normal heights; scrolls with the dialog otherwise.

## Left to the builder

- Component name and file for the dialog (planned: `src/features/options/components/main/ExtensionShortcutDialog.tsx`) and hook name.
- The row data lives as a constant array next to the dialog component.
- Exact Tailwind classes, within the look above.
