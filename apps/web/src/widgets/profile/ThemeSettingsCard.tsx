import { themeOptions, type AppTheme } from "../../shared/theme";
import { useLocale } from "../../shared/i18n";

type ThemeSettingsCardProps = {
  className?: string;
  value: AppTheme;
  onChange: (theme: AppTheme) => void;
};

export function ThemeSettingsCard({ className, value, onChange }: ThemeSettingsCardProps) {
  const { locale, t } = useLocale();
  const isKorean = locale === "ko";

  return (
    <section className={`page-card${className ? ` ${className}` : ""}`}>
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{t("profile.themeEyebrow")}</p>
          <h2 className="page-card__title">{t("profile.themeTitle")}</h2>
          <p className="page-card__body">
            {isKorean
              ? "연습 로직은 건드리지 않고 긴 리뷰 세션에 맞는 화면 분위기를 고르세요."
              : "Choose the visual mode for long review sessions without touching the practice logic."}
          </p>
        </div>
        <span className="section-heading__count section-heading__count--text">
          {isKorean ? "로컬 전용" : "Local only"}
        </span>
      </div>
      <div className="theme-option-list" role="radiogroup" aria-label={t("profile.themeEyebrow")}>
        {themeOptions.map((option) => {
          const isSelected = option.id === value;
          const label =
            option.id === "light"
              ? isKorean
                ? "라이트"
                : "Light"
              : option.id === "dark"
                ? isKorean
                  ? "다크"
                  : "Dark"
                : option.id === "workspace"
                  ? isKorean
                    ? "워크스페이스"
                    : "Workspace"
                : "Dracula";
          const description =
            option.id === "light"
              ? isKorean
                ? "현재 기본 스타일을 유지하는 밝은 화면입니다."
                : "Bright surfaces with the current default look."
              : option.id === "dark"
                ? isKorean
                  ? "눈부심을 줄인 차분한 어두운 화면입니다."
                  : "Muted dark surfaces for lower-glare browsing."
                : option.id === "workspace"
                  ? isKorean
                    ? "레퍼런스 이미지에 맞춘 네이비 작업공간과 코발트 포커스 색상입니다."
                    : "Reference-driven navy workspace surfaces with cobalt focus accents."
                : isKorean
                  ? "강한 대비를 주는 채도 높은 드라큘라 팔레트입니다."
                  : "A saturated violet-night palette with strong contrast.";

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
                <span className="theme-option__label">{label}</span>
                <span className="theme-option__state">{isSelected ? t("profile.themeSelected") : t("profile.themeSelect")}</span>
              </span>
              <span className="theme-option__description">{description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
