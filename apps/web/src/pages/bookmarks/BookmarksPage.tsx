import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { useLayoutMode } from "../../shared/ui/layout";
import { PageContainer } from "../../shared/ui/PageContainer";

type BookmarkCategory = "questions" | "paths" | "materials" | "companies";

type BookmarkRecord = {
  id: string;
  category: BookmarkCategory;
  title: string;
  summary: string;
  source: string;
  savedAt: string;
  status: string;
  readiness: number;
  tags: string[];
  context: string;
  related: string[];
  primaryActionLabel: string;
  primaryActionTo: string;
  secondaryActionLabel: string;
  secondaryActionTo: string;
};

const BOOKMARK_FILTERS: Array<{ key: BookmarkCategory; label: string }> = [
  { key: "questions", label: "Saved Questions" },
  { key: "paths", label: "Paths" },
  { key: "materials", label: "Materials" },
  { key: "companies", label: "Companies" },
];

const BOOKMARK_RECORDS: BookmarkRecord[] = [
  {
    id: "distributed-lock-followup",
    category: "questions",
    title: "Explain why Redis lock renewal can still fail under network jitter",
    summary: "Tail follow-up from the payment reliability project. Needs a crisper failure story and bounded mitigation.",
    source: "Resume anchor / Settlement Reliability Improvements",
    savedAt: "10 minutes ago",
    status: "High leverage",
    readiness: 68,
    tags: ["Backend", "Concurrency", "Failure mode"],
    context: "Use this when the interviewer keeps drilling into distributed lock guarantees and asks where your design can still break.",
    related: ["Distributed lock note", "Idempotency question tree", "Redis expiration trade-off"],
    primaryActionLabel: "Practice question",
    primaryActionTo: routeConfig.questionTree.buildPath({ questionId: "distributed-lock" }),
    secondaryActionLabel: "Open answer editor",
    secondaryActionTo: routeConfig.answerEditor.buildPath({ questionId: "distributed-lock" }),
  },
  {
    id: "dfs-payments-path",
    category: "paths",
    title: "Payments DFS drill path",
    summary: "Curated branch covering idempotency, lock contention, retry semantics, and settlement rollback.",
    source: "Question path / Payments cluster",
    savedAt: "1 hour ago",
    status: "Ready",
    readiness: 82,
    tags: ["DFS", "Payments", "Core story"],
    context: "Useful as a high-confidence rehearsal path before a backend interview focused on transaction integrity.",
    related: ["Settlement reliability note", "Retry strategy answer", "Message ordering follow-up"],
    primaryActionLabel: "Open practice",
    primaryActionTo: routeConfig.practice.buildPath(),
    secondaryActionLabel: "Open notes",
    secondaryActionTo: routeConfig.notes.buildPath(),
  },
  {
    id: "system-design-material",
    category: "materials",
    title: "System design source-of-truth pack",
    summary: "Saved reading set for cache invalidation, quorum, and partition recovery trade-offs.",
    source: "Learning materials / Distributed systems",
    savedAt: "Today",
    status: "Review",
    readiness: 57,
    tags: ["Materials", "Design", "Trade-offs"],
    context: "Keep this close when converting broad study material into interview-safe claims backed by your own project history.",
    related: ["CAP theorem note", "Cache consistency answer", "Distributed lock note"],
    primaryActionLabel: "Open notes",
    primaryActionTo: routeConfig.notes.buildPath(),
    secondaryActionLabel: "Review queue",
    secondaryActionTo: routeConfig.reviewQueue.buildPath(),
  },
  {
    id: "stripe-company",
    category: "companies",
    title: "Stripe interview focus",
    summary: "Company bookmark tying reliability claims to payment APIs, fault isolation, and operational discipline.",
    source: "Target company / Stripe",
    savedAt: "Yesterday",
    status: "Watchlist",
    readiness: 61,
    tags: ["Company", "Payments", "Narrative"],
    context: "Use this bookmark to align your strongest stories with the company’s likely expectations around correctness and infrastructure maturity.",
    related: ["Payments DFS drill path", "Settlement reliability note", "Target job posting"],
    primaryActionLabel: "Open company board",
    primaryActionTo: routeConfig.targetCompanies.buildPath(),
    secondaryActionLabel: "Open resume",
    secondaryActionTo: routeConfig.resumeAnalysis.buildPath(),
  },
  {
    id: "kafka-rebalance-question",
    category: "questions",
    title: "Describe consumer group rebalance pain you actually experienced",
    summary: "Saved because the current answer is too abstract and misses operational symptoms.",
    source: "Question tree / Kafka branch",
    savedAt: "2 days ago",
    status: "Needs proof",
    readiness: 49,
    tags: ["Kafka", "Streaming", "Operational detail"],
    context: "The bookmark exists to force a concrete production example instead of a textbook explanation.",
    related: ["Kafka consumer group note", "Lag handling answer", "Partition skew example"],
    primaryActionLabel: "Practice question",
    primaryActionTo: routeConfig.questionTree.buildPath({ questionId: "kafka-rebalance" }),
    secondaryActionLabel: "Open answer editor",
    secondaryActionTo: routeConfig.answerEditor.buildPath({ questionId: "kafka-rebalance" }),
  },
  {
    id: "resume-proof-material",
    category: "materials",
    title: "Resume proof pack for settlement metrics",
    summary: "Evidence bundle that turns resume bullets into defendable quantitative statements.",
    source: "Resume analysis / Metrics evidence",
    savedAt: "3 days ago",
    status: "Important",
    readiness: 74,
    tags: ["Resume", "Evidence", "Metrics"],
    context: "This bookmark helps prevent vague metric claims by keeping the derivation and surrounding context recoverable.",
    related: ["Settlement reliability note", "Resume heatmap", "Metrics follow-up"],
    primaryActionLabel: "Open resume",
    primaryActionTo: routeConfig.resumeAnalysis.buildPath(),
    secondaryActionLabel: "Open heatmap",
    secondaryActionTo: routeConfig.resumeHeatmap.buildPath({ versionId: "v4" }),
  },
];

export function BookmarksPage() {
  const { isDesktop } = useLayoutMode();
  const [activeFilter, setActiveFilter] = useState<BookmarkCategory>("questions");
  const [selectedBookmarkId, setSelectedBookmarkId] = useState(
    BOOKMARK_RECORDS.find((record) => record.category === "questions")?.id ?? BOOKMARK_RECORDS[0]?.id ?? "",
  );
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "readiness">("recent");

  const filteredBookmarks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const visible = BOOKMARK_RECORDS.filter((record) => record.category === activeFilter).filter((record) => {
      if (!normalizedSearch) {
        return true;
      }

      const haystack = [record.title, record.summary, record.source, record.tags.join(" "), record.context]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });

    if (sort === "readiness") {
      return [...visible].sort((left, right) => right.readiness - left.readiness);
    }

    return visible;
  }, [activeFilter, search, sort]);

  const selectedBookmark =
    filteredBookmarks.find((record) => record.id === selectedBookmarkId) ??
    BOOKMARK_RECORDS.find((record) => record.id === selectedBookmarkId) ??
    filteredBookmarks[0] ??
    BOOKMARK_RECORDS[0];

  const categoryCount = BOOKMARK_RECORDS.filter((record) => record.category === activeFilter).length;
  const highReadinessCount = BOOKMARK_RECORDS.filter((record) => record.readiness >= 70).length;

  return (
    <PageContainer
      actions={
        <>
          <button className="secondary-button" type="button">
            Save current view
          </button>
          <Link className="secondary-button" to={routeConfig.practice.buildPath()}>
            Open practice
          </Link>
        </>
      }
      description="Collect the exact questions, paths, evidence packs, and company context you want to revisit without losing the source-of-truth connection."
      eyebrow="Bookmarks"
      title="Saved interview bookmarks"
    >
      <section className="page-card bookmarks-workspace-surface">
        <div className="bookmarks-workspace-surface__intro">
          <div className="bookmarks-workspace-surface__eyebrow-row">
            <span className="page-card__label">Saved focus stack</span>
            <span className="question-status-badge question-status-badge--accent">DFS-ready</span>
          </div>
          <h2 className="bookmarks-workspace-surface__title">Keep the most important drill paths and supporting evidence one click away</h2>
          <p className="bookmarks-workspace-surface__body">
            Bookmarks should reduce context switching. Save the exact prompt, proof, or company context that helps
            you continue a deep interview branch without rebuilding the chain from memory.
          </p>
        </div>
        <div className="bookmarks-workspace-surface__stats">
          <article>
            <span>Total saved</span>
            <strong>{BOOKMARK_RECORDS.length}</strong>
          </article>
          <article>
            <span>Current filter</span>
            <strong>{categoryCount}</strong>
          </article>
          <article>
            <span>High readiness</span>
            <strong>{highReadinessCount}</strong>
          </article>
        </div>
      </section>

      <div className={`bookmarks-layout ${isDesktop ? "bookmarks-layout--desktop" : "bookmarks-layout--mobile"}`}>
        <main className="bookmarks-layout__main page-stack">
          <section className="page-card bookmarks-panel">
            <div className="bookmarks-panel__topbar">
              <div aria-label="Bookmark categories" className="bookmarks-filter-bar" role="tablist">
                {BOOKMARK_FILTERS.map((filter) => (
                  <button
                    aria-selected={filter.key === activeFilter}
                    className={`bookmarks-filter-chip${filter.key === activeFilter ? " bookmarks-filter-chip--active" : ""}`}
                    key={filter.key}
                    onClick={() => {
                      setActiveFilter(filter.key);
                      setSearch("");
                      setSelectedBookmarkId(BOOKMARK_RECORDS.find((record) => record.category === filter.key)?.id ?? "");
                    }}
                    role="tab"
                    type="button"
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="bookmarks-toolbar">
                <label className="bookmarks-toolbar__search">
                  <input
                    aria-label="Search bookmarks"
                    onChange={(event) => {
                      setSearch(event.target.value);
                    }}
                    placeholder="Search saved items..."
                    type="search"
                    value={search}
                  />
                </label>
                <label className="bookmarks-toolbar__sort">
                  <span>Sort</span>
                  <select
                    aria-label="Sort bookmarks"
                    onChange={(event) => {
                      setSort(event.target.value as "recent" | "readiness");
                    }}
                    value={sort}
                  >
                    <option value="recent">Most recent</option>
                    <option value="readiness">Readiness</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="bookmarks-list">
              {filteredBookmarks.map((bookmark) => (
                <button
                  className={`bookmark-list-card${bookmark.id === selectedBookmark?.id ? " bookmark-list-card--active" : ""}`}
                  key={bookmark.id}
                  onClick={() => {
                    setSelectedBookmarkId(bookmark.id);
                  }}
                  type="button"
                >
                  <div className="bookmark-list-card__header">
                    <div>
                      <span className="bookmark-list-card__source">{bookmark.source}</span>
                      <strong>{bookmark.title}</strong>
                    </div>
                    <div className="bookmark-list-card__metrics">
                      <span>{bookmark.savedAt}</span>
                      <strong>{bookmark.readiness}</strong>
                    </div>
                  </div>
                  <p>{bookmark.summary}</p>
                  <div className="bookmark-list-card__footer">
                    <div className="bookmark-list-card__chips">
                      {bookmark.tags.map((tag) => (
                        <span className="detail-chip" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="bookmark-list-card__status">{bookmark.status}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </main>

        <aside className="bookmarks-layout__rail page-stack">
          {selectedBookmark ? (
            <section className="page-card bookmark-detail-rail">
              <div className="section-heading">
                <div>
                  <p className="section-heading__eyebrow">Bookmark details</p>
                  <h2 className="page-card__title">{selectedBookmark.title}</h2>
                </div>
              </div>

              <div className="bookmark-detail-rail__group">
                <span className="bookmark-detail-rail__label">Why this is saved</span>
                <p>{selectedBookmark.context}</p>
              </div>

              <div className="bookmark-detail-rail__meta-grid">
                <article>
                  <span>Status</span>
                  <strong>{selectedBookmark.status}</strong>
                </article>
                <article>
                  <span>Readiness</span>
                  <strong>{selectedBookmark.readiness}</strong>
                </article>
                <article>
                  <span>Saved</span>
                  <strong>{selectedBookmark.savedAt}</strong>
                </article>
                <article>
                  <span>Source</span>
                  <strong>{selectedBookmark.source}</strong>
                </article>
              </div>

              <div className="bookmark-detail-rail__actions">
                <Link className="primary-button" to={selectedBookmark.primaryActionTo}>
                  {selectedBookmark.primaryActionLabel}
                </Link>
                <Link className="secondary-button" to={selectedBookmark.secondaryActionTo}>
                  {selectedBookmark.secondaryActionLabel}
                </Link>
              </div>

              <div className="bookmark-detail-rail__group">
                <span className="bookmark-detail-rail__label">Related bookmarks</span>
                <div className="bookmark-detail-rail__related-list">
                  {selectedBookmark.related.map((item) => (
                    <div className="bookmark-detail-rail__related-item" key={item}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bookmark-detail-rail__group">
                <span className="bookmark-detail-rail__label">Tag cluster</span>
                <div className="bookmark-detail-rail__chips">
                  {selectedBookmark.tags.map((tag) => (
                    <span className="detail-chip detail-chip--accent" key={tag}>
                      {tag}
                    </span>
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

export default BookmarksPage;
