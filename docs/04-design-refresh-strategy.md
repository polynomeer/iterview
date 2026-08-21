# 04-design-refresh-strategy

This document defines how `iterview` should be redesigned without repeating the same failure mode:

- adding visual polish screen by screen
- mixing multiple design languages
- improving aesthetics while weakening the core interview-preparation flow

It is a shared repository document because the redesign must align:
- product intent
- frontend information architecture
- backend-supported user journeys
- delivery sequencing and acceptance expectations

## Why This Document Exists

`iterview` is not a generic AI SaaS dashboard.

It is a resume-defense and interview-simulation product built around two central jobs:
- help the user build a reliable source of truth for every meaningful resume claim
- help the user walk resume-grounded question trees depth-first until they can defend each branch at leaf-level detail

That means the product should feel:
- calm, serious, and readable
- dense enough for repeated practice
- structured enough for long-form learning
- consistent enough that users can focus on answers, not chrome

The redesign should therefore be a reset of the product UX system, not a sequence of isolated visual edits.

## Design Read

Read `iterview` as:

> a productivity and learning tool for serious interview preparation, combining the clarity of developer tools with the guidance of a modern learning platform

The target experience is closer to:
- Linear's restraint
- GitHub's readability
- LeetCode's practice-oriented density

and explicitly not closer to:
- flashy AI marketing surfaces
- heavy gradient-first dashboards
- card-on-card-on-card mobile SaaS UI

## Stable Visual Direction

The redesign should lock one design language before any large UI rebuild starts.

### Character

- minimal chrome
- strong text hierarchy
- border-first grouping
- low-shadow surfaces
- one accent family
- restrained motion
- neutral backgrounds
- high information clarity

### Visual Rules

- background stays near-white in light mode and charcoal in dark mode
- surfaces use subtle contrast, not decorative gradients
- cards are used only when grouping is real, not as default decoration
- radius stays in a narrow scale, generally `6px` to `10px` for controls and `12px` to `16px` for larger panels
- shadows stay weak and rare
- borders carry most of the separation work
- icons come from one family only
- button hierarchy is limited and predictable

### Color Model

Use semantic tokens rather than per-screen color choices.

- background: near-white or dark-neutral
- surface: white or dark-neutral surface
- primary text: near-black or near-white
- secondary text: neutral gray
- accent: one blue or indigo family for primary emphasis
- success: green
- warning: amber
- danger: red

Do not introduce multiple competing accent colors across major routes.

## What The Redesign Must Optimize For

The redesign is successful only if it improves these product questions:

- What should I do next?
- Which resume claim am I trying to defend?
- Where am I in this question tree?
- What follow-up branch still feels weak?
- What improved after the last retry?

If a visual change does not improve one of those questions, it is probably noise.

## Core Journeys To Design Around

The redesign should be organized around journeys, not around pages in isolation.

### Journey A. Daily Practice

```text
home
-> today's most valuable question
-> answer
-> evaluation
-> weakness
-> retry
-> mastered or next branch
```

Design implication:
- this journey should feel linear, interruptible only when the interruption is useful
- CTA priority should remain obvious at every step

### Journey B. Question Exploration

```text
question discovery
-> filters
-> question detail
-> follow-up tree
-> source material
-> answer
```

Design implication:
- discovery should not feel like a marketing feed
- detail should feel like a serious reading and decision surface

### Journey C. Progress And Review

```text
weakness visibility
-> retry queue
-> re-answer
-> compare result
-> archive or continue
```

Design implication:
- progress must read as evidence, not decoration
- comparison and next action must be clearer than aggregate analytics

### Journey D. Resume Personalization

```text
resume version
-> extracted claims and evidence
-> source of truth
-> predicted questions
-> DFS practice
```

Design implication:
- resume workflows must not look like a file manager
- they should feel like interview-context authoring and defense preparation

## Redesign Principles

### 1. UX Audit Before Large UI Rewrites

Do not start with "make it prettier."

Before changing major surfaces, audit:
- information hierarchy
- CTA placement
- navigation hierarchy
- screen density
- repeated card wrappers
- duplicated information
- whitespace misuse
- mobile and desktop fitness
- interaction consistency

The redesign should fix structural problems first and only then tune appearance.

### 2. One Shared Design System

The current frontend is a custom React + CSS application without an established external component primitive layer.

Near-term direction:
- unify the existing shared UI components and tokens first
- reduce ad hoc per-route styling
- centralize visual decisions in one shared layer

Do not introduce a new component library only to restart inconsistency under a new name.

If a primitive library is evaluated later, it must be chosen once and applied systematically. Until then, the primary task is to make the current shared UI layer authoritative.

### 3. Token Discipline

No page should invent its own visual language.

The redesign must standardize tokens for:
- color
- typography
- spacing
- radius
- border
- shadow
- container widths
- breakpoints
- motion durations
- focus rings

Design token drift is one of the main causes of visual cheapness in AI-assisted UI work.

### 4. Text Before Decoration

`iterview` is a reading and response product.

Therefore:
- headings must clarify context fast
- body text must remain readable over long sessions
- helper text should explain action, not restate labels
- decorative backgrounds should never lower reading quality

### 5. Navigation Must Reflect Product Hierarchy

The global navigation should communicate product structure clearly:
- practice and review are primary
- resume and source-of-truth workflows are primary or near-primary
- secondary tools should not compete with the core loop

Bottom navigation, sidebar navigation, and page-level section navigation must represent one coherent hierarchy rather than separate mental models.

### 6. Density Must Match Serious Use

The product should not feel empty or ornamental.

Target density should be:
- comfortable on mobile
- efficient on desktop
- readable under repeated daily use

This means:
- less decorative padding
- fewer oversized hero blocks
- tighter but still accessible lists
- stronger alignment between summary and detail surfaces

### 7. Motion Must Stay Subtle

Motion should:
- confirm interaction
- reveal content
- preserve continuity

Motion should not:
- dominate attention
- create artificial delight loops
- slow down repeated practice

Reduced motion support is mandatory.

## Recommended Screen Architecture Direction

### Home

Home should become a decision surface, not a dashboard collage.

It should foreground:
- today's question or branch
- retry urgency
- resume-defense gaps
- one clear next action

It should background:
- broad metrics without immediate action value
- duplicate summaries already visible elsewhere

### Question Detail

Question detail should remain the primary learning surface.

It should combine:
- the current question
- where the question came from
- relevant source-of-truth context
- follow-up tree position
- answer and review actions

It should not bury the main prompt under decorative panels.

### Result Analysis

Result analysis should clearly answer:
- what was strong
- what was weak
- what branch to revisit
- what resume evidence still lacks defense

The key output is the next move, not a vanity score.

### Resume Workflows

Resume workflows should emphasize:
- version lineage
- structured claims
- evidence quality
- predicted questions
- missing source-of-truth depth

The visual model should be closer to a structured research workspace than to a generic upload center.

## Delivery Strategy For The Redesign

The redesign should be executed in five controlled phases.

### Phase 1. UX Audit And Problem Map

Deliverables:
- route-by-route audit
- journey-level friction map
- duplicate and low-value surface inventory
- prioritized redesign scope

Output:
- one shared audit artifact
- one agreed list of critical UI problems

### Phase 2. Design System Lock

Deliverables:
- token definitions
- typography scale
- spacing scale
- button and input hierarchy
- surface and layout rules
- icon and motion rules

Output:
- one source of truth for shared UI decisions

### Phase 3. Core Journey Rebuild

Priority order:
1. Home
2. Question detail
3. Answer and result analysis
4. Review queue and archive
5. Resume source-of-truth surfaces

Output:
- the core loop feels coherent before secondary screens are refreshed

### Phase 4. Broader Surface Expansion

Extend the same system to:
- feed
- profile
- interview session
- interview result
- practical interview replay
- resume editor and analysis surfaces

### Phase 5. Visual QA And Consistency Pass

Audit every changed route for:
- hierarchy consistency
- spacing consistency
- token consistency
- interaction consistency
- accessibility
- mobile and desktop coherence

## Acceptance Criteria For The Redesign

The redesign is not complete unless:

- one visual language is used across the app
- the four core journeys feel coherent
- the resume-defense model is visible in the UI
- DFS question traversal is supported by clear navigation and context
- the source-of-truth concept is first-class, not hidden
- light and dark modes both pass contrast expectations
- keyboard focus remains visible
- interactive targets remain touch-safe
- mobile and desktop layouts both feel intentional

## Explicit Anti-Patterns

Avoid the following during the redesign:

- gradient-first visual identity
- per-page reinvention of buttons, cards, and spacing
- heavy hero sections on productivity routes
- nesting every section in another rounded card
- multiple accent colors at the same hierarchy level
- oversized empty whitespace that lowers reading efficiency
- introducing a new UI library before the current structure is understood
- optimizing for screenshots instead of daily repeated use

## Operating Rule For Codex-Assisted UI Work

When using an AI coding agent for UI work on this repository:

- do not start with "make it prettier"
- start with audit, hierarchy, and journey clarity
- lock the design system before broad surface edits
- apply changes through shared components and tokens first
- verify against core journeys before expanding to secondary screens

This is the only reliable way to prevent iterative visual drift.
