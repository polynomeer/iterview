import { useLocale } from "../../shared/i18n";
import type { PracticeFilterOptionModel, PracticeFilterState } from "../../entities/practice/model";

type QuestionFilterBarProps = {
  filters: {
    categories: PracticeFilterOptionModel[];
    companies: PracticeFilterOptionModel[];
    difficulties: PracticeFilterOptionModel[];
    statuses: PracticeFilterOptionModel[];
  };
  value: PracticeFilterState;
  onChange: (next: PracticeFilterState) => void;
  embedded?: boolean;
};

type FilterSectionProps = {
  label: string;
  value: string;
  options: PracticeFilterOptionModel[];
  onChange: (value: string) => void;
  highlightCount?: number;
};

function FilterSection({ label, value, options, onChange, highlightCount }: FilterSectionProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <section className="practice-filter-section">
      <div className="practice-filter-section__header">
        <span className="practice-filter-section__label">{label}</span>
        {typeof highlightCount === "number" ? <span className="practice-filter-section__count">{highlightCount}</span> : null}
      </div>
      <div className="practice-filter-section__options" role="list">
        <button
          className={`practice-filter-option ${value === "" ? "practice-filter-option--selected" : ""}`}
          onClick={() => onChange("")}
          type="button"
        >
          <span aria-hidden="true" className="practice-filter-option__check" />
          <span className="practice-filter-option__label">{isKorean ? "전체" : "All"}</span>
        </button>
        {options.map((option) => (
          <button
            className={`practice-filter-option ${value === option.id ? "practice-filter-option--selected" : ""}`}
            key={option.id}
            onClick={() => onChange(value === option.id ? "" : option.id)}
            type="button"
          >
            <span aria-hidden="true" className="practice-filter-option__check" />
            <span className="practice-filter-option__label">{option.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function QuestionFilterBar({
  filters,
  value,
  onChange,
  embedded = false,
}: QuestionFilterBarProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  const controls = (
    <div className="practice-filter-stack">
      <div className="practice-filter-stack__topline">
        <span className="page-card__label">{isKorean ? "필터" : "Filter"}</span>
        <button
          className="practice-filter-stack__reset"
          onClick={() =>
            onChange({
              category: "",
              company: "",
              difficulty: "",
              status: "",
              search: value.search,
            })}
          type="button"
        >
          {isKorean ? "초기화" : "Clear all"}
        </button>
      </div>
      <FilterSection
        highlightCount={filters.categories.length + 1}
        label={isKorean ? "카테고리" : "Category"}
        onChange={(next) => onChange({ ...value, category: next })}
        options={filters.categories}
        value={value.category}
      />
      <FilterSection
        highlightCount={filters.companies.length + 1}
        label={isKorean ? "회사" : "Company"}
        onChange={(next) => onChange({ ...value, company: next })}
        options={filters.companies}
        value={value.company}
      />
      <FilterSection
        highlightCount={filters.difficulties.length + 1}
        label={isKorean ? "난이도" : "Difficulty"}
        onChange={(next) => onChange({ ...value, difficulty: next })}
        options={filters.difficulties}
        value={value.difficulty}
      />
      <FilterSection
        highlightCount={filters.statuses.length + 1}
        label={isKorean ? "상태" : "Status"}
        onChange={(next) => onChange({ ...value, status: next })}
        options={filters.statuses}
        value={value.status}
      />
    </div>
  );

  if (embedded) {
    return <div className="practice-filter-bar practice-filter-bar--embedded">{controls}</div>;
  }

  return (
    <section className="page-card practice-filter-panel">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{isKorean ? "필터" : "Filters"}</p>
          <h2 className="page-card__title">{isKorean ? "연습 목록을 좁혀보세요" : "Narrow the practice list"}</h2>
        </div>
      </div>
      {controls}
    </section>
  );
}
