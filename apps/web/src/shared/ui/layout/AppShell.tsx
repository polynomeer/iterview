import type { PropsWithChildren, ReactNode } from "react";
import { useLayoutMode } from "./useLayoutMode";

type AppShellProps = PropsWithChildren<{
  desktopSidebar: ReactNode;
  mobileBottomBar: ReactNode;
  topToolbar: ReactNode;
}>;

type SharedShellProps = PropsWithChildren<{
  topToolbar: ReactNode;
}>;

function MobileAppLayout({ children, topToolbar, mobileBottomBar }: SharedShellProps & {
  mobileBottomBar: ReactNode;
}) {
  return (
    <div className="app-shell app-shell--mobile">
      <div className="app-shell__frame">
        {topToolbar}
        <main className="app-shell__content">{children}</main>
      </div>
      {mobileBottomBar}
    </div>
  );
}

function DesktopAppLayout({ children, desktopSidebar, topToolbar }: SharedShellProps & {
  desktopSidebar: ReactNode;
}) {
  return (
    <div className="app-shell app-shell--desktop">
      {desktopSidebar}
      <div className="app-shell__workspace">
        {topToolbar}
        <main className="app-shell__content app-shell__content--desktop">{children}</main>
      </div>
    </div>
  );
}

export function AppShell({
  children,
  desktopSidebar,
  mobileBottomBar,
  topToolbar,
}: AppShellProps) {
  const { isDesktop } = useLayoutMode();

  if (isDesktop) {
    return (
      <DesktopAppLayout desktopSidebar={desktopSidebar} topToolbar={topToolbar}>
        {children}
      </DesktopAppLayout>
    );
  }

  return (
    <MobileAppLayout mobileBottomBar={mobileBottomBar} topToolbar={topToolbar}>
      {children}
    </MobileAppLayout>
  );
}

export { DesktopAppLayout, MobileAppLayout };
