# 0081. Claim Evidence Stored on Resume Achievements

## Status
Accepted.

## Date
2026-10-01

## Context
The redesign proposal (`docs/09-ux-audit-and-redesign-proposal.md`, §4.5) makes the 근거 편집 tab a list of resume claims. Each claim is backed by four answers: 상황, 내 역할, 측정 방법, and 결과 수치. An empty answer is tied to the interview question it leaves open.

Nothing stored those answers. `resume_achievement_items` holds the extracted bullet (`title`, `metric_text`, `impact_summary`), and extraction rewrites it. The markdown workspace in `resume_editor_workspaces` is a separate document and never writes back to the structured tables. No endpoint updated a single structured record.

## Decision
- The claim is the extracted achievement. Four nullable columns on `resume_achievement_items` hold the evidence: `situation_text`, `role_text`, `measurement_text`, and `result_text`. A fifth column, `evidence_updated_at`, records the last save. They are added in `V38`.
- `PUT /api/resume-versions/{versionId}/achievements/{achievementId}/evidence` replaces all four answers at once. Blank answers are stored as null. `GET …/achievements` returns them under `evidence`.
- Extraction never writes evidence. Re-extraction keeps the evidence of any claim whose title is unchanged, matching titles case-insensitively with whitespace collapsed. A claim whose title changes loses its evidence.
- Questions shown for a claim come from the heatmap item of its project, or its experience when it has no project. Heatmap links do not anchor to achievements.
- In the web app, `/resume/:versionId/claims` is the claim form. The markdown document editor moves to `/resume/:versionId/claims/document`, reached from the claim form, and keeps all its features.

## Consequences
- Evidence is per version. A new upload starts with empty evidence, as it starts with a new extraction.
- Completeness is derived on the client from the four fields: none, some, or all answered. No stored status can drift from the answers.
- Questions are shared by every claim in the same project. Anchoring heatmap links to achievements would make them per claim. That needs `achievement` as an anchor type in the heatmap service and overlay targets, and is left for later.
- The document editor keeps its co-located legacy styles until it is restyled separately.
