import type { ResumeAnalysisModel } from "../../entities/resume/model";
import { ResumeSectionCard } from "./ResumeSectionCard";

type ResumeSkillsCardProps = {
  skills: ResumeAnalysisModel["skills"];
  sectionId?: string;
};

function getSkillLevelLabel(skill: ResumeAnalysisModel["skills"][number]) {
  if (skill.confidenceScore === undefined) {
    return "매핑된 스킬";
  }

  if (skill.confidenceScore >= 0.75) {
    return "강한 근거";
  }

  if (skill.confidenceScore >= 0.45) {
    return "보통 근거";
  }

  return "검토 필요";
}

function getSkillValueLabel(skill: ResumeAnalysisModel["skills"][number]) {
  return skill.confidenceLabel ?? skill.value ?? "신뢰도 정보 없음";
}

export function ResumeSkillsCard({ skills, sectionId }: ResumeSkillsCardProps) {
  return (
    <ResumeSectionCard count={skills.length} eyebrow="추출된 스킬" sectionId={sectionId} title="이력서 버전에서 추출한 스킬">
      <p className="page-card__body">
        근거가 강할수록 강조도가 높고, 각 스킬에 마우스를 올리면 세부 근거를 바로 확인할 수 있습니다.
      </p>
      {skills.length === 0 ? (
        <p className="page-card__body">활성 버전에서 아직 추출된 스킬이 없습니다.</p>
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
                  {skill.category ?? "일반"} · {getSkillLevelLabel(skill)}
                </span>
                <span className="resume-skill-chip__detail-value">{getSkillValueLabel(skill)}</span>
                <span className="resume-skill-chip__detail-body">
                  {skill.helperText ?? "이 스킬에 연결된 원문 근거가 아직 없습니다."}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </ResumeSectionCard>
  );
}
