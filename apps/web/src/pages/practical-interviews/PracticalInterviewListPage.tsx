import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getResumeVersionChoices } from "../../entities/resume/model";
import { useCreateInterviewRecordMutation } from "../../features/practical-interview/api/useCreateInterviewRecordMutation";
import { useInterviewRecordListQuery } from "../../features/practical-interview/api/useInterviewRecordListQuery";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { useLocale } from "../../shared/i18n";
import { SectionPanel } from "../../shared/ui/layout";

export function PracticalInterviewListPage() {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const navigate = useNavigate();
  const location = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [roleName, setRoleName] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewType, setInterviewType] = useState("onsite");
  const [transcriptText, setTranscriptText] = useState("");
  const [selectedResumeVersionId, setSelectedResumeVersionId] = useState<string>("");
  const [uploadOpen, setUploadOpen] = useState(location.pathname.endsWith("/upload"));
  const recordListQuery = useInterviewRecordListQuery();
  const resumeListQuery = useResumeListQuery();
  const createRecordMutation = useCreateInterviewRecordMutation();
  const resumeChoices = useMemo(
    () => getResumeVersionChoices(resumeListQuery.data),
    [resumeListQuery.data],
  );
  const importedRecordCount = recordListQuery.data?.length ?? 0;
  const processingRecordCount =
    recordListQuery.data?.filter(
      (record) =>
        record.transcriptStatus === "pending" || record.transcriptStatus === "processing",
    ).length ?? 0;
  const retryRecordCount =
    recordListQuery.data?.filter((record) => record.transcriptRetryCount > 0).length ?? 0;
  const readyReviewCount =
    recordListQuery.data?.filter(
      (record) =>
        record.transcriptStatus === "completed" || record.analysisStatus === "completed",
    ).length ?? 0;

  useEffect(() => {
    if (!selectedResumeVersionId && resumeChoices.length > 0) {
      setSelectedResumeVersionId(
        resumeChoices.find((choice) => choice.isActive)?.versionId ?? resumeChoices[0].versionId,
      );
    }
  }, [resumeChoices, selectedResumeVersionId]);

  async function handleCreateRecord() {
    if (!file) {
      return;
    }

    const payload = new FormData();
    payload.set("file", file);

    if (companyName.trim()) {
      payload.set("companyName", companyName.trim());
    }

    if (roleName.trim()) {
      payload.set("roleName", roleName.trim());
    }

    if (interviewDate) {
      payload.set("interviewDate", interviewDate);
    }

    if (interviewType) {
      payload.set("interviewType", interviewType);
    }

    if (selectedResumeVersionId) {
      payload.set("linkedResumeVersionId", selectedResumeVersionId);
    }

    if (transcriptText.trim()) {
      payload.set("transcriptText", transcriptText.trim());
    }

    const created = await createRecordMutation.mutateAsync(payload);
    const nextPath = routeConfig.practicalInterviewDetail.buildPath({ recordId: created.id });
    const nextSearch =
      created.isTranscriptPending || created.isTranscriptProcessing ? "?processing=1" : "";

    navigate(`${nextPath}${nextSearch}`);
  }

  return (
    <PageContainer
      description={
        isKorean
          ? "실제 면접 아티팩트 하나를 가져와 전사 준비 상태를 안정화하고, 다음 복구 리뷰 작업공간으로 연결하세요."
          : "Import one real interview artifact, stabilize transcript readiness, and turn it into the next recovery review workspace."
      }
      eyebrow={isKorean ? "복구 루프" : "Recovery loop"}
      title={isKorean ? "복구 리뷰를 열기 전에 실제 면접 근거를 가져오세요" : "Import real interview evidence before opening recovery review"}
    >
      {recordListQuery.isLoading ? (
        <LoadingStateCard
          body={isKorean ? "가져온 면접 기록을 불러오고 업로드 작업공간을 준비하는 중입니다." : "Loading imported interview records and preparing the upload workspace."}
          title={isKorean ? "실전 면접 준비 중" : "Preparing practical interviews"}
        />
      ) : null}

      {recordListQuery.isError ? (
        <ErrorStateCard
          body={
            recordListQuery.error instanceof Error
              ? recordListQuery.error.message
              : isKorean
                ? "실전 면접 기록을 불러오지 못했습니다."
                : "The practical interview records could not be loaded."
          }
          details={getErrorDetails(recordListQuery.error)}
          onAction={() => {
            void recordListQuery.refetch();
          }}
          title={isKorean ? "실전 면접을 불러올 수 없습니다" : "Unable to load practical interviews"}
        />
      ) : null}

      {!recordListQuery.isLoading && !recordListQuery.isError ? (
        <div className="practical-list-layout">
          <section className="practical-list-workspace-surface">
            <div className="practical-list-workspace-surface__header">
              <div className="practical-list-workspace-surface__intro">
                <div className="practical-list-workspace-surface__eyebrow-row">
                  <p className="practical-list-workspace-surface__breadcrumbs">
                    <span>{isKorean ? "가져온 면접" : "Imported interview"}</span>
                    <span>/</span>
                    <span>{isKorean ? "전사 준비 상태" : "Transcript readiness"}</span>
                    <span>/</span>
                    <span>{isKorean ? "복구 리뷰" : "Recovery review"}</span>
                  </p>
                  <span className="question-status-badge question-status-badge--neutral">
                    {isKorean ? "리플레이 준비 워크플로우" : "Replay-ready workflow"}
                  </span>
                </div>
                <h2 className="practical-list-workspace-surface__title">
                  {isKorean
                    ? "실제 면접 하나를 가져와 집중된 복구 루프로 연결하세요"
                    : "Import one real interview and route it into one focused recovery loop"}
                </h2>
                <p className="practical-list-workspace-surface__body">
                  {isKorean
                    ? "각 업로드는 전사 품질, 연결된 이력서 컨텍스트, 꼬리질문 리플레이 경로가 깊은 분석 전부터 보이는 구조화된 리뷰 작업공간이 되어야 합니다."
                    : "Each upload should become a structured review workspace with transcript quality, linked resume context, and follow-up replay paths already visible before deep analysis starts."}
                </p>
              </div>
              <div className="practical-list-workspace-surface__stats">
                <article className="practical-list-workspace-surface__stat">
                  <span>{isKorean ? "가져온 기록" : "Imported records"}</span>
                  <strong>{importedRecordCount}</strong>
                </article>
                <article className="practical-list-workspace-surface__stat">
                  <span>{isKorean ? "리뷰 준비 완료" : "Ready for review"}</span>
                  <strong>{readyReviewCount}</strong>
                </article>
                <article className="practical-list-workspace-surface__stat">
                  <span>{isKorean ? "현재 처리 중" : "Processing now"}</span>
                  <strong>{processingRecordCount}</strong>
                </article>
                <article className="practical-list-workspace-surface__stat">
                  <span>{isKorean ? "이력서 버전" : "Resume versions"}</span>
                  <strong>{resumeChoices.length}</strong>
                </article>
              </div>
            </div>
            <div className="practical-list-workspace-surface__chips">
              <span className="detail-chip">
                {isKorean ? "업로드 상태" : "Upload state"}: {file ? file.name : isKorean ? "선택된 파일 없음" : "No file selected"}
              </span>
              <span className="detail-chip">
                {isKorean ? "재시도 큐" : "Retry queue"}: {isKorean ? `${retryRecordCount}건` : `${retryRecordCount} record${retryRecordCount === 1 ? "" : "s"}`}
              </span>
              <span className="detail-chip">
                {isKorean ? "다음 동작" : "Next action"}: {uploadOpen ? (isKorean ? "가져오기 폼 작성" : "complete import form") : isKorean ? "업로드 열기 또는 리뷰 이어가기" : "open upload or continue review"}
              </span>
            </div>
            <div className="practical-list-workspace-surface__guidance">
              <article className="practical-list-workspace-surface__guidance-card">
                <span>{isKorean ? "가져오기 원칙" : "Import rule"}</span>
                <strong>{isKorean ? "회사, 직무, 전사 컨텍스트를 명확히 넣어 애매한 아티팩트에서 리뷰가 시작되지 않게 하세요." : "Bring one interview in with explicit company, role, and transcript context so review does not start from an ambiguous artifact."}</strong>
              </article>
              <article className="practical-list-workspace-surface__guidance-card">
                <span>{isKorean ? "복구 우선순위" : "Recovery priority"}</span>
                <strong>
                  {processingRecordCount > 0
                    ? isKorean
                      ? "전사 준비 중인 기록을 먼저 끝내고, 재시도를 정리한 뒤 다음 가져오기를 진행하세요."
                      : "Finish transcript-ready records first, then clean up retries before importing more."
                    : isKorean
                      ? "가장 최근 완료된 기록을 먼저 열어 집중된 복구 리뷰로 연결하세요."
                      : "Open the freshest completed record first and turn it into a focused recovery review."}
                </strong>
              </article>
              <article className="practical-list-workspace-surface__guidance-card">
                <span>{isKorean ? "이탈 조건" : "Exit rule"}</span>
                <strong>{isKorean ? "전사, 질문, 스레드 실패를 점검할 준비가 된 기록 하나가 분명해지면 이 페이지를 벗어나세요." : "Leave this page once one record is clearly ready to inspect transcript, question, and thread failures."}</strong>
              </article>
            </div>
          </section>

          <div className="practical-list-priority-board">
            <section className="page-card practical-list-priority-board__main">
              <div className="section-heading">
                <div>
                  <p className="section-heading__eyebrow">{isKorean ? "가져오기 흐름" : "Import flow"}</p>
                  <h2 className="page-card__title">
                    {isKorean ? "이 작업공간의 역할" : "What this workspace is for"}
                  </h2>
                </div>
              </div>
              <div className="practical-list-priority-board__steps">
                <article className="practical-list-priority-step">
                  <div className="practical-list-priority-step__index">1</div>
                  <div className="practical-list-priority-step__body">
                    <strong>{isKorean ? "면접 아티팩트 하나를 확보하세요" : "Capture one interview artifact"}</strong>
                    <span>
                      {isKorean
                        ? "회사, 직무, 일자 맥락을 잃지 않은 채 오디오와 전사 정보를 함께 가져오세요."
                        : "Bring in audio and transcript context without losing company, role, and date."}
                    </span>
                  </div>
                </article>
                <article className="practical-list-priority-step">
                  <div className="practical-list-priority-step__index">2</div>
                  <div className="practical-list-priority-step__body">
                    <strong>{isKorean ? "기준 문서와 연결하세요" : "Link it to source-of-truth"}</strong>
                    <span>
                      {isKorean
                        ? "나중의 약점 분석이 실제 주장으로 되돌아가도록 정확한 이력서 버전을 연결하세요."
                        : "Attach the correct resume version so later weakness analysis maps back to real claims."}
                    </span>
                  </div>
                </article>
                <article className="practical-list-priority-step">
                  <div className="practical-list-priority-step__index">3</div>
                  <div className="practical-list-priority-step__body">
                    <strong>{isKorean ? "집중된 리뷰 화면 하나를 여세요" : "Open one focused review surface"}</strong>
                    <span>
                      {isKorean
                        ? "여러 경로를 헤매지 말고 전사, 질문, 스레드 리뷰로 바로 이어가세요."
                        : "Move into transcript, question, and thread review without hunting across routes."}
                    </span>
                  </div>
                </article>
              </div>
            </section>

            <SectionPanel
              className="workspace-note-card workspace-note-card--accent practical-list-priority-board__side"
              variant="muted"
            >
              <span className="page-card__label">{isKorean ? "범위 신호" : "Coverage signals"}</span>
              <h2 className="page-card__title">{isKorean ? "현재 큐 상태" : "Current queue health"}</h2>
              <div className="practical-list-signal-list">
                <div className="practical-list-signal-list__item">
                  <span>{isKorean ? "처리 중" : "Processing"}</span>
                  <strong>
                    {isKorean
                      ? `${processingRecordCount}개의 기록이 아직 전사 준비를 기다리고 있습니다.`
                      : `${processingRecordCount} records are still waiting for transcript readiness.`}
                  </strong>
                </div>
                <div className="practical-list-signal-list__item">
                  <span>{isKorean ? "리플레이 준비 완료" : "Replay ready"}</span>
                  <strong>
                    {isKorean
                      ? `${readyReviewCount}개의 기록은 바로 리뷰 작업공간으로 열 수 있습니다.`
                      : `${readyReviewCount} records can already be opened as review workspaces.`}
                  </strong>
                </div>
                <div className="practical-list-signal-list__item">
                  <span>{isKorean ? "이력서 컨텍스트" : "Resume context"}</span>
                  <strong>
                    {resumeChoices.length > 0
                      ? isKorean
                        ? "이력서와 연결된 가져오기는 이후 히트맵과 기준 문서 보강으로 이어질 수 있습니다."
                        : "Resume-linked imports can feed heatmap and source-of-truth repair later."
                      : isKorean
                        ? "아직 파싱된 이력서 버전이 없어 가져온 기록이 분리된 상태로 남습니다."
                        : "No parsed resume version is ready yet, so imports will stay isolated."}
                  </strong>
                </div>
              </div>
            </SectionPanel>
          </div>

          <div className="practical-list-layout__workspace">
            <div className="page-stack practical-list-layout__main">
              {uploadOpen ? (
                <section className="page-card page-card--inset practical-import-form-card">
                  <span className="page-card__label">{isKorean ? "업로드" : "Upload"}</span>
                  <h2 className="page-card__title">{isKorean ? "면접 기록 만들기" : "Create an interview record"}</h2>
                  <p className="page-card__body">
                    {isKorean
                      ? "이 단계에서 가져오기 메타데이터를 분명히 남겨야 다음 리뷰 화면이 무엇이 들어왔고 어디서 왔는지, 어떤 이력서 주장에 도전해야 하는지 설명할 수 있습니다."
                      : "Keep import metadata explicit now so the downstream review page can explain what happened, where it came from, and which resume claims it should challenge."}
                  </p>
                  <div className="practical-import-form-card__summary">
                    <span className="detail-chip">{isKorean ? "오디오 필수" : "Audio required"}</span>
                    <span className="detail-chip">{isKorean ? "이력서 연결 선택" : "Resume link optional"}</span>
                    <span className="detail-chip">{isKorean ? "전사 붙여넣기 선택" : "Transcript paste optional"}</span>
                  </div>
                  <div className="practical-import-form-card__guidance">
                    <article className="practical-import-form-card__guidance-item">
                      <span>{isKorean ? "권장 사용" : "Best use"}</span>
                      <strong>
                        {isKorean
                          ? "약한 답변, 전사 품질, 이력서 정합성을 함께 점검할 준비가 되었을 때 면접 하나만 가져오세요."
                          : "Import a single interview when you are ready to inspect weak answers, transcript quality, and resume alignment together."}
                      </strong>
                    </article>
                    <article className="practical-import-form-card__guidance-item">
                      <span>{isKorean ? "제출 전 확인" : "Before submit"}</span>
                      <strong>
                        {isKorean
                          ? "실제로 그 면접의 근거가 된 이력서 버전을 선택하세요. 그렇지 않으면 이후 약점 분석이 기준 문서에서 벗어납니다."
                          : "Choose the resume version that actually grounded that interview, otherwise later weakness analysis will drift from source of truth."}
                      </strong>
                    </article>
                  </div>
                  <div className="form-grid">
                    <label className="form-field">
                      <span className="form-field__label">{isKorean ? "오디오 파일" : "Audio file"}</span>
                      <input
                        accept=".mp3,.m4a,.wav,.aac,.ogg,.webm"
                        className="form-input"
                        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                        type="file"
                      />
                      <span className="form-field__hint">
                        {isKorean
                          ? "면접 오디오를 업로드하세요. 아래에 전사를 붙여넣지 않으면 서버가 자동으로 전사를 추출할 수 있습니다."
                          : "Upload the interview audio. The server can extract a transcript automatically if you do not paste one below."}
                      </span>
                    </label>
                    <label className="form-field">
                      <span className="form-field__label">{isKorean ? "회사" : "Company"}</span>
                      <input
                        className="form-input"
                        onChange={(event) => setCompanyName(event.target.value)}
                        type="text"
                        value={companyName}
                      />
                    </label>
                    <label className="form-field">
                      <span className="form-field__label">{isKorean ? "직무" : "Role"}</span>
                      <input
                        className="form-input"
                        onChange={(event) => setRoleName(event.target.value)}
                        type="text"
                        value={roleName}
                      />
                    </label>
                    <label className="form-field">
                      <span className="form-field__label">{isKorean ? "면접 일자" : "Interview date"}</span>
                      <input
                        className="form-input"
                        onChange={(event) => setInterviewDate(event.target.value)}
                        type="date"
                        value={interviewDate}
                      />
                    </label>
                    <label className="form-field">
                      <span className="form-field__label">{isKorean ? "면접 유형" : "Interview type"}</span>
                      <select
                        className="form-input"
                        onChange={(event) => setInterviewType(event.target.value)}
                        value={interviewType}
                      >
                        <option value="onsite">{isKorean ? "대면" : "Onsite"}</option>
                        <option value="phone">{isKorean ? "전화" : "Phone"}</option>
                        <option value="virtual">{isKorean ? "화상" : "Virtual"}</option>
                        <option value="behavioral">{isKorean ? "행동 면접" : "Behavioral"}</option>
                        <option value="system_design">{isKorean ? "시스템 디자인" : "System design"}</option>
                      </select>
                    </label>
                    <label className="form-field">
                      <span className="form-field__label">{isKorean ? "연결할 이력서 버전" : "Linked resume version"}</span>
                      <select
                        className="form-input"
                        onChange={(event) => setSelectedResumeVersionId(event.target.value)}
                        value={selectedResumeVersionId}
                      >
                        <option value="">{isKorean ? "없음" : "None"}</option>
                        {resumeChoices.map((choice) => (
                          <option key={choice.versionId} value={choice.versionId}>
                            {choice.resumeTitle} · {choice.versionNumberLabel}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="form-field form-field--full">
                      <span className="form-field__label">{isKorean ? "전사 텍스트 직접 입력" : "Transcript text override"}</span>
                      <textarea
                        className="form-input form-input--textarea"
                        onChange={(event) => setTranscriptText(event.target.value)}
                        placeholder={
                          isKorean
                            ? "선택 사항: 이미 전사가 있다면 여기에 붙여넣으세요."
                            : "Optional: paste a transcript if you already have one."
                        }
                        rows={5}
                        value={transcriptText}
                      />
                      <span className="form-field__hint">
                        {isKorean
                          ? "선택 사항입니다. 비워두면 서버가 오디오에서 전사를 추출하고 이후 처리를 계속합니다."
                          : "Optional. If omitted, the server will try to extract a transcript from the audio and continue processing."}
                      </span>
                    </label>
                  </div>
                  {createRecordMutation.isError ? (
                    <ErrorStateCard
                      body={
                        createRecordMutation.error instanceof Error
                          ? createRecordMutation.error.message
                          : isKorean
                            ? "면접 기록을 만들지 못했습니다."
                            : "The interview record could not be created."
                      }
                      details={getErrorDetails(createRecordMutation.error)}
                      onAction={() => createRecordMutation.reset()}
                      title={isKorean ? "면접 기록을 만들 수 없습니다" : "Unable to create interview record"}
                    />
                  ) : null}
                  <div className="page-card__actions">
                    <button
                      className="primary-button"
                      disabled={!file || createRecordMutation.isPending}
                      onClick={() => {
                        void handleCreateRecord();
                      }}
                      type="button"
                    >
                      {createRecordMutation.isPending
                        ? isKorean
                          ? "업로드 중..."
                          : "Uploading..."
                        : isKorean
                          ? "기록 만들기"
                          : "Create record"}
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => setUploadOpen(false)}
                      type="button"
                    >
                      {isKorean ? "폼 닫기" : "Close form"}
                    </button>
                  </div>
                </section>
              ) : null}

              {recordListQuery.data && recordListQuery.data.length > 0 ? (
                <section className="page-card practical-record-list-card">
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">{isKorean ? "가져온 기록" : "Imported records"}</p>
                      <h2 className="page-card__title">{isKorean ? "리뷰 작업공간 열기" : "Open a review workspace"}</h2>
                    </div>
                    <div className="chip-list">
                      <span className="detail-chip">{isKorean ? "최신 가져오기 기록을 여기서 바로 검토합니다" : "Newest imports stay actionable here"}</span>
                    </div>
                  </div>
                  <div className="stack-list">
                    {recordListQuery.data.map((record) => (
                      <button
                        className="list-item-card practical-record-row"
                        key={record.id}
                        onClick={() => {
                          navigate(
                            routeConfig.practicalInterviewDetail.buildPath({ recordId: record.id }),
                          );
                        }}
                        type="button"
                      >
                        <div className="list-item-card__content">
                          <div className="list-item-card__meta">
                            <span>{record.interviewTypeLabel}</span>
                            {record.interviewDateLabel ? <span>{record.interviewDateLabel}</span> : null}
                            <span>{isKorean ? `${record.questionCount}개 질문` : `${record.questionCount} questions`}</span>
                          </div>
                          <h3 className="list-item-card__title">{record.title}</h3>
                          <div className="chip-list practical-record-row__chips">
                            <span
                              className={`question-status-badge question-status-badge--${record.transcriptStatusTone}`}
                            >
                              {isKorean ? `전사 ${record.transcriptStatusLabel}` : `Transcript ${record.transcriptStatusLabel}`}
                            </span>
                            <span className="question-status-badge question-status-badge--accent">
                              {isKorean ? `분석 ${record.analysisStatusLabel}` : `Analysis ${record.analysisStatusLabel}`}
                            </span>
                            {record.transcriptRetryCount > 0 ? (
                              <span className="detail-chip detail-chip--warning">
                                {isKorean ? `재시도 ${record.transcriptRetryCount}` : `Retry ${record.transcriptRetryCount}`}
                              </span>
                            ) : null}
                          </div>
                          <p className="list-item-card__body practical-record-row__body">
                            {record.transcriptStatus === "failed"
                              ? record.transcriptErrorLabel ??
                                (isKorean
                                  ? "자동 전사에 실패했습니다. 기록을 열어 재시도하거나 상태를 확인하세요."
                                  : "Automatic transcription failed. Open the record to retry or inspect the status.")
                              : record.transcriptNextRetryAtLabel
                                ? isKorean
                                  ? `다음 재시도 ${record.transcriptNextRetryAtLabel}`
                                  : `Next retry ${record.transcriptNextRetryAtLabel}`
                                : isKorean
                                  ? "하나의 작업공간에서 전사 리뷰, 구조화 질문, 꼬리질문 스레드, 리플레이 준비 상태를 함께 확인하세요."
                                  : "Open transcript review, structured questions, follow-up threads, and replay readiness from one workspace."}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              ) : (
                !recordListQuery.isLoading &&
                !recordListQuery.isError && (
                  <EmptyStateCard
                    body={
                      isKorean
                        ? "아직 가져온 면접 기록이 없습니다. 첫 면접을 업로드해 리뷰 흐름을 시작하세요."
                        : "No imported interview records exist yet. Upload the first interview to open the review flow."
                    }
                    title={isKorean ? "실전 면접 기록이 없습니다" : "No practical interviews yet"}
                  />
                )
              )}
            </div>

            <aside className="practical-list-layout__side">
              <SectionPanel className="workspace-note-card" variant="muted">
                <span className="page-card__label">{isKorean ? "다음 화면" : "Next surface"}</span>
                <h2 className="page-card__title">
                  {isKorean ? "각 기록은 집중된 리뷰 시스템 하나로 이어져야 합니다" : "Each record should open one focused review system"}
                </h2>
                <p className="page-card__body">
                  {isKorean
                    ? "다음 화면은 전사 품질, 구조화 질문, 꼬리질문 스레드, 리플레이 준비 상태를 흩어놓지 말고 한곳에서 정렬해 보여줘야 합니다."
                    : "The next screen should keep transcript quality, structured questions, follow-up threads, and replay readiness aligned, not spread across unrelated tools."}
                </p>
              </SectionPanel>
              <SectionPanel className="workspace-note-card" variant="muted">
                <span className="page-card__label">{isKorean ? "큐 운영 원칙" : "Queue habit"}</span>
                <h2 className="page-card__title">{isKorean ? "가져온 기록이 오래되기 전에 처리하세요" : "Process imports before they go stale"}</h2>
                <p className="page-card__body">
                  {isKorean
                    ? "재시도나 전사 정리가 필요한 기록은 빠르게 검토해야 약한 주장들이 DFS 면접 연습 루프와 깨끗하게 연결됩니다."
                    : "Records waiting on retries or transcript cleanup should be reviewed quickly so their weak claims still map cleanly into the DFS interview practice loop."}
                </p>
                <div className="practical-list-signal-list">
                  <div className="practical-list-signal-list__item">
                    <span>{isKorean ? "1. 큐 안정화" : "1. Stabilize queue"}</span>
                    <strong>{isKorean ? "더 큰 백로그를 만들기 전에 처리 중이거나 재시도 중인 기록을 먼저 정리하세요." : "Resolve processing and retry records before building a larger backlog."}</strong>
                  </div>
                  <div className="practical-list-signal-list__item">
                    <span>{isKorean ? "2. 복구 시작" : "2. Open recovery"}</span>
                    <strong>{isKorean ? "다음 완료 기록을 열어 집중된 리뷰와 리플레이 사이클 하나를 시작하세요." : "Use the next completed record to launch one focused review and replay cycle."}</strong>
                  </div>
                </div>
                <div className="page-card__actions">
                  <button
                    className="primary-button"
                    onClick={() => setUploadOpen((current) => !current)}
                    type="button"
                  >
                    {uploadOpen
                      ? isKorean
                        ? "업로드 폼 숨기기"
                        : "Hide upload form"
                      : isKorean
                        ? "면접 업로드"
                        : "Upload interview"}
                  </button>
                </div>
              </SectionPanel>
            </aside>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}
