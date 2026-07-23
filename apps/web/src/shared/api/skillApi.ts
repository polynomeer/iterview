import { apiEndpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import type {
  SkillGapResponseDto,
  SkillProgressResponseDto,
  SkillRadarResponseDto,
} from "../types/skill-intelligence";

export function getSkillRadarRequest(signal?: AbortSignal) {
  return httpClient.get<SkillRadarResponseDto>(apiEndpoints.skills.radar, { signal });
}

export function getSkillGapRequest(signal?: AbortSignal) {
  return httpClient.get<SkillGapResponseDto>(apiEndpoints.skills.gaps, { signal });
}

export function getSkillProgressRequest(signal?: AbortSignal) {
  return httpClient.get<SkillProgressResponseDto>(apiEndpoints.skills.progress, { signal });
}
