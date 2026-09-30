# Redesign Proposal Mockups

Static design mockups for [`docs/09-ux-audit-and-redesign-proposal.md`](../../09-ux-audit-and-redesign-proposal.md).

Every screen uses only the tokens and primitives in `proposal.css`; `shell.js` injects the proposed
navigation shell (5-area sidebar / mobile tab bar) and the single line-icon set. Pink numbered
markers map to the "개선 포인트" list at the bottom of each screen.

## Screens

| File | Screen | Replaces current routes | Render |
| --- | --- | --- | --- |
| `00-design-system.html` | Tokens, type, spacing, radius, components (light + dark) | `app/styles/global.css` theme sets | [light](renders/00-design-system.png) · [dark](renders/00-design-system-dark.png) |
| `01-today.html` | Today | `/` | [light](renders/01-today.png) · [dark](renders/01-today-dark.png) |
| `02-question-map.html` | Questions: tree + detail + inspector | `/practice`, `/questions/:id`, `/questions/:id/tree`, `/skills` | [light](renders/02-question-map.png) · [dark](renders/02-question-map-dark.png) |
| `03-answer.html` | Focused answer editor | `/questions/:id/answer` | [light](renders/03-answer.png) |
| `04-result.html` | Evaluation result | `/answer-attempts/:id/result` | [light](renders/04-result.png) |
| `05-review.html` | Review hub (tabs) | `/review-queue`, `/scheduled-reviews`, `/weak-nodes`, `/archive` | [light](renders/05-review.png) · [dark](renders/05-review-dark.png) |
| `06-resume.html` | Resume hub: claims + evidence | `/profile/resumes*`, `/resume-versions/*`, `/resume-tailor/*` | [light](renders/06-resume.png) |
| `07-interview.html` | Interview: mock setup + live session | `/interviews*`, `/practical-interviews*`, legacy `/interview*` | [light](renders/07-interview.png) |
| `08-settings.html` | Settings | `/profile`, `/settings`, `/target-companies` | [light](renders/08-settings.png) |
| `09-auth.html` | Login | `/login`, `/signup` | [light](renders/09-auth.png) |
| `10-search-and-states.html` | Command palette + loading/empty/error/404 | `CommandPalette`, shared state cards | [light](renders/10-search-and-states.png) |
| `11-mobile-today.html` | Mobile today | `/` (mobile) | [light](renders/11-mobile-today.png) |
| `12-mobile-answer.html` | Mobile answer | `/questions/:id/answer` (mobile) | [light](renders/12-mobile-answer.png) |
| `13-mobile-review.html` | Mobile review | review routes (mobile) | [light](renders/13-mobile-review.png) |
| `14-ia-map.html` | Current vs. proposed information architecture | all routes | [light](renders/14-ia-map.png) |

## Viewing

Open any HTML file directly, or serve the folder to switch themes with `?theme=dark`:

```bash
python3 -m http.server 8765 --directory docs/references/redesign-proposal
```

Content (names, scores, companies) is illustrative sample data, not product data.
