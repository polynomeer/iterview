import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../shared/auth/useAuth";
import { AppShell } from "../../shared/ui/layout";
import { BottomTabBar } from "./BottomTabBar";
import { CommandPalette } from "./CommandPalette";
import { SidebarNavigation } from "./SidebarNavigation";
import { TopToolbar } from "./TopToolbar";

export function AppLayout() {
  const { isAuthenticated } = useAuth();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsCommandPaletteOpen(false);
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAuthenticated]);

  return (
    <>
      <AppShell
        desktopSidebar={<SidebarNavigation />}
        mobileBottomBar={<BottomTabBar />}
        topToolbar={<TopToolbar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />}
      >
        <Outlet />
      </AppShell>
      {isAuthenticated ? (
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
        />
      ) : null}
    </>
  );
}
