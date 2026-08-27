import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLocale } from "../../shared/i18n";
import { getCommandPaletteItems, type CommandPaletteItem } from "./commandPaletteData";

type CommandPaletteProps = {
  isOpen: boolean;
  onClose: () => void;
};

type LocalizedCommandPaletteItem = CommandPaletteItem & {
  title: string;
  subtitle: string;
  section: string;
};

function normalizeSearchValue(value: string) {
  return value.toLowerCase().trim();
}

function groupPaletteItems(items: LocalizedCommandPaletteItem[]) {
  return items.reduce<Record<string, LocalizedCommandPaletteItem[]>>((groups, item) => {
    if (!groups[item.section]) {
      groups[item.section] = [];
    }

    groups[item.section].push(item);
    return groups;
  }, {});
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLocale();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const commandPaletteItems = useMemo(
    () =>
      getCommandPaletteItems().map((item) => ({
        ...item,
        title: t(item.titleKey),
        subtitle: t(item.subtitleKey),
        section: t(item.sectionKey),
      })),
    [t],
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query);

    if (!normalizedQuery) {
      return commandPaletteItems;
    }

    return commandPaletteItems.filter((item) => {
      const searchText = [item.title, item.subtitle, ...item.keywords].join(" ").toLowerCase();
      return searchText.includes(normalizedQuery);
    });
  }, [commandPaletteItems, query]);

  const groupedItems = useMemo(() => groupPaletteItems(filteredItems), [filteredItems]);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setSelectedIndex(0);
      return;
    }

    inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex((currentIndex) => {
      if (filteredItems.length === 0) {
        return 0;
      }

      return Math.min(currentIndex, filteredItems.length - 1);
    });
  }, [filteredItems]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((currentIndex) => (currentIndex + 1) % Math.max(filteredItems.length, 1));
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((currentIndex) =>
          (currentIndex - 1 + Math.max(filteredItems.length, 1)) % Math.max(filteredItems.length, 1),
        );
        return;
      }

      if (event.key === "Enter") {
        const activeItem = filteredItems[selectedIndex];

        if (!activeItem) {
          return;
        }

        event.preventDefault();
        navigate(activeItem.to);
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [filteredItems, isOpen, navigate, onClose, selectedIndex]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-labelledby={inputId}
      aria-modal="true"
      className="command-palette"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="command-palette__surface"
        onClick={(event) => event.stopPropagation()}
        role="document"
      >
        <div className="command-palette__search">
          <label className="command-palette__search-label" htmlFor={inputId}>
            {t("commandPalette.searchLabel")}
          </label>
          <div className="command-palette__search-row">
            <input
              ref={inputRef}
              aria-label={t("commandPalette.searchLabel")}
              className="command-palette__search-input"
              id={inputId}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("commandPalette.searchPlaceholder")}
              type="search"
              value={query}
            />
            <span aria-hidden="true" className="command-palette__shortcut">
              Esc
            </span>
          </div>
          <p className="command-palette__search-meta">
            {t("commandPalette.currentWorkspace")}: <strong>{location.pathname}</strong>
          </p>
        </div>

        {filteredItems.length > 0 ? (
          <div aria-label={t("commandPalette.results")} className="command-palette__results" role="listbox">
            {Object.entries(groupedItems).map(([section, items]) => (
              <section className="command-palette__group" key={section}>
                <header className="command-palette__group-header">
                  <span>{section}</span>
                  <span>{items.length}</span>
                </header>
                <div className="command-palette__group-list">
                  {items.map((item) => {
                    const itemIndex = filteredItems.findIndex((candidate) => candidate.id === item.id);
                    const isSelected = itemIndex === selectedIndex;

                    return (
                      <button
                        aria-selected={isSelected}
                        className={`command-palette__item${isSelected ? " command-palette__item--selected" : ""}`}
                        key={item.id}
                        onClick={() => {
                          navigate(item.to);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                        type="button"
                      >
                        <span className="command-palette__item-copy">
                          <strong>{item.title}</strong>
                          <span>{item.subtitle}</span>
                        </span>
                        <span className="command-palette__item-meta">{item.section}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="command-palette__empty">
            <strong>{t("commandPalette.noMatchTitle")}</strong>
            <span>{t("commandPalette.noMatchBody")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
