// Local-date helpers (no timezone drift). All ISO strings are yyyy-mm-dd.
export const pad = (n) => String(n).padStart(2, '0')
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const parseISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate() + n); return toISO(d) }
export const diffDays = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000)
export const dow = (s) => (parseISO(s).getDay() + 6) % 7 // 0=Mon .. 6=Sun
export const startOfWeek = (s) => addDays(s, -dow(s))
export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export const fmtLong = (s) => { const d = parseISO(s); return `${DAY_NAMES[dow(s)]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` }
export const fmtMed = (s) => { const d = parseISO(s); return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}` }
export const fmtShort = (s) => { const d = parseISO(s); return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}` }
export const monthKey = (s) => s.slice(0, 7)
export const greeting = () => { const h = new Date().getHours(); return h < 5 ? 'Late night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening' }
export const range = (n) => Array.from({ length: n }, (_, i) => i)
