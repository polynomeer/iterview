Read AGENTS.md, README.md, docs/03-routes-and-flows.md, docs/05-ui-structure.md, docs/06-implementation-plan.md, and docs/07-acceptance-criteria.md first.

Implement the frontend foundation for iterview-web.

Tech stack:
- React
- TypeScript
- Vite
- React Router
- React Query

Requirements:
- initialize the frontend project structure
- configure React Router
- configure React Query
- create a mobile-first app shell
- create shared folders and base module structure
- create route-level page placeholders for:
  - HomePage
  - QuestionDetailPage
  - AnswerEditorPage
  - ResultAnalysisPage
  - PracticePage
  - ArchivePage
  - FeedPage
  - ProfilePage
  - ResumePage
  - LoginPage
- create reusable layout building blocks:
  - AppLayout
  - Header
  - BottomTabBar
  - PageContainer
- use package/module structure consistent with AGENTS.md
- keep UI simple and clean
- keep routing centralized
- add a typed route configuration

Recommended structure:
- src/app
- src/pages
- src/features
- src/entities
- src/shared
- src/widgets

Out of scope:
- real API integration
- real authentication
- advanced styling system
- mock interview
- lounge
- GitHub sync

When finished:
1. summarize created folders and files
2. summarize the route structure
3. summarize shared layout components
4. list assumptions and TODOs
