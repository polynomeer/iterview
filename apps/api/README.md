# Interview Training Platform Backend

`apps/api` is the backend service for `iterview`. It owns authentication, resume and question data, answer scoring, review workflows, interview-session APIs, and persistence.

## What This Service Is Responsible For

The backend powers the product loop below:

```text
profile + resume context
-> question selection
-> answer submission
-> scoring and feedback
-> retry queue or archive decision
-> next recommended learning action
```

Today that responsibility extends into adjacent product areas such as:
- resume parsing and structured resume workflows
- skill intelligence endpoints
- job-posting and resume-tailoring related APIs
- mock interview sessions and practical interview replay support
- bilingual response support for Korean and English

## Implemented Domain Areas

The codebase currently contains domain packages for:
- `auth`
- `user`
- `resume`
- `question`
- `answer`
- `review`
- `dailycard`
- `feed`
- `interview`
- `jobposting`
- `skill`
- `common`

The repository follows package-by-domain and keeps controllers, services, repositories, entities, DTOs, and mappers inside each domain.

## Tech Stack

- Kotlin 1.9
- Spring Boot 3.3
- Spring Web
- Spring Security
- Spring Data JPA
- Flyway
- PostgreSQL
- springdoc OpenAPI / Swagger UI
- Testcontainers for integration tests

## Quick Start

### 1. Start PostgreSQL

```bash
docker compose up -d postgres
```

Default local database values:
- host: `localhost`
- port: `5432`
- database: `iterview`
- username: `iterview`
- password: `iterview`

These can be overridden through the compose environment variables:
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

### 2. Run the API

```bash
./gradlew bootRun
```

The app defaults to the `local` Spring profile, so a local run does not need extra flags.

Default local URLs:
- API base URL: `http://localhost:8080`
- health check: `http://localhost:8080/api/health`
- liveness probe: `http://localhost:8080/api/health/live`
- readiness probe: `http://localhost:8080/api/health/ready`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### 3. Optional: seed demo data

```bash
PGPASSWORD=iterview psql -h localhost -p 5432 -U iterview -d iterview -f scripts/seed_dummy_data.sql
```

Demo credentials after seeding:
- email: `demo@example.com`
- password: `password123`

## Local Verification

Recommended local verification before handing off backend changes:

```bash
./gradlew test
./gradlew build
```

Notes:
- integration tests rely on Testcontainers
- Docker support is expected for the full test suite

## Runtime Configuration

### Spring Profiles

- `application.yml`
  Shared application defaults.
- `application-local.yml`
  Local datasource, local auth secret, Swagger enablement, and permissive local CORS defaults.
- `application-prod.yml`
  Production-oriented settings that require explicit environment configuration.

Run with the production profile explicitly when needed:

```bash
SPRING_PROFILES_ACTIVE=prod ./gradlew bootRun
```

### Key Environment Variables

#### Core service configuration

- `DB_URL`
  Default: `jdbc:postgresql://localhost:5432/iterview`
- `DB_USERNAME`
  Default: `iterview`
- `DB_PASSWORD`
  Default: `iterview`
- `SERVER_PORT`
  Default: `8080`
- `AUTH_TOKEN_SECRET`
  Default: `dev-only-secret-change-me`
- `AUTH_TOKEN_TTL_SECONDS`
  Default: `86400`

#### CORS, upload, and authentication limits

- `APP_CORS_ALLOWED_ORIGINS`
  Explicit fixed origins.
- `APP_CORS_ALLOWED_ORIGIN_PATTERNS`
  Default local patterns include localhost and `127.0.0.1`.
- `APP_MULTIPART_MAX_FILE_SIZE`
  Default: `50MB`
- `APP_MULTIPART_MAX_REQUEST_SIZE`
  Default: `55MB`
- `APP_RATE_LIMIT_LOGIN_MAX_ATTEMPTS`
  Default: `5` attempts per account window.
- `APP_RATE_LIMIT_LOGIN_WINDOW_SECONDS`
  Default: `900` seconds.

#### Resume intelligence

- `APP_RESUME_LLM_API_KEY`
  When set, enables OpenAI-backed resume structured extraction.
- `APP_RESUME_LLM_BASE_URL`
  Default: `https://api.openai.com/v1`
- `APP_RESUME_LLM_MODEL`
  Default: `gpt-5-mini`
- `APP_RESUME_LLM_PROMPT_VERSION`
  Default: `resume-extract-v1`
- `APP_RESUME_LLM_TIMEOUT_SECONDS`
  Default: `30`

#### Interview generation

- `APP_INTERVIEW_LLM_API_KEY`
  When set, enables OpenAI-backed interview follow-up generation for `resume_mock`.
- `APP_INTERVIEW_LLM_BASE_URL`
  Default: `https://api.openai.com/v1`
- `APP_INTERVIEW_LLM_MODEL`
  Default: `gpt-5-mini`
- `APP_INTERVIEW_LLM_PROMPT_VERSION`
  Default: `interview-follow-up-v1`
- `APP_INTERVIEW_LLM_TIMEOUT_SECONDS`
  Default: `30`
- `APP_INTERVIEW_FOLLOW_UP_MAX_DEPTH`
  Default: `2`

#### Interview transcription

- `APP_INTERVIEW_TRANSCRIPTION_PROVIDER`
  Default: `whisper_cpp`
- `APP_INTERVIEW_TRANSCRIPTION_WHISPER_COMMAND`
  Default: `whisper-cli`
- `APP_INTERVIEW_TRANSCRIPTION_WHISPER_MODEL_PATH`
  Required when using `whisper_cpp`
- `APP_INTERVIEW_TRANSCRIPTION_WHISPER_LANGUAGE`
  Default: `auto`
- `APP_INTERVIEW_TRANSCRIPTION_WHISPER_TIMEOUT_SECONDS`
  Default: `1800`
- `APP_INTERVIEW_TRANSCRIPTION_WHISPER_FFMPEG_COMMAND`
  Default: `ffmpeg`
- `APP_INTERVIEW_TRANSCRIPTION_WHISPER_FFMPEG_TIMEOUT_SECONDS`
  Default: `300`
- `APP_INTERVIEW_TRANSCRIPTION_API_KEY`
  Required only for the `openai` transcription provider
- `APP_INTERVIEW_TRANSCRIPTION_MAX_FILE_SIZE_BYTES`
  Default: `26214400`
- `APP_INTERVIEW_TRANSCRIPTION_CHUNKING_ENABLED`
  Default: `true`
- `APP_INTERVIEW_TRANSCRIPTION_CHUNKING_FFMPEG_COMMAND`
  Default: `ffmpeg`
- `APP_INTERVIEW_TRANSCRIPTION_CHUNKING_SEGMENT_SECONDS`
  Default: `480`
- `APP_INTERVIEW_TRANSCRIPTION_CHUNKING_AUDIO_BITRATE`
  Default: `48k`
- `APP_INTERVIEW_TRANSCRIPTION_CHUNKING_FFMPEG_TIMEOUT_SECONDS`
  Default: `300`
- `APP_INTERVIEW_TRANSCRIPTION_LABELING_TIMEOUT_SECONDS`
  Falls back to the main transcription timeout when unset
- `APP_INTERVIEW_TRANSCRIPTION_LABELING_FAIL_OPEN`
  Default: `true`

Additional behavior:
- the whisper-based flow uses `user_settings.preferred_language` as a language hint when available
- `SWAGGER_UI_ENABLED` defaults to `true` in local development

### Required For `prod`

The production profile requires:
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `AUTH_TOKEN_SECRET`
- `APP_CORS_ALLOWED_ORIGINS` or `APP_CORS_ALLOWED_ORIGIN_PATTERNS`

The app fails fast in `prod` if both CORS settings are missing.

## Schema, Migrations, And Seed Data

- Flyway migrations live in `src/main/resources/db/migration`
- Flyway runs automatically on startup
- schema evolution is migration-driven rather than Hibernate-generated
- Hibernate is configured with `ddl-auto=validate`
- reference seed data is applied through Flyway
- local demo data can be loaded with `scripts/seed_dummy_data.sql`

## Documentation Map

Read these documents in order if you are new to the backend:

- [`docs/README.md`](docs/README.md)
  Backend docs index and reading guide.
- [`docs/01-product-overview.md`](docs/01-product-overview.md)
  Backend-specific view of the shared product direction.
- [`docs/02-backend-architecture.md`](docs/02-backend-architecture.md)
  Package structure, domain ownership, and extension rules.
- [`docs/03-db-schema.md`](docs/03-db-schema.md)
  Database model and persistence design.
- [`docs/04-api-contracts.md`](docs/04-api-contracts.md)
  API shape and integration contract detail.
- [`docs/05-implementation-plan.md`](docs/05-implementation-plan.md)
  Delivery sequencing and implementation expectations.
- [`docs/06-acceptance-criteria.md`](docs/06-acceptance-criteria.md)
  Acceptance expectations for the backend scope.

## CI

Repository CI runs from the root workflow at `.github/workflows/ci.yml`.

Backend validation currently includes:
- `./gradlew --no-daemon build`
- `./gradlew --no-daemon test`

The root repository `README` explains the monorepo-wide verification path.
