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
import { WorkspaceContinuityRail } from "../../shared/ui/WorkspaceContinuityRail";
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
  const visibleItems = practiceQuery.data?.items ?? [];
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
      description="Filter the question set until one prompt is worth a focused DFS answer pass, then enter that branch on purpose."
      eyebrow="Practice"
      introVariant="minimal"
      title="Choose the next interview branch"
    >
      <WorkspaceContinuityRail
        current={{
          title: "Practice branch selection",
          description: "Filter the catalog until one question deserves a deliberate DFS pass.",
        }}
        downstream={[
          {
            title: "Review queue",
            description: "Move into retry work when a weak branch should be cleared before new practice.",
            to: routeConfig.reviewQueue.buildPath(),
          },
          {
            title: "Question tree",
            description: "Open the branch map before answering when follow-up order matters.",
            to: visibleItems[0]
              ? routeConfig.questionTree.buildPath({ questionId: visibleItems[0].id })
              : routeConfig.practice.buildPath(),
          },
        ]}
        upstream={[
          {
            title: "Resume analysis",
            description: "Start from the source claim that needs interview pressure next.",
            to: routeConfig.resumeAnalysis.buildPath(),
          },
        ]}
      />
      <section className="page-card practice-workspace-surface">
        <div className="practice-workspace-surface__header">
          <div className="practice-workspace-surface__intro">
            <div className="practice-workspace-surface__eyebrow-row">
              <span className="page-card__label">Practice workspace</span>
              <span className="question-status-badge question-status-badge--accent">Branch entry</span>
            </div>
            <p className="practice-workspace-surface__breadcrumbs">
              Resume signal
              <span>/</span>
              DFS branch choice
              <span>/</span>
              Retry awareness
            </p>
            <h2 className="practice-workspace-surface__title">Pick the next branch on purpose</h2>
            <p className="practice-workspace-surface__body">
              Filter until one question is worth a real defense pass, not another loose click through the catalog.
            </p>
          </div>
          <div className="practice-workspace-surface__stats">
            <article className="practice-workspace-surface__stat">
              <span>Visible questions</span>
              <strong>{practiceQuery.data?.items.length ?? 0}</strong>
            </article>
            <article className="practice-workspace-surface__stat">
              <span>Retry candidates</span>
              <strong>{retryItemCount}</strong>
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
        <div className="practice-workspace-surface__guidance">
          <article className="practice-workspace-surface__guidance-card">
            <span>Selection rule</span>
            <strong>Pick the next question because it sharpens one branch.</strong>
          </article>
          <article className="practice-workspace-surface__guidance-card">
            <span>Retry rule</span>
            <strong>Check recovery pressure before opening fresh practice.</strong>
          </article>
        </div>
        <div className="practice-workspace-surface__chips">
          {filterState.search ? <span className="detail-chip detail-chip--accent">{`Search ${filterState.search}`}</span> : null}
          {filterState.category ? <span className="detail-chip">{`Category ${filterState.category}`}</span> : null}
          {filterState.company ? <span className="detail-chip">{`Company ${filterState.company}`}</span> : null}
          {filterState.difficulty ? <span className="detail-chip">{`Level ${filterState.difficulty}`}</span> : null}
          {filterState.status ? <span className="detail-chip">{`Status ${filterState.status}`}</span> : null}
          {retryItemCount > 0 ? <span className="detail-chip">Retry work present</span> : null}
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
              <span className="page-card__label">Recovery queue</span>
              <span className="question-status-badge">Retry first</span>
            </div>
            <h2 className="page-card__title">Need to clear weak branches first?</h2>
            <p className="page-card__body">
              Jump into the review queue before choosing a fresh prompt when the weak branch is already known.
            </p>
            <div className="page-card__actions">
              <Link className="secondary-button" to={routeConfig.reviewQueue.buildPath()}>
                Open review queue
              </Link>
            </div>
          </SectionPanel>
        );

        const focusSummaryCard = (
          <SectionPanel className="practice-focus-summary-card" variant="muted">
            <div className="practice-focus-summary-card__topline">
              <span className="page-card__label">DFS focus</span>
              <span className="detail-chip detail-chip--accent">Branch control</span>
            </div>
            <h2 className="page-card__title">Make one deliberate pick instead of browsing loosely</h2>
            <div className="practice-focus-summary-card__stats">
              <article>
                <span>Weak nodes</span>
                <strong>{weakItemCount}</strong>
              </article>
              <article>
                <span>Retry candidates</span>
                <strong>{retryItemCount}</strong>
              </article>
            </div>
            <div className="practice-focus-summary-card__group">
              <span>Current signals</span>
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
                  <span className="detail-chip">No strong signal yet</span>
                ) : null}
              </div>
            </div>
          </SectionPanel>
        );

        const mapLaunchCard = (
          <SectionPanel className="practice-map-launch-card workspace-note-card" variant="muted">
            <div className="practice-map-launch-card__topline">
              <span className="page-card__label">Question map</span>
              <span className="detail-chip">DFS view</span>
            </div>
            <h2 className="page-card__title">Open the branch map when follow-up order matters</h2>
            <p className="page-card__body">
              When one prompt looks important, switch to the tree before answering.
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
                Open first visible map
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
          return (
            <PracticeMobileLayout
              filterControls={filterControls}
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
