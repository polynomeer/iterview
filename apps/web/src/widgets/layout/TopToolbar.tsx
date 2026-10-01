import { useEffect, useRef } from "react";
import { AreaNavigation } from "./AreaNavigation";
import { Header } from "./Header";

type TopToolbarProps = {
  onOpenCommandPalette?: () => void;
};

const HEIGHT_VARIABLE = "--shell-toolbar-height";

/**
 * The sticky top bar. It publishes its height as --shell-toolbar-height so sticky panels below it
 * (question navigator, settings nav, review player) start under it rather than behind it.
 */
export function TopToolbar({ onOpenCommandPalette }: TopToolbarProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    const root = document.documentElement;
    if (!element || typeof ResizeObserver === "undefined") {
      return undefined;
    }
    const observer = new ResizeObserver(() => root.style.setProperty(HEIGHT_VARIABLE, `${element.offsetHeight}px`));
    observer.observe(element);
    return () => {
      observer.disconnect();
      root.style.removeProperty(HEIGHT_VARIABLE);
    };
  }, []);

  return (
    <div className="shell-toolbar" ref={ref}>
      <Header onOpenCommandPalette={onOpenCommandPalette} />
      <AreaNavigation />
    </div>
  );
}
