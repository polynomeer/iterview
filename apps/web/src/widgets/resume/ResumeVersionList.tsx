import type { ResumeVersionModel } from "../../entities/resume/model";
import { ResumeVersionItem } from "./ResumeVersionItem";

type ResumeVersionListProps = {
  versions: ResumeVersionModel[];
  selectedVersionId: string | null;
  onSelectVersion: (versionId: string) => void;
};

export function ResumeVersionList({
  versions,
  selectedVersionId,
  onSelectVersion,
}: ResumeVersionListProps) {
  return (
    <div className="stack-list">
      {versions.map((version) => (
        <ResumeVersionItem
          isSelected={selectedVersionId === version.id}
          key={version.id}
          onSelect={() => onSelectVersion(version.id)}
          version={version}
        />
      ))}
    </div>
  );
}
