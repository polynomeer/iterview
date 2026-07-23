import type { ResumeSnapshotModel } from "../../entities/resume/model";
import { ResumeSectionCard } from "./ResumeSectionCard";

type ResumeProjectsCardProps = {
  projects: ResumeSnapshotModel["projects"];
  sectionId?: string;
};

export function ResumeProjectsCard({ projects, sectionId }: ResumeProjectsCardProps) {
  return (
    <ResumeSectionCard count={projects.length} eyebrow="Projects" sectionId={sectionId} title="Project evidence extracted from your resume">
      {projects.length === 0 ? (
        <p className="page-card__body">No project snapshots are available for this version yet.</p>
      ) : (
        <div className="stack-list">
          {projects.map((project) => (
            <article className="page-card page-card--muted" key={project.id}>
              <div className="section-heading">
                <div>
                  <p className="section-heading__eyebrow">Project</p>
                  <h3 className="page-card__title">{project.title}</h3>
                </div>
                {project.categoryName || project.categoryCode ? (
                  <span className="question-status-badge question-status-badge--neutral">
                    {project.categoryName ?? project.categoryCode}
                  </span>
                ) : null}
              </div>
              <div className="list-item-card__meta">
                {project.organizationName ? <span>{project.organizationName}</span> : null}
                {project.roleName ? <span>{project.roleName}</span> : null}
                <span>{project.dateLabel}</span>
                {project.relatedExperienceId ? <span>Related experience</span> : null}
              </div>
              <p className="page-card__body">{project.summary}</p>
              {project.contentText ? (
                <div className="resume-project-card__content">
                  <p className="resume-section__helper">Project content</p>
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
                <p className="resume-section__helper">Tech stack: {project.techStackText}</p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </ResumeSectionCard>
  );
}
