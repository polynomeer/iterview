# 01-product-overview

## Product Summary
This frontend serves an interview training product for experienced candidates. The current implementation already supports the core practice loop:

- receive a daily interview question
- browse and filter practice questions
- review question detail and learning materials
- write an answer tied to the active resume version
- review score and feedback
- revisit weak questions through the review queue
- track mastered questions in the archive
- manage profile, target companies, and resume versions
- save job postings, run resume-tailoring analyses, and export tailored resume PDFs
- inspect a resume interview heatmap that maps practical interview questions back onto parsed resume anchors

The updated product direction extends that loop into a resume-driven interview learning system:

- active resume content informs question selection and answer evaluation
- answer results update skill-level readiness and gap signals
- question detail expands into follow-up depth and question-tree context
- curated model answers and related learning materials support deeper study after answering
- low-confidence or low-scoring answers feed a review queue
- home surfaces the next best action across today, retry, radar, and gaps
- AI-driven mock interviews generate session history and interview-originated archive records
- the product can be used in Korean or English without overwriting the original language of user content

## Product Direction
The product should help a user move through this learning loop:

```text
Resume version
-> extracted skills and experience evidence
-> resume-linked questions and follow-up tree
-> answer submission
-> skip when the current prompt should be bypassed
-> answer analysis and dimension scoring
-> skill radar and gap updates
-> review queue and next-question recommendation
```

This is an extension of the existing system, not a replacement for it. The current screen model remains valid and new intelligence should be added through the same route structure and typed API layer.

## Core Experience Pillars
### 1. Guided Daily Practice
- keep today&apos;s main question prominent on home
- separate retry and review work from fresh practice
- make the next action obvious after each answer

### 2. Resume-Driven Preparation
- let users manage multiple resume containers and versions
- treat one active resume version as the source of interview context
- allow PDF resume upload as a new immutable resume version
- expose version-level parsing status so the UI can distinguish `pending`, `completed`, and `failed`
- expose parsed resume skills, experiences, projects, and risk hints as additive data
- treat resume-derived projects as first-class cards with title, content, category, and tags when available
- let users layer job-aware tailoring analyses, accepted suggestions, and PDF exports on top of immutable resume versions without overwriting the source document
- let users open a resume interview heatmap that shows which parsed anchors drew the most practical interview pressure and follow-up depth

### 3. Skill Intelligence
- summarize progress by skill category, not only by question history
- show gap analysis against the user&apos;s role, experience, and target companies
- keep radar and gap summaries actionable, not decorative

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
