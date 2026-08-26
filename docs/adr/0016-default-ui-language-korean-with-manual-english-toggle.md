# 0016. Default UI Language To Korean With Manual English Toggle

Date: 2026-08-26

## Status

Accepted

## Context

The product is being developed primarily for Korean-speaking interview preparation, but the interface still opened in English by default unless the browser or an existing user setting forced a different locale.

That created two issues:
- first-run users did not consistently see Korean as the primary language
- the existing language preference lived inside settings, so switching languages during active use was slower than necessary

The redesign phase also increased the importance of consistent product copy across the shell, workspace headers, and interview flows.

## Decision

We will treat Korean as the default UI language for the web app.

We will support English as an explicit alternative through a visible manual toggle in the global header and through the persisted preferred-language field in settings.

The implementation rules are:
- default to `ko` when no stored locale exists
- do not infer the UI language from the browser locale for first-run behavior
- persist the selected locale in local storage for guests
- persist the selected locale through user settings for authenticated users
- keep authored content such as resumes, evidence snippets, uploaded file names, and user-written answers in their original language

## Consequences

Positive:
- first-run behavior matches the primary product audience
- language switching becomes available directly from the shell instead of only inside settings
- authenticated and guest locale behavior becomes more predictable

Trade-offs:
- existing untranslated surfaces will stand out more clearly and need follow-up localization work
- tests that assumed English defaults must pin locale explicitly
- browser-language auto-detection is no longer used as a fallback
