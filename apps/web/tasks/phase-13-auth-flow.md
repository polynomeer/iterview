Read AGENTS.md, docs/04-api-integration.md, docs/07-acceptance-criteria.md, and the existing frontend code first.

Finalize the frontend authentication flow and protected-route behavior for iterview-web.

Scope:
- login screen
- auth-aware navigation
- protected routes
- logout flow

Requirements:
- integrate with backend authentication endpoints already implemented
- create a clean login screen
- ensure protected routes redirect unauthenticated users appropriately
- ensure authenticated users are redirected away from login when appropriate
- implement logout behavior that clears auth state and invalidates relevant queries
- make current-user loading behavior predictable at app startup
- keep auth logic centralized

Out of scope:
- signup design polish
- forgot password
- social login
- advanced session refresh handling beyond MVP

When finished:
1. summarize auth flow
2. summarize protected route logic
3. explain app startup auth behavior
4. list assumptions and remaining auth TODOs
