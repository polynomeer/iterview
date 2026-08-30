import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
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

function getBookmarkRecords(isKorean: boolean): BookmarkRecord[] {
  return [
    {
      id: "distributed-lock-followup",
      category: "questions",
      title: isKorean ? "네트워크 지터 상황에서도 Redis 락 갱신이 실패할 수 있는 이유 설명하기" : "Explain why Redis lock renewal can still fail under network jitter",
      summary: isKorean ? "결제 안정성 프로젝트의 꼬리 질문입니다. 실패 서사와 제한된 완화책을 더 선명하게 다듬어야 합니다." : "Tail follow-up from the payment reliability project. Needs a crisper failure story and bounded mitigation.",
      source: isKorean ? "이력서 앵커 / 정산 안정성 개선" : "Resume anchor / Settlement Reliability Improvements",
      savedAt: isKorean ? "10분 전" : "10 minutes ago",
      status: isKorean ? "레버리지 높음" : "High leverage",
      readiness: 68,
      tags: isKorean ? ["백엔드", "동시성", "실패 모드"] : ["Backend", "Concurrency", "Failure mode"],
      context: isKorean ? "면접관이 분산 락 보장을 계속 파고들며 어디서 설계가 여전히 깨질 수 있는지 물을 때 사용하세요." : "Use this when the interviewer keeps drilling into distributed lock guarantees and asks where your design can still break.",
      related: isKorean ? ["분산 락 노트", "멱등성 질문 트리", "Redis 만료 트레이드오프"] : ["Distributed lock note", "Idempotency question tree", "Redis expiration trade-off"],
      primaryActionLabel: isKorean ? "질문 연습" : "Practice question",
      primaryActionTo: routeConfig.questionTree.buildPath({ questionId: "distributed-lock" }),
      secondaryActionLabel: isKorean ? "답변 에디터 열기" : "Open answer editor",
      secondaryActionTo: routeConfig.answerEditor.buildPath({ questionId: "distributed-lock" }),
    },
    {
      id: "dfs-payments-path",
      category: "paths",
      title: isKorean ? "결제 DFS 드릴 경로" : "Payments DFS drill path",
      summary: isKorean ? "멱등성, 락 경합, 재시도 의미론, 정산 롤백을 다루는 큐레이션 분기입니다." : "Curated branch covering idempotency, lock contention, retry semantics, and settlement rollback.",
      source: isKorean ? "질문 경로 / 결제 클러스터" : "Question path / Payments cluster",
      savedAt: isKorean ? "1시간 전" : "1 hour ago",
      status: isKorean ? "준비됨" : "Ready",
      readiness: 82,
      tags: isKorean ? ["DFS", "결제", "핵심 스토리"] : ["DFS", "Payments", "Core story"],
      context: isKorean ? "트랜잭션 무결성 중심의 백엔드 면접 전, 높은 확신도로 리허설할 경로로 유용합니다." : "Useful as a high-confidence rehearsal path before a backend interview focused on transaction integrity.",
      related: isKorean ? ["정산 안정성 노트", "재시도 전략 답변", "메시지 순서 꼬리질문"] : ["Settlement reliability note", "Retry strategy answer", "Message ordering follow-up"],
      primaryActionLabel: isKorean ? "연습 열기" : "Open practice",
      primaryActionTo: routeConfig.practice.buildPath(),
      secondaryActionLabel: isKorean ? "노트 열기" : "Open notes",
      secondaryActionTo: routeConfig.notes.buildPath(),
    },
    {
      id: "system-design-material",
      category: "materials",
      title: isKorean ? "System design source of truth 묶음" : "System design source-of-truth pack",
      summary: isKorean ? "캐시 무효화, 쿼럼, 파티션 복구 트레이드오프를 위한 저장된 읽기 묶음입니다." : "Saved reading set for cache invalidation, quorum, and partition recovery trade-offs.",
      source: isKorean ? "학습 자료 / 분산 시스템" : "Learning materials / Distributed systems",
      savedAt: isKorean ? "오늘" : "Today",
      status: isKorean ? "검토" : "Review",
      readiness: 57,
      tags: isKorean ? ["자료", "설계", "트레이드오프"] : ["Materials", "Design", "Trade-offs"],
      context: isKorean ? "넓은 학습 자료를 내 프로젝트 이력으로 뒷받침되는 면접용 주장으로 바꿀 때 가까이 두세요." : "Keep this close when converting broad study material into interview-safe claims backed by your own project history.",
      related: isKorean ? ["CAP 정리 노트", "캐시 일관성 답변", "분산 락 노트"] : ["CAP theorem note", "Cache consistency answer", "Distributed lock note"],
      primaryActionLabel: isKorean ? "노트 열기" : "Open notes",
      primaryActionTo: routeConfig.notes.buildPath(),
      secondaryActionLabel: isKorean ? "리뷰 큐" : "Review queue",
      secondaryActionTo: routeConfig.reviewQueue.buildPath(),
    },
    {
      id: "stripe-company",
      category: "companies",
      title: isKorean ? "Stripe 면접 집중 보드" : "Stripe interview focus",
      summary: isKorean ? "안정성 주장과 결제 API, 장애 격리, 운영 규율을 연결하는 회사 북마크입니다." : "Company bookmark tying reliability claims to payment APIs, fault isolation, and operational discipline.",
      source: isKorean ? "목표 회사 / Stripe" : "Target company / Stripe",
      savedAt: isKorean ? "어제" : "Yesterday",
      status: isKorean ? "관찰 목록" : "Watchlist",
      readiness: 61,
      tags: isKorean ? ["회사", "결제", "서사"] : ["Company", "Payments", "Narrative"],
      context: isKorean ? "가장 강한 경험담을 정확성과 인프라 성숙도에 대한 회사 기대와 맞추는 데 사용하세요." : "Use this bookmark to align your strongest stories with the company’s likely expectations around correctness and infrastructure maturity.",
      related: isKorean ? ["결제 DFS 드릴 경로", "정산 안정성 노트", "타깃 채용 공고"] : ["Payments DFS drill path", "Settlement reliability note", "Target job posting"],
      primaryActionLabel: isKorean ? "회사 보드 열기" : "Open company board",
      primaryActionTo: routeConfig.targetCompanies.buildPath(),
      secondaryActionLabel: isKorean ? "이력서 열기" : "Open resume",
      secondaryActionTo: routeConfig.resumeAnalysis.buildPath(),
    },
    {
      id: "kafka-rebalance-question",
      category: "questions",
      title: isKorean ? "실제로 겪은 consumer group rebalance 문제 설명하기" : "Describe consumer group rebalance pain you actually experienced",
      summary: isKorean ? "현재 답변이 너무 추상적이고 운영 증상을 놓치고 있어서 저장했습니다." : "Saved because the current answer is too abstract and misses operational symptoms.",
      source: isKorean ? "질문 트리 / Kafka 분기" : "Question tree / Kafka branch",
      savedAt: isKorean ? "2일 전" : "2 days ago",
      status: isKorean ? "근거 보강 필요" : "Needs proof",
      readiness: 49,
      tags: isKorean ? ["Kafka", "스트리밍", "운영 디테일"] : ["Kafka", "Streaming", "Operational detail"],
      context: isKorean ? "교과서식 설명 대신 구체적인 프로덕션 사례를 강제로 꺼내기 위해 만든 북마크입니다." : "The bookmark exists to force a concrete production example instead of a textbook explanation.",
      related: isKorean ? ["Kafka consumer group 노트", "lag 대응 답변", "파티션 skew 예시"] : ["Kafka consumer group note", "Lag handling answer", "Partition skew example"],
      primaryActionLabel: isKorean ? "질문 연습" : "Practice question",
      primaryActionTo: routeConfig.questionTree.buildPath({ questionId: "kafka-rebalance" }),
      secondaryActionLabel: isKorean ? "답변 에디터 열기" : "Open answer editor",
      secondaryActionTo: routeConfig.answerEditor.buildPath({ questionId: "kafka-rebalance" }),
    },
    {
      id: "resume-proof-material",
      category: "materials",
      title: isKorean ? "정산 지표용 이력서 근거 묶음" : "Resume proof pack for settlement metrics",
      summary: isKorean ? "이력서 불릿을 방어 가능한 정량 문장으로 바꾸는 근거 번들입니다." : "Evidence bundle that turns resume bullets into defendable quantitative statements.",
      source: isKorean ? "이력서 분석 / 지표 근거" : "Resume analysis / Metrics evidence",
      savedAt: isKorean ? "3일 전" : "3 days ago",
      status: isKorean ? "중요" : "Important",
      readiness: 74,
      tags: isKorean ? ["이력서", "근거", "지표"] : ["Resume", "Evidence", "Metrics"],
      context: isKorean ? "파생 과정과 주변 맥락을 다시 복구할 수 있게 두어 모호한 지표 주장을 막아주는 북마크입니다." : "This bookmark helps prevent vague metric claims by keeping the derivation and surrounding context recoverable.",
      related: isKorean ? ["정산 안정성 노트", "이력서 히트맵", "지표 꼬리질문"] : ["Settlement reliability note", "Resume heatmap", "Metrics follow-up"],
      primaryActionLabel: isKorean ? "이력서 열기" : "Open resume",
      primaryActionTo: routeConfig.resumeAnalysis.buildPath(),
      secondaryActionLabel: isKorean ? "히트맵 열기" : "Open heatmap",
      secondaryActionTo: routeConfig.resumeHeatmap.buildPath({ versionId: "v4" }),
    },
  ];
}

export function BookmarksPage() {
  const { isDesktop } = useLayoutMode();
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const bookmarkRecords = useMemo(() => getBookmarkRecords(isKorean), [isKorean]);
  const [activeFilter, setActiveFilter] = useState<BookmarkCategory>("questions");
  const [selectedBookmarkId, setSelectedBookmarkId] = useState(
    "distributed-lock-followup",
  );
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "readiness">("recent");

  const filteredBookmarks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const visible = bookmarkRecords.filter((record) => record.category === activeFilter).filter((record) => {
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
  }, [activeFilter, bookmarkRecords, search, sort]);

  const selectedBookmark =
    filteredBookmarks.find((record) => record.id === selectedBookmarkId) ??
    bookmarkRecords.find((record) => record.id === selectedBookmarkId) ??
    filteredBookmarks[0] ??
    bookmarkRecords[0];

  const categoryCount = bookmarkRecords.filter((record) => record.category === activeFilter).length;
  const highReadinessCount = bookmarkRecords.filter((record) => record.readiness >= 70).length;

  return (
    <PageContainer
      actions={
        <>
          <button className="secondary-button" type="button">
            {isKorean ? "현재 보기 저장" : "Save current view"}
          </button>
          <Link className="secondary-button" to={routeConfig.practice.buildPath()}>
            {isKorean ? "연습 열기" : "Open practice"}
          </Link>
        </>
      }
      description={isKorean ? "source of truth 연결을 잃지 않으면서 다시 볼 질문, 경로, 근거 묶음, 회사 맥락을 저장하세요." : "Collect the exact questions, paths, evidence packs, and company context you want to revisit without losing the source-of-truth connection."}
      eyebrow={isKorean ? "저장된 맥락" : "Saved context"}
      title={isKorean ? "저장된 인터뷰 북마크" : "Saved interview bookmarks"}
    >
      <section className="page-card bookmarks-workspace-surface">
        <div className="bookmarks-workspace-surface__intro">
          <div className="bookmarks-workspace-surface__eyebrow-row">
            <span className="page-card__label">{isKorean ? "저장된 집중 스택" : "Saved focus stack"}</span>
            <span className="question-status-badge question-status-badge--accent">
              {isKorean ? "DFS 준비됨" : "DFS-ready"}
            </span>
          </div>
          <h2 className="bookmarks-workspace-surface__title">{isKorean ? "가장 중요한 드릴 경로와 보조 근거를 한 번의 클릭 거리 안에 두세요" : "Keep the most important drill paths and supporting evidence one click away"}</h2>
          <p className="bookmarks-workspace-surface__body">
            {isKorean
              ? "북마크는 맥락 전환을 줄여야 합니다. 기억으로 사슬을 다시 만들지 않고도 깊은 인터뷰 가지를 이어갈 수 있게 해주는 정확한 프롬프트, 근거, 회사 맥락을 저장하세요."
              : "Bookmarks should reduce context switching. Save the exact prompt, proof, or company context that helps you continue a deep interview branch without rebuilding the chain from memory."}
          </p>
        </div>
        <div className="bookmarks-workspace-surface__stats">
          <article>
            <span>{isKorean ? "전체 저장 수" : "Total saved"}</span>
            <strong>{bookmarkRecords.length}</strong>
          </article>
          <article>
            <span>{isKorean ? "현재 필터" : "Current filter"}</span>
            <strong>{categoryCount}</strong>
          </article>
          <article>
            <span>{isKorean ? "높은 준비도" : "High readiness"}</span>
            <strong>{highReadinessCount}</strong>
          </article>
        </div>
      </section>

      <div className={`bookmarks-layout ${isDesktop ? "bookmarks-layout--desktop" : "bookmarks-layout--mobile"}`}>
        <main className="bookmarks-layout__main page-stack">
          <section className="page-card bookmarks-panel">
            <div className="bookmarks-panel__topbar">
              <div aria-label={isKorean ? "북마크 카테고리" : "Bookmark categories"} className="bookmarks-filter-bar" role="tablist">
                {BOOKMARK_FILTERS.map((filter) => (
                  <button
                    aria-selected={filter.key === activeFilter}
                    className={`bookmarks-filter-chip${filter.key === activeFilter ? " bookmarks-filter-chip--active" : ""}`}
                    key={filter.key}
                    onClick={() => {
                      setActiveFilter(filter.key);
                      setSearch("");
                      setSelectedBookmarkId(bookmarkRecords.find((record) => record.category === filter.key)?.id ?? "");
                    }}
                    role="tab"
                    type="button"
                  >
                    {isKorean
                      ? filter.key === "questions"
                        ? "저장 질문"
                        : filter.key === "paths"
                          ? "경로"
                          : filter.key === "materials"
                            ? "자료"
                            : "회사"
                      : filter.label}
                  </button>
                ))}
              </div>

              <div className="bookmarks-toolbar">
                <label className="bookmarks-toolbar__search">
                  <input
                    aria-label={isKorean ? "북마크 검색" : "Search bookmarks"}
                    onChange={(event) => {
                      setSearch(event.target.value);
                    }}
                    placeholder={isKorean ? "저장한 항목 검색..." : "Search saved items..."}
                    type="search"
                    value={search}
                  />
                </label>
                <label className="bookmarks-toolbar__sort">
                  <span>{isKorean ? "정렬" : "Sort"}</span>
                  <select
                    aria-label={isKorean ? "북마크 정렬" : "Sort bookmarks"}
                    onChange={(event) => {
                      setSort(event.target.value as "recent" | "readiness");
                    }}
                    value={sort}
                  >
                    <option value="recent">{isKorean ? "최신순" : "Most recent"}</option>
                    <option value="readiness">{isKorean ? "준비도" : "Readiness"}</option>
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
                  <p className="section-heading__eyebrow">{isKorean ? "북마크 상세" : "Bookmark details"}</p>
                  <h2 className="page-card__title">{selectedBookmark.title}</h2>
                </div>
              </div>

              <div className="bookmark-detail-rail__group">
                <span className="bookmark-detail-rail__label">{isKorean ? "저장한 이유" : "Why this is saved"}</span>
                <p>{selectedBookmark.context}</p>
              </div>

              <div className="bookmark-detail-rail__meta-grid">
                <article>
                  <span>{isKorean ? "상태" : "Status"}</span>
                  <strong>{selectedBookmark.status}</strong>
                </article>
                <article>
                  <span>{isKorean ? "준비도" : "Readiness"}</span>
                  <strong>{selectedBookmark.readiness}</strong>
                </article>
                <article>
                  <span>{isKorean ? "저장 시점" : "Saved"}</span>
                  <strong>{selectedBookmark.savedAt}</strong>
                </article>
                <article>
                  <span>{isKorean ? "출처" : "Source"}</span>
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
                <span className="bookmark-detail-rail__label">{isKorean ? "연결 북마크" : "Related bookmarks"}</span>
                <div className="bookmark-detail-rail__related-list">
                  {selectedBookmark.related.map((item) => (
                    <div className="bookmark-detail-rail__related-item" key={item}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bookmark-detail-rail__group">
                <span className="bookmark-detail-rail__label">{isKorean ? "태그 클러스터" : "Tag cluster"}</span>
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
