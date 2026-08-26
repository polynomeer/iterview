import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { formatApiDate } from "../../shared/lib/date";
import { useLayoutMode } from "../../shared/ui/layout";
import { FeedbackNotice } from "../../shared/ui/FeedbackNotice";
import { PageContainer } from "../../shared/ui/PageContainer";

type ReviewBlock = {
  id: string;
  title: string;
  cluster: string;
  dueDate: string;
  impact: string;
  durationLabel: string;
  status: "today" | "upcoming" | "overdue";
  queueSize: number;
  nextActionTo: string;
};

type ReviewDay = {
  date: string;
  label: string;
  shortLabel: string;
  load: number;
  emphasis: "focus" | "steady" | "light";
};

const REVIEW_DAYS: ReviewDay[] = [
  { date: "2026-08-25", label: "Today", shortLabel: "Tue", load: 4, emphasis: "focus" },
  { date: "2026-08-26", label: "Tomorrow", shortLabel: "Wed", load: 2, emphasis: "steady" },
  { date: "2026-08-27", label: "Thu", shortLabel: "Thu", load: 1, emphasis: "light" },
  { date: "2026-08-28", label: "Fri", shortLabel: "Fri", load: 3, emphasis: "steady" },
  { date: "2026-08-29", label: "Sat", shortLabel: "Sat", load: 2, emphasis: "light" },
  { date: "2026-08-30", label: "Sun", shortLabel: "Sun", load: 1, emphasis: "light" },
  { date: "2026-08-31", label: "Mon", shortLabel: "Mon", load: 3, emphasis: "steady" },
];

const INITIAL_REVIEW_BLOCKS: ReviewBlock[] = [
  {
    id: "payments-retry",
    title: "Payment correctness retry block",
    cluster: "Settlement reliability / retry semantics",
    dueDate: "2026-08-25",
    impact: "+6 mastery points in payment DFS loop",
    durationLabel: "25 min",
    status: "today",
    queueSize: 4,
    nextActionTo: routeConfig.reviewQueue.buildPath(),
  },
  {
    id: "redis-branch",
    title: "Redis lock follow-up recovery",
    cluster: "Distributed locks / failure mode proof",
    dueDate: "2026-08-26",
    impact: "Reduce vague concurrency answers in 2 active branches",
    durationLabel: "20 min",
    status: "upcoming",
    queueSize: 3,
    nextActionTo: routeConfig.practice.buildPath(),
  },
  {
    id: "resume-metrics",
    title: "Resume metrics defense sweep",
    cluster: "Source-of-truth / quantified claims",
    dueDate: "2026-08-28",
    impact: "Raise resume proof confidence before next company loop",
    durationLabel: "30 min",
    status: "upcoming",
    queueSize: 5,
    nextActionTo: routeConfig.resumeAnalysis.buildPath(),
  },
  {
    id: "overdue-kafka",
    title: "Kafka rebalance remediation",
    cluster: "Streaming / operational detail recovery",
    dueDate: "2026-08-24",
    impact: "Recover one overdue weak node before it drifts further",
    durationLabel: "15 min",
    status: "overdue",
    queueSize: 2,
    nextActionTo: routeConfig.notes.buildPath(),
  },
];

function getDayStyle(load: number) {
  return {
    "--scheduled-review-load": `${Math.max(load * 18, 18)}%`,
  } as CSSProperties;
}

export function ScheduledReviewsPage() {
  const { isDesktop } = useLayoutMode();
  const [reviewBlocks, setReviewBlocks] = useState(INITIAL_REVIEW_BLOCKS);
  const [selectedBlockId, setSelectedBlockId] = useState(INITIAL_REVIEW_BLOCKS[0]?.id ?? "");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const selectedBlock =
    reviewBlocks.find((block) => block.id === selectedBlockId) ?? reviewBlocks[0] ?? INITIAL_REVIEW_BLOCKS[0];
  const todayCount = reviewBlocks.filter((block) => block.status === "today").length;
  const overdueCount = reviewBlocks.filter((block) => block.status === "overdue").length;
  const totalQueueItems = reviewBlocks.reduce((sum, block) => sum + block.queueSize, 0);

  const upcomingTimeline = useMemo(
    () =>
      [...reviewBlocks].sort((left, right) => {
        return left.dueDate.localeCompare(right.dueDate);
      }),
    [reviewBlocks],
  );

  function handleReschedule(blockId: string) {
    setReviewBlocks((current) =>
      current.map((block) =>
        block.id === blockId
          ? {
              ...block,
              dueDate: "2026-08-31",
              status: "upcoming",
            }
          : block,
      ),
    );
    setStatusMessage("Review block rescheduled to Aug 31, 2026.");
  }

  function handleComplete(blockId: string) {
    setReviewBlocks((current) => current.filter((block) => block.id !== blockId));
    setStatusMessage("Review block marked complete and removed from the upcoming schedule.");

    if (selectedBlockId === blockId) {
      const fallback = reviewBlocks.find((block) => block.id !== blockId);
      setSelectedBlockId(fallback?.id ?? "");
    }
  }

  return (
    <PageContainer
      actions={
        <>
          <Link className="secondary-button" to={routeConfig.reviewQueue.buildPath()}>
            Open review queue
          </Link>
          <Link className="secondary-button" to={routeConfig.practice.buildPath()}>
            Open practice
          </Link>
        </>
      }
      description="Turn retry work into a visible schedule so you can see what is due, what is slipping, and what will improve mastery fastest this week."
      eyebrow="Planned recovery"
      title="Scheduled review board"
    >
      <section className="page-card scheduled-reviews-workspace-surface">
        <div className="scheduled-reviews-workspace-surface__header">
          <div className="scheduled-reviews-workspace-surface__intro">
            <div className="scheduled-reviews-workspace-surface__eyebrow-row">
              <span className="page-card__label">Review scheduling</span>
              <span className="question-status-badge question-status-badge--accent">Spaced repetition</span>
            </div>
            <h2 className="scheduled-reviews-workspace-surface__title">
              Keep retry work visible by day, cluster, and projected mastery impact
            </h2>
            <p className="scheduled-reviews-workspace-surface__body">
              The queue tells you what needs recovery now. The schedule tells you when to revisit a branch, how much
              work is stacking up, and which review block will improve preparation fastest.
            </p>
          </div>
          <div className="scheduled-reviews-workspace-surface__stats">
            <article>
              <span>Due today</span>
              <strong>{todayCount}</strong>
            </article>
            <article>
              <span>Overdue blocks</span>
              <strong>{overdueCount}</strong>
            </article>
            <article>
              <span>Total queue load</span>
              <strong>{totalQueueItems}</strong>
            </article>
          </div>
        </div>
        <div className="scheduled-reviews-workspace-surface__guidance">
          <article className="scheduled-reviews-workspace-surface__guidance-card">
            <span>Planning rule</span>
            <strong>Schedule by mastery impact, not by whichever retry feels easiest first.</strong>
          </article>
          <article className="scheduled-reviews-workspace-surface__guidance-card">
            <span>Execution rule</span>
            <strong>Keep one short review block visible, complete it, then return to the main queue.</strong>
          </article>
        </div>
      </section>

      {statusMessage ? <FeedbackNotice message={statusMessage} tone="success" /> : null}

      <div className={`scheduled-reviews-layout ${isDesktop ? "scheduled-reviews-layout--desktop" : ""}`}>
        <main className="page-stack">
          <section className="page-card scheduled-reviews-calendar">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="section-heading__eyebrow">Calendar</p>
                <h2 className="section-heading__title">See the next seven days of review pressure at a glance</h2>
              </div>
            </div>
            <div className="scheduled-reviews-calendar__grid">
              {REVIEW_DAYS.map((day) => (
                <article
                  className={`scheduled-review-day-card scheduled-review-day-card--${day.emphasis}`}
                  key={day.date}
                  style={getDayStyle(day.load)}
                >
                  <span>{day.shortLabel}</span>
                  <strong>{day.label}</strong>
                  <p>{formatApiDate(day.date)}</p>
                  <div aria-hidden="true" className="scheduled-review-day-card__bar" />
                  <small>{`${day.load} blocks`}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="page-card scheduled-reviews-timeline">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="section-heading__eyebrow">Timeline</p>
                <h2 className="section-heading__title">Review blocks ordered by upcoming due date</h2>
              </div>
            </div>
            <div className="scheduled-reviews-timeline__stack">
              {upcomingTimeline.map((block) => (
                <button
                  className={`scheduled-review-timeline-card${block.id === selectedBlock?.id ? " scheduled-review-timeline-card--active" : ""}`}
                  key={block.id}
                  onClick={() => {
                    setSelectedBlockId(block.id);
                  }}
                  type="button"
                >
                  <div className="scheduled-review-timeline-card__topline">
                    <span className={`detail-chip${block.status === "overdue" ? " detail-chip--danger" : block.status === "today" ? " detail-chip--accent" : ""}`}>
                      {block.status === "today" ? "Due today" : block.status === "overdue" ? "Overdue" : "Upcoming"}
                    </span>
                    <strong>{formatApiDate(block.dueDate) ?? block.dueDate}</strong>
                  </div>
                  <h3>{block.title}</h3>
                  <p>{block.cluster}</p>
                  <div className="scheduled-review-timeline-card__meta">
                    <span>{block.durationLabel}</span>
                    <span>{`${block.queueSize} queued nodes`}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="page-card scheduled-reviews-queue">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="section-heading__eyebrow">Execution queue</p>
                <h2 className="section-heading__title">Reschedule, complete, or open the next review block in context</h2>
              </div>
            </div>
            <div className="scheduled-reviews-queue__list">
              {reviewBlocks.map((block) => (
                <article className="scheduled-review-queue-card" key={block.id}>
                  <div className="scheduled-review-queue-card__body">
                    <div className="scheduled-review-queue-card__header">
                      <div>
                        <strong>{block.title}</strong>
                        <p>{block.cluster}</p>
                      </div>
                      <span className="detail-chip">{formatApiDate(block.dueDate) ?? block.dueDate}</span>
                    </div>
                    <div className="scheduled-review-queue-card__meta">
                      <span>{block.durationLabel}</span>
                      <span>{`${block.queueSize} queue items`}</span>
                      <span>{block.impact}</span>
                    </div>
                  </div>
                  <div className="scheduled-review-queue-card__actions">
                    <Link className="secondary-button" to={block.nextActionTo}>
                      Open block
                    </Link>
                    <button
                      className="secondary-button"
                      onClick={() => {
                        handleReschedule(block.id);
                      }}
                      type="button"
                    >
                      Reschedule
                    </button>
                    <button
                      className="primary-button"
                      onClick={() => {
                        handleComplete(block.id);
                      }}
                      type="button"
                    >
                      Complete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>

        {selectedBlock ? (
          <aside className="page-card scheduled-reviews-detail-rail">
            <section className="scheduled-reviews-detail-rail__panel">
              <span className="page-card__label">Selected block</span>
              <h2 className="page-card__title">{selectedBlock.title}</h2>
              <p className="page-card__body">{selectedBlock.cluster}</p>
              <div className="scheduled-reviews-detail-rail__meta">
                <span>{formatApiDate(selectedBlock.dueDate) ?? selectedBlock.dueDate}</span>
                <span>{selectedBlock.durationLabel}</span>
                <span>{`${selectedBlock.queueSize} nodes`}</span>
              </div>
            </section>

            <section className="scheduled-reviews-detail-rail__panel">
              <span className="page-card__label">Projected impact</span>
              <p className="page-card__body">
                {selectedBlock.impact}. Completing this block should remove one weak retry cluster from the active loop
                and lower the chance of re-entering the same vague branch tomorrow.
              </p>
            </section>

            <section className="scheduled-reviews-detail-rail__panel">
              <span className="page-card__label">Recommended next steps</span>
              <ul className="page-card__list">
                <li>Open the block only when you can finish it in one sitting.</li>
                <li>Reschedule if the branch still needs source-of-truth repair before answer rehearsal.</li>
                <li>Use completion only after the retry target is materially clearer than before.</li>
              </ul>
            </section>
          </aside>
        ) : null}
      </div>
    </PageContainer>
  );
}

export default ScheduledReviewsPage;
