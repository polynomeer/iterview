import type { ArchiveFilterOptionModel, ArchiveFilterState } from "../../entities/archive/model";
import { useLocale } from "../../shared/i18n";

type ArchiveFilterBarProps = {
  filters: {
    categories: ArchiveFilterOptionModel[];
    companies: ArchiveFilterOptionModel[];
    tags: ArchiveFilterOptionModel[];
  };
  value: ArchiveFilterState;
  onChange: (next: ArchiveFilterState) => void;
  embedded?: boolean;
};

type FilterSelectProps = {
  label: string;
  value: string;
  options: ArchiveFilterOptionModel[];
  onChange: (value: string) => void;
};

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <label className="practice-filter">
      <span className="practice-filter__label">{label}</span>
      <select
        className="practice-filter__select"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">{isKorean ? "전체" : "All"}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ArchiveFilterBar({ filters, value, onChange, embedded = false }: ArchiveFilterBarProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const activeCount = [value.category, value.company, value.tag].filter(Boolean).length;
  const controls = (
    <div className="practice-filter-grid">
      <FilterSelect
        label={isKorean ? "카테고리" : "Category"}
        onChange={(next) => onChange({ ...value, category: next })}
        options={filters.categories}
        value={value.category}
      />
      <FilterSelect
        label={isKorean ? "회사" : "Company"}
        onChange={(next) => onChange({ ...value, company: next })}
        options={filters.companies}
        value={value.company}
      />
      <FilterSelect
        label={isKorean ? "태그" : "Tag"}
        onChange={(next) => onChange({ ...value, tag: next })}
        options={filters.tags}
        value={value.tag}
      />
    </div>
  );

  if (embedded) {
    return (
      <div className="practice-filter-bar practice-filter-bar--embedded archive-filter-bar archive-filter-bar--embedded">
        <div className="section-heading">
          <div>
            <p className="section-heading__eyebrow">{isKorean ? "필터" : "Filters"}</p>
            <h2 className="page-card__title">{isKorean ? "보관 질문 정리" : "Refine archived questions"}</h2>
          </div>
          <span className="section-heading__count section-heading__count--text">{isKorean ? `${activeCount}개 적용` : `${activeCount} active`}</span>
        </div>
        {controls}
      </div>
    );
  }

  return (
    <section className="page-card archive-filter-bar">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{isKorean ? "필터" : "Filters"}</p>
          <h2 className="page-card__title">{isKorean ? "보관 질문 정리" : "Refine archived questions"}</h2>
          <p className="page-card__body">
            {isKorean
              ? "특정 회사, 카테고리, 태그 흐름이 필요할 때만 라이브러리를 좁혀보세요."
              : "Narrow the library only when you need a specific company, category, or tag trail."}
          </p>
        </div>
        <span className="section-heading__count section-heading__count--text">{isKorean ? `${activeCount}개 적용` : `${activeCount} active`}</span>
      </div>
      {controls}
    </section>
  );
}
