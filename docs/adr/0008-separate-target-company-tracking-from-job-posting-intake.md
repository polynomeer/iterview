# ADR 0008: Separate Target Company Tracking from Resume Tailor Job Posting Intake

- Status: Accepted
- Date: 2026-08-25

## Context

The redesign introduced resume-tailor job posting ingestion as one way to gather external signals, but that flow is not the same as actively preparing for a specific company.

Without a separate company workspace, the product risks collapsing two different decisions into one route:

- collecting role signals from postings
- choosing which companies deserve active preparation time

This made the sidebar label "Target Companies" point to a job posting intake screen, which weakened the workspace-first information architecture.

## Decision

The product separates company-target tracking from job posting ingestion.

- `Resume Tailor Job Postings` remains the intake workspace for external role signals
- `Target Companies` becomes its own workspace for company-level readiness tracking
- company preparation should show readiness, likely interview pressure, proof gaps, and next preparation paths
- cross-links should connect the company board back to resume analysis, practice, review, notes, and job posting intake

## Consequences

- Navigation can describe each workspace honestly.
- Users can distinguish "what roles are out there" from "which companies am I actively preparing for."
- Future scheduling, bookmarks, and weak-node recovery work can connect to company lanes without overloading resume-tailor intake routes.
- Shared product documentation and remaining-work checklists should treat company-target tracking as an independent workspace family.
