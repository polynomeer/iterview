export type ResumeVersionDto = {
  id: string | number;
  versionNo?: number | null;
  isActive?: boolean | null;
  uploadedAt?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  fileSizeBytes?: number | null;
  rawText?: string | null;
  parsedJson?: string | null;
  summaryText?: string | null;
  parsingStatus?: string | null;
  parseStartedAt?: string | null;
  parseCompletedAt?: string | null;
  parseErrorMessage?: string | null;
  llmExtractionStatus?: string | null;
  llmExtractionStartedAt?: string | null;
  llmExtractionCompletedAt?: string | null;
  llmExtractionErrorMessage?: string | null;
  llmModel?: string | null;
  llmPromptVersion?: string | null;
  llmExtractionConfidence?: number | null;
};

export type ResumeDto = {
  id: string | number;
  title: string;
  isPrimary?: boolean | null;
  versions?: ResumeVersionDto[] | null;
};

export type ResumeListResponseDto = ResumeDto[] | {
  items?: ResumeDto[] | null;
};

export type CreateResumeRequestDto = {
  title: string;
};

export type CreateResumeVersionRequestDto = {
  fileName: string;
};

export type UploadResumeVersionRequestDto = {
  file: File;
  summaryText?: string;
};

export type ResumeAnalysisSkillDto = {
  skillId?: string | number | null;
  skillName?: string | null;
  skillCategory?: string | null;
  sourceText?: string | null;
  confidenceScore?: number | null;
  confirmed?: boolean | null;
};

export type ResumeAnalysisExperienceDto = {
  id?: string | number | null;
  companyName?: string | null;
  roleName?: string | null;
  employmentType?: string | null;
  startedOn?: string | null;
  endedOn?: string | null;
  current?: boolean | null;
  projectName?: string | null;
  summaryText?: string | null;
  impactText?: string | null;
  sourceText?: string | null;
  riskLevel?: string | null;
  displayOrder?: number | null;
  confirmed?: boolean | null;
};

export type ResumeAnalysisRiskDto = {
  id?: string | number | null;
  resumeExperienceSnapshotId?: string | number | null;
  linkedQuestionId?: string | number | null;
  riskType?: string | null;
  title?: string | null;
  severity?: string | null;
  description?: string | null;
};

export type ResumeSkillSnapshotResponseDto = {
  resumeVersionId?: string | number | null;
  items?: ResumeAnalysisSkillDto[] | null;
  generatedAt?: string | null;
};

export type ResumeVersionExtractionDto = {
  resumeVersionId?: string | number | null;
  rawParsingStatus?: string | null;
  llmExtractionStatus?: string | null;
  llmModel?: string | null;
  llmPromptVersion?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  errorMessage?: string | null;
};

export type ResumeExperienceSnapshotResponseDto = {
  resumeVersionId?: string | number | null;
  items?: ResumeAnalysisExperienceDto[] | null;
  generatedAt?: string | null;
};

export type ResumeRiskItemResponseDto = {
  resumeVersionId?: string | number | null;
  items?: ResumeAnalysisRiskDto[] | null;
  generatedAt?: string | null;
};

export type ResumeProfileSnapshotDto = {
  fullName?: string | null;
  headline?: string | null;
  summaryText?: string | null;
  locationText?: string | null;
  yearsOfExperienceText?: string | null;
  sourceText?: string | null;
};

export type ResumeProfileSnapshotResponseDto = {
  resumeVersionId?: string | number | null;
  item?: ResumeProfileSnapshotDto | null;
  generatedAt?: string | null;
};

export type ResumeContactPointDto = {
  id?: string | number | null;
  contactType?: string | null;
  label?: string | null;
  valueText?: string | null;
  url?: string | null;
  displayOrder?: number | null;
  primary?: boolean | null;
};

export type ResumeContactPointResponseDto = {
  resumeVersionId?: string | number | null;
  items?: ResumeContactPointDto[] | null;
  generatedAt?: string | null;
};

export type ResumeCompetencyItemDto = {
  id?: string | number | null;
  title?: string | null;
  description?: string | null;
  sourceText?: string | null;
  displayOrder?: number | null;
};

export type ResumeCompetencyItemResponseDto = {
  resumeVersionId?: string | number | null;
  items?: ResumeCompetencyItemDto[] | null;
  generatedAt?: string | null;
};

export type ResumeProjectSnapshotDto = {
  id?: string | number | null;
  resumeExperienceSnapshotId?: string | number | null;
  title?: string | null;
  organizationName?: string | null;
  roleName?: string | null;
  summaryText?: string | null;
  contentText?: string | null;
  projectCategoryCode?: string | null;
  projectCategoryName?: string | null;
  tags?:
    | Array<{
        id?: string | number | null;
        tagName?: string | null;
        tagType?: string | null;
        displayOrder?: number | null;
        sourceText?: string | null;
      }>
    | null;
  techStackText?: string | null;
  startedOn?: string | null;
  endedOn?: string | null;
  displayOrder?: number | null;
  sourceText?: string | null;
};

export type ResumeProjectSnapshotResponseDto = {
  resumeVersionId?: string | number | null;
  items?: ResumeProjectSnapshotDto[] | null;
  generatedAt?: string | null;
};

export type ResumeAchievementItemDto = {
  id?: string | number | null;
  resumeExperienceSnapshotId?: string | number | null;
  resumeProjectSnapshotId?: string | number | null;
  title?: string | null;
  metricText?: string | null;
  impactSummary?: string | null;
  sourceText?: string | null;
  severityHint?: string | null;
  displayOrder?: number | null;
};

export type ResumeAchievementItemResponseDto = {
  resumeVersionId?: string | number | null;
  items?: ResumeAchievementItemDto[] | null;
  generatedAt?: string | null;
};

export type ResumeEducationItemDto = {
  id?: string | number | null;
  institutionName?: string | null;
  degreeName?: string | null;
  fieldOfStudy?: string | null;
  startedOn?: string | null;
  endedOn?: string | null;
  description?: string | null;
  displayOrder?: number | null;
  sourceText?: string | null;
};

export type ResumeEducationItemResponseDto = {
  resumeVersionId?: string | number | null;
  items?: ResumeEducationItemDto[] | null;
  generatedAt?: string | null;
};

export type ResumeCertificationItemDto = {
  id?: string | number | null;
  name?: string | null;
  issuerName?: string | null;
  credentialCode?: string | null;
  issuedOn?: string | null;
  expiresOn?: string | null;
  scoreText?: string | null;
  displayOrder?: number | null;
  sourceText?: string | null;
};

export type ResumeCertificationItemResponseDto = {
  resumeVersionId?: string | number | null;
  items?: ResumeCertificationItemDto[] | null;
  generatedAt?: string | null;
};

export type ResumeAwardItemDto = {
  id?: string | number | null;
  title?: string | null;
  issuerName?: string | null;
  awardedOn?: string | null;
  description?: string | null;
  displayOrder?: number | null;
  sourceText?: string | null;
};

export type ResumeAwardItemResponseDto = {
  resumeVersionId?: string | number | null;
  items?: ResumeAwardItemDto[] | null;
  generatedAt?: string | null;
};
