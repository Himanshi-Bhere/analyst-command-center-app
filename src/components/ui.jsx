import React, { useState } from 'react'
import { cn, priorityColor, skillColor } from '../lib/utils'
import { SKILL_MAP } from '../data/skills'
import { X } from 'lucide-react'

export const Card = ({ className, children, ...p }) => <div className={cn('card p-4', className)} {...p}>{children}</div>
export const Label = ({ children, className }) => <div className={cn('label', className)}>{children}</div>
export const H2 = ({ children, className }) => <h2 className={cn('text-[15px] font-semibold text-ink tracking-tight', className)}>{children}</h2>

export function PageHeader({ eyebrow, title, subtitle, right }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div>
        {eyebrow && <div className="label mb-1">{eyebrow}</div>}
        <h1 className="text-[22px] font-bold tracking-tight text-ink leading-tight">{title}</h1>
        {subtitle && <p className="text-[13px] text-muted mt-1 max-w-3xl">{subtitle}</p>}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  )
}

export function ProgressRing({ value = 0, size = 56, stroke = 5, color = 'rgb(var(--c-accent))', track = 'rgb(var(--c-line))', children, className }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('relative inline-flex items-center justify-center shrink-0', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (v / 100) * c} style={{ transition: 'stroke-dashoffset .6s ease', filter: v > 0 ? `drop-shadow(0 0 4px ${color}66)` : 'none' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children ?? <span className="num text-[12px] font-semibold">{v}%</span>}</div>
    </div>
  )
}

export function Bar({ value = 0, color = 'rgb(var(--c-accent))', className, height = 6 }) {
  return (
    <div className={cn('w-full bg-line rounded-full overflow-hidden', className)} style={{ height }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
    </div>
  )
}

export function KpiCard({ label, value, sub, ring, ringColor, icon: Icon, accent, onClick, className }) {
  return (
    <div onClick={onClick} className={cn('card p-3.5 flex items-center gap-3 min-h-[92px]', onClick && 'cursor-pointer card-hover', accent && 'border-accent/40', className)}>
      {ring !== undefined && <ProgressRing value={ring} size={52} stroke={4.5} color={ringColor || 'rgb(var(--c-accent))'} />}
      <div className="min-w-0 flex-1">
        <div className="label leading-tight">{label}</div>
        <div className="num text-[19px] font-bold leading-tight mt-0.5 text-ink break-words" title={String(value)}>{value}</div>
        {sub && <div className="text-[11.5px] text-muted mt-0.5 line-clamp-2 leading-snug">{sub}</div>}
      </div>
      {Icon && <Icon size={16} className="text-muted shrink-0" />}
    </div>
  )
}

export const Chip = ({ children, className, color }) => (
  <span className={cn('chip', className)} style={color ? { color, borderColor: color + '55', background: color + '14' } : undefined}>{children}</span>
)
export const PriorityChip = ({ p }) => <span className={cn('chip', priorityColor(p))}>{p}</span>
export const SkillChip = ({ skill }) => { const c = skillColor(skill); return <Chip color={c}>{SKILL_MAP[skill]?.name?.split(' ')[0] || skill}</Chip> }
export const TypeChip = ({ type }) => { const m = { Learning: '#4fb7f5', Practice: '#3ddc97', Project: '#a99cff', Revision: '#b4b4c6', Interview: '#f06a6a' }; return <Chip color={m[type] || '#7c7c92'}>{type}</Chip> }

export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div className={cn('flex gap-1 overflow-x-auto pb-1 -mb-1', className)}>
      {tabs.map((t) => { const k = typeof t === 'string' ? t : t.key; const l = typeof t === 'string' ? t : t.label; return <button key={k} onClick={() => onChange(k)} className={cn('tab', value === k && 'tab-active')}>{l}</button> })}
    </div>
  )
}

export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 pt-[8vh]" onMouseDown={onClose}>
      <div className={cn('card w-full max-h-[84vh] overflow-y-auto animate-fadeIn', wide ? 'max-w-3xl' : 'max-w-xl')} onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-line sticky top-0 bg-card z-10">
          <div className="text-[14px] font-semibold">{title}</div>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={16} /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

export function Field({ label, children, className }) {
  return <label className={cn('block', className)}><div className="label mb-1">{label}</div>{children}</label>
}

export function Empty({ text, action }) {
  return <div className="text-center text-muted text-[13px] py-8 border border-dashed border-line rounded-xl">{text}{action && <div className="mt-2">{action}</div>}</div>
}

export function Stepper({ value, onChange, min = 0, max = 999, step = 1, suffix }) {
  return (
    <div className="inline-flex items-center border border-line rounded-lg overflow-hidden bg-panel">
      <button className="px-2 py-1 text-muted hover:text-ink hover:bg-raised" onClick={() => onChange(Math.max(min, value - step))}>−</button>
      <span className="num px-2 text-[13px] min-w-[3ch] text-center">{value}{suffix}</span>
      <button className="px-2 py-1 text-muted hover:text-ink hover:bg-raised" onClick={() => onChange(Math.min(max, value + step))}>+</button>
    </div>
  )
}

export function Confidence({ value = 0, onChange, size = 'md' }) {
  return (
    <div className="inline-flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onChange(n)} className={cn('rounded font-mono border transition-colors', size === 'sm' ? 'w-6 h-6 text-[11px]' : 'w-7 h-7 text-[12px]', value >= n ? (n >= 4 ? 'bg-ok/20 border-ok/50 text-ok' : n >= 3 ? 'bg-warn/20 border-warn/50 text-warn' : 'bg-bad/20 border-bad/50 text-bad') : 'border-line text-muted hover:border-line2')}>{n}</button>
      ))}
    </div>
  )
}

export function ExternalLink({ href, children, className }) {
  if (!href) return <span className={cn('text-muted', className)}>{children}</span>
  const internal = href.startsWith('/')
  if (internal) return <a href={'#' + href} className={cn('text-accent-glow hover:underline', className)}>{children}</a>
  return <a href={href} target="_blank" rel="noreferrer" className={cn('text-accent-glow hover:underline', className)}>{children}</a>
}

export function Checkbox({ checked, onChange, label, sub, className }) {
  return (
    <label className={cn('flex items-start gap-2.5 cursor-pointer group', className)}>
      <input type="checkbox" className="checkbox mt-0.5" checked={!!checked} onChange={onChange} />
      <span className="min-w-0">
        <span className={cn('text-[13px] leading-snug', checked ? 'text-muted line-through' : 'text-ink')}>{label}</span>
        {sub && <span className="block text-[11.5px] text-muted">{sub}</span>}
      </span>
    </label>
  )
}

export function Collapsible({ title, children, defaultOpen = false, right }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-line rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3 py-2 bg-raised/50 hover:bg-raised text-left">
        <span className="text-[13px] font-medium">{title}</span>
        <span className="flex items-center gap-2">{right}<span className="text-muted text-[11px]">{open ? '−' : '+'}</span></span>
      </button>
      {open && <div className="p-3">{children}</div>}
    </div>
  )
}
