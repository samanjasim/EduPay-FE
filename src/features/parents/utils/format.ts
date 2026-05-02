/**
 * Locale-aware integer formatter for currency amounts. Server-side amounts
 * are numeric + currency code; we never bake locale into the wire format.
 */
export function formatCurrency(amount: number, locale?: string): string {
  try {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(amount);
  } catch {
    return Math.round(amount).toLocaleString();
  }
}

/** Formats a YYYY-MM-DD date as "May 12" / "12 آذار" depending on locale. */
export function formatDueDate(iso: string, locale?: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(d);
  } catch {
    return d.toDateString();
  }
}
