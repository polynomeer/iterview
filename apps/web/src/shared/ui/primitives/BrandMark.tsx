// The iterview mark (ADR 0094): a lowercase i whose dot is the root question and whose branch ends in
// the follow-up. Colors come from tokens so the mark follows the palette.
export function BrandMark({ size = 26 }: { size?: number }) {
  return (
    <svg aria-hidden="true" className="brand-mark" height={size} viewBox="0 0 64 64" width={size}>
      <circle className="brand-mark__root" cx="22" cy="13" r="8" />
      <path className="brand-mark__stem" d="M22 29V55M22 45H37" />
      <circle className="brand-mark__leaf" cx="47" cy="45" r="8" />
    </svg>
  );
}
