import { apiEndpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import type {
  CurrentUserDto,
  LoginRequestDto,
  LoginResponseDto,
  ProfileImageUploadResponseDto,
  SettingsDto,
  SignupRequestDto,
  UpdateProfileRequestDto,
  UpdateSettingsRequestDto,
  UpdateTargetCompaniesRequestDto,
  JobRoleDto,
} from "../types/auth";

export function signupRequest(payload: SignupRequestDto) {
  return httpClient.post<LoginResponseDto, SignupRequestDto>(apiEndpoints.auth.signup, {
    body: payload,
  });
}

export function loginRequest(payload: LoginRequestDto) {
  return httpClient.post<LoginResponseDto, LoginRequestDto>(apiEndpoints.auth.login, {
    body: payload,
  });
}

export function getJobRolesRequest(signal?: AbortSignal) {
  return httpClient.get<JobRoleDto[]>(apiEndpoints.users.jobRoles, { signal });
}

export function getCurrentUserRequest(signal?: AbortSignal) {
  return httpClient.get<CurrentUserDto>(apiEndpoints.users.currentUser, {
    signal,
  });
}

export function updateProfileRequest(payload: UpdateProfileRequestDto) {
  return httpClient.patch<CurrentUserDto, UpdateProfileRequestDto>(apiEndpoints.users.profile, {
    body: payload,
  });
}

export function updateSettingsRequest(payload: UpdateSettingsRequestDto) {
  return httpClient.patch<SettingsDto, UpdateSettingsRequestDto>(apiEndpoints.users.settings, {
    body: payload,
  });
}

export function updateTargetCompaniesRequest(payload: UpdateTargetCompaniesRequestDto) {
  return httpClient.put<CurrentUserDto, UpdateTargetCompaniesRequestDto>(
    apiEndpoints.users.targetCompanies,
    {
      body: payload,
    },
  );
}

export function uploadProfileImageRequest(file: File) {
  const body = new FormData();
  body.append("file", file);

  return httpClient.post<ProfileImageUploadResponseDto, FormData>(apiEndpoints.users.profileImage, {
    body,
  });
}
