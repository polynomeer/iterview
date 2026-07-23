import { formatApiDateTime } from "../../shared/lib/date";
import { toArray } from "../../shared/lib/collection";
import type {
  JobPostingDto,
  ResumeAnalysisDto,
  ResumeAnalysisExportDto,
  ResumeAnalysisListItemDto,
  ResumeAnalysisSuggestionDto,
  ResumeTailoredDocumentDto,
} from "../../shared/types/resumeTailor";

function toId(value: string | number | null | undefined, fallback: string) {
  return value === null || value === undefined ? fallback : String(value);
}

function formatLabel(value?: string | null) {
  if (!value) {
    return "Unknown";
  }

  return value
    .split(/[_-\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function getFetchTone(status?: string | null) {
  switch (status) {
    case "fetched":
    case "completed":
      return "positive";
    case "failed":
      return "warning";
    case "processing":
    case "pending":
      return "accent";
    default:
      return "neutral";
  }
}

function getGenerationSourceLabel(value?: string | null) {
  if (value === "openai") {
    return "AI generated";
  }

  if (value === "deterministic") {
    return "Generated from saved rules";
  }

  return formatLabel(value);
}

function mapTailoredDocument(document?: ResumeTailoredDocumentDto | null) {
  if (!document) {
    return null;
  }

  const sections = toArray(document.sections).map((section, index) => ({
    id: `${section.sectionKey ?? "section"}-${index}`,
    sectionKey: section.sectionKey ?? `section-${index}`,
    title: section.title ?? "Section",
    lines: toArray(section.lines),
  }));
  const order = toArray(document.sectionOrder);

  const sortedSections =
    order.length === 0
      ? sections
      : [...sections].sort((left, right) => {
          const leftIndex = order.indexOf(left.sectionKey);
          const rightIndex = order.indexOf(right.sectionKey);
          return (leftIndex === -1 ? 999 : leftIndex) - (rightIndex === -1 ? 999 : rightIndex);
        });

  return {
    title: document.title ?? "Tailored resume",
    targetCompany: document.targetCompany ?? null,
    targetRole: document.targetRole ?? null,
    formatType: document.formatType ?? null,
    formatTypeLabel: formatLabel(document.formatType),
    summary: document.summary ?? null,
    diffSummary: document.diffSummary ?? null,
    analysisNotes: toArray(document.analysisNotes),
    sections: sortedSections,
    plainText: document.plainText ?? null,
  };
}

function mapExport(exportItem: ResumeAnalysisExportDto, index: number) {
  return {
    id: toId(exportItem.id, `export-${index}`),
    resumeAnalysisId:
      exportItem.resumeAnalysisId === null || exportItem.resumeAnalysisId === undefined
        ? null
        : String(exportItem.resumeAnalysisId),
    exportType: exportItem.exportType ?? "unknown",
    exportTypeLabel: formatLabel(exportItem.exportType),
    formatType: exportItem.formatType ?? null,
    formatTypeLabel: formatLabel(exportItem.formatType),
    fileName: exportItem.fileName ?? "tailored-resume.pdf",
    fileUrl: exportItem.fileUrl ?? null,
    fileSizeBytes: exportItem.fileSizeBytes ?? null,
    checksumSha256: exportItem.checksumSha256 ?? null,
    pageCount: exportItem.pageCount ?? null,
    createdAt: exportItem.createdAt ?? null,
    createdAtLabel: formatApiDateTime(exportItem.createdAt),
  };
}

function mapSuggestion(suggestion: ResumeAnalysisSuggestionDto, index: number) {
  return {
    id: toId(suggestion.id, `suggestion-${index}`),
    sectionKey: suggestion.sectionKey ?? "section",
    sectionLabel: formatLabel(suggestion.sectionKey),
    originalText: suggestion.originalText ?? null,
    suggestedText: suggestion.suggestedText ?? "",
    reason: suggestion.reason ?? "",
    suggestionType: suggestion.suggestionType ?? "rewrite",
    suggestionTypeLabel: formatLabel(suggestion.suggestionType),
    accepted: suggestion.accepted ?? false,
    displayOrder: suggestion.displayOrder ?? index,
    createdAtLabel: formatApiDateTime(suggestion.createdAt),
  };
}

export function mapJobPostingDtoToModel(dto: JobPostingDto, index = 0) {
  return {
    id: toId(dto.id, `job-posting-${index}`),
    inputType: dto.inputType ?? "text",
    inputTypeLabel: formatLabel(dto.inputType),
    sourceUrl: dto.sourceUrl ?? null,
    rawText: dto.rawText ?? null,
    fetchStatus: dto.fetchStatus ?? "unknown",
    fetchStatusLabel: formatLabel(dto.fetchStatus),
    fetchTone: getFetchTone(dto.fetchStatus),
    fetchedTitle: dto.fetchedTitle ?? null,
    fetchErrorMessage: dto.fetchErrorMessage ?? null,
    fetchedAtLabel: formatApiDateTime(dto.fetchedAt),
    companyName: dto.companyName ?? null,
    roleName: dto.roleName ?? null,
    title:
      [dto.companyName, dto.roleName].filter(Boolean).join(" · ") ||
      dto.fetchedTitle ||
      "Saved job posting",
    parsedRequirements: toArray(dto.parsedRequirements),
    parsedNiceToHave: toArray(dto.parsedNiceToHave),
    parsedKeywords: toArray(dto.parsedKeywords),
    parsedResponsibilities: toArray(dto.parsedResponsibilities),
    parsedSummary: dto.parsedSummary ?? null,
    createdAt: dto.createdAt ?? null,
    createdAtLabel: formatApiDateTime(dto.createdAt),
    updatedAtLabel: formatApiDateTime(dto.updatedAt),
  };
}

export function mapJobPostingListDtoToModel(response: JobPostingDto[]) {
  return toArray(response)
    .map(mapJobPostingDtoToModel)
    .sort((left, right) => {
      return (right.createdAt ?? "").localeCompare(left.createdAt ?? "");
    });
}

export function mapResumeAnalysisListDtoToModel(response: ResumeAnalysisListItemDto[]) {
  return toArray(response).map((item, index) => ({
    id: toId(item.id, `analysis-${index}`),
    resumeVersionId:
      item.resumeVersionId === null || item.resumeVersionId === undefined
        ? ""
        : String(item.resumeVersionId),
    jobPostingId:
      item.jobPostingId === null || item.jobPostingId === undefined ? null : String(item.jobPostingId),
    status: item.status ?? "unknown",
    statusLabel: formatLabel(item.status),
    overallScore: item.overallScore ?? 0,
    overallScoreLabel:
      item.overallScore === null || item.overallScore === undefined
        ? "N/A"
        : `${item.overallScore}`,
    matchSummary: item.matchSummary ?? "",
    suggestedHeadline: item.suggestedHeadline ?? null,
    recommendedFormatType: item.recommendedFormatType ?? null,
    recommendedFormatTypeLabel: formatLabel(item.recommendedFormatType),
    generationSource: item.generationSource ?? "deterministic",
    generationSourceLabel: getGenerationSourceLabel(item.generationSource),
    llmModel: item.llmModel ?? null,
    createdAt: item.createdAt ?? null,
    createdAtLabel: formatApiDateTime(item.createdAt),
  }));
}

export function mapResumeAnalysisDtoToModel(dto: ResumeAnalysisDto) {
  return {
    id: toId(dto.id, "analysis"),
    resumeVersionId:
      dto.resumeVersionId === null || dto.resumeVersionId === undefined
        ? ""
        : String(dto.resumeVersionId),
    jobPostingId:
      dto.jobPostingId === null || dto.jobPostingId === undefined ? null : String(dto.jobPostingId),
    status: dto.status ?? "unknown",
    statusLabel: formatLabel(dto.status),
    overallScore: dto.overallScore ?? 0,
    overallScoreLabel:
      dto.overallScore === null || dto.overallScore === undefined ? "N/A" : `${dto.overallScore}`,
    matchSummary: dto.matchSummary ?? "",
    strongMatches: toArray(dto.strongMatches),
    missingKeywords: toArray(dto.missingKeywords),
    weakSignals: toArray(dto.weakSignals),
    recommendedFocusAreas: toArray(dto.recommendedFocusAreas),
    suggestedHeadline: dto.suggestedHeadline ?? null,
    suggestedSummary: dto.suggestedSummary ?? null,
    recommendedFormatType: dto.recommendedFormatType ?? null,
    recommendedFormatTypeLabel: formatLabel(dto.recommendedFormatType),
    generationSource: dto.generationSource ?? "deterministic",
    generationSourceLabel: getGenerationSourceLabel(dto.generationSource),
    llmModel: dto.llmModel ?? null,
    analysisNotes: toArray(dto.analysisNotes),
    tailoredDocument: mapTailoredDocument(dto.tailoredDocument),
    suggestions: toArray(dto.suggestions)
      .map(mapSuggestion)
      .sort((left, right) => left.displayOrder - right.displayOrder),
    exports: toArray(dto.exports)
      .map(mapExport)
      .sort((left, right) => (right.createdAt ?? "").localeCompare(left.createdAt ?? "")),
    createdAt: dto.createdAt ?? null,
    createdAtLabel: formatApiDateTime(dto.createdAt),
    updatedAt: dto.updatedAt ?? null,
    updatedAtLabel: formatApiDateTime(dto.updatedAt),
  };
}

export function mapResumeAnalysisExportsDtoToModel(response: ResumeAnalysisExportDto[]) {
  return toArray(response)
    .map(mapExport)
    .sort((left, right) => (right.createdAt ?? "").localeCompare(left.createdAt ?? ""));
}
