# 0087. Record the Initial Technology Selection

## Status
Accepted

## Date
2026-10-05

## Context

This ADR was written on 2026-10-05. It reconstructs the reasons for the technology choices visible in the
initial monorepo commits (`5c51675` through `a753094`, 2026-07-23, with the apps imported in `cf4c803` and
`e316471`) and in the documents those commits carried. No earlier document compared these choices with
alternatives, so the "why" below is a reconstruction, not a record of a discussion that took place.
Statements marked "repo:" come from files in those commits. Statements about third-party tools come from
their official documentation (see Sources).

Requirements the initial documents state (repo: `apps/api/docs/01-product-overview.md`,
`apps/api/docs/02-backend-architecture.md`, `apps/api/AGENTS.md`, `docs/monorepo-conventions.md`):

- one learning loop: resume PDF -> immutable resume version -> raw text -> LLM extraction -> question
  selection -> answer -> score and feedback -> retry queue and archive -> next question
- answer attempts and resume versions are immutable; user progress is a cached aggregate per user-question
- answer submission, scoring, feedback, progress update, and retry scheduling run in one transaction
- every schema change is a Flyway migration; Hibernate does not own the schema (`ddl-auto: validate`)
- package-by-domain; business rules in services; parsing, LLM calls, transcription, and analysis stay
  "behind service interfaces" and "should not leak into controllers"
- a deterministic non-LLM fallback keeps local development usable without AI credentials
- `ko` and `en`; user-authored text is stored in its original language
- backend and frontend stay buildable independently; no root build orchestrator unless there is a need

## Decision

The choices below were already in place in the initial commits. This ADR records them with the
alternatives they implicitly rejected.

### 1. Repository layout: peer apps in one repository, no shared build tool

Chosen: `apps/api` (Gradle) and `apps/web` (npm) side by side; root `scripts/` and one root CI workflow
call each app's own build.

| Option | Fit to the stated needs |
| --- | --- |
| Two separate repositories (the state before `cf4c803`) | API contract docs and frontend integration docs drift; two CI pipelines |
| One repository with a workspace tool (npm workspaces, Gradle composite build) | npm workspaces manage multiple npm packages under one root package; a Gradle composite build includes other Gradle builds. Each covers one toolchain, and the repo has one package per toolchain |
| Peer apps plus thin shell scripts (chosen) | Matches "preserve each app's own build system" and "do not introduce a root build orchestrator unless there is a concrete need" (repo: `AGENTS.md`) |

Cost: no affected-only builds or shared caching; CI runs both apps on every change. Cross-app types are
not shared, so `04-api-contracts.md` and `04-api-integration.md` must be kept aligned by hand.

### 2. Backend language and framework: Kotlin 1.9 on Spring Boot 3.3, Spring MVC, Java 21

| Option | Fit |
| --- | --- |
| Java on Spring Boot | Same ecosystem; loses Kotlin's compile-time null-safety on DTOs and entities |
| Kotlin on Ktor | Ktor describes itself as an asynchronous framework written in Kotlin; the repo needs JPA, Bean Validation, Spring Security, and springdoc, which Ktor does not bundle |
| Node.js (NestJS or similar) | One language with the frontend; PDF parsing (PDFBox) and the JPA/Flyway stack would be replaced rather than reused |
| Kotlin on Spring Boot, servlet stack (chosen) | Spring Boot 3.3 requires Java 17 or later; the build pins Java 21. `-Xjsr305=strict` makes Spring API nullability visible to Kotlin, which Spring Boot's Kotlin docs say is required for that |

Cost: `kotlin("plugin.spring")` and `kotlin("plugin.jpa")` are required because Kotlin classes are final by
default and JPA needs a no-arg constructor. Spring's docs warn that strict JSR-305 checks can change
between minor releases. Blocking MVC means long LLM calls hold a request thread; timeouts are set per
client (repo: `app.interview.llm.timeout-seconds`, default 30).

### 3. Architecture style: one deployable, package-by-domain

Chosen: a single Spring Boot application with domain packages (`auth`, `user`, `resume`, `question`,
`answer`, `review`, `dailycard`, `feed`, `interview`, `skill`, `jobposting`) and a fixed internal layout
(`controller`, `service`, `repository`, `entity`, `dto`, `mapper`, `enum`).

| Option | Fit |
| --- | --- |
| Microservices per domain | The core transaction spans `answer`, `review`, and `user_question_progress`; splitting it needs distributed coordination |
| Package-by-layer | Spreads one domain across the tree; the docs ask new features to fit the existing domain folders |
| Spring Modulith | An opinionated toolkit for modular Spring Boot apps that can verify module structure; not adopted, so boundaries are enforced only by convention and review |
| Package-by-domain monolith (chosen) | One transaction for the answer pipeline; one database |

Cost: nothing stops one domain's service from calling another domain's repository. The initial docs rely on
rules ("Do not move product rules into `common`") rather than a tool.

### 4. Primary database: PostgreSQL 16 with Flyway and Spring Data JPA

| Option | Fit |
| --- | --- |
| MySQL 8 | DDL statements such as `CREATE TABLE` and `ALTER TABLE` cause an implicit commit, so a failed migration can leave a partial schema |
| MongoDB | The schema is relational: users, resumes, versions, questions, attempts, progress, review items, sessions, and their link tables |
| PostgreSQL (chosen) | Transactional DDL lets a failed migration roll back; Testcontainers has a PostgreSQL module |

Data access is JPA with `ddl-auto: validate` and `open-in-view: false`; Flyway owns the schema (37
migrations at import, repo: `db/migration/V1`..`V37`).

Cost: JPA entities in Kotlin need the plugins above. Tests need Docker because integration tests run
against a real PostgreSQL container instead of an in-memory database.

### 5. No cache or message broker; background work with `@Async` and a DB-backed retry scheduler

Chosen: synchronous request handling for most flows. Practical-interview transcription runs in an
`@Async` `@TransactionalEventListener(phase = AFTER_COMMIT)` and a `@Scheduled` job re-queues timed-out or
retry-eligible records based on columns in the record table (repo:
`PracticalInterviewTranscriptProcessingListener`, `PracticalInterviewTranscriptRetryScheduler`, `V28`).

| Option | Fit |
| --- | --- |
| Kafka or RabbitMQ | Durable delivery; one more stateful service for a single background pipeline |
| Spring Modulith event publication registry | Writes an event publication log in the business transaction and leaves failed entries for retry; another dependency |
| `@Async` after commit plus status columns and a scheduler (chosen) | The record's own status is the durable state; the scheduler recovers stuck or failed work |

No cache: the docs say denormalized read models "are acceptable if introduced later for performance" and
no read path in the initial code uses one.

Cost: the in-memory event is lost if the process stops after commit; recovery waits for the scheduler
interval (default 60 s, `retry-scheduler-delay-ms`). Work does not spread across instances.

### 6. LLM and speech-to-text integration: OpenAI over plain HTTP behind domain interfaces

Chosen: each use (opening question, follow-up, answer deep feedback, question reference content,
transcript labeling, transcript structuring) has its own interface and an OpenAI client that posts to the
Responses API with `text.format.type = json_schema` and `strict: true`, through a small
`java.net.http.HttpClient` transport. When the API key is blank, `isEnabled()` is false and services use a
deterministic fallback. Transcription is switchable between the OpenAI transcriptions endpoint and a local
`whisper-cli` (whisper.cpp) process.

| Option | Fit |
| --- | --- |
| Official OpenAI Java SDK | Typed client; adds a dependency and its release cadence to every domain that calls the model |
| A multi-provider abstraction library | Provider portability; more indirection than six narrow interfaces need |
| Plain HTTP with strict JSON Schema output (chosen) | Structured Outputs guarantee schema adherence, so parsing into Kotlin types is predictable; `base-url` and `model` are configuration |
| Local whisper.cpp for transcription | Plain C/C++ with CPU and Apple Silicon support; no audio leaves the machine; quality and speed depend on the host |

Cost: request and response shapes are hand-written per client; the transports duplicate code
(`InterviewLlmApiTransport`, `ResumeLlmApiTransport`). The OpenAI transcription endpoint accepts files up to
25 MB, so the client splits longer audio with `ffmpeg` (repo: `max-file-size-bytes` 26214400,
`segment-seconds` 480) while uploads may be up to 50 MiB.

Answer scoring itself is deterministic (repo: `ScoringService`, text features and keyword hits); the LLM
adds optional deep feedback, so the core score does not depend on a model call.

### 7. Authentication: HMAC-signed bearer token issued by the API

Chosen: `SignedTokenService` signs `userId|email|expiresAt` with HmacSHA256 and a configured secret; a
servlet filter parses `Authorization: Bearer`. The web app keeps the token in `localStorage`.

| Option | Fit |
| --- | --- |
| Server-side session with cookie | Needs server-side session state; the SPA is served from a different origin than the API in development, so cookies would also need cross-origin settings |
| JWT via a library | JWT is a standard claims format with registered claims such as `exp` and `sub`; the payload here needs only user id, email, and expiry, and a library is one more dependency |
| External identity provider (OAuth/OIDC) | `users.provider` exists in the schema, but no provider was integrated |
| Minimal HMAC token (chosen) | Stateless, a few dozen lines, constant-time signature check |

Cost: no revocation before expiry (TTL default 86400 s); a custom format instead of a standard. OWASP
advises against keeping session identifiers in `localStorage`, because any XSS can read it.

### 8. Frontend: React 19 SPA on Vite 6 with React Router 7 and TanStack Query 5

| Option | Fit |
| --- | --- |
| Next.js | A full-stack React framework; the repo already has a separate API, and the docs list no SSR or SEO need |
| React Router framework mode | Vite-based framework features; the app uses React Router as a client router only |
| Vite SPA (chosen) | Vite serves native ES modules in development and bundles for production; deploys as static files |

Server state goes through TanStack Query; local state stays in components (repo:
`apps/web/docs/02-frontend-architecture.md`). Folders follow the Feature-Sliced Design layer names
(`app`, `pages`, `widgets`, `features`, `entities`, `shared`), although the docs do not name FSD.

Cost: React's docs note that building from scratch is "often the same as building your own adhoc
framework"; routing, data loading, and code splitting are the app's own. The first build already warned
about a large main chunk (repo: `docs/monorepo-status.md`).

### 9. Verification and local runtime

- Tests: JUnit 5 with Testcontainers PostgreSQL (`@ServiceConnection` supplies connection details);
  Vitest and Testing Library on the web side.
- Local runtime: `apps/api/docker-compose.yml` runs only `postgres:16-alpine`; the API and web run on the
  host (`scripts/dev_all.sh`). A full Compose stack came later (`e03c6ff`, 2026-08-20).
- CI: one GitHub Actions workflow sets up JDK 21 and Node 20 and runs `scripts/verify_all.sh ci`.
- Observability: none beyond Spring logging at this point.

## Consequences

Positive:

- The reasons for the initial stack are written down next to the later ADRs that changed parts of it.
- Readers can tell which statements come from the repository and which are reconstruction.

Trade-offs:

- Because this is a reconstruction, it may assign reasons that were not considered at the time. Later
  ADRs remain the authority for decisions made after 2026-07-23.

## Sources

- Spring Boot 3.3 system requirements: https://docs.spring.io/spring-boot/3.3/system-requirements.html
- Spring Boot 3.3 Kotlin support: https://docs.spring.io/spring-boot/3.3/reference/features/kotlin.html
- Kotlin all-open plugin: https://kotlinlang.org/docs/all-open-plugin.html
- Kotlin no-arg plugin: https://kotlinlang.org/docs/no-arg-plugin.html
- Ktor README: https://github.com/ktorio/ktor
- Spring Modulith reference: https://docs.spring.io/spring-modulith/reference/
- Spring Modulith events: https://docs.spring.io/spring-modulith/reference/events.html
- Spring transaction-bound events: https://docs.spring.io/spring-framework/reference/data-access/transaction/event.html
- MySQL 8.0 implicit commit: https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html
- PostgreSQL wiki, transactional DDL: https://wiki.postgresql.org/wiki/Transactional_DDL_in_PostgreSQL:_A_Competitive_Analysis
- Testcontainers PostgreSQL module: https://java.testcontainers.org/modules/databases/postgres/
- Spring Boot Testcontainers support: https://docs.spring.io/spring-boot/3.3/reference/testing/testcontainers.html
- OpenAI Structured Outputs: https://developers.openai.com/api/docs/guides/structured-outputs
- OpenAI speech to text: https://developers.openai.com/api/docs/guides/speech-to-text
- OpenAI Java SDK: https://github.com/openai/openai-java
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Apache PDFBox: https://pdfbox.apache.org/
- RFC 7519 (JWT): https://www.rfc-editor.org/rfc/rfc7519
- OWASP HTML5 Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html
- npm workspaces: https://docs.npmjs.com/cli/v10/using-npm/workspaces
- Gradle composite builds: https://docs.gradle.org/current/userguide/composite_builds.html
- React, build a React app from scratch: https://react.dev/learn/build-a-react-app-from-scratch
- Next.js docs: https://nextjs.org/docs
- Vite, why Vite: https://vite.dev/guide/why
- TanStack Query overview: https://tanstack.com/query/latest/docs/framework/react/overview
- Feature-Sliced Design layers: https://feature-sliced.design/docs/reference/layers
