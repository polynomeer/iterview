import { type CSSProperties, useState } from "react";
import { Link } from "react-router-dom";
import { mapHomeResponseDtoToModel } from "../../entities/home/model";
import { skillCategoryLabel } from "../../shared/lib/labels";
import type { SkillGapModel, SkillProgressModel, SkillRadarModel } from "../../entities/skill-intelligence/model";
import { useSkillGapQuery } from "../../features/skills/api/useSkillGapQuery";
import { useSkillProgressQuery } from "../../features/skills/api/useSkillProgressQuery";
import { useSkillRadarQuery } from "../../features/skills/api/useSkillRadarQuery";
import { ApiClientError, getErrorDetails, userFacingErrorMessage } from "../../shared/api/errors";
import { getHomeRequest } from "../../shared/api/homeApi";
import { queryKeys } from "../../shared/api/queryKeys";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { MetricCard } from "../../shared/ui/MetricCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { useQuery } from "@tanstack/react-query";

const SKILL_NODE_TONES = ["core", "positive", "positive", "positive", "warning", "danger", "warning"] as const;
const SKILL_NODE_POSITIONS = [
  { top: "4%", left: "36%" },
  { top: "18%", left: "12%" },
  { top: "18%", left: "63%" },
  { top: "47%", left: "8%" },
  { top: "47%", left: "65%" },
  { top: "69%", left: "29%" },
  { top: "69%", left: "54%" },
] as const;
const SKILL_GRAPH_CONNECTIONS = [
  [0, 1],
  [0, 2],
  [1, 3],
  [1, 4],
  [2, 4],
  [2, 5],
  [3, 6],
  [4, 6],
] as const;
const GRAPH_VIEW_MODES = [
  { key: "map", koLabel: "맵 뷰", enLabel: "Map View" },
  { key: "dfs", koLabel: "DFS Focus", enLabel: "DFS Focus" },
  { key: "all", koLabel: "전체 경로", enLabel: "All paths" },
] as const;
const DETAIL_TABS = [
  { key: "overview", koLabel: "개요", enLabel: "Overview" },
  { key: "resume", koLabel: "이력서 연결", enLabel: "Resume links" },
  { key: "questions", koLabel: "관련 질문", enLabel: "Related questions" },
] as const;
const GRAPH_ZOOM_STEPS = {
  min: 0.85,
  max: 1.28,
  step: 0.12,
  fit: 1,
} as const;
type GraphViewMode = (typeof GRAPH_VIEW_MODES)[number]["key"];
type DetailTab = (typeof DETAIL_TABS)[number]["key"];
type GraphFilterMode = "all" | "weakOnly";

function percentFromStyle(value: string) {
  return Number.parseFloat(value) || 0;
}

function parseNumberLabel(value: string | undefined) {
  return Number.parseInt(value ?? "0", 10) || 0;
}

function scoreToStatus(score: number, isKorean: boolean) {
  if (score >= 80) {
    return isKorean ? "상" : "High";
  }

  if (score >= 65) {
    return isKorean ? "중" : "Medium";
  }

  return isKorean ? "하" : "Low";
}

function scoreToTone(score: number) {
  if (score >= 80) {
    return "positive";
  }

  if (score >= 65) {
    return "warning";
  }

  return "danger";
}

function buildSkillQuestionRecommendations(
  radar: SkillRadarModel | undefined,
  progress: SkillProgressModel | undefined,
  gap: SkillGapModel | undefined,
  isKorean: boolean,
) {
  const progressMap = new Map((progress?.items ?? []).map((item) => [item.label, item]));
  const gapMap = new Map((gap?.items ?? []).map((item) => [item.label, item]));

  return (radar?.categories ?? []).slice(0, 5).map((category, index) => {
    const progressItem = progressMap.get(category.label);
    const gapItem = gapMap.get(category.label);
    const score = category.score;
    const weakCount = parseNumberLabel(progressItem?.weakQuestionCountLabel);
    const answeredCount = parseNumberLabel(progressItem?.answeredQuestionCountLabel);
    const gapScore = parseNumberLabel(gapItem?.gapScoreLabel ?? category.helperText?.replace(/\D/g, ""));

    return {
      id: `${category.id}-question`,
      order: index + 1,
      title: isKorean
        ? `${category.label}를 이력서 근거와 트레이드오프까지 방어할 수 있나요?`
        : `Can you defend ${category.label} with resume evidence and trade-offs?`,
      score,
      scoreLabel: `${score}`,
      tone: scoreToTone(score),
      helper: isKorean
        ? `약한 꼬리질문 ${weakCount}개 · 답변 ${answeredCount}개 · 격차 ${gapScore}`
        : `${weakCount} weak follow-ups · ${answeredCount} answers · gap ${gapScore}`,
    };
  });
}

export function SkillsPage() {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const [selectedSkillLabel, setSelectedSkillLabel] = useState<string | null>(null);
  const [graphViewMode, setGraphViewMode] = useState<GraphViewMode>("dfs");
  const [detailTab, setDetailTab] = useState<DetailTab>("overview");
  const [graphZoom, setGraphZoom] = useState<number>(GRAPH_ZOOM_STEPS.fit);
  const [graphFilterMode, setGraphFilterMode] = useState<GraphFilterMode>("all");
  const radarQuery = useSkillRadarQuery();
  const gapQuery = useSkillGapQuery();
  const progressQuery = useSkillProgressQuery();
  const homeFallbackQuery = useQuery({
    queryKey: [...queryKeys.skills.root, "home-fallback"],
    queryFn: async ({ signal }) => mapHomeResponseDtoToModel(await getHomeRequest(signal)),
  });
  const radarUnsupported = radarQuery.error instanceof ApiClientError && radarQuery.error.status === 404;
  const gapUnsupported = gapQuery.error instanceof ApiClientError && gapQuery.error.status === 404;
  const fallbackRadarItems = (homeFallbackQuery.data?.skillReadiness ?? []).map((item) => ({
    id: item.code,
    label: skillCategoryLabel(item.code, locale) ?? item.code,
    scoreLabel: item.score === null ? "-" : String(item.score),
  }));
  const fallbackGapItems = (homeFallbackQuery.data?.weakSkills ?? []).map((item, index) => ({
    id: item.code ?? `gap-${index}`,
    label: item.label,
    gapScoreLabel: item.gapScore === null ? "-" : String(item.gapScore),
    helperText: skillCategoryLabel(item.code, locale) ?? undefined,
  }));
  const radarCategoryCount = radarQuery.data?.categories.length ?? 0;
  const trackedProgressCount = progressQuery.data?.items.length ?? 0;
  const weakestProgressItem =
    progressQuery.data?.items.reduce((weakest, item) => {
      if (!weakest) {
        return item;
      }

      return parseNumberLabel(item.weakQuestionCountLabel) > parseNumberLabel(weakest.weakQuestionCountLabel) ? item : weakest;
    }, progressQuery.data.items[0]) ?? null;
  const totalAnsweredQuestions =
    progressQuery.data?.items.reduce((sum, item) => sum + parseNumberLabel(item.answeredQuestionCountLabel), 0) ?? 0;
  const totalWeakQuestions =
    progressQuery.data?.items.reduce((sum, item) => sum + parseNumberLabel(item.weakQuestionCountLabel), 0) ?? 0;
  const defaultFocusSkill =
    weakestProgressItem
      ? {
          label: weakestProgressItem.label,
          score: parseNumberLabel(weakestProgressItem.scoreLabel),
          benchmarkLabel: weakestProgressItem.benchmarkLabel,
          weakQuestionCountLabel: weakestProgressItem.weakQuestionCountLabel,
          answeredQuestionCountLabel: weakestProgressItem.answeredQuestionCountLabel,
          gapLabel: weakestProgressItem.gapLabel,
        }
      : radarQuery.data?.categories[0]
        ? {
            label: radarQuery.data.categories[0].label,
            score: radarQuery.data.categories[0].score,
            benchmarkLabel: radarQuery.data.categories[0].benchmarkLabel,
            weakQuestionCountLabel: "0",
            answeredQuestionCountLabel: "0",
            gapLabel: radarQuery.data.categories[0].helperText,
          }
        : null;
  const focusSkill =
    selectedSkillLabel && radarQuery.data?.categories.find((category) => category.label === selectedSkillLabel)
      ? (() => {
          const category = radarQuery.data.categories.find((item) => item.label === selectedSkillLabel)!;
          const progressItem = progressQuery.data?.items.find((item) => item.label === category.label);
          return {
            label: category.label,
            score: category.score,
            benchmarkLabel: category.benchmarkLabel,
            weakQuestionCountLabel: progressItem?.weakQuestionCountLabel ?? "0",
            answeredQuestionCountLabel: progressItem?.answeredQuestionCountLabel ?? "0",
            gapLabel: progressItem?.gapLabel ?? category.helperText,
          };
        })()
      : defaultFocusSkill;
  const radarNodes = (radarQuery.data?.categories ?? []).slice(0, 7).map((category, index) => ({
    ...category,
    tone: SKILL_NODE_TONES[index] ?? "warning",
    position: SKILL_NODE_POSITIONS[index] ?? { top: "50%", left: "50%" },
  }));
  const graphModeNodes = (graphViewMode === "all" ? radarNodes : radarNodes.filter((item) => item.score < 78)).filter((item) => {
    if (graphFilterMode === "all") {
      return true;
    }

    return item.score < 78 || item.label === focusSkill?.label;
  });
  const visibleGraphNodes = graphModeNodes.length > 0 ? graphModeNodes.slice(0, graphViewMode === "all" ? 7 : 6) : radarNodes.slice(0, 1);
  const visibleGraphNodeLabels = new Set(visibleGraphNodes.map((node) => node.label));
  const graphLinks = SKILL_GRAPH_CONNECTIONS.filter(([sourceIndex, targetIndex]) => {
    const sourceNode = radarNodes[sourceIndex];
    const targetNode = radarNodes[targetIndex];
    return Boolean(sourceNode && targetNode && visibleGraphNodeLabels.has(sourceNode.label) && visibleGraphNodeLabels.has(targetNode.label));
  })
    .map(([sourceIndex, targetIndex], index) => {
      const source = radarNodes[sourceIndex]!;
      const target = radarNodes[targetIndex]!;
      return {
        key: `${source.id}-${target.id}-${index}`,
        source,
        target,
      };
    });
  const filterLabel = graphFilterMode === "all" ? (isKorean ? "전체" : "All") : (isKorean ? "약한 영역 우선" : "Weak first");
  const strengths = [...(radarQuery.data?.categories ?? [])].sort((left, right) => right.score - left.score).slice(0, 3);
  const weakAreas = [...(radarQuery.data?.categories ?? [])].sort((left, right) => left.score - right.score).slice(0, 3);
  const recentPractice = (progressQuery.data?.items ?? []).slice(0, 4);
  const nextRecommendations = [...(gapQuery.data?.items ?? [])]
    .sort((left, right) => parseNumberLabel(right.gapScoreLabel) - parseNumberLabel(left.gapScoreLabel))
    .slice(0, 3);
  const questionRecommendations = buildSkillQuestionRecommendations(radarQuery.data, progressQuery.data, gapQuery.data, isKorean);
  const zoomStyle = {
    "--skills-landscape-zoom": `${graphZoom}`,
  } as CSSProperties;

  const showZoomOut = graphZoom > GRAPH_ZOOM_STEPS.min;
  const showZoomIn = graphZoom < GRAPH_ZOOM_STEPS.max;

  const handleZoomIn = () => setGraphZoom((value) => Math.min(GRAPH_ZOOM_STEPS.max, Number((value + GRAPH_ZOOM_STEPS.step).toFixed(2))));
  const handleZoomOut = () => setGraphZoom((value) => Math.max(GRAPH_ZOOM_STEPS.min, Number((value - GRAPH_ZOOM_STEPS.step).toFixed(2))));
  const handleZoomFit = () => setGraphZoom(GRAPH_ZOOM_STEPS.fit);

  return (
    <PageContainer
      description={
        isKorean
          ? "스킬 페이지는 이력서 기반 DFS 면접 루프에서 다음에 어디를 더 깊게 파고들지 고르는 보조 작업공간입니다."
          : "The skills page is a support workspace for choosing which resume-backed DFS interview branch to go deeper on next."
      }
      eyebrow={isKorean ? "보조 작업공간" : "Support workspace"}
      title={isKorean ? "스킬 지형을 질문 트리 실행 계획으로 바꾸세요" : "Turn the skill landscape into the next question-tree plan"}
    >
      {radarQuery.isLoading || gapQuery.isLoading || progressQuery.isLoading ? (
        <LoadingStateCard
          body={
            isKorean
              ? "현재 인터뷰 프로필의 스킬 지형과 격차 신호를 불러오는 중입니다."
              : "Loading the skill landscape and gap signals for your current interview profile."
          }
          title={isKorean ? "스킬 작업공간 준비 중" : "Preparing skill workspace"}
        />
      ) : null}

      {radarQuery.isError && !radarUnsupported ? (
        <ErrorStateCard
          body={userFacingErrorMessage(radarQuery.error, isKorean ? "스킬 레이더를 불러오지 못했습니다." : "The skill radar could not be loaded.")}
          details={getErrorDetails(radarQuery.error)}
          onAction={() => {
            void radarQuery.refetch();
          }}
          title={isKorean ? "스킬 레이더를 불러올 수 없습니다" : "Unable to load skill radar"}
        />
      ) : null}

      {gapQuery.isError && !gapUnsupported ? (
        <ErrorStateCard
          body={userFacingErrorMessage(gapQuery.error, isKorean ? "격차 분석을 불러오지 못했습니다." : "The gap analysis could not be loaded.")}
          details={getErrorDetails(gapQuery.error)}
          onAction={() => {
            void gapQuery.refetch();
          }}
          title={isKorean ? "격차 분석을 불러올 수 없습니다" : "Unable to load gap analysis"}
        />
      ) : null}

      {progressQuery.isError ? (
        <ErrorStateCard
          body={userFacingErrorMessage(progressQuery.error, isKorean ? "스킬 진행 스냅샷을 불러오지 못했습니다." : "The skill progress snapshot could not be loaded.")}
          details={getErrorDetails(progressQuery.error)}
          onAction={() => {
            void progressQuery.refetch();
          }}
          title={isKorean ? "스킬 진행 상황을 불러올 수 없습니다" : "Unable to load skill progress"}
        />
      ) : null}

      {!radarQuery.isLoading &&
      !gapQuery.isLoading &&
      !progressQuery.isLoading &&
      ((radarQuery.data && radarQuery.data.categories.length > 0) ||
        (gapQuery.data && gapQuery.data.items.length > 0) ||
        (progressQuery.data && progressQuery.data.items.length > 0)) ? (
        <div className="page-stack skills-landscape">
          <section className="skills-landscape__shell">
            <header className="skills-landscape__header">
              <div className="skills-landscape__title-block">
                <p className="skills-landscape__kicker">{isKorean ? "스킬 랜드스케이프" : "Skill landscape"}</p>
                <h2 className="skills-landscape__title">
                  {isKorean ? "이력서 근거를 방어할 스킬 지형을 한 화면에서 정리하세요" : "Organize the skill terrain that has to defend your resume in one screen"}
                </h2>
                <p className="skills-landscape__body">
                  {isKorean
                    ? "강점, 약점, 최근 연습, 다음 추천을 따로 보지 말고 중앙 지형에서 하나의 방어 시나리오로 묶어야 합니다."
                    : "Do not read strengths, weaknesses, recent practice, and recommendations separately. Tie them into one defense scenario from the central landscape."}
                </p>
              </div>
              <div className="skills-landscape__toolbar">
                <div className="skills-landscape__tabs" role="tablist" aria-label={isKorean ? "스킬 보기 방식" : "Skill views"}>
                  {GRAPH_VIEW_MODES.map((mode) => (
                    <button
                      aria-selected={graphViewMode === mode.key}
                      className={`skills-landscape__tab ${graphViewMode === mode.key ? "skills-landscape__tab--active" : ""}`}
                      key={mode.key}
                      onClick={() => setGraphViewMode(mode.key)}
                      role="tab"
                      type="button"
                    >
                      {isKorean ? mode.koLabel : mode.enLabel}
                    </button>
                  ))}
                </div>
                <div className="skills-landscape__toolbar-actions">
                  <button
                    aria-pressed={graphFilterMode === "weakOnly"}
                    className="skills-landscape__toolbar-chip"
                    onClick={() => {
                      setGraphFilterMode((value) => (value === "all" ? "weakOnly" : "all"));
                    }}
                    type="button"
                  >
                    <span>{isKorean ? "필터" : "Filter"}</span>
                    <strong>{filterLabel}</strong>
                  </button>
                  <Link className="secondary-button" to={routeConfig.resume.buildPath()}>
                    {isKorean ? "이력서 근거 보기" : "View resume evidence"}
                  </Link>
                </div>
              </div>
            </header>

            <div className="skills-landscape__workspace">
              <section className="skills-landscape__canvas">
                <div className="skills-landscape__legend">
                  <p className="skills-landscape__panel-label">{isKorean ? "범례" : "Legend"}</p>
                  <ul className="skills-landscape__legend-list">
                    <li><span className="skills-landscape__dot skills-landscape__dot--positive" />{isKorean ? "강한 방어 가능" : "Strong defense"}</li>
                    <li><span className="skills-landscape__dot skills-landscape__dot--warning" />{isKorean ? "추가 보강 필요" : "Needs reinforcement"}</li>
                    <li><span className="skills-landscape__dot skills-landscape__dot--danger" />{isKorean ? "깊은 꼬리질문 주의" : "Deep follow-up risk"}</li>
                  </ul>
                  <div className="skills-landscape__legend-stats">
                    <article>
                      <span>{isKorean ? "레이더 카테고리" : "Radar categories"}</span>
                      <strong>{radarCategoryCount}</strong>
                    </article>
                    <article>
                      <span>{isKorean ? "추적 중 진행도" : "Tracked progress"}</span>
                      <strong>{trackedProgressCount}</strong>
                    </article>
                  </div>
                </div>

                <div className="skills-landscape__network">
                  <div className="skills-landscape__network-stage" style={zoomStyle}>
                    <div className="skills-landscape__grid" />
                    <div className="skills-landscape__orbits">
                      <span className="skills-landscape__orbit skills-landscape__orbit--outer" />
                      <span className="skills-landscape__orbit skills-landscape__orbit--middle" />
                    </div>
                      <svg aria-hidden="true" className="skills-landscape__network-connections" preserveAspectRatio="none" viewBox="0 0 100 100">
                      {graphLinks.map((link) => (
                        <line
                          className="skills-landscape__network-connections__line"
                          key={link.key}
                          x1={percentFromStyle(link.source.position.left)}
                          x2={percentFromStyle(link.target.position.left)}
                          y1={percentFromStyle(link.source.position.top)}
                          y2={percentFromStyle(link.target.position.top)}
                        />
                      ))}
                    </svg>
                    {visibleGraphNodes.map((node, index) => (
                      <button
                        aria-pressed={focusSkill?.label === node.label}
                        className={`skills-node skills-node--${node.tone} ${focusSkill?.label === node.label ? "skills-node--focus" : ""}`}
                        key={node.id}
                        onClick={() => {
                          setSelectedSkillLabel(node.label);
                          setDetailTab("overview");
                        }}
                        style={node.position}
                        type="button"
                      >
                        <div className="skills-node__icon" aria-hidden="true">
                          {node.label.slice(0, 1)}
                        </div>
                        <div className="skills-node__content">
                          <strong>{node.label}</strong>
                          <span>{isKorean ? `숙련도 ${node.scoreLabel}%` : `Mastery ${node.scoreLabel}%`}</span>
                        </div>
                        <div className="skills-node__score">{node.scoreLabel}</div>
                        {index === 0 ? <span className="skills-node__flag">{isKorean ? "핵심 강점" : "Core strength"}</span> : null}
                      </button>
                    ))}
                  </div>
                  <div className="skills-landscape__zoom">
                    <button
                      aria-label={isKorean ? "지도 확대" : "Zoom in"}
                      className="skills-landscape__zoom-button"
                      disabled={!showZoomIn}
                      onClick={handleZoomIn}
                      type="button"
                    >
                      +
                    </button>
                    <button
                      aria-label={isKorean ? "지도 축소" : "Zoom out"}
                      className="skills-landscape__zoom-button"
                      disabled={!showZoomOut}
                      onClick={handleZoomOut}
                      type="button"
                    >
                      -
                    </button>
                    <button
                      aria-label={isKorean ? "크기 맞춤" : "Fit view"}
                      className="skills-landscape__zoom-button"
                      onClick={handleZoomFit}
                      type="button"
                    >
                      {isKorean ? "맞춤" : "Fit"}
                    </button>
                    <span className="skills-landscape__zoom-label">{Math.round(graphZoom * 100)}%</span>
                  </div>
                </div>
              </section>

              <aside className="skills-landscape__detail-panel">
                <div className="skills-detail-card">
                  <div className="skills-detail-card__header">
                    <p className="skills-landscape__panel-label">{isKorean ? "스킬 상세" : "Skill details"}</p>
                    <h3>{focusSkill?.label ?? (isKorean ? "선택된 스킬 없음" : "No selected skill")}</h3>
                    <div
                      aria-label={isKorean ? "상세 탭" : "Detail tabs"}
                      className="skills-detail-card__tabs"
                      role="tablist"
                    >
                      {DETAIL_TABS.map((tab) => (
                        <button
                          aria-selected={detailTab === tab.key}
                          className={`skills-detail-card__tab ${detailTab === tab.key ? "skills-detail-card__tab--active" : ""}`}
                          key={tab.key}
                          onClick={() => {
                            setDetailTab(tab.key);
                          }}
                          role="tab"
                          type="button"
                        >
                          {isKorean ? tab.koLabel : tab.enLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                  {focusSkill ? (
                    <>
                      {detailTab === "overview" ? (
                        <>
                          <div className="skills-detail-card__badges">
                            <span className="detail-chip detail-chip--accent">{isKorean ? "이력서 기반" : "Resume-backed"}</span>
                            <span className="detail-chip">{focusSkill.score >= 75 ? (isKorean ? "방어 가능" : "Defendable") : isKorean ? "보강 필요" : "Needs work"}</span>
                            {focusSkill.gapLabel ? <span className="detail-chip">{focusSkill.gapLabel}</span> : null}
                          </div>

                          <div className="skills-detail-card__metric">
                            <div className="skills-detail-card__metric-row">
                              <span>{isKorean ? "숙련도" : "Mastery"}</span>
                              <strong>{focusSkill.score}%</strong>
                            </div>
                            <div className="skills-detail-card__bar">
                              <span style={{ width: `${Math.max(12, focusSkill.score)}%` }} />
                            </div>
                            <p>
                              {isKorean
                                ? `${scoreToStatus(focusSkill.score, isKorean)} 수준 방어 가능성입니다. 꼬리질문이 원자단위까지 내려가도 설명이 이어지는지 확인해야 합니다.`
                                : `${scoreToStatus(focusSkill.score, isKorean)} readiness. Verify that the explanation still holds when follow-ups drill down to atomic detail.`}
                            </p>
                          </div>

                          <div className="skills-detail-card__summary-grid">
                            <article>
                              <span>{isKorean ? "답변 수" : "Answered"}</span>
                              <strong>{focusSkill.answeredQuestionCountLabel}</strong>
                            </article>
                            <article>
                              <span>{isKorean ? "약한 질문" : "Weak questions"}</span>
                              <strong>{focusSkill.weakQuestionCountLabel}</strong>
                            </article>
                            <article>
                              <span>{isKorean ? "벤치마크" : "Benchmark"}</span>
                              <strong>{focusSkill.benchmarkLabel ?? "-"}</strong>
                            </article>
                          </div>
                        </>
                      ) : null}
                      {detailTab === "resume" ? (
                        <div className="skills-detail-card__experience">
                          <strong>{isKorean ? "현재 DFS 기준점" : "Current DFS anchor"}</strong>
                          <p>
                            {isKorean
                              ? `${focusSkill?.label ?? "이 스킬"}은 실제 경험 문장과 연결해서 방어해야 합니다. 숫자, 선택 이유, 트레이드오프, 실패 복구까지 같은 흐름으로 준비하세요.`
                              : `${focusSkill?.label ?? "This skill"} should be defended through concrete experience statements. Prepare numbers, choice rationale, trade-offs, and failure recovery in one flow.`}
                          </p>
                          <div className="skills-detail-card__summary-grid">
                            <article>
                              <span>{isKorean ? "연결 레벨" : "Linked evidence"}</span>
                              <strong>{focusSkill.benchmarkLabel ?? (isKorean ? "미확정" : "TBD")}</strong>
                            </article>
                            <article>
                              <span>{isKorean ? "우선순위" : "Priority"}</span>
                              <strong>{focusSkill.gapLabel ?? (isKorean ? "보강 대상" : "Needs reinforcement")}</strong>
                            </article>
                            <article>
                              <span>{isKorean ? "복구 상태" : "Remediation state"}</span>
                              <strong>{focusSkill.score >= 75 ? (isKorean ? "안정" : "Stable") : isKorean ? "취약" : "Weak"}</strong>
                            </article>
                          </div>
                          <Link className="tertiary-link" to={routeConfig.resume.buildPath()}>
                            {isKorean ? "이력서 문장 확인하기" : "Inspect resume statements"}
                          </Link>
                        </div>
                      ) : null}
                      {detailTab === "questions" ? (
                        <div className="skills-detail-card__questions">
                          <div className="skills-question-list">
                            {questionRecommendations.map((item) => (
                              <article className="skills-question-list__item" key={item.id}>
                                <span className="skills-question-list__order">{item.order}</span>
                                <div className="skills-question-list__body">
                                  <strong>{item.title}</strong>
                                  <span>{item.helper}</span>
                                </div>
                                <span className={`skills-question-list__score skills-question-list__score--${item.tone}`}>{item.scoreLabel}</span>
                              </article>
                            ))}
                          </div>
                          <Link className="primary-button" to={routeConfig.practice.buildPath()}>
                            {isKorean ? "이 스킬로 연습 시작" : "Practice this skill"}
                          </Link>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <p className="page-card__body">
                      {isKorean ? "상세를 열 수 있는 스킬 데이터가 아직 없습니다." : "No skill data is available yet for the detail view."}
                    </p>
                  )}
                </div>
              </aside>
            </div>

            <section className="skills-landscape__summary-grid">
              <article className="skills-summary-card">
                <div className="skills-summary-card__header">
                  <p className="skills-landscape__panel-label">{isKorean ? "강점" : "Strengths"}</p>
                  <span>{strengths.length}</span>
                </div>
                <div className="skills-summary-card__list">
                  {strengths.map((item) => (
                    <div className="skills-summary-card__row" key={item.id}>
                      <strong>{item.label}</strong>
                      <span className="skills-summary-card__pill skills-summary-card__pill--positive">{item.scoreLabel}</span>
                    </div>
                  ))}
                </div>
                <Link className="tertiary-link" to={routeConfig.skills.buildPath()}>
                  {isKorean ? "강점 정리 보기" : "View strength breakdown"}
                </Link>
              </article>

              <article className="skills-summary-card">
                <div className="skills-summary-card__header">
                  <p className="skills-landscape__panel-label">{isKorean ? "약한 영역" : "Weak areas"}</p>
                  <span>{weakAreas.length}</span>
                </div>
                <div className="skills-summary-card__list">
                  {weakAreas.map((item) => (
                    <div className="skills-summary-card__row" key={item.id}>
                      <strong>{item.label}</strong>
                      <span className="skills-summary-card__pill skills-summary-card__pill--danger">{item.scoreLabel}</span>
                    </div>
                  ))}
                </div>
                <Link className="tertiary-link" to={routeConfig.reviewQueue.buildPath()}>
                  {isKorean ? "약한 가지 복구하기" : "Recover weak branches"}
                </Link>
              </article>

              <article className="skills-summary-card">
                <div className="skills-summary-card__header">
                  <p className="skills-landscape__panel-label">{isKorean ? "최근 연습" : "Recently practiced"}</p>
                  <span>{recentPractice.length}</span>
                </div>
                <div className="skills-summary-card__list">
                  {recentPractice.map((item) => (
                    <div className="skills-summary-card__row skills-summary-card__row--meta" key={item.id}>
                      <strong>{item.label}</strong>
                      <span>
                        {isKorean
                          ? `답변 ${item.answeredQuestionCountLabel}개 · 약한 질문 ${item.weakQuestionCountLabel}개`
                          : `${item.answeredQuestionCountLabel} answers · ${item.weakQuestionCountLabel} weak`}
                      </span>
                    </div>
                  ))}
                </div>
                <Link className="tertiary-link" to={routeConfig.archive.buildPath()}>
                  {isKorean ? "연습 기록 보기" : "View practice history"}
                </Link>
              </article>

              <article className="skills-summary-card skills-summary-card--accent">
                <div className="skills-summary-card__header">
                  <p className="skills-landscape__panel-label">{isKorean ? "다음 추천" : "Recommended next"}</p>
                  <span>{nextRecommendations.length}</span>
                </div>
                <div className="skills-summary-card__list">
                  {nextRecommendations.map((item) => (
                    <div className="skills-summary-card__row" key={item.id}>
                      <strong>{item.label}</strong>
                      <span className="skills-summary-card__pill skills-summary-card__pill--warning">{item.gapScoreLabel}</span>
                    </div>
                  ))}
                </div>
                <div className="skills-summary-card__footer">
                  <p>
                    {isKorean
                      ? `총 답변 ${totalAnsweredQuestions}개, 약한 질문 ${totalWeakQuestions}개를 기준으로 다음 DFS 방어 순서를 좁힙니다.`
                      : `Narrow the next DFS defense order from ${totalAnsweredQuestions} answers and ${totalWeakQuestions} weak questions.`}
                  </p>
                  <Link className="tertiary-link" to={routeConfig.practice.buildPath()}>
                    {isKorean ? "권장 시퀀스로 연습" : "Practice recommended sequence"}
                  </Link>
                </div>
              </article>
            </section>
          </section>
        </div>
      ) : null}

      {!radarQuery.isLoading &&
      !gapQuery.isLoading &&
      radarUnsupported &&
      gapUnsupported &&
      (fallbackRadarItems.length > 0 || fallbackGapItems.length > 0) ? (
        <div className="page-stack">
          <section className="page-card">
            <span className="page-card__label">{isKorean ? "대체 미리보기" : "Preview fallback"}</span>
            <h2 className="page-card__title">{isKorean ? "전용 스킬 엔드포인트가 아직 없습니다" : "Dedicated skill endpoints are not available yet"}</h2>
            <p className="page-card__body">
              {isKorean
                ? "준비도와 격차 방향은 볼 수 있도록 더 가벼운 홈 미리보기를 대신 보여줍니다."
                : "Showing the lighter-weight home preview instead so you can still see readiness and gap direction."}
            </p>
          </section>
          <section className="page-card">
            <div className="section-heading">
              <div>
                <p className="section-heading__eyebrow">{isKorean ? "홈 미리보기" : "Home preview"}</p>
                <h2 className="page-card__title">{isKorean ? "스킬 레이더 미리보기" : "Skill radar preview"}</h2>
              </div>
            </div>
            <div className="stats-grid">
              {fallbackRadarItems.map((item) => (
                <MetricCard key={item.id} label={item.label} tone="accent" value={item.scoreLabel} />
              ))}
            </div>
          </section>
          <section className="page-card">
            <div className="section-heading">
              <div>
                <p className="section-heading__eyebrow">{isKorean ? "홈 미리보기" : "Home preview"}</p>
                <h2 className="page-card__title">{isKorean ? "격차 미리보기" : "Gap preview"}</h2>
              </div>
            </div>
            <div className="stats-grid">
              {fallbackGapItems.map((item) => (
                <MetricCard
                  helperText={item.helperText}
                  key={item.id}
                  label={item.label}
                  tone="muted"
                  value={item.gapScoreLabel}
                />
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {!radarQuery.isLoading &&
      !gapQuery.isLoading &&
      (radarQuery.data?.categories.length ?? 0) === 0 &&
      (gapQuery.data?.items.length ?? 0) === 0 &&
      !(radarUnsupported && gapUnsupported) ? (
        <EmptyStateCard
          action={{
            label: isKorean ? "연습 열기" : "Open practice",
            to: routeConfig.practice.buildPath(),
          }}
          body={
            isKorean
              ? "더 많은 질문에 답해 카테고리 점수, 기준 맥락, 명시적인 스킬 격차를 쌓아보세요."
              : "Answer more questions to build out category scores, benchmark context, and explicit skill gaps."
          }
          title={isKorean ? "아직 스킬 인텔리전스가 없습니다" : "No skill intelligence yet"}
        />
      ) : null}
    </PageContainer>
  );
}
