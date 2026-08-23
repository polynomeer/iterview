import { useLocale } from "../../shared/i18n";

type AnswerTextEditorProps = {
  value: string;
  onChange: (nextValue: string) => void;
  disabled?: boolean;
  mode?: "default" | "workspace";
};

export function AnswerTextEditor({
  value,
  onChange,
  disabled = false,
  mode = "default",
}: AnswerTextEditorProps) {
  const { t } = useLocale();
  const trimmedLength = value.trim().length;
  const modeClassName =
    mode === "workspace" ? "answer-editor-card answer-editor-card--workspace" : "answer-editor-card";

  return (
    <section className={`page-card ${modeClassName}`}>
      <div className="answer-editor-card__header">
        <div className="section-heading">
          <div>
            <p className="section-heading__eyebrow">{t("answer.editorEyebrow")}</p>
            <h2 className="page-card__title">{t("answer.editorTitle")}</h2>
          </div>
        </div>
        {mode === "workspace" ? (
          <div className="answer-editor-card__metrics" aria-label="Draft status">
            <article className="answer-editor-card__metric">
              <span>Draft state</span>
              <strong>{trimmedLength > 0 ? "In progress" : "Empty"}</strong>
            </article>
            <article className="answer-editor-card__metric">
              <span>Trimmed chars</span>
              <strong>{trimmedLength}</strong>
            </article>
          </div>
        ) : null}
      </div>
      {mode === "workspace" ? (
        <p className="answer-editor-card__body">
          Write the answer in one pass first, then tighten any sentence that cannot survive a concrete follow-up.
        </p>
      ) : null}
      <textarea
        className="answer-editor__textarea"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("answer.editorPlaceholder")}
        rows={12}
        value={value}
      />
      <div className="answer-editor-card__footer">
        <p className="answer-editor__helper">
          {trimmedLength > 0 ? t("answer.editorSaved") : t("answer.editorEmpty")}
        </p>
        {mode === "workspace" ? (
          <p className="answer-editor-card__helper-note">
            Prefer one crisp claim, one supporting constraint, and one outcome over a long generic paragraph.
          </p>
        ) : null}
      </div>
    </section>
  );
}
