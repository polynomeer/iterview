import { useEffect, useState } from "react";
import { Outlet, useMatches } from "react-router-dom";
import { useAuth } from "../../shared/auth/useAuth";
import { AppShell } from "../../shared/ui/layout";
import { BottomTabBar } from "./BottomTabBar";
import { CommandPalette } from "./CommandPalette";
import { SidebarNavigation } from "./SidebarNavigation";
import { TopToolbar } from "./TopToolbar";

export function isFocusRoute(matches: Array<{ handle: unknown }>) {
  return matches.some((match) => (match.handle as { focus?: boolean } | undefined)?.focus === true);
}

export function AppLayout() {
  const { isAuthenticated } = useAuth();
  const isFocus = isFocusRoute(useMatches());
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

  const commandPalette = isAuthenticated ? (
    <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
  ) : null;

  if (isFocus) {
    return (
      <>
        <div className="shell-focus">
          <Outlet />
        </div>
        {commandPalette}
      </>
    );
  }

  return (
    <>
      <AppShell
        desktopSidebar={<SidebarNavigation />}
        mobileBottomBar={<BottomTabBar />}
        topToolbar={<TopToolbar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />}
      >
        <Outlet />
      </AppShell>
      {commandPalette}
    </>
  );
}
