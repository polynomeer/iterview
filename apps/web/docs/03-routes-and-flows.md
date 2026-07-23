# 03-routes-and-flows

## Routes
Current route structure remains the baseline:

- `/` -> `HomePage`
- `/practice` -> `PracticePage`
- `/questions/:questionId` -> `QuestionDetailPage`
- `/questions/:questionId/answer` -> `AnswerEditorPage`
- `/answer-attempts/:answerAttemptId/result` -> `ResultAnalysisPage`
- `/review-queue` -> `ReviewQueuePage`
- `/archive` -> `ArchivePage`
- `/interviews` -> `InterviewHistoryPage`
- `/interviews/:sessionId` -> `InterviewSessionPage`
- `/feed` -> `FeedPage`
- `/profile` -> `ProfilePage`
- `/profile/resumes` -> `ResumePage`
- `/login` -> `LoginPage`
- `/signup` -> `SignupPage`

The updated product direction should fit into these routes first. New top-level routes are optional, not required, for the advanced product model.

Implemented additive practical-interview routes:
- `/practical-interviews`
- `/practical-interviews/upload`
- `/practical-interviews/:recordId`
- `/practical-interviews/:recordId/transcript`
- `/practical-interviews/:recordId/questions/:questionId`
- `/practical-interviews/:recordId/simulate`

Implemented additive resume-tailoring routes:
- `/resume-tailor`
- `/resume-tailor/job-postings`
- `/resume-tailor/resume-versions/:versionId/analyses`
- `/resume-tailor/resume-versions/:versionId/analyses/:analysisId`

Implemented additive resume heatmap route:
- `/resume-versions/:versionId/heatmap`

Implemented additive resume editor route:
- `/resume-versions/:versionId/editor`

Practical-interview detail routes must support pre-review transcript lifecycle states before the full review workspace is available:
- `pending`
- `processing`
- `failed`
- `confirmed`

Confirmed practical-interview detail routes should also expose one shared imported-audio replay surface:
- transcript rows seek into the uploaded interview recording
- question review rows can play question, answer, or merged Q&A ranges
- thread review rows can play one thread range
- transcript, question, and thread focus should stay synchronized from server-provided timeline metadata when practical

## Home Flow
1. fetch `GET /api/home`
2. render today&apos;s primary question
3. render retry or review work separately
4. render summary stats and learning materials
5. if available, render skill radar preview and weak-skill or gap preview
6. let the user open question detail, answer editor, or review queue

Home remains the command center for the interview learning loop.

## Practice Flow
1. fetch `GET /api/questions` with filters
2. render search and filter controls
3. show question status such as `new`, `retry`, `improving`, or `archived`
4. allow users to open question detail
5. use review queue and active resume context as adjacent guidance, not blockers

## Question Detail Flow
1. fetch `GET /api/questions/{questionId}`
2. optionally fetch `GET /api/questions/{questionId}/reference-answers` and `GET /api/questions/{questionId}/learning-materials` for dedicated study panels
3. render question prompt, tags, companies, roles, materials, and user progress
4. fetch or include answer history for the current user
5. if available, render related skills, curated model answers, and follow-up tree context
6. show related learning materials in a stable reading order
7. show a clear CTA to answer the current question or a selected follow-up node

Question detail is the natural place to introduce question-tree and follow-up visualization.
Model answers must remain visually distinct from the user's own answer history.

## Answer Flow
1. load question context
2. resolve the active resume version from `GET /api/resumes`
3. render the editor with draft persistence
4. submit `POST /api/questions/{questionId}/answers`
5. navigate to result analysis

Resume-driven answering remains part of the current flow. Advanced resume intelligence should enrich the active context, not require a different answer route.

## Result Flow
1. fetch `GET /api/answer-attempts/{answerAttemptId}`
2. render total score
3. render dimension scores
4. render feedback items
5. render retry, archive, or next-review outcome
6. if available, show detailed feedback narrative, strengths, improvements, model answer, skill impact, and recommended follow-up questions
7. route the user toward practice, retry, question detail, or archive

Result analysis is where answer scoring turns into the next learning action.

## Review Queue Flow
1. fetch `GET /api/review-queue`
2. render queued items sorted by urgency
3. show why the item is queued, such as low score, stale answer, or weak skill coverage
4. allow `skip` or `done`
5. send the user back into answer practice when deeper review is needed

## Archive Flow
1. fetch `GET /api/archive`
2. render archived questions as question-level records
3. show source badges such as `Practice` and `Interview` when source metadata is available
4. support metadata filters
5. let the user revisit detail and answer history without reclassifying archive as active review work

## Interview History Flow
1. fetch `GET /api/interview-sessions` when available
2. render one card per interview session with resume version, question count, score summary, and status
3. provide a `Start Interview` CTA in the Interview tab
4. open a start sheet or inline form that lets the user select one explicit resume version for `resume_mock`
5. allow interview-mode selection such as `quick_screen`, `mock_30`, `mock_60`, `free_interview`, or `full_coverage`
6. create the session with `POST /api/interview-sessions`
7. navigate to `/interviews/:sessionId`
8. render the opening question immediately from the returned session snapshot, even when it is AI-generated and has no catalog `questionId`
9. render main questions and follow-up questions in timeline order
10. use `parentSessionQuestionId`, `depth`, and `orderIndex` for tree/timeline layout
11. render `bodyText`, `focusSkillNames`, and `resumeContextSummary` as supporting context when present
12. when available, render a compact `Based on your resume` block on the question card using one or two `resumeEvidence` snippets
13. show a small section badge such as `Project` or `Experience` when the evidence provides one, and degrade gracefully for unexpected future values
14. generated interview text may follow the active app language while `resumeEvidence.snippet`, uploaded file names, raw resume text, and user answer text stay in the original language
15. allow navigation from a session question into question detail or archive context when relevant, but do not require `questionId` for basic rendering
16. show `generationStatus` and, when useful, a small `AI Follow-up` treatment for `sourceType = ai_follow_up`
17. expose distinct session actions for `Submit answer`, `Skip question`, `Next question`, and `End interview`
18. call `POST /api/interview-sessions/{sessionId}/skip-question` to bypass the current prompt instead of faking skip state locally
19. treat `POST /api/interview-sessions/{sessionId}/next-question` as advance-only after the current question has already been answered or skipped
20. surface answered, skipped, and remaining counts in the session progress area
21. after each answer submission, keep the user inside the session while the backend returns or queues the next prompt for `in_progress` sessions
22. only transition to the final session result route when the interview session status becomes `completed`
23. after each answer or skip, expect the backend to generate or queue the next follow-up or next main question from answer + project/experience resume context
24. in `full_coverage`, show progress against currently interviewable project/experience evidence completion rather than only answered-question count
25. in `full_coverage`, surface additive `summary.weakFacetSummaries` and `summary.skippedFacetSummaries` in-session so users can distinguish weak re-validation from skipped recovery
26. if `generationStatus = coverage_extended`, treat the turn as a revisit or deep-dive prompt instead of a brand-new broad topic
25. after a full-coverage session completes, render a result view or panel with a structured resume viewer based on parsed experiences and projects instead of a raw PDF overlay for the first implementation
26. visually highlight resume blocks that were asked, defended, weak, or skipped during the interview
27. hovering one highlighted resume block should reveal a lightweight preview of related interview questions
28. clicking one highlighted resume block should pin the related questions and let the user jump or scroll back to the linked question card
29. join result-map evidence back into parsed experience and project blocks using `sourceRecordType + sourceRecordId`

## Feed Flow
1. fetch `GET /api/feed`
2. render popular and trending sections
3. optionally render company-related or skill-gap-related recommendations
4. open question detail from any feed card

## Profile Flow
1. fetch `GET /api/me`
2. edit profile, scoring settings, and target companies
3. surface the active resume version summary
4. optionally surface readiness or radar summary fields when available

## Resume Flow
1. fetch `GET /api/resumes`
2. create resume containers
3. upload a PDF with `POST /api/resumes/{resumeId}/versions/upload`
4. poll `GET /api/resume-versions/{versionId}` until `parsingStatus` is no longer `pending`
5. allow authenticated download with `GET /api/resume-versions/{versionId}/file` when needed
6. activate a version for answer evaluation
7. load parsed profile, contacts, competencies, skills, experiences, projects, and risks for the active or selected version
8. render project cards with title, content, category label, and tag chips when available
9. use those insights to drive question discovery and answer review
10. open `/resume-versions/:versionId/heatmap` to inspect practical interview pressure around parsed resume anchors and correct wrong question-to-anchor links

## Resume Editor Flow
1. open `/resume-versions/:versionId/editor`
2. bootstrap or read one editor workspace with `GET /api/resume-versions/{versionId}/editor`
3. render one draft document layered on top of one immutable resume version
4. current implementation can fall back to markdown-first editing from `document.markdownSource`, but the planned V2 editor should prefer one rich document surface instead of one repeated block form list
5. in the planned V2 contract, clicking a block or selecting one sentence or phrase should open one contextual popover for:
   - comment
   - question card
   - auto-question suggestion
   - rewrite suggestion
   - heatmap or source-inspection actions
6. V2 should persist granular rich-document changes with `PATCH /api/resume-versions/{versionId}/editor/document/operations`
7. full document replacement and markdown import remain valid:
   - `PUT /api/resume-versions/{versionId}/editor/document`
   - `POST /api/resume-versions/{versionId}/editor/import-markdown`
8. comment threads, question cards, and deterministic suggestion requests should anchor to one rich selection target instead of only one flat `blockId`
9. show lightweight presence, revision history, tracked-change comparison, and print-preview views without implying real-time coauthoring or pixel-perfect print layout
10. if a write is stale, request merge assistance with `POST /api/resume-versions/{versionId}/editor/merge-preview` and let the user re-save intentionally
11. if `heatmapAvailable = true`, link the user into the resume heatmap from the editor workspace

Planned V2 editor flow requires additive backend changes. The current live API remains block-oriented enough for a markdown workspace, but true Notion-level nested editing, slash commands, and stable inline annotation anchors need a richer document contract.

Resume upload UI states should be explicit:
- uploading
- parsing pending
- parsing completed
- parsing failed

On parse failure:
- keep the failed version visible in the version list
- show `parseErrorMessage` if present
- do not automatically replace the current active version

## Resume Tailoring Flow
1. enter the tailoring workspace from `/resume-tailor`
2. choose one immutable resume version as the source
3. create or reuse one saved job posting from:
   - pasted text
   - source link fetch
4. create one persisted analysis for that version with optional:
   - `jobPostingId`
   - `preferredFormatType`
5. open `/resume-tailor/resume-versions/:versionId/analyses/:analysisId`
6. render score, match summary, strong matches, missing keywords, weak signals, and focus areas
7. render ordered suggestions and let users toggle acceptance without mutating the source resume version
8. render `tailoredDocument` as the primary preview artifact when available
9. render export history and create/download server-side PDF exports
10. show enough original resume-derived context such as profile, skills, experiences, and projects for mental comparison against the tailored preview

## Resume Interview Heatmap Flow
1. open one parsed resume version
2. navigate to `/resume-versions/:versionId/heatmap`
3. load parsed resume anchor context plus:
   - `GET /api/resume-versions/{versionId}/question-heatmap`
   - `GET /api/resume-versions/{versionId}/question-heatmap/overlay-targets`
4. preserve additive filter state in the URL when practical:
   - `scope`
   - `weakOnly`
   - `companyName`
   - `interviewDateFrom`
   - `interviewDateTo`
   - `targetType`
   - selected anchor and selected overlay target
5. switch between `all`, `main`, and `follow_up` scopes and inspect backend-provided filter-summary chips for weak, pressure, follow-up, company, and target-type counts
6. inspect which anchors triggered the most direct questions, follow-ups, pressure prompts, and weak answers
7. drill from whole-anchor cards into a structured resume-source viewer with nested `block`, `sentence`, `phrase`, or `keyword` overlay targets before opening linked questions
8. open linked practical interview review or linked study question screens from the linked-question panel, and allow practical interview review to deep-link back into one focused heatmap anchor when resume linkage is known
9. save a manual remap when one practical interview question belongs to the wrong resume anchor or wrong overlay target inside that anchor
10. refresh the additive heatmap read model without implying that the underlying resume version or question text changed

## Interview Learning Loop
1. user activates a resume version
2. user can also start an interview by explicitly choosing a resume version in the Interview tab
3. backend generates the opening interview question from project or experience evidence in the selected resume
4. user answers inside the session
5. backend generates follow-up questions from answer + project/experience resume context when appropriate
6. result analysis updates scoring and improvement signals
7. weak performance generates or updates review queue items
8. radar and gap summaries change over time
9. interview sessions are tracked separately in interview history while every asked interview question can still appear in archive with `Interview` source metadata

This loop should guide documentation and future implementation choices more than any single screen.

## Practical Interview Replay Flow
1. upload one real interview audio file with company, role, date, optional resume, and optional JD linkage
2. optionally paste a transcript override, or rely on backend audio transcription
3. if transcription is `pending` or `processing`, stay on the record detail page and poll or refresh status
4. if transcription is `failed`, show retry metadata and use backend retry-transcription instead of re-uploading the audio
5. once transcription is `confirmed`, review raw transcript, cleaned transcript, and speaker segmentation
6. edit transcript segments, speaker labels, and question/answer boundaries when needed
7. inspect the structured interview record with:
   - question list
   - answer list
   - follow-up graph
   - interviewer-style summary
8. open one imported question as a standalone study asset or archive-linked detail
9. start a replay simulation from the imported interview using:
   - original replay
   - similar pattern
   - pressure variant
10. run the replay simulation through the existing interview session UI
8. use the server-provided review payload to drive transcript, question, and follow-up-thread review lanes instead of rebuilding heuristics on the client
