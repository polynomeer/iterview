import type { CurrentUserDto } from "../../shared/types/auth";
import { resolveApiAssetUrl } from "../../shared/config/env";

export type ProfileModel = {
  id: string;
  email: string;
  displayName: string;
  nickname: string;
  jobRole: string;
  yearsOfExperience: string;
  targetScoreThreshold: string;
  passScoreThreshold: string;
  retryEnabled: boolean;
  dailyQuestionCount: string;
  preferredLanguage: "ko" | "en";
  targetCompanies: string[];
  profileImageUrl: string;
  profileImageFileName: string;
  profileImageContentType: string;
  profileImageUploadedAtLabel: string;
};

export function mapCurrentUserDtoToProfileModel(user: CurrentUserDto): ProfileModel {
  const nickname = user.profile?.nickname ?? user.nickname ?? "";
  const displayName = nickname.trim() || user.name?.trim() || user.email?.trim() || "I";
  const jobRole = user.profile?.jobRole ?? user.jobRole ?? "";
  const yearsOfExperience = user.profile?.yearsOfExperience ?? user.yearsOfExperience;
  const targetCompanies = (user.targetCompanies ?? [])
    .map((company) =>
      typeof company === "string" ? company : (company.companyName ?? "").trim(),
    )
    .filter((company): company is string => company.length > 0);

  return {
    id: String(user.id),
    email: user.email,
    displayName,
    nickname,
    jobRole,
    yearsOfExperience:
      yearsOfExperience !== undefined ? String(yearsOfExperience) : "",
    targetScoreThreshold:
      user.settings?.targetScoreThreshold !== undefined
        ? String(user.settings.targetScoreThreshold)
        : "",
    passScoreThreshold:
      user.settings?.passScoreThreshold !== undefined
        ? String(user.settings.passScoreThreshold)
        : "",
    retryEnabled: user.settings?.retryEnabled ?? true,
    dailyQuestionCount:
      user.settings?.dailyQuestionCount !== undefined
        ? String(user.settings.dailyQuestionCount)
        : "",
    preferredLanguage: user.settings?.preferredLanguage === "ko" ? "ko" : "en",
    targetCompanies,
    profileImageUrl: resolveApiAssetUrl(user.profile?.profileImageUrl),
    profileImageFileName: user.profile?.profileImageFileName ?? "",
    profileImageContentType: user.profile?.profileImageContentType ?? "",
    profileImageUploadedAtLabel: user.profile?.profileImageUploadedAt
      ? new Date(user.profile.profileImageUploadedAt).toLocaleString()
      : "",
  };
}
