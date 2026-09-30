import { formatMessage, type MessageParams } from "./format";
import { getCurrentAppLocale } from "./locale";
import type { MessageKey } from "./messages";

/** `t()` for code outside React, such as entity mappers, in the stored app locale. */
export function translate(key: MessageKey, params?: MessageParams) {
  return formatMessage(getCurrentAppLocale(), key, params);
}
