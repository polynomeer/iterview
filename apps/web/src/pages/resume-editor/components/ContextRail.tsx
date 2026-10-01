import { Badge, Button } from "../../../shared/ui/primitives";
import { findFirstReviewSignalLine } from "../editorUtils";
import type { EditorControllerProps, EditorViewProps } from "../editorViewProps";
import { ContextPanelContent } from "./context-panels/ContextPanelContent";

/** Comment, question card, and suggestion counts for the selection; each opens its panel. */
export function ContextSummaryCards({ ctrl }: EditorControllerProps) {
  const {
    t,
    contextualSummaryItems,
    previewReviewSignals,
    setFocusedReviewLineIndex,
    setActiveSidePanel,
    setIsContextPanelOpen,
    setIsSecondaryToolsOpen,
  } = ctrl;

  return (
    <div className="resume-editor-contextual__summary">
      {contextualSummaryItems.map((item) => (
        <button
          className="resume-editor-contextual__summary-card"
          key={item.panelId}
          onClick={() => {
            const matchedLineIndex = findFirstReviewSignalLine(previewReviewSignals, item.panelId);
            if (matchedLineIndex >= 0) {
              setFocusedReviewLineIndex(matchedLineIndex);
            }
            setActiveSidePanel(item.panelId);
            setIsContextPanelOpen(true);
            setIsSecondaryToolsOpen(false);
          }}
          type="button"
        >
          <span className="resume-editor-contextual__summary-label">{item.label}</span>
          <strong className="resume-editor-contextual__summary-value">{item.value}</strong>
          <span className="resume-editor-contextual__summary-helper">{item.helper}</span>
        </button>
      ))}
      <Button onClick={() => setIsContextPanelOpen(true)} size="sm">
        {t("resumeEditor.openTools")}
      </Button>
    </div>
  );
}

/** The floating tool dock for the selected block: panel switcher and the open panel. */
export function ContextRail({ ctrl, workspace }: EditorViewProps) {
  const {
    t,
    currentTab,
    primarySidePanels,
    secondarySidePanels,
    isSecondaryPanelActive,
    selectedBlock,
    selectedNode,
    richTreeEnabled,
    activeSidePanel,
    setActiveSidePanel,
    isContextPanelOpen,
    setIsContextPanelOpen,
    isSecondaryToolsOpen,
    setIsSecondaryToolsOpen,
  } = ctrl;
  const title = richTreeEnabled
    ? selectedNode?.metadata.heading ?? selectedNode?.nodeTypeLabel ?? t("resumeEditor.untitledNode")
    : selectedBlock?.title || t("resumeEditor.untitledBlock");
  const typeLabel = richTreeEnabled ? selectedNode?.nodeTypeLabel : selectedBlock?.blockTypeLabel;

  function panelButton(panelId: (typeof primarySidePanels)[number][0], label: string, keepSecondaryOpen: boolean) {
    const active = activeSidePanel === panelId;
    return (
      <Button
        aria-pressed={active}
        key={panelId}
        onClick={() => {
          setActiveSidePanel(panelId);
          setIsContextPanelOpen(true);
          setIsSecondaryToolsOpen(keepSecondaryOpen);
        }}
        size="sm"
        variant={active ? "primary" : "ghost"}
      >
        {label}
      </Button>
    );
  }

  return (
    <div aria-label={t("resumeEditor.contextualEditorTools")} className="resume-editor-contextual" role="region">
      {isContextPanelOpen ? (
        <div className="resume-editor-contextual__dock">
          {primarySidePanels.map(([panelId, label]) => panelButton(panelId, label, false))}
          <Button
            aria-expanded={isSecondaryToolsOpen || isSecondaryPanelActive}
            onClick={() => setIsSecondaryToolsOpen((current) => !current)}
            size="sm"
            variant="ghost"
          >
            {t("resumeEditor.more")}
          </Button>
          {isSecondaryToolsOpen || isSecondaryPanelActive ? (
            <div className="resume-editor-contextual__secondary">
              {secondarySidePanels.map(([panelId, label]) => panelButton(panelId, label, true))}
            </div>
          ) : null}
          <Button onClick={() => setIsContextPanelOpen(false)} size="sm">
            {t("resumeEditor.close")}
          </Button>
        </div>
      ) : currentTab !== "review" ? (
        <ContextSummaryCards ctrl={ctrl} />
      ) : null}
      {isContextPanelOpen ? (
        <div className="resume-editor-contextual__panel">
          <div className="editor-head">
            <h3 className="editor-heading">{title}</h3>
            {typeLabel && typeLabel !== title ? <Badge>{typeLabel}</Badge> : null}
          </div>
          <ContextPanelContent ctrl={ctrl} workspace={workspace} />
        </div>
      ) : null}
    </div>
  );
}
