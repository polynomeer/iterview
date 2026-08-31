# 0019. Align Secondary Workspaces To Shared Analysis Shell

## Status
Accepted

## Date
2026-08-31

## Context

After the primary authenticated workspaces adopted the reference desktop shell, several secondary but still high-value screens remained visually and structurally inconsistent.

This affected:
- weak node remediation
- scheduled review planning
- resume analysis
- interview session and result surfaces

These screens are not peripheral utilities. They are part of the same preparation loop and should read as one connected product rather than a mix of unrelated page patterns.

## Decision

Secondary preparation surfaces should also adopt the shared analysis shell:
- left rail for planning, filters, or source context
- center canvas for the active working surface
- right rail for decision support, detail, or next-action context

For session and result flows where the existing content model is richer, the same shell language should be applied through shared surface hierarchy, sticky side rails, and low-elevation bordered cards even when the exact three-rail structure is adapted.

## Consequences

Positive:
- the redesign now extends beyond primary landing surfaces into the operational prep loop
- planning, remediation, active execution, and result review feel like one product family
- future UI refinement can focus on content fidelity within a stable shell language

Trade-offs:
- more of the product now depends on dense desktop compositions
- some older subcomponents may still need incremental cleanup inside the new shell
- mobile remains intentionally simpler than desktop reference fidelity
