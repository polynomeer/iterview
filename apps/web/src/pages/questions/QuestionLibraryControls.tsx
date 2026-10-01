import { useRef, useState } from "react";
import {
  useQuestionLibraryStateQuery,
  useSaveQuestionNoteMutation,
  useToggleBookmarkMutation,
} from "../../features/library/api/useQuestionLibraryState";
import { useLocale } from "../../shared/i18n";
import type { QuestionLibraryStateDto } from "../../shared/types/library";
import { Button, Field, Textarea } from "../../shared/ui/primitives";

/** Saves the question to 보관함 (ADR 0083). Signed-in users only. */
export function BookmarkButton({ questionId }: { questionId: string }) {
  const { t } = useLocale();
  const stateQuery = useQuestionLibraryStateQuery(questionId, true);
  const mutation = useToggleBookmarkMutation(questionId);
  const bookmarked = stateQuery.data?.bookmarked ?? false;

  return (
    <Button
      aria-pressed={bookmarked}
      disabled={!stateQuery.data}
      icon="bookmark"
      loading={mutation.isPending}
      onClick={() => mutation.mutate(!bookmarked)}
      title={mutation.isError ? t("library.bookmarkFailed") : undefined}
      variant={bookmarked ? "primary" : "secondary"}
    >
      {bookmarked ? t("library.bookmarked") : t("library.bookmark")}
    </Button>
  );
}

function NoteEditor({ questionId, state }: { questionId: string; state: QuestionLibraryStateDto }) {
  const { t } = useLocale();
  const saved = state.note?.body ?? "";
  const [draft, setDraft] = useState(saved);
  const mutation = useSaveQuestionNoteMutation(questionId);
  // Clicking 노트 저장 blurs the textarea first; both would save before the next render.
  const inFlight = useRef(false);
  const dirty = draft.trim() !== saved;

  function save() {
    if (!dirty || inFlight.current) {
      return;
    }
    inFlight.current = true;
    mutation.mutate(draft, {
      onSettled: () => {
        inFlight.current = false;
      },
    });
  }

  const status = mutation.isError ? (
    <span className="ui-tone-text--danger">{t("library.noteFailed")}</span>
  ) : dirty ? (
    <span>{t("library.noteUnsaved")}</span>
  ) : mutation.isSuccess ? (
    <span>{t("library.noteSaved")}</span>
  ) : null;

  return (
    <form
      className="question-note"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <Field hint={t("library.noteHint")} label={t("library.noteLabel")}>
        {(control) => (
          <Textarea
            {...control}
            className="question-note__input"
            maxLength={5000}
            onBlur={save}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={t("library.notePlaceholder")}
            rows={6}
            value={draft}
          />
        )}
      </Field>
      <div className="question-note__actions">
        <span aria-live="polite" className="question-note__status">
          {status}
        </span>
        <Button disabled={!dirty} loading={mutation.isPending} size="sm" type="submit" variant="primary">
          {t("library.saveNote")}
        </Button>
      </div>
    </form>
  );
}

/** The inspector's 노트 tab: one private note per question. */
export function NoteTab({ questionId }: { questionId: string }) {
  const { t } = useLocale();
  const stateQuery = useQuestionLibraryStateQuery(questionId, true);

  if (!stateQuery.data) {
    return <p className="question-note__status">{stateQuery.isError ? t("library.noteFailed") : t("common.loadingState")}</p>;
  }

  return <NoteEditor key={questionId} questionId={questionId} state={stateQuery.data} />;
}
