import type {
  SkillGapResponseDto,
  SkillProgressResponseDto,
  SkillRadarResponseDto,
} from "../../shared/types/skill-intelligence";
import { toArray } from "../../shared/lib/collection";
import { formatApiDateTime } from "../../shared/lib/date";

export type SkillRadarModel = {
  updatedAtLabel: string | null;
  categories: Array<{
    id: string;
    code: string | null;
    benchmarkScore: number | null;
    gapScore: number | null;
    label: string;
    score: number;
    scoreLabel: string;
    benchmarkLabel?: string;
    helperText?: string;
  }>;
};

export type SkillGapModel = {
  items: Array<{
    id: string;
    label: string;
    gapScoreLabel: string;
    benchmarkLabel?: string;
    recommendedAction?: string;
    priorityLabel?: string;
  }>;
};

export type SkillProgressModel = {
  items: Array<{
    id: string;
    code: string | null;
    score: number | null;
    benchmarkScore: number | null;
    gapScore: number | null;
    answeredQuestionCount: number;
    weakQuestionCount: number;
    label: string;
    scoreLabel: string;
    benchmarkLabel?: string;
    gapLabel?: string;
    answeredQuestionCountLabel: string;
    weakQuestionCountLabel: string;
    calculatedAtLabel?: string;
  }>;
};

export function mapSkillRadarResponseDtoToModel(response: SkillRadarResponseDto): SkillRadarModel {
  return {
    updatedAtLabel: formatApiDateTime(response.updatedAt) ?? null,
    categories: toArray(response.categories).map((category, index) => ({
      id: category.categoryCode ?? category.label ?? `skill-${index}`,
      code: category.categoryCode ?? null,
      benchmarkScore: category.benchmarkScore ?? null,
      gapScore: category.gapScore ?? null,
      label: category.label ?? "Skill",
      score: category.score ?? 0,
      scoreLabel:
        category.score === null || category.score === undefined ? "-" : String(category.score),
      benchmarkLabel:
        category.benchmarkScore === null || category.benchmarkScore === undefined
          ? undefined
          : `Benchmark ${category.benchmarkScore}`,
      helperText:
        category.gapScore === null || category.gapScore === undefined
          ? undefined
          : `Gap ${category.gapScore}`,
    })),
  };
}

export function mapSkillGapResponseDtoToModel(response: SkillGapResponseDto): SkillGapModel {
  return {
    items: toArray(response).map((item, index) => ({
      id: item.categoryCode ?? item.label ?? `gap-${index}`,
      label: item.label ?? "Gap",
      gapScoreLabel:
        item.gapScore === null || item.gapScore === undefined ? "-" : String(item.gapScore),
      benchmarkLabel:
        item.benchmarkScore === null || item.benchmarkScore === undefined
          ? undefined
          : `Benchmark ${item.benchmarkScore}`,
      recommendedAction:
        item.score === null || item.score === undefined
          ? undefined
          : `Current score ${item.score}. Focus on repeat practice in this category.`,
      priorityLabel:
        item.gapScore !== null && item.gapScore !== undefined && item.gapScore >= 20
          ? "High priority"
          : undefined,
    })),
  };
}

export function mapSkillProgressResponseDtoToModel(response: SkillProgressResponseDto): SkillProgressModel {
  return {
    items: toArray(response).map((item, index) => ({
      id: item.categoryCode ?? item.label ?? `progress-${index}`,
      code: item.categoryCode ?? null,
      score: item.score ?? null,
      benchmarkScore: item.benchmarkScore ?? null,
      gapScore: item.gapScore ?? null,
      answeredQuestionCount: item.answeredQuestionCount ?? 0,
      weakQuestionCount: item.weakQuestionCount ?? 0,
      label: item.label ?? "Skill",
      scoreLabel: item.score === null || item.score === undefined ? "-" : String(item.score),
      benchmarkLabel:
        item.benchmarkScore === null || item.benchmarkScore === undefined
          ? undefined
          : `Benchmark ${item.benchmarkScore}`,
      gapLabel:
        item.gapScore === null || item.gapScore === undefined ? undefined : `Gap ${item.gapScore}`,
      answeredQuestionCountLabel: String(item.answeredQuestionCount ?? 0),
      weakQuestionCountLabel: String(item.weakQuestionCount ?? 0),
      calculatedAtLabel: formatApiDateTime(item.calculatedAt) ?? undefined,
    })),
  };
}
