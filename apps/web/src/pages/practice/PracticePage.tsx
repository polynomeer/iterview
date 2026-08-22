import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  normalizePracticeFilterState,
  type PracticeFilterState,
} from "../../entities/practice/model";
import { usePracticeQuestionsQuery } from "../../features/practice/api/usePracticeQuestionsQuery";
import { routeConfig } from "../../shared/config/routes";
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
      description="Browse the question set, refine it with filters, and jump into the next prompt that matches your practice goal."
      eyebrow="Practice"
      title="Practice question discovery"
    >
      <section className="page-card practice-workspace-surface">
        <div className="practice-workspace-surface__header">
          <div className="practice-workspace-surface__intro">
            <div className="practice-workspace-surface__eyebrow-row">
              <span className="page-card__label">Practice workspace</span>
              <span className="question-status-badge question-status-badge--accent">Discovery mode</span>
            </div>
            <p className="practice-workspace-surface__breadcrumbs">
              Question set
              <span>/</span>
              Filtered discovery
              <span>/</span>
              Next branch selection
            </p>
            <h2 className="practice-workspace-surface__title">Practice control tower</h2>
            <p className="practice-workspace-surface__body">
              Narrow the queue until the next prompt is worth a full answer pass, not just another random click
              through the catalog.
            </p>
          </div>
          <div className="practice-workspace-surface__stats">
            <article className="practice-workspace-surface__stat">
              <span>Visible questions</span>
              <strong>{practiceQuery.data?.items.length ?? 0}</strong>
            </article>
            <article className="practice-workspace-surface__stat">
              <span>Categories</span>
              <strong>{practiceQuery.data?.filters.categories.length ?? 0}</strong>
            </article>
            <article className="practice-workspace-surface__stat">
              <span>Companies</span>
              <strong>{practiceQuery.data?.filters.companies.length ?? 0}</strong>
            </article>
            <article className="practice-workspace-surface__stat">
              <span>Active filters</span>
              <strong>
                {[filterState.category, filterState.company, filterState.difficulty, filterState.status, filterState.search]
                  .filter(Boolean)
                  .length}
              </strong>
            </article>
          </div>
        </div>
        <div className="practice-workspace-surface__chips">
          {filterState.search ? <span className="detail-chip detail-chip--accent">{`Search ${filterState.search}`}</span> : null}
          {filterState.category ? <span className="detail-chip">{`Category ${filterState.category}`}</span> : null}
          {filterState.company ? <span className="detail-chip">{`Company ${filterState.company}`}</span> : null}
          {filterState.difficulty ? <span className="detail-chip">{`Level ${filterState.difficulty}`}</span> : null}
          {filterState.status ? <span className="detail-chip">{`Status ${filterState.status}`}</span> : null}
          {!filterState.search &&
          !filterState.category &&
          !filterState.company &&
          !filterState.difficulty &&
          !filterState.status ? (
            <span className="detail-chip">No filters pinned yet</span>
          ) : null}
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
          <SectionPanel>
            <span className="page-card__label">Review queue</span>
            <h2 className="page-card__title">Need to handle scheduled retries first?</h2>
            <p className="page-card__body">
              Jump into the review queue to skip or complete items before choosing a fresh practice question.
            </p>
            <div className="page-card__actions">
              <Link className="secondary-button" to={routeConfig.reviewQueue.buildPath()}>
                Open review queue
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
                body="Loading the question list and available filters."
                title="Preparing practice questions"
              />
            ) : null}

            {practiceQuery.isError ? (
              <ErrorStateCard
                body={
                  practiceQuery.error instanceof Error
                    ? practiceQuery.error.message
                    : "The practice list could not be loaded."
                }
                details={getErrorDetails(practiceQuery.error)}
                onAction={() => {
                  void practiceQuery.refetch();
                }}
                title="Unable to load practice questions"
              />
            ) : null}

            {!practiceQuery.isLoading &&
            !practiceQuery.isError &&
            practiceQuery.data &&
            practiceQuery.data.items.length === 0 ? (
              <EmptyStateCard
                action={{
                  label: "Clear filters",
                  to: routeConfig.practice.buildPath(),
                }}
                body="No questions matched the current filters. Try a broader search or reset the filters."
                title="No practice questions found"
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
          return <PracticeMobileLayout filterControls={filterControls} resultsContent={resultsContent} reviewQueueCard={reviewQueueCard} searchControl={searchControl} />;
        }

        return (
          <PracticeDesktopLayout
            filterControls={filterControls}
            resultsContent={resultsContent}
            reviewQueueCard={reviewQueueCard}
            searchControl={searchControl}
          />
        );
      })()}
    </PageContainer>
  );
}
