import { useLocale } from "../../shared/i18n";

type AnswerTextEditorProps = {
  value: string;
  onChange: (nextValue: string) => void;
  disabled?: boolean;
};

export function AnswerTextEditor({
  value,
  onChange,
  disabled = false,
}: AnswerTextEditorProps) {
  const { t } = useLocale();

  return (
    <section className="page-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{t("answer.editorEyebrow")}</p>
          <h2 className="page-card__title">{t("answer.editorTitle")}</h2>
        </div>
      </div>
      <textarea
        className="answer-editor__textarea"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("answer.editorPlaceholder")}
        rows={12}
        value={value}
      />
      <p className="answer-editor__helper">
        {value.trim().length > 0
          ? t("answer.editorSaved")
          : t("answer.editorEmpty")}
      </p>
    </section>
  );
}
