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
  timeLabel: string;
  lane: number;
  startRow: number;
  rowSpan: number;
  status: "today" | "upcoming" | "overdue";
  queueSize: number;
  nextActionTo: string;
  topics: string[];
};

type ReviewDay = {
  date: string;
  label: string;
  shortLabel: string;
  load: number;
  emphasis: "focus" | "steady" | "light";
};

const REVIEW_DAYS: ReviewDay[] = [
  { date: "2026-08-31", label: "오늘", shortLabel: "월", load: 4, emphasis: "focus" },
  { date: "2026-09-01", label: "내일", shortLabel: "화", load: 2, emphasis: "steady" },
  { date: "2026-09-02", label: "수", shortLabel: "수", load: 1, emphasis: "light" },
  { date: "2026-09-03", label: "목", shortLabel: "목", load: 3, emphasis: "steady" },
  { date: "2026-09-04", label: "금", shortLabel: "금", load: 2, emphasis: "light" },
  { date: "2026-09-05", label: "토", shortLabel: "토", load: 1, emphasis: "light" },
  { date: "2026-09-06", label: "일", shortLabel: "일", load: 3, emphasis: "steady" },
];

const TIME_LABELS = ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00"];

const INITIAL_REVIEW_BLOCKS: ReviewBlock[] = [
  {
    id: "payments-retry",
    title: "결제 정합성 재시도 블록",
    cluster: "정산 안정성 / 재시도 의미론",
    dueDate: "2026-08-31",
    impact: "결제 DFS 루프 숙련도 +6",
    durationLabel: "25분",
    timeLabel: "09:30 - 09:55",
    lane: 0,
    startRow: 1,
    rowSpan: 2,
    status: "today",
    queueSize: 4,
    nextActionTo: routeConfig.reviewQueue.buildPath(),
    topics: ["중복 결제 복구", "멱등 키", "재시도 정책"],
  },
  {
    id: "redis-branch",
    title: "Redis 락 꼬리질문 복구",
    cluster: "분산 락 / 장애 모드 입증",
    dueDate: "2026-09-01",
    impact: "활성 브랜치 2개의 모호한 동시성 답변 축소",
    durationLabel: "20분",
    timeLabel: "14:00 - 14:20",
    lane: 1,
    startRow: 4,
    rowSpan: 2,
    status: "upcoming",
    queueSize: 3,
    nextActionTo: routeConfig.practice.buildPath(),
    topics: ["락 타임아웃", "펜싱 토큰", "장애 시나리오"],
  },
  {
    id: "resume-metrics",
    title: "이력서 수치 방어 점검",
    cluster: "기준 문서 / 수치화 주장",
    dueDate: "2026-09-03",
    impact: "다음 회사 루프 전 이력서 근거 신뢰도 강화",
    durationLabel: "30분",
    timeLabel: "16:00 - 16:30",
    lane: 3,
    startRow: 5,
    rowSpan: 2,
    status: "upcoming",
    queueSize: 5,
    nextActionTo: routeConfig.resumeAnalysis.buildPath(),
    topics: ["성과 수치", "기준 문서 링크", "가정 검증"],
  },
  {
    id: "overdue-kafka",
    title: "Kafka 리밸런스 보강",
    cluster: "스트리밍 / 운영 디테일 복구",
    dueDate: "2026-08-30",
    impact: "더 흐려지기 전에 연체된 약한 노드 1개 복구",
    durationLabel: "15분",
    timeLabel: "18:00 - 18:15",
    lane: 0,
    startRow: 6,
    rowSpan: 1,
    status: "overdue",
    queueSize: 2,
    nextActionTo: routeConfig.notes.buildPath(),
    topics: ["파티션 이동", "컨슈머 그룹 안정화", "운영 지표"],
  },
];

function getDayStyle(load: number) {
  return {
    "--scheduled-review-load": `${Math.max(load * 18, 18)}%`,
  } as CSSProperties;
}

function getSessionStyle(block: ReviewBlock) {
  return {
    gridColumn: `${block.lane + 1} / span 1`,
    gridRow: `${block.startRow} / span ${block.rowSpan}`,
  } as CSSProperties;
}

function getStatusLabel(block: ReviewBlock, isKorean: boolean) {
  if (block.status === "today") {
    return isKorean ? "오늘 기한" : "Due today";
  }
  if (block.status === "overdue") {
    return isKorean ? "연체" : "Overdue";
  }
  return isKorean ? "예정" : "Upcoming";
}

function getReadinessScore(block: ReviewBlock) {
  const base = block.status === "overdue" ? 42 : block.status === "today" ? 61 : 74;
  return Math.max(28, Math.min(92, base - block.queueSize * 3));
}

function getContextSignals(block: ReviewBlock, isKorean: boolean) {
  return [
    {
      label: isKorean ? "연결 질문" : "Linked questions",
      value: `${block.queueSize + 6}`,
    },
    {
      label: isKorean ? "예상 회복" : "Expected recovery",
      value: block.impact.replace("숙련도 ", "").replace("활성 ", ""),
    },
    {
      label: isKorean ? "세션 길이" : "Session length",
      value: block.durationLabel,
    },
  ];
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

  const clusterSummary = useMemo(() => {
    return upcomingTimeline.map((block) => ({
      id: block.id,
      cluster: block.cluster,
      count: block.queueSize,
      date: formatApiDate(block.dueDate) ?? block.dueDate,
    }));
  }, [upcomingTimeline]);

  const upNextBlocks = upcomingTimeline.slice(0, 3);
  const readinessScore = selectedBlock ? getReadinessScore(selectedBlock) : 0;
  const contextSignals = selectedBlock ? getContextSignals(selectedBlock, isKorean) : [];

  function handleReschedule(blockId: string) {
    setReviewBlocks((current) =>
      current.map((block) =>
        block.id === blockId
          ? {
              ...block,
              dueDate: "2026-09-02",
              status: "upcoming",
              lane: 2,
              startRow: 3,
              rowSpan: 2,
              timeLabel: "13:30 - 13:55",
            }
          : block,
      ),
    );
    setStatusMessage(isKorean ? "복습 블록 일정을 2026년 9월 2일로 변경했습니다." : "Review block rescheduled to Sep 2, 2026.");
  }

  function handleComplete(blockId: string) {
    const nextBlocks = reviewBlocks.filter((block) => block.id !== blockId);
    setReviewBlocks(nextBlocks);
    setStatusMessage(
      isKorean
        ? "복습 블록을 완료 처리하고 예정된 일정에서 제거했습니다."
        : "Review block marked complete and removed from the upcoming schedule.",
    );

    if (selectedBlockId === blockId) {
      setSelectedBlockId(nextBlocks[0]?.id ?? "");
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
          ? "재시도 작업을 주간 캘린더 위에 올려서, 무엇이 오늘 기한인지, 어느 클러스터가 밀리고 있는지, 어떤 세션이 준비도를 가장 빨리 끌어올리는지 바로 판단하세요."
          : "Place retry work on a weekly calendar so you can judge what is due, what is slipping, and which session improves readiness fastest."
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
              {isKorean ? "이번 주 복습 압력을 일정 캔버스로 정리하세요" : "Shape this week's review pressure on a visible calendar"}
            </h2>
            <p className="scheduled-reviews-workspace-surface__body">
              {isKorean
                ? "복습은 큐에만 쌓아두면 읽히지 않습니다. 이번 주 안에 끝낼 수 있는 세션 단위로 자르고, 오른쪽 인스펙터에서 바로 실행 여부를 판단해야 합니다."
                : "A queue alone is not legible enough. Break retries into finishable sessions, lay them on this week, and decide execution from the inspector."}
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
            <strong>{isKorean ? "완료 가능한 세션으로 잘라서 캘린더에 올리고, 큐는 그 뒤에 따라오게 두세요." : "Put finishable sessions on the calendar first, then let the queue follow."}</strong>
          </article>
          <article className="scheduled-reviews-workspace-surface__guidance-card">
            <span>{isKorean ? "운영 원칙" : "Operating rule"}</span>
            <strong>{isKorean ? "연체 항목은 짧게 복구하고, 고영향 블록은 주중 피크 슬롯에 배치하세요." : "Recover overdue items quickly, and place high-impact blocks in your peak slots."}</strong>
          </article>
        </div>
      </section>

      {statusMessage ? <FeedbackNotice message={statusMessage} tone="success" /> : null}

      <div className={`scheduled-reviews-layout ${isDesktop ? "scheduled-reviews-layout--desktop" : ""}`}>
        <aside className="page-stack scheduled-reviews-layout__plan-rail">
          <section className="page-card scheduled-review-browser-rail">
            <div className="scheduled-review-browser-rail__tabs" role="tablist" aria-label={isKorean ? "복습 브라우저 탭" : "Review browser tabs"}>
              <button className="scheduled-review-browser-rail__tab scheduled-review-browser-rail__tab--active" type="button">
                {isKorean ? "캘린더" : "Calendar"}
              </button>
              <button className="scheduled-review-browser-rail__tab" type="button">
                {isKorean ? "타임라인" : "Timeline"}
              </button>
              <button className="scheduled-review-browser-rail__tab" type="button">
                {isKorean ? `큐 ${totalQueueItems}` : `Queue ${totalQueueItems}`}
              </button>
              <button className="scheduled-review-browser-rail__tab" type="button">
                {isKorean ? `클러스터 ${clusterSummary.length}` : `Clusters ${clusterSummary.length}`}
              </button>
            </div>

            <div className="scheduled-review-browser-rail__section">
              <div className="scheduled-review-browser-rail__heading">
                <span>{isKorean ? "다음 세션" : "Up next"}</span>
                <strong>{isKorean ? "이번 주 우선 순서" : "This week's order"}</strong>
              </div>
              <div className="scheduled-review-browser-rail__list">
                {upNextBlocks.map((block) => (
                  <button
                    className={`scheduled-review-browser-rail__item${block.id === selectedBlock?.id ? " scheduled-review-browser-rail__item--active" : ""}`}
                    key={block.id}
                    onClick={() => {
                      setSelectedBlockId(block.id);
                    }}
                    type="button"
                  >
                    <div>
                      <strong>{block.title}</strong>
                      <p>{block.cluster}</p>
                    </div>
                    <span>{formatApiDate(block.dueDate) ?? block.dueDate}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="scheduled-review-browser-rail__section">
              <div className="scheduled-review-browser-rail__heading">
                <span>{isKorean ? "재시도 알림" : "Retry reminders"}</span>
                <strong>{isKorean ? "밀리기 전 처리" : "Clear before drift"}</strong>
              </div>
              <div className="scheduled-review-browser-rail__stack">
                {reviewBlocks.map((block) => (
                  <article className="scheduled-review-browser-rail__mini-card" key={block.id}>
                    <span className={`detail-chip${block.status === "overdue" ? " detail-chip--danger" : block.status === "today" ? " detail-chip--accent" : ""}`}>
                      {getStatusLabel(block, isKorean)}
                    </span>
                    <strong>{block.timeLabel}</strong>
                    <p>{block.title}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="scheduled-review-browser-rail__section">
              <div className="scheduled-review-browser-rail__heading">
                <span>{isKorean ? "간격 반복 큐" : "Spaced repetition queue"}</span>
                <strong>{isKorean ? "블록별 부하" : "Load by block"}</strong>
              </div>
              <div className="scheduled-review-browser-rail__queue">
                {reviewBlocks.map((block) => (
                  <div className="scheduled-review-browser-rail__queue-row" key={block.id}>
                    <div>
                      <strong>{block.title}</strong>
                      <p>{isKorean ? `${block.queueSize}개 노드` : `${block.queueSize} nodes`}</p>
                    </div>
                    <i style={{ "--scheduled-review-queue-score": `${Math.min(100, block.queueSize * 18 + 16)}%` } as CSSProperties} />
                  </div>
                ))}
              </div>
            </div>

            <div className="scheduled-review-browser-rail__section">
              <div className="scheduled-review-browser-rail__heading">
                <span>{isKorean ? "기한 임박 클러스터" : "Due soon clusters"}</span>
                <strong>{isKorean ? "맥락 브라우저" : "Context browser"}</strong>
              </div>
              <div className="scheduled-review-browser-rail__clusters">
                {clusterSummary.map((cluster) => (
                  <article className="scheduled-review-browser-rail__cluster-card" key={cluster.id}>
                    <strong>{cluster.cluster}</strong>
                    <p>{cluster.date}</p>
                    <span>{isKorean ? `${cluster.count}개 질문` : `${cluster.count} questions`}</span>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </aside>

        <main className="page-stack scheduled-reviews-layout__main">
          <section className="page-card scheduled-review-calendar-board">
            <div className="scheduled-review-calendar-board__header">
              <div>
                <p className="section-heading__eyebrow">{isKorean ? "주간 보드" : "Weekly board"}</p>
                <h2 className="section-heading__title">{isKorean ? "2026년 8월 31일 - 9월 6일" : "Aug 31 - Sep 6, 2026"}</h2>
              </div>
              <div className="scheduled-review-calendar-board__actions">
                <button className="scheduled-review-calendar-board__nav" type="button" aria-label={isKorean ? "이전 주" : "Previous week"}>
                  ←
                </button>
                <button className="scheduled-review-calendar-board__pill" type="button">
                  {isKorean ? "이번 주" : "This week"}
                </button>
                <button className="scheduled-review-calendar-board__nav" type="button" aria-label={isKorean ? "다음 주" : "Next week"}>
                  →
                </button>
              </div>
            </div>

            <div className="scheduled-review-calendar-board__frame">
              <div className="scheduled-review-calendar-board__time-rail">
                {TIME_LABELS.map((time) => (
                  <span key={time}>{time}</span>
                ))}
              </div>

              <div className="scheduled-review-calendar-board__board">
                <div className="scheduled-review-calendar-board__day-head">
                  {REVIEW_DAYS.map((day) => (
                    <div className={`scheduled-review-calendar-board__day-tab scheduled-review-calendar-board__day-tab--${day.emphasis}`} key={day.date}>
                      <span>{day.shortLabel}</span>
                      <strong>{day.label}</strong>
                      <small>{formatApiDate(day.date)}</small>
                    </div>
                  ))}
                </div>

                <div className="scheduled-review-calendar-board__grid">
                  {REVIEW_DAYS.map((day) => (
                    <div className="scheduled-review-calendar-board__day-column" key={day.date} style={getDayStyle(day.load)}>
                      <div className="scheduled-review-calendar-board__day-column-bar" />
                    </div>
                  ))}

                  {reviewBlocks.map((block) => (
                    <button
                      className={`scheduled-review-calendar-board__session scheduled-review-calendar-board__session--${block.status}${block.id === selectedBlock?.id ? " scheduled-review-calendar-board__session--active" : ""}`}
                      key={block.id}
                      onClick={() => {
                        setSelectedBlockId(block.id);
                      }}
                      style={getSessionStyle(block)}
                      type="button"
                    >
                      <span>{block.timeLabel}</span>
                      <strong>{block.title}</strong>
                      <p>{block.cluster}</p>
                      <small>{isKorean ? `${block.queueSize}개 큐 노드` : `${block.queueSize} queue nodes`}</small>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="scheduled-review-calendar-board__legend">
              <span><i className="scheduled-review-calendar-board__legend-dot scheduled-review-calendar-board__legend-dot--today" />{isKorean ? "오늘 기한 세션" : "Due today"}</span>
              <span><i className="scheduled-review-calendar-board__legend-dot scheduled-review-calendar-board__legend-dot--upcoming" />{isKorean ? "예정 세션" : "Upcoming"}</span>
              <span><i className="scheduled-review-calendar-board__legend-dot scheduled-review-calendar-board__legend-dot--overdue" />{isKorean ? "연체 복구" : "Overdue recovery"}</span>
            </div>
          </section>

          <section className="page-card scheduled-review-session-table">
            <div className="scheduled-review-session-table__header">
              <div>
                <p className="section-heading__eyebrow">{isKorean ? "세션 목록" : "Session browser"}</p>
                <h2 className="section-heading__title">{isKorean ? "복습 세션을 한 번 더 정렬해서 읽습니다" : "A second pass over the sessions"}</h2>
              </div>
            </div>
            <div className="scheduled-review-session-table__table">
              <div className="scheduled-review-session-table__head">
                <span>{isKorean ? "세션" : "Session"}</span>
                <span>{isKorean ? "기한" : "Due"}</span>
                <span>{isKorean ? "길이" : "Length"}</span>
                <span>{isKorean ? "큐 부하" : "Queue load"}</span>
                <span>{isKorean ? "실행" : "Action"}</span>
              </div>
              <div className="scheduled-review-session-table__rows">
                {upcomingTimeline.map((block) => (
                  <div className="scheduled-review-session-table__row" key={block.id}>
                    <button
                      className={`scheduled-review-session-table__session${block.id === selectedBlock?.id ? " scheduled-review-session-table__session--active" : ""}`}
                      onClick={() => {
                        setSelectedBlockId(block.id);
                      }}
                      type="button"
                    >
                      <strong>{block.title}</strong>
                      <p>{block.cluster}</p>
                    </button>
                    <span>{formatApiDate(block.dueDate) ?? block.dueDate}</span>
                    <span>{block.durationLabel}</span>
                    <span>{isKorean ? `${block.queueSize}개` : `${block.queueSize}`}</span>
                    <Link className="secondary-button" to={block.nextActionTo}>
                      {isKorean ? "열기" : "Open"}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {selectedBlock ? (
          <aside className="page-card scheduled-review-detail-panel">
            <div className="scheduled-review-detail-panel__header">
              <span className="page-card__label">{isKorean ? "복습 상세" : "Review details"}</span>
              <h2 className="page-card__title">{selectedBlock.title}</h2>
              <p className="page-card__body">{selectedBlock.cluster}</p>
            </div>

            <div className="scheduled-review-detail-panel__chips">
              <span className={`detail-chip${selectedBlock.status === "overdue" ? " detail-chip--danger" : selectedBlock.status === "today" ? " detail-chip--accent" : ""}`}>
                {getStatusLabel(selectedBlock, isKorean)}
              </span>
              <span className="detail-chip">{selectedBlock.timeLabel}</span>
              <span className="detail-chip">{selectedBlock.durationLabel}</span>
            </div>

            <div className="scheduled-review-detail-panel__panel">
              <span>{isKorean ? "포함 주제" : "Topics included"}</span>
              <div className="scheduled-review-detail-panel__topics">
                {selectedBlock.topics.map((topic) => (
                  <div className="scheduled-review-detail-panel__topic" key={topic}>
                    <i />
                    <strong>{topic}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="scheduled-review-detail-panel__panel">
              <div className="scheduled-review-detail-panel__impact">
                <div>
                  <span>{isKorean ? "준비도 영향" : "Readiness impact"}</span>
                  <strong>{readinessScore}%</strong>
                </div>
                <i style={{ "--scheduled-review-readiness": `${readinessScore}%` } as CSSProperties} />
              </div>
              <p>{selectedBlock.impact}</p>
            </div>

            <div className="scheduled-review-detail-panel__panel">
              <span>{isKorean ? "이 세션이 필요한 이유" : "Why this session exists"}</span>
              <ul className="page-card__list">
                <li>{isKorean ? "같은 꼬리질문이 반복될 때 답변 기준점을 다시 고정합니다." : "Re-anchor the answer baseline before the same tail question loops again."}</li>
                <li>{isKorean ? "기준 문서와 말하기 사이의 간극을 짧은 블록으로 줄입니다." : "Shrink the gap between source-of-truth writing and spoken rehearsal."}</li>
                <li>{isKorean ? "이번 주 DFS 흐름에서 약한 분기 하나를 확실히 닫습니다." : "Close one weak DFS branch decisively within this week's loop."}</li>
              </ul>
            </div>

            <div className="scheduled-review-detail-panel__stats">
              {contextSignals.map((signal) => (
                <article key={signal.label}>
                  <span>{signal.label}</span>
                  <strong>{signal.value}</strong>
                </article>
              ))}
            </div>

            <div className="scheduled-review-detail-panel__actions">
              <Link className="primary-button" to={selectedBlock.nextActionTo}>
                {isKorean ? "복습 세션 시작" : "Start review session"}
              </Link>
              <button
                className="secondary-button"
                onClick={() => {
                  handleReschedule(selectedBlock.id);
                }}
                type="button"
              >
                {isKorean ? "일정 다시 잡기" : "Reschedule"}
              </button>
              <button
                className="secondary-button"
                onClick={() => {
                  handleComplete(selectedBlock.id);
                }}
                type="button"
              >
                {isKorean ? "완료 처리" : "Mark complete"}
              </button>
            </div>
          </aside>
        ) : null}
      </div>
    </PageContainer>
  );
}

export default ScheduledReviewsPage;
