import { MetricCard } from "../../../shared/ui/MetricCard";
import { formatSupportedViewModeLabel } from "../editorUtils";
import type { EditorViewProps } from "../editorViewProps";

export function EditorHeader({ ctrl, workspace }: EditorViewProps) {
  const {
    isKorean,
    currentTab,
    primaryTabs,
    secondaryTabs,
    isSecondaryTabActive,
    updateTab,
    saveMessage,
    setImportMarkdownOpen,
    isWorkspaceInfoOpen,
    setIsWorkspaceInfoOpen,
    isWorkspaceMenuOpen,
    setIsWorkspaceMenuOpen,
    isViewMenuOpen,
    setIsViewMenuOpen,
  } = ctrl;

  return (
    <section className="page-card resume-editor-topbar">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{isKorean ? "작성 제어" : "Authoring controls"}</p>
          <h2 className="page-card__title">
            {isKorean
              ? "작성 화면의 집중을 유지한 채 초안 레이어를 제어하세요"
              : "Control the draft layer without losing the writing surface"}
          </h2>
        </div>
        <div className="page-card__actions">
          <span className="question-status-badge question-status-badge--accent">
            {isKorean ? `리비전 ${workspace.revisionNo}` : `Revision ${workspace.revisionNo}`}
          </span>
          <span className="question-status-badge question-status-badge--neutral">
            {workspace.workspaceStatusLabel}
          </span>
          <div className="resume-editor-topbar__menu">
            <button
              aria-expanded={isWorkspaceMenuOpen}
              className="secondary-button"
              onClick={() => setIsWorkspaceMenuOpen((current) => !current)}
              type="button"
            >
              {isKorean ? "추가 작업" : "More actions"}
            </button>
            {isWorkspaceMenuOpen ? (
              <div className="resume-editor-topbar__menu-popover" role="menu">
                <button
                  className="resume-editor-topbar__menu-item"
                  onClick={() => {
                    setIsWorkspaceInfoOpen((current) => !current);
                    setIsWorkspaceMenuOpen(false);
                  }}
                  type="button"
                >
                  {isWorkspaceInfoOpen
                    ? isKorean
                      ? "작업공간 정보 숨기기"
                      : "Hide workspace info"
                    : isKorean
                      ? "작업공간 정보"
                      : "Workspace info"}
                </button>
                <button
                  className="resume-editor-topbar__menu-item"
                  onClick={() => {
                    setImportMarkdownOpen(true);
                    setIsWorkspaceMenuOpen(false);
                  }}
                  type="button"
                >
                  {isKorean ? "마크다운 가져오기" : "Import markdown"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <p className="resume-tailor-muted">
        {isKorean
          ? "원본 이력서는 변경되지 않습니다. 이 영역에서 저장, 보기 모드, 초안 동작을 관리하고 메인 화면은 주장 품질 점검에 집중하세요."
          : "The source resume stays immutable. Use this strip to manage saves, view mode, and draft behavior while the main surface stays focused on claim quality."}
      </p>
      {saveMessage ? <p className="resume-tailor-muted">{saveMessage}</p> : null}
      <div className="filter-chip-row resume-editor-tabbar">
        {primaryTabs.map((tab) => (
          <button
            className={`detail-chip detail-chip--interactive ${currentTab === tab ? "detail-chip--active" : ""}`}
            key={tab}
            onClick={() => {
              updateTab(tab);
              setIsViewMenuOpen(false);
            }}
            type="button"
          >
            {tab === "edit" ? (isKorean ? "편집" : "Edit") : isKorean ? "리뷰" : "Review"}
          </button>
        ))}
        <div className="resume-editor-topbar__menu">
          <button
            aria-expanded={isViewMenuOpen}
            className={`detail-chip detail-chip--interactive ${isSecondaryTabActive || isViewMenuOpen ? "detail-chip--active" : ""}`}
            onClick={() => setIsViewMenuOpen((current) => !current)}
            type="button"
          >
            {isKorean ? "보기" : "Views"}
          </button>
          {isViewMenuOpen ? (
            <div className="resume-editor-topbar__menu-popover" role="menu">
              {secondaryTabs.map((tab) => (
                <button
                  className="resume-editor-topbar__menu-item"
                  key={tab}
                  onClick={() => {
                    updateTab(tab);
                    setIsViewMenuOpen(false);
                  }}
                  type="button"
                >
                  {tab === "heatmap"
                    ? isKorean
                      ? "히트맵"
                      : "Heatmap"
                    : tab === "print-preview"
                      ? isKorean
                        ? "출력 미리보기"
                        : "Print preview"
                      : isKorean
                        ? "히스토리"
                        : "History"}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        {isSecondaryTabActive ? (
          <span className="detail-chip">
            {currentTab === "heatmap"
              ? isKorean
                ? "히트맵"
                : "Heatmap"
              : currentTab === "print-preview"
                ? isKorean
                  ? "출력 미리보기"
                  : "Print preview"
                : isKorean
                  ? "히스토리"
                  : "History"}
          </span>
        ) : null}
      </div>
      {currentTab === "edit" || currentTab === "review" ? (
        <p className="resume-tailor-muted">
          {isKorean
            ? "먼저 손봐야 할 가장 작은 주장부터 선택하세요. 가능하면 리치 트리 앵커와 컨텍스트 작업이 수정 내용을 해당 원문 줄에 자동으로 연결합니다."
            : "Select the smallest claim that needs work first. Rich-tree anchors and contextual actions will bind the edit to that source line automatically when available."}
        </p>
      ) : null}
      {isWorkspaceInfoOpen ? (
        <div className="page-card page-card--muted resume-editor-workspace-info">
          <div className="stats-grid">
            <MetricCard label={isKorean ? "블록" : "Blocks"} value={String(workspace.document.blocks.length)} />
            <MetricCard label={isKorean ? "노드" : "Nodes"} tone="accent" value={String(workspace.document.nodes.length)} />
            <MetricCard label={isKorean ? "댓글" : "Comments"} tone="accent" value={String(workspace.commentSummary.totalCount)} />
            <MetricCard label={isKorean ? "질문 카드" : "Question cards"} tone="muted" value={String(workspace.questionCardSummary.totalCount)} />
            <MetricCard label={isKorean ? "접속자" : "Presence"} tone="muted" value={String(workspace.activePresence.length)} />
          </div>
          <div className="filter-chip-row">
            <span className="detail-chip">
              {isKorean ? "모델" : "Model"}{" "}
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
            {workspace.supportedViewModes.length > 0 ? (
              <span className="detail-chip">
                {isKorean ? "모드" : "Modes"}{" "}
                {workspace.supportedViewModes
                  .map((mode) => formatSupportedViewModeLabel(mode, isKorean))
                  .join(", ")}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
