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
  const { t } = useLocale();
  const createMutation = useCreateResumeMutation();
  const [title, setTitle] = useState("");
  const error = optionalErrorMessage(createMutation.error, t("resumeHub.weCouldntCreateItTry"));

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
      closeLabel={t("resumeHub.close")}
      description={t("resumeHub.keepOneResumePerTarget")}
      footer={
        <>
          <Button onClick={onClose} variant="ghost">
            {t("resumeHub.cancel")}
          </Button>
          <Button disabled={!title.trim()} form="resume-create-form" loading={createMutation.isPending} type="submit" variant="primary">
            {t("resumeHub.create")}
          </Button>
        </>
      }
      onClose={onClose}
      open={open}
      size="sm"
      title={t("resumeHub.newResume")}
    >
      <form id="resume-create-form" onSubmit={(event) => void handleSubmit(event)}>
        <Field error={error ?? undefined} hint={t("resumeHub.resumeNamePlaceholder")} label={t("resumeHub.resumeName")}>
          {(control) => <Input {...control} autoFocus onChange={(event) => setTitle(event.target.value)} value={title} />}
        </Field>
      </form>
    </Dialog>
  );
}

function ResumeVersionsCard({ resume, currentId }: { resume: ResumeModel; currentId: string }) {
  const { t, locale } = useLocale();
  const navigate = useNavigate();
  const { active } = useActiveResumeVersion();
  const activateMutation = useActivateResumeVersionMutation();
  const reExtractMutation = useReExtractResumeVersionMutation();
  const upload = useStartResumeVersion();
  const downloader = useDownloadResumeVersion();
  const error =
    optionalErrorMessage(upload.error, t("resumeHub.weCouldntUploadThePdf")) ??
    optionalErrorMessage(activateMutation.error, t("resumeHub.weCouldntActivateIt")) ??
    optionalErrorMessage(reExtractMutation.error, t("resumeHub.weCouldntRestartExtraction"));
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
        actions={<UploadButton disabled={upload.isPending} label={upload.isPending ? t("resumeHub.uploading") : t("resumeHub.uploadAVersion")} onFile={(file) => void handleUpload(file)} />}
        meta={t("resumeHub.versionCount", { count: resume.versions.length })}
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
      {downloader.failedId ? <Callout tone="danger">{t("resumeHub.weCouldntDownloadThePdf")}</Callout> : null}
      {resume.versions.length === 0 ? (
        <p className="resume-muted resume-card-pad">{t("resumeHub.noPdfUploadedYet")}</p>
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
                      {isActive ? <Badge tone="accent">{t("resumeHub.active")}</Badge> : null}
                      {version.parsingStatus !== "completed" ? <Badge tone={status.tone}>{status.label}</Badge> : null}
                    </span>
                  }
                  trailing={
                    <span className="resume-row-actions">
                      {!isCurrent ? (
                        <ButtonLink size="sm" to={routeConfig.resumeOverview.buildPath({ versionId: version.id })} variant="ghost">
                          {t("resumeHub.open")}
                        </ButtonLink>
                      ) : null}
                      {!isActive && version.canActivate ? (
                        <Button
                          loading={activateMutation.isPending && activateMutation.variables === version.id}
                          onClick={() => activateMutation.mutate(version.id)}
                          size="sm"
                        >
                          {t("resumeHub.use")}
                        </Button>
                      ) : null}
                      {version.parsingStatus === "completed" ? (
                        <Button
                          loading={reExtractMutation.isPending && reExtractMutation.variables === version.id}
                          onClick={() => reExtractMutation.mutate(version.id)}
                          size="sm"
                          variant="ghost"
                        >
                          {t("resumeHub.reExtract")}
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
  const { t } = useLocale();
  const { versionId, status } = useResumeHub();
  const { resumes } = useActiveResumeVersion();
  const [createOpen, setCreateOpen] = useState(false);
  const extraction = status.extractionQuery.data;
  const detail = status.versionQuery.data;

  return (
    <div className="resume-versions">
      <div className="resume-versions__toolbar">
        <p className="resume-muted">
          {t("resumeHub.theActiveVersionDrivesQuestion")}
        </p>
        <Button icon="plus" onClick={() => setCreateOpen(true)} size="sm" variant="ghost">
          {t("resumeHub.newResume")}
        </Button>
      </div>
      {resumes.map((resume) => (
        <ResumeVersionsCard currentId={versionId} key={resume.id} resume={resume} />
      ))}
      {detail ? (
        <details className="resume-extraction-meta">
          <summary>{t("resumeHub.analysisDetailsForThisVersion")}</summary>
          <dl>
            <dt>{t("resumeHub.parsing")}</dt>
            <dd>{[detail.parsingStatusLabel, detail.parseCompletedAtLabel].filter(Boolean).join(" · ")}</dd>
            <dt>{t("resumeHub.extraction")}</dt>
            <dd>{[extraction?.extractionStatusLabel ?? detail.extractionStatusLabel, extraction?.completedAtLabel ?? detail.extractionCompletedAtLabel].filter(Boolean).join(" · ")}</dd>
            <dt>{t("resumeHub.model")}</dt>
            <dd>{[extraction?.modelLabel ?? detail.extractionModelLabel, extraction?.promptVersionLabel ?? detail.extractionPromptVersion].filter(Boolean).join(" · ") || "-"}</dd>
            <dt>{t("resumeHub.confidence")}</dt>
            <dd>{detail.extractionConfidenceLabel ?? "-"}</dd>
          </dl>
        </details>
      ) : null}
      <CreateResumeDialog onClose={() => setCreateOpen(false)} open={createOpen} />
    </div>
  );
}
