# 06-acceptance-criteria

Shared acceptance baseline now lives in:

- `../../../docs/03-acceptance-baseline.md`

This document should stay focused on frontend-only acceptance detail.

## Interview History
- interview session list can be rendered when available
- Interview tab can start a `resume_mock` session after the user chooses a resume version
- selected resume version is visible in the interview-start or session-summary UI
- interview mode selection can be added without breaking the existing session start UX
- session detail can render main questions and follow-up questions in order
- session detail can render an AI-generated opening question without depending on a catalog fetch
- session detail can render AI-generated follow-up snapshots without depending on a catalog fetch
- session history remains distinct from archive
- session detail can render follow-up generation metadata such as `generationStatus`, `focusSkillNames`, and `resumeContextSummary` without breaking older session payloads
- session detail can render a compact `Based on your resume` block when `resumeEvidence` is available
- session detail distinguishes `Submit answer`, `Skip question`, and `Next question` so users cannot advance an unanswered current question by mistake
- answer submission keeps the user in the session flow while the interview remains `in_progress`
- evidence rendering can show short quoted snippets plus a small section badge such as `Project` or `Experience`, while handling unexpected future section values safely
- missing `resumeEvidence` does not break question-card rendering
- generated interview question metadata such as `contentLocale` can render as optional supporting UI without rewriting original evidence snippets
- session progress can render answered, skipped, and remaining counts when the backend exposes them
- in `full_coverage`, session summary can surface weak and skipped facet panels without blocking the main answer flow
- `coverage_extended` turns can render as subtle revisit/deep-dive prompts without overpowering the main question text
- a planner-driven `full_coverage` result can show project/experience coverage percent and section-level completion
- a completed `full_coverage` result can join `resume-map` evidence back into parsed experience/project blocks using `sourceRecordType + sourceRecordId`
- a result-time resume viewer can reveal related questions on hover and jump back to linked question cards on click
- the first result-time resume viewer can be implemented against parsed experience/project sections without requiring PDF-coordinate overlays
- highlighted resume blocks can reflect `defended`, `weak`, `skipped`, or other coverage states without breaking the base result screen
- weak/skipped facet summaries can be rendered as dedicated result panels next to the structured resume viewer
- real interview upload and transcript review flows can preserve raw, cleaned, and confirmed transcript states without collapsing them into one editable blob
- imported real-interview questions and answers can be rendered as structured timeline items rather than one monolithic transcript block
- replay simulation can start from one imported interviewer profile while still reusing the existing interview-session interaction model
- imported `real_interview` and replay-simulation question assets can coexist with existing archive and question-detail flows without breaking them
- practical interview review uses backend lane ordering, blocker copy, replay presets, and recommended targets directly instead of recomputing them in the browser
- practical interview upload accepts audio-only submissions and treats transcript preparation states `pending`, `processing`, `failed`, and `confirmed` explicitly
- practical interview detail pages can poll or refresh while transcript preparation is active and can retry transcription without forcing the user to re-upload audio
- practical interview detail and review screens can expose one shared imported-audio player when backend `playback` metadata is available
- transcript timestamps, transcript issue rows, question review rows, and follow-up thread rows can all seek into the same uploaded recording without spinning up disconnected mini players
- backend replay ranges such as `questionRange`, `answerRange`, `questionAnswerRange`, `threadRange`, and `seekRange` are used directly when present

## Feed
- popular and trending sections are rendered
- company-related sections remain supported
- additive recommendation sections such as gap-focused questions can be rendered without breaking the base feed
- cards navigate to question detail

## Profile and Resume
- user profile data is loaded
- settings can be edited
- target companies can be updated
- resume versions can be listed
- one resume version can be activated
- resume intelligence fields such as parse status, extracted skills, experiences, or risks can be added without breaking the current management flow
- resume-tailor workspace can select one resume version, create or reuse one saved job posting, run persisted analyses, preview a tailored document, and create/download PDF exports
- accepting a resume-tailor suggestion does not imply that the original resume version was overwritten
- resume heatmap can show anchor-level practical interview pressure for one resume version, linked interview questions, and manual remap controls without implying that resume or interview text changed
- resume heatmap can apply server-driven filters for scope, weak-only, company, interview date range, and overlay target type
- resume heatmap can render backend-routed `block`, `sentence`, `phrase`, and `keyword` overlay targets as interactive hotspots or rows
- resume heatmap can remap one linked question to both another anchor and one specific overlay target inside that anchor
- resume heatmap can render one selected anchor inside a structured source-viewer surface rather than only as detached analytics cards
- practical interview review can deep-link into one focused resume heatmap anchor when the reviewed question retains stable resume-anchor provenance
- resume editor can open one workspace per immutable resume version and persist block-based draft edits without overwriting the source version
- resume editor can import markdown, create comment threads and replies, create question cards, request rewrite/question suggestions, and save the resulting draft through centralized editor APIs
- resume editor can show revision history, tracked-change comparison, merge-preview recovery for stale writes, lightweight presence, and server print-preview hints
- planned resume editor V2 can render one document-centered markdown or rich-text surface instead of one repeated block-form list
- planned resume editor V2 can open one contextual popover from block or inline text selection for comment, question-card, suggestion, and source actions
- planned resume editor V2 can keep comments and question cards anchored to one stable rich selection target across saves and revisions when the backend exposes rich node ids and selection anchors
- planned resume editor V2 can persist granular node or text operations without forcing the frontend to rewrite the full document on every small edit

## API and Data Model
- endpoint usage is centralized
- typed request and response models remain explicit
- new data model elements for resume intelligence, skill radar, gap analysis, and question tree are additive
- backward compatibility is preserved where possible

## Localization
- the product can switch between Korean and English modes
- settings can persist `preferredLanguage` and the authenticated bootstrap uses it on the next load
- UI chrome, empty states, and error states respect the active locale
- user-authored content and uploaded-source content remain shown in the original language
- AI-generated interview or analysis text can follow the active system language
- mixed-language screens do not break layout or comprehension
- machine-readable API fields remain stable regardless of locale

## Quality
- app builds successfully
- route structure is coherent
- shared UI components are reused where appropriate
- loading, empty, error, and auth-required states are handled on main screens
- terminology across docs, routes, DTOs, and UI remains consistent with the current codebase
