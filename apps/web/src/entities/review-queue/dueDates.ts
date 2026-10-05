const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Whole days from today to the due date: negative = overdue, 0 = today, positive = upcoming. */
export function daysUntil(iso: string | null, now = new Date()) {
  if (!iso) {
    return null;
  }
  const due = new Date(iso);
  if (Number.isNaN(due.getTime())) {
    return null;
  }
  return Math.round((startOfDay(due).getTime() - startOfDay(now).getTime()) / DAY_MS);
}

/** Monday-first week containing `now`, with how many items fall due on each day. */
export function weekLoad(dueDates: Array<string | null>, now = new Date()) {
  const today = startOfDay(now);
  const monday = new Date(today.getTime() - ((today.getDay() + 6) % 7) * DAY_MS);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday.getTime() + index * DAY_MS);
    const count = dueDates.filter((iso) => {
      if (!iso) {
        return false;
      }
      const due = new Date(iso);
      return !Number.isNaN(due.getTime()) && startOfDay(due).getTime() === day.getTime();
    }).length;
    return { date: day, count, isToday: day.getTime() === today.getTime() };
  });
}

/** Items due today or overdue. The queue also lists upcoming items for the week view. */
export function countDue(items: Array<{ scheduledAt: string | null }>, now = new Date()) {
  return items.filter((item) => (daysUntil(item.scheduledAt, now) ?? 0) <= 0).length;
}
