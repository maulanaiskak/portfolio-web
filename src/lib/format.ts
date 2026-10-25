const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const monthFmt = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });

/** "2024-04-01" or ISO timestamp → "1 Apr 2024". */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  return Number.isNaN(d.getTime()) ? '' : dateFmt.format(d);
}

export function formatMonth(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  return Number.isNaN(d.getTime()) ? '' : monthFmt.format(d);
}

/** Trip date range: "1 – 10 Apr 2024", "28 Mar – 3 Apr 2024", or a single date. */
export function formatRange(start: string | null, end: string | null): string {
  if (!start) return formatDate(end);
  if (!end || end === start) return formatDate(start);
  const s = new Date(`${start}T00:00:00Z`);
  const e = new Date(`${end}T00:00:00Z`);
  const sameYear = s.getUTCFullYear() === e.getUTCFullYear();
  const sameMonth = sameYear && s.getUTCMonth() === e.getUTCMonth();
  if (sameMonth) return `${s.getUTCDate()} – ${dateFmt.format(e)}`;
  if (sameYear) {
    const short = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
    return `${short.format(s)} – ${dateFmt.format(e)}`;
  }
  return `${dateFmt.format(s)} – ${dateFmt.format(e)}`;
}

export function tripDays(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  const ms = Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`);
  return Number.isNaN(ms) ? null : Math.round(ms / 86_400_000) + 1;
}

/** "JP" → 🇯🇵 */
export function flagEmoji(countryCode: string): string {
  if (!/^[A-Z]{2}$/.test(countryCode)) return '';
  return String.fromCodePoint(...[...countryCode].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
