import type { ResumeAnalysisModel } from "../../entities/resume/model";
import { ResumeSectionCard } from "./ResumeSectionCard";

type ResumeSkillsCardProps = {
  skills: ResumeAnalysisModel["skills"];
  sectionId?: string;
};

function getSkillLevelLabel(skill: ResumeAnalysisModel["skills"][number]) {
  if (skill.confidenceScore === undefined) {
    return "Mapped skill";
  }

  if (skill.confidenceScore >= 0.75) {
    return "Strong signal";
  }

  if (skill.confidenceScore >= 0.45) {
    return "Moderate signal";
  }

  return "Needs review";
}

function getSkillValueLabel(skill: ResumeAnalysisModel["skills"][number]) {
  return skill.confidenceLabel ?? skill.value ?? "No confidence metadata";
}

export function ResumeSkillsCard({ skills, sectionId }: ResumeSkillsCardProps) {
  return (
    <ResumeSectionCard count={skills.length} eyebrow="Parsed skills" sectionId={sectionId} title="Skills extracted from this resume version">
      <p className="page-card__body">
        Stronger evidence stays more saturated, and each label opens a small detail preview on hover.
      </p>
      {skills.length === 0 ? (
        <p className="page-card__body">No parsed skills are available yet for the active version.</p>
      ) : (
        <div className="resume-skills-card__chip-cloud">
          {skills.map((skill) => (
            <button
              className={`resume-skill-chip resume-skill-chip--${skill.tone}`}
              key={skill.id}
              type="button"
            >
              <span className="resume-skill-chip__name">{skill.label}</span>
              <span className="resume-skill-chip__detail">
                <span className="resume-skill-chip__detail-title">{skill.label}</span>
                <span className="resume-skill-chip__detail-meta">
                  {skill.category ?? "General"} · {getSkillLevelLabel(skill)}
                </span>
                <span className="resume-skill-chip__detail-value">{getSkillValueLabel(skill)}</span>
                <span className="resume-skill-chip__detail-body">
                  {skill.helperText ?? "No source snippet was attached to this skill."}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </ResumeSectionCard>
  );
}
