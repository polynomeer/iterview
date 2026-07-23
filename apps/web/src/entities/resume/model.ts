import type {
  ResumeAchievementItemResponseDto,
  ResumeAwardItemResponseDto,
  ResumeCertificationItemResponseDto,
  ResumeCompetencyItemResponseDto,
  ResumeContactPointResponseDto,
  ResumeDto,
  ResumeEducationItemResponseDto,
  ResumeExperienceSnapshotResponseDto,
  ResumeListResponseDto,
  ResumeProfileSnapshotResponseDto,
  ResumeProjectSnapshotResponseDto,
  ResumeRiskItemResponseDto,
  ResumeSkillSnapshotResponseDto,
  ResumeVersionDto,
  ResumeVersionExtractionDto,
} from "../../shared/types/resume";
import { toArray } from "../../shared/lib/collection";
import { formatApiDate, formatApiDateTime } from "../../shared/lib/date";

export type ResumeVersionModel = {
  id: string;
  versionNumberLabel: string;
  isActive: boolean;
  uploadedAtLabel: string | null;
  fileNameLabel: string;
  parsingStatusLabel: string;
  parsingStatus: string;
  parsingTone: "accent" | "warning" | "positive" | "neutral";
  fileTypeLabel: string | null;
  fileSizeLabel: string | null;
  parseStartedAtLabel: string | null;
  parseCompletedAtLabel: string | null;
  parseErrorMessage: string | null;
  extractionStatusLabel: string;
  extractionStatus: string;
  extractionTone: "accent" | "warning" | "positive" | "neutral";
  extractionStartedAtLabel: string | null;
  extractionCompletedAtLabel: string | null;
  extractionErrorMessage: string | null;
  extractionModelLabel: string | null;
  extractionPromptVersion: string | null;
  extractionConfidenceLabel: string | null;
  canActivate: boolean;
  canDownload: boolean;
};

export type ResumeModel = {
  id: string;
  title: string;
  versions: ResumeVersionModel[];
};

export type ResumeListModel = {
  items: ResumeModel[];
};

export type ActiveResumeVersionModel = ResumeVersionModel & {
  resumeId: string;
  resumeTitle: string;
};

export type ResumeVersionChoiceModel = {
  resumeId: string;
  resumeTitle: string;
  versionId: string;
  versionNumberLabel: string;
  uploadedAtLabel: string | null;
  isActive: boolean;
  parsingStatus: string;
  parsingStatusLabel: string;
};

export type ResumeAnalysisModel = {
  resumeVersionId: string;
  generatedAtLabel: string | null;
  skills: Array<{
    id: string;
    sourceRecordId: string | null;
    label: string;
    value: string;
    helperText?: string;
    category?: string;
    confidenceScore?: number;
    confidenceLabel?: string;
    tone: "positive" | "accent" | "warning" | "neutral";
  }>;
  experiences: Array<{
    id: string;
    title: string;
    summary: string;
    impactText?: string;
  }>;
  risks: Array<{
    id: string;
    title: string;
    severityLabel: string;
    description: string;
    linkedQuestionId?: string;
  }>;
};

export type ResumeExtractionModel = {
  resumeVersionId: string;
  rawParsingStatus: string;
  rawParsingStatusLabel: string;
  extractionStatus: string;
  extractionStatusLabel: string;
  extractionTone: "accent" | "warning" | "positive" | "neutral";
  startedAtLabel: string | null;
  completedAtLabel: string | null;
  errorMessage: string | null;
  modelLabel: string | null;
  promptVersionLabel: string | null;
  isUsable: boolean;
  canRetry: boolean;
};

export type ResumeSnapshotModel = {
  profile: {
    fullName: string | null;
    headline: string | null;
    summaryText: string | null;
    locationText: string | null;
    yearsOfExperienceText: string | null;
    sourceText: string | null;
  } | null;
  contacts: Array<{
    id: string;
    title: string;
    value: string;
    url?: string;
    helperText?: string;
    isPrimary: boolean;
  }>;
  competencies: Array<{
    id: string;
    sourceRecordId: string | null;
    title: string;
    description: string;
    sourceText?: string;
  }>;
  skills: ResumeAnalysisModel["skills"];
  experiences: Array<{
    id: string;
    sourceRecordId: string | null;
    companyName: string;
    roleName: string;
    employmentType?: string;
    dateLabel: string;
    current: boolean;
    summary: string;
    impactText?: string;
    projectName?: string;
  }>;
  projects: Array<{
    id: string;
    sourceRecordId: string | null;
    title: string;
    categoryCode?: string;
    categoryName?: string;
    organizationName?: string;
    roleName?: string;
    techStackText?: string;
    dateLabel: string;
    summary: string;
    contentText?: string;
    tags: Array<{
      id: string;
      label: string;
      type?: string;
    }>;
    relatedExperienceId?: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    metricText?: string;
    impactSummary: string;
    severityHint?: string;
  }>;
  education: Array<{
    id: string;
    institutionName: string;
    degreeName?: string;
    fieldOfStudy?: string;
    dateLabel: string;
    description?: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuerName?: string;
    credentialCode?: string;
    dateLabel: string;
    scoreText?: string;
  }>;
  awards: Array<{
    id: string;
    title: string;
    issuerName?: string;
    awardedOnLabel?: string;
    description?: string;
  }>;
  risks: ResumeAnalysisModel["risks"];
};

export type ResumeMappedExperienceModel = ResumeSnapshotModel["experiences"][number] & {
  sourceJoinKey: string;
};

export type ResumeMappedProjectModel = ResumeSnapshotModel["projects"][number] & {
  sourceJoinKey: string;
};

function formatFileSize(bytes?: number | null) {
  if (bytes === null || bytes === undefined || Number.isNaN(bytes)) {
    return null;
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatStatusLabel(status?: string | null) {
  if (!status) {
    return "Status unavailable";
  }

  return status
    .split(/[_-\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function formatDateRange(start?: string | null, end?: string | null, current?: boolean | null) {
  const startLabel = formatApiDate(start);
  const endLabel = current ? "Present" : formatApiDate(end);

  if (startLabel && endLabel) {
    return `${startLabel} - ${endLabel}`;
  }

  if (startLabel) {
    return startLabel;
  }

  if (endLabel) {
    return endLabel;
  }

  return "Dates unavailable";
}

function getParsingTone(status?: string | null): ResumeVersionModel["parsingTone"] {
  switch ((status ?? "").toLowerCase()) {
    case "completed":
      return "positive";
    case "failed":
      return "warning";
    case "pending":
    case "processing":
      return "accent";
    default:
      return "neutral";
  }
}

function getExtractionTone(status?: string | null): ResumeVersionModel["extractionTone"] {
  switch ((status ?? "").toLowerCase()) {
    case "completed":
      return "positive";
    case "fallback":
    case "failed":
      return "warning";
    case "pending":
    case "processing":
      return "accent";
    case "skipped":
      return "neutral";
    default:
      return "neutral";
  }
}

function mapResumeVersionDtoToModel(version: ResumeVersionDto): ResumeVersionModel {
  const parsingStatus = (version.parsingStatus ?? "unknown").toLowerCase();
  const extractionStatus = (version.llmExtractionStatus ?? "unknown").toLowerCase();
  const confidence =
    version.llmExtractionConfidence === null || version.llmExtractionConfidence === undefined
      ? null
      : `${Math.round(version.llmExtractionConfidence * 100)}%`;

  return {
    id: String(version.id),
    versionNumberLabel: `Version ${version.versionNo ?? 1}`,
    isActive: version.isActive ?? false,
    uploadedAtLabel: formatApiDate(version.uploadedAt),
    fileNameLabel: version.fileName ?? "Uploaded resume version",
    parsingStatusLabel: formatStatusLabel(version.parsingStatus),
    parsingStatus,
    parsingTone: getParsingTone(version.parsingStatus),
    fileTypeLabel: version.fileType ?? null,
    fileSizeLabel: formatFileSize(version.fileSizeBytes),
    parseStartedAtLabel: formatApiDateTime(version.parseStartedAt),
    parseCompletedAtLabel: formatApiDateTime(version.parseCompletedAt),
    parseErrorMessage: version.parseErrorMessage ?? null,
    extractionStatusLabel:
      version.llmExtractionStatus === null || version.llmExtractionStatus === undefined
        ? "Not started"
        : formatStatusLabel(version.llmExtractionStatus),
    extractionStatus,
    extractionTone: getExtractionTone(version.llmExtractionStatus),
    extractionStartedAtLabel: formatApiDateTime(version.llmExtractionStartedAt),
    extractionCompletedAtLabel: formatApiDateTime(version.llmExtractionCompletedAt),
    extractionErrorMessage: version.llmExtractionErrorMessage ?? null,
    extractionModelLabel: version.llmModel ?? null,
    extractionPromptVersion: version.llmPromptVersion ?? null,
    extractionConfidenceLabel: confidence,
    canActivate: parsingStatus === "completed",
    canDownload: Boolean(version.fileUrl || version.fileName),
  };
}

export function mapResumeListResponseDtoToModel(
  response: ResumeListResponseDto,
): ResumeListModel {
  const items = Array.isArray(response) ? response : toArray(response.items);

  return {
    items: items.map((resume) => ({
      id: String(resume.id),
      title: resume.title,
      versions: toArray(resume.versions).map(mapResumeVersionDtoToModel),
    })),
  };
}

export function getActiveResumeVersionId(resumeList: ResumeListModel | undefined) {
  return getActiveResumeVersion(resumeList)?.id ?? null;
}

export function getResumeVersionChoices(
  resumeList: ResumeListModel | undefined,
): ResumeVersionChoiceModel[] {
  return (resumeList?.items ?? [])
    .flatMap((resume) =>
      resume.versions.map((version) => ({
        resumeId: resume.id,
        resumeTitle: resume.title,
        versionId: version.id,
        versionNumberLabel: version.versionNumberLabel,
        uploadedAtLabel: version.uploadedAtLabel,
        isActive: version.isActive,
        parsingStatus: version.parsingStatus,
        parsingStatusLabel: version.parsingStatusLabel,
      })),
    )
    .sort((left, right) => {
      if (left.isActive !== right.isActive) {
        return left.isActive ? -1 : 1;
      }

      return 0;
    });
}

export function getActiveResumeVersion(
  resumeList: ResumeListModel | undefined,
): ActiveResumeVersionModel | null {
  for (const resume of resumeList?.items ?? []) {
    const activeVersion = resume.versions.find((version) => version.isActive);

    if (activeVersion) {
      return {
        resumeId: resume.id,
        resumeTitle: resume.title,
        ...activeVersion,
      };
    }
  }

  return null;
}

export function mapLatestResumeResponseDtoToModel(response: ResumeDto): ResumeListModel {
  return {
    items: [
      {
        id: String(response.id),
        title: response.title,
        versions: toArray(response.versions).map(mapResumeVersionDtoToModel),
      },
    ],
  };
}

export function mapResumeVersionDtoToDetailModel(response: ResumeVersionDto): ResumeVersionModel {
  return mapResumeVersionDtoToModel(response);
}

export function mapResumeVersionExtractionDtoToModel(
  response: ResumeVersionExtractionDto,
): ResumeExtractionModel {
  const extractionStatus = (response.llmExtractionStatus ?? "unknown").toLowerCase();

  return {
    resumeVersionId:
      response.resumeVersionId === null || response.resumeVersionId === undefined
        ? ""
        : String(response.resumeVersionId),
    rawParsingStatus: (response.rawParsingStatus ?? "unknown").toLowerCase(),
    rawParsingStatusLabel: formatStatusLabel(response.rawParsingStatus),
    extractionStatus,
    extractionStatusLabel:
      response.llmExtractionStatus === null || response.llmExtractionStatus === undefined
        ? "Not started"
        : formatStatusLabel(response.llmExtractionStatus),
    extractionTone: getExtractionTone(response.llmExtractionStatus),
    startedAtLabel: formatApiDateTime(response.startedAt),
    completedAtLabel: formatApiDateTime(response.completedAt),
    errorMessage: response.errorMessage ?? null,
    modelLabel: response.llmModel ?? null,
    promptVersionLabel: response.llmPromptVersion ?? null,
    isUsable:
      extractionStatus === "completed" ||
      extractionStatus === "skipped" ||
      extractionStatus === "fallback",
    canRetry: extractionStatus === "failed",
  };
}

export function mapResumeAnalysisResponsesToModel(
  skillsResponse: ResumeSkillSnapshotResponseDto,
  experiencesResponse: ResumeExperienceSnapshotResponseDto,
  risksResponse: ResumeRiskItemResponseDto,
): ResumeAnalysisModel {
  const resumeVersionId =
    skillsResponse.resumeVersionId ??
    experiencesResponse.resumeVersionId ??
    risksResponse.resumeVersionId;

  return {
    resumeVersionId:
      resumeVersionId === null || resumeVersionId === undefined ? "" : String(resumeVersionId),
    generatedAtLabel:
      formatApiDate(skillsResponse.generatedAt ?? experiencesResponse.generatedAt ?? risksResponse.generatedAt) ??
      null,
    skills: toArray(skillsResponse.items).map((skill, index) => ({
      id:
        skill.skillId === null || skill.skillId === undefined
          ? skill.skillName ?? `skill-${index}`
          : String(skill.skillId),
      sourceRecordId:
        skill.skillId === null || skill.skillId === undefined ? null : String(skill.skillId),
      label: skill.skillName ?? "Resume skill",
      value:
        skill.confidenceScore === null || skill.confidenceScore === undefined
          ? skill.skillCategory ?? "Mapped"
          : `${Math.round(skill.confidenceScore * 100)}% confidence`,
      category: skill.skillCategory ?? undefined,
      confidenceScore:
        skill.confidenceScore === null || skill.confidenceScore === undefined
          ? undefined
          : skill.confidenceScore,
      confidenceLabel:
        skill.confidenceScore === null || skill.confidenceScore === undefined
          ? undefined
          : `${Math.round(skill.confidenceScore * 100)}% confidence`,
      helperText: skill.sourceText ?? undefined,
      tone:
        skill.confidenceScore === null || skill.confidenceScore === undefined
          ? "neutral"
          : skill.confidenceScore >= 0.75
            ? "positive"
            : skill.confidenceScore >= 0.45
              ? "accent"
              : "warning",
    })),
    experiences: toArray(experiencesResponse.items)
      .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0))
      .map((experience, index) => ({
      id:
        experience.id === null || experience.id === undefined
          ? `experience-${index}`
          : String(experience.id),
      title:
        [experience.companyName, experience.roleName].filter(Boolean).join(" · ") ||
        experience.projectName ||
        "Resume experience",
      summary: experience.summaryText ?? "No experience summary is available yet.",
      impactText: experience.impactText ?? undefined,
    })),
    risks: toArray(risksResponse.items).map((risk, index) => ({
      id: risk.id === null || risk.id === undefined ? `risk-${index}` : String(risk.id),
      title: risk.title ?? risk.riskType ?? "Resume risk",
      severityLabel: formatStatusLabel(risk.severity ?? "needs_review"),
      description: risk.description ?? "No risk description is available yet.",
      linkedQuestionId:
        risk.linkedQuestionId === null || risk.linkedQuestionId === undefined
          ? undefined
          : String(risk.linkedQuestionId),
    })),
  };
}

export function mapResumeSnapshotsToModel(params: {
  profileResponse: ResumeProfileSnapshotResponseDto;
  contactsResponse: ResumeContactPointResponseDto;
  competenciesResponse: ResumeCompetencyItemResponseDto;
  skillsResponse: ResumeSkillSnapshotResponseDto;
  experiencesResponse: ResumeExperienceSnapshotResponseDto;
  projectsResponse: ResumeProjectSnapshotResponseDto;
  achievementsResponse: ResumeAchievementItemResponseDto;
  educationResponse: ResumeEducationItemResponseDto;
  certificationsResponse: ResumeCertificationItemResponseDto;
  awardsResponse: ResumeAwardItemResponseDto;
  risksResponse: ResumeRiskItemResponseDto;
}): ResumeSnapshotModel {
  const {
    profileResponse,
    contactsResponse,
    competenciesResponse,
    skillsResponse,
    experiencesResponse,
    projectsResponse,
    achievementsResponse,
    educationResponse,
    certificationsResponse,
    awardsResponse,
    risksResponse,
  } = params;

  return {
    profile: profileResponse.item
      ? {
          fullName: profileResponse.item.fullName ?? null,
          headline: profileResponse.item.headline ?? null,
          summaryText: profileResponse.item.summaryText ?? null,
          locationText: profileResponse.item.locationText ?? null,
          yearsOfExperienceText: profileResponse.item.yearsOfExperienceText ?? null,
          sourceText: profileResponse.item.sourceText ?? null,
        }
      : null,
    contacts: toArray(contactsResponse.items)
      .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0))
      .map((contact, index) => ({
        id: contact.id === null || contact.id === undefined ? `contact-${index}` : String(contact.id),
        title: contact.label ?? formatStatusLabel(contact.contactType ?? "contact"),
        value: contact.valueText ?? contact.url ?? "Unavailable",
        url: contact.url ?? undefined,
        helperText: contact.contactType ? formatStatusLabel(contact.contactType) : undefined,
        isPrimary: contact.primary ?? false,
      })),
    competencies: toArray(competenciesResponse.items)
      .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0))
      .map((item, index) => ({
        id: item.id === null || item.id === undefined ? `competency-${index}` : String(item.id),
        sourceRecordId:
          item.id === null || item.id === undefined ? null : String(item.id),
        title: item.title ?? "Competency",
        description: item.description ?? "No competency statement is available yet.",
        sourceText: item.sourceText ?? undefined,
      })),
    skills: mapResumeAnalysisResponsesToModel(skillsResponse, experiencesResponse, risksResponse).skills,
    experiences: toArray(experiencesResponse.items)
      .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0))
      .map((experience, index) => ({
        id: experience.id === null || experience.id === undefined ? `experience-${index}` : String(experience.id),
        sourceRecordId:
          experience.id === null || experience.id === undefined ? null : String(experience.id),
        companyName: experience.companyName ?? "Unknown company",
        roleName: experience.roleName ?? "Unknown role",
        employmentType: experience.employmentType ?? undefined,
        dateLabel: formatDateRange(experience.startedOn, experience.endedOn, experience.current),
        current: experience.current ?? false,
        summary: experience.summaryText ?? "No experience summary is available yet.",
        impactText: experience.impactText ?? undefined,
        projectName: experience.projectName ?? undefined,
      })),
    projects: toArray(projectsResponse.items)
      .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0))
      .map((project, index) => ({
        id: project.id === null || project.id === undefined ? `project-${index}` : String(project.id),
        sourceRecordId:
          project.id === null || project.id === undefined ? null : String(project.id),
        title: project.title ?? "Project",
        categoryCode: project.projectCategoryCode ?? undefined,
        categoryName: project.projectCategoryName ?? undefined,
        organizationName: project.organizationName ?? undefined,
        roleName: project.roleName ?? undefined,
        techStackText: project.techStackText ?? undefined,
        dateLabel: formatDateRange(project.startedOn, project.endedOn, false),
        summary: project.summaryText ?? "No project summary is available yet.",
        contentText: project.contentText ?? undefined,
        tags: toArray(project.tags)
          .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0))
          .map((tag, tagIndex) => ({
            id: tag.id === null || tag.id === undefined ? `project-tag-${index}-${tagIndex}` : String(tag.id),
            label: tag.tagName ?? "Tag",
            type: tag.tagType ?? undefined,
          })),
        relatedExperienceId:
          project.resumeExperienceSnapshotId === null || project.resumeExperienceSnapshotId === undefined
            ? undefined
            : String(project.resumeExperienceSnapshotId),
      })),
    achievements: toArray(achievementsResponse.items)
      .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0))
      .map((achievement, index) => ({
        id:
          achievement.id === null || achievement.id === undefined
            ? `achievement-${index}`
            : String(achievement.id),
        title: achievement.title ?? "Achievement",
        metricText: achievement.metricText ?? undefined,
        impactSummary: achievement.impactSummary ?? "No impact summary is available yet.",
        severityHint: achievement.severityHint ?? undefined,
      })),
    education: toArray(educationResponse.items)
      .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0))
      .map((education, index) => ({
        id: education.id === null || education.id === undefined ? `education-${index}` : String(education.id),
        institutionName: education.institutionName ?? "Institution",
        degreeName: education.degreeName ?? undefined,
        fieldOfStudy: education.fieldOfStudy ?? undefined,
        dateLabel: formatDateRange(education.startedOn, education.endedOn, false),
        description: education.description ?? undefined,
      })),
    certifications: toArray(certificationsResponse.items)
      .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0))
      .map((certification, index) => ({
        id:
          certification.id === null || certification.id === undefined
            ? `certification-${index}`
            : String(certification.id),
        name: certification.name ?? "Certification",
        issuerName: certification.issuerName ?? undefined,
        credentialCode: certification.credentialCode ?? undefined,
        dateLabel: formatDateRange(certification.issuedOn, certification.expiresOn, false),
        scoreText: certification.scoreText ?? undefined,
      })),
    awards: toArray(awardsResponse.items)
      .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0))
      .map((award, index) => ({
        id: award.id === null || award.id === undefined ? `award-${index}` : String(award.id),
        title: award.title ?? "Award",
        issuerName: award.issuerName ?? undefined,
        awardedOnLabel: formatApiDate(award.awardedOn) ?? undefined,
        description: award.description ?? undefined,
      })),
    risks: mapResumeAnalysisResponsesToModel(skillsResponse, experiencesResponse, risksResponse).risks,
  };
}

export function mapResumeExperiencesResponseToModel(
  experiencesResponse: ResumeExperienceSnapshotResponseDto,
): ResumeMappedExperienceModel[] {
  return toArray(experiencesResponse.items)
    .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0))
    .map((experience, index) => {
      const id =
        experience.id === null || experience.id === undefined
          ? `experience-${index}`
          : String(experience.id);

      return {
        id,
        sourceRecordId: id.startsWith("experience-") ? null : id,
        sourceJoinKey: `experience:${id}`,
        companyName: experience.companyName ?? "Unknown company",
        roleName: experience.roleName ?? "Unknown role",
        employmentType: experience.employmentType ?? undefined,
        dateLabel: formatDateRange(experience.startedOn, experience.endedOn, experience.current),
        current: experience.current ?? false,
        summary: experience.summaryText ?? "No experience summary is available yet.",
        impactText: experience.impactText ?? undefined,
        projectName: experience.projectName ?? undefined,
      };
    });
}

export function mapResumeProjectsResponseToModel(
  projectsResponse: ResumeProjectSnapshotResponseDto,
): ResumeMappedProjectModel[] {
  return toArray(projectsResponse.items)
    .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0))
    .map((project, index) => {
      const id =
        project.id === null || project.id === undefined ? `project-${index}` : String(project.id);

      return {
        id,
        sourceRecordId: id.startsWith("project-") ? null : id,
        sourceJoinKey: `project:${id}`,
        title: project.title ?? "Project",
        categoryCode: project.projectCategoryCode ?? undefined,
        categoryName: project.projectCategoryName ?? undefined,
        organizationName: project.organizationName ?? undefined,
        roleName: project.roleName ?? undefined,
        techStackText: project.techStackText ?? undefined,
        dateLabel: formatDateRange(project.startedOn, project.endedOn, false),
        summary: project.summaryText ?? "No project summary is available yet.",
        contentText: project.contentText ?? undefined,
        tags: toArray(project.tags)
          .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0))
          .map((tag, tagIndex) => ({
            id: tag.id === null || tag.id === undefined ? `project-tag-${index}-${tagIndex}` : String(tag.id),
            label: tag.tagName ?? "Tag",
            type: tag.tagType ?? undefined,
          })),
        relatedExperienceId:
          project.resumeExperienceSnapshotId === null || project.resumeExperienceSnapshotId === undefined
            ? undefined
            : String(project.resumeExperienceSnapshotId),
      };
    });
}
