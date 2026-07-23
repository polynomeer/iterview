Read AGENTS.md, docs/03-routes-and-flows.md, docs/04-api-integration.md, docs/05-ui-structure.md, docs/07-acceptance-criteria.md, and the existing frontend code first.

Implement the AnswerEditorPage for iterview-web.

Scope:
- answer writing screen
- answer submission flow
- draft-like local editing support for the session
- navigation to result analysis after submit

Requirements:
- integrate with:
  - GET /api/questions/{questionId}
  - POST /api/questions/{questionId}/answers
- provide a text answer input experience for MVP
- display the current question context while writing
- support:
  - answer text input
  - submit action
  - disabled submit state when invalid
  - local unsaved editing state for the current session
- create reusable components for:
  - QuestionPromptCard
  - AnswerTextEditor
  - SubmitActionBar
- validate basic answer form requirements on the client
- handle loading, submit-pending, success, and error states
- navigate to ResultAnalysisPage after successful submission
- keep business rules on the backend; frontend validation should remain minimal

Out of scope:
- voice recording
- transcript handling
- rich text formatting
- autosave to backend draft APIs unless already implemented

When finished:
1. summarize AnswerEditorPage structure
2. summarize form state strategy
3. explain submit flow and navigation
4. list assumptions about answer submission response fields
