/**
 * Converts a JS Date object into a "YYYY-MM-DD" string using its LOCAL
 * calendar date — NOT date.toISOString().slice(0, 10), which is a common
 * and dangerous mistake: toISOString() first converts the date to UTC,
 * and in any timezone ahead of UTC (like Sri Lanka, UTC+5:30), picking
 * "23rd" locally can silently become "22nd" once shifted to UTC. This
 * caused real bookings/blocks to be off by one day — always use this
 * function instead, everywhere a picked date needs to become a string.
 */
export function toLocalDateString(date) {
  if (!date) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * The reverse of toLocalDateString: turns a "YYYY-MM-DD" string from the
 * API back into a Date object at LOCAL midnight for that exact calendar
 * date. Do NOT use `new Date(dateString)` for this — per the JS spec, a
 * plain "YYYY-MM-DD" string is parsed as UTC midnight, which in any
 * timezone ahead of UTC (like Sri Lanka, UTC+5:30) lands at e.g. 5:30am
 * *local* time on that same day. That's harmless on its own, but breaks
 * the moment you compare it against ANOTHER date built at true local
 * midnight — such as the day cells a calendar/date-picker generates —
 * causing exactly the kind of "wrong day highlighted" bug this fixes.
 */
export function parseLocalDate(dateString) {
  if (!dateString) return null
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}