import type { MessageKey } from "../../shared/i18n/messages";
import { routeConfig } from "../../shared/config/routes";

export type CommandPaletteSection =
  | "commandPalette.sectionQuestions"
  | "commandPalette.sectionSkills"
  | "commandPalette.sectionResumeEvidence"
  | "commandPalette.sectionCompanies"
  | "commandPalette.sectionNotes"
  | "commandPalette.sectionCommands";

export type CommandPaletteItem = {
  id: string;
  titleKey: MessageKey;
  subtitleKey: MessageKey;
  sectionKey: CommandPaletteSection;
  to: string;
  keywords: string[];
};

export function getCommandPaletteItems(): CommandPaletteItem[] {
  return [
    {
      id: "question-distributed-lock-tree",
      titleKey: "commandPalette.itemQuestionDistributedLockTitle",
      subtitleKey: "commandPalette.itemQuestionDistributedLockSubtitle",
      sectionKey: "commandPalette.sectionQuestions",
      to: routeConfig.questionTree.buildPath({ questionId: "distributed-lock" }),
      keywords: ["transaction", "distributed", "lock", "race", "consistency", "dfs"],
    },
    {
      id: "question-transactional-detail",
      titleKey: "commandPalette.itemQuestionTransactionalTitle",
      subtitleKey: "commandPalette.itemQuestionTransactionalSubtitle",
      sectionKey: "commandPalette.sectionQuestions",
      to: routeConfig.questionDetail.buildPath({ questionId: "transactional-isolation" }),
      keywords: ["transaction", "isolation", "spring", "database", "question"],
    },
    {
      id: "question-kafka-answer",
      titleKey: "commandPalette.itemQuestionKafkaTitle",
      subtitleKey: "commandPalette.itemQuestionKafkaSubtitle",
      sectionKey: "commandPalette.sectionQuestions",
      to: routeConfig.answerEditor.buildPath({ questionId: "kafka-rebalance" }),
      keywords: ["kafka", "rebalance", "consumer", "answer", "retry"],
    },
    {
      id: "skill-distributed-systems",
      titleKey: "commandPalette.itemSkillDistributedTitle",
      subtitleKey: "commandPalette.itemSkillDistributedSubtitle",
      sectionKey: "commandPalette.sectionSkills",
      to: `${routeConfig.skills.buildPath()}?focus=distributed-systems`,
      keywords: ["skill", "distributed", "system", "backend", "transaction"],
    },
    {
      id: "skill-behavioral-ownership",
      titleKey: "commandPalette.itemSkillOwnershipTitle",
      subtitleKey: "commandPalette.itemSkillOwnershipSubtitle",
      sectionKey: "commandPalette.sectionSkills",
      to: `${routeConfig.skills.buildPath()}?focus=ownership`,
      keywords: ["behavioral", "ownership", "conflict", "leadership", "story"],
    },
    {
      id: "resume-settlement-experience",
      titleKey: "commandPalette.itemResumeSettlementTitle",
      subtitleKey: "commandPalette.itemResumeSettlementSubtitle",
      sectionKey: "commandPalette.sectionResumeEvidence",
      to: `${routeConfig.resume.buildPath()}?focus=settlement-platform`,
      keywords: ["resume", "experience", "settlement", "payments", "project", "proof"],
    },
    {
      id: "resume-metrics-analysis",
      titleKey: "commandPalette.itemResumeMetricsTitle",
      subtitleKey: "commandPalette.itemResumeMetricsSubtitle",
      sectionKey: "commandPalette.sectionResumeEvidence",
      to: `${routeConfig.resumeAnalysis.buildPath()}?focus=metrics-proof`,
      keywords: ["resume", "analysis", "metrics", "evidence", "impact", "truth"],
    },
    {
      id: "company-stripe",
      titleKey: "commandPalette.itemCompanyStripeTitle",
      subtitleKey: "commandPalette.itemCompanyStripeSubtitle",
      sectionKey: "commandPalette.sectionCompanies",
      to: `${routeConfig.targetCompanies.buildPath()}?company=stripe`,
      keywords: ["company", "stripe", "payments", "readiness", "prep"],
    },
    {
      id: "company-meta",
      titleKey: "commandPalette.itemCompanyMetaTitle",
      subtitleKey: "commandPalette.itemCompanyMetaSubtitle",
      sectionKey: "commandPalette.sectionCompanies",
      to: `${routeConfig.targetCompanies.buildPath()}?company=meta`,
      keywords: ["company", "meta", "scale", "system", "infra"],
    },
    {
      id: "notes-metrics-tag",
      titleKey: "commandPalette.itemNotesMetricsTitle",
      subtitleKey: "commandPalette.itemNotesMetricsSubtitle",
      sectionKey: "commandPalette.sectionNotes",
      to: `${routeConfig.notes.buildPath()}?tag=metrics`,
      keywords: ["notes", "metrics", "numbers", "evidence", "snippet"],
    },
    {
      id: "notes-kafka-tag",
      titleKey: "commandPalette.itemNotesKafkaTitle",
      subtitleKey: "commandPalette.itemNotesKafkaSubtitle",
      sectionKey: "commandPalette.sectionNotes",
      to: `${routeConfig.notes.buildPath()}?tag=kafka`,
      keywords: ["notes", "kafka", "incident", "timeline", "review"],
    },
    {
      id: "command-start-interview",
      titleKey: "commandPalette.itemCommandStartInterviewTitle",
      subtitleKey: "commandPalette.itemCommandStartInterviewSubtitle",
      sectionKey: "commandPalette.sectionCommands",
      to: routeConfig.interview.buildPath(),
      keywords: ["command", "start", "interview", "session", "practice"],
    },
    {
      id: "command-open-review-queue",
      titleKey: "commandPalette.itemCommandOpenReviewQueueTitle",
      subtitleKey: "commandPalette.itemCommandOpenReviewQueueSubtitle",
      sectionKey: "commandPalette.sectionCommands",
      to: routeConfig.reviewQueue.buildPath(),
      keywords: ["command", "review", "queue", "retry", "dfs"],
    },
    {
      id: "command-open-weak-nodes",
      titleKey: "commandPalette.itemCommandOpenWeakNodesTitle",
      subtitleKey: "commandPalette.itemCommandOpenWeakNodesSubtitle",
      sectionKey: "commandPalette.sectionCommands",
      to: routeConfig.weakNodes.buildPath(),
      keywords: ["command", "weak", "nodes", "graph", "remediation"],
    },
    {
      id: "command-open-resume",
      titleKey: "commandPalette.itemCommandOpenResumeTitle",
      subtitleKey: "commandPalette.itemCommandOpenResumeSubtitle",
      sectionKey: "commandPalette.sectionCommands",
      to: routeConfig.resume.buildPath(),
      keywords: ["command", "resume", "source of truth", "authoring"],
    },
  ];
}
