import { useEffect, useState } from "react";

function getDraftStorageKey(questionId: string) {
  return `iterview.answer-draft.${questionId}`;
}

function getInitialDraft(questionId: string | undefined) {
  if (!questionId || typeof window === "undefined") {
    return "";
  }

  return window.sessionStorage.getItem(getDraftStorageKey(questionId)) ?? "";
}

export function useAnswerDraft(questionId: string | undefined) {
  const [draft, setDraft] = useState(() => getInitialDraft(questionId));

  useEffect(() => {
    setDraft(getInitialDraft(questionId));
  }, [questionId]);

  useEffect(() => {
    if (!questionId || typeof window === "undefined") {
      return;
    }

    const storageKey = getDraftStorageKey(questionId);

    if (draft) {
      window.sessionStorage.setItem(storageKey, draft);
    } else {
      window.sessionStorage.removeItem(storageKey);
    }
  }, [draft, questionId]);

  function clearDraft() {
    if (questionId && typeof window !== "undefined") {
      window.sessionStorage.removeItem(getDraftStorageKey(questionId));
    }

    setDraft("");
  }

  return {
    draft,
    setDraft,
    clearDraft,
    hasDraft: draft.trim().length > 0,
  };
}
