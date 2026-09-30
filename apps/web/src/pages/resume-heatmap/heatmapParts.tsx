import type { ReactNode } from "react";
import type { ResumeQuestionHeatmapQuestionModel } from "../../entities/resume-heatmap/model";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { Badge, ButtonLink, ListRow, type Tone } from "../../shared/ui/primitives";
import type { HeatmapGroup } from "./heatmapUtils";

type HeatTone = "low" | "medium" | "high" | "critical";

const HEAT: Record<HeatTone, { tone: Tone; ko: string; en: string }> = {
  critical: { tone: "danger", ko: "압박 매우 큼", en: "Very high pressure" },
  high: { tone: "warning", ko: "압박 큼", en: "High pressure" },
  medium: { tone: "accent", ko: "압박 보통", en: "Some pressure" },
  low: { tone: "neutral", ko: "압박 적음", en: "Low pressure" },
};

const GROUP: Record<HeatmapGroup, [string, string]> = {
  summary: ["요약", "Summary"],
  project: ["프로젝트", "Project"],
  experience: ["경력", "Experience"],
  skill: ["스킬", "Skill"],
  competency: ["역량", "Competency"],
  other: ["기타", "Other"],
};

const TARGET: Record<string, [string, string]> = {
  block: ["문단", "Paragraph"],
  sentence: ["문장", "Sentence"],
  phrase: ["구절", "Phrase"],
  keyword: ["키워드", "Keyword"],
};

export function useHeatmapCopy() {
  const { locale } = useLocale();
  const copy = (ko: string, en: string) => (locale === "ko" ? ko : en);
  return {
    copy,
    heat: (tone: HeatTone) => ({ tone: HEAT[tone].tone, label: copy(HEAT[tone].ko, HEAT[tone].en) }),
    group: (group: HeatmapGroup) => copy(...GROUP[group]),
    target: (type: string | null) => (type && TARGET[type] ? copy(...TARGET[type]) : copy("하이라이트", "Highlight")),
  };
}

export function HeatBadge({ tone }: { tone: HeatTone }) {
  const { heat } = useHeatmapCopy();
  const { tone: badgeTone, label } = heat(tone);
  return (
    <Badge dot tone={badgeTone}>
      {label}
    </Badge>
  );
}

/** 질문 3 · 꼬리질문 2 · 약한 답변 1, skipping zeros after the first. */
export function PressureCounts({ questions, followUps, pressure, weak }: { questions: number; followUps: number; pressure: number; weak: number }) {
  const { copy } = useHeatmapCopy();
  const parts = [
    copy(`질문 ${questions}`, `${questions} questions`),
    followUps > 0 ? copy(`꼬리질문 ${followUps}`, `${followUps} follow-ups`) : null,
    pressure > 0 ? copy(`압박 ${pressure}`, `${pressure} pressure`) : null,
  ].filter(Boolean);
  return (
    <span className="heatmap-counts">
      {parts.join(" · ")}
      {weak > 0 ? <strong className="ui-tone-text--danger">{copy(` · 약한 답변 ${weak}`, ` · ${weak} weak`)}</strong> : null}
    </span>
  );
}

/** One interview question that landed on a resume claim, with where to go next. */
export function LinkedQuestionRow({ question, action }: { question: ResumeQuestionHeatmapQuestionModel; action?: ReactNode }) {
  const { copy } = useHeatmapCopy();
  return (
    <ListRow
      className="heatmap-question"
      meta={
        <span className="heatmap-question__meta">
          {question.isFollowUp ? <Badge tone="accent">{copy("꼬리질문", "Follow-up")}</Badge> : null}
          {question.pressureQuestion ? <Badge tone="warning">{copy("압박", "Pressure")}</Badge> : null}
          {question.weakAnswer ? <Badge tone="danger">{copy("약한 답변", "Weak answer")}</Badge> : null}
          {question.weaknessTags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
          <span>{question.interviewDateLabel ?? copy("면접 일자 없음", "No interview date")}</span>
        </span>
      }
      title={question.text}
      trailing={
        <span className="heatmap-question__actions">
          <ButtonLink
            size="sm"
            to={routeConfig.practicalInterviewQuestion.buildPath({ recordId: question.sourceInterviewRecordId, questionId: question.interviewRecordQuestionId })}
            variant="ghost"
          >
            {copy("면접 복기", "Interview review")}
          </ButtonLink>
          {question.linkedQuestionId ? (
            <ButtonLink size="sm" to={routeConfig.answerEditor.buildPath({ questionId: question.linkedQuestionId })}>
              {copy("다시 답해보기", "Practice it")}
            </ButtonLink>
          ) : null}
          {action}
        </span>
      }
    />
  );
}
