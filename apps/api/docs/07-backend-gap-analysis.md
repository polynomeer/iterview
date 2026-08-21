# 07-backend-gap-analysis

This document compares the backend product direction with the backend implementation surface.

It is a prioritization tool, not a criticism list.

## Strong Coverage Already Present

The backend already exposes meaningful depth in these areas:
- authentication and user context
- resume versions and extraction subresources
- answer submission and analysis
- review queue and archive
- mock interview session APIs
- practical interview record APIs
- resume analysis, heatmap, and editor APIs
- skill radar, gaps, and progress endpoints

That means the current repository is beyond a narrow CRUD MVP.

## Gaps That Still Matter

### 1. Contract richness vs explanation richness

The runtime API surface is broad, but some product semantics still rely on readers inferring intent from endpoint names.

### 2. Resume intelligence traceability

The long-term balance between:
- raw parser output
- structured extraction records
- AI-extraction trace metadata

should continue to be tightened.

### 3. Interview generation explainability

Mock interview features can continue improving in:
- why a question was chosen
- which resume evidence triggered it
- which generation path produced it

### 4. Replay analytics maturity

Practical interview replay has a strong foundation, but it can still deepen in:
- interviewer-style profiling
- issue clustering
- comparison between imported and replayed performance

### 5. Editor document primitives

The editor backend supports a meaningful workspace model, but full rich-document editing remains constrained by the current document abstraction.

## Strategic Recommendations

1. Keep leaning on immutable anchors.
2. Prefer richer metadata over hidden heuristics.
3. Keep feature additions attributable.
4. Preserve a deterministic fallback path for local development.

## Near-Term High-Value Improvements

- improve OpenAPI and inline API descriptions for complex interview and editor endpoints
- reduce ambiguity between extraction trace fields and stable structured resume subresources
- continue documenting replay pipeline states and failure behavior
- tighten acceptance tests around additive flows that cross multiple domains

