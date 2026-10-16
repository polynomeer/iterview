# 0094. Ink & Signal Is the Default Design, Classic Stays a Theme

## Status
Accepted. Amends ADR 0093.

## Date
2026-10-16

## Context
ADR 0093 added the Ink & Signal palette next to the existing colors and kept the existing colors as the default. The Ink & Signal mockups (the design canvas from 2026-10-15) are now being applied to every screen: new layouts for 오늘, 질문, 답변, 결과, 복습, 이력서, 면접, and 설정, a new brand mark, and IBM Plex type. The earlier look should stay available as a choice rather than disappear.

## Decision
- Ink & Signal is the default palette. A stored `classic` keeps the earlier colors, and any other stored value resolves to `ink`.
- A palette is the whole visual theme, not only colors. Each palette block in `tokens.css` may also set type (`--iv-font-*`) and shape (`--iv-radius-*`). Ink & Signal uses IBM Plex Sans KR and IBM Plex Mono, which the app now bundles with `@fontsource`, and 16px card corners. Classic keeps Pretendard (system fallback) and its corners.
- Screen layouts are shared by both themes. Only tokens differ, so a component never branches on the palette.
- The answer editor is a focus surface. In Ink & Signal it stays dark at any brightness via the `.iv-ink-focus` scope, which reuses the Ink & Signal dark roles. Classic follows the chosen brightness.
- `--iv-signal` colors non-text marks for weak scores (bars, dots): signal orange in Ink & Signal, the danger color in classic. Text keeps using `--iv-danger`.
- The brand mark is a lowercase i whose dot is the root question and whose branch ends in a follow-up dot (`BrandMark`). The root dot uses `--iv-accent`, the stem the surrounding text color, and the follow-up dot `--iv-brand-leaf` (signal orange) in every theme. The favicon uses the same mark.

## Consequences
- First-time visitors, and anyone who never picked a palette, now see Ink & Signal.
- A screen that needs a theme-specific look adds a role to every palette block in `tokens.css`; it never checks `data-palette` itself.
- Bundled fonts add Korean subset files to the build. Browsers download only the subsets a page uses.
