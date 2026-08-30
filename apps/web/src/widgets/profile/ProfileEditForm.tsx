import { FeedbackNotice } from "../../shared/ui/FeedbackNotice";
import { useLocale } from "../../shared/i18n";

type ProfileEditFormProps = {
  className?: string;
  nickname: string;
  jobRole: string;
  yearsOfExperience: string;
  onNicknameChange: (value: string) => void;
  onJobRoleChange: (value: string) => void;
  onYearsOfExperienceChange: (value: string) => void;
  onSubmit: () => void;
  isPending: boolean;
  statusMessage: string | null;
  errorMessage: string | null;
  errorDetails?: string[];
};

export function ProfileEditForm(props: ProfileEditFormProps) {
  const { t } = useLocale();
  const {
    className,
    nickname,
    jobRole,
    yearsOfExperience,
    onNicknameChange,
    onJobRoleChange,
    onYearsOfExperienceChange,
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
          <p className="section-heading__eyebrow">{t("profile.profileDetails")}</p>
          <h2 className="page-card__title">{t("profile.editProfile")}</h2>
        </div>
      </div>
      <div className="auth-form">
        <label className="form-field">
          <span className="form-field__label">{t("profile.nickname")}</span>
          <input className="form-field__input" onChange={(e) => onNicknameChange(e.target.value)} value={nickname} />
        </label>
        <label className="form-field">
          <span className="form-field__label">{t("profile.jobRoleField")}</span>
          <input className="form-field__input" onChange={(e) => onJobRoleChange(e.target.value)} value={jobRole} />
        </label>
        <label className="form-field">
          <span className="form-field__label">{t("profile.yearsOfExperienceField")}</span>
          <input
            className="form-field__input"
            inputMode="numeric"
            onChange={(e) => onYearsOfExperienceChange(e.target.value)}
            value={yearsOfExperience}
          />
        </label>
        {statusMessage ? <FeedbackNotice message={statusMessage} tone="success" /> : null}
        {errorMessage ? <FeedbackNotice details={errorDetails} message={errorMessage} tone="error" /> : null}
        <div className="page-card__actions">
          <button className="primary-button" disabled={isPending} onClick={onSubmit} type="button">
            {isPending ? t("profile.saving") : t("profile.saveProfile")}
          </button>
        </div>
      </div>
    </section>
  );
}
