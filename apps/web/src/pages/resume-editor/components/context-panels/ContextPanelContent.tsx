import type { EditorViewProps } from "../../editorViewProps";
import { CommentsPanel } from "./CommentsPanel";
import { QuestionCardsPanel } from "./QuestionCardsPanel";
import { SuggestionsPanel } from "./SuggestionsPanel";

/** Body of the context rail for the active side panel. */
export function ContextPanelContent({ ctrl, workspace }: EditorViewProps) {
  const {
    t,
    sourceContextCards,
    activeSidePanel,
  } = ctrl;

  switch (activeSidePanel) {
    case "source":
      return (
        <section className="page-card">
          <span className="page-card__label">{t("resumeEditor.sourceContext")}</span>
          <h2 className="page-card__title">{t("resumeEditor.immutableSourceResumeContext")}</h2>
          <div className="stack-list">
            {sourceContextCards.map((card) => (
              <article className="page-card page-card--muted" key={card.title}>
                <p className="section-heading__eyebrow">{card.title}</p>
                <p className="page-card__body resume-section__body--preserve">{card.body}</p>
              </article>
            ))}
          </div>
        </section>
      );
    case "presence":
      return (
        <section className="page-card">
          <span className="page-card__label">{t("resumeEditor.presenceStatus")}</span>
          <h2 className="page-card__title">{t("resumeEditor.workspacePresence")}</h2>
          <div className="filter-chip-row">
            {workspace.activePresence.length > 0 ? (
              workspace.activePresence.map((presence) => (
                <span className="detail-chip" key={presence.sessionKey}>
                  {presence.userLabel}
                  {presence.viewMode ? ` · ${presence.viewMode}` : ""}
                  {presence.selectedBlockId ? ` · ${presence.selectedBlockId}` : ""}
                </span>
              ))
            ) : (
              <span className="detail-chip">{t("resumeEditor.noActivePresenceYet")}</span>
            )}
          </div>
        </section>
      );
    case "question-cards":
      return <QuestionCardsPanel ctrl={ctrl} workspace={workspace} />;
    case "suggestions":
      return <SuggestionsPanel ctrl={ctrl} />;
    case "comments":
    default:
      return <CommentsPanel ctrl={ctrl} workspace={workspace} />;
  }
}
