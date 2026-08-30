import { Link } from "react-router-dom";
import { mapHomeResponseDtoToModel } from "../../entities/home/model";
import { useSkillProgressQuery } from "../../features/skills/api/useSkillProgressQuery";
import { useSkillGapQuery } from "../../features/skills/api/useSkillGapQuery";
import { useSkillRadarQuery } from "../../features/skills/api/useSkillRadarQuery";
import { ApiClientError, getErrorDetails } from "../../shared/api/errors";
import { getHomeRequest } from "../../shared/api/homeApi";
import { routeConfig } from "../../shared/config/routes";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { MetricCard } from "../../shared/ui/MetricCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { useLocale } from "../../shared/i18n";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../shared/api/queryKeys";
import { GapAnalysisSection } from "../../widgets/skills/GapAnalysisSection";
import { SkillCategorySummaryCard } from "../../widgets/skills/SkillCategorySummaryCard";
import { SkillRadarChart } from "../../widgets/skills/SkillRadarChart";

export function SkillsPage() {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const radarQuery = useSkillRadarQuery();
  const gapQuery = useSkillGapQuery();
  const progressQuery = useSkillProgressQuery();
  const homeFallbackQuery = useQuery({
    queryKey: [...queryKeys.skills.root, "home-fallback"],
    queryFn: async ({ signal }) => mapHomeResponseDtoToModel(await getHomeRequest(signal)),
  });
  const radarUnsupported = radarQuery.error instanceof ApiClientError && radarQuery.error.status === 404;
  const gapUnsupported = gapQuery.error instanceof ApiClientError && gapQuery.error.status === 404;
  const fallbackRadarItems = homeFallbackQuery.data?.skillRadarPreview ?? [];
  const fallbackGapItems = homeFallbackQuery.data?.skillGapPreview ?? [];
  const radarCategoryCount = radarQuery.data?.categories.length ?? 0;
  const trackedProgressCount = progressQuery.data?.items.length ?? 0;
  const topGapItem = gapQuery.data?.items[0] ?? null;
  const weakestProgressItem =
    progressQuery.data?.items.reduce((weakest, item) => {
      if (!weakest) {
        return item;
      }

      const weakestWeakCount = Number.parseInt(weakest.weakQuestionCountLabel, 10) || 0;
      const itemWeakCount = Number.parseInt(item.weakQuestionCountLabel, 10) || 0;
      return itemWeakCount > weakestWeakCount ? item : weakest;
    }, progressQuery.data.items[0]) ?? null;
  const totalAnsweredQuestions =
    progressQuery.data?.items.reduce((sum, item) => {
      return sum + (Number.parseInt(item.answeredQuestionCountLabel, 10) || 0);
    }, 0) ?? 0;
  const totalWeakQuestions =
    progressQuery.data?.items.reduce((sum, item) => {
      return sum + (Number.parseInt(item.weakQuestionCountLabel, 10) || 0);
    }, 0) ?? 0;

  return (
    <PageContainer
      description={
        isKorean
          ? "스킬 레이더와 격차 신호는 다음에 어떤 인터뷰 가지를 보강할지 결정하는 용도로만 사용하세요."
          : "Use skill radar and gap signals only to decide which interview branch should be reinforced next."
      }
      eyebrow={isKorean ? "보조 워크스페이스" : "Support workspace"}
      title={isKorean ? "스킬 신호를 다음 가지 선택으로 연결하세요" : "Turn skill signals into the next branch choice"}
    >
      {radarQuery.isLoading || gapQuery.isLoading || progressQuery.isLoading ? (
        <LoadingStateCard
          body={
            isKorean
              ? "현재 인터뷰 프로필의 스킬 레이더와 격차 분석을 불러오는 중입니다."
              : "Loading skill radar and gap analysis for your current interview profile."
          }
          title={isKorean ? "스킬 대시보드 준비 중" : "Preparing skill dashboard"}
        />
      ) : null}

      {radarQuery.isError && !radarUnsupported ? (
        <ErrorStateCard
          body={radarQuery.error instanceof Error ? radarQuery.error.message : isKorean ? "스킬 레이더를 불러오지 못했습니다." : "The skill radar could not be loaded."}
          details={getErrorDetails(radarQuery.error)}
          onAction={() => {
            void radarQuery.refetch();
          }}
          title={isKorean ? "스킬 레이더를 불러올 수 없습니다" : "Unable to load skill radar"}
        />
      ) : null}

      {gapQuery.isError && !gapUnsupported ? (
        <ErrorStateCard
          body={gapQuery.error instanceof Error ? gapQuery.error.message : isKorean ? "격차 분석을 불러오지 못했습니다." : "The gap analysis could not be loaded."}
          details={getErrorDetails(gapQuery.error)}
          onAction={() => {
            void gapQuery.refetch();
          }}
          title={isKorean ? "격차 분석을 불러올 수 없습니다" : "Unable to load gap analysis"}
        />
      ) : null}

      {progressQuery.isError ? (
        <ErrorStateCard
          body={progressQuery.error instanceof Error ? progressQuery.error.message : isKorean ? "스킬 진행 스냅샷을 불러오지 못했습니다." : "The skill progress snapshot could not be loaded."}
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
        <div className="page-stack skills-workspace">
          <section className="skills-workspace-surface">
            <div className="skills-workspace-surface__header">
              <div className="skills-workspace-surface__intro">
                <div className="skills-workspace-surface__eyebrow-row">
                  <p className="skills-workspace-surface__breadcrumbs">
                    <span>{isKorean ? "스킬 신호" : "Skill signal"}</span>
                    <span>/</span>
                    <span>{isKorean ? "격차 압박" : "Gap pressure"}</span>
                    <span>/</span>
                    <span>{isKorean ? "다음 가지" : "Next branch"}</span>
                  </p>
                  <span className="question-status-badge question-status-badge--accent">
                    {isKorean ? "연습 보조" : "Practice companion"}
                  </span>
                </div>
                <h2 className="skills-workspace-surface__title">
                  {isKorean ? "스킬 신호는 다음에 방어할 가치가 있는 가지를 고르는 데만 쓰세요" : "Use skill signals only to choose the next branch worth defending"}
                </h2>
                <p className="skills-workspace-surface__body">
                  {isKorean
                    ? "레이더, 격차 분석, 진행 상황은 인터뷰 DFS 루프에서 다음에 무엇을 방어해야 하는지 좁혀줄 때만 의미가 있습니다."
                    : "Radar, gap analysis, and progress only matter if they narrow what you should defend next in the interview DFS loop."}
                </p>
              </div>
              <div className="skills-workspace-surface__stats">
                <article className="skills-workspace-surface__stat">
                  <span>{isKorean ? "레이더 업데이트" : "Radar updated"}</span>
                  <strong>{radarQuery.data?.updatedAtLabel ?? "-"}</strong>
                </article>
                <article className="skills-workspace-surface__stat">
                  <span>{isKorean ? "레이더 카테고리" : "Radar categories"}</span>
                  <strong>{radarCategoryCount}</strong>
                </article>
                <article className="skills-workspace-surface__stat">
                  <span>{isKorean ? "추적 중인 진행도" : "Tracked progress"}</span>
                  <strong>{trackedProgressCount}</strong>
                </article>
                <article className="skills-workspace-surface__stat">
                  <span>{isKorean ? "격차 항목" : "Gap items"}</span>
                  <strong>{gapQuery.data?.items.length ?? 0}</strong>
                </article>
              </div>
            </div>
            <div className="skills-workspace-surface__chips">
              {topGapItem ? <span className="detail-chip">{isKorean ? `최대 격차: ${topGapItem.label}` : `Top gap: ${topGapItem.label}`}</span> : null}
              {weakestProgressItem ? (
                <span className="detail-chip">
                  {isKorean ? `약한 질문 부하: ${weakestProgressItem.label}` : `Weak-question load: ${weakestProgressItem.label}`}
                </span>
              ) : null}
              <span className="detail-chip detail-chip--accent">
                {isKorean ? "목표: 다음에 연습할 가지 하나 선택" : "Goal: choose one branch to practice next"}
              </span>
            </div>
            <div className="skills-workspace-surface__guidance">
              <article className="skills-workspace-surface__guidance-card">
                <span>{isKorean ? "오늘의 주 가지" : "Primary branch today"}</span>
                <strong>
                  {topGapItem
                    ? isKorean
                      ? `${topGapItem.label}을 다음 방어 가지로 삼아야 합니다.`
                      : `${topGapItem.label} should become the next defended branch.`
                    : isKorean
                      ? "연습 범위를 넓히기 전에 더 분명한 격차 신호를 기다리세요."
                      : "Wait for a clearer gap signal before broadening practice."}
                </strong>
              </article>
              <article className="skills-workspace-surface__guidance-card">
                <span>{isKorean ? "범위를 넓히기 전" : "Before you broaden"}</span>
                <strong>
                  {weakestProgressItem
                    ? isKorean
                      ? `${weakestProgressItem.label}의 약한 꼬리질문 부하가 가장 크므로 먼저 안정화하세요.`
                      : `Stabilize ${weakestProgressItem.label} first, because weak follow-up load is still the heaviest there.`
                    : isKorean
                      ? "페이지가 불안정한 꼬리질문 깊이를 식별할 수 있도록 답변 이력을 먼저 쌓아보세요."
                      : "Build one answered streak so the page can identify unstable follow-up depth."}
                </strong>
              </article>
            </div>
            <div className="skills-workspace-surface__actions">
              <Link className="primary-button" to={routeConfig.practice.buildPath()}>
                {isKorean ? "연습 워크스페이스 열기" : "Open practice workspace"}
              </Link>
              <Link className="secondary-button" to={routeConfig.reviewQueue.buildPath()}>
                {isKorean ? "복습 큐 열기" : "Open review queue"}
              </Link>
            </div>
          </section>

          <section className="skills-priority-board">
            <article className="page-card skills-priority-board__main">
              <div className="section-heading">
                <div>
                  <p className="section-heading__eyebrow">{isKorean ? "우선순위 보드" : "Priority board"}</p>
                  <h2 className="page-card__title">{isKorean ? "이 신호 세트가 이끌어야 할 다음 행동" : "What this signal set should drive"}</h2>
                </div>
              </div>
              <div className="skills-priority-list">
                <article className="skills-priority-item">
                  <div className="skills-priority-item__rank">1</div>
                  <div className="skills-priority-item__body">
                    <strong>{isKorean ? "가장 약한 방어 가능 가지 찾기" : "Find the weakest defendable branch"}</strong>
                    <span>
                      {isKorean
                        ? "격차와 약한 질문 부하를 따로 보지 말고 함께 해석하세요."
                        : "Use gap and weak-question load together, not as separate dashboards."}
                    </span>
                  </div>
                </article>
                <article className="skills-priority-item">
                  <div className="skills-priority-item__rank">2</div>
                  <div className="skills-priority-item__body">
                    <strong>{isKorean ? "실제 면접 근거로 다시 연결하기" : "Map it back to real interview evidence"}</strong>
                    <span>
                      {isKorean
                        ? "이미 약한 답변이나 불안정한 꼬리질문을 만든 스킬을 우선하세요."
                        : "Prefer skills that already produced weak answers or unstable follow-ups."}
                    </span>
                  </div>
                </article>
                <article className="skills-priority-item">
                  <div className="skills-priority-item__rank">3</div>
                  <div className="skills-priority-item__body">
                    <strong>{isKorean ? "다음 연습 실행으로 전환하기" : "Convert it into the next practice run"}</strong>
                    <span>
                      {isKorean
                        ? "이 페이지는 실제 질문 연습으로 가는 경로를 줄여야지, 분석 막다른길이 되어서는 안 됩니다."
                        : "This page should shorten the path to actual question practice, not become an analytics dead end."}
                    </span>
                  </div>
                </article>
              </div>
            </article>

            <article className="page-card page-card--muted skills-priority-board__side">
              <div className="section-heading">
                <div>
                  <p className="section-heading__eyebrow">{isKorean ? "현재 집중" : "Current focus"}</p>
                  <h2 className="page-card__title">{isKorean ? "가장 바로 행동 가능한 신호" : "Most actionable signal"}</h2>
                </div>
              </div>
              <div className="skills-signal-list">
                <div className="skills-signal-list__item">
                  <span>{isKorean ? "최대 격차" : "Top gap"}</span>
                  <strong>
                    {topGapItem
                      ? `${topGapItem.label} · ${topGapItem.gapScoreLabel}`
                      : isKorean
                        ? "아직 명시적인 격차 항목이 없습니다."
                        : "No explicit gap item is available yet."}
                  </strong>
                </div>
                <div className="skills-signal-list__item">
                  <span>{isKorean ? "약한 질문 부하" : "Weak-question load"}</span>
                  <strong>
                    {weakestProgressItem
                      ? isKorean
                        ? `${weakestProgressItem.label} · 약한 질문 ${weakestProgressItem.weakQuestionCountLabel}`
                        : `${weakestProgressItem.label} · weak questions ${weakestProgressItem.weakQuestionCountLabel}`
                      : isKorean
                        ? "아직 답변 기반 진행 스냅샷이 없습니다."
                        : "No answered progress snapshot is available yet."}
                  </strong>
                </div>
                <div className="skills-signal-list__item">
                  <span>{isKorean ? "다음 액션" : "Next action"}</span>
                  <strong>{isKorean ? "연습을 열고 범위를 넓히기 전에 약한 가지 하나를 먼저 보강하세요." : "Open practice and reinforce one weak branch before broadening coverage."}</strong>
                </div>
              </div>
            </article>
          </section>

          {radarQuery.data ? <SkillRadarChart radar={radarQuery.data} /> : null}
          {radarQuery.data ? <SkillCategorySummaryCard radar={radarQuery.data} /> : null}
          {gapQuery.data ? <GapAnalysisSection gapModel={gapQuery.data} /> : null}
          {progressQuery.data ? (
            <section className="page-card">
              <div className="section-heading">
                <div>
                  <p className="section-heading__eyebrow">{isKorean ? "진행도" : "Progress"}</p>
                  <h2 className="page-card__title">{isKorean ? "답변량과 약한 질문 부하" : "Answered volume and weak-question load"}</h2>
                </div>
                <span className="section-heading__count">{progressQuery.data.items.length}</span>
              </div>
              <div className="skills-progress-summary">
                <article className="skills-progress-summary__item">
                  <span>{isKorean ? "총 답변 수" : "Total answered"}</span>
                  <strong>{totalAnsweredQuestions}</strong>
                </article>
                <article className="skills-progress-summary__item">
                  <span>{isKorean ? "총 약한 질문 수" : "Total weak questions"}</span>
                  <strong>{totalWeakQuestions}</strong>
                </article>
                <article className="skills-progress-summary__item">
                  <span>{isKorean ? "우선 복구" : "Priority recovery"}</span>
                  <strong>
                    {weakestProgressItem
                      ? isKorean
                        ? `${weakestProgressItem.label}이 다음 재도전 블록 대상입니다.`
                        : `${weakestProgressItem.label} needs the next retry block.`
                      : isKorean
                        ? "아직 약한 답변 집중 구간이 없습니다."
                        : "No weak-answer hotspot is available yet."}
                  </strong>
                </article>
              </div>
              <div className="stack-list">
                {progressQuery.data.items.map((item) => (
                  <article className="list-item-card" key={item.id}>
                    <div className="list-item-card__content">
                      <div className="list-item-card__meta">
                        <span>{item.scoreLabel}</span>
                        {item.benchmarkLabel ? <span>{item.benchmarkLabel}</span> : null}
                        {item.gapLabel ? <span>{item.gapLabel}</span> : null}
                      </div>
                      <h3 className="list-item-card__title">{item.label}</h3>
                      <p className="list-item-card__body">
                        {isKorean
                          ? `답변 ${item.answeredQuestionCountLabel}개 · 약한 질문 ${item.weakQuestionCountLabel}개`
                          : `Answered ${item.answeredQuestionCountLabel} questions · Weak questions ${item.weakQuestionCountLabel}`}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
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
