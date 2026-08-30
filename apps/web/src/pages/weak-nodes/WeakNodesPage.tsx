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
    title: "Payment idempotency defense",
    dimension: "Correctness",
    severity: "critical",
    weakness:
      "The branch still explains the mechanism but not the failure envelope when duplicate settlement races survive the first safeguard.",
    graphRole: "Root remediation hub",
    confidence: 42,
    remediation: [
      "Restate the exact duplicate-settlement incident and where the first guard failed.",
      "Trace how idempotency keys, lock ownership, and retry backoff interact under concurrent retries.",
      "Show what remains imperfect after the fix so the answer does not sound absolute.",
    ],
    relatedQuestions: [
      {
        id: "distributed-lock",
        title: "How did you ensure idempotency in transaction processing?",
        label: "Question tree",
        to: routeConfig.questionTree.buildPath({ questionId: "distributed-lock" }),
      },
      {
        id: "distributed-lock-answer",
        title: "Tighten the payment correctness answer draft",
        label: "Answer editor",
        to: routeConfig.answerEditor.buildPath({ questionId: "distributed-lock" }),
      },
    ],
    resumeEvidence: [
      {
        title: "Settlement reliability improvement",
        detail: "Reopen the quantified resume claim and verify the exact duplicate reduction proof chain.",
        to: routeConfig.resumeAnalysis.buildPath(),
      },
      {
        title: "Interview heatmap anchor",
        detail: "Inspect where the summary claim still lacks defendable operational detail.",
        to: routeConfig.resumeHeatmap.buildPath({ versionId: "v4" }),
      },
    ],
    connectedNodes: ["Retry semantics", "Redis lock ownership", "Settlement rollback"],
  },
  {
    id: "kafka-rebalance",
    title: "Kafka rebalance operational story",
    dimension: "Operational depth",
    severity: "high",
    weakness:
      "The answer names rebalancing correctly but still sounds like platform theory rather than production pain and mitigation.",
    graphRole: "Failure-mode branch",
    confidence: 53,
    remediation: [
      "Start from one real lag or partition skew incident before naming the rebalance protocol.",
      "Explain what visibility you had, what was ambiguous, and which mitigation was fast enough under pressure.",
      "Connect the operational lesson back to consumer ownership and state handoff.",
    ],
    relatedQuestions: [
      {
        id: "kafka-rebalance",
        title: "Reopen the Kafka rebalance branch",
        label: "Question tree",
        to: routeConfig.questionTree.buildPath({ questionId: "kafka-rebalance" }),
      },
      {
        id: "kafka-rebalance-answer",
        title: "Draft a sharper operational answer",
        label: "Answer editor",
        to: routeConfig.answerEditor.buildPath({ questionId: "kafka-rebalance" }),
      },
    ],
    resumeEvidence: [
      {
        title: "Event processing modernization",
        detail:
          "Reconnect the branch to the experience bullet that actually involved consumer lag and replay decisions.",
        to: routeConfig.resume.buildPath(),
      },
    ],
    connectedNodes: ["Lag handling", "Replay boundaries", "Partition skew"],
  },
  {
    id: "resume-metrics-proof",
    title: "Resume metrics proof chain",
    dimension: "Source of truth",
    severity: "medium",
    weakness:
      "The branch uses strong numbers but the derivation path is still too compressed when the interviewer asks how the metric was produced.",
    graphRole: "Evidence bridge",
    confidence: 61,
    remediation: [
      "Break the metric into source data, aggregation rule, and business interpretation.",
      "Say what was directly measured versus estimated from adjacent operational signals.",
      "Link the metric to one follow-up branch where the same proof is likely to be attacked again.",
    ],
    relatedQuestions: [
      {
        id: "metrics-proof",
        title: "Inspect the metrics follow-up cluster",
        label: "Question detail",
        to: routeConfig.questionDetail.buildPath({ questionId: "metrics-proof" }),
      },
    ],
    resumeEvidence: [
      {
        title: "Resume analysis risk board",
        detail: "Check which metric-backed bullets still show a low defense score.",
        to: routeConfig.resumeAnalysis.buildPath(),
      },
      {
        title: "Source notes",
        detail: "Open supporting notes before rewriting the claim itself.",
        to: routeConfig.notes.buildPath(),
      },
    ],
    connectedNodes: ["Quantified impact", "Source notes", "Behavioral ownership"],
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
    "Payment idempotency defense": "결제 멱등성 방어",
    Correctness: "정확성",
    "Root remediation hub": "루트 보강 허브",
    "The branch still explains the mechanism but not the failure envelope when duplicate settlement races survive the first safeguard.":
      "이 가지는 메커니즘은 설명하지만, 첫 번째 안전장치를 뚫고 중복 정산 경쟁이 살아남을 때의 실패 범위를 아직 설명하지 못합니다.",
    "Restate the exact duplicate-settlement incident and where the first guard failed.":
      "정확히 어떤 중복 정산 사고였는지, 그리고 첫 번째 방어선이 어디서 실패했는지 다시 말하세요.",
    "Trace how idempotency keys, lock ownership, and retry backoff interact under concurrent retries.":
      "동시 재시도 상황에서 idempotency key, lock ownership, retry backoff가 어떻게 상호작용하는지 추적하세요.",
    "Show what remains imperfect after the fix so the answer does not sound absolute.":
      "수정 이후에도 무엇이 완벽하지 않은지 보여줘서 답변이 절대적으로 들리지 않게 하세요.",
    "How did you ensure idempotency in transaction processing?": "transaction 처리에서 idempotency를 어떻게 보장했나요?",
    "Question tree": "질문 트리",
    "Tighten the payment correctness answer draft": "결제 정확성 답변 초안 다듬기",
    "Answer editor": "답변 편집기",
    "Settlement reliability improvement": "정산 안정성 개선",
    "Reopen the quantified resume claim and verify the exact duplicate reduction proof chain.":
      "수치화된 이력서 주장으로 돌아가 중복 감소 근거 사슬을 정확히 검증하세요.",
    "Interview heatmap anchor": "인터뷰 히트맵 앵커",
    "Inspect where the summary claim still lacks defendable operational detail.":
      "요약 주장에 아직 방어 가능한 운영 디테일이 부족한 지점을 확인하세요.",
    "Retry semantics": "재시도 의미론",
    "Redis lock ownership": "Redis lock ownership",
    "Settlement rollback": "정산 롤백",
    "Kafka rebalance operational story": "Kafka 리밸런스 운영 스토리",
    "Operational depth": "운영 깊이",
    "Failure-mode branch": "실패 모드 가지",
    "The answer names rebalancing correctly but still sounds like platform theory rather than production pain and mitigation.":
      "답변이 리밸런싱 자체는 맞게 설명하지만, 여전히 실서비스의 고통과 대응보다 플랫폼 이론처럼 들립니다.",
    "Start from one real lag or partition skew incident before naming the rebalance protocol.":
      "리밸런스 프로토콜을 말하기 전에 실제 lag나 partition skew 사고 하나에서 시작하세요.",
    "Explain what visibility you had, what was ambiguous, and which mitigation was fast enough under pressure.":
      "어떤 가시성이 있었고 무엇이 모호했는지, 그리고 압박 속에서 어떤 완화책이 충분히 빨랐는지 설명하세요.",
    "Connect the operational lesson back to consumer ownership and state handoff.":
      "운영 교훈을 consumer ownership과 state handoff로 다시 연결하세요.",
    "Reopen the Kafka rebalance branch": "Kafka 리밸런스 가지 다시 열기",
    "Draft a sharper operational answer": "더 선명한 운영 답변 초안 만들기",
    "Event processing modernization": "이벤트 처리 현대화",
    "Reconnect the branch to the experience bullet that actually involved consumer lag and replay decisions.":
      "consumer lag와 replay 결정이 실제로 들어간 경력 bullet에 이 가지를 다시 연결하세요.",
    "Lag handling": "Lag 처리",
    "Replay boundaries": "Replay 경계",
    "Partition skew": "Partition skew",
    "Resume metrics proof chain": "이력서 지표 근거 사슬",
    "Source of truth": "기준 문서",
    "Evidence bridge": "근거 브리지",
    "The branch uses strong numbers but the derivation path is still too compressed when the interviewer asks how the metric was produced.":
      "이 가지는 강한 수치를 쓰지만, 면접관이 지표 산출 방식을 물으면 도출 경로가 여전히 너무 압축되어 있습니다.",
    "Break the metric into source data, aggregation rule, and business interpretation.":
      "지표를 원천 데이터, 집계 규칙, 비즈니스 해석으로 분해하세요.",
    "Say what was directly measured versus estimated from adjacent operational signals.":
      "직접 측정한 것과 인접 운영 시그널로 추정한 것을 구분해서 말하세요.",
    "Link the metric to one follow-up branch where the same proof is likely to be attacked again.":
      "같은 근거가 다시 공격받기 쉬운 꼬리질문 가지 하나와 지표를 연결하세요.",
    "Inspect the metrics follow-up cluster": "지표 꼬리질문 클러스터 보기",
    "Question detail": "질문 상세",
    "Resume analysis risk board": "이력서 분석 리스크 보드",
    "Check which metric-backed bullets still show a low defense score.":
      "지표 근거 bullet 중 어떤 항목이 여전히 낮은 방어 점수를 보이는지 확인하세요.",
    "Source notes": "근거 노트",
    "Open supporting notes before rewriting the claim itself.": "주장 자체를 다시 쓰기 전에 보조 노트를 먼저 여세요.",
    "Quantified impact": "정량 임팩트",
    "Behavioral ownership": "행동 책임감",
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
              {isKorean ? "약한 가지를 평평한 재시도 백로그가 아니라 연결된 노드로 보강하세요" : "Repair weak branches as connected nodes, not as a flat backlog of retries"}
            </h2>
            <p className="weak-nodes-workspace-surface__body">
              {isKorean
                ? "여기의 모든 약한 노드는 실패한 설명 하나를 그것이 속한 질문 가지와 의존하는 이력서 근거에 연결합니다. 큐가 무엇이 약한지는 알려주지만 어떻게 연결되어 약한지는 알려주지 않을 때 이 작업공간을 사용하세요."
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
