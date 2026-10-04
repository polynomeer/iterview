# 0086. Full Coverage Asks Each Resume Detail At Most Twice

## Status
Accepted.

## Date
2026-10-04

## Context
A full-coverage resume interview walks through every evidence item taken from the resume. When nothing was left unasked, the planner picked weak items, then skipped items, then any item, with no limit. A user who skipped a detail got the same "let's come back to this" question again and again. The session never ended on its own.

Evidence also came from any line stored as an experience or project. When the fallback parser mistook the name and headline for an experience, the interview kept asking about "Name Backend Engineer". Unlabeled items all used the same question title, so the question list read as one sentence repeated.

## Decision
- An evidence item is asked at most twice in a session: the first question, plus one revisit when it was weak, skipped, or chosen for a deeper pass. Follow-ups linked to the item count toward the two. When no item has a question left, the session completes.
- An evidence snippet must be at least 15 characters and contain at least three distinct words beyond the resume's header lines (name, headline, contacts). Shorter snippets are not interview evidence.
- A question about an unlabeled item quotes the start of its snippet in the title, for example 이 경험(“SQS 이벤트 파이프라인…”)에서.

## Consequences
- Skipping is final after one revisit, so a full-coverage session ends after at most twice as many planned questions as it has evidence items.
- Coverage can still pass 100%: defended items get one deeper question each before the session ends.
- Resume details that are only a title or a name do not become questions. If a real claim is that short, it is not covered.
