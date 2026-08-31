import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { useLayoutMode } from "../../shared/ui/layout";
import { PageContainer } from "../../shared/ui/PageContainer";
import { WorkspaceContinuityRail } from "../../shared/ui/WorkspaceContinuityRail";

type WeakNode = {
  id: string;
  title: string;
  dimension: string;
  severity: "critical" | "high" | "medium";
  weakness: string;
  graphRole: string;
  confidence: number;
  remediation: string[];
  relatedQuestions: Array<{
    id: string;
    title: string;
    label: string;
    to: string;
  }>;
  resumeEvidence: Array<{
    title: string;
    detail: string;
    to: string;
  }>;
  connectedNodes: string[];
};

const WEAK_NODES: WeakNode[] = [
  {
    id: "payments-idempotency",
    title: "결제 idempotency 방어",
    dimension: "정확성",
    severity: "critical",
    weakness:
      "이 가지는 메커니즘은 설명하지만, 첫 번째 안전장치를 뚫고 중복 정산 경쟁이 살아남을 때의 실패 범위를 아직 설명하지 못합니다.",
    graphRole: "루트 보강 허브",
    confidence: 42,
    remediation: [
      "정확히 어떤 중복 정산 사고였는지, 그리고 첫 번째 방어선이 어디서 실패했는지 다시 말하세요.",
      "동시 재시도 상황에서 idempotency key, lock ownership, retry backoff가 어떻게 상호작용하는지 추적하세요.",
      "수정 이후에도 무엇이 완벽하지 않은지 보여줘서 답변이 절대적으로 들리지 않게 하세요.",
    ],
    relatedQuestions: [
      {
        id: "distributed-lock",
        title: "transaction 처리에서 idempotency를 어떻게 보장했나요?",
        label: "질문 트리",
        to: routeConfig.questionTree.buildPath({ questionId: "distributed-lock" }),
      },
      {
        id: "distributed-lock-answer",
        title: "결제 정확성 답변 초안 다듬기",
        label: "답변 편집기",
        to: routeConfig.answerEditor.buildPath({ questionId: "distributed-lock" }),
      },
    ],
    resumeEvidence: [
      {
        title: "정산 안정성 개선",
        detail: "수치화된 이력서 주장으로 돌아가 중복 감소 근거 사슬을 정확히 검증하세요.",
        to: routeConfig.resumeAnalysis.buildPath(),
      },
      {
        title: "인터뷰 히트맵 앵커",
        detail: "요약 주장에 아직 방어 가능한 운영 디테일이 부족한 지점을 확인하세요.",
        to: routeConfig.resumeHeatmap.buildPath({ versionId: "v4" }),
      },
    ],
    connectedNodes: ["재시도 의미론", "Redis lock ownership", "정산 롤백"],
  },
  {
    id: "kafka-rebalance",
    title: "Kafka 리밸런스 운영 스토리",
    dimension: "운영 깊이",
    severity: "high",
    weakness:
      "답변이 리밸런싱 자체는 맞게 설명하지만, 여전히 실서비스의 고통과 대응보다 플랫폼 이론처럼 들립니다.",
    graphRole: "실패 모드 가지",
    confidence: 53,
    remediation: [
      "리밸런스 프로토콜을 말하기 전에 실제 lag나 partition skew 사고 하나에서 시작하세요.",
      "어떤 가시성이 있었고 무엇이 모호했는지, 그리고 압박 속에서 어떤 완화책이 충분히 빨랐는지 설명하세요.",
      "운영 교훈을 consumer ownership과 state handoff로 다시 연결하세요.",
    ],
    relatedQuestions: [
      {
        id: "kafka-rebalance",
        title: "Kafka 리밸런스 가지 다시 열기",
        label: "질문 트리",
        to: routeConfig.questionTree.buildPath({ questionId: "kafka-rebalance" }),
      },
      {
        id: "kafka-rebalance-answer",
        title: "더 선명한 운영 답변 초안 만들기",
        label: "답변 편집기",
        to: routeConfig.answerEditor.buildPath({ questionId: "kafka-rebalance" }),
      },
    ],
    resumeEvidence: [
      {
        title: "이벤트 처리 현대화",
        detail: "consumer lag와 replay 결정이 실제로 들어간 경력 bullet에 이 가지를 다시 연결하세요.",
        to: routeConfig.resume.buildPath(),
      },
    ],
    connectedNodes: ["Lag 처리", "Replay 경계", "Partition skew"],
  },
  {
    id: "resume-metrics-proof",
    title: "이력서 지표 근거 사슬",
    dimension: "기준 문서",
    severity: "medium",
    weakness:
      "이 가지는 강한 수치를 쓰지만, 면접관이 지표 산출 방식을 물으면 도출 경로가 여전히 너무 압축되어 있습니다.",
    graphRole: "근거 브리지",
    confidence: 61,
    remediation: [
      "지표를 원천 데이터, 집계 규칙, 비즈니스 해석으로 분해하세요.",
      "직접 측정한 것과 인접 운영 시그널로 추정한 것을 구분해서 말하세요.",
      "같은 근거가 다시 공격받기 쉬운 꼬리질문 가지 하나와 지표를 연결하세요.",
    ],
    relatedQuestions: [
      {
        id: "metrics-proof",
        title: "지표 꼬리질문 클러스터 보기",
        label: "질문 상세",
        to: routeConfig.questionDetail.buildPath({ questionId: "metrics-proof" }),
      },
    ],
    resumeEvidence: [
      {
        title: "이력서 분석 리스크 보드",
        detail: "지표 근거 bullet 중 어떤 항목이 여전히 낮은 방어 점수를 보이는지 확인하세요.",
        to: routeConfig.resumeAnalysis.buildPath(),
      },
      {
        title: "근거 노트",
        detail: "주장 자체를 다시 쓰기 전에 보조 노트를 먼저 여세요.",
        to: routeConfig.notes.buildPath(),
      },
    ],
    connectedNodes: ["정량 임팩트", "근거 노트", "행동 책임감"],
  },
];

function getSeverityLabel(severity: WeakNode["severity"]) {
  switch (severity) {
    case "critical":
      return "Critical";
    case "high":
      return "High";
    case "medium":
      return "Medium";
  }
}

function localizeWeakNodeText(value: string, isKorean: boolean) {
  if (!isKorean) {
    return value;
  }

  const translations: Record<string, string> = {
    Critical: "치명",
    High: "높음",
    Medium: "중간",
    "Payment idempotency defense": "결제 idempotency 방어",
  };

  return translations[value] ?? value;
}

export function WeakNodesPage() {
  const { isDesktop } = useLayoutMode();
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const [selectedNodeId, setSelectedNodeId] = useState(WEAK_NODES[0]?.id ?? "");
  const [severityFilter, setSeverityFilter] = useState<WeakNode["severity"] | "all">("all");

  const visibleNodes = useMemo(
    () => WEAK_NODES.filter((node) => severityFilter === "all" || node.severity === severityFilter),
    [severityFilter],
  );

  const selectedNode =
    visibleNodes.find((node) => node.id === selectedNodeId) ??
    WEAK_NODES.find((node) => node.id === selectedNodeId) ??
    visibleNodes[0] ??
    WEAK_NODES[0];

  const criticalCount = WEAK_NODES.filter((node) => node.severity === "critical").length;
  const averageConfidence = Math.round(
    WEAK_NODES.reduce((sum, node) => sum + node.confidence, 0) / WEAK_NODES.length,
  );

  return (
    <PageContainer
      actions={
        <>
          <Link className="secondary-button" to={routeConfig.reviewQueue.buildPath()}>
            {isKorean ? "복습 큐 열기" : "Open review queue"}
          </Link>
          <Link className="secondary-button" to={routeConfig.scheduledReviews.buildPath()}>
            {isKorean ? "예약 복습 열기" : "Open scheduled reviews"}
          </Link>
        </>
      }
      description={isKorean
        ? "가장 약한 가지를 연결된 그래프 노드로 확인해서, 구조 없는 재시도 목록이 아니라 실패한 관계에서부터 보강을 시작하세요."
        : "Inspect the weakest branches as connected graph nodes so remediation starts from the failing relationship, not from an unstructured retry list."}
      eyebrow={isKorean ? "복구 그래프" : "Recovery graph"}
      title={isKorean ? "약한 노드 보강 작업공간" : "Weak node remediation workspace"}
    >
      <WorkspaceContinuityRail
        current={{
          title: isKorean ? "약한 가지 보강" : "Weak branch remediation",
          description: isKorean ? "약한 설명, 질문 가지, 근거 사이에서 실패한 관계를 추적하세요." : "Trace the failing relationship between a weak explanation, its question branch, and its evidence.",
        }}
        downstream={[
          {
            title: isKorean ? "이력서 분석" : "Resume analysis",
            description: isKorean ? "약한 가지가 빈약한 주장을 드러내면 기준 문서 검토로 돌아가세요." : "Return to source-of-truth review when the weak branch exposes a thin claim.",
            to: routeConfig.resumeAnalysis.buildPath(),
          },
          {
            title: isKorean ? "노트" : "Notes",
            description: isKorean ? "압박 상황에서 가지를 다시 열기 전에 보강한 설명을 기록하세요." : "Capture the repaired explanation before reopening the branch under pressure.",
            to: routeConfig.notes.buildPath(),
          },
        ]}
        upstream={[
          {
            title: isKorean ? "복습 큐" : "Review queue",
            description: isKorean ? "큐가 구조적 보강이 필요한 재시도를 식별한 뒤 이 화면을 사용하세요." : "Use this surface after the queue identifies a retry that needs structural remediation.",
            to: routeConfig.reviewQueue.buildPath(),
          },
        ]}
      />
      <section className="page-card weak-nodes-workspace-surface">
        <div className="weak-nodes-workspace-surface__header">
          <div className="weak-nodes-workspace-surface__intro">
            <div className="weak-nodes-workspace-surface__eyebrow-row">
              <span className="page-card__label">{isKorean ? "그래프 보강" : "Graph remediation"}</span>
              <span className="question-status-badge question-status-badge--accent">{isKorean ? "약한 가지 집중" : "Weak branch focus"}</span>
            </div>
            <h2 className="weak-nodes-workspace-surface__title">
              {isKorean ? "약한 가지를 연결 관계로 보강하세요" : "Repair weak branches through their connections"}
            </h2>
            <p className="weak-nodes-workspace-surface__body">
              {isKorean
                ? "질문, 설명, 이력서 근거 사이에서 어디가 먼저 무너지는지 보고 보강 순서를 정하세요."
                : "Every weak node here links one failing explanation to the question branch it lives in and the resume evidence it depends on. Use this workspace when the queue tells you something is weak but not how the weakness connects."}
            </p>
          </div>
          <div className="weak-nodes-workspace-surface__stats">
            <article>
              <span>{isKorean ? "보이는 노드" : "Visible nodes"}</span>
              <strong>{visibleNodes.length}</strong>
            </article>
            <article>
              <span>{isKorean ? "치명 노드" : "Critical nodes"}</span>
              <strong>{criticalCount}</strong>
            </article>
            <article>
              <span>{isKorean ? "평균 신뢰도" : "Average confidence"}</span>
              <strong>{averageConfidence}%</strong>
            </article>
          </div>
        </div>
        <div className="weak-nodes-workspace-surface__guidance">
          <article className="weak-nodes-workspace-surface__guidance-card">
            <span>{isKorean ? "보강 원칙" : "Remediation rule"}</span>
            <strong>{isKorean ? "질문, 근거, 설명 깊이 중 가장 먼저 실패하는 관계부터 고치세요." : "Repair the relationship that fails first: question, evidence, or explanation depth."}</strong>
          </article>
          <article className="weak-nodes-workspace-surface__guidance-card">
            <span>{isKorean ? "이탈 원칙" : "Exit rule"}</span>
            <strong>{isKorean ? "노드의 기준 문서 경로가 전보다 더 선명해진 뒤에만 큐로 돌아가세요." : "Return to the queue only after the node has a clearer source-of-truth path than before."}</strong>
          </article>
        </div>
      </section>

      <div className={`weak-nodes-layout ${isDesktop ? "weak-nodes-layout--desktop" : ""}`}>
        <main className="page-stack">
          <section className="page-card weak-nodes-graph-panel">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="section-heading__eyebrow">{isKorean ? "약한 그래프" : "Weak graph"}</p>
                <h2 className="page-card__title">{isKorean ? "지금 관계가 무너지고 있는 노드를 선택하세요" : "Select the node whose relationship is currently collapsing"}</h2>
              </div>
              <label className="weak-nodes-graph-panel__filter">
                <span>{isKorean ? "심각도" : "Severity"}</span>
                <select
                  aria-label={isKorean ? "심각도로 약한 노드 필터링" : "Filter weak nodes by severity"}
                  className="form-field__input"
                  onChange={(event) => {
                    setSeverityFilter(event.target.value as WeakNode["severity"] | "all");
                  }}
                  value={severityFilter}
                >
                  <option value="all">{isKorean ? "전체" : "All"}</option>
                  <option value="critical">{isKorean ? "치명" : "Critical"}</option>
                  <option value="high">{isKorean ? "높음" : "High"}</option>
                  <option value="medium">{isKorean ? "중간" : "Medium"}</option>
                </select>
              </label>
            </div>
            <div className="weak-nodes-graph-panel__canvas">
              {visibleNodes.map((node) => (
                <button
                  className={`weak-node-card weak-node-card--${node.severity}${node.id === selectedNode?.id ? " weak-node-card--active" : ""}`}
                  key={node.id}
                  onClick={() => {
                    setSelectedNodeId(node.id);
                  }}
                  type="button"
                >
                  <div className="weak-node-card__topline">
                    <span className="detail-chip">{isKorean ? localizeWeakNodeText(getSeverityLabel(node.severity), true) : getSeverityLabel(node.severity)}</span>
                    <span>{localizeWeakNodeText(node.dimension, isKorean)}</span>
                  </div>
                  <strong>{localizeWeakNodeText(node.title, isKorean)}</strong>
                  <p>{localizeWeakNodeText(node.graphRole, isKorean)}</p>
                  <div className="weak-node-card__connections">
                    {node.connectedNodes.map((connectedNode) => (
                      <span className="detail-chip" key={connectedNode}>
                        {localizeWeakNodeText(connectedNode, isKorean)}
                      </span>
                    ))}
                  </div>
                  <div className="weak-node-card__confidence">
                    <span>{isKorean ? "신뢰도" : "Confidence"}</span>
                    <strong>{node.confidence}%</strong>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {selectedNode ? (
            <section className="page-card weak-nodes-remediation-panel">
              <div className="section-heading section-heading--compact">
                <div>
                  <p className="section-heading__eyebrow">{isKorean ? "선택된 노드" : "Selected node"}</p>
                  <h2 className="page-card__title">{localizeWeakNodeText(selectedNode.title, isKorean)}</h2>
                  <p className="page-card__body">{localizeWeakNodeText(selectedNode.weakness, isKorean)}</p>
                </div>
                <span
                  className={`detail-chip${selectedNode.severity === "critical" ? " detail-chip--danger" : selectedNode.severity === "high" ? " detail-chip--accent" : ""}`}
                >
                  {isKorean ? localizeWeakNodeText(getSeverityLabel(selectedNode.severity), true) : getSeverityLabel(selectedNode.severity)}
                </span>
              </div>
              <div className="weak-nodes-remediation-panel__steps">
                {selectedNode.remediation.map((step, index) => (
                  <article className="weak-nodes-remediation-step" key={step}>
                    <span>{`0${index + 1}`}</span>
                    <strong>{localizeWeakNodeText(step, isKorean)}</strong>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </main>

        {selectedNode ? (
          <aside className="page-stack weak-nodes-layout__rail">
            <section className="page-card weak-nodes-detail-rail">
              <div className="section-heading section-heading--compact">
                <div>
                  <p className="section-heading__eyebrow">{isKorean ? "연결된 질문" : "Connected questions"}</p>
                  <h2 className="page-card__title">{isKorean ? "이 노드가 걸쳐 있는 질문 가지를 다시 여세요" : "Reopen the question branches this node lives under"}</h2>
                </div>
              </div>
              <div className="weak-nodes-detail-rail__list">
                {selectedNode.relatedQuestions.map((question) => (
                  <Link className="weak-nodes-detail-card" key={question.id} to={question.to}>
                    <span>{localizeWeakNodeText(question.label, isKorean)}</span>
                    <strong>{localizeWeakNodeText(question.title, isKorean)}</strong>
                  </Link>
                ))}
              </div>
            </section>

            <section className="page-card weak-nodes-detail-rail">
              <div className="section-heading section-heading--compact">
                <div>
                  <p className="section-heading__eyebrow">{isKorean ? "이력서 근거" : "Resume evidence"}</p>
                  <h2 className="page-card__title">{isKorean ? "이 노드가 의존하는 기준 문서 자료를 다시 여세요" : "Reopen the source-of-truth material this node depends on"}</h2>
                </div>
              </div>
              <div className="weak-nodes-detail-rail__list">
                {selectedNode.resumeEvidence.map((evidence) => (
                  <Link className="weak-nodes-detail-card" key={evidence.title} to={evidence.to}>
                    <span>{isKorean ? "근거" : "Evidence"}</span>
                    <strong>{localizeWeakNodeText(evidence.title, isKorean)}</strong>
                    <p>{localizeWeakNodeText(evidence.detail, isKorean)}</p>
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        ) : null}
      </div>
    </PageContainer>
  );
}

export default WeakNodesPage;
