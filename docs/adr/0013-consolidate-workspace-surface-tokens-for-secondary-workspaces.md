# 0013. Consolidate Workspace Surface Tokens For Secondary Workspaces

Date: 2026-08-25

## Status

Accepted

## Context

As more secondary workspaces were added, their top-level workspace surfaces converged on the same structure: intro copy, stats, chips, and guidance cards. The implementation drifted into page-by-page CSS duplication, which made spacing, radius, border, and label treatments harder to keep aligned.

That duplication was especially visible across `Target Companies`, `Scheduled Reviews`, `Settings`, and `Weak Nodes`.

## Decision

We will consolidate shared workspace-surface spacing and card structure through shared CSS tokens and grouped selectors for stable secondary workspace families.

Page-specific CSS should keep only:
- surface background art and accent mood
- page-local content layouts
- component-specific interaction styling

Repeated header, intro, stat, and guidance-card structure should come from shared workspace-surface rules.

## Consequences

Positive:
- spacing and radius drift is reduced without rewriting page markup
- future workspace additions can inherit the same structure with fewer one-off rules
- visual cleanup work stays incremental instead of forcing a full design-system rewrite

Trade-offs:
- grouped selectors still depend on naming consistency across workspace families
- some earlier pages still use older grouped surface rules and may need a second cleanup pass
