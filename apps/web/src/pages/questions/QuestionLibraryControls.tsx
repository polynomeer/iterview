import { useRef, useState } from "react";
import {
  useQuestionLibraryStateQuery,
  useSaveQuestionNoteMutation,
  useToggleBookmarkMutation,
} from "../../features/library/api/useQuestionLibraryState";
import { useLocale } from "../../shared/i18n";
import type { QuestionLibraryStateDto } from "../../shared/types/library";
import { Button, Field, IconButton, Textarea } from "../../shared/ui/primitives";

/** Saves the question to 보관함 (ADR 0083). Signed-in users only. */
export function BookmarkButton({ questionId }: { questionId: string }) {
  const { t } = useLocale();
  const stateQuery = useQuestionLibraryStateQuery(questionId, true);
  const mutation = useToggleBookmarkMutation(questionId);
  const bookmarked = stateQuery.data?.bookmarked ?? false;

  return (
    <IconButton
      aria-busy={mutation.isPending || undefined}
      aria-pressed={bookmarked}
      className="question-bookmark"
      disabled={!stateQuery.data || mutation.isPending}
      icon="bookmark"
      label={mutation.isError ? `${t("library.bookmark")} · ${t("library.bookmarkFailed")}` : t("library.bookmark")}
      onClick={() => mutation.mutate(!bookmarked)}
      size="lg"
      variant="secondary"
    />
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

/** 내 메모 in the side column: one private note per question. */
export function NoteSection({ questionId }: { questionId: string }) {
  const { t } = useLocale();
  const stateQuery = useQuestionLibraryStateQuery(questionId, true);

  if (!stateQuery.data) {
    return <p className="question-note__status">{stateQuery.isError ? t("library.noteFailed") : t("common.loadingState")}</p>;
  }

  return <NoteEditor key={questionId} questionId={questionId} state={stateQuery.data} />;
}
