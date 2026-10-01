import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getQuestionLibraryStateRequest, saveQuestionNoteRequest, setQuestionBookmarkRequest } from "../../../shared/api/libraryApi";
import { queryKeys } from "../../../shared/api/queryKeys";
import type { QuestionLibraryStateDto } from "../../../shared/types/library";

/** A question's bookmark and note for the signed-in user. Skipped for guests. */
export function useQuestionLibraryStateQuery(questionId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.questions.libraryState(questionId),
    queryFn: ({ signal }) => getQuestionLibraryStateRequest(questionId, signal),
    enabled: enabled && Boolean(questionId),
  });
}

function useStoreState(questionId: string) {
  const queryClient = useQueryClient();
  return async (state: QuestionLibraryStateDto) => {
    queryClient.setQueryData(queryKeys.questions.libraryState(questionId), state);
    await queryClient.invalidateQueries({ queryKey: queryKeys.library.root });
  };
}

export function useToggleBookmarkMutation(questionId: string) {
  const store = useStoreState(questionId);
  return useMutation({
    mutationFn: (bookmarked: boolean) => setQuestionBookmarkRequest(questionId, bookmarked),
    onSuccess: store,
  });
}

export function useSaveQuestionNoteMutation(questionId: string) {
  const store = useStoreState(questionId);
  return useMutation({
    mutationFn: (body: string) => saveQuestionNoteRequest(questionId, body),
    onSuccess: store,
  });
}
