import { useEffect, useState } from "react";

export type LayoutMode = "mobile" | "desktop";

const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

function getLayoutMode() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "mobile" as LayoutMode;
  }

  return window.matchMedia(DESKTOP_MEDIA_QUERY).matches ? "desktop" : "mobile";
}

export function useLayoutMode() {
  const [mode, setMode] = useState<LayoutMode>(() => getLayoutMode());

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQueryList = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const updateMode = () => {
      setMode(mediaQueryList.matches ? "desktop" : "mobile");
    };

    updateMode();
    mediaQueryList.addEventListener("change", updateMode);

    return () => {
      mediaQueryList.removeEventListener("change", updateMode);
    };
  }, []);

  return {
    mode,
    isMobile: mode === "mobile",
    isDesktop: mode === "desktop",
  };
}
