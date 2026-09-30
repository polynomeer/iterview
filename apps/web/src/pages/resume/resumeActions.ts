import { useState } from "react";
import { useCreateResumeMutation } from "../../features/resume/api/useCreateResumeMutation";
import { useUploadResumeVersionMutation } from "../../features/resume/api/useUploadResumeVersionMutation";
import { downloadResumeVersionFileRequest } from "../../shared/api/resumeApi";

/** Creates a resume (when needed) and uploads a PDF into it; resolves to the new version id. */
export function useStartResumeVersion() {
  const createMutation = useCreateResumeMutation();
  const uploadMutation = useUploadResumeVersionMutation();

  async function start({ resumeId, title, file }: { resumeId?: string; title?: string; file: File }) {
    const targetId = resumeId ?? String((await createMutation.mutateAsync({ title: title ?? file.name.replace(/\.pdf$/i, "") })).id);
    const version = await uploadMutation.mutateAsync({ resumeId: targetId, file });
    return String(version.id);
  }

  return {
    start,
    isPending: createMutation.isPending || uploadMutation.isPending,
    error: createMutation.error ?? uploadMutation.error,
    reset: () => {
      createMutation.reset();
      uploadMutation.reset();
    },
  };
}

/** Saves a version's original PDF through a temporary object URL. */
export function useDownloadResumeVersion() {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [failedId, setFailedId] = useState<string | null>(null);

  async function download(versionId: string, fileName: string) {
    setPendingId(versionId);
    setFailedId(null);
    try {
      const blob = await downloadResumeVersionFileRequest(versionId);
      const objectUrl = window.URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = /\.pdf$/i.test(fileName) ? fileName : `${fileName}.pdf`;
      window.document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch {
      setFailedId(versionId);
    } finally {
      setPendingId(null);
    }
  }

  return { download, pendingId, failedId };
}
