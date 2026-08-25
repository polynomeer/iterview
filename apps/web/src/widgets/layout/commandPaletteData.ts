import { routeConfig } from "../../shared/config/routes";

export type CommandPaletteItem = {
  id: string;
  title: string;
  subtitle: string;
  section: "Questions" | "Skills" | "Resume Evidence" | "Companies" | "Notes" | "Commands";
  to: string;
  keywords: string[];
};

export const commandPaletteItems: CommandPaletteItem[] = [
  {
    id: "question-distributed-lock-tree",
    title: "Distributed lock failure path",
    subtitle: "Question Tree · walk the DFS branch for concurrency tradeoffs",
    section: "Questions",
    to: routeConfig.questionTree.buildPath({ questionId: "distributed-lock" }),
    keywords: ["transaction", "distributed", "lock", "race", "consistency", "dfs"],
  },
  {
    id: "question-transactional-detail",
    title: "@Transactional isolation interview question",
    subtitle: "Question Detail · inspect weak claims and follow-up prompts",
    section: "Questions",
    to: routeConfig.questionDetail.buildPath({ questionId: "transactional-isolation" }),
    keywords: ["transaction", "isolation", "spring", "database", "question"],
  },
  {
    id: "question-kafka-answer",
    title: "Kafka rebalance answer draft",
    subtitle: "Answer Editor · tighten the explanation before the next retry",
    section: "Questions",
    to: routeConfig.answerEditor.buildPath({ questionId: "kafka-rebalance" }),
    keywords: ["kafka", "rebalance", "consumer", "answer", "retry"],
  },
  {
    id: "skill-distributed-systems",
    title: "Distributed systems focus board",
    subtitle: "Skills · queue backend topics that still break under follow-up",
    section: "Skills",
    to: `${routeConfig.skills.buildPath()}?focus=distributed-systems`,
    keywords: ["skill", "distributed", "system", "backend", "transaction"],
  },
  {
    id: "skill-behavioral-ownership",
    title: "Ownership and conflict handling skill",
    subtitle: "Skills · rehearse story structure and evidence density",
    section: "Skills",
    to: `${routeConfig.skills.buildPath()}?focus=ownership`,
    keywords: ["behavioral", "ownership", "conflict", "leadership", "story"],
  },
  {
    id: "resume-settlement-experience",
    title: "Settlement platform source of truth",
    subtitle: "Resume Evidence · inspect the main project claim and proof points",
    section: "Resume Evidence",
    to: `${routeConfig.resume.buildPath()}?focus=settlement-platform`,
    keywords: ["resume", "experience", "settlement", "payments", "project", "proof"],
  },
  {
    id: "resume-metrics-analysis",
    title: "Metrics proof gaps in resume analysis",
    subtitle: "Resume Analysis · patch unsupported impact statements",
    section: "Resume Evidence",
    to: `${routeConfig.resumeAnalysis.buildPath()}?focus=metrics-proof`,
    keywords: ["resume", "analysis", "metrics", "evidence", "impact", "truth"],
  },
  {
    id: "company-stripe",
    title: "Stripe target preparation board",
    subtitle: "Companies · review readiness, focus topics, and gaps",
    section: "Companies",
    to: `${routeConfig.targetCompanies.buildPath()}?company=stripe`,
    keywords: ["company", "stripe", "payments", "readiness", "prep"],
  },
  {
    id: "company-meta",
    title: "Meta systems interview track",
    subtitle: "Companies · prioritize infra and scale-heavy branches",
    section: "Companies",
    to: `${routeConfig.targetCompanies.buildPath()}?company=meta`,
    keywords: ["company", "meta", "scale", "system", "infra"],
  },
  {
    id: "notes-metrics-tag",
    title: "Metrics defense notes",
    subtitle: "Notes · pinned snippets for claims that need exact numbers",
    section: "Notes",
    to: `${routeConfig.notes.buildPath()}?tag=metrics`,
    keywords: ["notes", "metrics", "numbers", "evidence", "snippet"],
  },
  {
    id: "notes-kafka-tag",
    title: "Kafka incident notebook",
    subtitle: "Notes · preserve the incident timeline before interview practice",
    section: "Notes",
    to: `${routeConfig.notes.buildPath()}?tag=kafka`,
    keywords: ["notes", "kafka", "incident", "timeline", "review"],
  },
  {
    id: "command-start-interview",
    title: "Start interview session",
    subtitle: "Command · jump straight into the active interview workspace",
    section: "Commands",
    to: routeConfig.interview.buildPath(),
    keywords: ["command", "start", "interview", "session", "practice"],
  },
  {
    id: "command-open-review-queue",
    title: "Open review queue",
    subtitle: "Command · continue the DFS retry loop from pending branches",
    section: "Commands",
    to: routeConfig.reviewQueue.buildPath(),
    keywords: ["command", "review", "queue", "retry", "dfs"],
  },
  {
    id: "command-open-weak-nodes",
    title: "Open weak nodes workspace",
    subtitle: "Command · inspect graph-first remediation hotspots",
    section: "Commands",
    to: routeConfig.weakNodes.buildPath(),
    keywords: ["command", "weak", "nodes", "graph", "remediation"],
  },
  {
    id: "command-open-resume",
    title: "Open resume source of truth",
    subtitle: "Command · review the authoritative resume workspace before practice",
    section: "Commands",
    to: routeConfig.resume.buildPath(),
    keywords: ["command", "resume", "source of truth", "authoring"],
  },
];
