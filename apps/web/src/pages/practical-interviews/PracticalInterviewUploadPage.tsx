import { useId, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateInterviewRecordMutation } from "../../features/practical-interview/api/useCreateInterviewRecordMutation";
import { useActiveResumeVersion } from "../../features/resume/model/useActiveResumeVersion";
import { getErrorDetails, optionalErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale, type MessageKey } from "../../shared/i18n";
import { Button, ButtonLink, Callout, Card, Field, Input, PageHeader, Segmented, Select, Textarea } from "../../shared/ui/primitives";
import { INTERVIEW_TYPES } from "./interviewTypes";
import { formatDuration, useAudioRecorder, type RecorderError } from "./useAudioRecorder";
import "./practical.css";


const RECORDER_ERRORS: Record<RecorderError, MessageKey> = {
  "too-large": "practicalRecords.recorderTooLarge",
  consent: "practicalRecords.recorderConsent",
  unsupported: "practicalRecords.recorderUnsupported",
  permission: "practicalRecords.recorderPermission",
};

/** 면접 기록 추가: one audio file (uploaded or recorded here) plus a few optional details. */
export function PracticalInterviewUploadPage() {
  const { t } = useLocale();
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
  const submitError = optionalErrorMessage(createMutation.error, t("practicalRecords.weCouldntUploadItTry"));

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
        description={t("practicalRecords.wePullOutTheQuestions")}
        title={t("practicalRecords.addAnInterview")}
      />
      <Card padded>
        <form className="practical-form" onSubmit={(event) => void handleSubmit(event)}>
          <fieldset className="practical-step">
            <legend>{t("practicalRecords.stepAudio")}</legend>
            <Segmented
              items={[
                { id: "file", label: t("practicalRecords.uploadAFile") },
                { id: "record", label: t("practicalRecords.recordNow") },
              ]}
              label={t("practicalRecords.howToAddAudio")}
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
                  {t("practicalRecords.chooseAgain")}
                </Button>
              </div>
            ) : source === "file" ? (
              <>
                <label className="practical-drop" htmlFor={fileId}>
                  <strong>{t("practicalRecords.chooseAnAudioFile")}</strong>
                  <span className="practical-muted">{t("practicalRecords.audioFileHint")}</span>
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
                  <span>{t("practicalRecords.recordingConsent")}</span>
                </label>
                {recorder.isRecording ? (
                  <Button onClick={recorder.stop} variant="danger">
                    {t("practicalRecords.stopRecordingTimer", { duration: formatDuration(recorder.seconds) })}
                  </Button>
                ) : (
                  <Button disabled={!consent} onClick={() => void recorder.start(consent)}>
                    {t("practicalRecords.startRecording")}
                  </Button>
                )}
              </div>
            )}
            {recorder.error ? (
              <p className="ui-tone-text--danger" role="alert">
                {t(RECORDER_ERRORS[recorder.error])}
              </p>
            ) : tried && !recorder.file ? (
              <p className="ui-tone-text--danger" role="alert">
                {t("practicalRecords.anInterviewRecordingIsRequired")}
              </p>
            ) : null}
          </fieldset>

          <fieldset className="practical-step">
            <legend>{t("practicalRecords.stepDetails")}</legend>
            <div className="practical-grid">
              <Field label={t("practicalRecords.company")}>{(control) => <Input {...control} onChange={(event) => setCompanyName(event.target.value)} value={companyName} />}</Field>
              <Field label={t("practicalRecords.role")}>{(control) => <Input {...control} onChange={(event) => setRoleName(event.target.value)} value={roleName} />}</Field>
              <Field label={t("practicalRecords.interviewDate")}>{(control) => <Input {...control} onChange={(event) => setInterviewDate(event.target.value)} type="date" value={interviewDate} />}</Field>
              <Field label={t("practicalRecords.interviewType")}>
                {(control) => (
                  <Select {...control} onChange={(event) => setInterviewType(event.target.value)} value={interviewType}>
                    {Object.entries(INTERVIEW_TYPES).map(([value, labelKey]) => (
                      <option key={value} value={value}>
                        {t(labelKey)}
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
                  {t("practicalRecords.linkResume", { resumeTitle: active.resumeTitle, versionNumberLabel: active.versionNumberLabel })}
                </span>
              </label>
            ) : null}
            <details className="practical-transcript">
              <summary>{t("practicalRecords.alreadyHaveATranscript")}</summary>
              <Field hint={t("practicalRecords.ifPastedWeUseIt")} label={t("practicalRecords.transcript")}>
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
              {t("practicalRecords.uploadAndAnalyze")}
            </Button>
            <ButtonLink to={routeConfig.practicalInterviews.buildPath()} variant="ghost">
              {t("practicalRecords.cancel")}
            </ButtonLink>
          </div>
        </form>
      </Card>
    </div>
  );
}
