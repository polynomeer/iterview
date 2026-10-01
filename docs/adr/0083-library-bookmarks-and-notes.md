# 0083. 보관함: Question Bookmarks, Notes, and Linked Reading

## Status
Accepted.

## Date
2026-10-01

## Context
The redesign proposal (`docs/09-ux-audit-and-redesign-proposal.md`, §4.1) puts 보관함 next to 설정: one place for questions a user wants to come back to, their own notes, and reading material. The old `/bookmarks` and `/notes` pages showed sample data and were retired (ADR 0079). 보관함 stayed unshipped until it had real data behind it.

Learning materials already exist and are linked to questions (`question_learning_materials`). Nothing stored bookmarks or personal notes.

## Decision
- A bookmark is a user–question pair (`question_bookmarks`). Bookmarking twice is a no-op.
- A note is one private plain-text body per user and question (`question_notes`, at most 5,000 characters). Saving a blank body deletes it.
- Endpoints, all for the signed-in user:
  - `GET /api/questions/{questionId}/library-state` returns whether the question is bookmarked and its note.
  - `PUT` and `DELETE /api/questions/{questionId}/bookmark` add and remove a bookmark.
  - `PUT /api/questions/{questionId}/note` saves or deletes the note.
  - `GET /api/library` returns three lists:
    - bookmarks, newest first;
    - notes, recently edited first;
    - the learning materials linked to those questions, each material once under the most relevant saved question.
- 보관함 has no separate store for reading. It shows the materials of the questions a user chose to keep, so it stays empty until they save something.
- In the web app, 보관함 is `/library`, a secondary sidebar entry above 설정. The question workspace gets the bookmark toggle and the note editor.

## Consequences
- Notes are per question, not per answer attempt or resume claim. Claim evidence has its own home (ADR 0081).
- Reading is derived, so it changes when bookmarks or notes change. Saving a material on its own would need a third table.
- Bookmarks and notes are private. Nothing in 둘러보기 or the feed reads them.
