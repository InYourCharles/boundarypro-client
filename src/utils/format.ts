// Every business date in BoundaryPro is a calendar day in Manila (UTC+8, no daylight saving).
// The API returns stored dates as UTC moments, for example an assignment on 12 October is
// "2026-10-11T16:00:00.000Z". The screens convert them to the Manila day first, so the right day
// shows up whatever time zone the browser is set to.
const MANILA = 'Asia/Manila';

const dayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: MANILA, year: 'numeric', month: '2-digit', day: '2-digit' }); // en-CA prints 2026-10-12

// "2026-10-11T16:00:00.000Z" -> "2026-10-12"
export function manilaDay(value: string | Date): string {
  return dayFormatter.format(new Date(value));
}

export function todayManila(): string {
  return manilaDay(new Date());
}

// Day strings are compared and moved as plain UTC dates, so no time zone can shift them.
const DAY_MS = 24 * 60 * 60 * 1000;
const dayToMs = (day: string) => Date.parse(`${day}T00:00:00Z`);

export function addDays(day: string, days: number): string {
  return new Date(dayToMs(day) + days * DAY_MS).toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((dayToMs(to) - dayToMs(from)) / DAY_MS);
}

// "2026-10-12" -> "Mon, Oct 12"
export function formatDay(day: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(dayToMs(day)));
}

// "2026-10-12" -> "Monday, October 12, 2026"
export function formatLongDay(day: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(dayToMs(day)));
}

// A stored moment shown as a Manila day: "Oct 12, 2026"
export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: MANILA, month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

// A payment time in Manila: "Oct 7, 9:20 PM"
export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: MANILA, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

// "2026-09" -> "Sep 2026" for the month bars of the report
export function formatMonth(period: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', year: 'numeric' }).format(new Date(dayToMs(`${period}-01`)));
}

// Money is whole pesos: 5870 -> "₱5,870"
export function peso(amount: number): string {
  return `₱${amount.toLocaleString('en-US')}`;
}

export function km(value: number): string {
  return `${value.toLocaleString('en-US')} km`;
}

export function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}
