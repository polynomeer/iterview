Read AGENTS.md, docs/03-routes-and-flows.md, docs/04-api-integration.md, docs/05-ui-structure.md, docs/07-acceptance-criteria.md, and the existing frontend code first.

Implement the resume and resume version management screens for iterview-web.

Scope:
- resume list
- resume creation
- resume version list
- activate version action

Requirements:
- integrate with:
  - GET /api/resumes
  - POST /api/resumes
  - POST /api/resumes/{resumeId}/versions
  - POST /api/resume-versions/{versionId}/activate
- create reusable components for:
  - ResumeList
  - ResumeCard
  - ResumeCreateForm
  - ResumeVersionList
  - ResumeVersionItem
- clearly show:
  - resume title
  - version number
  - active version state
  - upload date if available
- support loading, empty, success, and error states
- for MVP, a simplified version upload UI is acceptable if backend file upload details are not fully finalized
- keep interactions explicit and mobile-friendly

Out of scope:
- full resume parsing UI
- side-by-side diff
- AI-generated resume insights
- cloud storage polish

When finished:
1. summarize ResumePage structure
2. summarize version activation flow
3. explain assumptions about upload interaction
4. list backend dependencies or TODOs
