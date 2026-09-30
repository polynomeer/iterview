import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { appLocaleStorageKey, getStoredAppLocale, normalizeAppLocale, type AppLocale } from "./locale";
import { formatMessage, type MessageParams } from "./format";
import type { MessageKey } from "./messages";

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: MessageKey, params?: MessageParams) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readInitialLocale() {
  if (typeof window !== "undefined") {
    const storedLocale = getStoredAppLocale(window.localStorage);

    if (storedLocale) {
      return storedLocale;
    }
  }

  return "ko" as const;
}

function applyLocale(locale: AppLocale) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.lang = locale;
}

export function LocaleProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<AppLocale>(() => readInitialLocale());

  useEffect(() => {
    applyLocale(locale);
    window.localStorage.setItem(appLocaleStorageKey, locale);
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
      t: (key, params) => formatMessage(locale, key, params),
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider.");
  }

  return context;
}
