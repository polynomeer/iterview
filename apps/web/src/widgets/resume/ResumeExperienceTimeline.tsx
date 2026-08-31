import type { ResumeSnapshotModel } from "../../entities/resume/model";
import { ResumeSectionCard } from "./ResumeSectionCard";

type ResumeExperienceTimelineProps = {
  experiences: ResumeSnapshotModel["experiences"];
  sectionId?: string;
};

export function ResumeExperienceTimeline({ experiences, sectionId }: ResumeExperienceTimelineProps) {
  return (
    <ResumeSectionCard count={experiences.length} eyebrow="경력 타임라인" sectionId={sectionId} title="이력서에서 추출한 업무 이력">
      {experiences.length === 0 ? (
        <p className="page-card__body">아직 이 버전의 경력 타임라인이 없습니다.</p>
      ) : (
        <div className="stack-list">
          {experiences.map((experience) => (
            <article className="list-item-card resume-experience-card" key={experience.id}>
              <div className="list-item-card__content">
                <div className="list-item-card__meta">
                  <span>{experience.companyName}</span>
                  <span>{experience.roleName}</span>
                  {experience.employmentType ? <span>{experience.employmentType}</span> : null}
                  <span>{experience.dateLabel}</span>
                  {experience.current ? <span>현재</span> : null}
                </div>
                <h3 className="list-item-card__title">
                  {[experience.companyName, experience.roleName].filter(Boolean).join(" · ")}
                </h3>
                <p className="list-item-card__body">{experience.summary}</p>
                {(experience.impactText || experience.projectName) ? (
                  <div className="list-item-card__meta resume-experience-card__meta">
                    {experience.impactText ? <span>{`임팩트 ${experience.impactText}`}</span> : null}
                    {experience.projectName ? <span>{`프로젝트 ${experience.projectName}`}</span> : null}
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </ResumeSectionCard>
  );
}
