import type { EditorViewProps } from "../editorViewProps";

export function WorkspaceSurface({ ctrl, workspace }: EditorViewProps) {
  const {
    isKorean,
    sourceContextCards,
  } = ctrl;

  return (
    <section className="page-card resume-editor-workspace-surface">
      <div className="resume-editor-workspace-surface__header">
        <div className="resume-editor-workspace-surface__intro">
          <div className="resume-editor-workspace-surface__eyebrow-row">
            <span className="page-card__label">{isKorean ? "기준 문서 작성" : "Source-of-truth authoring"}</span>
            <span className="question-status-badge question-status-badge--accent">{isKorean ? "초안 레인" : "Draft lane"}</span>
          </div>
          <p className="resume-editor-workspace-surface__breadcrumbs">
            {isKorean ? "이력서 주장" : "Resume claim"}
            <span>/</span>
            {isKorean ? "근거 세부 정보" : "Evidence detail"}
            <span>/</span>
            {isKorean ? "꼬리질문 생존성" : "Follow-up survivability"}
          </p>
          <h2 className="resume-editor-workspace-surface__title">
            {isKorean ? "모든 줄이 DFS 꼬리질문 압박을 견딜 때까지 이력서를 다듬으세요" : "Write the resume until every line can survive DFS follow-up pressure"}
          </h2>
          <p className="resume-editor-workspace-surface__body">
            {isKorean
              ? "문서 꾸미기가 아니라 기준 문서 작성이라고 생각하세요. 각 리비전은 하나의 주장을 더 명확하게 만들고, 근거를 보강하거나, 깊은 질문에도 덜 흔들리게 만들어야 합니다."
              : "Treat this as source-of-truth authoring, not document polishing. Each revision should make one claim clearer, better evidenced, or less fragile under deeper questioning."}
          </p>
        </div>
        <div className="resume-editor-workspace-surface__stats">
          <article className="resume-editor-workspace-surface__stat">
            <span>{isKorean ? "리비전" : "Revision"}</span>
            <strong>{workspace.revisionNo}</strong>
          </article>
          <article className="resume-editor-workspace-surface__stat">
            <span>{isKorean ? "근거 앵커" : "Evidence anchors"}</span>
            <strong>{sourceContextCards.length}</strong>
          </article>
          <article className="resume-editor-workspace-surface__stat">
            <span>{isKorean ? "검토 신호" : "Review signals"}</span>
            <strong>
              {workspace.commentSummary.totalCount + workspace.questionCardSummary.totalCount}
            </strong>
          </article>
          <article className="resume-editor-workspace-surface__stat">
            <span>{isKorean ? "보기 모드" : "View modes"}</span>
            <strong>{workspace.supportedViewModes.length}</strong>
          </article>
        </div>
      </div>
      <div className="resume-editor-workspace-surface__guidance" aria-label={isKorean ? "이력서 작성 가이드" : "Resume authoring guidance"}>
        <article className="resume-editor-workspace-surface__guidance-card">
          <span>{isKorean ? "주장 원칙" : "Claim rule"}</span>
          <strong>{isKorean ? "문서 전체가 아니라, 꼬리질문에서 무너질 정확한 줄만 다시 쓰세요." : "Rewrite the exact line that would fail under follow-up, not the whole document."}</strong>
        </article>
        <article className="resume-editor-workspace-surface__guidance-card">
          <span>{isKorean ? "근거 원칙" : "Evidence rule"}</span>
          <strong>{isKorean ? "문장을 넓히기 전에 구체적인 사실, 수치, 제약 하나를 먼저 붙이세요." : "Attach one concrete fact, metric, or constraint before broadening wording."}</strong>
        </article>
        <article className="resume-editor-workspace-surface__guidance-card">
          <span>{isKorean ? "종료 원칙" : "Exit rule"}</span>
          <strong>{isKorean ? "선택한 주장이 방어 가능한 답변 경로를 가질 때만 이 패스를 종료하세요." : "Leave this pass only when the selected claim has a defendable answer path."}</strong>
        </article>
      </div>
      <div className="resume-editor-workspace-surface__chips">
        <span className="detail-chip">{workspace.workspaceStatusLabel}</span>
        <span className="detail-chip detail-chip--accent">
          {workspace.documentModel === "rich_tree"
            ? isKorean
              ? "리치 트리"
              : "Rich tree"
            : isKorean
              ? "블록"
              : "Blocks"}
        </span>
        {workspace.selectionCapabilities.supportsOperations ? (
          <span className="detail-chip">{isKorean ? "문서 작업 가능" : "Operations enabled"}</span>
        ) : null}
        {workspace.selectionCapabilities.supportsInlineSelections ? (
          <span className="detail-chip">{isKorean ? "인라인 선택 가능" : "Inline selections enabled"}</span>
        ) : null}
      </div>
    </section>
  );
}
