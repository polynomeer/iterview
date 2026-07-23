export function toArray<T>(value: T[] | null | undefined) {
  return Array.isArray(value) ? value : [];
}
