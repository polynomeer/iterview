import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useResumeQuestionHeatmapOverlayTargetsQuery } from "../../features/resume-heatmap/api/useResumeQuestionHeatmapOverlayTargetsQuery";
import { useResumeQuestionHeatmapQuery } from "../../features/resume-heatmap/api/useResumeQuestionHeatmapQuery";
import { useResumeVersionSnapshotsQuery } from "../../features/resume/api/useResumeVersionSnapshotsQuery";
import { getErrorDetails, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import type { ResumeQuestionHeatmapFiltersDto, ResumeQuestionHeatmapScopeDto } from "../../shared/types/resumeHeatmap";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageSkeleton,
  Segmented,
  Select,
  Stat,
} from "../../shared/ui/primitives";
import { HeatBadge, LinkedQuestionRow, PressureCounts, useHeatmapCopy } from "./heatmapParts";
import { anchorPathId, buildHeatmapAnchors, readFiltersFromSearchParams, writeFiltersToSearchParams, type HeatmapAnchor } from "./heatmapUtils";
import "./heatmap.css";

function AnchorCard({ anchor, rank, versionId, selectedKey, onSelect }: {
  anchor: HeatmapAnchor;
  rank: number;
  versionId: string;
  selectedKey: string | null;
  onSelect: (targetKey: string | null) => void;
}) {
  const { copy, group, target: targetLabel } = useHeatmapCopy();
  const { item } = anchor;
  const selected = anchor.overlayTargets.find((target) => target.targetKey === selectedKey) ?? null;
  const titleId = `heatmap-anchor-${item.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

  return (
    <li>
      <Card aria-labelledby={titleId} className={`heatmap-anchor heatmap-anchor--${item.heatTone}`} padded>
        <div className="heatmap-anchor__head">
          <span aria-hidden="true" className="heatmap-anchor__rank">
            {rank}
          </span>
          <div className="heatmap-anchor__title-block">
            <h2 className="heatmap-anchor__title" id={titleId}>
              {anchor.title}
            </h2>
            <p className="heatmap-anchor__meta">
              <Badge>{group(anchor.group)}</Badge>
              {anchor.meta ? <span>{anchor.meta}</span> : null}
              <PressureCounts followUps={item.followUpCount} pressure={item.pressureQuestionCount} questions={item.directQuestionCount} weak={item.weaknessCount} />
            </p>
          </div>
          <HeatBadge tone={item.heatTone} />
          <ButtonLink
            size="sm"
            to={routeConfig.resumeHeatmapAnchor.buildPath({ versionId, anchorType: item.anchorType, anchorId: anchorPathId(item) })}
            variant="ghost"
          >
            {copy("자세히", "Details")}
          </ButtonLink>
        </div>

        {anchor.body.length > 0 ? (
          <div className="heatmap-anchor__body">
            {anchor.body.map((block, index) => (
              <p key={index}>{block}</p>
            ))}
          </div>
        ) : null}

        {anchor.overlayTargets.length > 0 ? (
          <div aria-label={copy("질문을 받은 부분", "Parts that drew questions")} className="heatmap-targets" role="group">
            {anchor.overlayTargets.map((target) => {
              const isSelected = target.targetKey === selectedKey;
              return (
                <button
                  aria-expanded={isSelected}
                  className={`heatmap-target heatmap-target--${target.heatTone}`}
                  key={target.targetKey}
                  onClick={() => onSelect(isSelected ? null : target.targetKey)}
                  type="button"
                >
                  <span className="heatmap-target__type">{targetLabel(target.targetType)}</span>
                  <span className="heatmap-target__text">{target.textSnippet ?? target.fieldPath ?? target.targetKey}</span>
                  <span className="heatmap-target__count">{copy(`질문 ${target.questionCount}`, `${target.questionCount} q`)}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {selected ? (
          <div className="heatmap-anchor__questions">
            {selected.linkedQuestions.map((question) => (
              <LinkedQuestionRow key={question.id} question={question} />
            ))}
          </div>
        ) : null}
      </Card>
    </li>
  );
}

/** 면접 압박 지도: resume claims ranked by how hard real interviews pushed on them. */
export function ResumeHeatmapPage() {
  const { copy, target: targetLabel } = useHeatmapCopy();
  const { versionId = "" } = useParams<{ versionId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readFiltersFromSearchParams(searchParams), [searchParams]);
  const selectedAnchorId = searchParams.get("selectedAnchor");
  const selectedTargetKey = searchParams.get("selectedTargetKey");
  const snapshotsQuery = useResumeVersionSnapshotsQuery(versionId);
  const heatmapQuery = useResumeQuestionHeatmapQuery(versionId, filters);
  const overlayTargetsQuery = useResumeQuestionHeatmapOverlayTargetsQuery(versionId, filters);
  const anchors = useMemo(
    () => (heatmapQuery.data ? buildHeatmapAnchors(heatmapQuery.data, overlayTargetsQuery.data?.items ?? [], snapshotsQuery.data) : []),
    [heatmapQuery.data, overlayTargetsQuery.data, snapshotsQuery.data],
  );

  function updateFilters(next: ResumeQuestionHeatmapFiltersDto) {
    const params = writeFiltersToSearchParams(searchParams, next);
    params.delete("selectedAnchor");
    params.delete("selectedTargetKey");
    setSearchParams(params, { replace: true });
  }

  function selectTarget(anchorId: string, targetKey: string | null) {
    const params = new URLSearchParams(searchParams);
    if (targetKey) {
      params.set("selectedAnchor", anchorId);
      params.set("selectedTargetKey", targetKey);
    } else {
      params.delete("selectedAnchor");
      params.delete("selectedTargetKey");
    }
    setSearchParams(params, { replace: true });
  }

  if (heatmapQuery.isLoading || overlayTargetsQuery.isLoading || snapshotsQuery.isLoading) {
    return <PageSkeleton label={copy("압박 지도를 불러오는 중", "Loading the pressure map")} />;
  }

  if (heatmapQuery.isError || overlayTargetsQuery.isError || !heatmapQuery.data) {
    const error = heatmapQuery.error ?? overlayTargetsQuery.error;
    return (
      <ErrorState
        actions={
          <Button onClick={() => void Promise.all([heatmapQuery.refetch(), overlayTargetsQuery.refetch()])} variant="primary">
            {copy("다시 시도", "Try again")}
          </Button>
        }
        body={userFacingErrorMessage(error, copy("압박 지도를 불러오지 못했어요.", "The pressure map could not be loaded."))}
        details={getErrorDetails(error)}
        title={copy("압박 지도를 불러올 수 없어요", "Unable to load the pressure map")}
      />
    );
  }

  const { filterSummary } = heatmapQuery.data;
  const hasAnyQuestions = filterSummary.totalQuestions > 0;
  const isFiltered = Boolean(filters.weakOnly || filters.companyName || filters.interviewDateFrom || filters.interviewDateTo || filters.targetType || filters.scope !== "all");

  if (!hasAnyQuestions && !isFiltered) {
    return (
      <EmptyState
        actions={
          <ButtonLink to={routeConfig.practicalInterviewUpload.buildPath()} variant="primary">
            {copy("실전 면접 올리기", "Upload a real interview")}
          </ButtonLink>
        }
        body={copy(
          "실전 면접을 올리면 받은 질문을 이력서 문장에 연결해, 어떤 주장이 가장 많이 공격받는지 보여줘요.",
          "Upload a real interview and we map each question back to the resume line it targeted, so you see which claims drew the most fire.",
        )}
        icon="interview"
        title={copy("아직 연결된 면접 질문이 없어요", "No interview questions mapped yet")}
      />
    );
  }

  return (
    <div className="heatmap">
      <div aria-label={copy("요약", "Summary")} className="heatmap-stats" role="group">
        <Stat label={copy("질문받은 주장", "Claims questioned")} value={heatmapQuery.data.summary.totalAnchors} />
        <Stat label={copy("연결된 질문", "Linked questions")} value={filterSummary.totalQuestions} />
        <Stat label={copy("꼬리질문", "Follow-ups")} value={filterSummary.followUpQuestionCount} />
        <Stat label={copy("약한 답변", "Weak answers")} tone={filterSummary.weakQuestionCount > 0 ? "danger" : "neutral"} value={filterSummary.weakQuestionCount} />
      </div>

      <div aria-label={copy("필터", "Filters")} className="heatmap-filters" role="group">
        <Segmented
          items={[
            { id: "all", label: copy("전체", "All") },
            { id: "main", label: copy("메인 질문", "Main questions") },
            { id: "follow_up", label: copy("꼬리질문", "Follow-ups") },
          ]}
          label={copy("질문 범위", "Question scope")}
          onChange={(scope: ResumeQuestionHeatmapScopeDto) => updateFilters({ ...filters, scope })}
          value={filters.scope ?? "all"}
        />
        <Button aria-pressed={Boolean(filters.weakOnly)} onClick={() => updateFilters({ ...filters, weakOnly: !filters.weakOnly })} size="sm" variant={filters.weakOnly ? "primary" : "secondary"}>
          {copy("약한 답변만", "Weak answers only")}
        </Button>
        {filterSummary.companyNames.length > 0 ? (
          <Select aria-label={copy("회사", "Company")} onChange={(event) => updateFilters({ ...filters, companyName: event.target.value })} value={filters.companyName ?? ""}>
            <option value="">{copy("모든 회사", "All companies")}</option>
            {filterSummary.companyNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        ) : null}
        {filterSummary.availableTargetTypes.length > 1 ? (
          <Select
            aria-label={copy("하이라이트 단위", "Highlight unit")}
            onChange={(event) => updateFilters({ ...filters, targetType: (event.target.value || undefined) as ResumeQuestionHeatmapFiltersDto["targetType"] })}
            value={filters.targetType ?? ""}
          >
            <option value="">{copy("모든 단위", "All units")}</option>
            {filterSummary.availableTargetTypes.map((type) => (
              <option key={type} value={type}>
                {`${targetLabel(type)} (${filterSummary.targetTypeCounts[type] ?? 0})`}
              </option>
            ))}
          </Select>
        ) : null}
        <span className="heatmap-filters__dates">
          <Input aria-label={copy("면접일 시작", "Interviews from")} onChange={(event) => updateFilters({ ...filters, interviewDateFrom: event.target.value })} type="date" value={filters.interviewDateFrom ?? ""} />
          <span aria-hidden="true">–</span>
          <Input aria-label={copy("면접일 끝", "Interviews to")} onChange={(event) => updateFilters({ ...filters, interviewDateTo: event.target.value })} type="date" value={filters.interviewDateTo ?? ""} />
        </span>
      </div>

      {anchors.length === 0 ? (
        <EmptyState
          actions={
            <Button onClick={() => updateFilters({ scope: "all" })} variant="primary">
              {copy("필터 초기화", "Clear filters")}
            </Button>
          }
          body={copy("조건을 넓혀 보세요.", "Try widening the filters.")}
          icon="search"
          title={copy("조건에 맞는 주장이 없어요", "No claims match these filters")}
        />
      ) : (
        <ol aria-label={copy("압박을 많이 받은 순서", "Most pressured first")} className="heatmap-anchors">
          {anchors.map((anchor, index) => (
            <AnchorCard
              anchor={anchor}
              key={anchor.item.id}
              onSelect={(targetKey) => selectTarget(anchor.item.id, targetKey)}
              rank={index + 1}
              selectedKey={selectedAnchorId === anchor.item.id ? selectedTargetKey : null}
              versionId={versionId}
            />
          ))}
        </ol>
      )}
    </div>
  );
}
