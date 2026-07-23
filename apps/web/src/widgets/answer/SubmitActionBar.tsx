import { FeedbackNotice } from "../../shared/ui/FeedbackNotice";
import { useLocale } from "../../shared/i18n";

type SubmitActionBarProps = {
  isSubmitDisabled: boolean;
  isPending: boolean;
  validationMessage: string | null;
  errorMessage: string | null;
  errorDetails?: string[];
  infoMessage?: string | null;
  onSubmit: () => void;
};

export function SubmitActionBar({
  isSubmitDisabled,
  isPending,
  validationMessage,
  errorMessage,
  errorDetails = [],
  infoMessage,
  onSubmit,
}: SubmitActionBarProps) {
  const { t } = useLocale();

  return (
    <section className="page-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{t("answer.submitEyebrow")}</p>
          <h2 className="page-card__title">{t("answer.submitTitle")}</h2>
        </div>
      </div>
      {infoMessage ? <FeedbackNotice message={infoMessage} tone="info" /> : null}
      {validationMessage ? <FeedbackNotice message={validationMessage} tone="error" /> : null}
      {errorMessage ? <FeedbackNotice details={errorDetails} message={errorMessage} tone="error" /> : null}
      <div className="page-card__actions">
        <button
          className="primary-button"
          disabled={isSubmitDisabled || isPending}
          onClick={onSubmit}
          type="button"
        >
          {isPending ? t("answer.submitting") : t("interview.submitAnswer")}
        </button>
      </div>
    </section>
  );
}
