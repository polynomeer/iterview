import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { formatApiDate } from "../../shared/lib/date";
import { useLocale } from "../../shared/i18n";
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
  { date: "2026-08-25", label: "오늘", shortLabel: "화", load: 4, emphasis: "focus" },
  { date: "2026-08-26", label: "내일", shortLabel: "수", load: 2, emphasis: "steady" },
  { date: "2026-08-27", label: "목", shortLabel: "목", load: 1, emphasis: "light" },
  { date: "2026-08-28", label: "금", shortLabel: "금", load: 3, emphasis: "steady" },
  { date: "2026-08-29", label: "토", shortLabel: "토", load: 2, emphasis: "light" },
  { date: "2026-08-30", label: "일", shortLabel: "일", load: 1, emphasis: "light" },
  { date: "2026-08-31", label: "월", shortLabel: "월", load: 3, emphasis: "steady" },
];

const INITIAL_REVIEW_BLOCKS: ReviewBlock[] = [
  {
    id: "payments-retry",
    title: "결제 정합성 재시도 블록",
    cluster: "정산 안정성 / 재시도 의미론",
    dueDate: "2026-08-25",
    impact: "결제 DFS 루프 숙련도 +6",
    durationLabel: "25분",
    status: "today",
    queueSize: 4,
    nextActionTo: routeConfig.reviewQueue.buildPath(),
  },
  {
    id: "redis-branch",
    title: "Redis 락 꼬리질문 복구",
    cluster: "분산 락 / 장애 모드 입증",
    dueDate: "2026-08-26",
    impact: "활성 브랜치 2개의 모호한 동시성 답변 축소",
    durationLabel: "20분",
    status: "upcoming",
    queueSize: 3,
    nextActionTo: routeConfig.practice.buildPath(),
  },
  {
    id: "resume-metrics",
    title: "이력서 수치 방어 점검",
    cluster: "기준 문서 / 수치화 주장",
    dueDate: "2026-08-28",
    impact: "다음 회사 루프 전 이력서 근거 신뢰도 강화",
    durationLabel: "30분",
    status: "upcoming",
    queueSize: 5,
    nextActionTo: routeConfig.resumeAnalysis.buildPath(),
  },
  {
    id: "overdue-kafka",
    title: "Kafka 리밸런스 보강",
    cluster: "스트리밍 / 운영 디테일 복구",
    dueDate: "2026-08-24",
    impact: "더 흐려지기 전에 연체된 약한 노드 1개 복구",
    durationLabel: "15분",
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
  const { locale } = useLocale();
  const isKorean = locale === "ko";
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
    setStatusMessage(isKorean ? "복습 블록 일정을 2026년 8월 31일로 변경했습니다." : "Review block rescheduled to Aug 31, 2026.");
  }

  function handleComplete(blockId: string) {
    setReviewBlocks((current) => current.filter((block) => block.id !== blockId));
    setStatusMessage(
      isKorean
        ? "복습 블록을 완료 처리하고 예정된 일정에서 제거했습니다."
        : "Review block marked complete and removed from the upcoming schedule.",
    );

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
            {isKorean ? "복습 큐 열기" : "Open review queue"}
          </Link>
          <Link className="secondary-button" to={routeConfig.practice.buildPath()}>
            {isKorean ? "연습 열기" : "Open practice"}
          </Link>
        </>
      }
      description={
        isKorean
          ? "재시도 작업을 눈에 보이는 일정으로 바꿔서, 무엇이 오늘 기한인지, 무엇이 밀리고 있는지, 이번 주 숙련도를 가장 빨리 높일 항목이 무엇인지 한눈에 파악하세요."
          : "Turn retry work into a visible schedule so you can see what is due, what is slipping, and what will improve mastery fastest this week."
      }
      eyebrow={isKorean ? "계획된 복구" : "Planned recovery"}
      title={isKorean ? "예정된 복습 보드" : "Scheduled review board"}
    >
      <section className="page-card scheduled-reviews-workspace-surface">
        <div className="scheduled-reviews-workspace-surface__header">
          <div className="scheduled-reviews-workspace-surface__intro">
            <div className="scheduled-reviews-workspace-surface__eyebrow-row">
              <span className="page-card__label">{isKorean ? "복습 일정" : "Review scheduling"}</span>
              <span className="question-status-badge question-status-badge--accent">{isKorean ? "간격 반복" : "Spaced repetition"}</span>
            </div>
            <h2 className="scheduled-reviews-workspace-surface__title">
              {isKorean
                ? "날짜, 클러스터, 예상 숙련도 영향 기준으로 재시도 작업을 보이게 유지하세요"
                : "Keep retry work visible by day, cluster, and projected mastery impact"}
            </h2>
            <p className="scheduled-reviews-workspace-surface__body">
              {isKorean
                ? "큐는 지금 무엇을 복구해야 하는지 알려주고, 일정은 어떤 브랜치를 언제 다시 볼지, 얼마나 작업이 쌓였는지, 어떤 복습 블록이 준비도를 가장 빨리 높일지 알려줍니다."
                : "The queue tells you what needs recovery now. The schedule tells you when to revisit a branch, how much work is stacking up, and which review block will improve preparation fastest."}
            </p>
          </div>
          <div className="scheduled-reviews-workspace-surface__stats">
            <article>
              <span>{isKorean ? "오늘 기한" : "Due today"}</span>
              <strong>{todayCount}</strong>
            </article>
            <article>
              <span>{isKorean ? "연체 블록" : "Overdue blocks"}</span>
              <strong>{overdueCount}</strong>
            </article>
            <article>
              <span>{isKorean ? "전체 큐 부하" : "Total queue load"}</span>
              <strong>{totalQueueItems}</strong>
            </article>
          </div>
        </div>
        <div className="scheduled-reviews-workspace-surface__guidance">
          <article className="scheduled-reviews-workspace-surface__guidance-card">
            <span>{isKorean ? "계획 원칙" : "Planning rule"}</span>
            <strong>{isKorean ? "가장 쉬운 재시도부터가 아니라 숙련도 영향이 큰 순서로 일정을 잡으세요." : "Schedule by mastery impact, not by whichever retry feels easiest first."}</strong>
          </article>
          <article className="scheduled-reviews-workspace-surface__guidance-card">
            <span>{isKorean ? "실행 원칙" : "Execution rule"}</span>
            <strong>{isKorean ? "짧은 복습 블록 하나를 보이게 유지하고 끝낸 뒤 메인 큐로 돌아가세요." : "Keep one short review block visible, complete it, then return to the main queue."}</strong>
          </article>
        </div>
      </section>

      {statusMessage ? <FeedbackNotice message={statusMessage} tone="success" /> : null}

      <div className={`scheduled-reviews-layout ${isDesktop ? "scheduled-reviews-layout--desktop" : ""}`}>
        <main className="page-stack">
          <section className="page-card scheduled-reviews-calendar">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="section-heading__eyebrow">{isKorean ? "캘린더" : "Calendar"}</p>
                <h2 className="section-heading__title">{isKorean ? "앞으로 7일간의 복습 압력을 한눈에 보세요" : "See the next seven days of review pressure at a glance"}</h2>
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
                  <small>{isKorean ? `${day.load}개 블록` : `${day.load} blocks`}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="page-card scheduled-reviews-timeline">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="section-heading__eyebrow">{isKorean ? "타임라인" : "Timeline"}</p>
                <h2 className="section-heading__title">{isKorean ? "다가오는 기한 순서로 복습 블록을 정렬했습니다" : "Review blocks ordered by upcoming due date"}</h2>
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
                      {block.status === "today" ? (isKorean ? "오늘 기한" : "Due today") : block.status === "overdue" ? (isKorean ? "연체" : "Overdue") : isKorean ? "예정" : "Upcoming"}
                    </span>
                    <strong>{formatApiDate(block.dueDate) ?? block.dueDate}</strong>
                  </div>
                  <h3>{block.title}</h3>
                  <p>{block.cluster}</p>
                  <div className="scheduled-review-timeline-card__meta">
                    <span>{block.durationLabel}</span>
                    <span>{isKorean ? `${block.queueSize}개 큐 노드` : `${block.queueSize} queued nodes`}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="page-card scheduled-reviews-queue">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="section-heading__eyebrow">{isKorean ? "실행 큐" : "Execution queue"}</p>
                <h2 className="section-heading__title">{isKorean ? "다음 복습 블록을 일정 변경, 완료, 또는 컨텍스트와 함께 열어보세요" : "Reschedule, complete, or open the next review block in context"}</h2>
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
                      <span>{isKorean ? `${block.queueSize}개 큐 항목` : `${block.queueSize} queue items`}</span>
                      <span>{block.impact}</span>
                    </div>
                  </div>
                  <div className="scheduled-review-queue-card__actions">
                    <Link className="secondary-button" to={block.nextActionTo}>
                      {isKorean ? "블록 열기" : "Open block"}
                    </Link>
                    <button
                      className="secondary-button"
                      onClick={() => {
                        handleReschedule(block.id);
                      }}
                      type="button"
                    >
                      {isKorean ? "일정 변경" : "Reschedule"}
                    </button>
                    <button
                      className="primary-button"
                      onClick={() => {
                        handleComplete(block.id);
                      }}
                      type="button"
                    >
                      {isKorean ? "완료" : "Complete"}
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
              <span className="page-card__label">{isKorean ? "선택된 블록" : "Selected block"}</span>
              <h2 className="page-card__title">{selectedBlock.title}</h2>
              <p className="page-card__body">{selectedBlock.cluster}</p>
              <div className="scheduled-reviews-detail-rail__meta">
                <span>{formatApiDate(selectedBlock.dueDate) ?? selectedBlock.dueDate}</span>
                <span>{selectedBlock.durationLabel}</span>
                <span>{isKorean ? `${selectedBlock.queueSize}개 노드` : `${selectedBlock.queueSize} nodes`}</span>
              </div>
            </section>

            <section className="scheduled-reviews-detail-rail__panel">
              <span className="page-card__label">{isKorean ? "예상 영향" : "Projected impact"}</span>
              <p className="page-card__body">
                {isKorean
                  ? `${selectedBlock.impact}. 이 블록을 끝내면 활성 루프에서 약한 재시도 클러스터 하나를 제거하고, 내일 같은 모호한 브랜치에 다시 들어갈 가능성을 낮출 수 있습니다.`
                  : `${selectedBlock.impact}. Completing this block should remove one weak retry cluster from the active loop and lower the chance of re-entering the same vague branch tomorrow.`}
              </p>
            </section>

            <section className="scheduled-reviews-detail-rail__panel">
              <span className="page-card__label">{isKorean ? "권장 다음 단계" : "Recommended next steps"}</span>
              <ul className="page-card__list">
                <li>{isKorean ? "한 번에 끝낼 수 있을 때만 이 블록을 여세요." : "Open the block only when you can finish it in one sitting."}</li>
                <li>{isKorean ? "답변 리허설 전에 기준 문서 보강이 더 필요하면 일정을 바꾸세요." : "Reschedule if the branch still needs source-of-truth repair before answer rehearsal."}</li>
                <li>{isKorean ? "재시도 목표가 이전보다 실질적으로 더 명확해졌을 때만 완료 처리하세요." : "Use completion only after the retry target is materially clearer than before."}</li>
              </ul>
            </section>
          </aside>
        ) : null}
      </div>
    </PageContainer>
  );
}

export default ScheduledReviewsPage;
