import type { ReactNode } from "react";
type AnswerEditorLayoutProps = {
  workspaceSummary: ReactNode;
  insightSummary: ReactNode;
  promptSection: ReactNode;
  editorSection: ReactNode;
  submitSection: ReactNode;
  contextSection: ReactNode;
};

export function AnswerEditorMobileLayout({
  workspaceSummary,
  insightSummary,
  promptSection,
  editorSection,
  submitSection,
  contextSection,
}: AnswerEditorLayoutProps) {
  return (
    <div className="page-stack">
      {workspaceSummary}
      {promptSection}
      {contextSection}
      {insightSummary}
      {editorSection}
      {submitSection}
    </div>
  );
}

export function AnswerEditorDesktopLayout({
  workspaceSummary,
  insightSummary,
  promptSection,
  editorSection,
  submitSection,
  contextSection,
}: AnswerEditorLayoutProps) {
  return (
    <div className="answer-editor-layout answer-editor-layout--desktop">
      <aside className="answer-editor-layout__prompt-rail">
        <div className="page-stack">
          {promptSection}
          {insightSummary}
        </div>
      </aside>
      <div className="answer-editor-layout__workspace">
        <div className="page-stack">
          {workspaceSummary}
          {editorSection}
          <div className="answer-editor-layout__submit-panel">{submitSection}</div>
        </div>
      </div>
      <aside className="answer-editor-layout__context">
        <div className="page-stack">
          {contextSection}
        </div>
      </aside>
    </div>
  );
}
