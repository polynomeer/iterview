import { useId, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useActiveResumeVersion } from "../../features/resume/model/useActiveResumeVersion";
import { getErrorDetails, optionalErrorMessage, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { Button, Callout, Card, ErrorState, Field, Input, PageHeader, PageSkeleton } from "../../shared/ui/primitives";
import { useStartResumeVersion } from "./resumeActions";
import "./resume.css";

const STEPS: Array<[string, string]> = [
  ["PDF를 올리면 경력, 프로젝트, 스킬을 뽑아요.", "Upload a PDF and we extract experience, projects, and skills."],
  ["면접관이 파고들 주장을 찾아 질문으로 연결해요.", "We find the claims an interviewer will probe and link them to questions."],
  ["모의 면접과 답변 평가가 이 이력서를 기준으로 해요.", "Mock interviews and answer grading use this resume."],
];

/** First run: name the resume and upload its first PDF in one step. */
function ResumeOnboarding({ existingResumeId }: { existingResumeId: string | null }) {
  const { locale } = useLocale();
  const copy = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const navigate = useNavigate();
  const fileId = useId();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [tried, setTried] = useState(false);
  const upload = useStartResumeVersion();
  const error = optionalErrorMessage(upload.error, copy("올리지 못했어요. 다시 시도하세요.", "We couldn't upload it. Try again."));

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
        description={copy("이력서를 기준으로 질문과 면접을 준비해요.", "Your questions and interviews are built around your resume.")}
        title={copy("이력서를 올려주세요", "Upload your resume")}
      />
      <Card padded>
        <ol className="resume-onboarding__steps">
          {STEPS.map(([ko, en], index) => (
            <li key={ko}>
              <span aria-hidden="true" className="resume-onboarding__number">
                {index + 1}
              </span>
              {copy(ko, en)}
            </li>
          ))}
        </ol>
        <form className="resume-onboarding__form" onSubmit={(event) => void handleSubmit(event)}>
          {existingResumeId ? null : (
            <Field hint={copy("비워 두면 파일 이름을 써요.", "Leave empty to use the file name.")} label={copy("이력서 이름 (선택)", "Resume name (optional)")}>
              {(control) => <Input {...control} onChange={(event) => setTitle(event.target.value)} placeholder={copy("예: 백엔드 엔지니어 지원용", "e.g. Backend engineer applications")} value={title} />}
            </Field>
          )}
          <div className="resume-onboarding__file">
            <label className="resume-onboarding__drop" htmlFor={fileId}>
              <strong>{file ? file.name : copy("PDF 파일 선택", "Choose a PDF")}</strong>
              <span className="resume-muted">{copy("텍스트를 선택할 수 있는 PDF여야 해요.", "The PDF needs selectable text.")}</span>
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
                {copy("PDF 파일을 골라주세요.", "Choose a PDF file.")}
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
            {copy("올리고 분석 시작", "Upload and analyze")}
          </Button>
        </form>
      </Card>
    </div>
  );
}

/** /resume: open the active version's hub, or start the first upload. */
export function ResumeIndexPage() {
  const { t, locale } = useLocale();
  const { active, resumes, isLoading, isError, error, refetch } = useActiveResumeVersion();

  if (isLoading) {
    return <PageSkeleton label={locale === "ko" ? "이력서를 불러오는 중" : "Loading your resume"} />;
  }

  if (isError) {
    return (
      <ErrorState
        actions={
          <Button onClick={() => void refetch()} variant="primary">
            {t("common.tryAgain")}
          </Button>
        }
        body={userFacingErrorMessage(error, locale === "ko" ? "이력서 목록을 불러오지 못했어요." : "The resume list could not be loaded.")}
        details={getErrorDetails(error)}
        size="page"
        title={locale === "ko" ? "이력서를 불러올 수 없어요" : "Unable to load your resume"}
      />
    );
  }

  const target = active ?? resumes.flatMap((resume) => resume.versions)[0];
  if (target) {
    return <Navigate replace to={routeConfig.resumeOverview.buildPath({ versionId: target.id })} />;
  }

  return <ResumeOnboarding existingResumeId={resumes[0]?.id ?? null} />;
}
