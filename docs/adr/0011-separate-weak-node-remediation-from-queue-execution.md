# ADR 0011: Separate Weak Node Remediation from Queue Execution

- Status: Accepted
- Date: 2026-08-25

## Context

The review queue and scheduled review board now cover execution timing well, but they still do not explain how one weak branch connects to its question path, resume evidence, and neighboring weak concepts.

The redesign plan explicitly called for graph-first remediation rather than another flat retry list.

## Decision

The product adds a dedicated weak-node remediation workspace.

- `Weak Nodes` focuses on graph-first remediation context
- each weak node must link directly to connected questions, connected evidence, and explicit repair steps
- `Review Queue` remains the place to execute the next retry, but it can hand off to `Weak Nodes` when the relationship itself needs repair before another answer attempt

## Consequences

- Review becomes a layered system: queue execution, scheduled repetition, and weak-node remediation.
- Users can repair why a branch is weak before they simply retry it again.
- Future command search and graph tooling can treat weak nodes as first-class entities rather than as queue tags.
- The workspace-first IA gets a clearer review family instead of overloading one queue route with every review concern.
