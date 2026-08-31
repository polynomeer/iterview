import type { ResumeSnapshotModel } from "../../entities/resume/model";
import { ResumeSectionCard } from "./ResumeSectionCard";

type ResumeProjectsCardProps = {
  projects: ResumeSnapshotModel["projects"];
  sectionId?: string;
};

export function ResumeProjectsCard({ projects, sectionId }: ResumeProjectsCardProps) {
  return (
    <ResumeSectionCard count={projects.length} eyebrow="프로젝트" sectionId={sectionId} title="이력서에서 추출한 프로젝트 근거">
      {projects.length === 0 ? (
        <p className="page-card__body">아직 이 버전의 프로젝트 스냅샷이 없습니다.</p>
      ) : (
        <div className="stack-list">
          {projects.map((project) => (
            <article className="list-item-card resume-project-card" key={project.id}>
              <div className="list-item-card__content">
                <div className="list-item-card__meta">
                  <span>프로젝트</span>
                  {project.organizationName ? <span>{project.organizationName}</span> : null}
                  {project.roleName ? <span>{project.roleName}</span> : null}
                  <span>{project.dateLabel}</span>
                  {project.relatedExperienceId ? <span>연관 경력</span> : null}
                </div>
                <h3 className="list-item-card__title">{project.title}</h3>
                <p className="list-item-card__body">{project.summary}</p>
                {project.contentText ? (
                  <div className="resume-project-card__content">
                    <p className="resume-section__helper">프로젝트 상세</p>
                    <p className="page-card__body resume-section__body--preserve">{project.contentText}</p>
                  </div>
                ) : null}
                {project.tags.length > 0 ? (
                  <div className="insight-card__meta">
                    {project.tags.map((tag) => (
                      <span className="insight-card__chip" key={tag.id}>
                        {tag.type ? `${tag.label} · ${tag.type}` : tag.label}
                      </span>
                    ))}
                  </div>
                ) : null}
                {project.techStackText ? (
                  <p className="resume-section__helper">기술 스택: {project.techStackText}</p>
                ) : null}
              </div>
              {project.categoryName || project.categoryCode ? (
                <div className="list-item-card__actions">
                  <span className="question-status-badge question-status-badge--neutral">
                    {project.categoryName ?? project.categoryCode}
                  </span>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </ResumeSectionCard>
  );
}
