# 0093. Color Palettes Separate from Brightness

## Status
Accepted. Amends ADR 0082. Default palette changed by ADR 0094.

## Date
2026-10-15

## Context
ADR 0082 let `tokens.css` hold exactly two palettes, light and dark, chosen by `data-theme`. The new "Ink & Signal" design direction has its own light and dark colors, a dark sidebar in both brightnesses, and IBM Plex type. People who like the current colors should keep them, so the new direction cannot simply replace the old palette.

## Decision
- A color palette and brightness are two settings. Settings > 언어와 화면 shows 색 테마 (`ink` "Ink & Signal" or `classic` "클래식") above 밝기 (`system`, `light`, `dark` from ADR 0082).
- `classic` is the current palette and stays the default, so nobody's screen changes on upgrade. Unknown stored values fall back to `classic`.
- The palette lives on `<html data-palette>` next to `data-theme` and is stored under `iterview-palette` in `localStorage`, like the theme. The inline script in `index.html` applies both before React mounts.
- `tokens.css` holds one role block per palette and brightness. The classic blocks keep the ADR 0082 selectors. The Ink & Signal blocks add `[data-palette="ink"]` so they outrank the classic block for the same brightness, and they define every color role the classic blocks define.
- The sidebar has its own `--iv-nav-*` roles. Classic maps them to the colors the sidebar already used. Ink & Signal keeps the sidebar dark in both brightnesses.
- Every palette and brightness pair keeps every text role, the sidebar text, and every solid badge tint at WCAG AA. The design token test checks all four pairs, the system-dark copies, and that Ink & Signal has every classic color role.
- Signal orange (`#ff7a3d`) is too light for text on white. It is reserved for non-text marks and has no text role.

## Consequences
- A third palette means one more set of role blocks in `tokens.css`, one more option in `paletteOptions`, the `index.html` script, and the contrast test. Components do not change.
- Ink & Signal names IBM Plex Sans KR and IBM Plex Mono in its font stack but the app does not load web fonts yet, the same as Pretendard today. Without them installed the stack falls back to system fonts.
- The palette is a per-browser preference, like the theme. It is not synced to the account.
