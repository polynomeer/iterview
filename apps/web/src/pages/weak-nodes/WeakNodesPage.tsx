import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { useLayoutMode } from "../../shared/ui/layout";
import { FeedbackNotice } from "../../shared/ui/FeedbackNotice";
import { PageContainer } from "../../shared/ui/PageContainer";

type Severity = "critical" | "high" | "medium";
type WeakNode = {
  id: string; title: string; dimension: string; severity: Severity; weakness: string;
  graphRole: string; confidence: number; attempts: number; trend: number; remediation: string[];
  relatedQuestions: Array<{ id: string; title: string; label: string; to: string }>;
  resumeEvidence: Array<{ title: string; detail: string; to: string }>;
  connectedNodes: string[];
};

const WEAK_NODES: WeakNode[] = [
  {
    id: "payments-idempotency", title: "결제 idempotency 방어", dimension: "시스템 설계", severity: "critical", graphRole: "결제 정확성", confidence: 42, attempts: 8, trend: -9,
    weakness: "메커니즘은 설명하지만, 첫 번째 방어선을 뚫고 중복 정산 경쟁이 살아날 때의 실패 범위를 아직 설명하지 못합니다.",
    remediation: ["중복 정산 사고와 첫 번째 방어선이 실패한 지점을 한 문장으로 고정하세요.", "idempotency key, lock ownership, retry backoff의 순서를 실제 경쟁 상황으로 설명하세요.", "수정 이후에도 남은 한계를 밝혀 답변이 절대적으로 들리지 않게 하세요."],
    relatedQuestions: [{ id: "distributed-lock", title: "transaction 처리에서 idempotency를 어떻게 보장했나요?", label: "질문 트리", to: routeConfig.questionTree.buildPath({ questionId: "distributed-lock" }) }, { id: "distributed-lock-answer", title: "결제 정확성 답변 초안 다듬기", label: "답변 편집기", to: routeConfig.answerEditor.buildPath({ questionId: "distributed-lock" }) }],
    resumeEvidence: [{ title: "정산 안정성 개선", detail: "중복 감소 근거 사슬을 이력서 주장과 함께 다시 검증하세요.", to: routeConfig.resumeAnalysis.buildPath() }],
    connectedNodes: ["재시도 의미론", "Redis lock ownership", "정산 롤백"],
  },
  {
    id: "kafka-rebalance", title: "Kafka 리밸런스 운영 스토리", dimension: "운영 깊이", severity: "high", graphRole: "스트리밍 운영", confidence: 53, attempts: 7, trend: -7,
    weakness: "리밸런싱 자체는 맞게 설명하지만, 실서비스의 고통과 대응보다 플랫폼 이론처럼 들립니다.",
    remediation: ["리밸런스 프로토콜보다 실제 lag 또는 partition skew 사고 하나에서 시작하세요.", "어떤 가시성이 있었고 무엇이 모호했는지, 어떤 완화책이 충분히 빨랐는지 설명하세요.", "운영 교훈을 consumer ownership과 state handoff에 다시 연결하세요."],
    relatedQuestions: [{ id: "kafka-rebalance", title: "Kafka 리밸런스 가지 다시 열기", label: "질문 트리", to: routeConfig.questionTree.buildPath({ questionId: "kafka-rebalance" }) }, { id: "kafka-rebalance-answer", title: "더 선명한 운영 답변 초안 만들기", label: "답변 편집기", to: routeConfig.answerEditor.buildPath({ questionId: "kafka-rebalance" }) }],
    resumeEvidence: [{ title: "이벤트 처리 현대화", detail: "consumer lag와 replay 결정이 들어간 경력 bullet을 다시 확인하세요.", to: routeConfig.resume.buildPath() }],
    connectedNodes: ["Lag 처리", "Replay 경계", "Partition skew"],
  },
  {
    id: "resume-metrics-proof", title: "이력서 지표 근거 사슬", dimension: "기준 문서", severity: "medium", graphRole: "성과 근거", confidence: 61, attempts: 5, trend: -5,
    weakness: "강한 수치를 쓰지만 면접관이 지표 산출 방식을 물으면 도출 경로가 너무 압축되어 있습니다.",
    remediation: ["지표를 원천 데이터, 집계 규칙, 비즈니스 해석으로 분해하세요.", "직접 측정한 것과 운영 시그널로 추정한 것을 구분하세요.", "같은 근거가 공격받기 쉬운 꼬리질문 가지 하나와 지표를 연결하세요."],
    relatedQuestions: [{ id: "metrics-proof", title: "지표 꼬리질문 클러스터 보기", label: "질문 상세", to: routeConfig.questionDetail.buildPath({ questionId: "metrics-proof" }) }],
    resumeEvidence: [{ title: "이력서 분석 리스크 보드", detail: "낮은 방어 점수를 보이는 지표 bullet을 확인하세요.", to: routeConfig.resumeAnalysis.buildPath() }, { title: "근거 노트", detail: "주장 자체를 다시 쓰기 전에 보조 노트를 먼저 여세요.", to: routeConfig.notes.buildPath() }],
    connectedNodes: ["정량 임팩트", "근거 노트", "행동 책임감"],
  },
];

function labelFor(severity: Severity, isKorean: boolean) {
  return ({ critical: isKorean ? "치명" : "Critical", high: isKorean ? "높음" : "High", medium: isKorean ? "중간" : "Medium" })[severity];
}
function scoreTone(score: number) { return score < 50 ? "critical" : score < 60 ? "high" : "medium"; }

export function WeakNodesPage() {
  const { locale } = useLocale();
  const { isDesktop } = useLayoutMode();
  const isKorean = locale === "ko";
  const [selectedNodeId, setSelectedNodeId] = useState(WEAK_NODES[0].id);
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const visibleNodes = useMemo(() => WEAK_NODES.filter((node) => severityFilter === "all" || node.severity === severityFilter), [severityFilter]);
  const selectedNode = visibleNodes.find((node) => node.id === selectedNodeId) ?? visibleNodes[0] ?? WEAK_NODES[0];
  const averageConfidence = Math.round(WEAK_NODES.reduce((sum, node) => sum + node.confidence, 0) / WEAK_NODES.length);
  const relatedScores = selectedNode.connectedNodes.map((title, index) => ({ title, score: Math.max(38, selectedNode.confidence + 14 - index * 5) }));
  const selectNode = (nodeId: string) => { setSelectedNodeId(nodeId); setStatusMessage(null); };

  return (
    <PageContainer actions={<Link className="secondary-button" to={routeConfig.reviewQueue.buildPath()}>{isKorean ? "복습 큐 열기" : "Open review queue"}</Link>} description={isKorean ? "약한 답변 가지를 그래프에서 고르고, 근거와 질문 경로를 함께 확인한 뒤 복구 세션으로 넘기세요." : "Choose a weak answer branch on the graph, inspect its evidence and question path, then move it into a recovery session."} eyebrow={isKorean ? "진단 작업공간" : "Diagnostic workspace"} title={isKorean ? "약한 노드" : "Weak Nodes"}>
      {statusMessage ? <FeedbackNotice message={statusMessage} tone="success" /> : null}
      <div className={`weak-node-explorer ${isDesktop ? "weak-node-explorer--desktop" : ""}`}>
        <aside className="weak-node-explorer__left-rail">
          <section className="weak-node-explorer__summary"><span>{isKorean ? "약점 현황" : "Weakness overview"}</span><strong>{isKorean ? "복구가 필요한 가지" : "Branches needing recovery"}</strong><div><article><b>{WEAK_NODES.length}</b><small>{isKorean ? "발견됨" : "Found"}</small></article><article><b>{averageConfidence}%</b><small>{isKorean ? "평균 점수" : "Avg. score"}</small></article></div></section>
          <nav className="weak-node-explorer__nav" aria-label={isKorean ? "약점 보기" : "Weakness views"}><button type="button">{isKorean ? "개요" : "Overview"}</button><button className="weak-node-explorer__nav-item--active" type="button">{isKorean ? "약한 노드" : "Weak Nodes"}</button><button type="button">{isKorean ? "간극" : "Gaps"}</button><button type="button">{isKorean ? "추세" : "Trends"}</button></nav>
          <section className="weak-node-explorer__left-section"><div className="weak-node-explorer__section-heading"><span>{isKorean ? "우선 복구" : "Priority recovery"}</span><strong>{isKorean ? "가장 약한 답변" : "Weakest answers"}</strong></div><div className="weak-node-explorer__node-list">{WEAK_NODES.map((node) => <button className={node.id === selectedNode.id ? "weak-node-explorer__node-list-item--active" : ""} key={node.id} onClick={() => selectNode(node.id)} type="button"><i className={`weak-node-explorer__severity-dot weak-node-explorer__severity-dot--${node.severity}`} /><span><strong>{node.title}</strong><small>{node.dimension}</small></span><b>{node.confidence}%</b></button>)}</div></section>
          <section className="weak-node-explorer__left-section weak-node-explorer__progress"><span>{isKorean ? "이번 주 복구율" : "Weekly recovery"}</span><strong>{isKorean ? "준비도 흐름" : "Readiness trend"}</strong><b>{averageConfidence}%</b><div className="weak-node-explorer__sparkline" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div><small>{isKorean ? "지난주 대비 약점 2개 감소" : "Two fewer weak nodes than last week"}</small></section>
        </aside>

        <main className="weak-node-explorer__main">
          <header className="weak-node-explorer__toolbar"><p>{isKorean ? "집중 보강이 필요한 가장 약한 답변 영역입니다." : "Your weakest answer areas that need focused improvement."}</p><div><label><span>{isKorean ? "영역" : "Domain"}</span><select aria-label={isKorean ? "약점 영역 선택" : "Choose weakness domain"}><option>{isKorean ? "모든 영역" : "All domains"}</option></select></label><label><span>{isKorean ? "심각도" : "Severity"}</span><select aria-label={isKorean ? "심각도로 필터링" : "Filter by severity"} onChange={(event) => setSeverityFilter(event.target.value as Severity | "all")} value={severityFilter}><option value="all">{isKorean ? "전체" : "All levels"}</option><option value="critical">{labelFor("critical", isKorean)}</option><option value="high">{labelFor("high", isKorean)}</option><option value="medium">{labelFor("medium", isKorean)}</option></select></label><button className="weak-node-explorer__view-toggle" type="button">{isKorean ? "그래프 보기" : "View: Graph"}</button></div></header>
          <section className="weak-node-explorer__graph"><div className="weak-node-explorer__graph-caption"><span>{isKorean ? "약점 그래프" : "Weakness graph"}</span><small>{isKorean ? "노드를 선택하면 우측에서 진단과 다음 조치를 확인할 수 있습니다." : "Select a node to inspect its diagnosis and next action."}</small></div><div className="weak-node-explorer__graph-canvas"><i className="weak-node-explorer__graph-line weak-node-explorer__graph-line--root" /><i className="weak-node-explorer__graph-line weak-node-explorer__graph-line--branch-one" /><i className="weak-node-explorer__graph-line weak-node-explorer__graph-line--branch-two" /><article className="weak-node-explorer__root-node"><span>{isKorean ? "면접 준비" : "Interview prep"}</span><strong>{isKorean ? "백엔드 역량" : "Backend"}</strong><b>{averageConfidence}%</b></article><article className="weak-node-explorer__domain-node"><span>{isKorean ? "핵심 영역" : "Core domain"}</span><strong>{selectedNode.dimension}</strong><b>{selectedNode.confidence + 6}%</b></article><div className="weak-node-explorer__graph-node-stack">{visibleNodes.map((node) => <button className={`weak-node-explorer__graph-node weak-node-explorer__graph-node--${node.severity}${node.id === selectedNode.id ? " weak-node-explorer__graph-node--active" : ""}`} key={node.id} onClick={() => selectNode(node.id)} type="button"><i className={`weak-node-explorer__severity-dot weak-node-explorer__severity-dot--${node.severity}`} /><span>{node.graphRole}</span><strong>{node.title}</strong><b>{node.confidence}%</b></button>)}</div><div className="weak-node-explorer__graph-leaves">{relatedScores.map((item) => <span key={item.title}><i className={`weak-node-explorer__severity-dot weak-node-explorer__severity-dot--${scoreTone(item.score)}`} />{item.title}<b>{item.score}%</b></span>)}</div></div></section>
          <section className="weak-node-explorer__table-panel"><div className="weak-node-explorer__table-heading"><div><span>{isKorean ? `약한 노드 (${visibleNodes.length})` : `Weak Nodes (${visibleNodes.length})`}</span><small>{isKorean ? "점수와 최근 시도 흐름을 기준으로 정렬했습니다." : "Ordered by score and recent attempt trend."}</small></div><button type="button">{isKorean ? "내보내기" : "Export"}</button></div><div className="weak-node-explorer__table" role="table"><div className="weak-node-explorer__table-head" role="row"><span>{isKorean ? "주제" : "Topic"}</span><span>{isKorean ? "영역" : "Domain"}</span><span>{isKorean ? "점수" : "Score"}</span><span>{isKorean ? "시도" : "Attempts"}</span><span>{isKorean ? "추세" : "Trend"}</span></div>{visibleNodes.map((node) => <button className={node.id === selectedNode.id ? "weak-node-explorer__table-row--active" : ""} key={node.id} onClick={() => selectNode(node.id)} role="row" type="button"><span><i className={`weak-node-explorer__severity-dot weak-node-explorer__severity-dot--${node.severity}`} /><strong>{node.title}</strong></span><span><em>{node.dimension}</em></span><span className={`weak-node-explorer__score--${scoreTone(node.confidence)}`}>{node.confidence}%</span><span>{node.attempts}</span><span className="weak-node-explorer__trend">{node.trend}%</span></button>)}</div></section>
        </main>

        <aside className="weak-node-explorer__inspector"><header><span>{isKorean ? "약한 노드 상세" : "Weak Node Details"}</span><button aria-label={isKorean ? "상세 패널 닫기" : "Close detail panel"} type="button">×</button></header><section className="weak-node-explorer__inspector-card"><div className="weak-node-explorer__chips"><span className={`weak-node-explorer__impact--${selectedNode.severity}`}>{labelFor(selectedNode.severity, isKorean)} {isKorean ? "영향" : "impact"}</span><span>{selectedNode.dimension}</span></div><h2>{selectedNode.title}</h2><div className="weak-node-explorer__score-summary"><div className={`weak-node-explorer__score-ring--${scoreTone(selectedNode.confidence)}`}><b>{selectedNode.confidence}%</b><small>{isKorean ? "약점 점수" : "Weak score"}</small></div><div><span>{isKorean ? "백분위" : "Percentile"}</span><strong>{Math.max(8, 70 - selectedNode.confidence)}{isKorean ? "위" : "th"}</strong></div><div><span>{isKorean ? "시도 횟수" : "Attempts"}</span><strong>{selectedNode.attempts}</strong></div></div><div className="weak-node-explorer__inspector-section"><div><strong>{isKorean ? "가장 약한 차원" : "Weakest dimensions"}</strong><button type="button">{isKorean ? "전체" : "View all"}</button></div>{relatedScores.map((item) => <p key={item.title}><span>{item.title}</span><i><b style={{ width: `${item.score}%` }} /></i><strong>{item.score}%</strong></p>)}</div><div className="weak-node-explorer__inspector-section"><strong>{isKorean ? "원인" : "Root causes"}</strong><ul>{selectedNode.remediation.map((step) => <li key={step}>{step}</li>)}</ul></div><div className="weak-node-explorer__inspector-section"><div><strong>{isKorean ? "연결된 질문" : "Connected questions"}</strong><button type="button">{isKorean ? "전체" : "View all"}</button></div><div className="weak-node-explorer__linked-list">{selectedNode.relatedQuestions.map((question) => <Link key={question.id} to={question.to}><span>{question.label}</span><strong>{question.title}</strong></Link>)}</div></div></section><section className="weak-node-explorer__next-step"><span>{isKorean ? "권장 다음 조치" : "Recommended next step"}</span><strong>{isKorean ? "이 노드를 중심으로 질문 6개와 근거 1개를 다시 연결하세요." : "Reconnect six questions and one evidence source around this node."}</strong><Link className="primary-button" to={routeConfig.reviewQueue.buildPath()} onClick={() => setStatusMessage(isKorean ? "복습 큐에서 이 약점 노드의 복구를 시작하세요." : "Start recovery for this weak node in the review queue.")}>{isKorean ? "복구 시작" : "Start remediation"}</Link></section></aside>
      </div>
    </PageContainer>
  );
}

export default WeakNodesPage;
