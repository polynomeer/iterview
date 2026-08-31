import { useState } from "react";
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
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);

  return (
    <ResumeSectionCard count={skills.length} eyebrow="추출된 스킬" sectionId={sectionId} title="이력서 버전에서 추출한 스킬">
      {skills.length === 0 ? (
        <p className="page-card__body">활성 버전에서 아직 추출된 스킬이 없습니다.</p>
      ) : (
        <div className="resume-skills-card__chip-cloud">
          {skills.map((skill) => (
            <button
              aria-pressed={activeSkillId === skill.id}
              className={`resume-skill-chip resume-skill-chip--${skill.tone}${activeSkillId === skill.id ? " resume-skill-chip--active" : ""}`}
              key={skill.id}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setActiveSkillId((current) => (current === skill.id ? null : current));
                }
              }}
              onClick={() => {
                setActiveSkillId((current) => (current === skill.id ? null : skill.id));
              }}
              onFocus={() => {
                setActiveSkillId(skill.id);
              }}
              onMouseEnter={() => {
                setActiveSkillId(skill.id);
              }}
              onMouseLeave={() => {
                setActiveSkillId((current) => (current === skill.id ? null : current));
              }}
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
