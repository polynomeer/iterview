import { AreaNavigation } from "./AreaNavigation";
import { Header } from "./Header";

type TopToolbarProps = {
  onOpenCommandPalette?: () => void;
};

export function TopToolbar({ onOpenCommandPalette }: TopToolbarProps) {
  return (
    <div className="top-toolbar shell-toolbar">
      <Header onOpenCommandPalette={onOpenCommandPalette} />
      <AreaNavigation />
    </div>
  );
}
