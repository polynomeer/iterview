# ADR 0010: Separate Account Identity from Practice Settings

- Status: Accepted
- Date: 2026-08-25

## Context

The profile workspace had accumulated three different responsibilities:

- account identity editing
- practice and scoring defaults
- company targeting and operational preferences

This made the profile route heavier than the redesign intended and blurred the difference between "who the candidate is" and "how the preparation system behaves."

## Decision

The product separates account identity from practice settings.

- `Profile` focuses on stable account identity and career context
- `Settings` becomes the dedicated workspace for practice defaults, personalization, and local review behavior
- company preparation remains a separate workspace and should be linked from both profile and settings instead of embedded as an account form

## Consequences

- Profile reads faster and stays closer to an account surface instead of a mixed control dashboard.
- Settings can connect directly to scheduled reviews and review queue behavior without cluttering identity editing.
- Navigation and documentation now reflect three distinct concerns: identity, settings, and company targeting.
- Future notification and cadence controls have a durable home that does not require expanding the profile page again.
