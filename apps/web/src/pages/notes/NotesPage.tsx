import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { useLayoutMode } from "../../shared/ui/layout";
import { PageContainer } from "../../shared/ui/PageContainer";

type NoteRecord = {
  id: string;
  title: string;
  summary: string;
  excerpt: string;
  updatedAt: string;
  createdAt: string;
  pinned: boolean;
  tags: string[];
  linkedQuestions: Array<{ id: string; title: string; score: number }>;
  resumeContext: {
    title: string;
    description: string;
    period: string;
  };
  relatedSkills: Array<{ label: string; level: string }>;
  backlinks: string[];
  body: string;
};

const NOTE_RECORDS: NoteRecord[] = [
  {
    id: "dist-lock",
    title: "Distributed Lock Patterns",
    summary: "Overview of distributed locking approaches, trade-offs, and failure modes.",
    excerpt: "Redis SET NX PX, Redlock trade-offs, and when to use lease renewal.",
    updatedAt: "2 hours ago",
    createdAt: "May 10, 2024",
    pinned: false,
    tags: ["Concurrency", "Distributed Systems", "Backend"],
    linkedQuestions: [
      { id: "distributed-lock", title: "What is a distributed lock?", score: 78 },
      { id: "redlock", title: "How does Redlock algorithm work?", score: 72 },
      { id: "tradeoffs", title: "What are the trade-offs of distributed locking?", score: 66 },
    ],
    resumeContext: {
      title: "Scalable Payment Processing System",
      description: "Implemented Redis-based idempotent locks to reduce duplicate transactions by 99.9%.",
      period: "2022.08 - 2023.04",
    },
    relatedSkills: [
      { label: "Distributed Systems", level: "Advanced" },
      { label: "Concurrency", level: "Advanced" },
      { label: "System Design", level: "Proficient" },
      { label: "Redis", level: "Proficient" },
    ],
    backlinks: ["System Design: URL Shortener", "Redlock vs ZooKeeper"],
    body: `## Overview

Distributed locks help coordinate access to shared resources across multiple instances or services. They prevent race conditions and ensure consistency.

## Common Approaches

- Redis SET NX PX: simple, fast, and widely used
- Redlock Algorithm: more robust with multiple Redis nodes
- Database locks: useful when strong transactional guarantees already exist

## Best Practices

- Always set an expiration to avoid deadlocks
- Use unique values for lock ownership checks
- Release locks safely and make failure modes explicit

## Trade-offs

Distributed locking is rarely free. Prefer the simplest mechanism that still matches the blast radius of the claim you are making in the interview.`,
  },
  {
    id: "url-shortener",
    title: "System Design: URL Shortener",
    summary: "Collision strategy, redirect latency, and storage partitioning notes.",
    excerpt: "Base62 encoding, cache strategy, and write hot-spot mitigation.",
    updatedAt: "4 hours ago",
    createdAt: "May 11, 2024",
    pinned: true,
    tags: ["System Design"],
    linkedQuestions: [
      { id: "url-shortener-scale", title: "How would you scale a URL shortener?", score: 81 },
    ],
    resumeContext: {
      title: "Backend Platform Modernization",
      description: "Operated traffic-heavy API flows and cache-backed read paths.",
      period: "2021.03 - 2022.07",
    },
    relatedSkills: [
      { label: "System Design", level: "Advanced" },
      { label: "Caching", level: "Proficient" },
    ],
    backlinks: ["Distributed Lock Patterns"],
    body: `## Core idea

Focus the answer on read-heavy traffic, cache hit ratio, and collision handling before discussing embellishments.

## Failure lens

If the interviewer drills deeper, be ready to explain hot key mitigation, storage partitioning, and redirect observability.`,
  },
  {
    id: "dist-lock-strategies",
    title: "Distributed Lock Strategies",
    summary: "When single-node Redis is enough and when quorum-based locking matters.",
    excerpt: "Useful for clarifying Redlock skepticism during follow-up questioning.",
    updatedAt: "1 day ago",
    createdAt: "May 12, 2024",
    pinned: true,
    tags: ["Backend"],
    linkedQuestions: [
      { id: "redis-nx", title: "How does Redis SET NX PX work?", score: 72 },
    ],
    resumeContext: {
      title: "Settlement Reliability Improvements",
      description: "Compared lock strategies while reducing duplicate settlement incidents.",
      period: "2022.08 - 2023.04",
    },
    relatedSkills: [{ label: "Redis", level: "Proficient" }],
    backlinks: ["Distributed Lock Patterns"],
    body: `## Decision rule

Use the single-node approach when failure impact is bounded and operational simplicity matters more than theoretical safety.

Use stronger coordination when the claim depends on cross-node guarantees or when duplicate work is materially expensive.`,
  },
  {
    id: "cap-theorem",
    title: "CAP Theorem Explained",
    summary: "Practical framing for availability vs consistency trade-offs.",
    excerpt: "Avoid textbook-only answers. Tie choices to concrete system behavior.",
    updatedAt: "3 days ago",
    createdAt: "May 8, 2024",
    pinned: true,
    tags: ["Distributed Systems"],
    linkedQuestions: [
      { id: "cap-theorem-q", title: "How do you explain CAP trade-offs in practice?", score: 69 },
    ],
    resumeContext: {
      title: "Global Ticketing Infrastructure",
      description: "Worked on systems where latency, replication, and failover trade-offs had real user impact.",
      period: "2020.11 - 2021.12",
    },
    relatedSkills: [{ label: "Distributed Systems", level: "Advanced" }],
    backlinks: ["Kafka Consumer Groups"],
    body: `## Interview angle

Frame CAP as a failure-mode discussion, not as a memorized acronym. The strongest answers explain what is sacrificed under partition and why.`,
  },
  {
    id: "redis-data-structures",
    title: "Redis Data Structures",
    summary: "Quick reference for lists, sets, sorted sets, hashes, and streams.",
    excerpt: "Useful when interview questions pivot from systems to storage primitives.",
    updatedAt: "1 day ago",
    createdAt: "May 9, 2024",
    pinned: false,
    tags: ["Redis"],
    linkedQuestions: [
      { id: "redis-structures", title: "Which Redis data structure would you choose and why?", score: 74 },
    ],
    resumeContext: {
      title: "Real-time Inventory Service",
      description: "Used Redis for counters, queues, and hot-state lookups.",
      period: "2021.04 - 2022.02",
    },
    relatedSkills: [{ label: "Redis", level: "Proficient" }],
    backlinks: ["Distributed Lock Patterns"],
    body: `## Recall model

Choose the structure by access pattern first, not by memorized feature list. Explain lookup cost, ordering needs, and eviction risk.`,
  },
  {
    id: "kafka-consumer-groups",
    title: "Kafka Consumer Groups",
    summary: "Partition ownership, rebalance pain points, and lag handling.",
    excerpt: "Short notes for questions about throughput, failure handling, and replay.",
    updatedAt: "2 days ago",
    createdAt: "May 7, 2024",
    pinned: false,
    tags: ["Kafka"],
    linkedQuestions: [
      { id: "kafka-rebalance", title: "How do consumer groups rebalance?", score: 71 },
    ],
    resumeContext: {
      title: "Event Processing Modernization",
      description: "Handled partition skew and replay logic while stabilizing event consumers.",
      period: "2021.07 - 2022.06",
    },
    relatedSkills: [{ label: "Streaming", level: "Proficient" }],
    backlinks: ["CAP Theorem Explained"],
    body: `## Strong answer frame

Talk about partition assignment, state handoff cost, and lag visibility. Mention operational pain, not just broker theory.`,
  },
];

function NoteListSection({
  title,
  notes,
  selectedNoteId,
  onSelect,
}: {
  title: string;
  notes: NoteRecord[];
  selectedNoteId: string;
  onSelect: (noteId: string) => void;
}) {
  if (notes.length === 0) {
    return null;
  }

  return (
    <section className="notes-panel__section">
      <div className="section-heading section-heading--compact">
        <div>
          <p className="section-heading__eyebrow">{title}</p>
        </div>
        <span className="section-heading__count">{notes.length}</span>
      </div>
      <div className="notes-list">
        {notes.map((note) => (
          <button
            className={`notes-list-item${note.id === selectedNoteId ? " notes-list-item--active" : ""}`}
            key={note.id}
            onClick={() => {
              onSelect(note.id);
            }}
            type="button"
          >
            <div className="notes-list-item__content">
              <div className="notes-list-item__topline">
                <strong>{note.title}</strong>
                <span>{note.updatedAt}</span>
              </div>
              <p>{note.summary}</p>
              <p className="notes-list-item__excerpt">{note.excerpt}</p>
              <div className="notes-list-item__chips">
                {note.tags.map((tag) => (
                  <span className="detail-chip" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export function NotesPage() {
  const { isDesktop } = useLayoutMode();
  const [selectedNoteId, setSelectedNoteId] = useState(NOTE_RECORDS[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  const filteredNotes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return NOTE_RECORDS;
    }

    return NOTE_RECORDS.filter((note) => {
      const haystack = [note.title, note.summary, note.excerpt, note.tags.join(" ")].join(" ").toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [search]);

  const selectedNote =
    filteredNotes.find((note) => note.id === selectedNoteId) ??
    NOTE_RECORDS.find((note) => note.id === selectedNoteId) ??
    filteredNotes[0] ??
    NOTE_RECORDS[0];

  const pinnedNotes = filteredNotes.filter((note) => note.pinned);
  const otherNotes = filteredNotes.filter((note) => !note.pinned);
  const linkedQuestionCount = selectedNote?.linkedQuestions.length ?? 0;
  const relatedSkillCount = selectedNote?.relatedSkills.length ?? 0;
  const selectedWordCount = selectedNote?.body.split(/\s+/).filter(Boolean).length ?? 0;
  const selectedBacklinkCount = selectedNote?.backlinks.length ?? 0;
  const selectedQuestionAverage = linkedQuestionCount
    ? Math.round(
        (selectedNote?.linkedQuestions.reduce((sum, question) => sum + question.score, 0) ?? 0) / linkedQuestionCount,
      )
    : 0;
  const noteModeSignal =
    linkedQuestionCount >= 3
      ? "High reuse potential"
      : selectedBacklinkCount > 0
        ? "Connected context"
        : "Needs linking";

  return (
    <PageContainer
      actions={
        <>
          <button className="secondary-button" type="button">
            New note
          </button>
          <Link className="secondary-button" to={routeConfig.questionTree.buildPath({ questionId: "distributed-lock" })}>
            Open question map
          </Link>
        </>
      }
      description="Organize reusable defense fragments, trade-off notes, and source-of-truth snippets without losing the linked question context."
      eyebrow="Answer fragments"
      title="Store reusable defense notes"
    >
      <section className="page-card notes-workspace-surface">
        <div className="notes-workspace-surface__header">
          <div className="notes-workspace-surface__intro">
            <div className="notes-workspace-surface__eyebrow-row">
              <span className="page-card__label">Knowledge workspace</span>
              <span className="question-status-badge question-status-badge--accent">Defense fragments</span>
            </div>
            <p className="notes-workspace-surface__breadcrumbs">
              Reusable explanations
              <span>/</span>
              Linked questions
              <span>/</span>
              Resume evidence
            </p>
            <h2 className="notes-workspace-surface__title">Keep the explanation you want ready before the next DFS drill-down</h2>
            <p className="notes-workspace-surface__body">
              Write notes as reusable defense fragments. A strong note should help you answer a follow-up faster, reconnect to supporting resume evidence, and reduce vague explanation under pressure.
            </p>
          </div>
          <div className="notes-workspace-surface__stats">
            <article className="notes-workspace-surface__stat">
              <span>Total notes</span>
              <strong>{NOTE_RECORDS.length}</strong>
            </article>
            <article className="notes-workspace-surface__stat">
              <span>Pinned notes</span>
              <strong>{NOTE_RECORDS.filter((note) => note.pinned).length}</strong>
            </article>
            <article className="notes-workspace-surface__stat">
              <span>Linked questions</span>
              <strong>{linkedQuestionCount}</strong>
            </article>
            <article className="notes-workspace-surface__stat">
              <span>Related skills</span>
              <strong>{relatedSkillCount}</strong>
            </article>
          </div>
        </div>
        <div className="notes-workspace-surface__chips">
          <span className="detail-chip detail-chip--accent">Reusable answer fragments</span>
          <span className="detail-chip">Resume-linked</span>
          <span className="detail-chip">Question-linked</span>
          <span className="detail-chip">Searchable snippets</span>
        </div>
      </section>

      {selectedNote ? (
        <section className="page-card notes-insight-surface">
          <div className="notes-insight-surface__header">
            <div>
              <span className="page-card__label">Selected note insight</span>
              <h2 className="page-card__title">Keep one reusable explanation fragment ready for the next follow-up branch</h2>
              <p className="page-card__body">
                The best note is not a dump of facts. It is a tight explanation unit you can reuse when the interviewer pushes from the resume claim into DFS-level follow-up questions.
              </p>
            </div>
            <span className="detail-chip detail-chip--accent">{noteModeSignal}</span>
          </div>
          <div className="notes-insight-surface__stats">
            <article>
              <span>Words</span>
              <strong>{selectedWordCount}</strong>
              <p>enough density to support a complete answer without drifting</p>
            </article>
            <article>
              <span>Question average</span>
              <strong>{selectedQuestionAverage || "-"}</strong>
              <p>average score across linked follow-up questions</p>
            </article>
            <article>
              <span>Backlinks</span>
              <strong>{selectedBacklinkCount}</strong>
              <p>other notes that should stay semantically connected</p>
            </article>
          </div>
          <div className="notes-insight-surface__lanes">
            <div className="notes-insight-surface__lane">
              <strong>Clarify the claim</strong>
              <span>State the main argument you want to reuse before adding supporting details.</span>
            </div>
            <div className="notes-insight-surface__lane">
              <strong>Reconnect the evidence</strong>
              <span>Tie the note back to a resume event, metric, or engineering decision that you can defend concretely.</span>
            </div>
            <div className="notes-insight-surface__lane">
              <strong>Branch outward</strong>
              <span>Link the follow-up questions that are most likely to probe this note next.</span>
            </div>
          </div>
        </section>
      ) : null}

      <div className={`notes-layout ${isDesktop ? "notes-layout--desktop" : "notes-layout--mobile"}`}>
        <aside className="notes-layout__sidebar page-stack">
          <section className="page-card notes-panel">
            <div className="notes-panel__toolbar">
              <button className="primary-button notes-panel__new-button" type="button">
                New note
              </button>
              <button aria-label="Filter notes" className="secondary-button notes-panel__icon-button" type="button">
                Filter
              </button>
            </div>
            <label className="notes-panel__search">
              <input
                aria-label="Search notes"
                onChange={(event) => {
                  setSearch(event.target.value);
                }}
                placeholder="Search notes..."
                type="search"
                value={search}
              />
            </label>
            <NoteListSection
              notes={pinnedNotes}
              onSelect={setSelectedNoteId}
              selectedNoteId={selectedNote?.id ?? ""}
              title="Pinned notes"
            />
            <NoteListSection
              notes={otherNotes}
              onSelect={setSelectedNoteId}
              selectedNoteId={selectedNote?.id ?? ""}
              title="All notes"
            />
            <button className="secondary-button secondary-button--static notes-panel__load-more" type="button">
              Load more notes
            </button>
          </section>
        </aside>

        <main className="notes-layout__main page-stack">
          {selectedNote ? (
            <section className="page-card notes-editor">
              <div className="notes-editor__breadcrumbs">
                <span>Notes</span>
                <span>/</span>
                <span>Backend</span>
                <span>/</span>
                <span>Concurrency</span>
                <span>/</span>
                <span>{selectedNote.title}</span>
              </div>
              <div className="notes-editor__header">
                <div>
                  <h2 className="notes-editor__title">{selectedNote.title}</h2>
                  <p className="notes-editor__summary">{selectedNote.summary}</p>
                  <div className="notes-editor__chips">
                    {selectedNote.tags.map((tag) => (
                      <span className="detail-chip" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="notes-editor__actions">
                  <button
                    className={`secondary-button notes-editor__tab${mode === "edit" ? " notes-editor__tab--active" : ""}`}
                    onClick={() => {
                      setMode("edit");
                    }}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className={`secondary-button notes-editor__tab${mode === "preview" ? " notes-editor__tab--active" : ""}`}
                    onClick={() => {
                      setMode("preview");
                    }}
                    type="button"
                  >
                    Preview
                  </button>
                </div>
              </div>
              <div className="notes-editor__toolbar">
                {["H2", "H3", "B", "I", "Code", "Link", "List", "Table"].map((item) => (
                  <button className="notes-editor__tool" key={item} type="button">
                    {item}
                  </button>
                ))}
              </div>
              <div className="notes-editor__mini-stats">
                <article>
                  <span>Linked questions</span>
                  <strong>{selectedNote.linkedQuestions.length}</strong>
                </article>
                <article>
                  <span>Resume evidence</span>
                  <strong>{selectedNote.resumeContext.period}</strong>
                </article>
                <article>
                  <span>Backlinks</span>
                  <strong>{selectedNote.backlinks.length}</strong>
                </article>
              </div>
              {mode === "edit" ? (
                <textarea
                  className="notes-editor__textarea"
                  defaultValue={selectedNote.body}
                  spellCheck={false}
                />
              ) : (
                <article className="notes-editor__preview">
                  {selectedNote.body.split("\n\n").map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </article>
              )}
              <div className="notes-editor__footer">
                <span>{`${selectedNote.body.split(/\s+/).filter(Boolean).length} words`}</span>
                <span>{`${selectedNote.linkedQuestions.length} linked questions`}</span>
                <span>Markdown workspace</span>
              </div>
            </section>
          ) : null}
        </main>

        <aside className="notes-layout__rail page-stack">
          {selectedNote ? (
            <section className="page-card notes-detail-rail">
              <div className="section-heading">
                <div>
                  <p className="section-heading__eyebrow">Note details</p>
                  <h2 className="page-card__title">Keep the note connected to the rest of the prep graph</h2>
                </div>
              </div>
              <div className="notes-detail-rail__group">
                <span className="notes-detail-rail__label">About this note</span>
                <div className="notes-detail-rail__spotlight">
                  <strong>{selectedNote.summary}</strong>
                  <span>{selectedNote.excerpt}</span>
                </div>
                <div className="notes-detail-rail__meta-grid">
                  <article>
                    <span>Last updated</span>
                    <strong>{selectedNote.updatedAt}</strong>
                  </article>
                  <article>
                    <span>Created</span>
                    <strong>{selectedNote.createdAt}</strong>
                  </article>
                </div>
                <div className="notes-detail-rail__chips">
                  {selectedNote.tags.map((tag) => (
                    <span className="detail-chip" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="notes-detail-rail__group">
                <span className="notes-detail-rail__label">Linked questions</span>
                <div className="notes-detail-rail__list">
                  {selectedNote.linkedQuestions.map((question) => (
                    <Link
                      className="notes-detail-rail__link-card"
                      key={question.id}
                      to={routeConfig.questionDetail.buildPath({ questionId: question.id })}
                    >
                      <span>{question.title}</span>
                      <strong>{question.score}</strong>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="notes-detail-rail__group">
                <span className="notes-detail-rail__label">Linked resume context</span>
                <article className="notes-detail-rail__context-card">
                  <strong>{selectedNote.resumeContext.title}</strong>
                  <p>{selectedNote.resumeContext.description}</p>
                  <div className="notes-detail-rail__context-footer">
                    <span>{selectedNote.resumeContext.period}</span>
                    <Link className="secondary-button" to={routeConfig.resumeAnalysis.buildPath()}>
                      Open resume
                    </Link>
                  </div>
                </article>
              </div>
              <div className="notes-detail-rail__group">
                <span className="notes-detail-rail__label">Related skills</span>
                <div className="notes-detail-rail__chips">
                  {selectedNote.relatedSkills.map((skill) => (
                    <span className="detail-chip detail-chip--accent" key={skill.label}>
                      {`${skill.label} ${skill.level}`}
                    </span>
                  ))}
                </div>
              </div>
              <div className="notes-detail-rail__group">
                <span className="notes-detail-rail__label">Backlinks</span>
                <div className="notes-detail-rail__list">
                  {selectedNote.backlinks.map((backlink) => (
                    <div className="notes-detail-rail__backlink" key={backlink}>
                      {backlink}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </PageContainer>
  );
}

export default NotesPage;
