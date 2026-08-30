import { Link } from "react-router-dom";
import { getActiveResumeVersion } from "../../entities/resume/model";
import { useActiveResumeAnalysisQuery } from "../../features/resume/api/useActiveResumeAnalysisQuery";
import { useLatestResumeQuery } from "../../features/resume/api/useLatestResumeQuery";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { ApiClientError, getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { useLayoutMode } from "../../shared/ui/layout";
import { PageContainer } from "../../shared/ui/PageContainer";
import { WorkspaceContinuityRail } from "../../shared/ui/WorkspaceContinuityRail";
import {
  ActiveResumeOverviewCard,
  ResumeExperienceList,
  ResumeRiskList,
  ResumeSkillsCard,
} from "../../widgets/resume";

export function ResumeAnalysisPage() {
  const resumeListQuery = useResumeListQuery();
  const latestResumeQuery = useLatestResumeQuery();
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const { isDesktop } = useLayoutMode();
  const effectiveResumeList = latestResumeQuery.data ?? resumeListQuery.data;
  const activeResumeVersion = getActiveResumeVersion(effectiveResumeList);
  const analysisQuery = useActiveResumeAnalysisQuery(activeResumeVersion?.id ?? null);
  const isAnalysisUnavailable =
    analysisQuery.error instanceof ApiClientError && analysisQuery.error.status === 404;

  return (
    <PageContainer
      actions={
        <Link className="secondary-button" to={routeConfig.resume.buildPath()}>
          {isKorean ? "이력서 워크스페이스 열기" : "Open resume workspace"}
        </Link>
      }
      description={
        isKorean
          ? "활성 이력서를 source of truth로 검토하고, 면접 꼬리질문이 시작되기 전에 더 강한 증빙이 필요한 주장을 찾으세요."
          : "Review the active resume as source of truth, then find the claims that need stronger evidence before interview follow-ups begin."
      }
      eyebrow={isKorean ? "근거 검토" : "Source review"}
      title={isKorean ? "이력서 source of truth 점검" : "Inspect resume source of truth"}
    >
      <WorkspaceContinuityRail
        current={{
          title: isKorean ? "이력서 source of truth 검토" : "Resume source-of-truth review",
          description: isKorean
            ? "활성 이력서 주장 중 어떤 항목이 아직 꼬리질문 압박을 버틸 만큼 충분한 증빙이 없는지 찾으세요."
            : "Find which active resume claims still lack enough evidence to survive follow-up pressure.",
        }}
        downstream={[
          {
            title: isKorean ? "이력서 편집기" : "Resume editor",
            description: isKorean ? "리스크가 분명해지면 얇은 주장을 다시 쓰세요." : "Rewrite the thin claim once the risk is clear.",
            to: activeResumeVersion
              ? routeConfig.resumeEditor.buildPath({ versionId: activeResumeVersion.id })
              : routeConfig.resume.buildPath(),
          },
          {
            title: isKorean ? "면접 실행기" : "Interview launcher",
            description: isKorean ? "source claim이 충분히 강해진 뒤에만 모의를 시작하세요." : "Start a mock only after the source claim is strong enough to defend.",
            to: routeConfig.interview.buildPath(),
          },
        ]}
        upstream={[
          {
            title: isKorean ? "약한 노드" : "Weak nodes",
            description: isKorean ? "실패한 분기가 약한 이력서 주장을 가리킬 때 여기로 돌아오세요." : "Come back here when a failing branch points to a weak resume claim.",
            to: routeConfig.weakNodes.buildPath(),
          },
        ]}
      />
      {resumeListQuery.isLoading && latestResumeQuery.isLoading ? (
        <LoadingStateCard
          body={isKorean ? "이력서 컨테이너와 활성 버전을 불러온 뒤 분석 화면을 여는 중입니다." : "Loading resume containers and the active version before opening analysis."}
          title={isKorean ? "이력서 분석 화면을 준비하는 중입니다" : "Preparing resume intelligence"}
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
          title={isKorean ? "이력서 분석을 불러올 수 없습니다" : "Unable to load resume analysis"}
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
              body={isKorean ? "파싱된 스킬, 경력, 리스크가 분명한 source of truth를 갖도록 먼저 활성 이력서 버전을 선택하세요." : "Activate a resume version first so parsed skills, experiences, and risks have a clear source of truth."}
              title={isKorean ? "활성 이력서 버전이 없습니다" : "No active resume version"}
            />
          ) : analysisQuery.isLoading ? (
            <LoadingStateCard
              body={isKorean ? "활성 버전의 추출 스킬, 경력, 리스크 신호를 불러오는 중입니다." : "Loading extracted skills, experiences, and risk signals for the active version."}
              title={isKorean ? "활성 이력서를 분석하는 중입니다" : "Analyzing active resume"}
            />
          ) : isAnalysisUnavailable ? (
            <EmptyStateCard
              action={{
                label: isKorean ? "이력서로 돌아가기" : "Back to resumes",
                to: routeConfig.resume.buildPath(),
              }}
              body={isKorean ? "백엔드에서 아직 이력서 분석을 지원하지 않습니다. 활성 버전 개요는 계속 볼 수 있고, 나머지 학습 흐름은 막히지 않습니다." : "Resume analysis is not available from the backend yet. The active-version overview remains available, and the rest of the learning flow stays unblocked."}
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
              title={isKorean ? "이력서 인사이트를 불러올 수 없습니다" : "Unable to load resume insights"}
            />
          ) : analysisQuery.data ? (
            (() => {
              const highRiskCount = analysisQuery.data.risks.filter((risk) =>
                risk.severityLabel.toLowerCase().includes("high"),
              ).length;
              const workspaceSummary = (
                <section className="page-card resume-analysis-workspace-surface">
                  <div className="resume-analysis-workspace-surface__header">
                    <div className="resume-analysis-workspace-surface__intro">
                      <div className="resume-analysis-workspace-surface__eyebrow-row">
                        <span className="page-card__label">{isKorean ? "source of truth" : "Source of truth"}</span>
                        <span className="question-status-badge question-status-badge--accent">{isKorean ? "방어 레인" : "Defense lane"}</span>
                      </div>
                      <p className="resume-analysis-workspace-surface__breadcrumbs">
                        {isKorean ? "근거 주장 품질" : "Source claim quality"}
                        <span>/</span>
                        {isKorean ? "증빙 밀도" : "Evidence density"}
                        <span>/</span>
                        {isKorean ? "꼬리질문 생존력" : "Follow-up survivability"}
                      </p>
                      <h2 className="resume-analysis-workspace-surface__title">
                        {isKorean ? "활성 이력서가 DFS 꼬리질문 압박을 버틸 수 있는지 확인하세요" : "Check whether the active resume can survive DFS follow-up pressure"}
                      </h2>
                      <p className="resume-analysis-workspace-surface__body">
                        {isKorean
                          ? "이 페이지에서 얇은 주장, 약한 증빙 블록, 그리고 면접 세션이 파고들기 전에 더 강한 근거가 필요한 정확한 이력서 구간을 찾으세요."
                          : "Use this page to find thin claims, weak evidence blocks, and the exact resume sections that need stronger grounding before an interview session drills into them."}
                      </p>
                    </div>
                    <div className="resume-analysis-workspace-surface__stats">
                      <article className="resume-analysis-workspace-surface__stat">
                        <span>{isKorean ? "매핑된 스킬" : "Skills mapped"}</span>
                        <strong>{analysisQuery.data.skills.length}</strong>
                      </article>
                      <article className="resume-analysis-workspace-surface__stat">
                        <span>{isKorean ? "경력 블록" : "Experience blocks"}</span>
                        <strong>{analysisQuery.data.experiences.length}</strong>
                      </article>
                      <article className="resume-analysis-workspace-surface__stat">
                        <span>{isKorean ? "방어 리스크" : "Defense risks"}</span>
                        <strong>{analysisQuery.data.risks.length}</strong>
                      </article>
                      <article className="resume-analysis-workspace-surface__stat">
                        <span>{isKorean ? "고위험 주장" : "High-risk claims"}</span>
                        <strong>{highRiskCount}</strong>
                      </article>
                    </div>
                  </div>
                  <div className="resume-analysis-workspace-surface__chips">
                    <span className="detail-chip">{activeResumeVersion.versionNumberLabel}</span>
                    <span className="detail-chip detail-chip--accent">{activeResumeVersion.parsingStatusLabel}</span>
                    <span className="detail-chip">{activeResumeVersion.extractionStatusLabel}</span>
                    <span className="detail-chip">{activeResumeVersion.fileNameLabel}</span>
                  </div>
                  <div className="resume-analysis-workspace-surface__guidance">
                    <article className="resume-analysis-workspace-surface__guidance-card">
                      <span>{isKorean ? "첫 읽기" : "First read"}</span>
                      <strong>{isKorean ? "구체적인 트레이드오프 질문에서 가장 먼저 무너질 가능성이 큰 주장부터 보세요." : "Start with the claim most likely to fail under concrete trade-off questions."}</strong>
                    </article>
                    <article className="resume-analysis-workspace-surface__guidance-card">
                      <span>{isKorean ? "수정 순서" : "Repair order"}</span>
                      <strong>{isKorean ? "다음 모의 세션을 돌리기 전에 얇은 source text를 먼저 보강하세요." : "Fix thin source text before running another mock session."}</strong>
                    </article>
                  </div>
                </section>
              );

              return (
                <div className={`resume-analysis-layout ${isDesktop ? "resume-analysis-layout--desktop" : "resume-analysis-layout--mobile"}`}>
                  <section className="resume-analysis-layout__workspace-summary">{workspaceSummary}</section>
                  <div className="resume-analysis-layout__main page-stack">
                    <section className="page-card resume-analysis-priority-card">
                      <div className="section-heading">
                        <div>
                          <p className="section-heading__eyebrow">{isKorean ? "우선 읽기" : "Priority read"}</p>
                          <h2 className="page-card__title">{isKorean ? "꼬리질문에서 가장 먼저 무너질 주장부터 시작하세요" : "Start with the claims most likely to fail under follow-up"}</h2>
                        </div>
                      </div>
                      <div className="resume-analysis-priority-card__signals">
                        <article className="resume-analysis-priority-card__signal">
                          <span>{isKorean ? "즉시 수정 대상" : "Immediate fix target"}</span>
                          <strong>
                            {analysisQuery.data.risks[0]
                              ? isKorean
                                ? `집중: ${analysisQuery.data.risks[0].title}`
                                : `Focus: ${analysisQuery.data.risks[0].title}`
                              : isKorean
                                ? "긴급한 주장 리스크가 없습니다"
                                : "No urgent claim risk detected"}
                          </strong>
                        </article>
                        <article className="resume-analysis-priority-card__signal">
                          <span>{isKorean ? "증빙 범위" : "Evidence coverage"}</span>
                          <strong>
                            {analysisQuery.data.experiences.length > 0
                              ? isKorean
                                ? `${analysisQuery.data.experiences.length}개의 경력 블록이 drill-down 준비 상태입니다`
                                : `${analysisQuery.data.experiences.length} experience blocks are ready for drill-down`
                              : isKorean
                                ? "아직 추출된 경력 블록이 없습니다"
                                : "No extracted experience blocks yet"}
                          </strong>
                        </article>
                      </div>
                      <div className="resume-analysis-priority-card__playbook">
                        <article className="resume-analysis-priority-card__playbook-step">
                          <span>{isKorean ? "1. 가장 약한 주장 선택" : "1. Pick the weakest claim"}</span>
                          <strong>
                            {analysisQuery.data.risks[0]
                              ? isKorean
                                ? `"${analysisQuery.data.risks[0].title}"를 하나의 구체적 사례로 방어할 수 있을 때까지 다시 다듬으세요`
                                : `Rework "${analysisQuery.data.risks[0].title}" until it can be defended with one concrete example`
                              : isKorean
                                ? "다음 모의 진행을 막는 긴급 주장 실패가 없습니다"
                                : "No urgent claim failure is blocking the next mock pass"}
                          </strong>
                        </article>
                        <article className="resume-analysis-priority-card__playbook-step">
                          <span>{isKorean ? "2. 증빙 추적" : "2. Trace the evidence"}</span>
                          <strong>{isKorean ? "보조 경력 블록에 지표, 제약, 의사결정이 포함되어 있는지 확인하세요." : "Make sure the supporting experience block contains metrics, constraints, and decisions."}</strong>
                        </article>
                      </div>
                    </section>
                    <ResumeRiskList risks={analysisQuery.data.risks} />
                    <ResumeExperienceList experiences={analysisQuery.data.experiences} />
                    <ResumeSkillsCard skills={analysisQuery.data.skills} />
                  </div>
                  <aside className="resume-analysis-layout__rail page-stack">
                    <ActiveResumeOverviewCard resumeList={effectiveResumeList} />
                    <section className="page-card section-panel section-panel--muted resume-analysis-guide">
                      <span className="page-card__label">{isKorean ? "방어 가이드" : "Defense guide"}</span>
                      <h2 className="page-card__title">{isKorean ? "이 분석을 면접 압박처럼 읽으세요" : "Read this analysis like interview pressure"}</h2>
                      <p className="page-card__body">
                        {isKorean
                          ? "강한 이력서 source of truth는 질문 트리가 더 깊어질수록 모든 강조된 주장이 구체적인 의사결정, 제약, 지표, 트레이드오프로 확장될 수 있는 상태입니다."
                          : "A strong resume source of truth is one where every highlighted claim can expand into concrete decisions, constraints, metrics, and trade-offs when the question tree keeps drilling deeper."}
                      </p>
                      <div className="resume-analysis-guide__signals">
                        <article className="resume-analysis-guide__signal">
                          <span>{isKorean ? "즉시 보강 대상" : "Immediate repair target"}</span>
                          <strong>
                            {analysisQuery.data.risks[0]
                              ? analysisQuery.data.risks[0].title
                              : isKorean
                                ? "현재 표시된 높은 우선순위 보강 대상이 없습니다"
                                : "No high-priority claim repair is currently flagged"}
                          </strong>
                        </article>
                        <article className="resume-analysis-guide__signal">
                          <span>{isKorean ? "다음 면접 전" : "Before next interview"}</span>
                          <strong>{isKorean ? "리스크가 있는 주장과 그 증빙 블록을 추가 설명 없이 읽히도록 만드세요." : "Make the risky claim and its evidence block readable without extra explanation."}</strong>
                        </article>
                      </div>
                      <div className="resume-analysis-guide__rules">
                        <div className="resume-analysis-guide__rule">
                          <strong>{isKorean ? "1. 모호한 주장부터 찾기" : "1. Find vague claims first"}</strong>
                          <span>{isKorean ? "리스크 항목은 보통 그럴듯해 보이지만 디테일에서 무너지는 주장을 가리킵니다." : "Risk items usually point to claims that sound impressive but collapse under detail."}</span>
                        </div>
                        <div className="resume-analysis-guide__rule">
                          <strong>{isKorean ? "2. 증빙 블록 확인" : "2. Check the evidence block"}</strong>
                          <span>{isKorean ? "경력과 파싱된 스킬은 그 주장이 어떻게 만들어졌는지 설명할 만큼 충분한 맥락을 드러내야 합니다." : "Experiences and parsed skills should expose enough context to explain how the claim happened."}</span>
                        </div>
                        <div className="resume-analysis-guide__rule">
                          <strong>{isKorean ? "3. 모의 전 보강" : "3. Repair before mock practice"}</strong>
                          <span>{isKorean ? "약한 입력으로 또 한 세션을 쓰기 전에 source text를 먼저 조이세요." : "Tighten the source text before spending another session on weak inputs."}</span>
                        </div>
                      </div>
                      <div className="page-card__actions">
                        <Link
                          className="secondary-button"
                          to={routeConfig.resumeEditor.buildPath({ versionId: activeResumeVersion.id })}
                        >
                          {isKorean ? "source of truth 편집" : "Edit source of truth"}
                        </Link>
                        <Link className="primary-button" to={routeConfig.resume.buildPath()}>
                          {isKorean ? "활성 이력서 검토" : "Review active resume"}
                        </Link>
                      </div>
                    </section>
                  </aside>
                </div>
              );
            })()
          ) : null}
        </div>
      ) : null}
    </PageContainer>
  );
}
