import { useState, type FormEvent } from "react";
import { useCreateQuestionLearningMaterialMutation } from "../../features/question/api/useCreateQuestionLearningMaterialMutation";
import { useCreateQuestionReferenceAnswerMutation } from "../../features/question/api/useCreateQuestionReferenceAnswerMutation";
import { userFacingErrorMessage } from "../../shared/api/errors";
import { useLocale } from "../../shared/i18n";
import { Button, Callout, Dialog, Field, Input, Select, Textarea } from "../../shared/ui/primitives";

type DialogProps = {
  questionId: string;
  open: boolean;
  onClose: () => void;
};

const EMPTY_ANSWER = { title: "", answerText: "", answerFormat: "outline" };

export function ReferenceAnswerDialog({ questionId, open, onClose }: DialogProps) {
  const { t, locale } = useLocale();
  const mutation = useCreateQuestionReferenceAnswerMutation();
  const [form, setForm] = useState(EMPTY_ANSWER);
  const [error, setError] = useState<string | null>(null);
  const isKorean = locale === "ko";

  async function submit(event: FormEvent) {
    event.preventDefault();
    const title = form.title.trim();
    const answerText = form.answerText.trim();

    if (!title || !answerText) {
      setError(t("question.referenceAnswerValidation"));
      return;
    }

    setError(null);
    try {
      await mutation.mutateAsync({ questionId, body: { title, answerText, answerFormat: form.answerFormat || "outline" } });
      setForm(EMPTY_ANSWER);
      onClose();
    } catch (submitError) {
      setError(userFacingErrorMessage(submitError, t("question.referenceAnswerSaveError")));
    }
  }

  return (
    <Dialog
      closeLabel={isKorean ? "닫기" : "Close"}
      description={t("question.referenceAnswerComposerTitle")}
      footer={
        <>
          <Button onClick={onClose}>{isKorean ? "취소" : "Cancel"}</Button>
          <Button form="reference-answer-form" loading={mutation.isPending} type="submit" variant="primary">
            {t("common.save")}
          </Button>
        </>
      }
      onClose={onClose}
      open={open}
      size="lg"
      title={isKorean ? "모범 답안 추가" : "Add a reference answer"}
    >
      <form className="question-dialog-form" id="reference-answer-form" noValidate onSubmit={submit}>
        {error ? <Callout tone="danger">{error}</Callout> : null}
        <Field label={t("question.referenceAnswerTitleLabel")}>
          {(control) => (
            <Input
              {...control}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder={t("question.referenceAnswerTitlePlaceholder")}
              value={form.title}
            />
          )}
        </Field>
        <Field label={t("question.referenceAnswerFormatLabel")}>
          {(control) => (
            <Select {...control} onChange={(event) => setForm({ ...form, answerFormat: event.target.value })} value={form.answerFormat}>
              <option value="outline">{isKorean ? "개요" : "Outline"}</option>
              <option value="full_answer">{isKorean ? "전체 답변" : "Full answer"}</option>
              <option value="summary">{isKorean ? "요약" : "Summary"}</option>
              <option value="transcript_excerpt">{isKorean ? "대화 발췌" : "Transcript excerpt"}</option>
            </Select>
          )}
        </Field>
        <Field label={t("question.referenceAnswerTextLabel")}>
          {(control) => (
            <Textarea
              {...control}
              onChange={(event) => setForm({ ...form, answerText: event.target.value })}
              placeholder={t("question.referenceAnswerTextPlaceholder")}
              value={form.answerText}
            />
          )}
        </Field>
      </form>
    </Dialog>
  );
}

const EMPTY_MATERIAL = {
  title: "",
  materialType: "",
  description: "",
  contentText: "",
  contentUrl: "",
  sourceName: "",
  difficultyLevel: "",
  estimatedMinutes: "",
  relationshipType: "",
  labelOverride: "",
  relevanceScore: "",
};

type MaterialField = keyof typeof EMPTY_MATERIAL;

export function LearningMaterialDialog({ questionId, open, onClose }: DialogProps) {
  const { t, locale } = useLocale();
  const mutation = useCreateQuestionLearningMaterialMutation();
  const [form, setForm] = useState(EMPTY_MATERIAL);
  const [error, setError] = useState<string | null>(null);
  const isKorean = locale === "ko";
  const bind = (field: MaterialField) => ({
    value: form[field],
    onChange: (event: { target: { value: string } }) => setForm({ ...form, [field]: event.target.value }),
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    const title = form.title.trim();
    const materialType = form.materialType.trim();
    const contentText = form.contentText.trim();
    const contentUrl = form.contentUrl.trim();

    if (!title || !materialType) {
      setError(t("question.learningMaterialValidationRequired"));
      return;
    }
    if (!contentText && !contentUrl) {
      setError(t("question.learningMaterialValidationContent"));
      return;
    }

    setError(null);
    try {
      await mutation.mutateAsync({
        questionId,
        body: {
          title,
          materialType,
          description: form.description.trim() || undefined,
          contentText: contentText || undefined,
          contentUrl: contentUrl || undefined,
          sourceName: form.sourceName.trim() || undefined,
          difficultyLevel: form.difficultyLevel.trim() || undefined,
          estimatedMinutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : undefined,
          relationshipType: form.relationshipType.trim() || undefined,
          labelOverride: form.labelOverride.trim() || undefined,
          relevanceScore: form.relevanceScore ? Number(form.relevanceScore) : undefined,
        },
      });
      setForm(EMPTY_MATERIAL);
      onClose();
    } catch (submitError) {
      setError(userFacingErrorMessage(submitError, t("question.learningMaterialSaveError")));
    }
  }

  return (
    <Dialog
      closeLabel={isKorean ? "닫기" : "Close"}
      description={t("question.learningMaterialComposerTitle")}
      footer={
        <>
          <Button onClick={onClose}>{isKorean ? "취소" : "Cancel"}</Button>
          <Button form="learning-material-form" loading={mutation.isPending} type="submit" variant="primary">
            {t("common.save")}
          </Button>
        </>
      }
      onClose={onClose}
      open={open}
      size="lg"
      title={isKorean ? "학습 자료 추가" : "Add learning material"}
    >
      <form className="question-dialog-form" id="learning-material-form" noValidate onSubmit={submit}>
        {error ? <Callout tone="danger">{error}</Callout> : null}
        <div className="question-dialog-form__row">
          <Field label={t("question.learningMaterialTitleLabel")}>
            {(control) => <Input {...control} {...bind("title")} placeholder={t("question.learningMaterialTitlePlaceholder")} />}
          </Field>
          <Field label={t("question.learningMaterialTypeLabel")}>
            {(control) => <Input {...control} {...bind("materialType")} placeholder={t("question.learningMaterialTypePlaceholder")} />}
          </Field>
        </div>
        <Field label={t("question.learningMaterialContentUrlLabel")}>
          {(control) => <Input {...control} {...bind("contentUrl")} placeholder="https://" type="url" />}
        </Field>
        <Field label={t("question.learningMaterialContentTextLabel")}>
          {(control) => <Textarea {...control} {...bind("contentText")} placeholder={t("question.learningMaterialContentTextPlaceholder")} />}
        </Field>
        <Field label={t("question.learningMaterialDescriptionLabel")}>
          {(control) => <Input {...control} {...bind("description")} placeholder={t("question.learningMaterialDescriptionPlaceholder")} />}
        </Field>
        <details className="question-dialog-form__advanced">
          <summary>{isKorean ? "추가 정보" : "More details"}</summary>
          <div className="question-dialog-form__row">
            <Field label={t("question.learningMaterialSourceNameLabel")}>
              {(control) => <Input {...control} {...bind("sourceName")} placeholder={t("question.learningMaterialSourceNamePlaceholder")} />}
            </Field>
            <Field label={t("question.learningMaterialEstimatedMinutesLabel")}>
              {(control) => <Input {...control} {...bind("estimatedMinutes")} inputMode="numeric" min={1} type="number" />}
            </Field>
            <Field label={t("question.learningMaterialDifficultyLabel")}>
              {(control) => <Input {...control} {...bind("difficultyLevel")} />}
            </Field>
            <Field label={t("question.learningMaterialRelationshipTypeLabel")}>
              {(control) => <Input {...control} {...bind("relationshipType")} />}
            </Field>
            <Field label={t("question.learningMaterialLabelOverrideLabel")}>
              {(control) => <Input {...control} {...bind("labelOverride")} />}
            </Field>
            <Field label={t("question.learningMaterialRelevanceScoreLabel")}>
              {(control) => <Input {...control} {...bind("relevanceScore")} inputMode="decimal" type="number" />}
            </Field>
          </div>
        </details>
      </form>
    </Dialog>
  );
}
