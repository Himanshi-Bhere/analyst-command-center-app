export const THEMES = [
  { id: 'clean', name: 'Clean', desc: 'Calm slate-navy, one blue accent, flat cards — systematic and uncluttered', swatch: ['#0b0f17', '#3b82f6'], preview: 'linear-gradient(135deg,#0b0f17,#141c2b)' },
  { id: 'midnight', name: 'Midnight', desc: 'Dense dark dashboard, purple glow, monospace numbers', swatch: ['#08080c', '#7c6cf6'], preview: 'linear-gradient(135deg,#08080c,#1a1a2a)' },
  { id: 'aurora', name: 'Aurora Glass', desc: 'Frosted glass cards over a violet–pink–cyan sky, rounded and airy', swatch: ['#0b0d24', '#c4aaff'], preview: 'radial-gradient(circle at 20% 0%,#8b5cf6,transparent 50%),radial-gradient(circle at 100% 20%,#ec4899,transparent 50%),radial-gradient(circle at 60% 120%,#38bdf8,transparent 50%),#0b0d24' },
  { id: 'paper', name: 'Paper', desc: 'Warm cream, serif headings, flat editorial cards — calm and print-like', swatch: ['#f7f4ee', '#b25426'], preview: 'linear-gradient(135deg,#f7f4ee,#efe9dd)' },
  { id: 'neon', name: 'Neon Terminal', desc: 'Pure black, cyan + magenta, sharp corners, monospace, scanlines', swatch: ['#03040a', '#00e5ff'], preview: 'linear-gradient(135deg,#03040a,#061018)' },
]
export const applyTheme = (id) => {
  const t = THEMES.find((x) => x.id === id) ? id : 'clean'
  document.documentElement.setAttribute('data-theme', t)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', THEMES.find((x) => x.id === t).swatch[0])
}
export const cssVar = (name) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  if (!v) return '#7c6cf6'
  const [r, g, b] = v.split(/\s+/).map(Number)
  return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')
}
