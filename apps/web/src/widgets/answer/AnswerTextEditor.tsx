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
  const { locale, t } = useLocale();
  const isKorean = locale === "ko";
  const trimmedLength = value.trim().length;
  const paragraphCount = value
    .split(/\n\s*\n/)
    .map((segment) => segment.trim())
    .filter(Boolean).length;
  const sentenceCount = value
    .split(/[.!?]\s+/)
    .map((segment) => segment.trim())
    .filter(Boolean).length;
  const draftSignal =
    trimmedLength === 0
      ? isKorean
        ? "비어 있음"
        : "Empty"
      : trimmedLength < 180
        ? isKorean
          ? "깊이 보강 필요"
          : "Needs depth"
        : sentenceCount < 3
          ? isKorean
            ? "구조 보강 필요"
            : "Needs structure"
          : isKorean
            ? "답변 형태 확보"
            : "Answer-shaped";
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
          <div className="answer-editor-card__metrics" aria-label={isKorean ? "초안 상태" : "Draft status"}>
            <article className="answer-editor-card__metric">
              <span>{isKorean ? "초안 상태" : "Draft state"}</span>
              <strong>{draftSignal}</strong>
            </article>
            <article className="answer-editor-card__metric">
              <span>{isKorean ? "공백 제외 글자 수" : "Trimmed chars"}</span>
              <strong>{trimmedLength}</strong>
            </article>
            <article className="answer-editor-card__metric">
              <span>{isKorean ? "문단 수" : "Paragraphs"}</span>
              <strong>{paragraphCount}</strong>
            </article>
            <article className="answer-editor-card__metric">
              <span>{isKorean ? "문장 수" : "Sentences"}</span>
              <strong>{sentenceCount}</strong>
            </article>
          </div>
        ) : null}
      </div>
      {mode === "workspace" ? (
        <p className="answer-editor-card__body">
          {isKorean
            ? "먼저 답변 전체를 한 번에 쓰고, 구체적인 꼬리질문을 버티지 못할 문장만 다시 다듬으세요."
            : "Write the answer in one pass first, then tighten any sentence that cannot survive a concrete follow-up."}
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
          <div className="answer-editor-card__helper-stack">
            <p className="answer-editor-card__helper-note">
              {isKorean
                ? "길고 모호한 문단보다 선명한 주장 하나, 이를 뒷받침하는 제약 하나, 결과 하나를 우선하세요."
                : "Prefer one crisp claim, one supporting constraint, and one outcome over a long generic paragraph."}
            </p>
            <p className="answer-editor-card__helper-note answer-editor-card__helper-note--secondary">
              {isKorean
                ? "다음 면접관의 움직임은 대개 가장 모호한 문장을 먼저 압박합니다. 제출 전에 그 줄부터 다듬으세요."
                : "The next interviewer move will usually attack the vaguest sentence first. Tighten that line before submitting."}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
