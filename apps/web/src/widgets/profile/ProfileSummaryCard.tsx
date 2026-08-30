import type { ProfileModel } from "../../entities/profile/model";
import { useLocale } from "../../shared/i18n";
import { FeedbackNotice } from "../../shared/ui/FeedbackNotice";

type ProfileSummaryCardProps = {
  profile: ProfileModel;
  isUploadingImage?: boolean;
  imageStatusMessage?: string | null;
  imageErrorMessage?: string | null;
  imageErrorDetails?: string[];
  onImageSelect?: (file: File) => void;
};

function getInitials(label: string) {
  return label
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function ProfileSummaryCard({
  profile,
  isUploadingImage = false,
  imageStatusMessage = null,
  imageErrorMessage = null,
  imageErrorDetails = [],
  onImageSelect,
}: ProfileSummaryCardProps) {
  const { t } = useLocale();
  const initials = getInitials(profile.displayName || profile.email || "IU");

  return (
    <section className="page-card profile-summary-card">
      <div className="profile-summary-card__topline">
        <span className="page-card__label">{t("profile.summaryLabel")}</span>
        <span className="detail-chip">{t("profile.currentAccount")}</span>
      </div>
      <div className="profile-summary-card__header">
        <div className="profile-avatar">
          {profile.profileImageUrl ? (
            <img
              alt={`${profile.displayName} profile`}
              className="profile-avatar__image"
              src={profile.profileImageUrl}
            />
          ) : (
            <span className="profile-avatar__fallback">{initials}</span>
          )}
        </div>
        <div className="profile-summary-card__identity">
          <h2 className="page-card__title">{profile.displayName}</h2>
          <p className="page-card__body">{profile.email}</p>
          <div className="page-card__actions">
            <label className="secondary-button profile-image-button">
              <input
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                className="profile-image-button__input"
                disabled={isUploadingImage}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file && onImageSelect) {
                    onImageSelect(file);
                  }
                  event.target.value = "";
                }}
                type="file"
              />
              {isUploadingImage ? t("profile.uploading") : t("profile.uploadProfileImage")}
            </label>
          </div>
          {profile.profileImageUploadedAtLabel ? (
            <p className="profile-summary-card__meta">{`${t("profile.updatedPrefix")} ${profile.profileImageUploadedAtLabel}`}</p>
          ) : (
            <p className="profile-summary-card__meta">{t("profile.imageHint")}</p>
          )}
        </div>
      </div>
      {imageStatusMessage ? <FeedbackNotice message={imageStatusMessage} tone="success" /> : null}
      {imageErrorMessage ? (
        <FeedbackNotice details={imageErrorDetails} message={imageErrorMessage} tone="error" />
      ) : null}
      <div className="stats-grid">
        <article className="stat-tile">
          <p className="stat-tile__label">{t("profile.role")}</p>
          <strong className="stat-tile__value stat-tile__value--small">
            {profile.jobRole || t("profile.notSet")}
          </strong>
        </article>
        <article className="stat-tile">
          <p className="stat-tile__label">{t("profile.experience")}</p>
          <strong className="stat-tile__value stat-tile__value--small">
            {profile.yearsOfExperience || t("profile.notSet")}
          </strong>
        </article>
        <article className="stat-tile stat-tile--wide">
          <p className="stat-tile__label">{t("profile.imageFile")}</p>
          <strong className="stat-tile__value stat-tile__value--small">
            {profile.profileImageFileName || t("profile.noImageUploaded")}
          </strong>
          <p className="stat-tile__helper">
            {profile.profileImageContentType || t("profile.imageTypeHint")}
          </p>
        </article>
      </div>
      <div className="profile-summary-card__footer">
        <span className="detail-chip">{t("profile.identitySeparationHint")}</span>
      </div>
    </section>
  );
}
