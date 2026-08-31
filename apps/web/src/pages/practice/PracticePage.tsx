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
import { PracticeDesktopLayout, PracticeMobileLayout } from "./PracticeLayouts";
import { QuestionFilterBar, QuestionList, SearchInput } from "../../widgets/practice";

export function PracticePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDesktop } = useLayoutMode();
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const [draftSearch, setDraftSearch] = useState(searchParams.get("search") ?? "");
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
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
  const highlightedQuestion = visibleItems.find((item) => item.id === selectedQuestionId) ?? visibleItems[0] ?? null;
  const weakItemCount = visibleItems.filter((item) => (item.statusLabel ?? "").toLowerCase().includes("weak")).length;
  const retryItemCount = visibleItems.filter((item) => (item.statusLabel ?? "").toLowerCase().includes("retry")).length;
  const topCategories = practiceQuery.data?.filters.categories.slice(0, 3) ?? [];
  const topCompanies = practiceQuery.data?.filters.companies.slice(0, 3) ?? [];
  const activeFilterCount = [
    filterState.category,
    filterState.company,
    filterState.difficulty,
    filterState.status,
    filterState.search,
  ].filter(Boolean).length;

  useEffect(() => {
    setDraftSearch(filterState.search);
  }, [filterState.search]);

  useEffect(() => {
    if (visibleItems.length === 0) {
      setSelectedQuestionId(null);
      return;
    }

    if (!selectedQuestionId || !visibleItems.some((item) => item.id === selectedQuestionId)) {
      setSelectedQuestionId(visibleItems[0].id);
    }
  }, [selectedQuestionId, visibleItems]);

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
          ? "질문 풀을 왼쪽에서 좁히고, 중앙에서 비교하고, 오른쪽 인스펙터에서 DFS 진입 여부를 결정하세요."
          : "Narrow the pool on the left, compare questions in the center, and decide DFS entry from the right inspector."
      }
      eyebrow={isKorean ? "연습" : "Practice"}
      introVariant="minimal"
      title={isKorean ? "다음 면접 분기를 고르세요" : "Choose the next interview branch"}
    >
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
              {isKorean ? "새 질문 전에 재도전부터 정리하세요" : "Clear retries before new questions"}
            </h2>
            <p className="page-card__body">
              {isKorean
                ? "약한 분기가 이미 보이면 새 질문을 열기 전에 큐부터 비우세요."
                : "Clear known weak branches before opening new practice."}
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
              <span className="page-card__label">{isKorean ? "필터 요약" : "Filter summary"}</span>
              <span className="detail-chip detail-chip--accent">{isKorean ? "브라우저" : "Browser"}</span>
            </div>
            <h2 className="page-card__title">
              {isKorean ? "한 번에 한 분기만 남기세요" : "Leave only one branch worth entering"}
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
              <span>{isKorean ? "현재 보기" : "Current view"}</span>
              <div className="practice-focus-summary-card__chips">
                <span className="detail-chip">{isKorean ? `질문 ${visibleItems.length}개` : `${visibleItems.length} questions`}</span>
                <span className="detail-chip">{isKorean ? `필터 ${activeFilterCount}개` : `${activeFilterCount} filters`}</span>
              </div>
            </div>
            <div className="practice-focus-summary-card__group">
              <span>{isKorean ? "현재 신호" : "Current signals"}</span>
              <div className="practice-focus-summary-card__chips">
                {topCategories.map((category) => (
                  <span className="detail-chip" key={category.id}>
                    {category.label}
                  </span>
                ))}
                {topCompanies.map((company) => (
                  <span className="detail-chip" key={company.id}>
                    {company.label}
                  </span>
                ))}
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
          <SectionPanel className="practice-focus-question-card practice-inspector-card" variant="muted">
            <div className="practice-focus-question-card__topline">
              <span className="page-card__label">{isKorean ? "질문 상세" : "Question details"}</span>
              <span className="detail-chip detail-chip--accent">{isKorean ? "선택됨" : "Selected"}</span>
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
                <span className="page-card__label">{isKorean ? "핵심 개념" : "Key concepts"}</span>
                <div className="chip-list">
                  {highlightedQuestion.relatedSkillLabels.map((skill) => (
                    <span className="detail-chip" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="practice-focus-question-card__section">
              <span className="page-card__label">{isKorean ? "예상 꼬리질문" : "Expected follow-up questions"}</span>
              <div className="practice-inspector-card__followups">
                {(highlightedQuestion.relatedSkillLabels ?? []).slice(0, 3).map((skill) => (
                  <article className="practice-inspector-card__followup" key={skill}>
                    <strong>{skill}</strong>
                    <p>
                      {isKorean
                        ? `${skill} 관점에서 선택 이유와 실패 복구 전략을 더 깊게 묻는 꼬리질문이 이어질 수 있습니다.`
                        : `Expect deeper follow-ups on design choice and recovery strategy from the ${skill} angle.`}
                    </p>
                  </article>
                ))}
                {(highlightedQuestion.relatedSkillLabels ?? []).length === 0 ? (
                  <article className="practice-inspector-card__followup">
                    <strong>{isKorean ? "기본 꼬리질문" : "Default follow-up"}</strong>
                    <p>
                      {isKorean
                        ? "설계 선택, 실패 시나리오, 대안 비교를 중심으로 꼬리질문이 이어질 가능성이 큽니다."
                        : "Expect follow-ups around design choices, failure cases, and trade-off comparisons."}
                    </p>
                  </article>
                ) : null}
              </div>
            </div>
            {highlightedQuestion.progressSummaryLabel || highlightedQuestion.resumeRelevanceLabel ? (
              <div className="practice-focus-question-card__section">
                <span className="page-card__label">{isKorean ? "최근 시도" : "Recent attempts"}</span>
                <div className="practice-focus-question-card__signals">
                  {highlightedQuestion.progressSummaryLabel ? <p>{highlightedQuestion.progressSummaryLabel}</p> : null}
                  {highlightedQuestion.resumeRelevanceLabel ? (
                    <p>
                      {isKorean ? "이력서 연관도" : "Resume match"}: {highlightedQuestion.resumeRelevanceLabel}
                      {highlightedQuestion.resumeRelevanceReason ? ` / ${highlightedQuestion.resumeRelevanceReason}` : ""}
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
                {isKorean ? "답변 시작" : "Start answering"}
              </Link>
              <Link
                className="secondary-button"
                to={routeConfig.questionDetail.buildPath({ questionId: highlightedQuestion.id })}
              >
                {isKorean ? "질문 상세" : "Question details"}
              </Link>
            </div>
          </SectionPanel>
        ) : (
          <SectionPanel className="practice-focus-question-card practice-inspector-card" variant="muted">
            <div className="practice-focus-question-card__topline">
              <span className="page-card__label">{isKorean ? "질문 상세" : "Question details"}</span>
            </div>
            <h2 className="page-card__title">{isKorean ? "질문을 찾는 중입니다" : "Waiting for a question"}</h2>
            <p className="page-card__body">
              {isKorean
                ? "현재 필터에 맞는 질문을 선택하면 이 레일에 인스펙터와 진입 액션이 표시됩니다."
                : "Select a matching question to populate this inspector and its entry actions."}
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
              {isKorean ? "순서가 중요하면 트리부터 여세요" : "Open the tree when order matters"}
            </h2>
            <p className="page-card__body">
              {isKorean
                ? "답변 전에 꼬리질문의 깊이와 순서를 먼저 확인하세요."
                : "Inspect follow-up depth and order before answering."}
            </p>
            <div className="page-card__actions">
              <Link
                className="secondary-button"
                to={
                  highlightedQuestion
                    ? routeConfig.questionTree.buildPath({ questionId: highlightedQuestion.id })
                    : routeConfig.practice.buildPath()
                }
              >
                {isKorean ? "선택 질문 트리 열기" : "Open selected question tree"}
              </Link>
            </div>
          </SectionPanel>
        );

        const filterControls = practiceQuery.data ? (
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
                layout="stack"
                onSelectQuestion={setSelectedQuestionId}
                searchControl={searchControl}
                selectedQuestionId={selectedQuestionId}
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
