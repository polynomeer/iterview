import type { ReactNode } from "react";
type AnswerEditorLayoutProps = {
  workspaceSummary: ReactNode;
  promptSection: ReactNode;
  editorSection: ReactNode;
  submitSection: ReactNode;
  contextSection: ReactNode;
};

export function AnswerEditorMobileLayout({
  workspaceSummary,
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
      {editorSection}
      {submitSection}
    </div>
  );
}

export function AnswerEditorDesktopLayout({
  workspaceSummary,
  promptSection,
  editorSection,
  submitSection,
  contextSection,
}: AnswerEditorLayoutProps) {
  return (
    <div className="answer-editor-layout answer-editor-layout--desktop">
      <section className="answer-editor-layout__workspace-summary">{workspaceSummary}</section>
      <aside className="answer-editor-layout__context">
        <div className="page-stack">
          {promptSection}
          {contextSection}
        </div>
      </aside>
      <div className="answer-editor-layout__workspace">
        <div className="page-stack">
          {editorSection}
          <div className="answer-editor-layout__submit-panel">{submitSection}</div>
        </div>
      </div>
    </div>
  );
}
