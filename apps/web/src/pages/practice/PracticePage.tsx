import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  normalizePracticeFilterState,
  type PracticeFilterState,
} from "../../entities/practice/model";
import { usePracticeQuestionsQuery } from "../../features/practice/api/usePracticeQuestionsQuery";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { getErrorDetails } from "../../shared/api/errors";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { SectionPanel, useLayoutMode } from "../../shared/ui/layout";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { WorkspaceContinuityRail } from "../../shared/ui/WorkspaceContinuityRail";
import { PracticeDesktopLayout, PracticeMobileLayout } from "./PracticeLayouts";
import { QuestionFilterBar, QuestionList, SearchInput } from "../../widgets/practice";

export function PracticePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDesktop } = useLayoutMode();
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const [draftSearch, setDraftSearch] = useState(searchParams.get("search") ?? "");
  const filterState = normalizePracticeFilterState({
    category: searchParams.get("category") ?? undefined,
    company: searchParams.get("company") ?? undefined,
    difficulty: searchParams.get("difficulty") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    search: searchParams.get("search") ?? undefined,
  });
  const practiceQuery = usePracticeQuestionsQuery({
    category: filterState.category || undefined,
    company: filterState.company || undefined,
    difficulty: filterState.difficulty || undefined,
    status: filterState.status || undefined,
    search: filterState.search || undefined,
  });
  const visibleItems = practiceQuery.data?.items ?? [];
  const highlightedQuestion = visibleItems[0] ?? null;
  const weakItemCount = visibleItems.filter((item) => (item.statusLabel ?? "").toLowerCase().includes("weak")).length;
  const retryItemCount = visibleItems.filter((item) => (item.statusLabel ?? "").toLowerCase().includes("retry")).length;
  const topCategories = practiceQuery.data?.filters.categories.slice(0, 3) ?? [];
  const topCompanies = practiceQuery.data?.filters.companies.slice(0, 3) ?? [];

  useEffect(() => {
    setDraftSearch(filterState.search);
  }, [filterState.search]);

  function updateFilters(next: PracticeFilterState) {
    const nextSearchParams = new URLSearchParams();

    if (next.category) {
      nextSearchParams.set("category", next.category);
    }

    if (next.company) {
      nextSearchParams.set("company", next.company);
    }

    if (next.difficulty) {
      nextSearchParams.set("difficulty", next.difficulty);
    }

    if (next.status) {
      nextSearchParams.set("status", next.status);
    }

    if (next.search) {
      nextSearchParams.set("search", next.search);
    }

    setSearchParams(nextSearchParams, { replace: true });
  }

  return (
    <PageContainer
      description={
        isKorean
          ? "질문 집합을 좁혀 하나의 질문 문구가 실제 DFS 답변 연습에 걸맞아질 때까지 고른 뒤, 의도적으로 그 분기로 들어가세요."
          : "Filter the question set until one prompt is worth a focused DFS answer pass, then enter that branch on purpose."
      }
      eyebrow={isKorean ? "연습" : "Practice"}
      introVariant="minimal"
      title={isKorean ? "다음 면접 분기를 고르세요" : "Choose the next interview branch"}
    >
      <WorkspaceContinuityRail
        current={{
          title: isKorean ? "연습 분기 선택" : "Practice branch selection",
          description: isKorean
            ? "카탈로그를 좁혀 하나의 질문이 의도적인 DFS 점검을 받을 만한 상태가 되게 하세요."
            : "Filter the catalog until one question deserves a deliberate DFS pass.",
        }}
        downstream={[
          {
            title: isKorean ? "리뷰 큐" : "Review queue",
            description: isKorean
              ? "새 연습 전에 약한 분기를 먼저 정리해야 하면 재시도 작업으로 이동하세요."
              : "Move into retry work when a weak branch should be cleared before new practice.",
            to: routeConfig.reviewQueue.buildPath(),
          },
          {
            title: isKorean ? "질문 트리" : "Question tree",
            description: isKorean
              ? "꼬리질문 순서가 중요하면 답변 전에 분기 지도를 여세요."
              : "Open the branch map before answering when follow-up order matters.",
            to: visibleItems[0]
              ? routeConfig.questionTree.buildPath({ questionId: visibleItems[0].id })
              : routeConfig.practice.buildPath(),
          },
        ]}
        upstream={[
          {
            title: isKorean ? "이력서 분석" : "Resume analysis",
            description: isKorean
              ? "다음 면접 압박이 필요한 source claim에서 시작하세요."
              : "Start from the source claim that needs interview pressure next.",
            to: routeConfig.resumeAnalysis.buildPath(),
          },
        ]}
      />
      <section className="page-card practice-workspace-surface">
        <div className="practice-workspace-surface__header">
          <div className="practice-workspace-surface__intro">
            <div className="practice-workspace-surface__eyebrow-row">
              <span className="page-card__label">{isKorean ? "연습 작업공간" : "Practice workspace"}</span>
              <span className="question-status-badge question-status-badge--accent">
                {isKorean ? "분기 진입" : "Branch entry"}
              </span>
            </div>
            <p className="practice-workspace-surface__breadcrumbs">
              {isKorean ? "이력서 신호" : "Resume signal"}
              <span>/</span>
              {isKorean ? "DFS 분기 선택" : "DFS branch choice"}
              <span>/</span>
              {isKorean ? "재시도 인식" : "Retry awareness"}
            </p>
            <h2 className="practice-workspace-surface__title">
              {isKorean ? "다음 분기를 의도적으로 고르세요" : "Pick the next branch on purpose"}
            </h2>
            <p className="practice-workspace-surface__body">
              {isKorean
                ? "카탈로그를 무심하게 넘기지 말고, 실제 방어형 답변 점검이 필요한 질문 하나가 남을 때까지 필터링하세요."
                : "Filter until one question is worth a real defense pass, not another loose click through the catalog."}
            </p>
          </div>
          <div className="practice-workspace-surface__stats">
            <article className="practice-workspace-surface__stat">
              <span>{isKorean ? "보이는 질문" : "Visible questions"}</span>
              <strong>{practiceQuery.data?.items.length ?? 0}</strong>
            </article>
            <article className="practice-workspace-surface__stat">
              <span>{isKorean ? "재시도 후보" : "Retry candidates"}</span>
              <strong>{retryItemCount}</strong>
            </article>
            <article className="practice-workspace-surface__stat">
              <span>{isKorean ? "활성 필터" : "Active filters"}</span>
              <strong>
                {[filterState.category, filterState.company, filterState.difficulty, filterState.status, filterState.search]
                  .filter(Boolean)
                  .length}
              </strong>
            </article>
          </div>
        </div>
        <div className="practice-workspace-surface__guidance">
          <article className="practice-workspace-surface__guidance-card">
            <span>{isKorean ? "선택 원칙" : "Selection rule"}</span>
            <strong>
              {isKorean
                ? "다음 질문은 하나의 분기를 더 날카롭게 만들기 때문에 골라야 합니다."
                : "Pick the next question because it sharpens one branch."}
            </strong>
          </article>
          <article className="practice-workspace-surface__guidance-card">
            <span>{isKorean ? "재시도 원칙" : "Retry rule"}</span>
            <strong>
              {isKorean
                ? "새 연습을 열기 전에 먼저 복구 압력을 확인하세요."
                : "Check recovery pressure before opening fresh practice."}
            </strong>
          </article>
        </div>
        <div className="practice-workspace-surface__chips">
          {filterState.search ? <span className="detail-chip detail-chip--accent">{isKorean ? `검색 ${filterState.search}` : `Search ${filterState.search}`}</span> : null}
          {filterState.category ? <span className="detail-chip">{isKorean ? `카테고리 ${filterState.category}` : `Category ${filterState.category}`}</span> : null}
          {filterState.company ? <span className="detail-chip">{isKorean ? `회사 ${filterState.company}` : `Company ${filterState.company}`}</span> : null}
          {filterState.difficulty ? <span className="detail-chip">{isKorean ? `난이도 ${filterState.difficulty}` : `Level ${filterState.difficulty}`}</span> : null}
          {filterState.status ? <span className="detail-chip">{isKorean ? `상태 ${filterState.status}` : `Status ${filterState.status}`}</span> : null}
          {retryItemCount > 0 ? <span className="detail-chip">{isKorean ? "재시도 작업 있음" : "Retry work present"}</span> : null}
        </div>
      </section>
      {(() => {
        const searchControl = (
          <SearchInput
            onChange={(nextValue) => {
              setDraftSearch(nextValue);
              updateFilters({ ...filterState, search: nextValue });
            }}
            value={draftSearch}
          />
        );

        const reviewQueueCard = (
          <SectionPanel className="practice-review-queue-card" variant="muted">
            <div className="practice-review-queue-card__topline">
              <span className="page-card__label">{isKorean ? "복구 큐" : "Recovery queue"}</span>
              <span className="question-status-badge">{isKorean ? "재시도 우선" : "Retry first"}</span>
            </div>
            <h2 className="page-card__title">
              {isKorean ? "약한 분기를 먼저 정리해야 하나요?" : "Need to clear weak branches first?"}
            </h2>
            <p className="page-card__body">
              {isKorean
                ? "이미 약한 분기가 보인다면 새 질문 문구를 고르기 전에 리뷰 큐로 먼저 이동하세요."
                : "Jump into the review queue before choosing a fresh prompt when the weak branch is already known."}
            </p>
            <div className="page-card__actions">
              <Link className="secondary-button" to={routeConfig.reviewQueue.buildPath()}>
                {isKorean ? "리뷰 큐 열기" : "Open review queue"}
              </Link>
            </div>
          </SectionPanel>
        );

        const focusSummaryCard = (
          <SectionPanel className="practice-focus-summary-card" variant="muted">
            <div className="practice-focus-summary-card__topline">
              <span className="page-card__label">{isKorean ? "DFS 집중" : "DFS focus"}</span>
              <span className="detail-chip detail-chip--accent">{isKorean ? "분기 제어" : "Branch control"}</span>
            </div>
            <h2 className="page-card__title">
              {isKorean
                ? "느슨하게 둘러보지 말고 하나를 의도적으로 고르세요"
                : "Make one deliberate pick instead of browsing loosely"}
            </h2>
            <div className="practice-focus-summary-card__stats">
              <article>
                <span>{isKorean ? "약한 노드" : "Weak nodes"}</span>
                <strong>{weakItemCount}</strong>
              </article>
              <article>
                <span>{isKorean ? "재시도 후보" : "Retry candidates"}</span>
                <strong>{retryItemCount}</strong>
              </article>
            </div>
            <div className="practice-focus-summary-card__group">
              <span>{isKorean ? "현재 신호" : "Current signals"}</span>
              <div className="practice-focus-summary-card__chips">
                {topCategories.length > 0
                  ? topCategories.map((category) => (
                      <span className="detail-chip" key={category.id}>
                        {category.label}
                      </span>
                    ))
                  : null}
                {topCompanies.length > 0
                  ? topCompanies.map((company) => (
                      <span className="detail-chip" key={company.id}>
                        {company.label}
                      </span>
                    ))
                  : null}
                {topCategories.length === 0 && topCompanies.length === 0 ? (
                  <span className="detail-chip">
                    {isKorean ? "아직 뚜렷한 신호가 없습니다" : "No strong signal yet"}
                  </span>
                ) : null}
              </div>
            </div>
          </SectionPanel>
        );

        const focusQuestionCard = highlightedQuestion ? (
          <SectionPanel className="practice-focus-question-card" variant="muted">
            <div className="practice-focus-question-card__topline">
              <span className="page-card__label">{isKorean ? "질문 상세" : "Question details"}</span>
              <span className="detail-chip detail-chip--accent">{isKorean ? "우선 검토" : "Priority review"}</span>
            </div>
            <h2 className="page-card__title">{highlightedQuestion.title}</h2>
            <div className="practice-focus-question-card__meta">
              <span className="list-item-card__meta-pill">{highlightedQuestion.categoryLabel}</span>
              <span className="list-item-card__meta-pill">{highlightedQuestion.companyLabel}</span>
              <span className="list-item-card__meta-pill">{highlightedQuestion.difficultyLabel}</span>
              {highlightedQuestion.statusLabel ? (
                <span className="list-item-card__meta-pill">{highlightedQuestion.statusLabel}</span>
              ) : null}
            </div>
            <p className="page-card__body">{highlightedQuestion.prompt}</p>
            {(highlightedQuestion.relatedSkillLabels ?? []).length > 0 ? (
              <div className="practice-focus-question-card__section">
                <span className="page-card__label">{isKorean ? "핵심 주제" : "Key concepts"}</span>
                <div className="chip-list">
                  {highlightedQuestion.relatedSkillLabels.map((skill) => (
                    <span className="detail-chip" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {highlightedQuestion.progressSummaryLabel || highlightedQuestion.resumeRelevanceLabel ? (
              <div className="practice-focus-question-card__section">
                <span className="page-card__label">{isKorean ? "최근 신호" : "Recent signals"}</span>
                <div className="practice-focus-question-card__signals">
                  {highlightedQuestion.progressSummaryLabel ? <p>{highlightedQuestion.progressSummaryLabel}</p> : null}
                  {highlightedQuestion.resumeRelevanceLabel ? (
                    <p>
                      {isKorean ? "이력서 연관도" : "Resume match"}: {highlightedQuestion.resumeRelevanceLabel}
                      {highlightedQuestion.resumeRelevanceReason ? ` · ${highlightedQuestion.resumeRelevanceReason}` : ""}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
            <div className="page-card__actions">
              <Link
                className="primary-button"
                to={routeConfig.answerEditor.buildPath({ questionId: highlightedQuestion.id })}
              >
                {isKorean ? "바로 답변 시작" : "Start answering"}
              </Link>
              <Link
                className="secondary-button"
                to={routeConfig.questionDetail.buildPath({ questionId: highlightedQuestion.id })}
              >
                {isKorean ? "질문 상세 보기" : "View question details"}
              </Link>
            </div>
          </SectionPanel>
        ) : (
          <SectionPanel className="practice-focus-question-card" variant="muted">
            <div className="practice-focus-question-card__topline">
              <span className="page-card__label">{isKorean ? "질문 상세" : "Question details"}</span>
            </div>
            <h2 className="page-card__title">{isKorean ? "질문을 찾는 중입니다" : "Waiting for a question"}</h2>
            <p className="page-card__body">
              {isKorean
                ? "현재 필터에 맞는 질문이 보이면 이 레일에 상세 컨텍스트와 바로 진입 액션이 표시됩니다."
                : "When a question matches the current filters, this rail will show its context and entry actions."}
            </p>
          </SectionPanel>
        );

        const mapLaunchCard = (
          <SectionPanel className="practice-map-launch-card workspace-note-card" variant="muted">
            <div className="practice-map-launch-card__topline">
              <span className="page-card__label">{isKorean ? "질문 지도" : "Question map"}</span>
              <span className="detail-chip">{isKorean ? "DFS 보기" : "DFS view"}</span>
            </div>
            <h2 className="page-card__title">
              {isKorean
                ? "꼬리질문 순서가 중요하면 분기 지도를 여세요"
                : "Open the branch map when follow-up order matters"}
            </h2>
            <p className="page-card__body">
              {isKorean
                ? "중요해 보이는 질문 문구가 하나 보이면 답변 전에 트리로 전환하세요."
                : "When one prompt looks important, switch to the tree before answering."}
            </p>
            <div className="page-card__actions">
              <Link
                className="secondary-button"
                to={
                  visibleItems[0]
                    ? routeConfig.questionTree.buildPath({ questionId: visibleItems[0].id })
                    : routeConfig.practice.buildPath()
                }
              >
                {isKorean ? "첫 번째 보이는 지도 열기" : "Open first visible map"}
              </Link>
            </div>
          </SectionPanel>
        );

        const filterControls =
          practiceQuery.data ? (
            <QuestionFilterBar
              embedded={isDesktop}
              filters={practiceQuery.data.filters}
              onChange={updateFilters}
              value={filterState}
            />
          ) : null;

        const resultsContent = (
          <>
            {practiceQuery.isLoading ? (
              <LoadingStateCard
                body={
                  isKorean
                    ? "질문 목록과 사용 가능한 필터를 불러오는 중입니다."
                    : "Loading the question list and available filters."
                }
                title={isKorean ? "연습 질문 준비 중" : "Preparing practice questions"}
              />
            ) : null}

            {practiceQuery.isError ? (
              <ErrorStateCard
                body={
                  practiceQuery.error instanceof Error
                    ? practiceQuery.error.message
                    : isKorean
                      ? "연습 목록을 불러오지 못했습니다."
                      : "The practice list could not be loaded."
                }
                details={getErrorDetails(practiceQuery.error)}
                onAction={() => {
                  void practiceQuery.refetch();
                }}
                title={isKorean ? "연습 질문을 불러올 수 없습니다" : "Unable to load practice questions"}
              />
            ) : null}

            {!practiceQuery.isLoading &&
            !practiceQuery.isError &&
            practiceQuery.data &&
            practiceQuery.data.items.length === 0 ? (
              <EmptyStateCard
                action={{
                  label: isKorean ? "필터 초기화" : "Clear filters",
                  to: routeConfig.practice.buildPath(),
                }}
                body={
                  isKorean
                    ? "현재 필터에 맞는 질문이 없습니다. 검색 범위를 넓히거나 필터를 초기화해보세요."
                    : "No questions matched the current filters. Try a broader search or reset the filters."
                }
                title={isKorean ? "연습 질문이 없습니다" : "No practice questions found"}
              />
            ) : null}

            {!practiceQuery.isLoading &&
            !practiceQuery.isError &&
            practiceQuery.data &&
            practiceQuery.data.items.length > 0 ? (
              <QuestionList
                hasMore={practiceQuery.data.hasMore}
                items={practiceQuery.data.items}
                layout={isDesktop ? "grid" : "stack"}
              />
            ) : null}
          </>
        );

        if (!isDesktop) {
          return (
            <PracticeMobileLayout
              filterControls={filterControls}
              focusQuestionCard={focusQuestionCard}
              focusSummaryCard={focusSummaryCard}
              mapLaunchCard={mapLaunchCard}
              resultsContent={resultsContent}
              reviewQueueCard={reviewQueueCard}
              searchControl={searchControl}
            />
          );
        }

        return (
          <PracticeDesktopLayout
            filterControls={filterControls}
            focusQuestionCard={focusQuestionCard}
            focusSummaryCard={focusSummaryCard}
            mapLaunchCard={mapLaunchCard}
            resultsContent={resultsContent}
            reviewQueueCard={reviewQueueCard}
            searchControl={searchControl}
          />
        );
      })()}
    </PageContainer>
  );
}
