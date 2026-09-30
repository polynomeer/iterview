import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";

export type TabItem<T extends string> = {
  id: T;
  label: ReactNode;
  count?: number;
};

function nextIndex(key: string, current: number, length: number) {
  switch (key) {
    case "ArrowRight":
    case "ArrowDown":
      return (current + 1) % length;
    case "ArrowLeft":
    case "ArrowUp":
      return (current - 1 + length) % length;
    case "Home":
      return 0;
    case "End":
      return length - 1;
    default:
      return null;
  }
}

/** Roving focus with automatic activation, per the WAI-ARIA tabs and radio group patterns. */
function useRovingKeys<T extends string>(items: Array<{ id: T }>, value: T, onChange: (id: T) => void) {
  const refs = useRef(new Map<T, HTMLButtonElement>());

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const index = nextIndex(event.key, items.findIndex((item) => item.id === value), items.length);
    if (index === null) {
      return;
    }
    event.preventDefault();
    const target = items[index].id;
    onChange(target);
    refs.current.get(target)?.focus();
  }

  function register(id: T) {
    return (element: HTMLButtonElement | null) => {
      if (element) {
        refs.current.set(id, element);
      } else {
        refs.current.delete(id);
      }
    };
  }

  return { onKeyDown, register };
}

type TabsProps<T extends string> = {
  /** Accessible name of the tab list. */
  label: string;
  items: Array<TabItem<T>>;
  value: T;
  onChange: (id: T) => void;
  /** Content of the active tab. */
  children: ReactNode;
};

export function Tabs<T extends string>({ label, items, value, onChange, children }: TabsProps<T>) {
  const baseId = useId();
  const { onKeyDown, register } = useRovingKeys(items, value, onChange);
  const tabId = (id: T) => `${baseId}-tab-${id}`;

  return (
    <div className="ui-tabs">
      <div aria-label={label} className="ui-tabs__list" role="tablist">
        {items.map((item) => {
          const selected = item.id === value;
          return (
            <button
              aria-controls={`${baseId}-panel`}
              aria-selected={selected}
              className="ui-tabs__tab"
              id={tabId(item.id)}
              key={item.id}
              onClick={() => onChange(item.id)}
              onKeyDown={onKeyDown}
              ref={register(item.id)}
              role="tab"
              tabIndex={selected ? 0 : -1}
              type="button"
            >
              {item.label}
              {item.count !== undefined ? <span className="ui-tabs__count">{item.count}</span> : null}
            </button>
          );
        })}
      </div>
      <div aria-labelledby={tabId(value)} className="ui-tabs__panel" id={`${baseId}-panel`} role="tabpanel" tabIndex={0}>
        {children}
      </div>
    </div>
  );
}

type SegmentedProps<T extends string> = {
  label: string;
  items: Array<{ id: T; label: ReactNode }>;
  value: T;
  onChange: (id: T) => void;
};

/** A compact single-choice switch for view modes (e.g. 트리 / 맵 / 목록). */
export function Segmented<T extends string>({ label, items, value, onChange }: SegmentedProps<T>) {
  const { onKeyDown, register } = useRovingKeys(items, value, onChange);

  return (
    <div aria-label={label} className="ui-segmented" role="radiogroup">
      {items.map((item) => {
        const checked = item.id === value;
        return (
          <button
            aria-checked={checked}
            className="ui-segmented__option"
            key={item.id}
            onClick={() => onChange(item.id)}
            onKeyDown={onKeyDown}
            ref={register(item.id)}
            role="radio"
            tabIndex={checked ? 0 : -1}
            type="button"
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
