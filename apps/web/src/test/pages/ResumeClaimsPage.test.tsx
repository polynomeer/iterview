import userEvent from "@testing-library/user-event";
import { screen, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mapClaimEvidence, type ResumeSnapshotModel } from "../../entities/resume/model";
import { useResumeVersionSnapshotsQuery } from "../../features/resume/api/useResumeVersionSnapshotsQuery";
import { useUpdateClaimEvidenceMutation } from "../../features/resume-claims/api/useUpdateClaimEvidenceMutation";
import { useResumeQuestionHeatmapQuery } from "../../features/resume-heatmap/api/useResumeQuestionHeatmapQuery";
import { ResumeClaimsPage } from "../../pages/resume-claims/ResumeClaimsPage";
import { LocationDisplay, renderWithProviders } from "../utils";

vi.mock("../../pages/resume/ResumeHubLayout", () => ({ useResumeHub: () => ({ versionId: "v1" }) }));
vi.mock("../../features/resume/api/useResumeVersionSnapshotsQuery", () => ({ useResumeVersionSnapshotsQuery: vi.fn() }));
vi.mock("../../features/resume-heatmap/api/useResumeQuestionHeatmapQuery", () => ({ useResumeQuestionHeatmapQuery: vi.fn() }));
vi.mock("../../features/resume-claims/api/useUpdateClaimEvidenceMutation", () => ({ useUpdateClaimEvidenceMutation: vi.fn() }));

const ready = mapClaimEvidence({ situationText: "Batch drift", roleText: "Lead", measurementText: "Reconciliation job", resultText: "37 → 0" });

function snapshot(achievements: ResumeSnapshotModel["achievements"]): ResumeSnapshotModel {
  return {
    profile: null,
    contacts: [],
    competencies: [],
    skills: [],
    experiences: [{ id: "e1", sourceRecordId: "e1", companyName: "Acme", roleName: "Engineer", dateLabel: "2020 - 2024", current: false, summary: "" }],
    projects: [{ id: "p1", sourceRecordId: "p1", title: "Settlement rewrite", dateLabel: "2023", summary: "", tags: [], relatedExperienceId: "e1" }],
    achievements,
    education: [],
    certifications: [],
    awards: [],
    risks: [],
  };
}

const claims: ResumeSnapshotModel["achievements"] = [
  { id: "a1", title: "Kafka event pipeline", impactSummary: "", projectId: "p1", experienceId: "e1", evidence: ready },
  { id: "a2", title: "Zero consistency errors after 40% faster batches", metricText: "40%", impactSummary: "", sourceText: "Redesigned transaction boundaries → zero consistency errors", projectId: "p1", experienceId: "e1", evidence: mapClaimEvidence({ situationText: "Monthly batch drift" }) },
  { id: "a3", title: "Led the MSA migration", impactSummary: "", experienceId: "e1", evidence: mapClaimEvidence(null) },
];

const question = {
  id: "q1",
  interviewRecordQuestionId: "q1",
  sourceInterviewRecordId: "record-1",
  linkedQuestionId: null,
  text: "How did you measure zero errors?",
  questionTypeLabel: "Project",
  questionType: "project",
  isFollowUp: false,
  followUpCount: 0,
  pressureQuestion: false,
  weakAnswer: true,
  weaknessTags: [],
  interviewDateLabel: "Mar 17, 2026",
  interviewDateTimeLabel: "Mar 17, 2026",
  interviewDate: "2026-03-17",
  linkSource: "heuristic",
  linkSourceLabel: "Heuristic",
  confidenceScore: 0.7,
  confidenceLabel: "70%",
};

const mutate = vi.fn();

function mockSnapshot(achievements = claims) {
  vi.mocked(useResumeVersionSnapshotsQuery).mockReturnValue({ data: snapshot(achievements), isLoading: false, isError: false, error: null, refetch: vi.fn() } as never);
}

function renderClaims(route = "/resume/v1/claims") {
  return renderWithProviders(
    <Routes>
      <Route
        element={
          <>
            <ResumeClaimsPage />
            <LocationDisplay />
          </>
        }
        path="/resume/:versionId/claims"
      />
    </Routes>,
    { route },
  );
}

describe("ResumeClaimsPage", () => {
  beforeEach(() => {
    mutate.mockReset();
    mockSnapshot();
    vi.mocked(useResumeQuestionHeatmapQuery).mockReturnValue({
      data: { items: [{ id: "h1", anchorType: "project", anchorRecordId: "p1", anchorKey: null, linkedQuestions: [question] }] },
    } as never);
    vi.mocked(useUpdateClaimEvidenceMutation).mockReturnValue({ mutate, isPending: false, isError: false, isSuccess: false } as never);
  });

  it("groups claims by project, shows progress, and opens the first claim that needs evidence", () => {
    renderClaims();

    expect(screen.getByText("Evidence written for 1 of 3")).toBeInTheDocument();
    const project = screen.getByRole("region", { name: "Settlement rewrite" });
    expect(within(project).getAllByRole("button")).toHaveLength(2);
    expect(within(screen.getByRole("region", { name: "Acme" })).getByRole("button", { name: /Led the MSA migration/ })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "1 of 4 evidence fields written" })).toBeInTheDocument();

    // a2 has a number, so the measurement is the first gap; its project drew a weak answer.
    expect(screen.getByRole("heading", { level: 2, name: "Zero consistency errors after 40% faster batches" })).toBeInTheDocument();
    expect(
      screen.getByText("1 of the 1 questions asked about this were weak answers. How you measured it is empty. Interviewers ask “How did you measure that number?”"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("How you measured it")).toHaveAccessibleDescription("The interviewer will ask about this first.");
    expect(screen.getByText("Redesigned transaction boundaries → zero consistency errors")).toBeInTheDocument();
    expect(screen.getByText("How did you measure zero errors?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open in pressure map" })).toHaveAttribute("href", "/resume/v1/heatmap/anchors/project/p1");
    expect(screen.getByRole("link", { name: "Edit as a document" })).toHaveAttribute("href", "/resume/v1/claims/document");
  });

  it("filters to claims that need evidence or drew weak answers", async () => {
    const user = userEvent.setup();
    renderClaims();

    await user.click(screen.getByRole("radio", { name: "Weak 1" }));
    expect(within(screen.getByRole("region", { name: "Settlement rewrite" })).getAllByRole("button")).toHaveLength(1);
    expect(screen.getByRole("button", { name: /Zero consistency errors.*Weak/ })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Acme" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Kafka event pipeline/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Needs evidence 2" }));
    expect(screen.getByRole("button", { name: /Led the MSA migration/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Kafka event pipeline/ })).not.toBeInTheDocument();
  });

  it("saves all four fields and remembers the selected claim in the URL", async () => {
    const user = userEvent.setup();
    renderClaims();

    await user.click(screen.getByRole("button", { name: /Led the MSA migration/ }));
    expect(screen.getByTestId("location-display")).toHaveTextContent("/resume/v1/claims?claim=a3");
    expect(screen.getByRole("heading", { level: 3, name: "Questions from this role" })).toBeInTheDocument();
    expect(screen.getByText("No real interview question has landed here yet.")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Result"), "Deploys 40 → 12 minutes");
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(mutate).toHaveBeenCalledWith({
      achievementId: "a3",
      evidence: { situationText: "", roleText: "", measurementText: "", resultText: "Deploys 40 → 12 minutes" },
    });
  });

  it("confirms a claim with every field written", () => {
    renderClaims("/resume/v1/claims?claim=a1");

    expect(screen.getByText("All four fields are written")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("points to the document editor when no claims were extracted", () => {
    mockSnapshot([]);
    renderClaims();

    expect(screen.getByRole("heading", { name: "No claims were extracted" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit as a document" })).toHaveAttribute("href", "/resume/v1/claims/document");
  });
});
