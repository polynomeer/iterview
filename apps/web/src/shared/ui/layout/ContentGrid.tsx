import type { PropsWithChildren } from "react";

type ContentGridProps = PropsWithChildren<{
  columns?: "two" | "three";
}>;

export function ContentGrid({
  children,
  columns = "two",
}: ContentGridProps) {
  return <div className={`content-grid content-grid--${columns}`}>{children}</div>;
}
