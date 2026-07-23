import type { ResumeSnapshotModel } from "../../entities/resume/model";
import { ResumeSectionCard } from "./ResumeSectionCard";

type ResumeProfileCardProps = {
  profile: ResumeSnapshotModel["profile"];
  sectionId?: string;
};

export function ResumeProfileCard({ profile, sectionId }: ResumeProfileCardProps) {
  return (
    <ResumeSectionCard eyebrow="Profile summary" sectionId={sectionId} title="Candidate overview">
      {profile ? (
        <div className="stack-list">
          <div className="resume-profile-card__identity">
            <h3 className="resume-profile-card__name">{profile.fullName ?? "Unnamed candidate"}</h3>
            {profile.headline ? <p className="resume-profile-card__headline">{profile.headline}</p> : null}
            {(profile.locationText || profile.yearsOfExperienceText) ? (
              <p className="page-card__body">
                {[profile.locationText, profile.yearsOfExperienceText].filter(Boolean).join(" · ")}
              </p>
            ) : null}
          </div>
          <p className="page-card__body">
            {profile.summaryText ?? "No summary text was extracted for this version yet."}
          </p>
          {profile.sourceText ? (
            <p className="resume-section__helper">Source: {profile.sourceText}</p>
          ) : null}
        </div>
      ) : (
        <p className="page-card__body">No profile summary was extracted for this version yet.</p>
      )}
    </ResumeSectionCard>
  );
}
