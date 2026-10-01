# 0082. System, Light, and Dark Themes on Tokens

## Status
Accepted. Supersedes ADR 0075.

## Date
2026-10-01

## Context
ADR 0075 removed the light theme because it mixed dark workspace surfaces with light text colors, and deferred it until every screen used the token layer from ADR 0074. That is now true:
- Every screen styles itself with the `--iv-*` tokens.
- `app/styles/global.css` and the co-located `legacy-*.css` files are deleted.
- A test fails if a legacy stylesheet comes back or if a raw color appears outside `tokens.css`.

The remaining themes, `workspace`, `dark`, and `dracula`, already resolved to the same dark token roles. They differed only in legacy overrides that no longer exist.

## Decision
- The theme setting has three choices: `system` (the default, following `prefers-color-scheme`), `light`, and `dark`.
- `tokens.css` holds exactly two palettes. The light roles apply to `:root` and `[data-theme="light"]`. The dark roles apply to `[data-theme="dark"]`, and to `[data-theme="system"]` when the OS prefers dark. `color-scheme` follows the same selectors, so native controls and scrollbars match.
- Stored values from the retired themes (`workspace`, `dracula`) map to `dark`, so nobody's screen changes brightness on upgrade. Unknown values fall back to `system`.
- The inline script in `index.html` applies the stored theme before React mounts, so a reload never flashes the wrong palette.
- Both palettes must keep every text role at WCAG AA against its surfaces. The existing contrast test checks both.

## Consequences
- New UI only needs tokens to work in both themes. A screen that hard-codes a color fails the design token test.
- First-time visitors now get the OS preference, which is light for many people, instead of the navy workspace.
- Brand-specific palettes such as Dracula are gone. Bringing one back means adding a third role block to `tokens.css` and a contrast check for it.
