import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { useLayoutMode } from "../../shared/ui/layout";
import { PageContainer } from "../../shared/ui/PageContainer";

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

export function WeakNodesPage() {
  const { isDesktop } = useLayoutMode();
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
            Open review queue
          </Link>
          <Link className="secondary-button" to={routeConfig.scheduledReviews.buildPath()}>
            Open scheduled reviews
          </Link>
        </>
      }
      description="Inspect the weakest branches as connected graph nodes so remediation starts from the failing relationship, not from an unstructured retry list."
      eyebrow="Weak Nodes"
      title="Weak node remediation workspace"
    >
      <section className="page-card weak-nodes-workspace-surface">
        <div className="weak-nodes-workspace-surface__header">
          <div className="weak-nodes-workspace-surface__intro">
            <div className="weak-nodes-workspace-surface__eyebrow-row">
              <span className="page-card__label">Graph remediation</span>
              <span className="question-status-badge question-status-badge--accent">Weak branch focus</span>
            </div>
            <h2 className="weak-nodes-workspace-surface__title">
              Repair weak branches as connected nodes, not as a flat backlog of retries
            </h2>
            <p className="weak-nodes-workspace-surface__body">
              Every weak node here links one failing explanation to the question branch it lives in and the resume
              evidence it depends on. Use this workspace when the queue tells you something is weak but not how the
              weakness connects.
            </p>
          </div>
          <div className="weak-nodes-workspace-surface__stats">
            <article>
              <span>Visible nodes</span>
              <strong>{visibleNodes.length}</strong>
            </article>
            <article>
              <span>Critical nodes</span>
              <strong>{criticalCount}</strong>
            </article>
            <article>
              <span>Average confidence</span>
              <strong>{averageConfidence}%</strong>
            </article>
          </div>
        </div>
        <div className="weak-nodes-workspace-surface__guidance">
          <article className="weak-nodes-workspace-surface__guidance-card">
            <span>Remediation rule</span>
            <strong>Repair the relationship that fails first: question, evidence, or explanation depth.</strong>
          </article>
          <article className="weak-nodes-workspace-surface__guidance-card">
            <span>Exit rule</span>
            <strong>Return to the queue only after the node has a clearer source-of-truth path than before.</strong>
          </article>
        </div>
      </section>

      <div className={`weak-nodes-layout ${isDesktop ? "weak-nodes-layout--desktop" : ""}`}>
        <main className="page-stack">
          <section className="page-card weak-nodes-graph-panel">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="section-heading__eyebrow">Weak graph</p>
                <h2 className="page-card__title">Select the node whose relationship is currently collapsing</h2>
              </div>
              <label className="weak-nodes-graph-panel__filter">
                <span>Severity</span>
                <select
                  aria-label="Filter weak nodes by severity"
                  className="form-field__input"
                  onChange={(event) => {
                    setSeverityFilter(event.target.value as WeakNode["severity"] | "all");
                  }}
                  value={severityFilter}
                >
                  <option value="all">All</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
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
                    <span className="detail-chip">{getSeverityLabel(node.severity)}</span>
                    <span>{node.dimension}</span>
                  </div>
                  <strong>{node.title}</strong>
                  <p>{node.graphRole}</p>
                  <div className="weak-node-card__connections">
                    {node.connectedNodes.map((connectedNode) => (
                      <span className="detail-chip" key={connectedNode}>
                        {connectedNode}
                      </span>
                    ))}
                  </div>
                  <div className="weak-node-card__confidence">
                    <span>Confidence</span>
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
                  <p className="section-heading__eyebrow">Selected node</p>
                  <h2 className="page-card__title">{selectedNode.title}</h2>
                  <p className="page-card__body">{selectedNode.weakness}</p>
                </div>
                <span
                  className={`detail-chip${selectedNode.severity === "critical" ? " detail-chip--danger" : selectedNode.severity === "high" ? " detail-chip--accent" : ""}`}
                >
                  {getSeverityLabel(selectedNode.severity)}
                </span>
              </div>
              <div className="weak-nodes-remediation-panel__steps">
                {selectedNode.remediation.map((step, index) => (
                  <article className="weak-nodes-remediation-step" key={step}>
                    <span>{`0${index + 1}`}</span>
                    <strong>{step}</strong>
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
                  <p className="section-heading__eyebrow">Connected questions</p>
                  <h2 className="page-card__title">Reopen the question branches this node lives under</h2>
                </div>
              </div>
              <div className="weak-nodes-detail-rail__list">
                {selectedNode.relatedQuestions.map((question) => (
                  <Link className="weak-nodes-detail-card" key={question.id} to={question.to}>
                    <span>{question.label}</span>
                    <strong>{question.title}</strong>
                  </Link>
                ))}
              </div>
            </section>

            <section className="page-card weak-nodes-detail-rail">
              <div className="section-heading section-heading--compact">
                <div>
                  <p className="section-heading__eyebrow">Resume evidence</p>
                  <h2 className="page-card__title">Reopen the source-of-truth material this node depends on</h2>
                </div>
              </div>
              <div className="weak-nodes-detail-rail__list">
                {selectedNode.resumeEvidence.map((evidence) => (
                  <Link className="weak-nodes-detail-card" key={evidence.title} to={evidence.to}>
                    <span>Evidence</span>
                    <strong>{evidence.title}</strong>
                    <p>{evidence.detail}</p>
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
