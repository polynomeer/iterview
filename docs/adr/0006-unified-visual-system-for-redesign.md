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
- Future work should continue removing fake metrics, noisy chrome, and duplicated framing.
