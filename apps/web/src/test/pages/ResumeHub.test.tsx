import userEvent from "@testing-library/user-event";
import { screen, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ResumeListModel, ResumeSnapshotModel, ResumeVersionModel } from "../../entities/resume/model";
import { useActivateResumeVersionMutation } from "../../features/resume/api/useActivateResumeVersionMutation";
import { useCreateResumeMutation } from "../../features/resume/api/useCreateResumeMutation";
import { useReExtractResumeVersionMutation } from "../../features/resume/api/useReExtractResumeVersionMutation";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { useResumeVersionDetailQuery } from "../../features/resume/api/useResumeVersionDetailQuery";
import { useResumeVersionExtractionQuery } from "../../features/resume/api/useResumeVersionExtractionQuery";
import { useResumeVersionSnapshotsQuery } from "../../features/resume/api/useResumeVersionSnapshotsQuery";
import { useUploadResumeVersionMutation } from "../../features/resume/api/useUploadResumeVersionMutation";
import { ResumeHubLayout } from "../../pages/resume/ResumeHubLayout";
import { ResumeIndexPage } from "../../pages/resume/ResumeIndexPage";
import { ResumeOverviewTab } from "../../pages/resume/ResumeOverviewTab";
import { ResumeVersionsTab } from "../../pages/resume/ResumeVersionsTab";
import { LocationDisplay, renderWithProviders } from "../utils";

vi.mock("../../features/resume/api/useResumeListQuery", () => ({ useResumeListQuery: vi.fn() }));
vi.mock("../../features/resume/api/useCreateResumeMutation", () => ({ useCreateResumeMutation: vi.fn() }));
vi.mock("../../features/resume/api/useUploadResumeVersionMutation", () => ({ useUploadResumeVersionMutation: vi.fn() }));
vi.mock("../../features/resume/api/useActivateResumeVersionMutation", () => ({ useActivateResumeVersionMutation: vi.fn() }));
vi.mock("../../features/resume/api/useReExtractResumeVersionMutation", () => ({ useReExtractResumeVersionMutation: vi.fn() }));
vi.mock("../../features/resume/api/useResumeVersionDetailQuery", () => ({ useResumeVersionDetailQuery: vi.fn() }));
vi.mock("../../features/resume/api/useResumeVersionExtractionQuery", () => ({ useResumeVersionExtractionQuery: vi.fn() }));
vi.mock("../../features/resume/api/useResumeVersionSnapshotsQuery", () => ({ useResumeVersionSnapshotsQuery: vi.fn() }));

function version(overrides: Partial<ResumeVersionModel> = {}): ResumeVersionModel {
  return {
    id: "v1",
    versionNumberLabel: "Version 1",
    isActive: true,
    uploadedAtLabel: "Mar 9, 2026",
    fileNameLabel: "backend.pdf",
    parsingStatusLabel: "Completed",
    parsingStatus: "completed",
    parsingTone: "positive",
    fileTypeLabel: null,
    fileSizeLabel: "240 KB",
    parseStartedAtLabel: null,
    parseCompletedAtLabel: null,
    parseErrorMessage: null,
    extractionStatusLabel: "Completed",
    extractionStatus: "completed",
    extractionTone: "positive",
    extractionStartedAtLabel: null,
    extractionCompletedAtLabel: null,
    extractionErrorMessage: null,
    extractionModelLabel: null,
    extractionPromptVersion: null,
    extractionConfidenceLabel: null,
    canActivate: true,
    canDownload: true,
    ...overrides,
  };
}

const snapshot: ResumeSnapshotModel = {
  profile: { fullName: "Jamie Kim", headline: "Backend engineer", summaryText: null, locationText: "Seoul", yearsOfExperienceText: "8 years", sourceText: null },
  contacts: [],
  competencies: [],
  skills: [{ id: "s1", sourceRecordId: null, label: "Kafka", value: "", tone: "positive" }],
  experiences: [{ id: "e1", sourceRecordId: null, companyName: "Acme", roleName: "Engineer", dateLabel: "2020 - 2024", current: false, summary: "Built payments." }],
  projects: [{ id: "p1", sourceRecordId: null, title: "Settlement rewrite", dateLabel: "2023", summary: "Cut batch time.", tags: [], relatedExperienceId: "e1" }],
  achievements: [],
  education: [],
  certifications: [],
  awards: [],
  risks: [
    { id: "r1", title: "Vague ownership", severityLabel: "Low", severity: "LOW", description: "Team vs. you" },
    { id: "r2", title: "Unproven 40% claim", severityLabel: "High", severity: "HIGH", description: "No baseline" },
  ],
};

const activate = vi.fn();
const reExtract = vi.fn();

function mockList(list: ResumeListModel) {
  vi.mocked(useResumeListQuery).mockReturnValue({ data: list, isLoading: false, isError: false, error: null, refetch: vi.fn() } as never);
}

function mockVersion(detail: ResumeVersionModel | undefined, extractionStatus = "completed") {
  vi.mocked(useResumeVersionDetailQuery).mockReturnValue({ data: detail, isLoading: false } as never);
  vi.mocked(useResumeVersionExtractionQuery).mockReturnValue({ data: { extractionStatus }, isFetched: true, isLoading: false } as never);
}

beforeEach(() => {
  activate.mockReset();
  reExtract.mockReset();
  vi.mocked(useActivateResumeVersionMutation).mockReturnValue({ mutate: activate, mutateAsync: activate, isPending: false, error: null } as never);
  vi.mocked(useReExtractResumeVersionMutation).mockReturnValue({ mutate: reExtract, isPending: false, error: null } as never);
  vi.mocked(useCreateResumeMutation).mockReturnValue({ mutateAsync: vi.fn(), isPending: false, error: null, reset: vi.fn() } as never);
  vi.mocked(useUploadResumeVersionMutation).mockReturnValue({ mutateAsync: vi.fn(), isPending: false, error: null, reset: vi.fn() } as never);
  vi.mocked(useResumeVersionSnapshotsQuery).mockReturnValue({ data: snapshot, isLoading: false, isError: false } as never);
});

function renderHub(route: string) {
  return renderWithProviders(
    <>
      <Routes>
        <Route element={<ResumeIndexPage />} path="/resume" />
        <Route element={<ResumeHubLayout />} path="/resume/:versionId">
          <Route element={<ResumeOverviewTab />} index />
          <Route element={<ResumeVersionsTab />} path="versions" />
        </Route>
      </Routes>
      <LocationDisplay />
    </>,
    { route, locale: "ko" },
  );
}

describe("resume hub", () => {
  it("opens the active version's overview from /resume, risks first and worst first", async () => {
    mockList({ items: [{ id: "r1", title: "Backend Resume", versions: [version()] }] });
    mockVersion(version());
    renderHub("/resume");

    expect(await screen.findByRole("heading", { level: 1, name: "Backend Resume" })).toBeInTheDocument();
    expect(screen.getByTestId("location-display")).toHaveTextContent("/resume/v1");
    const tabs = screen.getByRole("navigation", { name: "이력서 보기" });
    expect(within(tabs).getByRole("link", { name: "개요" })).toHaveAttribute("aria-current", "page");
    expect(within(tabs).getByRole("link", { name: "근거 편집" })).toHaveAttribute("href", "/resume/v1/claims");
    const risks = screen.getByRole("region", { name: "방어가 필요한 부분" });
    const titles = within(risks).getAllByText(/Unproven|Vague/).map((node) => node.textContent);
    expect(titles).toEqual(["Unproven 40% claim", "Vague ownership"]);
    expect(screen.getByText("Settlement rewrite")).toBeInTheDocument();
    expect(screen.queryByText("지금 사용 중인 버전이 아니에요")).not.toBeInTheDocument();
  });

  it("shows first-run onboarding when nothing is uploaded yet", async () => {
    mockList({ items: [] });
    mockVersion(undefined);
    renderHub("/resume");

    expect(screen.getByRole("heading", { level: 1, name: "이력서를 올려주세요" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "올리고 분석 시작" }));
    expect(screen.getByRole("alert")).toHaveTextContent("PDF 파일을 골라주세요.");
  });

  it("offers to activate a version that is not the active one", async () => {
    mockList({ items: [{ id: "r1", title: "Backend Resume", versions: [version({ id: "v2", versionNumberLabel: "Version 2", isActive: false }), version()] }] });
    mockVersion(version({ id: "v2", isActive: false }));
    renderHub("/resume/v2");

    expect(screen.getByText("지금 사용 중인 버전이 아니에요")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "이 버전 사용하기" }));
    expect(activate).toHaveBeenCalledWith("v2");
  });

  it("waits for analysis instead of showing an empty overview", () => {
    mockList({ items: [{ id: "r1", title: "Backend Resume", versions: [version({ parsingStatus: "processing" })] }] });
    mockVersion(version({ parsingStatus: "processing" }), "pending");
    renderHub("/resume/v1");

    expect(screen.getByText("이력서를 분석하고 있어요")).toBeInTheDocument();
    expect(screen.getByText("분석 중")).toBeInTheDocument();
  });

  it("says so when the version does not exist", () => {
    mockList({ items: [{ id: "r1", title: "Backend Resume", versions: [version()] }] });
    mockVersion(undefined);
    renderHub("/resume/404");

    expect(screen.getByRole("heading", { level: 1, name: "이 이력서 버전을 찾을 수 없어요" })).toBeInTheDocument();
  });

  it("manages versions: re-extract, activate another, and create a resume in a dialog", async () => {
    mockList({ items: [{ id: "r1", title: "Backend Resume", versions: [version(), version({ id: "v2", versionNumberLabel: "Version 2", isActive: false })] }] });
    mockVersion(version());
    renderHub("/resume/v1/versions");

    const card = screen.getByRole("region", { name: "Backend Resume" });
    expect(within(card).getAllByRole("listitem")).toHaveLength(2);
    await userEvent.click(within(card).getByRole("button", { name: "사용하기" }));
    expect(activate).toHaveBeenCalledWith("v2");
    await userEvent.click(within(card).getAllByRole("button", { name: "다시 추출" })[0]);
    expect(reExtract).toHaveBeenCalledWith("v1");

    await userEvent.click(screen.getByRole("button", { name: "새 이력서" }));
    expect(screen.getByRole("dialog", { name: "새 이력서" })).toBeInTheDocument();
  });
});
