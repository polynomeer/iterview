import { useSearchParams } from "react-router-dom";
import {
  normalizeArchiveFilterState,
  type ArchiveFilterState,
} from "../../entities/archive/model";
import { useArchiveQuery } from "../../features/archive/api/useArchiveQuery";
import { routeConfig } from "../../shared/config/routes";
import { getErrorDetails } from "../../shared/api/errors";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { useLayoutMode } from "../../shared/ui/layout";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { ArchiveDesktopLayout, ArchiveMobileLayout } from "./ArchiveLayouts";
import { ArchiveFilterBar, ArchiveList } from "../../widgets/archive";

export function ArchivePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDesktop } = useLayoutMode();
  const filterState = normalizeArchiveFilterState({
    category: searchParams.get("category") ?? undefined,
    company: searchParams.get("company") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
    sourceInterviewRecordId: searchParams.get("sourceInterviewRecordId") ?? undefined,
    sourceInterviewQuestionId: searchParams.get("sourceInterviewQuestionId") ?? undefined,
  });
  const archiveQuery = useArchiveQuery({
    category: filterState.category || undefined,
    company: filterState.company || undefined,
    tag: filterState.tag || undefined,
  });
  const filteredItems =
    archiveQuery.data?.items.filter((item) => {
      if (
        filterState.sourceInterviewRecordId &&
        item.sourceInterviewRecordId !== filterState.sourceInterviewRecordId
      ) {
        return false;
      }

      if (
        filterState.sourceInterviewQuestionId &&
        item.sourceInterviewQuestionId !== filterState.sourceInterviewQuestionId
      ) {
        return false;
      }

      return true;
    }) ?? [];

  function updateFilters(next: ArchiveFilterState) {
    const nextSearchParams = new URLSearchParams();

    if (next.category) {
      nextSearchParams.set("category", next.category);
    }

    if (next.company) {
      nextSearchParams.set("company", next.company);
    }

    if (next.tag) {
      nextSearchParams.set("tag", next.tag);
    }

    setSearchParams(nextSearchParams, { replace: true });
  }

  return (
    <PageContainer
      description="Review the questions you have already mastered, filter them, and reopen their latest result summary when needed."
      eyebrow="Archive"
      title="Archive"
    >
      {(() => {
        const filterControls =
          archiveQuery.data &&
          (archiveQuery.data.filters.categories.length > 0 ||
            archiveQuery.data.filters.companies.length > 0 ||
            archiveQuery.data.filters.tags.length > 0) ? (
            <ArchiveFilterBar
              embedded={isDesktop}
              filters={archiveQuery.data.filters}
              onChange={updateFilters}
              value={filterState}
            />
          ) : null;

        const listContent = (
          <>
            {archiveQuery.isLoading ? (
              <LoadingStateCard
                body="Loading archived questions and available archive filters."
                title="Preparing archive"
              />
            ) : null}

            {archiveQuery.isError ? (
              <ErrorStateCard
                body={
                  archiveQuery.error instanceof Error
                    ? archiveQuery.error.message
                    : "The archive could not be loaded."
                }
                details={getErrorDetails(archiveQuery.error)}
                onAction={() => {
                  void archiveQuery.refetch();
                }}
                title="Unable to load archive"
              />
            ) : null}

            {!archiveQuery.isLoading &&
            !archiveQuery.isError &&
            archiveQuery.data &&
            filteredItems.length === 0 ? (
              <EmptyStateCard
                action={{
                  label: "Back to practice",
                  to: routeConfig.practice.buildPath(),
                }}
                body="No archived questions matched the current filters."
                title="Archive is empty"
              />
            ) : null}

            {!archiveQuery.isLoading &&
            !archiveQuery.isError &&
            archiveQuery.data &&
            filteredItems.length > 0 ? (
              <ArchiveList items={filteredItems} layout={isDesktop ? "grid" : "stack"} />
            ) : null}
          </>
        );

        if (!isDesktop) {
          return <ArchiveMobileLayout filterControls={filterControls} listContent={listContent} />;
        }

        return <ArchiveDesktopLayout filterControls={filterControls} listContent={listContent} />;
      })()}
    </PageContainer>
  );
}
