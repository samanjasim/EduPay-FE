import type { TFunction } from 'i18next';

/**
 * Backend stores notification title/body as either:
 *
 *  - Plain text (legacy notifications, ad-hoc admin sends), OR
 *  - An i18n key with optional pipe-delimited substitutions, e.g.
 *    `notifications.purchase.settled.body|amount=30000.00|currency=IQD|orderId=...`
 *
 * The pipe-format is emitted by the product purchase notification handlers
 * (see `PurchaseNotificationTemplates` on the BE side) so each recipient sees
 * the message in their own UI language without the BE having to know all
 * locales.
 *
 * Heuristic: a value is treated as an i18n key when it starts with
 * `notifications.` AND contains at least one dot in the prefix-before-pipe.
 * Anything else is shown verbatim.
 *
 * Substitution values are passed straight to `t()` as the interpolation
 * payload so existing `{{amount}}`-style placeholders in translation.json
 * get resolved natively by i18next.
 */
export function localizeNotificationText(
  raw: string | null | undefined,
  t: TFunction
): string {
  if (!raw) return '';
  // Split off the substitution segment, if any.
  const parts = raw.split('|');
  const head = parts[0]?.trim() ?? '';
  // Only treat as i18n key when it looks like one.
  if (!head.startsWith('notifications.') || !head.includes('.', 'notifications.'.length)) {
    return raw;
  }

  const params: Record<string, string> = {};
  for (let i = 1; i < parts.length; i += 1) {
    const seg = parts[i];
    const eq = seg.indexOf('=');
    if (eq <= 0) continue;
    const k = seg.slice(0, eq).trim();
    const v = seg.slice(eq + 1);
    if (k) params[k] = v;
  }

  // `defaultValue: raw` ensures we still display *something* (the raw
  // template) if a translation key happens to be missing in the active locale.
  const localized = t(head, { ...params, defaultValue: raw }) as string;
  return localized;
}
