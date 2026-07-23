import { StateCard } from "./StateCard";

type LoadingStateCardProps = {
  label?: string;
  title: string;
  body: string;
};

export function LoadingStateCard({
  label = "Loading",
  title,
  body,
}: LoadingStateCardProps) {
  return <StateCard body={body} label={label} title={title} tone="loading" />;
}
