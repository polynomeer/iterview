import type { ReactNode } from "react";

type SplitLayoutProps = {
  main: ReactNode;
  aside: ReactNode;
  asidePosition?: "start" | "end";
};

export function SplitLayout({
  main,
  aside,
  asidePosition = "end",
}: SplitLayoutProps) {
  return (
    <div className={`split-layout split-layout--aside-${asidePosition}`}>
      <div className="split-layout__main">{main}</div>
      <div className="split-layout__aside">{aside}</div>
    </div>
  );
}
