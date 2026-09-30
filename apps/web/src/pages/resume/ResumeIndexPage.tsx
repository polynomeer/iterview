import { useId, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useActiveResumeVersion } from "../../features/resume/model/useActiveResumeVersion";
import { getErrorDetails, optionalErrorMessage, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale, type MessageKey } from "../../shared/i18n";
import { Button, Callout, Card, ErrorState, Field, Input, PageHeader, PageSkeleton } from "../../shared/ui/primitives";
import { useStartResumeVersion } from "./resumeActions";
import "./resume.css";

const STEPS: MessageKey[] = ["resumeHub.onboardingStepExtract", "resumeHub.onboardingStepProbe", "resumeHub.onboardingStepGrade"];

/** First run: name the resume and upload its first PDF in one step. */
function ResumeOnboarding({ existingResumeId }: { existingResumeId: string | null }) {
  const { t } = useLocale();
  const navigate = useNavigate();
  const fileId = useId();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [tried, setTried] = useState(false);
  const upload = useStartResumeVersion();
  const error = optionalErrorMessage(upload.error, t("resumeHub.weCouldntUploadItTry"));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTried(true);
    if (!file) {
      return;
    }
    try {
      const versionId = await upload.start({ resumeId: existingResumeId ?? undefined, title: title.trim() || undefined, file });
      navigate(routeConfig.resumeOverview.buildPath({ versionId }), { replace: true });
    } catch {
      // Rendered through `error`.
    }
  }

  return (
    <div className="ui-page resume-onboarding">
      <PageHeader
        description={t("resumeHub.yourQuestionsAndInterviewsAre")}
        title={t("resumeHub.uploadYourResume")}
      />
      <Card padded>
        <ol className="resume-onboarding__steps">
          {STEPS.map((step, index) => (
            <li key={step}>
              <span aria-hidden="true" className="resume-onboarding__number">
                {index + 1}
              </span>
              {t(step)}
            </li>
          ))}
        </ol>
        <form className="resume-onboarding__form" onSubmit={(event) => void handleSubmit(event)}>
          {existingResumeId ? null : (
            <Field hint={t("resumeHub.leaveEmptyToUseThe")} label={t("resumeHub.resumeNameOptional")}>
              {(control) => <Input {...control} onChange={(event) => setTitle(event.target.value)} placeholder={t("resumeHub.resumeNamePlaceholder")} value={title} />}
            </Field>
          )}
          <div className="resume-onboarding__file">
            <label className="resume-onboarding__drop" htmlFor={fileId}>
              <strong>{file ? file.name : t("resumeHub.chooseAPdf")}</strong>
              <span className="resume-muted">{t("resumeHub.thePdfNeedsSelectableText")}</span>
            </label>
            <input
              accept="application/pdf"
              className="ui-visually-hidden"
              id={fileId}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              type="file"
            />
            {tried && !file ? (
              <p className="ui-tone-text--danger" role="alert">
                {t("resumeHub.chooseAPdfFile")}
              </p>
            ) : null}
          </div>
          {error ? (
            <Callout tone="danger">
              {error}
              {getErrorDetails(upload.error).map((detail) => (
                <div key={detail}>{detail}</div>
              ))}
            </Callout>
          ) : null}
          <Button loading={upload.isPending} size="lg" type="submit" variant="primary">
            {t("resumeHub.uploadAndAnalyze")}
          </Button>
        </form>
      </Card>
    </div>
  );
}

/** /resume: open the active version's hub, or start the first upload. */
export function ResumeIndexPage() {
  const { t } = useLocale();
  const { active, resumes, isLoading, isError, error, refetch } = useActiveResumeVersion();

  if (isLoading) {
    return <PageSkeleton label={t("resumeHub.loadingYourResume")} />;
  }

  if (isError) {
    return (
      <ErrorState
        actions={
          <Button onClick={() => void refetch()} variant="primary">
            {t("common.tryAgain")}
          </Button>
        }
        body={userFacingErrorMessage(error, t("resumeHub.theResumeListCouldNot"))}
        details={getErrorDetails(error)}
        size="page"
        title={t("resumeHub.unableToLoadYourResume")}
      />
    );
  }

  const target = active ?? resumes.flatMap((resume) => resume.versions)[0];
  if (target) {
    return <Navigate replace to={routeConfig.resumeOverview.buildPath({ versionId: target.id })} />;
  }

  return <ResumeOnboarding existingResumeId={resumes[0]?.id ?? null} />;
}
