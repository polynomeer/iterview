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
import { MetricCard } from "../../shared/ui/MetricCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { SectionPanel } from "../../shared/ui/layout";
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
  const selectedResumeSummary = selectedResumeChoice
    ? `${selectedResumeChoice.resumeTitle} ${selectedResumeChoice.versionNumberLabel}`
    : t("interview.noResumeTitle");

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
          <section className="page-card interview-workspace-surface">
            <div className="interview-workspace-surface__header">
              <div className="interview-workspace-surface__intro">
                <div className="interview-workspace-surface__eyebrow-row">
                  <span className="page-card__label">Interview workspace</span>
                  <span className="question-status-badge question-status-badge--accent">Entry surface</span>
                </div>
                <p className="interview-workspace-surface__breadcrumbs">
                  Resume boundary
                  <span>/</span>
                  DFS branch focus
                  <span>/</span>
                  Session launch
                </p>
                <h2 className="interview-workspace-surface__title">Enter one defendable interview path</h2>
                <p className="interview-workspace-surface__body">
                  Start from a stable resume version, inspect the branch you are about to defend, and launch the session
                  only after the traversal mode is explicit.
                </p>
              </div>
              <div className="interview-workspace-surface__stats">
                <article className="interview-workspace-surface__stat">
                  <span>Resume versions</span>
                  <strong>{resumeVersionChoices.length}</strong>
                </article>
                <article className="interview-workspace-surface__stat">
                  <span>Active mode</span>
                  <strong>{selectedInterviewModeOption.label}</strong>
                </article>
                <article className="interview-workspace-surface__stat">
                  <span>Completed sessions</span>
                  <strong>{completedSessionCount}</strong>
                </article>
                <article className="interview-workspace-surface__stat">
                  <span>Seed count</span>
                  <strong>{questionCount}</strong>
                </article>
              </div>
            </div>
            <div className="interview-workspace-surface__chips">
              <span className="detail-chip">{selectedResumeSummary}</span>
              <span className="detail-chip detail-chip--accent">{selectedInspector.title}</span>
              {selectedInterviewMode === "full_coverage" ? (
                <span className="detail-chip">{t("interview.coverageBadge")}</span>
              ) : null}
              {sessionCount > 0 ? <span className="detail-chip">{`History ${sessionCount}`}</span> : null}
            </div>
            <div className="interview-workspace-surface__guidance">
              <article className="interview-workspace-surface__guidance-card">
                <span>Boundary</span>
                <strong>Lock one resume version before the session opens a new branch</strong>
              </article>
              <article className="interview-workspace-surface__guidance-card">
                <span>Traversal</span>
                <strong>Choose a mode that matches whether you want calibration or full DFS coverage</strong>
              </article>
              <article className="interview-workspace-surface__guidance-card">
                <span>Next move</span>
                <strong>Inspect the weak node first, then open setup only when the branch target is explicit</strong>
              </article>
            </div>

            <div className="interview-workspace-surface__body">
              <div className="interview-graph-panel">
                <div className="interview-graph-panel__header">
                  <div>
                    <p className="section-heading__eyebrow">Branch map</p>
                    <h3 className="page-card__title">Preview the branch before the session starts</h3>
                  </div>
                  <div className="interview-graph-panel__toolbar">
                    <button className="secondary-button" type="button">Map View</button>
                    <button className="primary-button" type="button">DFS Focus</button>
                    <button className="secondary-button" type="button">All Paths</button>
                  </div>
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
                    <article className="interview-workspace-inspector__metric">
                      <span>Last Attempt</span>
                      <strong>3 days ago</strong>
                    </article>
                    <article className="interview-workspace-inspector__metric">
                      <span>Best Score</span>
                      <strong>{selectedInspector.score}/100</strong>
                    </article>
                  </div>
                </div>

                <div className="interview-workspace-inspector__panel">
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">Key Concepts</p>
                      <h3 className="page-card__title">What this branch must defend</h3>
                    </div>
                  </div>
                  <div className="chip-list">
                    {selectedInspector.concepts.map((concept) => (
                      <span className="detail-chip" key={concept}>{concept}</span>
                    ))}
                  </div>
                </div>

                <div className="interview-workspace-inspector__panel">
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">Related To My Experience</p>
                      <h3 className="page-card__title">{selectedInspector.relatedExperience}</h3>
                    </div>
                  </div>
                  <p className="page-card__body">
                    Current weakness: {selectedInspector.weakness}. Anchor every answer to the exact resume claim and the operational detail that makes it defensible.
                  </p>
                </div>

                <div className="interview-workspace-inspector__panel">
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">Related Questions (DFS)</p>
                      <h3 className="page-card__title">Next branch candidates</h3>
                    </div>
                  </div>
                  <div className="stack-list">
                    {selectedInspector.relatedQuestions.map((question, index) => (
                      <article className="list-item-card interview-workspace-inspector__question" key={question.title}>
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

                <button
                  className="primary-button interview-workspace-inspector__cta"
                  onClick={() => setStartFormOpen(true)}
                  type="button"
                >
                  Open session setup
                </button>
              </aside>
            </div>

            <div className="interview-workspace-deck">
              <section className="interview-workspace-deck__card">
                <div className="section-heading">
                  <div>
                    <p className="section-heading__eyebrow">Today&apos;s Path</p>
                    <h3 className="page-card__title">Resume-grounded starting lanes</h3>
                  </div>
                  <span className="section-heading__count">3</span>
                </div>
                <div className="stack-list">
                  <article className="list-item-card">
                    <div className="list-item-card__content">
                      <h4 className="list-item-card__title">Transaction Isolation</h4>
                      <p className="list-item-card__body">Retry branch · Score 70</p>
                    </div>
                    <span className="question-status-badge question-status-badge--accent">Retry</span>
                  </article>
                  <article className="list-item-card">
                    <div className="list-item-card__content">
                      <h4 className="list-item-card__title">JVM Garbage Collection</h4>
                      <p className="list-item-card__body">New branch</p>
                    </div>
                    <span className="question-status-badge question-status-badge--neutral">New</span>
                  </article>
                  <article className="list-item-card">
                    <div className="list-item-card__content">
                      <h4 className="list-item-card__title">Redis Distributed Lock</h4>
                      <p className="list-item-card__body">Resume branch · Score 58</p>
                    </div>
                    <span className="question-status-badge question-status-badge--positive">Resume</span>
                  </article>
                </div>
              </section>

              <section className="interview-workspace-deck__card">
                <div className="section-heading">
                  <div>
                    <p className="section-heading__eyebrow">Weak Areas</p>
                    <h3 className="page-card__title">Nodes that still collapse under follow-ups</h3>
                  </div>
                </div>
                <div className="stack-list">
                  {[
                    ["Concurrency", 52],
                    ["JVM", 63],
                    ["Network", 65],
                    ["Kafka", 60],
                  ].map(([label, score]) => (
                    <article className="list-item-card interview-workspace-deck__metric-row" key={label}>
                      <span>{label}</span>
                      <div className="interview-workspace-deck__bar">
                        <span style={{ width: `${score}%` }} />
                      </div>
                      <strong>{score}</strong>
                    </article>
                  ))}
                </div>
              </section>

              <section className="interview-workspace-deck__card">
                <div className="section-heading">
                  <div>
                    <p className="section-heading__eyebrow">Upcoming Review</p>
                    <h3 className="page-card__title">Queued branches after this launch</h3>
                  </div>
                  <span className="section-heading__count">{completedSessionCount || 5}</span>
                </div>
                <div className="stack-list">
                  <article className="list-item-card">
                    <div className="list-item-card__content">
                      <h4 className="list-item-card__title">Thread Safety</h4>
                      <p className="list-item-card__body">Tomorrow</p>
                    </div>
                  </article>
                  <article className="list-item-card">
                    <div className="list-item-card__content">
                      <h4 className="list-item-card__title">TCP 3-Way Handshake</h4>
                      <p className="list-item-card__body">May 20</p>
                    </div>
                  </article>
                  <article className="list-item-card">
                    <div className="list-item-card__content">
                      <h4 className="list-item-card__title">Spring AOP</h4>
                      <p className="list-item-card__body">May 21</p>
                    </div>
                  </article>
                </div>
              </section>
            </div>
          </section>

          <div className="interview-page-layout">
            <section className="interview-page-layout__hero">
              <section className="page-card interview-page-layout__start">
                <span className="page-card__label">{t("interview.startLabel")}</span>
                <h2 className="page-card__title">{t("interview.startTitle")}</h2>
                <p className="page-card__body">{t("interview.startBody")}</p>
                <div className="stats-grid">
                  <MetricCard
                    helperText="Choose one stable context before starting."
                    label={t("interview.availableResumeVersions")}
                    value={String(resumeVersionChoices.length)}
                  />
                  <MetricCard
                    helperText="Keep the questioning mode explicit."
                    label={t("interview.interviewModeMetric")}
                    tone="accent"
                    value={selectedInterviewModeOption.label}
                  />
                  <MetricCard
                    helperText="Short runs work best for quick calibration."
                    label={t("interview.seedCount")}
                    tone="muted"
                    value={String(questionCount)}
                  />
                </div>
                <div className="interview-page-layout__start-summary">
                  <article className="interview-page-layout__start-summary-item">
                    <span>Selected boundary</span>
                    <strong>{selectedResumeChoice?.versionNumberLabel ?? t("interview.noResumeTitle")}</strong>
                  </article>
                  <article className="interview-page-layout__start-summary-item">
                    <span>Interview path</span>
                    <strong>{selectedInterviewModeOption.label}</strong>
                  </article>
                  <article className="interview-page-layout__start-summary-item">
                    <span>Immediate action</span>
                    <strong>{startFormOpen ? "Confirm the setup and launch" : "Open setup and verify the path"}</strong>
                  </article>
                </div>
                <div className="page-card__actions">
                  <button
                    className="primary-button"
                    disabled={resumeVersionChoices.length === 0}
                    onClick={() => setStartFormOpen((current) => !current)}
                    type="button"
                  >
                    {startFormOpen ? t("interview.hideStartForm") : t("interview.startInterview")}
                  </button>
                </div>
                {resumeVersionChoices.length === 0 ? (
                  <EmptyStateCard
                    action={{ label: t("common.openResumes"), to: routeConfig.resume.buildPath() }}
                    body={t("interview.noResumeBody")}
                    title={t("interview.noResumeTitle")}
                  />
                ) : null}
              </section>
              <div className="interview-page-layout__hero-side">
                <SectionPanel className="workspace-note-card workspace-note-card--accent" variant="muted">
                  <span className="page-card__label">Core objective</span>
                  <h2 className="page-card__title">Launch sessions as DFS review, not shallow prompt sampling</h2>
                  <p className="page-card__body">
                    Each session should expose the exact claim being tested, the follow-up branch that opened next, and whether your answer held up when the questioning drilled toward atomic facts.
                  </p>
                </SectionPanel>
                <section className="page-card interview-page-layout__snapshot">
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">Live setup</p>
                      <h2 className="page-card__title">Current interview boundary</h2>
                    </div>
                  </div>
                  <p className="interview-page-layout__snapshot-note">
                    This snapshot should answer three questions immediately: which resume version is active, which mode
                    will control the traversal, and how wide the first pass will be.
                  </p>
                  <div className="stack-list">
                    <article className="list-item-card">
                      <div className="list-item-card__content">
                        <div className="list-item-card__meta">
                          <span>Resume source</span>
                          {selectedResumeChoice?.isActive ? (
                            <span className="question-status-badge question-status-badge--positive">{t("interview.active")}</span>
                          ) : null}
                        </div>
                        <h3 className="list-item-card__title">
                          {selectedResumeChoice?.resumeTitle ?? t("interview.noResumeTitle")}
                        </h3>
                        <p className="list-item-card__body">
                          {selectedResumeChoice
                            ? `${selectedResumeChoice.versionNumberLabel} · ${selectedResumeChoice.parsingStatusLabel}`
                            : t("interview.noResumeBody")}
                        </p>
                      </div>
                    </article>
                    <article className="list-item-card">
                      <div className="list-item-card__content">
                        <div className="list-item-card__meta">
                          <span>Question traversal</span>
                          {selectedInterviewMode === "full_coverage" ? (
                            <span className="question-status-badge question-status-badge--accent">{t("interview.coverageBadge")}</span>
                          ) : null}
                        </div>
                        <h3 className="list-item-card__title">{selectedInterviewModeOption.label}</h3>
                        <p className="list-item-card__body">{selectedInterviewModeOption.description}</p>
                      </div>
                    </article>
                    <article className="list-item-card">
                      <div className="list-item-card__content">
                        <div className="list-item-card__meta">
                          <span>Pass shape</span>
                        </div>
                        <h3 className="list-item-card__title">{`${questionCount} seed questions`}</h3>
                        <p className="list-item-card__body">
                          Keep the starting surface constrained enough that each branch can actually be defended and revisited.
                        </p>
                      </div>
                    </article>
                  </div>
                </section>
              </div>
            </section>

            <div className="interview-page-layout__workspace">
              <div className="interview-page-layout__main">
                <section className="page-card interview-page-layout__history-brief">
                  <div className="interview-page-layout__history-brief-topline">
                    <div>
                      <p className="section-heading__eyebrow">Launch brief</p>
                      <h2 className="page-card__title">Start from the narrowest defendable context</h2>
                    </div>
                    <span className="question-status-badge question-status-badge--accent">Workspace entry</span>
                  </div>
                  <div className="interview-page-layout__history-brief-rules">
                    <article className="interview-page-layout__history-brief-rule">
                      <span>Before launch</span>
                      <strong>Verify the resume version and the exact branch you expect to defend</strong>
                    </article>
                    <article className="interview-page-layout__history-brief-rule">
                      <span>During DFS</span>
                      <strong>Let follow-up questions keep drilling until the claim reaches source-of-truth detail</strong>
                    </article>
                  </div>
                </section>
                {!sessionListQuery.isLoading && !sessionListQuery.isError && sessionListQuery.data ? (
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
                {startFormOpen && resumeVersionChoices.length > 0 ? (
                  <div className="page-stack interview-page-layout__setup">
                    <div className="page-card page-card--inset">
                      <div className="section-heading">
                        <div>
                          <p className="section-heading__eyebrow">{t("interview.resumeSelectionEyebrow")}</p>
                          <h3 className="page-card__title">{t("interview.chooseResumeTitle")}</h3>
                        </div>
                      </div>
                      <p className="interview-page-layout__setup-note">
                        Pick the single version you want to treat as source of truth for this run. Everything the
                        interviewer asks should be answerable from this boundary.
                      </p>
                      {selectedResumeChoice ? (
                        <div className="interview-page-layout__setup-summary">
                          <article className="interview-page-layout__setup-summary-item">
                            <span>Active version</span>
                            <strong>{selectedResumeChoice.versionNumberLabel}</strong>
                          </article>
                          <article className="interview-page-layout__setup-summary-item">
                            <span>Parsing state</span>
                            <strong>{selectedResumeChoice.parsingStatusLabel}</strong>
                          </article>
                        </div>
                      ) : null}
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
                    </div>
                    <section className="page-card page-card--inset">
                      <span className="page-card__label">{t("interview.sessionSetupLabel")}</span>
                      <h3 className="page-card__title">{t("interview.sessionSetupTitle")}</h3>
                      <p className="page-card__body">{t("interview.sessionSetupBody")}</p>
                      <div className="interview-page-layout__setup-summary">
                        <article className="interview-page-layout__setup-summary-item">
                          <span>Chosen mode</span>
                          <strong>{selectedInterviewModeOption.label}</strong>
                        </article>
                        <article className="interview-page-layout__setup-summary-item">
                          <span>Seed scope</span>
                          <strong>{`${questionCount} questions`}</strong>
                        </article>
                      </div>
                      <div className="interview-page-layout__setup-playbook">
                        <article className="interview-page-layout__setup-playbook-step">
                          <span>1. Lock the context</span>
                          <strong>Do not mix claims from different resume versions in one pass</strong>
                        </article>
                        <article className="interview-page-layout__setup-playbook-step">
                          <span>2. Choose the pass shape</span>
                          <strong>Use coverage mode only when you intend to traverse the full follow-up tree</strong>
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
                ) : null}
              </div>

              {resumeVersionChoices.length > 0 ? (
                <aside className="interview-page-layout__rail">
                  <SectionPanel className="workspace-note-card" variant="muted">
                    <span className="page-card__label">Source of truth</span>
                    <h2 className="page-card__title">Use one defendable resume version as the interview boundary</h2>
                    <p className="page-card__body">
                      This rail should make it obvious which version is active, which claims were parsed cleanly, and what evidence you will need to defend when the follow-up chain keeps drilling down.
                    </p>
                    <div className="interview-page-layout__rail-rules">
                      <article className="interview-page-layout__rail-rule">
                        <span>Boundary rule</span>
                        <strong>One session should map to one resume truth source</strong>
                      </article>
                      <article className="interview-page-layout__rail-rule">
                        <span>Answer rule</span>
                        <strong>Every claim should lead back to concrete project evidence or operational detail</strong>
                      </article>
                    </div>
                  </SectionPanel>
                  <SectionPanel className="workspace-note-card" variant="muted">
                    <span className="page-card__label">DFS review</span>
                    <h2 className="page-card__title">Walk every follow-up branch until the answer reaches atomic evidence</h2>
                    <p className="page-card__body">
                      Coverage mode is not just a longer mock. It is the mode for traversing the whole question tree, documenting weak branches, and tightening your source of truth before the real interview.
                    </p>
                    <div className="interview-page-layout__rail-rules">
                      <article className="interview-page-layout__rail-rule">
                        <span>Coverage mode</span>
                        <strong>Use it to finish the tree, not to collect a larger but shallower score</strong>
                      </article>
                      <article className="interview-page-layout__rail-rule">
                        <span>Weak branch cue</span>
                        <strong>Carry failed follow-ups forward into the next session until they become stable</strong>
                      </article>
                    </div>
                  </SectionPanel>
                  <section className="page-card">
                    <div className="section-heading">
                      <div>
                        <p className="section-heading__eyebrow">{t("interview.resumeContextEyebrow")}</p>
                        <h2 className="page-card__title">{t("interview.groundingVersionsTitle")}</h2>
                      </div>
                    </div>
                    <div className="stack-list">
                      {resumeVersionChoices.slice(0, 5).map((choice) => (
                        <article className="list-item-card" key={choice.versionId}>
                          <div className="list-item-card__content">
                            <div className="list-item-card__meta">
                              <span>{choice.resumeTitle}</span>
                              <span>{choice.versionNumberLabel}</span>
                              {choice.uploadedAtLabel ? <span>{choice.uploadedAtLabel}</span> : null}
                              {choice.isActive ? (
                                <span className="question-status-badge question-status-badge--positive">{t("interview.active")}</span>
                              ) : null}
                            </div>
                            <h3 className="list-item-card__title">{choice.resumeTitle}</h3>
                            <p className="list-item-card__body">{choice.parsingStatusLabel}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                </aside>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}
