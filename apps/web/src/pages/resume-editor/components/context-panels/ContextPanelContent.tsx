import { Badge, Card, CardHeader } from "../../../../shared/ui/primitives";
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
        <Card padded>
          <CardHeader title={t("resumeEditor.sourceContext")} titleAs="h2" />
          <div className="editor-stack">
            {sourceContextCards.map((card) => (
              <article className="editor-inset" key={card.title}>
                <p className="editor-label">{card.title}</p>
                <p className="editor-text editor-preserve">{card.body}</p>
              </article>
            ))}
          </div>
        </Card>
      );
    case "presence":
      return (
        <Card padded>
          <CardHeader title={t("resumeEditor.presenceStatus")} titleAs="h2" />
          <div className="editor-chips">
            {workspace.activePresence.length > 0 ? (
              workspace.activePresence.map((presence) => (
                <Badge dot key={presence.sessionKey} tone="accent">
                  {presence.userLabel}
                  {presence.viewMode ? ` · ${presence.viewMode}` : ""}
                </Badge>
              ))
            ) : (
              <p className="editor-muted">{t("resumeEditor.noActivePresenceYet")}</p>
            )}
          </div>
        </Card>
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
