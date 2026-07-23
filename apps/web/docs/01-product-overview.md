# 01-product-overview

Shared product direction now lives in:

- `../../../docs/01-product-foundation.md`

This directory should keep frontend-specific product detail only.

Frontend-specific follow-up documents:

- `02-frontend-architecture.md`
- `03-routes-and-flows.md`
- `04-api-integration.md`
- `05-implementation-plan.md`
- `06-acceptance-criteria.md`

### 4. Knowledge Depth
- represent follow-up questions as a tree or graph rooted in a primary question
- expose model answers separately from user answer history
- expose related learning materials as study support, not as part of the user's score
- help users see what they answered, what they skipped, and where depth is missing
- preserve the existing question detail screen as the main entry point

### 5. Review and Improvement
- use answer scores, weak dimensions, confidence, and staleness to form a review queue
- show how a retry answer improved over prior attempts
- keep archive question-level even when the question came from an interview session
- show `Practice` and `Interview` source badges in archive when source metadata is available

### 6. Interview History
- let users start a mock interview from the Interview tab by selecting a specific resume version
- use the selected resume version as the grounding context for the first AI interview question
- support interview modes such as quick screen, 30-minute mock, 60-minute mock, free interview, and `full_coverage`
- store and render one history card per mock interview session
- let users open a session detail view to review the full question and follow-up flow
- generate follow-up questions from the user's answer and project/experience evidence in the selected resume context during the same session
- when available, show a compact `Based on your resume` snippet on the question card so users can see which project or experience evidence triggered the question
- in `full_coverage`, aim to cover all currently interviewable project and experience evidence units rather than every parsed resume section
- after completion, show a resume viewer where hovering one resume sentence or structured evidence item reveals related questions and clicking it jumps back to the linked question card
- keep session history distinct from archive so archive remains question-level
- keep every asked interview question and follow-up visible as question-level archive entries with `Interview` source treatment

### 7. Practical Interview Replay
- allow users to upload one real interview recording and process it into reusable learning assets
- keep raw transcript, cleaned transcript, and confirmed transcript as separate review layers
- expose structured question, answer, and follow-up relationships from the imported interview
- derive interviewer-style traits and use them to start a replay-oriented simulation later
- keep imported real-interview questions discoverable as question-level study assets instead of burying them inside one long transcript screen
- let replay simulation reuse the existing interview-session UI while anchoring question strategy in one imported real interview record

### 7. Bilingual Experience
- support `ko` and `en` product modes for the surrounding UI
- keep uploaded resumes, answer text, and other user-authored source content in the original language
- allow AI-generated interview questions, follow-ups, and analysis text to follow the selected system language
- support mixed-language screens where UI and generated text are localized but resume evidence or answers remain in the original language

## MVP Frontend Responsibilities
- render the existing learning loop clearly on mobile-first layouts
- keep route-level logic in `pages`
- keep server state in React Query and API contracts in `shared/api` and `shared/types`
- support typed, backward-compatible REST responses
- tolerate additive response fields for radar, gaps, question tree, and review insights
- preserve loading, empty, error, and auth-required states on main screens

## Integration Principles
- do not remove working features that already map to the current codebase
- extend existing endpoints before introducing new top-level resources
- prefer optional additive fields in responses so older clients keep working
- keep terminology aligned with the frontend today:
  - `review queue` for retry work
  - `result analysis` for answer evaluation
  - `archive` for mastered questions
  - `resume version` for the active interview context

## Out of Scope
- lounge and discussion flows
- public answer comparison
- GitHub sync UI
- admin screens

Mock interview and company-style interview mode should now be treated as additive extensions of the same resume -> question -> answer -> review loop, with interview history separated from archive and Interview-tab start flow grounded in an explicit resume selection.
