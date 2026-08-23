import { useLocale } from "../../shared/i18n";

type SectionHeaderProps = {
  title: string;
  count: number;
  helperText?: string;
};

export function SectionHeader({ title, count, helperText }: SectionHeaderProps) {
  const { t } = useLocale();

  return (
    <div className="section-heading">
      <div>
        <p className="section-heading__eyebrow">{t("feed.sectionEyebrow")}</p>
        <h2 className="page-card__title">{title}</h2>
        {helperText ? <p className="page-card__body">{helperText}</p> : null}
      </div>
      <span className="section-heading__count">{count}</span>
    </div>
  );
}
