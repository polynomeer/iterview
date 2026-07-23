import type { ArchiveFilterOptionModel, ArchiveFilterState } from "../../entities/archive/model";

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
  return (
    <label className="practice-filter">
      <span className="practice-filter__label">{label}</span>
      <select
        className="practice-filter__select"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">All</option>
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
  const controls = (
    <div className="practice-filter-grid">
      <FilterSelect
        label="Category"
        onChange={(next) => onChange({ ...value, category: next })}
        options={filters.categories}
        value={value.category}
      />
      <FilterSelect
        label="Company"
        onChange={(next) => onChange({ ...value, company: next })}
        options={filters.companies}
        value={value.company}
      />
      <FilterSelect
        label="Tag"
        onChange={(next) => onChange({ ...value, tag: next })}
        options={filters.tags}
        value={value.tag}
      />
    </div>
  );

  if (embedded) {
    return <div className="practice-filter-bar practice-filter-bar--embedded">{controls}</div>;
  }

  return (
    <section className="page-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Filters</p>
          <h2 className="page-card__title">Refine archived questions</h2>
        </div>
      </div>
      {controls}
    </section>
  );
}
