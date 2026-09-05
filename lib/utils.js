import clsx from 'clsx'
export const cn = (...a) => clsx(...a)
export const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)
export const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n))
export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3)
export const sum = (arr, f = (x) => x) => arr.reduce((s, x) => s + (f(x) || 0), 0)
export const avg = (arr, f = (x) => x) => (arr.length ? sum(arr, f) / arr.length : 0)
export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
export const hrs = (min) => (min >= 60 ? `${(min / 60).toFixed(min % 60 ? 1 : 0)}h` : `${min}m`)
export const groupBy = (arr, f) => arr.reduce((m, x) => { const k = f(x); (m[k] ||= []).push(x); return m }, {})
export const PRIORITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
export const priorityColor = (p) => ({ CRITICAL: 'text-bad border-bad/40 bg-bad/10', HIGH: 'text-warn border-warn/40 bg-warn/10', MEDIUM: 'text-info border-info/40 bg-info/10', LOW: 'text-muted border-line2 bg-raised' }[p] || 'text-muted border-line2 bg-raised')
export const skillColor = (s) => ({
  sql: '#7c6cf6', excel: '#3ddc97', powerbi: '#f5b544', dax: '#f5b544', statistics: '#4fb7f5', python: '#4fb7f5',
  business: '#e879a5', retail: '#e879a5', bfsi: '#34d3c6', commercial: '#fb923c', aptitude: '#c4b5fd', dsa: '#7c7c92',
  project: '#a99cff', interview: '#f06a6a', career: '#f06a6a', revision: '#b4b4c6', linkedin: '#4fb7f5', application: '#f06a6a',
}[s] || '#7c7c92')
