import type { ResumeSnapshotModel } from "../../entities/resume/model";
import { ResumeSectionCard } from "./ResumeSectionCard";

type ResumeProfileCardProps = {
  profile: ResumeSnapshotModel["profile"];
  sectionId?: string;
};

export function ResumeProfileCard({ profile, sectionId }: ResumeProfileCardProps) {
  return (
    <ResumeSectionCard eyebrow="프로필 요약" sectionId={sectionId} title="후보자 개요">
      {profile ? (
        <div className="stack-list">
          <article className="list-item-card resume-profile-card">
            <div className="list-item-card__content">
              <div className="resume-profile-card__identity">
                <div className="list-item-card__meta">
                  {(profile.locationText || profile.yearsOfExperienceText) ? (
                    <span>{[profile.locationText, profile.yearsOfExperienceText].filter(Boolean).join(" · ")}</span>
                  ) : null}
                  {profile.sourceText ? <span>{`출처 ${profile.sourceText}`}</span> : null}
                </div>
                <h3 className="resume-profile-card__name">{profile.fullName ?? "이름 미확인 후보자"}</h3>
                {profile.headline ? <p className="resume-profile-card__headline">{profile.headline}</p> : null}
              </div>
              <p className="list-item-card__body">
                {profile.summaryText ?? "아직 이 버전에서 추출된 요약이 없습니다."}
              </p>
            </div>
          </article>
        </div>
      ) : (
        <p className="page-card__body">아직 이 버전에서 프로필 요약이 추출되지 않았습니다.</p>
      )}
    </ResumeSectionCard>
  );
}
