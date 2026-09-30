import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { ResumeModel } from "../../entities/resume/model";
import { useActivateResumeVersionMutation } from "../../features/resume/api/useActivateResumeVersionMutation";
import { useCreateResumeMutation } from "../../features/resume/api/useCreateResumeMutation";
import { useReExtractResumeVersionMutation } from "../../features/resume/api/useReExtractResumeVersionMutation";
import { useActiveResumeVersion } from "../../features/resume/model/useActiveResumeVersion";
import { getErrorDetails, optionalErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { parsingStatusLabel } from "../../shared/lib/labels";
import {
  Badge,
  Button,
  ButtonLink,
  Callout,
  Card,
  CardHeader,
  Dialog,
  Field,
  Input,
  ListRow,
} from "../../shared/ui/primitives";
import { useResumeHub } from "./ResumeHubLayout";
import { useDownloadResumeVersion, useStartResumeVersion } from "./resumeActions";

function useCopy() {
  const { locale } = useLocale();
  return (ko: string, en: string) => (locale === "ko" ? ko : en);
}

function UploadButton({ label, disabled, onFile }: { label: string; disabled?: boolean; onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        accept="application/pdf"
        aria-hidden="true"
        className="ui-visually-hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onFile(file);
          }
          event.target.value = "";
        }}
        ref={inputRef}
        tabIndex={-1}
        type="file"
      />
      <Button disabled={disabled} icon="plus" onClick={() => inputRef.current?.click()} size="sm">
        {label}
      </Button>
    </>
  );
}

function CreateResumeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const copy = useCopy();
  const createMutation = useCreateResumeMutation();
  const [title, setTitle] = useState("");
  const error = optionalErrorMessage(createMutation.error, copy("만들지 못했어요. 다시 시도하세요.", "We couldn't create it. Try again."));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }
    try {
      await createMutation.mutateAsync({ title: title.trim() });
      setTitle("");
      onClose();
    } catch {
      // Rendered through `error`.
    }
  }

  return (
    <Dialog
      closeLabel={copy("닫기", "Close")}
      description={copy("지원 직군별로 이력서를 나눠 두면 버전 기록이 섞이지 않아요.", "Keep one resume per target role so version histories stay separate.")}
      footer={
        <>
          <Button onClick={onClose} variant="ghost">
            {copy("취소", "Cancel")}
          </Button>
          <Button disabled={!title.trim()} form="resume-create-form" loading={createMutation.isPending} type="submit" variant="primary">
            {copy("만들기", "Create")}
          </Button>
        </>
      }
      onClose={onClose}
      open={open}
      size="sm"
      title={copy("새 이력서", "New resume")}
    >
      <form id="resume-create-form" onSubmit={(event) => void handleSubmit(event)}>
        <Field error={error ?? undefined} hint={copy("예: 백엔드 엔지니어 지원용", "e.g. Backend engineer applications")} label={copy("이력서 이름", "Resume name")}>
          {(control) => <Input {...control} autoFocus onChange={(event) => setTitle(event.target.value)} value={title} />}
        </Field>
      </form>
    </Dialog>
  );
}

function ResumeVersionsCard({ resume, currentId }: { resume: ResumeModel; currentId: string }) {
  const { locale } = useLocale();
  const copy = useCopy();
  const navigate = useNavigate();
  const { active } = useActiveResumeVersion();
  const activateMutation = useActivateResumeVersionMutation();
  const reExtractMutation = useReExtractResumeVersionMutation();
  const upload = useStartResumeVersion();
  const downloader = useDownloadResumeVersion();
  const error =
    optionalErrorMessage(upload.error, copy("PDF를 올리지 못했어요. 다시 시도하세요.", "We couldn't upload the PDF. Try again.")) ??
    optionalErrorMessage(activateMutation.error, copy("활성화하지 못했어요.", "We couldn't activate it.")) ??
    optionalErrorMessage(reExtractMutation.error, copy("추출을 다시 시작하지 못했어요.", "We couldn't restart extraction."));
  const details = getErrorDetails(upload.error ?? activateMutation.error ?? reExtractMutation.error);

  async function handleUpload(file: File) {
    try {
      const versionId = await upload.start({ resumeId: resume.id, file });
      navigate(routeConfig.resumeOverview.buildPath({ versionId }));
    } catch {
      // Rendered through `error`.
    }
  }

  return (
    <Card aria-labelledby={`resume-${resume.id}-title`}>
      <CardHeader
        actions={<UploadButton disabled={upload.isPending} label={upload.isPending ? copy("올리는 중…", "Uploading…") : copy("새 버전 올리기", "Upload a version")} onFile={(file) => void handleUpload(file)} />}
        meta={copy(`버전 ${resume.versions.length}개`, `${resume.versions.length} versions`)}
        title={<span id={`resume-${resume.id}-title`}>{resume.title}</span>}
        titleAs="h2"
      />
      {error ? (
        <Callout tone="danger">
          {error}
          {details.map((detail) => (
            <div key={detail}>{detail}</div>
          ))}
        </Callout>
      ) : null}
      {downloader.failedId ? <Callout tone="danger">{copy("PDF를 받지 못했어요.", "We couldn't download the PDF.")}</Callout> : null}
      {resume.versions.length === 0 ? (
        <p className="resume-muted resume-card-pad">{copy("아직 올린 PDF가 없어요.", "No PDF uploaded yet.")}</p>
      ) : (
        <ul className="resume-version-list">
          {resume.versions.map((version) => {
            const status = parsingStatusLabel(version.parsingStatus, locale);
            const isActive = version.id === active?.id;
            const isCurrent = version.id === currentId;
            return (
              <li aria-current={isCurrent ? "true" : undefined} className="resume-version-list__item" key={version.id}>
                <ListRow
                  meta={[version.fileNameLabel, version.uploadedAtLabel, version.fileSizeLabel].filter(Boolean).join(" · ")}
                  title={
                    <span className="resume-version-list__title">
                      {version.versionNumberLabel}
                      {isActive ? <Badge tone="accent">{copy("사용 중", "Active")}</Badge> : null}
                      {version.parsingStatus !== "completed" ? <Badge tone={status.tone}>{status.label}</Badge> : null}
                    </span>
                  }
                  trailing={
                    <span className="resume-row-actions">
                      {!isCurrent ? (
                        <ButtonLink size="sm" to={routeConfig.resumeOverview.buildPath({ versionId: version.id })} variant="ghost">
                          {copy("열기", "Open")}
                        </ButtonLink>
                      ) : null}
                      {!isActive && version.canActivate ? (
                        <Button
                          loading={activateMutation.isPending && activateMutation.variables === version.id}
                          onClick={() => activateMutation.mutate(version.id)}
                          size="sm"
                        >
                          {copy("사용하기", "Use")}
                        </Button>
                      ) : null}
                      {version.parsingStatus === "completed" ? (
                        <Button
                          loading={reExtractMutation.isPending && reExtractMutation.variables === version.id}
                          onClick={() => reExtractMutation.mutate(version.id)}
                          size="sm"
                          variant="ghost"
                        >
                          {copy("다시 추출", "Re-extract")}
                        </Button>
                      ) : null}
                      <Button
                        disabled={!version.canDownload}
                        loading={downloader.pendingId === version.id}
                        onClick={() => void downloader.download(version.id, version.fileNameLabel)}
                        size="sm"
                        variant="ghost"
                      >
                        PDF
                      </Button>
                    </span>
                  }
                />
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

/** 버전 관리: every resume and version, with upload, activation, re-extraction, and download. */
export function ResumeVersionsTab() {
  const copy = useCopy();
  const { versionId, status } = useResumeHub();
  const { resumes } = useActiveResumeVersion();
  const [createOpen, setCreateOpen] = useState(false);
  const extraction = status.extractionQuery.data;
  const detail = status.versionQuery.data;

  return (
    <div className="resume-versions">
      <div className="resume-versions__toolbar">
        <p className="resume-muted">
          {copy("사용 중인 버전 하나가 질문 추천, 면접, 답변 평가의 기준이 돼요.", "The active version drives question picks, interviews, and answer grading.")}
        </p>
        <Button icon="plus" onClick={() => setCreateOpen(true)} size="sm" variant="ghost">
          {copy("새 이력서", "New resume")}
        </Button>
      </div>
      {resumes.map((resume) => (
        <ResumeVersionsCard currentId={versionId} key={resume.id} resume={resume} />
      ))}
      {detail ? (
        <details className="resume-extraction-meta">
          <summary>{copy("이 버전의 분석 정보", "Analysis details for this version")}</summary>
          <dl>
            <dt>{copy("파싱", "Parsing")}</dt>
            <dd>{[detail.parsingStatusLabel, detail.parseCompletedAtLabel].filter(Boolean).join(" · ")}</dd>
            <dt>{copy("구조화 추출", "Extraction")}</dt>
            <dd>{[extraction?.extractionStatusLabel ?? detail.extractionStatusLabel, extraction?.completedAtLabel ?? detail.extractionCompletedAtLabel].filter(Boolean).join(" · ")}</dd>
            <dt>{copy("모델", "Model")}</dt>
            <dd>{[extraction?.modelLabel ?? detail.extractionModelLabel, extraction?.promptVersionLabel ?? detail.extractionPromptVersion].filter(Boolean).join(" · ") || "-"}</dd>
            <dt>{copy("신뢰도", "Confidence")}</dt>
            <dd>{detail.extractionConfidenceLabel ?? "-"}</dd>
          </dl>
        </details>
      ) : null}
      <CreateResumeDialog onClose={() => setCreateOpen(false)} open={createOpen} />
    </div>
  );
}
