# ADR 0006: Standardize the Redesign Around a Unified Visual System

- Status: Accepted
- Date: 2026-08-25

## Context

The redesign touched many screens over time. Without a consistent visual system, each page-level improvement could still leave the product feeling patchy and improvised.

Recent iterations converged on a shared UI language:
- dark workspace shell
- high-contrast surface hierarchy
- compact but readable typography
- repeated card and insight patterns
- reduced ornamental noise

## Decision

The shared redesign system will use:

- a minimal dark workspace shell as the default app environment
- consistent surface gradients and border treatments
- aligned card hierarchy so primary surfaces, support panels, and list items share the same dark-surface family
- reusable card, stat, insight, and guidance structures
- typography tuned for clarity and hierarchy over decoration
- simplified header density where pages already have strong workspace surfaces
- reduced workspace-entry density so landing cards do not stack breadcrumbs, many stats, and many rule blocks at once

The design direction should remain clean, severe, and task-oriented rather than decorative.

## Consequences

- New UI work should reuse shared surface and spacing patterns before inventing new ones.
- Visual consistency matters as much as local page polish.
- Pages with too many competing headers or cards should be simplified.
- Workspace entry surfaces should favor one short directive, two or three key stats, and a small number of guidance blocks.
- Interface copy should prefer short directive phrases over explanatory paragraphs when the user is already inside an execution flow.
- Secondary support panels should be merged or removed when they restate the same branch choice, launch rule, or retry strategy already shown in the main workspace surface.
- List items should avoid stacked summary grids when a short note row and a small chip set communicate the same state more directly.
- Interview workspace entry should keep a single primary surface and move session configuration into one dedicated setup surface instead of repeating the same launch context across separate hero, rail, and snapshot sections.
- Deprecated page-specific scaffolding should be deleted once the replacement workspace pattern is verified, rather than left behind as dormant CSS.
- Session and result screens should collapse repeated advisory panels into one or two decisive support surfaces instead of scattering the same recovery guidance across separate insight, brief, and rail cards.
- Placeholder branches, fake scores, and duplicate metric summaries should be removed once real session state is available on the page.
- DFS-oriented surfaces should visually separate current, defended, and queued branches so traversal state is readable before any body copy is read.
- Result and recovery surfaces should visually distinguish weak recovery, skipped recovery, and safe expansion so the next action is obvious at scan speed.
- Timeline surfaces should expose traversal order, depth, and branch status together so the interview path reads like a navigable DFS trail rather than a flat history list.
- Future work should continue removing fake metrics, noisy chrome, and duplicated framing.
