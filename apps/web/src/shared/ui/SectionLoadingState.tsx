import { StateCard } from "./StateCard";

type SectionLoadingStateProps = {
  label?: string;
  title: string;
  body: string;
};

export function SectionLoadingState({
  label = "Loading",
  title,
  body,
}: SectionLoadingStateProps) {
  return <StateCard body={body} label={label} size="section" title={title} tone="loading" />;
}
