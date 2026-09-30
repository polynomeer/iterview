import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getActiveResumeVersion } from "../../entities/resume/model";
import { useActiveResumeAnalysisQuery } from "../../features/resume/api/useActiveResumeAnalysisQuery";
import { useLatestResumeQuery } from "../../features/resume/api/useLatestResumeQuery";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { useResumeVersionSnapshotsQuery } from "../../features/resume/api/useResumeVersionSnapshotsQuery";
import { ApiClientError, getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { useLayoutMode } from "../../shared/ui/layout";
import { PageContainer } from "../../shared/ui/PageContainer";
import { WorkspaceContinuityRail } from "../../shared/ui/WorkspaceContinuityRail";
import { ActiveResumeOverviewCard } from "../../widgets/resume";

type ExplorerNode = {
  id: string;
  companyName: string;
  roleName: string;
  dateLabel: string;
  summary: string;
  impactText?: string;
  projectName?: string;
  current: boolean;
  employmentType?: string;
  projects: Array<{
    id: string;
    title: string;
    summary: string;
    dateLabel?: string;
    tags: string[];
  }>;
  technologies: string[];
  riskTitles: string[];
  severityScore: number;
  impactLevel: "core" | "high" | "medium" | "low";
};

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function includesKeyword(source: string, target: string) {
  return normalizeText(source).includes(normalizeText(target));
}

function buildFallbackQuestions(node: ExplorerNode, isKorean: boolean) {
  const prompts = [
    isKorean
      ? `${node.companyName}에서 ${node.roleName}로 가장 복잡했던 의사결정을 설명해보세요.`
      : `Describe the most complex decision you made as ${node.roleName} at ${node.companyName}.`,
    isKorean
      ? `${node.projectName ?? node.projects[0]?.title ?? node.companyName}의 제약과 트레이드오프를 어떻게 설명하겠습니까?`
      : `How would you explain the constraints and trade-offs in ${node.projectName ?? node.projects[0]?.title ?? node.companyName}?`,
    isKorean
      ? "정량 지표가 없다면 무엇을 근거로 성과를 방어할 수 있나요?"
      : "If metrics are thin, what evidence would you use to defend the outcome?",
  ];

  return prompts;
}

function getImpactLevel(node: {
  current: boolean;
  impactText?: string;
  projects: Array<unknown>;
}) {
  if (node.current || node.projects.length >= 2) {
    return "high" as const;
  }

  if (node.impactText && node.impactText.length > 36) {
    return "core" as const;
  }

  if (node.impactText) {
    return "medium" as const;
  }

  return "low" as const;
}

function getImpactLabel(level: ExplorerNode["impactLevel"], isKorean: boolean) {
  if (level === "core") {
    return isKorean ? "핵심 프로젝트" : "Core project";
  }

  if (level === "high") {
    return isKorean ? "고임팩트" : "High impact";
  }

  if (level === "medium") {
    return isKorean ? "중간 임팩트" : "Medium impact";
  }

  return isKorean ? "보조 프로젝트" : "Low impact";
}

function getSeverityTone(score: number) {
  if (score >= 80) {
    return "danger";
  }

  if (score >= 60) {
    return "warning";
  }

  return "stable";
}

export function ResumeAnalysisPage() {
  const resumeListQuery = useResumeListQuery();
  const latestResumeQuery = useLatestResumeQuery();
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const { isDesktop } = useLayoutMode();
  const effectiveResumeList = latestResumeQuery.data ?? resumeListQuery.data;
  const activeResumeVersion = getActiveResumeVersion(effectiveResumeList);
  const analysisQuery = useActiveResumeAnalysisQuery(activeResumeVersion?.id ?? null);
  const snapshotsQuery = useResumeVersionSnapshotsQuery(activeResumeVersion?.id ?? null, Boolean(activeResumeVersion?.id));
  const isAnalysisUnavailable =
    analysisQuery.error instanceof ApiClientError && analysisQuery.error.status === 404;
  const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(null);

  const explorerNodes = useMemo<ExplorerNode[]>(() => {
    if (snapshotsQuery.data) {
      const snapshotRisks = snapshotsQuery.data.risks;
      const snapshotSkills = snapshotsQuery.data.skills;

      return snapshotsQuery.data.experiences.map((experience, index) => {
        const relatedProjects = snapshotsQuery.data.projects.filter(
          (project) => project.relatedExperienceId === experience.id,
        );
        const fallbackProjectTitle =
          experience.projectName ?? `${experience.companyName} ${isKorean ? "대표 프로젝트" : "Primary project"}`;
        const projects =
          relatedProjects.length > 0
            ? relatedProjects.map((project) => ({
                id: project.id,
                title: project.title,
                summary: project.summary,
                dateLabel: project.dateLabel,
                tags: project.tags.map((tag) => tag.label),
              }))
            : [
                {
                  id: `${experience.id}-primary`,
                  title: fallbackProjectTitle,
                  summary: experience.summary,
                  dateLabel: experience.dateLabel,
                  tags: [],
                },
              ];

        const technologies = Array.from(
          new Set([
            ...projects.flatMap((project) => project.tags),
            ...snapshotSkills
              .filter(
                (skill) =>
                  includesKeyword(experience.summary, skill.label) ||
                  (experience.impactText ? includesKeyword(experience.impactText, skill.label) : false),
              )
              .map((skill) => skill.label),
          ]),
        ).slice(0, 8);

        const riskTitles = snapshotRisks
          .filter(
            (risk) =>
              includesKeyword(risk.title, experience.companyName) ||
              includesKeyword(risk.description, experience.companyName) ||
              includesKeyword(risk.title, experience.roleName) ||
              includesKeyword(risk.description, experience.roleName) ||
              projects.some(
                (project) =>
                  includesKeyword(risk.title, project.title) || includesKeyword(risk.description, project.title),
              ),
          )
          .map((risk) => risk.title);

        const severityScore = Math.max(48, 92 - index * 9 - riskTitles.length * 3);
        const impactLevel = getImpactLevel({
          current: experience.current,
          impactText: experience.impactText,
          projects,
        });

        return {
          id: experience.id,
          companyName: experience.companyName,
          roleName: experience.roleName,
          dateLabel: experience.dateLabel,
          summary: experience.summary,
          impactText: experience.impactText,
          projectName: experience.projectName,
          current: experience.current,
          employmentType: experience.employmentType,
          projects,
          technologies,
          riskTitles,
          severityScore,
          impactLevel,
        };
      });
    }

    if (!analysisQuery.data) {
      return [];
    }

    return analysisQuery.data.experiences.map((experience, index) => {
      const parts = experience.title.split(" · ");
      const companyName = parts[0] ?? (isKorean ? "경력 항목" : "Experience");
      const roleName = parts[1] ?? (isKorean ? "직무 정보 정리 필요" : "Role needs refinement");
      const riskTitles = analysisQuery.data?.risks
        .filter(
          (risk) =>
            includesKeyword(risk.title, companyName) ||
            includesKeyword(risk.description, companyName) ||
            includesKeyword(risk.title, roleName),
        )
        .map((risk) => risk.title);

      return {
        id: experience.id,
        companyName,
        roleName,
        dateLabel: isKorean ? "기간 정보는 스냅샷 동기화 후 표시됩니다" : "Dates appear after snapshot sync",
        summary: experience.summary,
        impactText: experience.impactText,
        projectName: undefined,
        current: index === 0,
        employmentType: undefined,
        projects: [
          {
            id: `${experience.id}-primary`,
            title: experience.title,
            summary: experience.summary,
            dateLabel: undefined,
            tags: [],
          },
        ],
        technologies: analysisQuery.data.skills.slice(index, index + 5).map((skill) => skill.label),
        riskTitles,
        severityScore: Math.max(48, 90 - index * 8),
        impactLevel: getImpactLevel({
          current: index === 0,
          impactText: experience.impactText,
          projects: [{ id: "fallback" }],
        }),
      };
    });
  }, [analysisQuery.data, isKorean, snapshotsQuery.data]);

  useEffect(() => {
    if (explorerNodes.length === 0) {
      setSelectedExperienceId(null);
      return;
    }

    if (!selectedExperienceId || !explorerNodes.some((node) => node.id === selectedExperienceId)) {
      setSelectedExperienceId(explorerNodes[0].id);
    }
  }, [explorerNodes, selectedExperienceId]);

  const selectedNode =
    explorerNodes.find((node) => node.id === selectedExperienceId) ?? explorerNodes[0] ?? null;
  const totalProjects = explorerNodes.reduce((count, node) => count + node.projects.length, 0);
  const technologies = Array.from(new Set(explorerNodes.flatMap((node) => node.technologies)));
  const topSkills = (snapshotsQuery.data?.skills ?? analysisQuery.data?.skills ?? []).slice(0, 6);
  const severeRisks = (analysisQuery.data?.risks ?? []).slice(0, 5);
  const coreProjects = explorerNodes.filter((node) => node.impactLevel === "core" || node.impactLevel === "high").length;

  return (
    <PageContainer
      actions={
        <Link className="secondary-button" to={routeConfig.resume.buildPath()}>
          {isKorean ? "이력서 작업공간 열기" : "Open resume workspace"}
        </Link>
      }
      description={
        isKorean
          ? "활성 이력서를 실제 면접용 경력 탐색기로 펼쳐서, DFS 꼬리질문이 어디까지 들어와도 방어 가능한지 확인하세요."
          : "Open the active resume as an experience explorer and verify how deep DFS follow-up questioning can go."
      }
      eyebrow={isKorean ? "경력 탐색" : "Experience explorer"}
      title={isKorean ? "경력 기반 면접 방어 워크스페이스" : "Experience-grounded interview workspace"}
    >
      <WorkspaceContinuityRail
        current={{
          title: isKorean ? "경력 익스플로러" : "Experience explorer",
          description: isKorean
            ? "회사, 프로젝트, 기술, 리스크를 한 화면에서 연결해 꼬리질문 준비 단위를 만드세요."
            : "Connect companies, projects, skills, and risks in one place to prepare follow-up units.",
        }}
        downstream={[
          {
            title: isKorean ? "이력서 편집기" : "Resume editor",
            description: isKorean ? "약한 설명은 기준 문서부터 보강하세요." : "Strengthen weak claims in the source text first.",
            to: activeResumeVersion
              ? routeConfig.resumeEditor.buildPath({ versionId: activeResumeVersion.id })
              : routeConfig.resume.buildPath(),
          },
          {
            title: isKorean ? "면접 실행기" : "Interview launcher",
            description: isKorean ? "정리된 경력을 바로 모의 질문 트리로 넘기세요." : "Send the cleaned-up experience map into the interview tree.",
            to: routeConfig.interview.buildPath(),
          },
        ]}
        upstream={[
          {
            title: isKorean ? "복습 큐" : "Review queue",
            description: isKorean ? "약했던 답변이 어떤 경력 설명에서 시작됐는지 다시 확인하세요." : "Trace weak answers back to the originating experience claim.",
            to: routeConfig.reviewQueue.buildPath(),
          },
        ]}
      />
      {resumeListQuery.isLoading && latestResumeQuery.isLoading ? (
        <LoadingStateCard
          body={isKorean ? "이력서 컨테이너와 활성 버전을 불러온 뒤 경력 익스플로러를 여는 중입니다." : "Loading resume containers and the active version before opening the experience explorer."}
          title={isKorean ? "경력 워크스페이스를 준비하는 중입니다" : "Preparing the experience workspace"}
        />
      ) : null}

      {resumeListQuery.isError && latestResumeQuery.isError ? (
        <ErrorStateCard
          body={
            resumeListQuery.error instanceof Error
              ? resumeListQuery.error.message
              : isKorean
                ? "이력서 목록을 불러오지 못했습니다."
                : "The resume list could not be loaded."
          }
          details={getErrorDetails(resumeListQuery.error)}
          onAction={() => {
            void resumeListQuery.refetch();
          }}
          title={isKorean ? "경력 워크스페이스를 불러올 수 없습니다" : "Unable to load the experience workspace"}
        />
      ) : null}

      {!(resumeListQuery.isLoading && latestResumeQuery.isLoading) &&
      !(resumeListQuery.isError && latestResumeQuery.isError) &&
      effectiveResumeList ? (
        <div className="page-stack">
          {!activeResumeVersion ? (
            <EmptyStateCard
              action={{
                label: isKorean ? "이력서 관리 열기" : "Open resume management",
                to: routeConfig.resume.buildPath(),
              }}
              body={isKorean ? "경력 탐색기와 꼬리질문 트리를 만들려면 먼저 활성 이력서 버전을 선택하세요." : "Activate a resume version first to build the experience explorer and follow-up tree."}
              title={isKorean ? "활성 이력서 버전이 없습니다" : "No active resume version"}
            />
          ) : analysisQuery.isLoading ? (
            <LoadingStateCard
              body={isKorean ? "활성 버전의 경력, 스킬, 리스크를 탐색기 화면에 맞게 정리하는 중입니다." : "Organizing experience, skills, and risks into the explorer workspace."}
              title={isKorean ? "경력 지도를 생성하는 중입니다" : "Building the experience map"}
            />
          ) : isAnalysisUnavailable ? (
            <EmptyStateCard
              action={{
                label: isKorean ? "이력서로 돌아가기" : "Back to resumes",
                to: routeConfig.resume.buildPath(),
              }}
              body={isKorean ? "백엔드에서 아직 분석 결과를 주지 않지만, 경력 스냅샷이 준비되면 이 화면은 자동으로 더 풍부해집니다." : "The backend does not return analysis yet, but this page becomes richer as soon as snapshot data is available."}
              title={isKorean ? "아직 이력서 분석을 지원하지 않습니다" : "Resume analysis is not supported yet"}
            />
          ) : analysisQuery.isError ? (
            <ErrorStateCard
              body={
                analysisQuery.error instanceof Error
                  ? analysisQuery.error.message
                  : isKorean
                    ? "이력서 분석 결과를 불러오지 못했습니다."
                    : "Resume analysis could not be loaded."
              }
              details={getErrorDetails(analysisQuery.error)}
              onAction={() => {
                void analysisQuery.refetch();
              }}
              title={isKorean ? "경력 인사이트를 불러올 수 없습니다" : "Unable to load experience insights"}
            />
          ) : analysisQuery.data ? (
            <div className={`resume-analysis-explorer ${isDesktop ? "resume-analysis-explorer--desktop" : "resume-analysis-explorer--mobile"}`}>
              <aside className="resume-analysis-explorer__left">
                <section className="page-card resume-analysis-explorer__hero">
                  <div className="resume-analysis-explorer__hero-topline">
                    <span className="page-card__label">{isKorean ? "경력 탐색기" : "Experience explorer"}</span>
                    <span className="question-status-badge question-status-badge--accent">
                      {isKorean ? "DFS 준비" : "DFS ready"}
                    </span>
                  </div>
                  <h2 className="resume-analysis-explorer__hero-title">
                    {isKorean ? "회사, 프로젝트, 면접 질문을 하나의 경력 지도에 고정하세요" : "Pin companies, projects, and interview questions into one experience map"}
                  </h2>
                  <p className="resume-analysis-explorer__hero-body">
                    {isKorean
                      ? "샘플처럼 좌측에는 커리어 타임라인, 중앙에는 프로젝트 탐색기, 우측에는 상세 인스펙터를 두고 현재 활성 이력서를 면접용 기준 문서로 압축했습니다."
                      : "This compresses the active resume into an interview-ready source of truth with a career timeline, project explorer, and detail inspector."}
                  </p>
                  <div className="resume-analysis-explorer__hero-stats">
                    <article>
                      <span>{isKorean ? "회사" : "Companies"}</span>
                      <strong>{explorerNodes.length}</strong>
                    </article>
                    <article>
                      <span>{isKorean ? "프로젝트" : "Projects"}</span>
                      <strong>{totalProjects}</strong>
                    </article>
                    <article>
                      <span>{isKorean ? "핵심 경력" : "Core lanes"}</span>
                      <strong>{coreProjects}</strong>
                    </article>
                    <article>
                      <span>{isKorean ? "기술" : "Technologies"}</span>
                      <strong>{technologies.length}</strong>
                    </article>
                  </div>
                </section>
                <ActiveResumeOverviewCard resumeList={effectiveResumeList} />
                <section className="page-card resume-analysis-explorer__summary-card">
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">{isKorean ? "경력 개요" : "Career summary"}</p>
                      <h2 className="page-card__title">{isKorean ? "지금 바로 답변에 연결할 수 있는 단위" : "Units you can connect into answers now"}</h2>
                    </div>
                  </div>
                  <div className="resume-analysis-explorer__summary-grid">
                    <article>
                      <span>{isKorean ? "활성 버전" : "Active version"}</span>
                      <strong>{activeResumeVersion.versionNumberLabel}</strong>
                    </article>
                    <article>
                      <span>{isKorean ? "파싱 상태" : "Parsing"}</span>
                      <strong>{activeResumeVersion.parsingStatusLabel}</strong>
                    </article>
                    <article>
                      <span>{isKorean ? "리스크" : "Risks"}</span>
                      <strong>{analysisQuery.data.risks.length}</strong>
                    </article>
                    <article>
                      <span>{isKorean ? "스킬 근거" : "Skill proofs"}</span>
                      <strong>{analysisQuery.data.skills.length}</strong>
                    </article>
                  </div>
                </section>
              </aside>

              <main className="resume-analysis-explorer__main">
                <section className="page-card resume-analysis-explorer__workspace">
                  <div className="resume-analysis-explorer__workspace-header">
                    <div>
                      <p className="resume-analysis-explorer__breadcrumbs">
                        <span>{isKorean ? "경력" : "Career"}</span>
                        <span>/</span>
                        <span>{isKorean ? "프로젝트" : "Projects"}</span>
                        <span>/</span>
                        <span>{isKorean ? "질문 트리" : "Question tree"}</span>
                      </p>
                      <div className="resume-analysis-explorer__tab-row">
                        <button className="secondary-button is-active" type="button">
                          {isKorean ? "경력 익스플로러" : "Experience explorer"}
                        </button>
                        <button className="secondary-button" type="button">
                          {isKorean ? "임팩트 분석" : "Impact analytics"}
                        </button>
                        <button className="secondary-button" type="button">
                          {isKorean ? "이력서 빌더" : "Resume builder"}
                        </button>
                      </div>
                    </div>
                    <div className="resume-analysis-explorer__actions-row">
                      <button className="secondary-button" type="button">
                        {isKorean ? "필터" : "Filter"}
                      </button>
                      <button className="secondary-button" type="button">
                        {isKorean ? "정렬" : "Sort"}
                      </button>
                      <Link className="primary-button" to={routeConfig.resumeEditor.buildPath({ versionId: activeResumeVersion.id })}>
                        {isKorean ? "경력 보강" : "Add experience"}
                      </Link>
                    </div>
                  </div>

                  <div className="resume-analysis-explorer__map-shell">
                    <div className="resume-analysis-explorer__map-topline">
                      <strong>
                        {isKorean
                          ? `${explorerNodes.length}개 회사 · ${totalProjects}개 프로젝트 · ${technologies.length}개 기술`
                          : `${explorerNodes.length} companies · ${totalProjects} projects · ${technologies.length} technologies`}
                      </strong>
                      <button className="secondary-button" type="button">
                        {isKorean ? "보기 맞춤" : "Fit view"}
                      </button>
                    </div>
                    <div className="resume-analysis-explorer__map">
                      {explorerNodes.map((node) => (
                        <article className="resume-analysis-explorer__lane" key={node.id}>
                          <div className="resume-analysis-explorer__lane-rail">
                            <span className="resume-analysis-explorer__lane-period">{node.dateLabel}</span>
                            <span className="resume-analysis-explorer__lane-dot" />
                          </div>
                          <button
                            aria-pressed={selectedNode?.id === node.id}
                            className={`resume-analysis-explorer__company-card${selectedNode?.id === node.id ? " is-active" : ""}`}
                            onClick={() => {
                              setSelectedExperienceId(node.id);
                            }}
                            type="button"
                          >
                            <strong>{node.companyName}</strong>
                            <span>{node.roleName}</span>
                          </button>
                          <div className="resume-analysis-explorer__project-flow">
                            {node.projects.map((project, index) => (
                              <button
                                className={`resume-analysis-explorer__project-card${selectedNode?.id === node.id && index === 0 ? " is-active" : ""}`}
                                key={project.id}
                                onClick={() => {
                                  setSelectedExperienceId(node.id);
                                }}
                                type="button"
                              >
                                <div className="resume-analysis-explorer__project-title-row">
                                  <span className="resume-analysis-explorer__project-bullet" />
                                  <strong>{project.title}</strong>
                                </div>
                                <span>{project.dateLabel ?? node.dateLabel}</span>
                                <div className="resume-analysis-explorer__project-tags">
                                  <span className={`resume-analysis-explorer__impact-chip resume-analysis-explorer__impact-chip--${node.impactLevel}`}>
                                    {getImpactLabel(node.impactLevel, isKorean)}
                                  </span>
                                  {node.riskTitles.length > 0 ? (
                                    <span className="resume-analysis-explorer__impact-chip">
                                      {isKorean ? `리스크 ${node.riskTitles.length}` : `${node.riskTitles.length} risks`}
                                    </span>
                                  ) : null}
                                </div>
                              </button>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="resume-analysis-explorer__insights-grid">
                  <section className="page-card resume-analysis-explorer__insight-panel">
                    <div className="section-heading">
                      <div>
                        <p className="section-heading__eyebrow">{isKorean ? "커리어 요약" : "Career summary"}</p>
                        <h2 className="page-card__title">{isKorean ? "탐색 가능한 경력 볼륨" : "Explorable career volume"}</h2>
                      </div>
                    </div>
                    <div className="resume-analysis-explorer__career-metrics">
                      <article>
                        <strong>{explorerNodes.length}</strong>
                        <span>{isKorean ? "회사" : "Companies"}</span>
                      </article>
                      <article>
                        <strong>{totalProjects}</strong>
                        <span>{isKorean ? "프로젝트" : "Projects"}</span>
                      </article>
                      <article>
                        <strong>{topSkills.length}</strong>
                        <span>{isKorean ? "대표 스킬" : "Top skills"}</span>
                      </article>
                      <article>
                        <strong>{technologies.length}+</strong>
                        <span>{isKorean ? "기술 태그" : "Tech tags"}</span>
                      </article>
                    </div>
                  </section>

                  <section className="page-card resume-analysis-explorer__insight-panel">
                    <div className="section-heading">
                      <div>
                        <p className="section-heading__eyebrow">{isKorean ? "상위 스킬" : "Top skills"}</p>
                        <h2 className="page-card__title">{isKorean ? "경력에 가장 많이 걸린 스킬" : "Skills most connected to experience"}</h2>
                      </div>
                    </div>
                    <div className="resume-analysis-explorer__skill-cloud">
                      {topSkills.map((skill) => (
                        <span className="detail-chip" key={skill.id}>
                          {skill.label}
                        </span>
                      ))}
                    </div>
                    <p className="page-card__body">
                      {isKorean
                        ? "샘플의 하단 스킬 영역처럼, 가장 자주 등장하는 기술 근거를 빠르게 훑고 질문 확률이 높은 항목부터 보강합니다."
                        : "Like the sample footer skill area, this surfaces the most repeated evidence so you can strengthen likely question targets first."}
                    </p>
                  </section>

                  <section className="page-card resume-analysis-explorer__insight-panel">
                    <div className="section-heading">
                      <div>
                        <p className="section-heading__eyebrow">{isKorean ? "리스크 분포" : "Risk distribution"}</p>
                        <h2 className="page-card__title">{isKorean ? "꼬리질문 압박 레벨" : "Follow-up pressure levels"}</h2>
                      </div>
                    </div>
                    <div className="resume-analysis-explorer__risk-list">
                      {explorerNodes.slice(0, 4).map((node) => (
                        <article key={node.id}>
                          <div>
                            <strong>{node.companyName}</strong>
                            <span>{getImpactLabel(node.impactLevel, isKorean)}</span>
                          </div>
                          <span className={`resume-analysis-explorer__risk-score resume-analysis-explorer__risk-score--${getSeverityTone(node.severityScore)}`}>
                            {node.severityScore}
                          </span>
                        </article>
                      ))}
                    </div>
                  </section>
                </section>
              </main>

              <aside className="resume-analysis-explorer__right">
                <section className="page-card resume-analysis-explorer__inspector">
                  <div className="resume-analysis-explorer__inspector-topline">
                    <span className="page-card__label">{isKorean ? "프로젝트 상세" : "Project details"}</span>
                    <button aria-label={isKorean ? "닫기" : "Close"} className="resume-analysis-explorer__close-button" type="button">
                      ×
                    </button>
                  </div>
                  {selectedNode ? (
                    <>
                      <div className="resume-analysis-explorer__inspector-head">
                        <span className={`resume-analysis-explorer__impact-chip resume-analysis-explorer__impact-chip--${selectedNode.impactLevel}`}>
                          {getImpactLabel(selectedNode.impactLevel, isKorean)}
                        </span>
                        <h2>{selectedNode.projectName ?? selectedNode.projects[0]?.title ?? selectedNode.companyName}</h2>
                        <p>{selectedNode.dateLabel}</p>
                      </div>
                      <div className="resume-analysis-explorer__inspector-section">
                        <h3>{isKorean ? "프로젝트 설명" : "About this project"}</h3>
                        <p>{selectedNode.impactText ?? selectedNode.summary}</p>
                      </div>
                      <div className="resume-analysis-explorer__inspector-section">
                        <h3>{isKorean ? "핵심 책임" : "Key responsibilities"}</h3>
                        <ul className="resume-analysis-explorer__bullet-list">
                          {selectedNode.projects.map((project) => (
                            <li key={project.id}>{project.summary}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="resume-analysis-explorer__inspector-section">
                        <h3>{isKorean ? "주요 성과" : "Key achievements"}</h3>
                        <div className="resume-analysis-explorer__achievement-list">
                          {(selectedNode.riskTitles.length > 0 ? selectedNode.riskTitles : [selectedNode.summary]).slice(0, 4).map((item, index) => (
                            <article key={`${selectedNode.id}-achievement-${index}`}>
                              <span>{item}</span>
                              <strong>{Math.max(52, selectedNode.severityScore - index * 7)}%</strong>
                            </article>
                          ))}
                        </div>
                      </div>
                      <div className="resume-analysis-explorer__inspector-section">
                        <h3>{isKorean ? "사용 기술" : "Technologies used"}</h3>
                        <div className="resume-analysis-explorer__tech-cloud">
                          {selectedNode.technologies.length > 0 ? (
                            selectedNode.technologies.map((technology) => (
                              <span className="detail-chip" key={technology}>
                                {technology}
                              </span>
                            ))
                          ) : (
                            <span className="detail-chip">{isKorean ? "기술 태그 준비 중" : "Tags pending"}</span>
                          )}
                        </div>
                      </div>
                    </>
                  ) : null}
                </section>

                <section className="page-card resume-analysis-explorer__question-panel">
                  <div className="resume-analysis-explorer__question-tabs">
                    <button className="secondary-button is-active" type="button">
                      {isKorean ? "생성 질문" : "Generated questions"}
                    </button>
                    <button className="secondary-button" type="button">
                      {isKorean ? "연결 스킬" : "Connected skills"}
                    </button>
                  </div>
                  <div className="resume-analysis-explorer__question-list">
                    {(selectedNode ? buildFallbackQuestions(selectedNode, isKorean) : []).map((question, index) => (
                      <article key={`${selectedNode?.id ?? "question"}-${index}`}>
                        <div>
                          <strong>{index + 1}</strong>
                          <p>{question}</p>
                        </div>
                        <span className={`resume-analysis-explorer__risk-score resume-analysis-explorer__risk-score--${index === 0 ? "danger" : index === 1 ? "warning" : "stable"}`}>
                          {Math.max(72, 92 - index * 8)}
                        </span>
                      </article>
                    ))}
                  </div>
                  <Link className="primary-button resume-analysis-explorer__practice-button" to={routeConfig.interview.buildPath()}>
                    {isKorean ? "이 경력으로 모의 시작" : "Practice this project"}
                  </Link>
                </section>

                <section className="page-card resume-analysis-explorer__queue-panel">
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">{isKorean ? "수정 큐" : "Repair queue"}</p>
                      <h2 className="page-card__title">{isKorean ? "우선 보강할 리스크" : "Risks to repair next"}</h2>
                    </div>
                  </div>
                  <div className="resume-analysis-explorer__queue-list">
                    {severeRisks.length > 0 ? (
                      severeRisks.map((risk) => (
                        <article key={risk.id}>
                          <strong>{risk.title}</strong>
                          <span>{risk.description}</span>
                        </article>
                      ))
                    ) : (
                      <p className="page-card__body">
                        {isKorean ? "지금은 즉시 보강이 필요한 리스크가 없습니다." : "There are no urgent repair risks right now."}
                      </p>
                    )}
                  </div>
                </section>
              </aside>
            </div>
          ) : null}
        </div>
      ) : null}
    </PageContainer>
  );
}
