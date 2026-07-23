import { themeOptions, type AppTheme } from "../../shared/theme";
import { useLocale } from "../../shared/i18n";

type ThemeSettingsCardProps = {
  className?: string;
  value: AppTheme;
  onChange: (theme: AppTheme) => void;
};

export function ThemeSettingsCard({ className, value, onChange }: ThemeSettingsCardProps) {
  const { t } = useLocale();

  return (
    <section className={`page-card${className ? ` ${className}` : ""}`}>
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{t("profile.themeEyebrow")}</p>
          <h2 className="page-card__title">{t("profile.themeTitle")}</h2>
        </div>
      </div>
      <div className="theme-option-list" role="radiogroup" aria-label={t("profile.themeEyebrow")}>
        {themeOptions.map((option) => {
          const isSelected = option.id === value;

          return (
            <button
              aria-checked={isSelected}
              className={`theme-option${isSelected ? " theme-option--active" : ""}`}
              key={option.id}
              onClick={() => onChange(option.id)}
              role="radio"
              type="button"
            >
              <span className="theme-option__header">
                <span className="theme-option__label">{option.label}</span>
                <span className="theme-option__state">{isSelected ? t("profile.themeSelected") : t("profile.themeSelect")}</span>
              </span>
              <span className="theme-option__description">{option.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
