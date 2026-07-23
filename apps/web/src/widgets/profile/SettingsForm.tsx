import { FeedbackNotice } from "../../shared/ui/FeedbackNotice";
import { useLocale, type AppLocale } from "../../shared/i18n";

type SettingsFormProps = {
  className?: string;
  targetScoreThreshold: string;
  passScoreThreshold: string;
  retryEnabled: boolean;
  dailyQuestionCount: string;
  preferredLanguage: AppLocale;
  onTargetScoreThresholdChange: (value: string) => void;
  onPassScoreThresholdChange: (value: string) => void;
  onRetryEnabledChange: (value: boolean) => void;
  onDailyQuestionCountChange: (value: string) => void;
  onPreferredLanguageChange: (value: AppLocale) => void;
  onSubmit: () => void;
  isPending: boolean;
  statusMessage: string | null;
  errorMessage: string | null;
  errorDetails?: string[];
};

export function SettingsForm(props: SettingsFormProps) {
  const { t } = useLocale();
  const {
    className,
    targetScoreThreshold,
    passScoreThreshold,
    retryEnabled,
    dailyQuestionCount,
    preferredLanguage,
    onTargetScoreThresholdChange,
    onPassScoreThresholdChange,
    onRetryEnabledChange,
    onDailyQuestionCountChange,
    onPreferredLanguageChange,
    onSubmit,
    isPending,
    statusMessage,
    errorMessage,
    errorDetails = [],
  } = props;

  return (
    <section className={`page-card${className ? ` ${className}` : ""}`}>
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{t("settings.eyebrow")}</p>
          <h2 className="page-card__title">{t("settings.title")}</h2>
        </div>
      </div>
      <div className="auth-form">
        <label className="form-field">
          <span className="form-field__label">{t("settings.targetScoreThreshold")}</span>
          <input className="form-field__input" inputMode="numeric" onChange={(e) => onTargetScoreThresholdChange(e.target.value)} value={targetScoreThreshold} />
        </label>
        <label className="form-field">
          <span className="form-field__label">{t("settings.passScoreThreshold")}</span>
          <input className="form-field__input" inputMode="numeric" onChange={(e) => onPassScoreThresholdChange(e.target.value)} value={passScoreThreshold} />
        </label>
        <label className="form-field">
          <span className="form-field__label">{t("settings.dailyQuestionCount")}</span>
          <input className="form-field__input" inputMode="numeric" onChange={(e) => onDailyQuestionCountChange(e.target.value)} value={dailyQuestionCount} />
        </label>
        <label className="form-field">
          <span className="form-field__label">{t("settings.preferredLanguage")}</span>
          <select
            className="form-field__input"
            onChange={(e) => onPreferredLanguageChange(e.target.value as AppLocale)}
            value={preferredLanguage}
          >
            <option value="ko">{t("common.languageKorean")}</option>
            <option value="en">{t("common.languageEnglish")}</option>
          </select>
        </label>
        <label className="settings-toggle">
          <input checked={retryEnabled} onChange={(e) => onRetryEnabledChange(e.target.checked)} type="checkbox" />
          <span>{t("settings.retryEnabled")}</span>
        </label>
        <p className="resume-section__helper">{t("settings.helper")}</p>
        {statusMessage ? <FeedbackNotice message={statusMessage} tone="success" /> : null}
        {errorMessage ? <FeedbackNotice details={errorDetails} message={errorMessage} tone="error" /> : null}
        <div className="page-card__actions">
          <button className="primary-button" disabled={isPending} onClick={onSubmit} type="button">
            {isPending ? t("settings.savingSettings") : t("settings.saveSettings")}
          </button>
        </div>
      </div>
    </section>
  );
}
