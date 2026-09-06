import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command, CornerDownLeft } from 'lucide-react'
import { useStore } from '../store/useStore'
import { SKILL_TREE } from '../data/skills'
import { RESOURCES, COMPANIES } from '../data/library'
import { QUESTIONS } from '../data/interview'
import { PROJECTS } from '../data/projects'
import { tasksForDate } from '../engine/tasks'
import { cn } from '../lib/utils'

const COMMANDS = [
  { label: "Start today's plan", to: '/today', kw: 'today plan start' },
  { label: 'Open SQL', to: '/skills/sql', kw: 'sql' },
  { label: 'Weekly Showcase', to: '/showcase', kw: 'showcase weekly project mini' },
  { label: 'GitHub — what to push today', to: '/github', kw: 'github push git commit' },
  { label: 'Open Power BI', to: '/skills/powerbi', kw: 'power bi dax' },
  { label: 'Open Excel', to: '/skills/excel', kw: 'excel' },
  { label: 'Start aptitude', to: '/aptitude', kw: 'aptitude quant' },
  { label: 'Open Project Hub', to: '/projects', kw: 'project' },
  { label: 'Add application', to: '/applications?new=1', kw: 'application add job' },
  { label: 'Start interview practice', to: '/interviews', kw: 'interview practice' },
  { label: 'Start revision', to: '/revision', kw: 'revision spaced' },
  { label: 'Open calendar', to: '/calendar', kw: 'calendar' },
  { label: 'Enter catch-up mode', to: '/catch-up', kw: 'catch up overdue' },
  { label: 'Open roadmap', to: '/roadmap', kw: 'roadmap' },
  { label: 'Open Jobs / target companies', to: '/jobs', kw: 'jobs companies apply' },
  { label: 'Open Notes', to: '/notes', kw: 'notes vault metric' },
  { label: 'Open Scratchpad (random notes)', to: '/scratchpad', kw: 'scratch random quick notes jot' },
  { label: 'Weekly plan', to: '/weekly', kw: 'week plan review' },
  { label: 'Progress analytics', to: '/progress', kw: 'progress readiness' },
  { label: 'Settings', to: '/settings', kw: 'settings' },
]

export default function CommandPalette({ open, onClose }) {
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const nav = useNavigate()
  const ref = useRef()
  const state = useStore()
  const today = state.today()
  useEffect(() => { if (open) { setQ(''); setIdx(0); setTimeout(() => ref.current?.focus(), 10) } }, [open])

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    const cmds = COMMANDS.filter((c) => !s || c.label.toLowerCase().includes(s) || c.kw.includes(s)).map((c) => ({ ...c, group: 'Commands' }))
    if (!s) return cmds.slice(0, 12)
    const out = [...cmds.slice(0, 5)]
    const topics = SKILL_TREE.flatMap((sk) => sk.topics.map((t) => ({ label: t.name, sub: sk.name, to: sk.domain === 'domain' ? `/domain/${sk.id}` : sk.id === 'statistics' ? '/statistics' : sk.id === 'aptitude' ? '/aptitude' : sk.id === 'dsa' ? '/dsa' : ['sql', 'excel', 'powerbi', 'python'].includes(sk.id) ? `/skills/${sk.id}` : '/skills/sql', group: 'Topics' }))).filter((t) => t.label.toLowerCase().includes(s)).slice(0, 5)
    const tasks = tasksForDate(today, state).filter((t) => t.title.toLowerCase().includes(s)).map((t) => ({ label: t.title, sub: 'Today', to: '/today', group: 'Tasks' })).slice(0, 4)
    const res = RESOURCES.filter((r) => r.name.toLowerCase().includes(s) || r.skill.includes(s)).map((r) => ({ label: r.name, sub: r.type, href: r.url, group: 'Resources' })).slice(0, 4)
    const proj = PROJECTS.filter((p) => p.name.toLowerCase().includes(s) || p.domain.includes(s)).map((p) => ({ label: p.name, sub: p.code, to: `/projects/${p.id}`, group: 'Projects' }))
    const qs = QUESTIONS.filter((x) => x.question.toLowerCase().includes(s) || x.topic.toLowerCase().includes(s)).map((x) => ({ label: x.question, sub: x.tab, to: `/interviews?tab=${encodeURIComponent(x.tab)}&q=${x.id}`, group: 'Interview questions' })).slice(0, 4)
    const cos = [...COMPANIES, ...state.customCompanies].filter((c) => c.name.toLowerCase().includes(s)).map((c) => ({ label: c.name, sub: c.category, to: '/jobs?tab=companies&q=' + encodeURIComponent(c.name), group: 'Companies' })).slice(0, 4)
    const notes = state.notes.filter((n) => n.title.toLowerCase().includes(s) || (n.formula || '').toLowerCase().includes(s)).map((n) => ({ label: n.title, sub: n.template, to: '/notes?q=' + encodeURIComponent(n.title), group: 'Notes & metrics' })).slice(0, 4)
    const apps = state.applications.filter((a) => (a.company + ' ' + a.role).toLowerCase().includes(s)).map((a) => ({ label: `${a.company} — ${a.role}`, sub: a.status, to: '/applications', group: 'Applications' })).slice(0, 3)
    return [...out, ...tasks, ...topics, ...proj, ...qs, ...notes, ...cos, ...res, ...apps]
  }, [q, state.notes, state.applications, state.customCompanies, today])

  useEffect(() => { setIdx(0) }, [q])
  if (!open) return null
  const go = (r) => { if (r.href) window.open(r.href, '_blank'); else nav(r.to); onClose() }
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(results.length - 1, i + 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)) }
    if (e.key === 'Enter' && results[idx]) go(results[idx])
    if (e.key === 'Escape') onClose()
  }
  let lastGroup = null
  return (
    <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-start justify-center pt-[12vh] p-4" onMouseDown={onClose}>
      <div className="card w-full max-w-2xl overflow-hidden animate-fadeIn" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-line">
          <Command size={16} className="text-accent-glow" />
          <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Type a command or search tasks, topics, questions, metrics, companies…" className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-muted" />
          <span className="kbd">esc</span>
        </div>
        <div className="max-h-[60vh] overflow-y-auto py-1">
          {results.length === 0 && <div className="px-4 py-6 text-muted text-[13px]">No results.</div>}
          {results.map((r, i) => { const showGroup = r.group !== lastGroup; lastGroup = r.group; return (
            <React.Fragment key={i}>
              {showGroup && <div className="label px-4 pt-2 pb-1">{r.group}</div>}
              <button onMouseEnter={() => setIdx(i)} onClick={() => go(r)} className={cn('w-full text-left px-4 py-1.5 flex items-center gap-3 text-[13px]', i === idx ? 'bg-accent/15 text-ink' : 'text-soft')}>
                <span className="flex-1 truncate">{r.label}</span>{r.sub && <span className="text-[11px] text-muted">{r.sub}</span>}{i === idx && <CornerDownLeft size={12} className="text-muted" />}
              </button>
            </React.Fragment>
          ) })}
        </div>
      </div>
    </div>
  )
}
