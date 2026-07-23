export type AuthTokenDto = {
  accessToken: string;
  tokenType?: string;
};

export type CurrentUserDto = {
  id: string | number;
  email: string;
  status?: string;
  name?: string;
  nickname?: string;
  jobRole?: string;
  yearsOfExperience?: number;
  profile?: {
    nickname?: string;
    jobRoleId?: string | number | null;
    jobRole?: string | null;
    yearsOfExperience?: number;
    profileImageUrl?: string | null;
    profileImageFileName?: string | null;
    profileImageContentType?: string | null;
    profileImageUploadedAt?: string | null;
  };
  settings?: {
    targetScoreThreshold?: number;
    passScoreThreshold?: number;
    retryEnabled?: boolean;
    dailyQuestionCount?: number;
    preferredLanguage?: "ko" | "en" | string;
  };
  targetCompanies?: Array<
    | string
    | {
        companyId?: string | number | null;
        companyName?: string | null;
        priorityOrder?: number | null;
      }
  >;
};

export type SettingsDto = {
  targetScoreThreshold?: number;
  passScoreThreshold?: number;
  retryEnabled?: boolean;
  dailyQuestionCount?: number;
  preferredLanguage?: "ko" | "en" | string;
};

export type ProfileImageUploadResponseDto = {
  imageUrl: string;
  fileName?: string | null;
  contentType?: string | null;
  uploadedAt?: string | null;
};

export type LoginRequestDto = {
  email: string;
  password: string;
};

export type SignupRequestDto = LoginRequestDto;

export type LoginResponseDto = AuthTokenDto & {
  user: CurrentUserDto;
};

export type UpdateProfileRequestDto = {
  nickname?: string;
  jobRole?: string;
  yearsOfExperience?: number;
};

export type UpdateSettingsRequestDto = {
  targetScoreThreshold?: number;
  passScoreThreshold?: number;
  retryEnabled?: boolean;
  dailyQuestionCount?: number;
  preferredLanguage?: "ko" | "en";
};

export type UpdateTargetCompaniesRequestDto = {
  targetCompanies: string[];
};
