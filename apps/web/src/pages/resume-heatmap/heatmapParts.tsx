import type { ReactNode } from "react";
import type { ResumeQuestionHeatmapQuestionModel } from "../../entities/resume-heatmap/model";
import { routeConfig } from "../../shared/config/routes";
import { useLocale, type MessageKey } from "../../shared/i18n";
import { weaknessTagLabel } from "../../shared/lib/labels";
import { Badge, ButtonLink, ListRow, type Tone } from "../../shared/ui/primitives";
import type { HeatmapGroup } from "./heatmapUtils";

type HeatTone = "low" | "medium" | "high" | "critical";

const HEAT: Record<HeatTone, { tone: Tone; label: MessageKey }> = {
  critical: { tone: "danger", label: "resumeHeatmap.heatCritical" },
  high: { tone: "warning", label: "resumeHeatmap.heatHigh" },
  medium: { tone: "accent", label: "resumeHeatmap.heatMedium" },
  low: { tone: "neutral", label: "resumeHeatmap.heatLow" },
};

const GROUP: Record<HeatmapGroup, MessageKey> = {
  summary: "resumeHeatmap.groupSummary",
  project: "resumeHeatmap.groupProject",
  experience: "resumeHeatmap.groupExperience",
  skill: "resumeHeatmap.groupSkill",
  competency: "resumeHeatmap.groupCompetency",
  other: "resumeHeatmap.groupOther",
};

const TARGET: Record<string, MessageKey> = {
  block: "resumeHeatmap.targetBlock",
  sentence: "resumeHeatmap.targetSentence",
  phrase: "resumeHeatmap.targetPhrase",
  keyword: "resumeHeatmap.targetKeyword",
};

/** `t` plus the localized heat, group, and highlight-unit labels the heatmap screens share. */
export function useHeatmapLabels() {
  const { t } = useLocale();
  return {
    t,
    heat: (tone: HeatTone) => ({ tone: HEAT[tone].tone, label: t(HEAT[tone].label) }),
    group: (group: HeatmapGroup) => t(GROUP[group]),
    target: (type: string | null) => (type && TARGET[type] ? t(TARGET[type]) : t("resumeHeatmap.highlight")),
  };
}

export function HeatBadge({ tone }: { tone: HeatTone }) {
  const { heat } = useHeatmapLabels();
  const { tone: badgeTone, label } = heat(tone);
  return (
    <Badge dot tone={badgeTone}>
      {label}
    </Badge>
  );
}

/** 질문 3 · 꼬리질문 2 · 약한 답변 1, skipping zeros after the first. */
export function PressureCounts({ questions, followUps, pressure, weak }: { questions: number; followUps: number; pressure: number; weak: number }) {
  const { t } = useLocale();
  const parts = [
    t("resumeHeatmap.questionCount", { questions }),
    followUps > 0 ? t("resumeHeatmap.followUpCount", { followUps }) : null,
    pressure > 0 ? t("resumeHeatmap.pressureCount", { pressure }) : null,
  ].filter(Boolean);
  return (
    <span className="heatmap-counts">
      {parts.join(" · ")}
      {weak > 0 ? <strong className="ui-tone-text--danger">{t("resumeHeatmap.weakAnswerCount", { weak })}</strong> : null}
    </span>
  );
}

/** One interview question that landed on a resume claim, with where to go next. */
export function LinkedQuestionRow({ question, action }: { question: ResumeQuestionHeatmapQuestionModel; action?: ReactNode }) {
  const { t, locale } = useLocale();
  return (
    <ListRow
      className="heatmap-question"
      meta={
        <span className="heatmap-question__meta">
          {question.isFollowUp ? <Badge tone="accent">{t("resumeHeatmap.followUp")}</Badge> : null}
          {question.pressureQuestion ? <Badge tone="warning">{t("resumeHeatmap.pressure")}</Badge> : null}
          {question.weakAnswer ? <Badge tone="danger">{t("resumeHeatmap.weakAnswer")}</Badge> : null}
          {question.weaknessTags.map((tag) => (
            <Badge key={tag}>{weaknessTagLabel(tag, locale)}</Badge>
          ))}
          <span>{question.interviewDateLabel ?? t("resumeHeatmap.noInterviewDate")}</span>
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
            {t("resumeHeatmap.interviewReview")}
          </ButtonLink>
          {question.linkedQuestionId ? (
            <ButtonLink size="sm" to={routeConfig.answerEditor.buildPath({ questionId: question.linkedQuestionId })}>
              {t("resumeHeatmap.practiceIt")}
            </ButtonLink>
          ) : null}
          {action}
        </span>
      }
    />
  );
}
