Read AGENTS.md, README.md, docs/04-api-integration.md, docs/06-implementation-plan.md, docs/07-acceptance-criteria.md, and the existing frontend code first.

Implement the API client, environment configuration, and frontend auth foundation for iterview-web.

Requirements:
- create a centralized typed API client
- configure environment variable handling for backend base URL
- create shared request/response typing strategy
- add auth token storage strategy suitable for MVP
- create a reusable current-user query hook
- add route guard support for authenticated screens
- create a minimal login flow page structure
- keep API integration isolated from UI components
- use React Query for server state
- use a consistent error mapping strategy for API errors

Include:
- shared/api/http client
- shared/api/query client configuration
- shared/types for core API DTOs
- auth utilities for token persistence
- route guard abstraction for protected screens

Out of scope:
- signup UX polish
- social login
- refresh token hardening
- production auth security details

When finished:
1. summarize API client structure
2. summarize environment variables used
3. summarize auth state handling
4. list assumptions about backend auth endpoints
