# 0076. Namespaced Tokens and Primitives Alongside Legacy Styles

## Status
Accepted

## Date
2026-09-30

## Context
ADR 0074 proposes a token design system and shared primitives to replace the 26,488-line `global.css`. That stylesheet already defines ~95 custom properties with generic names (`--accent`, `--text-muted`, `--border-strong`) and page-specific classes (`.page-card`, `.stat…`). Replacing it at once would touch every screen. Adding tokens under the same names would silently change legacy screens.

## Decision
- Tokens live in `apps/web/src/shared/theme/tokens.css`. They use an `--iv-` prefix, with a raw scale (type, spacing, radius, control sizes) and semantic color roles (`--iv-surface`, `--iv-text-muted`, `--iv-accent`, …).
- Primitive components live in `apps/web/src/shared/ui/primitives/`. They use `ui-` class names, their own stylesheet, and reference only `--iv-*` tokens.
- Color roles resolve per theme:
  - light roles for `light` and for `system` when the OS prefers light
  - navy-tuned dark roles for `dark`, `workspace`, and `dracula`, so primitives blend into screens that still use legacy styles
- A test enforces that no stylesheet other than `tokens.css` and the legacy `global.css` contains raw colors or literal font sizes. It also checks that text roles meet WCAG AA (4.5:1) in both modes.
- One line-icon set (`shared/ui/primitives/Icon`) replaces letter glyphs. Icons are inline SVG on a 24px grid using `currentColor`, with no new dependency.
- Screens migrate one at a time (docs/09 Phases 3–5). A migrated screen drops its legacy selectors in the same work unit.

## Consequences
- New UI can be built on tokens immediately without regressions in unmigrated screens.
- Two styling systems coexist for a while. Reviewers should reject new legacy selectors or raw values outside `tokens.css`.
- Re-enabling a user-selectable light theme remains blocked until the screens a user can reach are migrated (ADR 0075).
- The dark accent is `#2f6fe8`, slightly deeper than the legacy workspace `#3f82ff`, because white text on the latter fails AA (3.6:1).
