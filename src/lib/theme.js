export const THEMES = [
  { id: 'midnight', name: 'Midnight', desc: 'Purple on near-black (default)', swatch: ['#08080c', '#7c6cf6'] },
  { id: 'ocean', name: 'Ocean', desc: 'Blue on deep navy', swatch: ['#060a10', '#38a0e8'] },
  { id: 'forest', name: 'Forest', desc: 'Green on charcoal', swatch: ['#070b0a', '#34ba82'] },
  { id: 'rose', name: 'Rose', desc: 'Pink on plum', swatch: ['#0c080b', '#ec5e96'] },
  { id: 'graphite', name: 'Graphite', desc: 'Monochrome, no accent colour', swatch: ['#0a0a0a', '#e6e6e6'] },
  { id: 'light', name: 'Light', desc: 'White background for daytime', swatch: ['#f3f4f8', '#6352ec'] },
]
export const applyTheme = (id) => {
  const t = THEMES.find((x) => x.id === id) ? id : 'midnight'
  document.documentElement.setAttribute('data-theme', t)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', t === 'light' ? '#f3f4f8' : THEMES.find((x) => x.id === t).swatch[0])
}
// Read CSS variable as hex for charts / SVG that need literal colours
export const cssVar = (name) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  if (!v) return '#7c6cf6'
  const [r, g, b] = v.split(/\s+/).map(Number)
  return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')
}
export const accentHex = () => cssVar('--c-accent')
export const lineHex = () => cssVar('--c-line')
