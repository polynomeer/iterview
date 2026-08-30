import { useSearchParams } from "react-router-dom";
import {
  normalizeArchiveFilterState,
  type ArchiveFilterState,
} from "../../entities/archive/model";
import { useArchiveQuery } from "../../features/archive/api/useArchiveQuery";
import { routeConfig } from "../../shared/config/routes";
import { getErrorDetails } from "../../shared/api/errors";
import { useLocale } from "../../shared/i18n";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { useLayoutMode } from "../../shared/ui/layout";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { ArchiveDesktopLayout, ArchiveMobileLayout } from "./ArchiveLayouts";
import { ArchiveFilterBar, ArchiveList } from "../../widgets/archive";

export function ArchivePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { locale } = useLocale();
  const isKorean = locale === "ko";
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
  const followupCount = filteredItems.filter((item) => item.isFollowUp).length;
  const sessionLinkedCount = filteredItems.filter((item) => Boolean(item.sourceSessionId)).length;
  const filterCount = [
    filterState.category,
    filterState.company,
    filterState.tag,
    filterState.sourceInterviewRecordId,
    filterState.sourceInterviewQuestionId,
  ].filter(Boolean).length;

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
      description={
        isKorean
          ? "이미 방어에 성공한 질문을 다시 보고, 필터링하고, 검증된 답변 패턴이 필요할 때 원래 세션 맥락을 다시 여세요."
          : "Review the questions that already held up, filter them, and reopen the original session context when you need a proven answer pattern."
      }
      eyebrow={isKorean ? "아카이브" : "Archive"}
      introVariant="minimal"
      title={isKorean ? "검증된 답변 분기를 다시 여세요" : "Reopen proven answer branches"}
    >
      <section className="page-card archive-workspace-surface">
        <div className="archive-workspace-surface__header">
          <div className="archive-workspace-surface__intro">
            <div className="archive-workspace-surface__eyebrow-row">
              <span className="page-card__label">{isKorean ? "아카이브 작업공간" : "Archive workspace"}</span>
              <span className="question-status-badge question-status-badge--accent">{isKorean ? "답변 라이브러리" : "Answer library"}</span>
            </div>
            <p className="archive-workspace-surface__breadcrumbs">
              {isKorean ? "검증된 답변" : "Proven answers"}
              <span>/</span>
              {isKorean ? "세션 역추적" : "Session backtrace"}
              <span>/</span>
              {isKorean ? "근거 검토" : "Source review"}
            </p>
            <h2 className="archive-workspace-surface__title">{isKorean ? "이미 버텨낸 답변을 다시 여세요" : "Reopen answers that already held up"}</h2>
            <p className="archive-workspace-surface__body">
              {isKorean
                ? "아카이브를 다시 열고 비교하고, 논리가 단단해졌던 정확한 세션으로 역추적할 수 있는 검증된 답변 선반처럼 다루세요."
                : "Treat the archive as a compact shelf of proven answers you can reopen, compare, and trace back to the exact session where the reasoning became solid."}
            </p>
          </div>
          <div className="archive-workspace-surface__stats">
              <article className="archive-workspace-surface__stat">
                <span>{isKorean ? "표시 항목" : "Visible items"}</span>
                <strong>{filteredItems.length}</strong>
              </article>
              <article className="archive-workspace-surface__stat">
                <span>{isKorean ? "꼬리질문" : "Follow-ups"}</span>
                <strong>{followupCount}</strong>
              </article>
              <article className="archive-workspace-surface__stat">
                <span>{isKorean ? "세션 연결" : "Session linked"}</span>
                <strong>{sessionLinkedCount}</strong>
              </article>
              <article className="archive-workspace-surface__stat">
                <span>{isKorean ? "활성 필터" : "Active filters"}</span>
                <strong>{filterCount}</strong>
              </article>
            </div>
          </div>
          <div className="archive-workspace-surface__chips">
          <span className="detail-chip">{isKorean ? `아카이브 ${filteredItems.length}` : `Archive size ${filteredItems.length}`}</span>
          {followupCount > 0 ? <span className="detail-chip detail-chip--accent">{isKorean ? "꼬리질문 경로 저장됨" : "Follow-up paths saved"}</span> : null}
          {sessionLinkedCount > 0 ? <span className="detail-chip">{isKorean ? "세션 추적 가능" : "Session trace available"}</span> : null}
          {filterCount > 0 ? <span className="detail-chip">{isKorean ? `필터 ${filterCount}` : `Filtered ${filterCount}`}</span> : null}
        </div>
        <div className="archive-workspace-surface__guidance">
          <article className="archive-workspace-surface__guidance-card">
            <span>{isKorean ? "의도를 갖고 열기" : "Open with intent"}</span>
            <strong>{isKorean ? "반복 압박에도 버텼던 답변만 재사용하세요." : "Reuse answers that already held up under repeated probing."}</strong>
          </article>
          <article className="archive-workspace-surface__guidance-card">
            <span>{isKorean ? "근거 추적" : "Trace the source"}</span>
            <strong>{isKorean ? "원래 맥락이 필요할 때는 정확한 모의 세션으로 다시 이동하세요." : "Jump back to the exact mock session when you need the original context."}</strong>
          </article>
        </div>
      </section>
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
                body={isKorean ? "보관된 질문과 사용 가능한 아카이브 필터를 불러오는 중입니다." : "Loading archived questions and available archive filters."}
                title={isKorean ? "아카이브를 준비하는 중입니다" : "Preparing archive"}
              />
            ) : null}

            {archiveQuery.isError ? (
              <ErrorStateCard
                body={
                  archiveQuery.error instanceof Error
                    ? archiveQuery.error.message
                    : isKorean
                      ? "아카이브를 불러오지 못했습니다."
                      : "The archive could not be loaded."
                }
                details={getErrorDetails(archiveQuery.error)}
                onAction={() => {
                  void archiveQuery.refetch();
                }}
                title={isKorean ? "아카이브를 불러올 수 없습니다" : "Unable to load archive"}
              />
            ) : null}

            {!archiveQuery.isLoading &&
            !archiveQuery.isError &&
            archiveQuery.data &&
            filteredItems.length === 0 ? (
              <EmptyStateCard
                action={{
                  label: isKorean ? "연습으로 돌아가기" : "Back to practice",
                  to: routeConfig.practice.buildPath(),
                }}
                body={isKorean ? "현재 필터와 일치하는 보관 질문이 없습니다." : "No archived questions matched the current filters."}
                title={isKorean ? "아카이브가 비어 있습니다" : "Archive is empty"}
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
