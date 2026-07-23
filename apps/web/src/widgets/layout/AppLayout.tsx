import { Outlet } from "react-router-dom";
import { AppShell } from "../../shared/ui/layout";
import { BottomTabBar } from "./BottomTabBar";
import { SidebarNavigation } from "./SidebarNavigation";
import { TopToolbar } from "./TopToolbar";

export function AppLayout() {
  return (
    <AppShell
      desktopSidebar={<SidebarNavigation />}
      mobileBottomBar={<BottomTabBar />}
      topToolbar={<TopToolbar />}
    >
      <Outlet />
    </AppShell>
  );
}
