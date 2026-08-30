import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { PracticalInterviewListPage } from "../../pages/practical-interviews/PracticalInterviewListPage";
import { useCreateInterviewRecordMutation } from "../../features/practical-interview/api/useCreateInterviewRecordMutation";
import { useInterviewRecordListQuery } from "../../features/practical-interview/api/useInterviewRecordListQuery";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { renderWithProviders } from "../utils";

vi.mock("../../features/practical-interview/api/useInterviewRecordListQuery", () => ({
  useInterviewRecordListQuery: vi.fn(),
}));

vi.mock("../../features/practical-interview/api/useCreateInterviewRecordMutation", () => ({
  useCreateInterviewRecordMutation: vi.fn(),
}));

vi.mock("../../features/resume/api/useResumeListQuery", () => ({
  useResumeListQuery: vi.fn(),
}));

describe("PracticalInterviewListPage", () => {
  it("renders uploaded record list and the expandable upload form", () => {
    vi.mocked(useInterviewRecordListQuery).mockReturnValue({
      data: [
        {
          id: "record-1",
          title: "Datadog · Backend Engineer",
          interviewTypeLabel: "Onsite",
          interviewDateLabel: "Mar 15, 2026",
          transcriptStatus: "processing",
          transcriptStatusLabel: "Processing",
          transcriptStatusTone: "accent",
          transcriptRetryCount: 1,
          transcriptNextRetryAtLabel: "Mar 16, 2026, 9:45 AM",
          analysisStatus: "completed",
          analysisStatusLabel: "Completed",
          questionCount: 6,
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useResumeListQuery).mockReturnValue({
      data: {
        items: [
          {
            id: "resume-1",
            title: "Backend Resume",
            versions: [
              {
                id: "version-1",
                versionNumberLabel: "Version 1",
                uploadedAtLabel: "Mar 12, 2026",
                isActive: true,
                parsingStatus: "completed",
                parsingStatusLabel: "Completed",
              },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
    } as never);
    vi.mocked(useCreateInterviewRecordMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<PracticalInterviewListPage />} path="/practical-interviews" />
      </Routes>,
      { route: "/practical-interviews", locale: "ko" },
    );

    expect(screen.getByText("복구 리뷰를 열기 전에 실제 면접 근거를 가져오세요")).toBeInTheDocument();
    expect(screen.getByText("Datadog · Backend Engineer")).toBeInTheDocument();
    expect(screen.getByText("전사 Processing")).toBeInTheDocument();
    expect(screen.getByText("재시도 1")).toBeInTheDocument();
    expect(screen.getByText("다음 재시도 Mar 16, 2026, 9:45 AM")).toBeInTheDocument();
    expect(screen.getByText("가져오기 원칙")).toBeInTheDocument();
    expect(screen.getByText("큐 운영 원칙")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "면접 업로드" }));

    expect(screen.getByText("면접 기록 만들기")).toBeInTheDocument();
    expect(screen.getByText("권장 사용")).toBeInTheDocument();
    expect(screen.getByLabelText("회사")).toBeInTheDocument();
    expect(screen.getByLabelText("연결할 이력서 버전")).toBeInTheDocument();
    expect(
      screen.getByText(
        "선택 사항입니다. 비워두면 서버가 오디오에서 전사를 추출하고 이후 처리를 계속합니다.",
      ),
    ).toBeInTheDocument();
  });
});
