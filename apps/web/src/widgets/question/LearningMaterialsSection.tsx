import { useLocale } from "../../shared/i18n";

type LearningMaterialItem = {
  id: string;
  title: string;
  description: string;
  resourceTypeLabel: string;
  sourceLabel: string;
  sourceType: string;
  sourceName: string | null;
  contentText: string | null;
  url?: string;
  contentLocale: string | null;
  isUserGenerated: boolean;
  isOfficial: boolean;
  difficultyLevel: string | null;
  estimatedMinutes: number | null;
  relationshipType: string | null;
  labelOverride: string | null;
  relevanceScore: number | null;
};

type LearningMaterialsSectionProps = {
  materials: LearningMaterialItem[];
  canAdd?: boolean;
  isComposerOpen?: boolean;
  isSubmitting?: boolean;
  submitError?: string | null;
  authHint?: string | null;
  form?: {
    title: string;
    materialType: string;
    description: string;
    contentText: string;
    contentUrl: string;
    sourceName: string;
    difficultyLevel: string;
    estimatedMinutes: string;
    relationshipType: string;
    labelOverride: string;
    relevanceScore: string;
  };
  onToggleComposer?: () => void;
  onFormChange?: (field: string, value: string) => void;
  onSubmit?: () => void;
};

function resolveMaterialSourceLabel(
  material: LearningMaterialItem,
  t: ReturnType<typeof useLocale>["t"],
) {
  if (material.isUserGenerated) {
    return t("question.sourceYourMaterial");
  }

  if (material.sourceType === "real_interview_import") {
    return t("question.sourceRealInterview");
  }

  if ((material.sourceType ?? "").toLowerCase().includes("ai")) {
    return t("question.sourceAiGenerated");
  }

  return material.sourceLabel;
}

export function LearningMaterialsSection({
  materials,
  canAdd = false,
  isComposerOpen = false,
  isSubmitting = false,
  submitError = null,
  authHint = null,
  form,
  onToggleComposer,
  onFormChange,
  onSubmit,
}: LearningMaterialsSectionProps) {
  const { locale, t } = useLocale();
  const isKorean = locale === "ko";

  return (
    <section className="page-card question-learning-materials-section">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{t("question.learningMaterialsEyebrow")}</p>
          <h2 className="page-card__title">{t("question.learningMaterialsTitle")}</h2>
        </div>
        {canAdd ? (
          <button className="secondary-button" onClick={onToggleComposer} type="button">
            {isComposerOpen ? t("question.cancelAddLearningMaterial") : t("question.addLearningMaterial")}
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
          <div className="question-inline-composer__header">
            <div>
              <p className="section-heading__eyebrow">{t("question.learningMaterialsEyebrow")}</p>
              <h3 className="question-inline-composer__title">{t("question.learningMaterialComposerTitle")}</h3>
            </div>
            <p className="question-inline-composer__hint">{t("question.learningMaterialComposerHint")}</p>
          </div>
          <div className="question-inline-composer__grid">
            <div className="form-field">
              <label className="form-field__label" htmlFor="learning-material-title">
                {t("question.learningMaterialTitleLabel")}
              </label>
              <input
                className="form-field__input"
                id="learning-material-title"
                onChange={(event) => onFormChange?.("title", event.target.value)}
                placeholder={t("question.learningMaterialTitlePlaceholder")}
                type="text"
                value={form.title}
              />
            </div>
            <div className="form-field">
              <label className="form-field__label" htmlFor="learning-material-type">
                {t("question.learningMaterialTypeLabel")}
              </label>
              <input
                className="form-field__input"
                id="learning-material-type"
                onChange={(event) => onFormChange?.("materialType", event.target.value)}
                placeholder={t("question.learningMaterialTypePlaceholder")}
                type="text"
                value={form.materialType}
              />
            </div>
          </div>
          <div className="form-field">
            <label className="form-field__label" htmlFor="learning-material-description">
              {t("question.learningMaterialDescriptionLabel")}
            </label>
            <textarea
              className="form-field__input"
              id="learning-material-description"
              onChange={(event) => onFormChange?.("description", event.target.value)}
              placeholder={t("question.learningMaterialDescriptionPlaceholder")}
              rows={3}
              value={form.description}
            />
          </div>
          <div className="form-field">
            <label className="form-field__label" htmlFor="learning-material-text">
              {t("question.learningMaterialContentTextLabel")}
            </label>
            <textarea
              className="form-field__input"
              id="learning-material-text"
              onChange={(event) => onFormChange?.("contentText", event.target.value)}
              placeholder={t("question.learningMaterialContentTextPlaceholder")}
              rows={4}
              value={form.contentText}
            />
          </div>
          <div className="question-inline-composer__grid">
            <div className="form-field">
              <label className="form-field__label" htmlFor="learning-material-url">
                {t("question.learningMaterialContentUrlLabel")}
              </label>
              <input
                className="form-field__input"
                id="learning-material-url"
                onChange={(event) => onFormChange?.("contentUrl", event.target.value)}
                placeholder="https://"
                type="url"
                value={form.contentUrl}
              />
            </div>
            <div className="form-field">
              <label className="form-field__label" htmlFor="learning-material-source-name">
                {t("question.learningMaterialSourceNameLabel")}
              </label>
              <input
                className="form-field__input"
                id="learning-material-source-name"
                onChange={(event) => onFormChange?.("sourceName", event.target.value)}
                placeholder={t("question.learningMaterialSourceNamePlaceholder")}
                type="text"
                value={form.sourceName}
              />
            </div>
          </div>
          <div className="card-grid card-grid--three-column question-inline-composer__grid question-inline-composer__grid--triple">
            <div className="form-field">
              <label className="form-field__label" htmlFor="learning-material-difficulty">
                {t("question.learningMaterialDifficultyLabel")}
              </label>
              <input
                className="form-field__input"
                id="learning-material-difficulty"
                onChange={(event) => onFormChange?.("difficultyLevel", event.target.value)}
                type="text"
                value={form.difficultyLevel}
              />
            </div>
            <div className="form-field">
              <label className="form-field__label" htmlFor="learning-material-minutes">
                {t("question.learningMaterialEstimatedMinutesLabel")}
              </label>
              <input
                className="form-field__input"
                id="learning-material-minutes"
                min="1"
                onChange={(event) => onFormChange?.("estimatedMinutes", event.target.value)}
                type="number"
                value={form.estimatedMinutes}
              />
            </div>
            <div className="form-field">
              <label className="form-field__label" htmlFor="learning-material-relationship">
                {t("question.learningMaterialRelationshipTypeLabel")}
              </label>
              <input
                className="form-field__input"
                id="learning-material-relationship"
                onChange={(event) => onFormChange?.("relationshipType", event.target.value)}
                type="text"
                value={form.relationshipType}
              />
            </div>
          </div>
          <div className="question-inline-composer__grid">
            <div className="form-field">
              <label className="form-field__label" htmlFor="learning-material-label">
                {t("question.learningMaterialLabelOverrideLabel")}
              </label>
              <input
                className="form-field__input"
                id="learning-material-label"
                onChange={(event) => onFormChange?.("labelOverride", event.target.value)}
                type="text"
                value={form.labelOverride}
              />
            </div>
            <div className="form-field">
              <label className="form-field__label" htmlFor="learning-material-relevance">
                {t("question.learningMaterialRelevanceScoreLabel")}
              </label>
              <input
                className="form-field__input"
                id="learning-material-relevance"
                onChange={(event) => onFormChange?.("relevanceScore", event.target.value)}
                step="0.1"
                type="number"
                value={form.relevanceScore}
              />
            </div>
          </div>
          {submitError ? (
            <div
              aria-live="assertive"
              className="form-feedback form-feedback--error question-inline-composer__feedback"
              role="alert"
            >
              <strong>{t("question.learningMaterialErrorTitle")}</strong>
              <p>{submitError}</p>
            </div>
          ) : null}
          <div className="page-card__actions question-inline-composer__actions">
            <button className="primary-button" disabled={isSubmitting} type="submit">
              {isSubmitting ? t("question.savingLearningMaterial") : t("question.saveLearningMaterial")}
            </button>
          </div>
        </form>
      ) : null}

      {!canAdd && authHint ? <p className="question-section-hint">{authHint}</p> : null}
      {materials.length === 0 ? (
        <p className="question-section-hint">{t("question.noLearningMaterialsYet")}</p>
      ) : null}

      <div className="stack-list">
        {materials.map((material) => (
          <article className="list-item-card question-learning-material-card" key={material.id}>
            <div className="list-item-card__content">
              <div className="list-item-card__meta question-source-meta">
                <span>{material.labelOverride ?? material.resourceTypeLabel}</span>
                <span>{resolveMaterialSourceLabel(material, t)}</span>
                {material.relationshipType ? <span>{material.relationshipType}</span> : null}
                {material.estimatedMinutes ? <span>{isKorean ? `${material.estimatedMinutes}분` : `${material.estimatedMinutes} min`}</span> : null}
                {material.contentLocale ? <span>{material.contentLocale.toUpperCase()}</span> : null}
              </div>
              <h3 className="list-item-card__title">{material.title}</h3>
              {material.description ? (
                <p className="list-item-card__body home-collection-card__item-body">{material.description}</p>
              ) : null}
              {material.contentText ? (
                <p className="list-item-card__body question-learning-material__excerpt">
                  {material.contentText}
                </p>
              ) : null}
              <div className="list-item-card__meta">
                {material.sourceName ? <span>{material.sourceName}</span> : null}
                {material.difficultyLevel ? <span>{material.difficultyLevel}</span> : null}
                {material.isOfficial ? <span>{t("question.sourceOfficial")}</span> : null}
                {material.relevanceScore !== null ? <span>{isKorean ? `관련도 ${material.relevanceScore}` : `Relevance ${material.relevanceScore}`}</span> : null}
              </div>
            </div>
            {material.url ? (
              <a className="secondary-button home-collection-card__action" href={material.url} rel="noreferrer" target="_blank">
                {t("common.openLink")}
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
