import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
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

function getNoteRecords(isKorean: boolean): NoteRecord[] {
  return [
    {
      id: "dist-lock",
      title: isKorean ? "분산 락 패턴" : "Distributed Lock Patterns",
      summary: isKorean ? "분산 락 접근 방식, 트레이드오프, 실패 모드 개요입니다." : "Overview of distributed locking approaches, trade-offs, and failure modes.",
      excerpt: isKorean ? "Redis SET NX PX, Redlock 트레이드오프, 임대 갱신 사용 시점을 정리합니다." : "Redis SET NX PX, Redlock trade-offs, and when to use lease renewal.",
      updatedAt: isKorean ? "2시간 전" : "2 hours ago",
      createdAt: isKorean ? "2024년 5월 10일" : "May 10, 2024",
      pinned: false,
      tags: isKorean ? ["동시성", "분산 시스템", "백엔드"] : ["Concurrency", "Distributed Systems", "Backend"],
      linkedQuestions: [
        { id: "distributed-lock", title: isKorean ? "분산 락이란 무엇인가요?" : "What is a distributed lock?", score: 78 },
        { id: "redlock", title: isKorean ? "Redlock 알고리즘은 어떻게 동작하나요?" : "How does Redlock algorithm work?", score: 72 },
        { id: "tradeoffs", title: isKorean ? "분산 락의 트레이드오프는 무엇인가요?" : "What are the trade-offs of distributed locking?", score: 66 },
      ],
      resumeContext: {
        title: isKorean ? "확장형 결제 처리 시스템" : "Scalable Payment Processing System",
        description: isKorean ? "Redis 기반 멱등 락을 도입해 중복 거래를 99.9% 줄였습니다." : "Implemented Redis-based idempotent locks to reduce duplicate transactions by 99.9%.",
        period: "2022.08 - 2023.04",
      },
      relatedSkills: [
        { label: isKorean ? "분산 시스템" : "Distributed Systems", level: isKorean ? "상급" : "Advanced" },
        { label: isKorean ? "동시성" : "Concurrency", level: isKorean ? "상급" : "Advanced" },
        { label: "System Design", level: isKorean ? "숙련" : "Proficient" },
        { label: "Redis", level: isKorean ? "숙련" : "Proficient" },
      ],
      backlinks: isKorean ? ["System Design: URL Shortener", "Redlock vs ZooKeeper"] : ["System Design: URL Shortener", "Redlock vs ZooKeeper"],
      body: isKorean
        ? `## 개요

분산 락은 여러 인스턴스나 서비스가 공유 자원에 접근할 때 조율을 돕습니다. 경쟁 상태를 막고 일관성을 유지하는 데 사용합니다.

## 대표 접근

- Redis SET NX PX: 단순하고 빠르며 널리 사용됨
- Redlock Algorithm: 여러 Redis 노드를 써서 더 강한 보장을 노림
- Database lock: 강한 트랜잭션 보장이 이미 있을 때 유용함

## 실전 원칙

- 데드락을 피하려면 항상 만료 시간을 둔다
- 락 소유권 검증을 위해 고유 값을 사용한다
- 락 해제는 안전하게 하고 실패 경로를 명시한다

## 트레이드오프

분산 락은 공짜가 아닙니다. 면접에서 주장하는 blast radius에 맞는 가장 단순한 메커니즘을 우선 선택하세요.`
        : `## Overview

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
      summary: isKorean ? "충돌 전략, 리다이렉트 지연, 저장소 파티셔닝 노트입니다." : "Collision strategy, redirect latency, and storage partitioning notes.",
      excerpt: isKorean ? "Base62 인코딩, 캐시 전략, 쓰기 핫스팟 완화 포인트를 정리합니다." : "Base62 encoding, cache strategy, and write hot-spot mitigation.",
      updatedAt: isKorean ? "4시간 전" : "4 hours ago",
      createdAt: isKorean ? "2024년 5월 11일" : "May 11, 2024",
      pinned: true,
      tags: ["System Design"],
      linkedQuestions: [{ id: "url-shortener-scale", title: isKorean ? "URL 단축 서비스를 어떻게 확장하시겠습니까?" : "How would you scale a URL shortener?", score: 81 }],
      resumeContext: {
        title: isKorean ? "백엔드 플랫폼 현대화" : "Backend Platform Modernization",
        description: isKorean ? "트래픽이 큰 API 흐름과 캐시 기반 읽기 경로를 운영했습니다." : "Operated traffic-heavy API flows and cache-backed read paths.",
        period: "2021.03 - 2022.07",
      },
      relatedSkills: [
        { label: "System Design", level: isKorean ? "상급" : "Advanced" },
        { label: isKorean ? "캐싱" : "Caching", level: isKorean ? "숙련" : "Proficient" },
      ],
      backlinks: isKorean ? ["분산 락 패턴"] : ["Distributed Lock Patterns"],
      body: isKorean
        ? `## 핵심 아이디어

읽기 중심 트래픽, 캐시 적중률, 충돌 처리부터 먼저 설명하고 부가 요소는 그 다음에 다루세요.

## 실패 렌즈

면접관이 더 깊게 파고들면 hot key 완화, 저장소 파티셔닝, 리다이렉트 관측성을 설명할 준비를 하세요.`
        : `## Core idea

Focus the answer on read-heavy traffic, cache hit ratio, and collision handling before discussing embellishments.

## Failure lens

If the interviewer drills deeper, be ready to explain hot key mitigation, storage partitioning, and redirect observability.`,
    },
    {
      id: "dist-lock-strategies",
      title: isKorean ? "분산 락 전략" : "Distributed Lock Strategies",
      summary: isKorean ? "단일 Redis로 충분한 경우와 쿼럼 기반 락이 중요한 경우를 구분합니다." : "When single-node Redis is enough and when quorum-based locking matters.",
      excerpt: isKorean ? "꼬리질문에서 Redlock 회의론을 정리할 때 유용합니다." : "Useful for clarifying Redlock skepticism during follow-up questioning.",
      updatedAt: isKorean ? "1일 전" : "1 day ago",
      createdAt: isKorean ? "2024년 5월 12일" : "May 12, 2024",
      pinned: true,
      tags: isKorean ? ["백엔드"] : ["Backend"],
      linkedQuestions: [{ id: "redis-nx", title: isKorean ? "Redis SET NX PX는 어떻게 동작하나요?" : "How does Redis SET NX PX work?", score: 72 }],
      resumeContext: {
        title: isKorean ? "정산 안정성 개선" : "Settlement Reliability Improvements",
        description: isKorean ? "중복 정산 사고를 줄이면서 락 전략을 비교했습니다." : "Compared lock strategies while reducing duplicate settlement incidents.",
        period: "2022.08 - 2023.04",
      },
      relatedSkills: [{ label: "Redis", level: isKorean ? "숙련" : "Proficient" }],
      backlinks: isKorean ? ["분산 락 패턴"] : ["Distributed Lock Patterns"],
      body: isKorean
        ? `## 판단 기준

실패 영향 범위가 제한적이고 운영 단순성이 이론적 안전성보다 중요할 때는 단일 노드 접근을 사용하세요.

주장이 cross-node 보장에 의존하거나 중복 작업 비용이 크다면 더 강한 조율 방식을 선택하세요.`
        : `## Decision rule

Use the single-node approach when failure impact is bounded and operational simplicity matters more than theoretical safety.

Use stronger coordination when the claim depends on cross-node guarantees or when duplicate work is materially expensive.`,
    },
    {
      id: "cap-theorem",
      title: isKorean ? "CAP 정리 설명" : "CAP Theorem Explained",
      summary: isKorean ? "가용성과 일관성 트레이드오프를 실전적으로 설명하는 프레임입니다." : "Practical framing for availability vs consistency trade-offs.",
      excerpt: isKorean ? "교과서식 설명만 하지 말고 구체적 시스템 동작에 연결하세요." : "Avoid textbook-only answers. Tie choices to concrete system behavior.",
      updatedAt: isKorean ? "3일 전" : "3 days ago",
      createdAt: isKorean ? "2024년 5월 8일" : "May 8, 2024",
      pinned: true,
      tags: isKorean ? ["분산 시스템"] : ["Distributed Systems"],
      linkedQuestions: [{ id: "cap-theorem-q", title: isKorean ? "실무에서 CAP 트레이드오프를 어떻게 설명하나요?" : "How do you explain CAP trade-offs in practice?", score: 69 }],
      resumeContext: {
        title: isKorean ? "글로벌 티켓팅 인프라" : "Global Ticketing Infrastructure",
        description: isKorean ? "지연, 복제, 페일오버 트레이드오프가 실제 사용자에게 영향을 주는 시스템을 다뤘습니다." : "Worked on systems where latency, replication, and failover trade-offs had real user impact.",
        period: "2020.11 - 2021.12",
      },
      relatedSkills: [{ label: isKorean ? "분산 시스템" : "Distributed Systems", level: isKorean ? "상급" : "Advanced" }],
      backlinks: isKorean ? ["Kafka Consumer Groups"] : ["Kafka Consumer Groups"],
      body: isKorean
        ? `## 면접 각도

CAP을 암기한 약어가 아니라 실패 모드 관점의 대화로 설명하세요. 가장 좋은 답변은 partition 상황에서 무엇을 포기하고 왜 그런지 설명합니다.`
        : `## Interview angle

Frame CAP as a failure-mode discussion, not as a memorized acronym. The strongest answers explain what is sacrificed under partition and why.`,
    },
    {
      id: "redis-data-structures",
      title: isKorean ? "Redis 자료구조" : "Redis Data Structures",
      summary: isKorean ? "list, set, sorted set, hash, stream을 빠르게 참고하기 위한 노트입니다." : "Quick reference for lists, sets, sorted sets, hashes, and streams.",
      excerpt: isKorean ? "면접 질문이 시스템에서 저장소 프리미티브로 전환될 때 유용합니다." : "Useful when interview questions pivot from systems to storage primitives.",
      updatedAt: isKorean ? "1일 전" : "1 day ago",
      createdAt: isKorean ? "2024년 5월 9일" : "May 9, 2024",
      pinned: false,
      tags: ["Redis"],
      linkedQuestions: [{ id: "redis-structures", title: isKorean ? "어떤 Redis 자료구조를 고르고 왜 그렇게 선택하나요?" : "Which Redis data structure would you choose and why?", score: 74 }],
      resumeContext: {
        title: isKorean ? "실시간 재고 서비스" : "Real-time Inventory Service",
        description: isKorean ? "카운터, 큐, 핫 상태 조회에 Redis를 사용했습니다." : "Used Redis for counters, queues, and hot-state lookups.",
        period: "2021.04 - 2022.02",
      },
      relatedSkills: [{ label: "Redis", level: isKorean ? "숙련" : "Proficient" }],
      backlinks: isKorean ? ["분산 락 패턴"] : ["Distributed Lock Patterns"],
      body: isKorean
        ? `## 회상 모델

암기한 기능 목록이 아니라 접근 패턴부터 보고 자료구조를 고르세요. 조회 비용, 정렬 필요성, eviction 위험을 설명해야 합니다.`
        : `## Recall model

Choose the structure by access pattern first, not by memorized feature list. Explain lookup cost, ordering needs, and eviction risk.`,
    },
    {
      id: "kafka-consumer-groups",
      title: isKorean ? "Kafka 컨슈머 그룹" : "Kafka Consumer Groups",
      summary: isKorean ? "파티션 소유, 리밸런스 문제점, 지연 적체 대응을 정리한 노트입니다." : "Partition ownership, rebalance pain points, and lag handling.",
      excerpt: isKorean ? "처리량, 장애 대응, 재연 질문용 짧은 준비 메모입니다." : "Short notes for questions about throughput, failure handling, and replay.",
      updatedAt: isKorean ? "2일 전" : "2 days ago",
      createdAt: isKorean ? "2024년 5월 7일" : "May 7, 2024",
      pinned: false,
      tags: ["Kafka"],
      linkedQuestions: [{ id: "kafka-rebalance", title: isKorean ? "컨슈머 그룹은 어떻게 리밸런스되나요?" : "How do consumer groups rebalance?", score: 71 }],
      resumeContext: {
        title: isKorean ? "이벤트 처리 현대화" : "Event Processing Modernization",
        description: isKorean ? "이벤트 컨슈머를 안정화하면서 파티션 쏠림과 재연 로직을 다뤘습니다." : "Handled partition skew and replay logic while stabilizing event consumers.",
        period: "2021.07 - 2022.06",
      },
      relatedSkills: [{ label: isKorean ? "스트리밍" : "Streaming", level: isKorean ? "숙련" : "Proficient" }],
      backlinks: isKorean ? ["CAP 정리 설명"] : ["CAP Theorem Explained"],
      body: isKorean
        ? `## 강한 답변 프레임

파티션 할당, 상태 handoff 비용, lag 가시성을 이야기하세요. 브로커 이론만이 아니라 운영 고통도 함께 언급해야 합니다.`
        : `## Strong answer frame

Talk about partition assignment, state handoff cost, and lag visibility. Mention operational pain, not just broker theory.`,
    },
  ];
}

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
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const { isDesktop } = useLayoutMode();
  const noteRecords = useMemo(() => getNoteRecords(isKorean), [isKorean]);
  const [selectedNoteId, setSelectedNoteId] = useState("dist-lock");
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  const filteredNotes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return noteRecords;
    }

    return noteRecords.filter((note) => {
      const haystack = [note.title, note.summary, note.excerpt, note.tags.join(" ")].join(" ").toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [noteRecords, search]);

  const selectedNote =
    filteredNotes.find((note) => note.id === selectedNoteId) ??
    noteRecords.find((note) => note.id === selectedNoteId) ??
    filteredNotes[0] ??
    noteRecords[0];

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
      ? isKorean
        ? "재사용 잠재력 높음"
        : "High reuse potential"
      : selectedBacklinkCount > 0
        ? isKorean
          ? "연결된 맥락"
          : "Connected context"
        : isKorean
          ? "링크 보강 필요"
          : "Needs linking";

  return (
    <PageContainer
      actions={
        <>
          <button className="secondary-button" type="button">
            {isKorean ? "새 노트" : "New note"}
          </button>
          <Link className="secondary-button" to={routeConfig.questionTree.buildPath({ questionId: "distributed-lock" })}>
            {isKorean ? "질문 맵 열기" : "Open question map"}
          </Link>
        </>
      }
      description={isKorean ? "연결된 질문 맥락을 잃지 않으면서 재사용 가능한 방어 조각, 트레이드오프 노트, 기준 문서 발췌를 정리하세요." : "Organize reusable defense fragments, trade-off notes, and source-of-truth snippets without losing the linked question context."}
      eyebrow={isKorean ? "답변 조각" : "Answer fragments"}
      title={isKorean ? "재사용 가능한 방어 노트 보관" : "Store reusable defense notes"}
    >
      <section className="page-card notes-workspace-surface">
        <div className="notes-workspace-surface__header">
          <div className="notes-workspace-surface__intro">
            <div className="notes-workspace-surface__eyebrow-row">
              <span className="page-card__label">{isKorean ? "지식 작업공간" : "Knowledge workspace"}</span>
              <span className="question-status-badge question-status-badge--accent">{isKorean ? "방어 조각" : "Defense fragments"}</span>
            </div>
            <p className="notes-workspace-surface__breadcrumbs">
              {isKorean ? "재사용 가능한 설명" : "Reusable explanations"}
              <span>/</span>
              {isKorean ? "연결된 질문" : "Linked questions"}
              <span>/</span>
              {isKorean ? "이력서 근거" : "Resume evidence"}
            </p>
            <h2 className="notes-workspace-surface__title">{isKorean ? "다음 DFS 심화 질문 전에 원하는 설명을 준비해 두세요" : "Keep the explanation you want ready before the next DFS drill-down"}</h2>
            <p className="notes-workspace-surface__body">
              {isKorean
                ? "노트를 재사용 가능한 방어 조각으로 작성하세요. 좋은 노트는 꼬리질문에 더 빨리 답하게 하고, 뒷받침하는 이력서 근거와 다시 연결되며, 압박 상황에서 모호한 설명을 줄여야 합니다."
                : "Write notes as reusable defense fragments. A strong note should help you answer a follow-up faster, reconnect to supporting resume evidence, and reduce vague explanation under pressure."}
            </p>
          </div>
          <div className="notes-workspace-surface__stats">
            <article className="notes-workspace-surface__stat">
              <span>{isKorean ? "전체 노트" : "Total notes"}</span>
              <strong>{noteRecords.length}</strong>
            </article>
            <article className="notes-workspace-surface__stat">
              <span>{isKorean ? "고정 노트" : "Pinned notes"}</span>
              <strong>{noteRecords.filter((note) => note.pinned).length}</strong>
            </article>
            <article className="notes-workspace-surface__stat">
              <span>{isKorean ? "연결 질문" : "Linked questions"}</span>
              <strong>{linkedQuestionCount}</strong>
            </article>
            <article className="notes-workspace-surface__stat">
              <span>{isKorean ? "연관 스킬" : "Related skills"}</span>
              <strong>{relatedSkillCount}</strong>
            </article>
          </div>
        </div>
        <div className="notes-workspace-surface__chips">
          <span className="detail-chip detail-chip--accent">{isKorean ? "재사용 가능한 답변 조각" : "Reusable answer fragments"}</span>
          <span className="detail-chip">{isKorean ? "이력서 연결" : "Resume-linked"}</span>
          <span className="detail-chip">{isKorean ? "질문 연결" : "Question-linked"}</span>
          <span className="detail-chip">{isKorean ? "검색 가능한 발췌문" : "Searchable snippets"}</span>
        </div>
      </section>

      {selectedNote ? (
        <section className="page-card notes-insight-surface">
          <div className="notes-insight-surface__header">
            <div>
              <span className="page-card__label">{isKorean ? "선택한 노트 인사이트" : "Selected note insight"}</span>
              <h2 className="page-card__title">
                {isKorean
                  ? "다음 꼬리질문 가지를 위해 재사용 가능한 설명 조각 하나를 준비하세요"
                  : "Keep one reusable explanation fragment ready for the next follow-up branch"}
              </h2>
              <p className="page-card__body">
                {isKorean
                  ? "좋은 노트는 사실을 쏟아놓는 문서가 아닙니다. 면접관이 이력서 주장부터 DFS 수준의 꼬리질문까지 밀어붙일 때 재사용할 수 있는 압축된 설명 단위여야 합니다."
                  : "The best note is not a dump of facts. It is a tight explanation unit you can reuse when the interviewer pushes from the resume claim into DFS-level follow-up questions."}
              </p>
            </div>
            <span className="detail-chip detail-chip--accent">{noteModeSignal}</span>
          </div>
          <div className="notes-insight-surface__stats">
            <article>
              <span>{isKorean ? "단어 수" : "Words"}</span>
              <strong>{selectedWordCount}</strong>
              <p>{isKorean ? "답변이 흐트러지지 않게 받쳐줄 정도의 밀도" : "enough density to support a complete answer without drifting"}</p>
            </article>
            <article>
              <span>{isKorean ? "질문 평균" : "Question average"}</span>
              <strong>{selectedQuestionAverage || "-"}</strong>
              <p>{isKorean ? "연결된 꼬리질문 전반의 평균 점수" : "average score across linked follow-up questions"}</p>
            </article>
            <article>
              <span>{isKorean ? "백링크" : "Backlinks"}</span>
              <strong>{selectedBacklinkCount}</strong>
              <p>{isKorean ? "의미적으로 계속 연결돼야 하는 다른 노트" : "other notes that should stay semantically connected"}</p>
            </article>
          </div>
          <div className="notes-insight-surface__lanes">
            <div className="notes-insight-surface__lane">
              <strong>{isKorean ? "주장 명확화" : "Clarify the claim"}</strong>
              <span>{isKorean ? "보조 디테일을 붙이기 전에 재사용할 핵심 주장을 먼저 적으세요." : "State the main argument you want to reuse before adding supporting details."}</span>
            </div>
            <div className="notes-insight-surface__lane">
              <strong>{isKorean ? "근거 다시 연결" : "Reconnect the evidence"}</strong>
              <span>{isKorean ? "노트를 구체적으로 방어 가능한 이력서 사건, 수치, 엔지니어링 결정과 다시 연결하세요." : "Tie the note back to a resume event, metric, or engineering decision that you can defend concretely."}</span>
            </div>
            <div className="notes-insight-surface__lane">
              <strong>{isKorean ? "가지 확장" : "Branch outward"}</strong>
              <span>{isKorean ? "다음으로 이 노트를 파고들 가능성이 높은 꼬리질문을 연결하세요." : "Link the follow-up questions that are most likely to probe this note next."}</span>
            </div>
          </div>
        </section>
      ) : null}

      <div className={`notes-layout ${isDesktop ? "notes-layout--desktop" : "notes-layout--mobile"}`}>
        <aside className="notes-layout__sidebar page-stack">
          <section className="page-card notes-panel">
            <div className="notes-panel__toolbar">
              <button className="primary-button notes-panel__new-button" type="button">
                {isKorean ? "새 노트" : "New note"}
              </button>
              <button
                aria-label={isKorean ? "노트 필터" : "Filter notes"}
                className="secondary-button notes-panel__icon-button"
                type="button"
              >
                {isKorean ? "필터" : "Filter"}
              </button>
            </div>
            <label className="notes-panel__search">
              <input
                aria-label={isKorean ? "노트 검색" : "Search notes"}
                onChange={(event) => {
                  setSearch(event.target.value);
                }}
                placeholder={isKorean ? "노트 검색..." : "Search notes..."}
                type="search"
                value={search}
              />
            </label>
            <NoteListSection
              notes={pinnedNotes}
              onSelect={setSelectedNoteId}
              selectedNoteId={selectedNote?.id ?? ""}
              title={isKorean ? "고정 노트" : "Pinned notes"}
            />
            <NoteListSection
              notes={otherNotes}
              onSelect={setSelectedNoteId}
              selectedNoteId={selectedNote?.id ?? ""}
              title={isKorean ? "전체 노트" : "All notes"}
            />
            <button className="secondary-button secondary-button--static notes-panel__load-more" type="button">
              {isKorean ? "노트 더 불러오기" : "Load more notes"}
            </button>
          </section>
        </aside>

        <main className="notes-layout__main page-stack">
          {selectedNote ? (
            <section className="page-card notes-editor">
              <div className="notes-editor__breadcrumbs">
                <span>{isKorean ? "노트" : "Notes"}</span>
                <span>/</span>
                <span>{isKorean ? "백엔드" : "Backend"}</span>
                <span>/</span>
                <span>{isKorean ? "동시성" : "Concurrency"}</span>
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
                    {isKorean ? "편집" : "Edit"}
                  </button>
                  <button
                    className={`secondary-button notes-editor__tab${mode === "preview" ? " notes-editor__tab--active" : ""}`}
                    onClick={() => {
                      setMode("preview");
                    }}
                    type="button"
                  >
                    {isKorean ? "미리보기" : "Preview"}
                  </button>
                </div>
              </div>
              <div className="notes-editor__toolbar">
                {["H2", "H3", "B", "I", isKorean ? "코드" : "Code", isKorean ? "링크" : "Link", isKorean ? "목록" : "List", isKorean ? "표" : "Table"].map((item) => (
                  <button className="notes-editor__tool" key={item} type="button">
                    {item}
                  </button>
                ))}
              </div>
              <div className="notes-editor__mini-stats">
                <article>
                  <span>{isKorean ? "연결 질문" : "Linked questions"}</span>
                  <strong>{selectedNote.linkedQuestions.length}</strong>
                </article>
                <article>
                  <span>{isKorean ? "이력서 근거" : "Resume evidence"}</span>
                  <strong>{selectedNote.resumeContext.period}</strong>
                </article>
                <article>
                  <span>{isKorean ? "백링크" : "Backlinks"}</span>
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
                <span>{isKorean ? `단어 ${selectedNote.body.split(/\s+/).filter(Boolean).length}개` : `${selectedNote.body.split(/\s+/).filter(Boolean).length} words`}</span>
                <span>{isKorean ? `연결 질문 ${selectedNote.linkedQuestions.length}개` : `${selectedNote.linkedQuestions.length} linked questions`}</span>
                <span>{isKorean ? "마크다운 작업공간" : "Markdown workspace"}</span>
              </div>
            </section>
          ) : null}
        </main>

        <aside className="notes-layout__rail page-stack">
          {selectedNote ? (
            <section className="page-card notes-detail-rail">
              <div className="section-heading">
                <div>
                  <p className="section-heading__eyebrow">{isKorean ? "노트 상세" : "Note details"}</p>
                  <h2 className="page-card__title">{isKorean ? "노트를 준비 그래프의 나머지와 계속 연결하세요" : "Keep the note connected to the rest of the prep graph"}</h2>
                </div>
              </div>
              <div className="notes-detail-rail__group">
                <span className="notes-detail-rail__label">{isKorean ? "이 노트 정보" : "About this note"}</span>
                <div className="notes-detail-rail__spotlight">
                  <strong>{selectedNote.summary}</strong>
                  <span>{selectedNote.excerpt}</span>
                </div>
                <div className="notes-detail-rail__meta-grid">
                  <article>
                    <span>{isKorean ? "마지막 수정" : "Last updated"}</span>
                    <strong>{selectedNote.updatedAt}</strong>
                  </article>
                  <article>
                    <span>{isKorean ? "생성일" : "Created"}</span>
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
                <span className="notes-detail-rail__label">{isKorean ? "연결 질문" : "Linked questions"}</span>
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
                <span className="notes-detail-rail__label">{isKorean ? "연결된 이력서 맥락" : "Linked resume context"}</span>
                <article className="notes-detail-rail__context-card">
                  <strong>{selectedNote.resumeContext.title}</strong>
                  <p>{selectedNote.resumeContext.description}</p>
                  <div className="notes-detail-rail__context-footer">
                    <span>{selectedNote.resumeContext.period}</span>
                    <Link className="secondary-button" to={routeConfig.resumeAnalysis.buildPath()}>
                      {isKorean ? "이력서 열기" : "Open resume"}
                    </Link>
                  </div>
                </article>
              </div>
              <div className="notes-detail-rail__group">
                <span className="notes-detail-rail__label">{isKorean ? "연관 스킬" : "Related skills"}</span>
                <div className="notes-detail-rail__chips">
                  {selectedNote.relatedSkills.map((skill) => (
                    <span className="detail-chip detail-chip--accent" key={skill.label}>
                      {`${skill.label} ${skill.level}`}
                    </span>
                  ))}
                </div>
              </div>
              <div className="notes-detail-rail__group">
                <span className="notes-detail-rail__label">{isKorean ? "백링크" : "Backlinks"}</span>
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
