import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getResumeVersionChoices } from "../../entities/resume/model";
import { useCreateInterviewSessionMutation } from "../../features/interview/api/useCreateInterviewSessionMutation";
import { useInterviewSessionsQuery } from "../../features/interview/api/useInterviewSessionsQuery";
import { useLatestResumeQuery } from "../../features/resume/api/useLatestResumeQuery";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { WorkspaceContinuityRail } from "../../shared/ui/WorkspaceContinuityRail";
import { InterviewSessionHistoryList } from "../../widgets/interview";

type WorkspaceNode = {
  id: string;
  label: string;
  score: number;
  state: "mastered" | "strong" | "medium" | "weak";
  badge?: "Frequent" | "From Resume" | "Weak Area";
  lane: "root" | "focus" | "branch";
};

type WorkspaceInspectorModel = {
  title: string;
  score: number;
  concepts: string[];
  relatedExperience: string;
  weakness: string;
  relatedQuestions: Array<{ title: string; score: number }>;
  badge?: "Frequent" | "From Resume" | "Weak Area";
};

const WORKSPACE_COLUMNS: WorkspaceNode[][] = [
  [{ id: "backend", label: "Backend", score: 0, state: "strong", lane: "root" }],
  [
    { id: "java", label: "Java", score: 82, state: "mastered", lane: "branch" },
    { id: "database", label: "Database", score: 78, state: "strong", lane: "focus" },
    { id: "architecture", label: "Architecture", score: 74, state: "medium", lane: "branch" },
    { id: "system-design", label: "System Design", score: 65, state: "medium", lane: "branch" },
  ],
  [
    { id: "lock", label: "Lock", score: 64, state: "strong", lane: "branch" },
    { id: "index", label: "Index", score: 86, state: "mastered", lane: "branch" },
    { id: "transaction", label: "Transaction", score: 72, state: "strong", lane: "focus" },
    { id: "deadlock", label: "Deadlock", score: 58, state: "medium", lane: "branch" },
    { id: "distributed-tx", label: "Distributed TX", score: 63, state: "medium", lane: "branch" },
  ],
  [
    { id: "acid", label: "ACID", score: 88, state: "mastered", lane: "branch" },
    { id: "propagation", label: "Propagation", score: 75, state: "strong", lane: "branch" },
    { id: "isolation", label: "Isolation Level", score: 70, state: "strong", lane: "focus" },
    { id: "mvcc", label: "MVCC", score: 82, state: "strong", lane: "focus", badge: "Frequent" },
  ],
  [
    { id: "read-uncommitted", label: "Read Uncommitted", score: 52, state: "weak", lane: "branch" },
    { id: "read-committed", label: "Read Committed", score: 68, state: "medium", lane: "branch" },
    { id: "repeatable-read", label: "Repeatable Read", score: 74, state: "mastered", lane: "branch" },
    { id: "undo-log", label: "Undo Log", score: 72, state: "medium", lane: "branch" },
    { id: "snapshot-read", label: "Snapshot Read", score: 85, state: "mastered", lane: "branch" },
  ],
];

const WORKSPACE_INSPECTOR: Record<string, WorkspaceInspectorModel> = {
  backend: {
    title: "Backend",
    score: 78,
    concepts: ["System design", "Database", "Concurrency"],
    relatedExperience: "Dreamus Settlement System",
    weakness: "Coverage breadth",
    relatedQuestions: [
      { title: "What backend systems did you own end to end?", score: 80 },
      { title: "Which trade-offs mattered most in production?", score: 74 },
    ],
  },
  java: {
    title: "Java",
    score: 82,
    concepts: ["JVM", "Collections", "Concurrency"],
    relatedExperience: "Monticker API Runtime",
    weakness: "Runtime specificity",
    relatedQuestions: [
      { title: "How did you debug JVM memory pressure?", score: 83 },
      { title: "What Java trade-offs affected latency?", score: 79 },
    ],
    badge: "From Resume",
  },
  database: {
    title: "Database",
    score: 78,
    concepts: ["Index", "Transaction", "Query plan"],
    relatedExperience: "Dreamus Settlement System",
    weakness: "Branch depth",
    relatedQuestions: [
      { title: "How did index strategy affect your reporting query?", score: 76 },
      { title: "Which transaction boundary was hardest to defend?", score: 73 },
    ],
    badge: "From Resume",
  },
  architecture: {
    title: "Architecture",
    score: 74,
    concepts: ["Boundary", "Reliability", "Scale"],
    relatedExperience: "Creator Platform Services",
    weakness: "Decision rationale",
    relatedQuestions: [
      { title: "Why was the service split structured this way?", score: 71 },
      { title: "What architectural debt remained?", score: 69 },
    ],
  },
  "system-design": {
    title: "System Design",
    score: 65,
    concepts: ["Queue", "Cache", "Failure isolation"],
    relatedExperience: "Traffic Rollout Platform",
    weakness: "Trade-off clarity",
    relatedQuestions: [
      { title: "What failed first under growth?", score: 59 },
      { title: "Which bottleneck became visible in production?", score: 67 },
    ],
    badge: "Weak Area",
  },
  lock: {
    title: "Lock",
    score: 64,
    concepts: ["Pessimistic", "Optimistic", "Deadlock"],
    relatedExperience: "Settlement Batch Coordination",
    weakness: "Lock scope precision",
    relatedQuestions: [
      { title: "When was lock contention unavoidable?", score: 62 },
      { title: "How did you reduce wait time safely?", score: 65 },
    ],
  },
  index: {
    title: "Index",
    score: 86,
    concepts: ["Cardinality", "Covering", "Execution plan"],
    relatedExperience: "Reporting Query Tuning",
    weakness: "Edge-case recall",
    relatedQuestions: [
      { title: "What changed after adding the index?", score: 88 },
      { title: "Why was that index shape correct?", score: 82 },
    ],
  },
  transaction: {
    title: "Transaction",
    score: 72,
    concepts: ["Boundary", "Rollback", "Propagation"],
    relatedExperience: "Dreamus Settlement System",
    weakness: "Rollback narrative",
    relatedQuestions: [
      { title: "How did you decide the transaction boundary?", score: 70 },
      { title: "When did propagation choice matter?", score: 74 },
    ],
    badge: "From Resume",
  },
  deadlock: {
    title: "Deadlock",
    score: 58,
    concepts: ["Ordering", "Retry", "Timeout"],
    relatedExperience: "Batch Update Coordination",
    weakness: "Recovery detail",
    relatedQuestions: [
      { title: "How did you detect deadlock in production?", score: 54 },
      { title: "What retry policy was safe?", score: 61 },
    ],
    badge: "Weak Area",
  },
  "distributed-tx": {
    title: "Distributed TX",
    score: 63,
    concepts: ["Compensation", "Idempotency", "Saga"],
    relatedExperience: "Cross-service Payment Flow",
    weakness: "Compensation specifics",
    relatedQuestions: [
      { title: "Why not use a global transaction?", score: 60 },
      { title: "How did you design a safe rollback path?", score: 66 },
    ],
  },
  acid: {
    title: "ACID",
    score: 88,
    concepts: ["Atomicity", "Consistency", "Durability"],
    relatedExperience: "Data Integrity Controls",
    weakness: "Practical examples",
    relatedQuestions: [
      { title: "Which ACID property mattered most here?", score: 87 },
      { title: "How did your code rely on durability?", score: 85 },
    ],
  },
  propagation: {
    title: "Propagation",
    score: 75,
    concepts: ["REQUIRED", "REQUIRES_NEW", "Nested"],
    relatedExperience: "Admin Workflow Orchestration",
    weakness: "Nested edge cases",
    relatedQuestions: [
      { title: "Why not keep everything in one transaction?", score: 72 },
      { title: "When did REQUIRES_NEW become necessary?", score: 77 },
    ],
  },
  isolation: {
    title: "Isolation Level",
    score: 70,
    concepts: ["Dirty read", "Phantom read", "MVCC"],
    relatedExperience: "Dreamus Settlement System",
    weakness: "Phenomenon recall",
    relatedQuestions: [
      { title: "Which anomaly were you preventing?", score: 68 },
      { title: "Why was Repeatable Read not enough here?", score: 72 },
    ],
    badge: "From Resume",
  },
  mvcc: {
    title: "MVCC (Multi-Version Concurrency Control)",
    score: 82,
    concepts: ["Read View", "Version Chain", "Undo Log", "Snapshot"],
    relatedExperience: "Dreamus Settlement System",
    weakness: "Specificity",
    relatedQuestions: [
      { title: "MVCC가 필요한 이유는?", score: 78 },
      { title: "Read View는 어떻게 동작하나요?", score: 74 },
      { title: "Undo Log의 역할은?", score: 82 },
      { title: "Snapshot Read란?", score: 85 },
    ],
    badge: "Frequent",
  },
  "read-uncommitted": {
    title: "Read Uncommitted",
    score: 52,
    concepts: ["Dirty read", "Consistency risk"],
    relatedExperience: "Legacy Reporting Constraints",
    weakness: "Practical trade-offs",
    relatedQuestions: [
      { title: "왜 실무에서는 거의 쓰지 않나요?", score: 51 },
      { title: "어떤 위험이 바로 발생하나요?", score: 53 },
    ],
    badge: "Weak Area",
  },
  "read-committed": {
    title: "Read Committed",
    score: 68,
    concepts: ["Snapshot", "Statement scope"],
    relatedExperience: "Operational Query Safety",
    weakness: "Anomaly explanation",
    relatedQuestions: [
      { title: "Read Committed가 막지 못하는 것은?", score: 66 },
      { title: "왜 기본값으로 자주 선택되나요?", score: 70 },
    ],
  },
  "repeatable-read": {
    title: "Repeatable Read",
    score: 74,
    concepts: ["Read stability", "Phantom risk", "MVCC"],
    relatedExperience: "Settlement Reconciliation",
    weakness: "Lock interaction",
    relatedQuestions: [
      { title: "Phantom read와의 관계는?", score: 71 },
      { title: "MVCC와 함께 어떻게 설명하나요?", score: 76 },
    ],
  },
  "undo-log": {
    title: "Undo Log",
    score: 72,
    concepts: ["Version chain", "Rollback", "Snapshot"],
    relatedExperience: "Settlement Recovery Path",
    weakness: "Storage detail",
    relatedQuestions: [
      { title: "Undo Log가 version chain에 어떻게 연결되나요?", score: 70 },
      { title: "Rollback과 Snapshot에서 역할 차이는?", score: 73 },
    ],
  },
  "snapshot-read": {
    title: "Snapshot Read",
    score: 85,
    concepts: ["Read view", "Consistency snapshot", "MVCC"],
    relatedExperience: "Dreamus Settlement System",
    weakness: "Boundary explanation",
    relatedQuestions: [
      { title: "Current Read와 어떻게 구분하나요?", score: 84 },
      { title: "왜 성능과 일관성을 같이 얻을 수 있나요?", score: 86 },
    ],
    badge: "From Resume",
  },
};

export function InterviewPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const [questionCount, setQuestionCount] = useState(3);
  const [startFormOpen, setStartFormOpen] = useState(false);
  const [selectedResumeVersionId, setSelectedResumeVersionId] = useState<string | null>(null);
  const [selectedInterviewMode, setSelectedInterviewMode] = useState<
    "quick_screen" | "mock_30" | "mock_60" | "free_interview" | "full_coverage"
  >("mock_30");
  const [selectedGraphNodeId, setSelectedGraphNodeId] = useState("mvcc");
  const resumeListQuery = useResumeListQuery();
  const latestResumeQuery = useLatestResumeQuery();
  const sessionListQuery = useInterviewSessionsQuery();
  const createSessionMutation = useCreateInterviewSessionMutation();
  const interviewModeOptions = useMemo(
    () =>
      [
        {
          id: "quick_screen",
          label: t("interview.modeQuickScreen"),
          description: t("interview.modeQuickScreenDescription"),
        },
        {
          id: "mock_30",
          label: t("interview.modeMock30"),
          description: t("interview.modeMock30Description"),
        },
        {
          id: "mock_60",
          label: t("interview.modeMock60"),
          description: t("interview.modeMock60Description"),
        },
        {
          id: "free_interview",
          label: t("interview.modeFreeInterview"),
          description: t("interview.modeFreeInterviewDescription"),
        },
        {
          id: "full_coverage",
          label: t("interview.modeFullCoverage"),
          description: t("interview.modeFullCoverageDescription"),
        },
      ] as const,
    [t],
  );
  const effectiveResumeList = useMemo(() => {
    if (resumeListQuery.data && resumeListQuery.data.items.length > 0) {
      return resumeListQuery.data;
    }

    return latestResumeQuery.data;
  }, [latestResumeQuery.data, resumeListQuery.data]);
  const resumeVersionChoices = useMemo(
    () => getResumeVersionChoices(effectiveResumeList),
    [effectiveResumeList],
  );
  const selectedInterviewModeOption =
    interviewModeOptions.find((option) => option.id === selectedInterviewMode) ?? interviewModeOptions[1];
  const selectedResumeChoice =
    resumeVersionChoices.find((choice) => choice.versionId === selectedResumeVersionId) ?? null;
  const selectedInspector = WORKSPACE_INSPECTOR[selectedGraphNodeId] ?? WORKSPACE_INSPECTOR.mvcc;
  const completedSessionCount = sessionListQuery.data?.filter((item) => item.status === "completed").length ?? 0;
  const sessionCount = sessionListQuery.data?.length ?? 0;
  const selectedNodePosition = WORKSPACE_COLUMNS.findIndex((column) =>
    column.some((node) => node.id === selectedGraphNodeId),
  );
  const selectedNode =
    WORKSPACE_COLUMNS[selectedNodePosition]?.find((node) => node.id === selectedGraphNodeId) ?? null;
  const selectedLaneCount = selectedNodePosition >= 0 ? WORKSPACE_COLUMNS[selectedNodePosition].length : 0;
  const selectedResumeSummary = selectedResumeChoice
    ? `${selectedResumeChoice.resumeTitle} ${selectedResumeChoice.versionNumberLabel}`
    : t("interview.noResumeTitle");
  const launchSignal =
    resumeVersionChoices.length === 0
      ? "Resume required"
      : !startFormOpen
        ? "Open setup"
        : selectedInterviewMode === "full_coverage"
          ? "Coverage pass ready"
          : "Scoped branch ready";
  const nextBranchCandidates = selectedInspector.relatedQuestions.slice(0, 2);

  useEffect(() => {
    if (resumeVersionChoices.length === 0) {
      setSelectedResumeVersionId(null);
      return;
    }

    setSelectedResumeVersionId((current) => {
      if (current && resumeVersionChoices.some((choice) => choice.versionId === current)) {
        return current;
      }

      const activeChoice = resumeVersionChoices.find((choice) => choice.isActive);

      return activeChoice?.versionId ?? resumeVersionChoices[0]?.versionId ?? null;
    });
  }, [resumeVersionChoices]);

  async function handleStartSession() {
    if (!selectedResumeVersionId) {
      return;
    }

    const response = await createSessionMutation.mutateAsync({
      sessionType: "resume_mock",
      interviewMode: selectedInterviewMode,
      questionCount,
      resumeVersionId: selectedResumeVersionId,
    });

    if (response.id !== null && response.id !== undefined) {
      navigate(routeConfig.interviewSession.buildPath({ sessionId: String(response.id) }));
    }
  }

  return (
    <PageContainer
      description={t("interview.pageDescription")}
      eyebrow={t("interview.pageEyebrow")}
      introVariant="minimal"
      title={t("interview.pageTitle")}
    >
      {resumeListQuery.isLoading || latestResumeQuery.isLoading || sessionListQuery.isLoading ? (
        <LoadingStateCard body={t("interview.preparingBody")} title={t("interview.preparingTitle")} />
      ) : null}

      {resumeListQuery.isError && latestResumeQuery.isError ? (
        <ErrorStateCard
          body={resumeListQuery.error instanceof Error ? resumeListQuery.error.message : t("interview.loadResumeError")}
          details={getErrorDetails(resumeListQuery.error)}
          onAction={() => {
            void Promise.all([resumeListQuery.refetch(), latestResumeQuery.refetch()]);
          }}
          title={t("interview.loadResumeError")}
        />
      ) : null}

      {createSessionMutation.isError ? (
        <ErrorStateCard
          body={createSessionMutation.error instanceof Error ? createSessionMutation.error.message : t("interview.startSessionError")}
          details={getErrorDetails(createSessionMutation.error)}
          onAction={() => {
            createSessionMutation.reset();
          }}
          title={t("interview.startSessionError")}
        />
      ) : null}

      {sessionListQuery.isError ? (
        <ErrorStateCard
          body={sessionListQuery.error instanceof Error ? sessionListQuery.error.message : t("interview.loadSessionError")}
          details={getErrorDetails(sessionListQuery.error)}
          onAction={() => {
            void sessionListQuery.refetch();
          }}
          title={t("interview.loadSessionError")}
        />
      ) : null}

      {!(resumeListQuery.isLoading || latestResumeQuery.isLoading) &&
      !(resumeListQuery.isError && latestResumeQuery.isError) ? (
        <div className="interview-workspace-page">
          <WorkspaceContinuityRail
            current={{
              title: "Interview session launch",
              description: "Lock one resume version, choose one branch, and decide how broad this pass should be.",
            }}
            downstream={[
              {
                title: "Practice",
                description: "Return to question browsing if the next branch is still unclear.",
                to: routeConfig.practice.buildPath(),
              },
              {
                title: "Review queue",
                description: "Clear recovery work first when recent weak branches still block a new run.",
                to: routeConfig.reviewQueue.buildPath(),
              },
            ]}
            upstream={[
              {
                title: "Resume analysis",
                description: "Use the active source-of-truth review to decide which branch should be defended next.",
                to: routeConfig.resumeAnalysis.buildPath(),
              },
            ]}
          />
          <section className="page-card interview-workspace-surface">
            <div className="interview-workspace-surface__header">
              <div className="interview-workspace-surface__intro">
                <div className="interview-workspace-surface__eyebrow-row">
                  <span className="page-card__label">Interview workspace</span>
                </div>
                <h2 className="interview-workspace-surface__title">Choose one branch to defend</h2>
                <p className="interview-workspace-surface__body">
                  Lock one resume, keep one branch in focus, then start the next DFS pass.
                </p>
              </div>
              <div className="interview-workspace-surface__stats">
                <article className="interview-workspace-surface__stat">
                  <span>Resume boundary</span>
                  <strong>{selectedResumeSummary}</strong>
                </article>
                <article className="interview-workspace-surface__stat">
                  <span>Current pass</span>
                  <strong>{selectedInterviewModeOption.label}</strong>
                </article>
              </div>
            </div>
            <div className="interview-workspace-surface__summary-row">
              <span className="detail-chip detail-chip--accent">{launchSignal}</span>
              {selectedInterviewMode === "full_coverage" ? (
                <span className="detail-chip">{t("interview.coverageBadge")}</span>
              ) : null}
              <span className="detail-chip">{`History ${sessionCount}`}</span>
              <span className="detail-chip">{`${completedSessionCount} completed`}</span>
            </div>
            <div className="interview-workspace-surface__principles" role="list" aria-label="Launch principles">
              <span role="listitem">One resume version per run.</span>
              <span role="listitem">Pick scope first, then start.</span>
            </div>
            <div className="interview-workspace-surface__actions">
              <button
                className="primary-button"
                disabled={resumeVersionChoices.length === 0}
                onClick={() => setStartFormOpen(true)}
                type="button"
              >
                Open session setup
              </button>
              <button
                className="secondary-button"
                onClick={() => setSelectedGraphNodeId("read-uncommitted")}
                type="button"
              >
                Inspect weakest branch
              </button>
            </div>

            <div className="interview-workspace-surface__body">
              <div className="interview-graph-panel">
                <div className="interview-graph-panel__header">
                  <div>
                    <p className="section-heading__eyebrow">Focus lane</p>
                    <h3 className="page-card__title">Preview the active branch without noise</h3>
                    <p className="interview-graph-panel__description">
                      One branch stays in focus while adjacent follow-ups remain visible.
                    </p>
                  </div>
                  <div className="interview-graph-panel__toolbar">
                    <span className="detail-chip">Focused lane</span>
                    <button className="primary-button" type="button">DFS Focus</button>
                  </div>
                </div>
                <div className="interview-graph-panel__summary">
                  <article className="interview-graph-panel__summary-card interview-graph-panel__summary-card--active">
                    <span>Current branch</span>
                    <strong>{selectedInspector.title}</strong>
                  </article>
                  <article className="interview-graph-panel__summary-card">
                    <span>Depth</span>
                    <strong>{selectedNodePosition >= 0 ? `Level ${selectedNodePosition + 1}` : "Root"}</strong>
                  </article>
                  <article className="interview-graph-panel__summary-card">
                    <span>Readiness</span>
                    <strong>{selectedNode?.state === "weak" ? "Needs recovery" : selectedNode?.state === "medium" ? "Can narrow" : "Ready to defend"}</strong>
                  </article>
                </div>
                <div className="interview-graph-panel__canvas">
                  {WORKSPACE_COLUMNS.map((column, columnIndex) => (
                    <div className="interview-graph-panel__lane" key={`column-${columnIndex}`}>
                      {column.map((node) => {
                        const isSelected = node.id === selectedGraphNodeId;

                        return (
                          <button
                            className={`interview-graph-node interview-graph-node--${node.state}${
                              node.lane === "focus" ? " interview-graph-node--focus" : ""
                            }${isSelected ? " interview-graph-node--selected" : ""}`}
                            key={node.id}
                            onClick={() => setSelectedGraphNodeId(node.id)}
                            type="button"
                          >
                            <span className="interview-graph-node__label">{node.label}</span>
                            <span className="interview-graph-node__score">
                              {node.score > 0 ? `${node.score}%` : "Core"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <aside className="interview-workspace-inspector">
                <div className="interview-workspace-inspector__panel">
                  <div className="interview-workspace-inspector__eyebrow-row">
                    <span className="question-status-badge question-status-badge--neutral">Branch inspector</span>
                    {selectedInspector.badge ? (
                      <span className="question-status-badge question-status-badge--accent">{selectedInspector.badge}</span>
                    ) : null}
                  </div>
                  <h2 className="interview-workspace-inspector__title">{selectedInspector.title}</h2>
                  <div className="interview-workspace-inspector__metrics">
                    <article className="interview-workspace-inspector__metric">
                      <span>Mastery Score</span>
                      <strong>{selectedInspector.score}/100</strong>
                    </article>
                  </div>
                  <p className="interview-workspace-inspector__summary">{selectedInspector.weakness}</p>
                </div>

                <div className="interview-workspace-inspector__panel">
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">Branch anchor</p>
                      <h3 className="page-card__title">{selectedInspector.relatedExperience}</h3>
                    </div>
                  </div>
                  <p className="page-card__body">Tie the branch to one resume claim and one concrete detail.</p>
                  <div className="chip-list">
                    {selectedInspector.concepts.map((concept) => (
                      <span className="detail-chip" key={concept}>{concept}</span>
                    ))}
                  </div>
                </div>

                <div className="interview-workspace-inspector__panel">
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">Next branches</p>
                      <h3 className="page-card__title">Review only the next likely follow-ups</h3>
                    </div>
                  </div>
                  <div className="stack-list">
                    {nextBranchCandidates.map((question, index) => (
                      <article className="list-item-card interview-workspace-inspector__question" key={question.title}>
                        <div className={`interview-workspace-inspector__question-rail ${
                          index === 0 ? "interview-workspace-inspector__question-rail--strong" : ""
                        }`} aria-hidden="true" />
                        <div className="list-item-card__content">
                          <div className="list-item-card__meta">
                            <span>{index + 1}</span>
                            <span>{index === 0 ? "Strong" : "Open"}</span>
                          </div>
                          <h3 className="list-item-card__title">{question.title}</h3>
                        </div>
                        <span className="question-status-badge question-status-badge--positive">{question.score}</span>
                      </article>
                    ))}
                  </div>
                </div>
              </aside>
            </div>

            <section className="interview-workspace-deck__card interview-workspace-deck__card--history">
              <div className="section-heading">
                <div>
                  <p className="section-heading__eyebrow">Recent Sessions</p>
                  <h3 className="page-card__title">Re-open recent branches</h3>
                </div>
                <span className="section-heading__count">{sessionCount}</span>
              </div>
              {!sessionListQuery.isError && sessionListQuery.data ? (
                sessionListQuery.data.length > 0 ? (
                  <InterviewSessionHistoryList items={sessionListQuery.data} />
                ) : (
                  <EmptyStateCard
                    action={{ label: t("interview.startLabel"), to: routeConfig.interview.buildPath() }}
                    body={t("interview.emptyHistoryBody")}
                    title={t("interview.emptyHistoryTitle")}
                  />
                )
              ) : null}
            </section>
          </section>

          {resumeVersionChoices.length === 0 ? (
            <EmptyStateCard
              action={{ label: t("common.openResumes"), to: routeConfig.resume.buildPath() }}
              body={t("interview.noResumeBody")}
              title={t("interview.noResumeTitle")}
            />
          ) : null}

          {startFormOpen && resumeVersionChoices.length > 0 ? (
            <section className="page-card interview-launch-setup-surface">
              <div className="interview-launch-setup-surface__header">
                <div>
                  <span className="page-card__label">{t("interview.sessionSetupLabel")}</span>
                  <h2 className="page-card__title">{t("interview.sessionSetupTitle")}</h2>
                  <p className="page-card__body">Keep the boundary and launch rule in one place.</p>
                </div>
                <div className="interview-launch-setup-surface__summary">
                  <article className="interview-launch-setup-surface__summary-item">
                    <span>Resume boundary</span>
                    <strong>{selectedResumeChoice?.versionNumberLabel ?? t("interview.noResumeTitle")}</strong>
                  </article>
                  <article className="interview-launch-setup-surface__summary-item">
                    <span>Traversal mode</span>
                    <strong>{selectedInterviewModeOption.label}</strong>
                  </article>
                  <article className="interview-launch-setup-surface__summary-item">
                    <span>Launch signal</span>
                    <strong>{launchSignal}</strong>
                  </article>
                </div>
              </div>

              <div className="interview-launch-setup-surface__body">
                <section className="page-card page-card--inset">
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">{t("interview.resumeSelectionEyebrow")}</p>
                      <h3 className="page-card__title">{t("interview.chooseResumeTitle")}</h3>
                    </div>
                  </div>
                  <p className="page-card__body">Pick the one resume version that will anchor this run.</p>
                  <div className="stack-list">
                    {resumeVersionChoices.map((choice) => {
                      const isSelected = choice.versionId === selectedResumeVersionId;

                      return (
                        <button
                          aria-pressed={isSelected}
                          className={`list-item-card interview-resume-choice${isSelected ? " list-item-card--selected" : ""}`}
                          key={choice.versionId}
                          onClick={() => setSelectedResumeVersionId(choice.versionId)}
                          type="button"
                        >
                          <div className="list-item-card__content">
                            <div className="list-item-card__meta">
                              <span>{choice.resumeTitle}</span>
                              <span>{choice.versionNumberLabel}</span>
                              <span>{choice.uploadedAtLabel ?? t("interview.uploadedDateUnknown")}</span>
                              {choice.isActive ? (
                                <span className="question-status-badge question-status-badge--positive">{t("interview.active")}</span>
                              ) : null}
                            </div>
                            <h3 className="list-item-card__title">{choice.resumeTitle}</h3>
                            <p className="list-item-card__body">
                              {choice.versionNumberLabel}
                              {choice.parsingStatus ? ` / ${choice.parsingStatusLabel}` : ""}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="page-card page-card--inset">
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">Launch rule</p>
                      <h3 className="page-card__title">Choose the traversal first</h3>
                    </div>
                  </div>
                  <div className="interview-launch-setup-surface__playbook">
                    <article className="interview-launch-setup-surface__playbook-step">
                      <span>1. Lock the source</span>
                      <strong>One run, one source of truth.</strong>
                    </article>
                    <article className="interview-launch-setup-surface__playbook-step">
                      <span>2. Pick the traversal</span>
                      <strong>Use coverage mode only for a full DFS pass.</strong>
                    </article>
                  </div>
                  <div className="stack-list">
                    {interviewModeOptions.map((option) => {
                      const isSelected = option.id === selectedInterviewMode;

                      return (
                        <button
                          aria-pressed={isSelected}
                          className={`list-item-card interview-resume-choice${isSelected ? " list-item-card--selected" : ""}`}
                          key={option.id}
                          onClick={() => setSelectedInterviewMode(option.id)}
                          type="button"
                        >
                          <div className="list-item-card__content">
                            <div className="list-item-card__meta">
                              <span>{option.label}</span>
                              {option.id === "full_coverage" ? (
                                <span className="question-status-badge question-status-badge--accent">{t("interview.coverageBadge")}</span>
                              ) : null}
                            </div>
                            <h3 className="list-item-card__title">{option.label}</h3>
                            <p className="list-item-card__body">{option.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="page-card__actions">
                    <button
                      className={questionCount === 3 ? "primary-button" : "secondary-button"}
                      onClick={() => setQuestionCount(3)}
                      type="button"
                    >
                      3 questions
                    </button>
                    <button
                      className={questionCount === 5 ? "primary-button" : "secondary-button"}
                      onClick={() => setQuestionCount(5)}
                      type="button"
                    >
                      5 questions
                    </button>
                    <button
                      className="primary-button"
                      disabled={createSessionMutation.isPending || !selectedResumeVersionId}
                      onClick={() => {
                        void handleStartSession();
                      }}
                      type="button"
                    >
                      {createSessionMutation.isPending ? t("common.saving") : t("interview.confirmAndStart")}
                    </button>
                  </div>
                </section>
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </PageContainer>
  );
}
