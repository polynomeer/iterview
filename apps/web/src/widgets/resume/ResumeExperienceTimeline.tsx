import type { ResumeSnapshotModel } from "../../entities/resume/model";
import { ResumeSectionCard } from "./ResumeSectionCard";

type ResumeExperienceTimelineProps = {
  experiences: ResumeSnapshotModel["experiences"];
  sectionId?: string;
};

export function ResumeExperienceTimeline({ experiences, sectionId }: ResumeExperienceTimelineProps) {
  return (
    <ResumeSectionCard count={experiences.length} eyebrow="Experience timeline" sectionId={sectionId} title="Work history extracted from your resume">
      {experiences.length === 0 ? (
        <p className="page-card__body">No experience timeline entries are available for this version yet.</p>
      ) : (
        <div className="stack-list">
          {experiences.map((experience) => (
            <article className="list-item-card" key={experience.id}>
              <div className="list-item-card__content">
                <div className="list-item-card__meta">
                  <span>{experience.companyName}</span>
                  <span>{experience.roleName}</span>
                  {experience.employmentType ? <span>{experience.employmentType}</span> : null}
                  <span>{experience.dateLabel}</span>
                  {experience.current ? <span>Current</span> : null}
                </div>
                <h3 className="list-item-card__title">
                  {[experience.companyName, experience.roleName].filter(Boolean).join(" · ")}
                </h3>
                <p className="list-item-card__body">{experience.summary}</p>
                {experience.impactText ? (
                  <p className="resume-section__helper">Impact: {experience.impactText}</p>
                ) : null}
                {experience.projectName ? (
                  <p className="resume-section__helper">Project: {experience.projectName}</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </ResumeSectionCard>
  );
}
