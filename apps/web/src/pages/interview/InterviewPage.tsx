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
  badge?: string;
  lane: "root" | "focus" | "branch";
};

type WorkspaceInspectorModel = {
  title: string;
  score: number;
  concepts: string[];
  relatedExperience: string;
  weakness: string;
  relatedQuestions: Array<{ title: string; score: number }>;
  badge?: string;
};

function localizeInterviewWorkspaceText(value: string, isKorean: boolean) {
  if (!isKorean) {
    return value;
  }

  const dictionary: Record<string, string> = {
    Backend: "백엔드",
    Java: "자바",
    Database: "데이터베이스",
    Architecture: "아키텍처",
    "System Design": "시스템 설계",
    Lock: "락",
    Index: "인덱스",
    Transaction: "트랜잭션",
    Deadlock: "데드락",
    "Distributed TX": "분산 트랜잭션",
    Propagation: "전파",
    "Isolation Level": "격리 수준",
    "Read Uncommitted": "읽기 미확정",
    "Read Committed": "읽기 확정",
    "Repeatable Read": "반복 가능 읽기",
    "Undo Log": "언두 로그",
    "Snapshot Read": "스냅샷 읽기",
    "MVCC (Multi-Version Concurrency Control)": "MVCC(다중 버전 동시성 제어)",
    "System design": "시스템 설계",
    Concurrency: "동시성",
    Queue: "큐",
    Cache: "캐시",
    Reliability: "신뢰성",
    Scale: "확장성",
    Boundary: "경계",
    "Failure isolation": "장애 격리",
    Pessimistic: "비관적 락",
    Optimistic: "낙관적 락",
    Cardinality: "카디널리티",
    Covering: "커버링",
    "Execution plan": "실행 계획",
    Rollback: "롤백",
    Compensation: "보상 처리",
    Idempotency: "멱등성",
    Saga: "사가",
    Atomicity: "원자성",
    Consistency: "일관성",
    Durability: "지속성",
    "Dirty read": "더티 리드",
    "Phantom read": "팬텀 리드",
    Snapshot: "스냅샷",
    "Read View": "리드 뷰",
    "Version Chain": "버전 체인",
    "Consistency snapshot": "일관성 스냅샷",
    "Statement scope": "문장 범위",
    "Read stability": "읽기 안정성",
    "Phantom risk": "팬텀 위험",
    "Version chain": "버전 체인",
    "Consistency risk": "일관성 위험",
    Frequent: "자주 등장",
    "From Resume": "이력서 기반",
    "Weak Area": "약한 영역",
    "Dreamus Settlement System": "드림어스 정산 시스템",
    "Monticker API Runtime": "Monticker API 런타임",
    "Creator Platform Services": "크리에이터 플랫폼 서비스",
    "Traffic Rollout Platform": "트래픽 롤아웃 플랫폼",
    "Settlement Batch Coordination": "정산 배치 조율",
    "Reporting Query Tuning": "리포팅 쿼리 튜닝",
    "Batch Update Coordination": "배치 업데이트 조율",
    "Cross-service Payment Flow": "서비스 간 결제 흐름",
    "Data Integrity Controls": "데이터 무결성 제어",
    "Admin Workflow Orchestration": "관리 작업 흐름 조율",
    "Legacy Reporting Constraints": "레거시 리포팅 제약",
    "Operational Query Safety": "운영 쿼리 안정성",
    "Settlement Reconciliation": "정산 대사 처리",
    "Settlement Recovery Path": "정산 복구 경로",
    "Coverage breadth": "범위 폭",
    "Runtime specificity": "런타임 구체성",
    "Branch depth": "가지 깊이",
    "Decision rationale": "의사결정 근거",
    "Trade-off clarity": "트레이드오프 선명도",
    "Lock scope precision": "락 범위 정밀도",
    "Edge-case recall": "예외 상황 회상력",
    "Rollback narrative": "롤백 설명력",
    "Recovery detail": "복구 세부 설명",
    "Compensation specifics": "보상 처리 구체성",
    "Practical examples": "실무 예시",
    "Nested edge cases": "중첩 예외 상황",
    "Phenomenon recall": "현상 회상력",
    Specificity: "구체성",
    "Practical trade-offs": "실무 트레이드오프",
    "Anomaly explanation": "이상 현상 설명",
    "Lock interaction": "락 상호작용",
    "Storage detail": "저장소 세부 설명",
    "Boundary explanation": "경계 설명",
    "What backend systems did you own end to end?": "처음부터 끝까지 직접 맡아 운영한 백엔드 시스템은 무엇이었나요?",
    "Which trade-offs mattered most in production?": "운영 환경에서 가장 중요했던 트레이드오프는 무엇이었나요?",
    "How did you debug JVM memory pressure?": "JVM 메모리 압박은 어떻게 디버깅했나요?",
    "What Java trade-offs affected latency?": "지연 시간에 영향을 준 자바 트레이드오프는 무엇이었나요?",
    "How did index strategy affect your reporting query?": "인덱스 전략이 리포팅 쿼리에 어떤 영향을 줬나요?",
    "Which transaction boundary was hardest to defend?": "가장 방어하기 어려웠던 트랜잭션 경계는 무엇이었나요?",
    "Why was the service split structured this way?": "서비스 분리를 왜 이런 구조로 설계했나요?",
    "What architectural debt remained?": "남아 있던 아키텍처 부채는 무엇이었나요?",
    "What failed first under growth?": "트래픽이 커졌을 때 가장 먼저 무너진 것은 무엇이었나요?",
    "Which bottleneck became visible in production?": "운영에서 드러난 병목은 무엇이었나요?",
    "When was lock contention unavoidable?": "락 경합이 불가피했던 순간은 언제였나요?",
    "How did you reduce wait time safely?": "대기 시간을 어떻게 안전하게 줄였나요?",
    "What changed after adding the index?": "인덱스를 추가한 뒤 무엇이 달라졌나요?",
    "Why was that index shape correct?": "그 인덱스 구조가 왜 맞았나요?",
    "How did you decide the transaction boundary?": "트랜잭션 경계는 어떻게 결정했나요?",
    "When did propagation choice matter?": "전파 옵션 선택이 중요했던 순간은 언제였나요?",
    "How did you detect deadlock in production?": "운영 환경에서 데드락을 어떻게 감지했나요?",
    "What retry policy was safe?": "어떤 재시도 정책이 안전했나요?",
    "Why not use a global transaction?": "왜 전역 트랜잭션을 쓰지 않았나요?",
    "How did you design a safe rollback path?": "안전한 롤백 경로는 어떻게 설계했나요?",
    "Which ACID property mattered most here?": "이 상황에서 가장 중요했던 ACID 속성은 무엇이었나요?",
    "How did your code rely on durability?": "코드가 지속성에 어떻게 의존했나요?",
    "Why not keep everything in one transaction?": "왜 모든 작업을 하나의 트랜잭션으로 묶지 않았나요?",
    "When did REQUIRES_NEW become necessary?": "REQUIRES_NEW가 꼭 필요했던 순간은 언제였나요?",
    "Which anomaly were you preventing?": "어떤 이상 현상을 막으려 했나요?",
    "Why was Repeatable Read not enough here?": "왜 여기서는 Repeatable Read만으로 충분하지 않았나요?",
  };

  return dictionary[value] ?? value;
}

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
  const { locale, t } = useLocale();
  const isKorean = locale === "ko";
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
      ? isKorean
        ? "이력서 필요"
        : "Resume required"
      : !startFormOpen
        ? isKorean
          ? "설정 열기"
          : "Open setup"
        : selectedInterviewMode === "full_coverage"
          ? isKorean
            ? "범위 패스 준비 완료"
            : "Coverage pass ready"
          : isKorean
            ? "범위 지정 가지 준비 완료"
            : "Scoped branch ready";
  const nextBranchCandidates = selectedInspector.relatedQuestions.slice(0, 2);
  const selectedDepthLabel = selectedNodePosition >= 0
    ? isKorean
      ? `레벨 ${selectedNodePosition + 1}`
      : `Level ${selectedNodePosition + 1}`
    : isKorean
      ? "루트"
      : "Root";
  const selectedReadinessLabel =
    selectedNode?.state === "weak"
      ? isKorean
        ? "복구 필요"
        : "Needs recovery"
      : selectedNode?.state === "medium"
        ? isKorean
          ? "더 좁힐 수 있음"
          : "Can narrow"
        : isKorean
          ? "방어 준비 완료"
          : "Ready to defend";
  const selectedQuestionCountLabel = isKorean ? `${questionCount}개 질문` : `${questionCount} questions`;

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
            title: isKorean ? "인터뷰 세션 시작" : "Interview session launch",
            description: isKorean ? "하나의 이력서를 고정하고, 하나의 가지를 선택한 뒤 패스를 시작하세요." : "Lock one resume, choose one branch, and start the pass.",
          }}
          downstream={[
            {
              title: isKorean ? "연습" : "Practice",
              description: isKorean ? "가지가 아직 불명확하면 질문 탐색으로 돌아가세요." : "Return to question browsing if the branch is still unclear.",
              to: routeConfig.practice.buildPath(),
            },
            {
              title: isKorean ? "복습 큐" : "Review queue",
              description: isKorean ? "약한 가지가 새 실행을 막는다면 복구 작업부터 처리하세요." : "Clear recovery work first when weak branches block a new run.",
              to: routeConfig.reviewQueue.buildPath(),
            },
          ]}
          upstream={[
            {
              title: isKorean ? "이력서 분석" : "Resume analysis",
              description: isKorean ? "활성 기준 문서 검토를 기준으로 다음 가지를 결정하세요." : "Use the active source-of-truth review to decide the next branch.",
              to: routeConfig.resumeAnalysis.buildPath(),
            },
          ]}
        />
          <section className="page-card interview-workspace-surface">
            <div className="interview-workspace-surface__header">
              <div className="interview-workspace-surface__intro">
                <div className="interview-workspace-surface__eyebrow-row">
                  <span className="page-card__label">{isKorean ? "인터뷰 작업공간" : "Interview workspace"}</span>
                </div>
                <h2 className="interview-workspace-surface__title">
                  {isKorean ? "방어할 가지를 하나 선택하세요" : "Choose one branch to defend"}
                </h2>
                <p className="interview-workspace-surface__body">
                  {isKorean
                    ? "하나의 이력서를 고정하고, 하나의 가지에 집중한 뒤 다음 DFS 패스를 시작하세요."
                    : "Lock one resume, keep one branch in focus, then start the next DFS pass."}
                </p>
              </div>
            </div>
            <div
              className="interview-workspace-surface__summary-row"
              role="list"
              aria-label={isKorean ? "실행 요약" : "Launch summary"}
            >
              <span className="interview-workspace-surface__summary-item" role="listitem">{selectedResumeSummary}</span>
              <span className="interview-workspace-surface__summary-item" role="listitem">{selectedInterviewModeOption.label}</span>
              <span className="interview-workspace-surface__summary-item interview-workspace-surface__summary-item--accent">
                {launchSignal}
              </span>
              {selectedInterviewMode === "full_coverage" ? (
                <span className="interview-workspace-surface__summary-item" role="listitem">{t("interview.coverageBadge")}</span>
              ) : null}
              <span className="interview-workspace-surface__summary-item" role="listitem">
                {isKorean ? `기록 ${sessionCount}` : `History ${sessionCount}`}
              </span>
              <span className="interview-workspace-surface__summary-item" role="listitem">
                {isKorean ? `${completedSessionCount}개 완료` : `${completedSessionCount} completed`}
              </span>
            </div>
            <div
              className="interview-workspace-surface__principles"
              role="list"
              aria-label={isKorean ? "실행 원칙" : "Launch principles"}
            >
              <span role="listitem">{isKorean ? "한 번의 실행에는 하나의 이력서 버전만 사용합니다." : "One resume version per run."}</span>
              <span role="listitem">{isKorean ? "먼저 범위를 정한 뒤 시작하세요." : "Pick scope first, then start."}</span>
            </div>
            <div className="interview-workspace-surface__actions">
              <button
                className="primary-button interview-workspace-surface__action interview-workspace-surface__action--primary"
                disabled={resumeVersionChoices.length === 0}
                onClick={() => setStartFormOpen(true)}
                type="button"
              >
                {isKorean ? "세션 설정 열기" : "Open session setup"}
              </button>
              <button
                className="secondary-button interview-workspace-surface__action interview-workspace-surface__action--secondary"
                onClick={() => setSelectedGraphNodeId("read-uncommitted")}
                type="button"
              >
                {isKorean ? "가장 약한 가지 점검" : "Inspect weakest branch"}
              </button>
            </div>

            <div className="interview-workspace-surface__body">
              <div className="interview-graph-panel">
                <div className="interview-graph-panel__header">
                  <div>
                    <p className="section-heading__eyebrow">{isKorean ? "집중 레인" : "Focus lane"}</p>
                    <h3 className="page-card__title">
                      {isKorean ? "노이즈 없이 활성 가지를 미리 봅니다" : "Preview the active branch without noise"}
                    </h3>
                    <p className="interview-graph-panel__description">
                      {isKorean
                        ? "인접한 꼬리질문은 보이되, 하나의 가지만 중심에 둡니다."
                        : "One branch stays in focus while adjacent follow-ups remain visible."}
                    </p>
                  </div>
                  <div className="interview-graph-panel__toolbar">
                    <span className="detail-chip">{selectedDepthLabel}</span>
                    <span className="detail-chip detail-chip--accent">{isKorean ? "DFS 집중" : "DFS focus"}</span>
                  </div>
                </div>
                <div
                  className="interview-graph-panel__summary-row"
                  role="list"
                  aria-label={isKorean ? "집중 레인 신호" : "Focus lane signals"}
                >
                  <span className="interview-graph-panel__summary-item interview-graph-panel__summary-item--accent" role="listitem">
                    {localizeInterviewWorkspaceText(selectedInspector.title, isKorean)}
                  </span>
                  <span className="interview-graph-panel__summary-item" role="listitem">{selectedReadinessLabel}</span>
                  <span className="interview-graph-panel__summary-item" role="listitem">
                    {isKorean ? `구간 내 노드 ${selectedLaneCount}개` : `${selectedLaneCount} nodes in lane`}
                  </span>
                </div>
                <div
                  className="interview-graph-panel__principles"
                  role="list"
                  aria-label={isKorean ? "집중 레인 원칙" : "Focus lane principles"}
                >
                  <span role="listitem">
                    {isKorean
                      ? "하나의 가지에 집중하고 주변 꼬리질문은 보조로 두세요."
                      : "Keep one branch in focus and let nearby follow-ups stay secondary."}
                  </span>
                  <span role="listitem">
                    {isKorean
                      ? "패스를 다시 시작하기 전에 점검 패널로 정확한 이력서 주장을 확인하세요."
                      : "Use the inspector to confirm the exact resume claim before restarting the pass."}
                  </span>
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
                            <span className="interview-graph-node__label">
                              {localizeInterviewWorkspaceText(node.label, isKorean)}
                            </span>
                            <span className="interview-graph-node__score">
                              {node.score > 0 ? `${node.score}%` : isKorean ? "핵심" : "Core"}
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
                    <span className="question-status-badge question-status-badge--neutral">
                      {isKorean ? "가지 점검" : "Branch inspector"}
                    </span>
                    {selectedInspector.badge ? (
                      <span className="question-status-badge question-status-badge--accent">
                        {localizeInterviewWorkspaceText(selectedInspector.badge, isKorean)}
                      </span>
                    ) : null}
                  </div>
                  <h2 className="interview-workspace-inspector__title">
                    {localizeInterviewWorkspaceText(selectedInspector.title, isKorean)}
                  </h2>
                  <div
                    className="interview-workspace-inspector__summary-row"
                    role="list"
                    aria-label={isKorean ? "가지 신호" : "Branch signals"}
                  >
                    <span className="interview-workspace-inspector__summary-item interview-workspace-inspector__summary-item--accent" role="listitem">
                      {isKorean ? `${selectedInspector.score}/100 숙련도` : `${selectedInspector.score}/100 mastery`}
                    </span>
                    <span className="interview-workspace-inspector__summary-item" role="listitem">{selectedReadinessLabel}</span>
                    <span className="interview-workspace-inspector__summary-item" role="listitem">
                      {localizeInterviewWorkspaceText(selectedInspector.relatedExperience, isKorean)}
                    </span>
                  </div>
                  <p className="interview-workspace-inspector__summary">
                    {localizeInterviewWorkspaceText(selectedInspector.weakness, isKorean)}
                  </p>
                  <div
                    className="interview-workspace-inspector__principles"
                    role="list"
                    aria-label={isKorean ? "가지 인스펙터 원칙" : "Branch inspector principles"}
                  >
                    <span role="listitem">
                      {isKorean
                        ? "이 가지를 하나의 이력서 주장과 하나의 구체적인 디테일에 연결하세요."
                        : "Tie this branch to one resume claim and one concrete detail."}
                    </span>
                    <span role="listitem">
                      {isKorean
                        ? "다음으로 나올 가능성이 높은 꼬리질문으로 답변이 실제로 안정적인지 판단하세요."
                        : "Use the next likely follow-ups to decide whether the answer is actually stable."}
                    </span>
                  </div>
                </div>

                <div className="interview-workspace-inspector__panel">
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">{isKorean ? "가지 앵커" : "Branch anchor"}</p>
                      <h3 className="page-card__title interview-workspace-inspector__section-title">
                        {localizeInterviewWorkspaceText(selectedInspector.relatedExperience, isKorean)}
                      </h3>
                    </div>
                  </div>
                  <p className="page-card__body interview-workspace-inspector__section-body">
                    {isKorean
                      ? "이 가지를 하나의 이력서 주장과 하나의 구체적인 디테일에 연결하세요."
                      : "Tie the branch to one resume claim and one concrete detail."}
                  </p>
                  <div className="chip-list">
                    {selectedInspector.concepts.map((concept) => (
                      <span className="detail-chip" key={concept}>
                        {localizeInterviewWorkspaceText(concept, isKorean)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="interview-workspace-inspector__panel">
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">{isKorean ? "다음 가지" : "Next branches"}</p>
                      <h3 className="page-card__title interview-workspace-inspector__section-title">
                        {isKorean ? "가능성이 높은 다음 꼬리질문만 검토하세요" : "Review only the next likely follow-ups"}
                      </h3>
                    </div>
                  </div>
                  <div className="stack-list">
                    {nextBranchCandidates.map((question, index) => (
                      <article className="list-item-card interview-workspace-inspector__question" key={question.title}>
                        <div className={`interview-workspace-inspector__question-rail ${
                          index === 0 ? "interview-workspace-inspector__question-rail--strong" : ""
                        }`} aria-hidden="true" />
                        <div className="list-item-card__content">
                          <div className="list-item-card__meta interview-workspace-inspector__question-meta">
                            <span>{index + 1}</span>
                            <span>{index === 0 ? (isKorean ? "강함" : "Strong") : isKorean ? "열림" : "Open"}</span>
                          </div>
                          <h3 className="list-item-card__title">
                            {localizeInterviewWorkspaceText(question.title, isKorean)}
                          </h3>
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
                  <p className="section-heading__eyebrow">{isKorean ? "최근 세션" : "Recent Sessions"}</p>
                  <h3 className="page-card__title">{isKorean ? "최근 가지 다시 열기" : "Re-open recent branches"}</h3>
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
                  <p className="page-card__body">
                    {isKorean ? "하나의 기준 근거를 고정하고, 하나의 순회 방식을 선택한 뒤 다음 패스를 실행하세요." : "Lock one source, choose one traversal, then launch the next pass."}
                  </p>
                </div>
                <div
                  className="interview-launch-setup-surface__signals"
                  role="list"
                  aria-label={isKorean ? "세션 설정 신호" : "Session setup signals"}
                >
                  <span className="interview-launch-setup-surface__signal" role="listitem">{selectedResumeChoice?.versionNumberLabel ?? t("interview.noResumeTitle")}</span>
                  <span className="interview-launch-setup-surface__signal" role="listitem">{selectedInterviewModeOption.label}</span>
                  <span className="interview-launch-setup-surface__signal" role="listitem">{selectedQuestionCountLabel}</span>
                  <span className="interview-launch-setup-surface__signal interview-launch-setup-surface__signal--accent" role="listitem">{launchSignal}</span>
                </div>
              </div>

              <div className="interview-launch-setup-surface__body">
                <section className="page-card page-card--inset interview-launch-step">
                  <div className="section-heading">
                    <div>
                      <p className="interview-launch-step__eyebrow">{isKorean ? "1단계" : "Step 1"}</p>
                      <h3 className="page-card__title">{t("interview.chooseResumeTitle")}</h3>
                    </div>
                  </div>
                  <p className="page-card__body">
                    {isKorean ? "이 패스의 기준이 될 이력서 버전을 하나 선택하세요." : "Pick the single resume version that will anchor this pass."}
                  </p>
                  <div className="interview-launch-step__selected">
                    <span>{isKorean ? "현재 경계" : "Active boundary"}</span>
                    <strong>{selectedResumeSummary}</strong>
                  </div>
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

                <section className="page-card page-card--inset interview-launch-step">
                  <div className="section-heading">
                    <div>
                      <p className="interview-launch-step__eyebrow">{isKorean ? "2단계" : "Step 2"}</p>
                      <h3 className="page-card__title">{isKorean ? "먼저 순회 방식을 선택하세요" : "Choose the traversal first"}</h3>
                    </div>
                  </div>
                  <p className="page-card__body">
                    {isKorean ? "다음 실행이 전체 DFS 트리를 훑어야 할 때만 범위 모드를 사용하세요." : "Use coverage mode only when the next run should sweep the full DFS tree."}
                  </p>
                  <div className="interview-launch-step__selected">
                    <span>{isKorean ? "현재 실행 규칙" : "Current launch rule"}</span>
                    <strong>{isKorean ? "한 번의 실행, 하나의 기준 문서." : "One run, one source of truth."}</strong>
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
                  <div className="interview-launch-step__footer">
                    <div
                      className="interview-launch-step__question-count"
                      role="group"
                      aria-label={isKorean ? "질문 수" : "Question count"}
                    >
                      <button
                        className={questionCount === 3 ? "primary-button" : "secondary-button"}
                        onClick={() => setQuestionCount(3)}
                        type="button"
                      >
                        {isKorean ? "질문 3개" : "3 questions"}
                      </button>
                      <button
                        className={questionCount === 5 ? "primary-button" : "secondary-button"}
                        onClick={() => setQuestionCount(5)}
                        type="button"
                      >
                        {isKorean ? "질문 5개" : "5 questions"}
                      </button>
                    </div>
                    <button
                      className="primary-button interview-launch-step__submit"
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
