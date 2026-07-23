import { useQuery } from "@tanstack/react-query";
import { mapInterviewRecordListDtoToModel } from "../../../entities/practical-interview/model";
import { getInterviewRecordsRequest } from "../../../shared/api/practicalInterviewApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useInterviewRecordListQuery() {
  return useQuery({
    queryKey: queryKeys.interviewRecords.list,
    queryFn: async ({ signal }) =>
      mapInterviewRecordListDtoToModel(await getInterviewRecordsRequest(signal)),
  });
}
