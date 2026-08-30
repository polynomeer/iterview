import { useLocale } from "../../shared/i18n";

type ReferenceAnswerItem = {
  id: string;
  title: string;
  answerText: string;
  answerFormat: string;
  sourceLabel: string;
  sourceType: string;
  contentLocale: string | null;
  isUserGenerated: boolean;
  isOfficial: boolean;
};

type ReferenceAnswersSectionProps = {
  items: ReferenceAnswerItem[];
  canAdd?: boolean;
  isComposerOpen?: boolean;
  isSubmitting?: boolean;
  submitError?: string | null;
  authHint?: string | null;
  form?: {
    title: string;
    answerText: string;
    answerFormat: string;
  };
  onToggleComposer?: () => void;
  onFormChange?: (field: "title" | "answerText" | "answerFormat", value: string) => void;
  onSubmit?: () => void;
};

function formatBadgeLabel(item: ReferenceAnswerItem, t: ReturnType<typeof useLocale>["t"]) {
  if (item.isUserGenerated) {
    return t("question.sourceYourNote");
  }

  if (item.sourceType === "real_interview_import") {
    return t("question.sourceRealInterview");
  }

  if ((item.sourceType ?? "").toLowerCase().includes("ai")) {
    return t("question.sourceAiGenerated");
  }

  return item.sourceLabel;
}

function formatAnswerFormat(answerFormat: string) {
  switch (answerFormat) {
    case "outline":
      return "Outline";
    case "full_answer":
      return "Full answer";
    case "summary":
      return "Summary";
    case "transcript_excerpt":
      return "Transcript excerpt";
    default:
      return answerFormat.split("_").join(" ");
  }
}

export function ReferenceAnswersSection({
  items,
  canAdd = false,
  isComposerOpen = false,
  isSubmitting = false,
  submitError = null,
  authHint = null,
  form,
  onToggleComposer,
  onFormChange,
  onSubmit,
}: ReferenceAnswersSectionProps) {
  const { t } = useLocale();

  return (
    <section className="page-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{t("question.referenceAnswersEyebrow")}</p>
          <h2 className="page-card__title">{t("question.referenceAnswersTitle")}</h2>
        </div>
        {canAdd ? (
          <button className="secondary-button" onClick={onToggleComposer} type="button">
            {isComposerOpen ? t("question.cancelAddReferenceAnswer") : t("question.addReferenceAnswer")}
          </button>
        ) : null}
      </div>

      {isComposerOpen && canAdd && form ? (
        <form
          className="question-inline-composer"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit?.();
          }}
        >
          <div className="form-field">
            <label className="form-field__label" htmlFor="reference-answer-title">
              {t("question.referenceAnswerTitleLabel")}
            </label>
            <input
              className="form-field__input"
              id="reference-answer-title"
              onChange={(event) => {
                onFormChange?.("title", event.target.value);
              }}
              placeholder={t("question.referenceAnswerTitlePlaceholder")}
              type="text"
              value={form.title}
            />
          </div>
          <div className="form-field">
            <label className="form-field__label" htmlFor="reference-answer-format">
              {t("question.referenceAnswerFormatLabel")}
            </label>
            <select
              className="form-field__input"
              id="reference-answer-format"
              onChange={(event) => {
                onFormChange?.("answerFormat", event.target.value);
              }}
              value={form.answerFormat}
            >
              <option value="outline">{t("common.languageKorean") === "한국어" ? "개요" : "Outline"}</option>
              <option value="full_answer">{t("common.languageKorean") === "한국어" ? "전체 답변" : "Full answer"}</option>
              <option value="summary">{t("common.languageKorean") === "한국어" ? "요약" : "Summary"}</option>
              <option value="transcript_excerpt">{t("common.languageKorean") === "한국어" ? "대화 발췌" : "Transcript excerpt"}</option>
            </select>
          </div>
          <div className="form-field">
            <label className="form-field__label" htmlFor="reference-answer-text">
              {t("question.referenceAnswerTextLabel")}
            </label>
            <textarea
              className="form-field__input"
              id="reference-answer-text"
              onChange={(event) => {
                onFormChange?.("answerText", event.target.value);
              }}
              placeholder={t("question.referenceAnswerTextPlaceholder")}
              rows={5}
              value={form.answerText}
            />
          </div>
          {submitError ? <p className="form-feedback form-feedback--error">{submitError}</p> : null}
          <div className="page-card__actions">
            <button className="primary-button" disabled={isSubmitting} type="submit">
              {isSubmitting ? t("question.savingReferenceAnswer") : t("question.saveReferenceAnswer")}
            </button>
          </div>
        </form>
      ) : null}

      {!canAdd && authHint ? <p className="question-section-hint">{authHint}</p> : null}
      {items.length === 0 ? <p className="question-section-hint">{t("question.noReferenceAnswersYet")}</p> : null}

      <div className="stack-list">
        {items.map((item) => (
          <article className="list-item-card" key={item.id}>
            <div className="list-item-card__content">
              <div className="list-item-card__meta question-source-meta">
                <span>{formatAnswerFormat(item.answerFormat)}</span>
                <span>{formatBadgeLabel(item, t)}</span>
                {item.isOfficial ? <span>{t("question.sourceOfficial")}</span> : null}
                {item.contentLocale ? <span>{item.contentLocale.toUpperCase()}</span> : null}
              </div>
              <h3 className="list-item-card__title">{item.title}</h3>
              <p className="list-item-card__body question-reference-answer__body">{item.answerText}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
