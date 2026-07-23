import type { PropsWithChildren } from "react";

type DetailSidebarProps = PropsWithChildren<{
  sticky?: boolean;
}>;

export function DetailSidebar({ children, sticky = true }: DetailSidebarProps) {
  return (
    <aside className={`detail-sidebar${sticky ? " detail-sidebar--sticky" : ""}`}>
      {children}
    </aside>
  );
}
