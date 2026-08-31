import { useLocale } from "../../shared/i18n";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchInput({ value, onChange }: SearchInputProps) {
  const { t } = useLocale();

  return (
    <label className="practice-search">
      <span className="practice-search__label">{t("practice.searchQuestions")}</span>
      <input
        className="form-field__input practice-search__input"
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("practice.searchPlaceholder")}
        type="search"
        value={value}
      />
    </label>
  );
}
