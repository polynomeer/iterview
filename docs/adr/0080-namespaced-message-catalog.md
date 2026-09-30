# 0080. Namespaced Message Catalog Instead of Inline Bilingual Copy

## Status
Accepted.

## Date
2026-09-30

## Context
The web app shows Korean and English. Most screens chose between them inline:
- `isKorean ? "…" : "…"` in about 1,600 places.
- A local `copy(ko, en)` helper in about 560 places on the rebuilt screens.
- Ad-hoc `[ko, en]` tuples.

The audit (`docs/09-ux-audit-and-redesign-proposal.md`, §3.5 and §4.6) found that the two languages drifted apart and that some strings existed in only one of them. `messages.ts` held a 1,600-line catalog, but most of its keys were no longer used.

## Decision
- Each screen or domain owns a namespace file in `apps/web/src/shared/i18n/catalog/<namespace>.ts` exporting `{ en, ko }` with identical keys. `catalog/index.ts` registers the files, and `messages.ts` merges them next to its remaining shared namespaces (`common`, `nav`, …).
- Components call `t("namespace.key", params)`. Code outside React, such as entity mappers, calls `translate(...)`. Placeholders use `{name}`. English plurals use separate `…One` / `…Other` keys chosen in code.
- Two tests enforce this:
  - `i18nCatalog.test.ts` checks that every namespace has the same keys in Korean and English.
  - `i18nGuard.test.ts` fails if `isKorean`, a `copy(ko, en)` helper, or a locale ternary returning Korean text appears anywhere under `src` outside `shared/i18n`.
- Checking the locale is still allowed when it isn't choosing display text, for example to pick a date-format locale.

## Consequences
- Adding a string means adding a key in both languages. A missing translation fails a test instead of shipping.
- Unused keys are easy to find by searching for the key. The 1,206 dead keys in `messages.ts` were removed this way.
- `catalog/index.ts` is a shared registration point. Parallel changes that add namespaces conflict there, and resolving the conflict means keeping both imports and both entries.
