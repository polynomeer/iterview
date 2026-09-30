import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCreateInterviewRecordMutation } from "../../features/practical-interview/api/useCreateInterviewRecordMutation";
import { useInterviewRecordListQuery } from "../../features/practical-interview/api/useInterviewRecordListQuery";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { PracticalInterviewListPage } from "../../pages/practical-interviews/PracticalInterviewListPage";
import { PracticalInterviewUploadPage } from "../../pages/practical-interviews/PracticalInterviewUploadPage";
import { LocationDisplay, renderWithProviders } from "../utils";

vi.mock("../../features/practical-interview/api/useInterviewRecordListQuery", () => ({ useInterviewRecordListQuery: vi.fn() }));
vi.mock("../../features/practical-interview/api/useCreateInterviewRecordMutation", () => ({ useCreateInterviewRecordMutation: vi.fn() }));
vi.mock("../../features/resume/api/useResumeListQuery", () => ({ useResumeListQuery: vi.fn() }));

const createRecord = vi.fn();

beforeEach(() => {
  createRecord.mockReset().mockResolvedValue({ id: "record-9" });
  vi.mocked(useCreateInterviewRecordMutation).mockReturnValue({ mutateAsync: createRecord, isPending: false, error: null } as never);
  vi.mocked(useResumeListQuery).mockReturnValue({
    data: { items: [{ id: "resume-1", title: "Backend Resume", versions: [{ id: "version-1", versionNumberLabel: "Version 1", isActive: true, parsingStatus: "completed" }] }] },
    isLoading: false,
    isError: false,
  } as never);
});

describe("PracticalInterviewListPage", () => {
  it("lists interviews with a plain status and links to each", () => {
    vi.mocked(useInterviewRecordListQuery).mockReturnValue({
      data: [
        { id: "record-1", title: "Datadog · Backend Engineer", interviewType: "onsite", interviewDateLabel: "2026년 3월 15일", transcriptStatus: "processing", questionCount: 0 },
        { id: "record-2", title: "Toss · Server", interviewType: "virtual", interviewDateLabel: "2026년 3월 1일", transcriptStatus: "confirmed", questionCount: 6 },
      ],
      isLoading: false,
      isError: false,
    } as never);
    renderWithProviders(<PracticalInterviewListPage />, { route: "/interview/records", locale: "ko" });

    expect(screen.getByRole("heading", { level: 1, name: "실전 면접 복기" })).toBeInTheDocument();
    expect(screen.getByText("대본 만드는 중")).toBeInTheDocument();
    expect(screen.getByText("질문 6개")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "열기" })[1]).toHaveAttribute("href", "/interview/records/record-2");
    expect(screen.getByRole("link", { name: "면접 기록 추가" })).toHaveAttribute("href", "/interview/records/upload");
  });
});

describe("PracticalInterviewUploadPage", () => {
  function renderUpload() {
    renderWithProviders(
      <Routes>
        <Route element={<PracticalInterviewUploadPage />} path="/interview/records/upload" />
        <Route element={<LocationDisplay />} path="/interview/records/:recordId" />
      </Routes>,
      { route: "/interview/records/upload", locale: "ko" },
    );
  }

  it("uploads the audio linked to the active resume by default", async () => {
    renderUpload();
    await userEvent.click(screen.getByRole("button", { name: "올리고 분석 시작" }));
    expect(screen.getByText("면접 녹음 파일이 필요해요.")).toBeInTheDocument();

    const audio = new File(["x"], "interview.m4a", { type: "audio/mp4" });
    await userEvent.upload(screen.getByLabelText(/오디오 파일 선택/), audio);
    await userEvent.type(screen.getByLabelText("회사"), "Datadog");
    expect(screen.getByRole("checkbox", { name: /이력서\(Backend Resume · Version 1\)/ })).toBeChecked();
    await userEvent.click(screen.getByRole("button", { name: "올리고 분석 시작" }));

    await waitFor(() => expect(screen.getByTestId("location-display")).toHaveTextContent("/interview/records/record-9"));
    const payload = createRecord.mock.calls[0][0] as FormData;
    expect(payload.get("companyName")).toBe("Datadog");
    expect(payload.get("linkedResumeVersionId")).toBe("version-1");
    expect(payload.get("file")).toBeInstanceOf(File);
  });

  it("lets the user opt out of linking the resume and requires consent before recording", async () => {
    renderUpload();
    await userEvent.click(screen.getByRole("radio", { name: "지금 녹음하기" }));
    expect(screen.getByRole("button", { name: "녹음 시작" })).toBeDisabled();
    await userEvent.click(screen.getByRole("checkbox", { name: /동의해요/ }));
    expect(screen.getByRole("button", { name: "녹음 시작" })).toBeEnabled();

    await userEvent.click(screen.getByRole("radio", { name: "파일 올리기" }));
    await userEvent.upload(screen.getByLabelText(/오디오 파일 선택/), new File(["x"], "a.mp3", { type: "audio/mpeg" }));
    await userEvent.click(screen.getByRole("checkbox", { name: /이력서/ }));
    await userEvent.click(screen.getByRole("button", { name: "올리고 분석 시작" }));

    await waitFor(() => expect(createRecord).toHaveBeenCalled());
    expect((createRecord.mock.calls[0][0] as FormData).get("linkedResumeVersionId")).toBeNull();
  });
});
