import { Header } from "./Header";

type TopToolbarProps = {
  onOpenCommandPalette?: () => void;
};

export function TopToolbar({ onOpenCommandPalette }: TopToolbarProps) {
  return (
    <div className="top-toolbar">
      <Header onOpenCommandPalette={onOpenCommandPalette} />
    </div>
  );
}
