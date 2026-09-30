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
import { HeatBadge, LinkedQuestionRow, PressureCounts, useHeatmapLabels } from "./heatmapParts";
import { anchorPathId, buildHeatmapAnchors, readFiltersFromSearchParams, writeFiltersToSearchParams, type HeatmapAnchor } from "./heatmapUtils";
import "./heatmap.css";

function AnchorCard({ anchor, rank, versionId, selectedKey, onSelect }: {
  anchor: HeatmapAnchor;
  rank: number;
  versionId: string;
  selectedKey: string | null;
  onSelect: (targetKey: string | null) => void;
}) {
  const { t, group, target: targetLabel } = useHeatmapLabels();
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
            {t("resumeHeatmap.details")}
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
          <div aria-label={t("resumeHeatmap.partsThatDrewQuestions")} className="heatmap-targets" role="group">
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
                  <span className="heatmap-target__count">{t("resumeHeatmap.targetQuestionCount", { questionCount: target.questionCount })}</span>
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
  const { t, target: targetLabel } = useHeatmapLabels();
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
    return <PageSkeleton label={t("resumeHeatmap.loadingThePressureMap")} />;
  }

  if (heatmapQuery.isError || overlayTargetsQuery.isError || !heatmapQuery.data) {
    const error = heatmapQuery.error ?? overlayTargetsQuery.error;
    return (
      <ErrorState
        actions={
          <Button onClick={() => void Promise.all([heatmapQuery.refetch(), overlayTargetsQuery.refetch()])} variant="primary">
            {t("resumeHeatmap.tryAgain")}
          </Button>
        }
        body={userFacingErrorMessage(error, t("resumeHeatmap.thePressureMapCouldNot"))}
        details={getErrorDetails(error)}
        title={t("resumeHeatmap.unableToLoadThePressure")}
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
            {t("resumeHeatmap.uploadARealInterview")}
          </ButtonLink>
        }
        body={t("resumeHeatmap.uploadARealInterviewAnd")}
        icon="interview"
        title={t("resumeHeatmap.noInterviewQuestionsMappedYet")}
      />
    );
  }

  return (
    <div className="heatmap">
      <div aria-label={t("resumeHeatmap.summary")} className="heatmap-stats" role="group">
        <Stat label={t("resumeHeatmap.claimsQuestioned")} value={heatmapQuery.data.summary.totalAnchors} />
        <Stat label={t("resumeHeatmap.linkedQuestions")} value={filterSummary.totalQuestions} />
        <Stat label={t("resumeHeatmap.followUps")} value={filterSummary.followUpQuestionCount} />
        <Stat label={t("resumeHeatmap.weakAnswers")} tone={filterSummary.weakQuestionCount > 0 ? "danger" : "neutral"} value={filterSummary.weakQuestionCount} />
      </div>

      <div aria-label={t("resumeHeatmap.filters")} className="heatmap-filters" role="group">
        <Segmented
          items={[
            { id: "all", label: t("resumeHeatmap.all") },
            { id: "main", label: t("resumeHeatmap.mainQuestions") },
            { id: "follow_up", label: t("resumeHeatmap.followUps") },
          ]}
          label={t("resumeHeatmap.questionScope")}
          onChange={(scope: ResumeQuestionHeatmapScopeDto) => updateFilters({ ...filters, scope })}
          value={filters.scope ?? "all"}
        />
        <Button aria-pressed={Boolean(filters.weakOnly)} onClick={() => updateFilters({ ...filters, weakOnly: !filters.weakOnly })} size="sm" variant={filters.weakOnly ? "primary" : "secondary"}>
          {t("resumeHeatmap.weakAnswersOnly")}
        </Button>
        {filterSummary.companyNames.length > 0 ? (
          <Select aria-label={t("resumeHeatmap.company")} onChange={(event) => updateFilters({ ...filters, companyName: event.target.value })} value={filters.companyName ?? ""}>
            <option value="">{t("resumeHeatmap.allCompanies")}</option>
            {filterSummary.companyNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        ) : null}
        {filterSummary.availableTargetTypes.length > 1 ? (
          <Select
            aria-label={t("resumeHeatmap.highlightUnit")}
            onChange={(event) => updateFilters({ ...filters, targetType: (event.target.value || undefined) as ResumeQuestionHeatmapFiltersDto["targetType"] })}
            value={filters.targetType ?? ""}
          >
            <option value="">{t("resumeHeatmap.allUnits")}</option>
            {filterSummary.availableTargetTypes.map((type) => (
              <option key={type} value={type}>
                {`${targetLabel(type)} (${filterSummary.targetTypeCounts[type] ?? 0})`}
              </option>
            ))}
          </Select>
        ) : null}
        <span className="heatmap-filters__dates">
          <Input aria-label={t("resumeHeatmap.interviewsFrom")} onChange={(event) => updateFilters({ ...filters, interviewDateFrom: event.target.value })} type="date" value={filters.interviewDateFrom ?? ""} />
          <span aria-hidden="true">–</span>
          <Input aria-label={t("resumeHeatmap.interviewsTo")} onChange={(event) => updateFilters({ ...filters, interviewDateTo: event.target.value })} type="date" value={filters.interviewDateTo ?? ""} />
        </span>
      </div>

      {anchors.length === 0 ? (
        <EmptyState
          actions={
            <Button onClick={() => updateFilters({ scope: "all" })} variant="primary">
              {t("resumeHeatmap.clearFilters")}
            </Button>
          }
          body={t("resumeHeatmap.tryWideningTheFilters")}
          icon="search"
          title={t("resumeHeatmap.noClaimsMatchTheseFilters")}
        />
      ) : (
        <ol aria-label={t("resumeHeatmap.mostPressuredFirst")} className="heatmap-anchors">
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
