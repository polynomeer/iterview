# 0037. Convert Resume Detail Cards Into Workspace Evidence Panels

## Status
Accepted

## Date
2026-08-31

## Context

The resume detail screen still mixed two presentation styles:
- document-like explanatory cards for profile and active-version summary
- workspace-like evidence cards for projects and risks

That inconsistency made the resume page feel less like an operational source-of-truth surface and more like a mixed document viewer.

## Decision

Resume detail sections should read as evidence panels first and narrative summaries second.

Rules for this pass:
- promote metadata before long helper copy
- keep active resume information as a compact summary block plus metrics
- treat skill chips as explicit interactive evidence tokens
- move timeline support details into compact metadata rows instead of stacked helper paragraphs

Applied outcomes:
- `ResumeProfileCard` now reads as a compact evidence card
- `ActiveResumeOverviewCard` now centers one active-version summary block before metrics
- `ResumeSkillsCard` removes repeated explainer copy and reinforces button semantics
- `ResumeExperienceTimeline` compresses impact and project support details into one metadata lane

## Consequences

Positive:
- resume detail surfaces now align with the rest of the workspace card system
- users can scan source-of-truth evidence faster before interview preparation
- later redesign passes can refine resume sections without reintroducing document-style card grammar

Trade-offs:
- the resume page now assumes repeat-use more than first-time explanation
- future onboarding guidance should live in dedicated helper surfaces rather than inline section copy
