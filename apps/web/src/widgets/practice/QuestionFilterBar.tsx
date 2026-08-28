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

type FilterSelectProps = {
  label: string;
  value: string;
  options: PracticeFilterOptionModel[];
  onChange: (value: string) => void;
};

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="practice-filter">
      <span className="practice-filter__label">{label}</span>
      <select
        className="practice-filter__select"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">전체</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function QuestionFilterBar({
  filters,
  value,
  onChange,
  embedded = false,
}: QuestionFilterBarProps) {
  const controls = (
    <div className="practice-filter-grid">
      <FilterSelect
        label="카테고리"
        onChange={(next) => onChange({ ...value, category: next })}
        options={filters.categories}
        value={value.category}
      />
      <FilterSelect
        label="회사"
        onChange={(next) => onChange({ ...value, company: next })}
        options={filters.companies}
        value={value.company}
      />
      <FilterSelect
        label="난이도"
        onChange={(next) => onChange({ ...value, difficulty: next })}
        options={filters.difficulties}
        value={value.difficulty}
      />
      <FilterSelect
        label="상태"
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
          <p className="section-heading__eyebrow">필터</p>
          <h2 className="page-card__title">연습 목록을 좁혀보세요</h2>
        </div>
      </div>
      {controls}
    </section>
  );
}
