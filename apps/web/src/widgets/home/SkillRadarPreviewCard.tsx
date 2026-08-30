import type { HomeModel } from "../../entities/home/model";
import { useLocale } from "../../shared/i18n";
import { SkillSummaryBlock } from "../../shared/ui/SkillSummaryBlock";

type SkillRadarPreviewCardProps = {
  items: HomeModel["skillRadarPreview"];
};

export function SkillRadarPreviewCard({ items }: SkillRadarPreviewCardProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <SkillSummaryBlock
      emptyMessage={
        isKorean
          ? "아직 스킬 레이더 데이터가 없습니다. 질문에 계속 답하며 카테고리 단위 준비도를 쌓아보세요."
          : "Skill radar data is not available yet. Keep answering questions to build category-level readiness."
      }
      eyebrow={isKorean ? "스킬 레이더" : "Skill radar"}
      items={items.map((item) => ({
        id: item.id,
        label: item.label,
        value: item.scoreLabel,
        helperText: item.helperText,
        tone: "accent",
      }))}
      title={isKorean ? "스킬별 현재 준비도" : "Current readiness by skill"}
    />
  );
}
