# 0036. Streamline Result Guidance and Resume Evidence Cards

## Status
Accepted

## Date
2026-08-31

## Context

After the workspace shells were simplified, result-analysis and resume-evidence screens still carried extra narrative weight:
- several result sections repeated helper paragraphs even when their structure already explained the purpose
- next-action guidance split one decision across too many supporting blocks
- resume project cards still used a different card grammar than the shared workspace list system

These screens are used after a user has already entered inspection mode, so they should support fast comparison and the next action instead of re-explaining the view.

## Decision

Result guidance and resume evidence cards should favor metadata, one short support line, and the next action.

Rules for this pass:
- remove helper copy that only restates the section title
- keep result feedback cards as short evidence blocks
- simplify next-action guidance to the main contrast between immediate retry and later recovery
- move resume project evidence into the shared list-card grammar

Applied outcomes:
- result support sections now lean on metadata rows instead of repeated explanatory paragraphs
- `NextActionCard` now presents fewer competing guidance layers
- `ResumeProjectsCard` now matches the shared workspace card family

## Consequences

Positive:
- result screens scan faster immediately after an interview run
- resume evidence reads closer to an operator workspace than a document dump
- later redesign passes can tune result and resume support surfaces using the same card primitives

Trade-offs:
- repeat-use screens carry less inline onboarding text
- future deep guidance should live in dedicated recovery surfaces, not in extra helper copy
