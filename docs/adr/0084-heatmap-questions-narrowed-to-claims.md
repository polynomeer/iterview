# 0084. Interview Questions Narrowed to Resume Claims

## Status
Accepted. Extends ADR 0081.

## Date
2026-10-02

## Context
ADR 0081 made each resume claim (an extracted achievement) the unit of 근거 편집. Heatmap links still anchor a question to a project or an experience. So the claim form showed every question about a project under every claim in it. One weak answer marked all those claims as 약점.

A question's anchor is mostly inferred when the heatmap is read. Only manual corrections are stored, in `resume_question_heatmap_links`.

## Decision
- The anchor stays the project or experience, so heatmap totals, overlay targets, and anchor detail pages do not change. Within that anchor, a question may be narrowed to one claim. The heatmap returns `achievementId` and `achievementSource` on each question.
- The claim is resolved when the heatmap is read, in this order:
  1. **Manual:** a claim the user picked, or an explicit "none". It is stored as `achievement_id` and `achievement_assigned` on the link row. It applies only while that claim is still under the question's anchor.
  2. **Matching:** the claim whose words the question repeats, if it scores at least 2 and beats every other claim. Numbers count double. Matching uses Unicode letters and digits, and strips one trailing Korean particle.
  3. **Inheritance:** a follow-up with no match of its own keeps its parent's claim, when the parent has one under the same anchor.
- `PUT /api/resume-versions/{versionId}/question-heatmap/questions/{interviewRecordQuestionId}/claim` with `{ achievementId }` sets the claim, or "none" when `achievementId` is null. Picking a claim also moves the question to that claim's project or experience. A highlight chosen in the old anchor is dropped.
- `achievement_id` has no foreign key. Re-extraction recreates claims. A stale id fails the anchor check and falls back to matching.

## Consequences
- The claim form shows a claim's own questions, and judges 약점 from them only. Questions in the project that match no claim are listed apart, each with a way to assign it to the claim being viewed.
- Matching is deliberately conservative. A question that fits two claims equally gets no claim rather than a wrong one.
- Manual picks do not survive re-extraction, because claim ids change. Re-extraction already resets claim-level data that cannot be matched by title (ADR 0081).
