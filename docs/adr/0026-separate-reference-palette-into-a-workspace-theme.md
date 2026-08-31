# 0026. Separate Reference Palette Into A Workspace Theme

## Status
Accepted

## Date
2026-08-31

## Context

The redesign references in `docs/references/design/` use a distinct visual palette:
- deep navy shells
- cobalt action accents
- selective amber and green status contrast

That palette had been partially approximated through the existing `dracula` option, but that was the wrong abstraction.

`Dracula` is a violet mood theme.
The reference palette is a product-facing workspace theme tied to the redesign direction.

Mixing the two made theme selection unclear and weakened the design system.

## Decision

The reference-driven palette is separated into its own `workspace` theme.

Implementation rules:
- keep `light` as the default theme
- keep `dark` as the neutral low-glare dark theme
- keep `dracula` as the saturated violet preference theme
- add `workspace` as the reference-matching navy theme for the redesign

Theme behavior rules:
- any shared dark workspace surface overrides may apply to both `dracula` and `workspace`
- palette tokens must stay separate so each theme keeps a clear identity
- theme labels in settings must explain the purpose of `workspace` in plain language

## Consequences

Positive:
- the reference palette now has an explicit product meaning instead of hiding behind a stylistic nickname
- users can choose between a neutral dark theme, a reference-matching workspace theme, and a violet preference theme
- future design matching work can target `workspace` without distorting `dracula`

Trade-offs:
- theme maintenance cost increases because there is one more supported palette
- future theme-specific overrides need to preserve the distinction between reference-driven and stylistic dark themes
