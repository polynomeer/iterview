# 03-db-schema

This document summarizes the database design from a product and architecture perspective.

The runtime source of truth remains Flyway migrations in:
- `src/main/resources/db/migration`

## Schema Philosophy

The database is designed around a few stable ideas:
- immutable historical records where user work should remain explainable
- additive schema evolution through Flyway
- domain-owned tables instead of one giant generic event store
- support for rich read models without losing source provenance

## Migration History Snapshot

The migration history shows the product expanding in layers rather than being redesigned wholesale.

Representative milestones:
- `V1__create_mvp_tables.sql`
  Initial learning loop tables
- `V7__extend_resume_versions_for_pdf_upload.sql`
  Resume file handling and parsing lifecycle
- `V13__extend_interview_sessions_and_archive_metadata.sql`
  Interview-session growth plus archive source metadata
- `V21__add_practical_interview_tables.sql`
  Practical interview import and review
- `V29__add_resume_analysis_tables.sql`
  Resume analysis and tailoring workflows
- `V34__add_resume_editor_workspace_tables.sql`
  Resume editor workspace support

## Core Data Domains

### Identity and user context

Primary tables:
- `users`
- `user_profiles`
- `user_settings`
- `user_target_companies`

Purpose:
- represent who the user is
- store stable preference and profile context
- influence recommendation and locale behavior

### Shared reference data

Primary tables:
- `companies`
- `job_roles`
- `categories`
- `tags`

Purpose:
- normalize taxonomy across question, resume, and recommendation behavior

### Resume domain

Primary tables and families:
- `resumes`
- `resume_versions`
- structured resume extraction tables
- resume analysis tables
- resume heatmap tables
- resume editor workspace tables

Purpose:
- model a user-owned resume container with immutable versions
- attach extraction, analysis, and editing layers without mutating source history

Important rule:
- `resume_versions` is the anchor of resume truth

Key fields on `resume_versions` include:
- version identity and ordering
- file metadata
- `raw_text`
- `parsed_json`
- `summary_text`
- `parsing_status`
- active-state semantics

Interpretation:
- `raw_text` is the canonical parser output from uploaded content
- `parsed_json` is useful as extraction trace or debug material, not the final long-term contract by itself
- additive resume intelligence should reference `resume_version_id`

### Question and learning-content domain

Primary table families:
- question catalog tables
- question tags and category relations
- question reference answers
- learning materials
- question trees and follow-up structures

Purpose:
- represent the shared interview-practice knowledge base

### Answer and analysis domain

Primary table families:
- `answer_attempts`
- score tables
- feedback tables
- analysis enrichment tables
- user question progress tables

Purpose:
- persist what the user answered
- persist what the system concluded
- drive retry, archive, and readiness behavior

Important rule:
- user answer history is append-only

### Review and archive domain

Primary table families:
- review queue items
- archive records
- daily-card support tables

Purpose:
- maintain durable next-action state instead of recomputing everything on the fly

Important rule:
- archive remains question-level

### Interview and replay domain

Primary table families:
- interview sessions
- interview session question snapshots
- interview coverage tables
- interview records for imported practical interviews
- transcript and review tables

Purpose:
- support both generated mock interviews and imported real interview analysis

### Resume tailoring and job-posting domain

Primary table families:
- job postings
- resume analyses
- suggestion acceptance state
- export records

Purpose:
- compare a resume version to a target posting
- store durable analysis results and output artifacts

### Resume heatmap domain

Primary table families:
- `resume_question_heatmap_links`
- overlay-target support tables

Purpose:
- connect interview questions back to structured resume evidence and specific overlay targets

### Resume editor domain

Primary table families:
- editor workspace state
- document snapshots
- comments and replies
- question cards
- revisions
- presence
- merge preview support

Purpose:
- support an editable draft layer on top of immutable source versions

Important rule:
- editor workspaces are additive artifacts, not replacements for source resume versions

## Data Integrity Rules

### Immutable anchors

These records should be treated as historical anchors:
- resume versions
- answer attempts
- interview session snapshots
- raw, cleaned, and confirmed transcript stages

### Mutable overlays

These records are acceptable as mutable workflow layers:
- user settings
- review queue status
- heatmap remap links
- editor draft state
- suggestion acceptance status

## Schema Evolution Rules

Prefer:
- new tables
- nullable additive columns
- derived or read-oriented helper tables

Avoid:
- destructive repurposing of core historical tables
- collapsing distinct product concepts into one overloaded generic blob
- storing all future analytics only in one JSON field if relational structure is already clear

## Practical Reading Guide

If you need to understand the schema quickly:

1. read `V1__create_mvp_tables.sql`
2. inspect resume-related migrations from `V5` onward
3. inspect interview-related migrations from `V13` onward
4. inspect practical interview migrations from `V21` onward
5. inspect resume analysis, heatmap, and editor migrations from `V29` onward

