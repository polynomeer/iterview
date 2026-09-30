import { useId, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateInterviewRecordMutation } from "../../features/practical-interview/api/useCreateInterviewRecordMutation";
import { useActiveResumeVersion } from "../../features/resume/model/useActiveResumeVersion";
import { getErrorDetails, optionalErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { Button, ButtonLink, Callout, Card, Field, Input, PageHeader, Segmented, Select, Textarea } from "../../shared/ui/primitives";
import { INTERVIEW_TYPES } from "./interviewTypes";
import { formatDuration, useAudioRecorder, type RecorderError } from "./useAudioRecorder";
import "./practical.css";


const RECORDER_ERRORS: Record<RecorderError, [string, string]> = {
  "too-large": ["오디오 파일은 50MB 이하여야 해요. 더 짧게 녹음하거나 작은 파일을 고르세요.", "Audio files must be 50 MB or smaller. Record a shorter clip or pick a smaller file."],
  consent: ["녹음하려면 먼저 녹음·업로드에 동의해 주세요.", "Agree to recording and upload first."],
  unsupported: ["이 브라우저는 마이크 녹음을 지원하지 않아요. 파일을 올려주세요.", "This browser can't record from the microphone. Upload a file instead."],
  permission: ["마이크를 쓸 수 없어요. 브라우저 권한을 확인하거나 파일을 올려주세요.", "The microphone isn't available. Check browser permissions or upload a file."],
};

/** 면접 기록 추가: one audio file (uploaded or recorded here) plus a few optional details. */
export function PracticalInterviewUploadPage() {
  const { locale } = useLocale();
  const copy = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const navigate = useNavigate();
  const fileId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recorder = useAudioRecorder();
  const { active } = useActiveResumeVersion();
  const createMutation = useCreateInterviewRecordMutation();
  const [source, setSource] = useState<"file" | "record">("file");
  const [consent, setConsent] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [roleName, setRoleName] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewType, setInterviewType] = useState("onsite");
  const [transcriptText, setTranscriptText] = useState("");
  const [linkResume, setLinkResume] = useState(true);
  const [tried, setTried] = useState(false);
  const submitError = optionalErrorMessage(createMutation.error, copy("올리지 못했어요. 다시 시도하세요.", "We couldn't upload it. Try again."));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTried(true);
    if (!recorder.file || recorder.isRecording) {
      return;
    }
    const payload = new FormData();
    payload.set("file", recorder.file);
    const optional: Array<[string, string]> = [
      ["companyName", companyName.trim()],
      ["roleName", roleName.trim()],
      ["interviewDate", interviewDate],
      ["interviewType", interviewType],
      ["linkedResumeVersionId", linkResume && active ? active.id : ""],
      ["transcriptText", transcriptText.trim()],
    ];
    optional.forEach(([key, value]) => {
      if (value) {
        payload.set(key, value);
      }
    });
    try {
      const created = await createMutation.mutateAsync(payload);
      navigate(routeConfig.practicalInterviewDetail.buildPath({ recordId: created.id }));
    } catch {
      // Rendered through `submitError`.
    }
  }

  return (
    <div className="ui-page practical-upload">
      <PageHeader
        description={copy("받은 질문을 뽑아 복습 목록에 넣고, 답변을 다시 연습할 수 있게 해요.", "We pull out the questions you were asked, add them to your review list, and let you practice the answers again.")}
        title={copy("면접 기록 추가", "Add an interview")}
      />
      <Card padded>
        <form className="practical-form" onSubmit={(event) => void handleSubmit(event)}>
          <fieldset className="practical-step">
            <legend>{copy("1. 면접 녹음", "1. Interview audio")}</legend>
            <Segmented
              items={[
                { id: "file", label: copy("파일 올리기", "Upload a file") },
                { id: "record", label: copy("지금 녹음하기", "Record now") },
              ]}
              label={copy("오디오 가져오는 방법", "How to add audio")}
              onChange={(next) => {
                if (!recorder.isRecording) {
                  setSource(next);
                }
              }}
              value={source}
            />

            {recorder.file ? (
              <div className="practical-file">
                <span>
                  <strong>{recorder.file.name}</strong>
                  <span className="practical-muted">{` · ${(recorder.file.size / (1024 * 1024)).toFixed(1)}MB`}</span>
                </span>
                <Button
                  onClick={() => {
                    recorder.discard();
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  size="sm"
                  variant="ghost"
                >
                  {copy("다시 고르기", "Choose again")}
                </Button>
              </div>
            ) : source === "file" ? (
              <>
                <label className="practical-drop" htmlFor={fileId}>
                  <strong>{copy("오디오 파일 선택", "Choose an audio file")}</strong>
                  <span className="practical-muted">{copy("mp3, m4a, wav, webm · 50MB 이하", "mp3, m4a, wav, webm · up to 50 MB")}</span>
                </label>
                <input
                  accept="audio/*"
                  className="ui-visually-hidden"
                  id={fileId}
                  onChange={(event) => {
                    if (!recorder.selectFile(event.target.files?.[0] ?? null)) {
                      event.target.value = "";
                    }
                  }}
                  ref={fileInputRef}
                  type="file"
                />
              </>
            ) : (
              <div className="practical-recorder">
                <label className="practical-check">
                  <input checked={consent} disabled={recorder.isRecording} onChange={(event) => setConsent(event.target.checked)} type="checkbox" />
                  <span>{copy("면접 상대방의 동의를 받았고, 녹음 파일을 업로드해 분석하는 데 동의해요.", "I have the other party's consent, and I agree to upload the recording for analysis.")}</span>
                </label>
                {recorder.isRecording ? (
                  <Button onClick={recorder.stop} variant="danger">
                    {copy(`녹음 중지 · ${formatDuration(recorder.seconds)}`, `Stop recording · ${formatDuration(recorder.seconds)}`)}
                  </Button>
                ) : (
                  <Button disabled={!consent} onClick={() => void recorder.start(consent)}>
                    {copy("녹음 시작", "Start recording")}
                  </Button>
                )}
              </div>
            )}
            {recorder.error ? (
              <p className="ui-tone-text--danger" role="alert">
                {copy(...RECORDER_ERRORS[recorder.error])}
              </p>
            ) : tried && !recorder.file ? (
              <p className="ui-tone-text--danger" role="alert">
                {copy("면접 녹음 파일이 필요해요.", "An interview recording is required.")}
              </p>
            ) : null}
          </fieldset>

          <fieldset className="practical-step">
            <legend>{copy("2. 어떤 면접이었나요? (선택)", "2. What was the interview? (optional)")}</legend>
            <div className="practical-grid">
              <Field label={copy("회사", "Company")}>{(control) => <Input {...control} onChange={(event) => setCompanyName(event.target.value)} value={companyName} />}</Field>
              <Field label={copy("직무", "Role")}>{(control) => <Input {...control} onChange={(event) => setRoleName(event.target.value)} value={roleName} />}</Field>
              <Field label={copy("면접 날짜", "Interview date")}>{(control) => <Input {...control} onChange={(event) => setInterviewDate(event.target.value)} type="date" value={interviewDate} />}</Field>
              <Field label={copy("면접 형태", "Interview type")}>
                {(control) => (
                  <Select {...control} onChange={(event) => setInterviewType(event.target.value)} value={interviewType}>
                    {INTERVIEW_TYPES.map(([value, ko, en]) => (
                      <option key={value} value={value}>
                        {copy(ko, en)}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>
            {active ? (
              <label className="practical-check">
                <input checked={linkResume} onChange={(event) => setLinkResume(event.target.checked)} type="checkbox" />
                <span>
                  {copy(`받은 질문을 이력서(${active.resumeTitle} · ${active.versionNumberLabel})의 항목과 연결하기`, `Link the questions to my resume (${active.resumeTitle} · ${active.versionNumberLabel})`)}
                </span>
              </label>
            ) : null}
            <details className="practical-transcript">
              <summary>{copy("대본이 이미 있나요?", "Already have a transcript?")}</summary>
              <Field hint={copy("붙여넣으면 음성 인식 대신 이 대본을 써요.", "If pasted, we use it instead of speech recognition.")} label={copy("면접 대본", "Transcript")}>
                {(control) => <Textarea {...control} onChange={(event) => setTranscriptText(event.target.value)} rows={6} value={transcriptText} />}
              </Field>
            </details>
          </fieldset>

          {submitError ? (
            <Callout tone="danger">
              {submitError}
              {getErrorDetails(createMutation.error).map((detail) => (
                <div key={detail}>{detail}</div>
              ))}
            </Callout>
          ) : null}
          <div className="practical-actions">
            <Button disabled={recorder.isRecording} loading={createMutation.isPending} size="lg" type="submit" variant="primary">
              {copy("올리고 분석 시작", "Upload and analyze")}
            </Button>
            <ButtonLink to={routeConfig.practicalInterviews.buildPath()} variant="ghost">
              {copy("취소", "Cancel")}
            </ButtonLink>
          </div>
        </form>
      </Card>
    </div>
  );
}
