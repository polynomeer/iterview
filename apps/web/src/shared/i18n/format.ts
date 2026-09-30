import type { AppLocale } from "./locale";
import { messages, type MessageKey } from "./messages";

export type MessageParams = Record<string, string | number>;

/** Looks up a message and fills `{name}` placeholders; unknown keys fall back to the key itself. */
export function formatMessage(locale: AppLocale, key: MessageKey, params?: MessageParams) {
  const [namespace, messageKey] = key.split(".");
  const dictionary = messages[locale] as Record<string, Record<string, string>>;
  const template = dictionary[namespace]?.[messageKey] ?? key;
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}
