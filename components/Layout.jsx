import React, { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CalendarCheck, CalendarRange, CalendarDays, Calendar, Map, Database, Table2, BarChart3, Sigma, Code2, Briefcase, Brain, Binary, ShoppingCart, TrendingUp, Landmark, FolderKanban, Layers, Github, Search, ClipboardList, MessageSquare, FileText, Linkedin, Users, Activity, Library, StickyNote, Repeat, LifeBuoy, Settings, Menu, X, Bell, Command, Zap, ChevronRight, Sun, Award, PenLine, Palette } from 'lucide-react'
import { useStore } from '../store/useStore'
import { THEMES } from '../lib/theme'
import { cn } from '../lib/utils'
import { readiness, allSkillEvidence, projectsSummary, completionStats, streak } from '../engine/scoring'
import { reminders } from '../engine/priority'
import CommandPalette from './CommandPalette'
import { getMonthForDate } from '../engine/tasks'

const NAV = [
  { group: 'Overview', items: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/today', label: 'Today', icon: CalendarCheck, key: 'today' },
    { to: '/weekly', label: 'Weekly Plan', icon: CalendarRange },
    { to: '/monthly', label: 'Monthly Plan', icon: CalendarDays },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
  ] },
  { group: 'Learning', items: [
    { to: '/roadmap', label: 'Roadmap', icon: Map, key: 'roadmap' },
    { to: '/skills/sql', label: 'SQL', icon: Database, key: 'sql' },
    { to: '/skills/excel', label: 'Excel', icon: Table2, key: 'excel' },
    { to: '/skills/powerbi', label: 'Power BI', icon: BarChart3, key: 'powerbi' },
    { to: '/statistics', label: 'Statistics', icon: Sigma, key: 'statistics' },
    { to: '/skills/python', label: 'Python', icon: Code2, key: 'python' },
    { to: '/business', label: 'Business Analytics', icon: Briefcase, key: 'business' },
    { to: '/aptitude', label: 'Aptitude', icon: Brain, key: 'aptitude' },
    { to: '/dsa', label: 'DSA Lite', icon: Binary, key: 'dsa' },
  ] },
  { group: 'Domain Tracks', items: [
    { to: '/domain/retail', label: 'Retail / E-Commerce', icon: ShoppingCart, key: 'retail' },
    { to: '/domain/commercial', label: 'Commercial / Revenue', icon: TrendingUp, key: 'commercial' },
    { to: '/domain/bfsi', label: 'BFSI / FinTech', icon: Landmark, key: 'bfsi' },
  ] },
  { group: 'Projects', items: [
    { to: '/projects', label: 'Project Hub', icon: FolderKanban, key: 'projects' },
    { to: '/portfolio', label: 'Portfolio', icon: Layers },
    { to: '/github', label: 'GitHub', icon: Github },
  ] },
  { group: 'Career', items: [
    { to: '/jobs', label: 'Jobs', icon: Search },
    { to: '/applications', label: 'Applications', icon: ClipboardList, key: 'applications' },
    { to: '/interviews', label: 'Interview Center', icon: MessageSquare, key: 'interview' },
    { to: '/resume', label: 'Resume', icon: FileText },
    { to: '/linkedin', label: 'LinkedIn', icon: Linkedin },
    { to: '/networking', label: 'Networking', icon: Users },
  ] },
  { group: 'System', items: [
    { to: '/progress', label: 'Progress', icon: Activity },
    { to: '/differentiation', label: 'Top 1% System', icon: Award },
    { to: '/resources', label: 'Resources', icon: Library },
    { to: '/notes', label: 'Notes', icon: StickyNote },
    { to: '/scratchpad', label: 'Scratchpad', icon: PenLine },
    { to: '/revision', label: 'Revision', icon: Repeat, key: 'revision' },
    { to: '/catch-up', label: 'Catch-Up Mode', icon: LifeBuoy, key: 'catchup' },
    { to: '/settings', label: 'Settings', icon: Settings },
  ] },
]

function useSidebarMetrics() {
  const state = useStore()
  const today = state.today()
  return useMemo(() => {
    const ev = allSkillEvidence(state)
    const ps = projectsSummary(state)
    const cs = completionStats(state, today)
    const r = readiness(state)
    const od = reminders(state, today).find((x) => x.kind === 'overdue')
    const dueRev = (state.revision || []).filter((x) => x.nextReview && x.nextReview <= today && !x.retired).length
    return {
      today: cs.pct, roadmap: r.total, sql: ev.sql.score, excel: ev.excel.score, powerbi: ev.powerbi.score, statistics: ev.statistics.score, python: ev.python.score,
      business: Math.round((ev.retail.score + ev.bfsi.score + ev.commercial.score) / 3), aptitude: r.parts.aptitude, dsa: ev.dsa.score, retail: ev.retail.score, commercial: ev.commercial.score, bfsi: ev.bfsi.score,
      projects: Math.round(ps.reduce((a, p) => a + p.pct, 0) / 3), applications: (state.applications || []).length, interview: r.parts.interview, revision: dueRev, catchup: od ? parseInt(od.text) : 0,
    }
  }, [state.taskState, state.topics, state.evidence, state.projects, state.interview, state.applications, state.revision, state.aptitude, today])
}

function Sidebar({ onNavigate }) {
  const m = useSidebarMetrics()
  const settings = useStore((s) => s.settings)
  return (
    <aside className="w-[236px] shrink-0 h-full bg-panel border-r border-line flex flex-col">
      <div className="px-4 pt-4 pb-3 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-accent to-accent-dim flex items-center justify-center shadow-glow"><Zap size={16} className="text-white" /></div>
          <div className="min-w-0">
            <div className="text-[12px] font-bold tracking-[0.12em] leading-tight">ANALYST<br />COMMAND CENTER</div>
          </div>
        </div>
        <div className="mt-2.5 text-[10px] text-muted leading-snug">Retail • E-Commerce • Commercial • BFSI Analytics Career OS</div>
        <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-card border border-line px-2.5 py-2">
          <div className="h-7 w-7 rounded-md bg-raised flex items-center justify-center text-[11px] font-bold text-accent-glow">{(settings.name || 'A').slice(0, 1).toUpperCase()}</div>
          <div className="min-w-0"><div className="text-[12.5px] font-semibold truncate">{settings.name}</div><div className="text-[10.5px] text-muted truncate">{settings.title}</div></div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {NAV.map((g) => (
          <div key={g.group} className="mb-2">
            <div className="label px-2 py-1.5">{g.group}</div>
            {g.items.map((it) => {
              const v = it.key ? m[it.key] : undefined
              const isCount = ['applications', 'revision', 'catchup'].includes(it.key)
              return (
                <NavLink key={it.to} to={it.to} end={it.end} onClick={onNavigate} className={({ isActive }) => cn('flex items-center gap-2.5 px-2 py-[6px] rounded-md text-[13px] transition-colors group', isActive ? 'bg-accent/15 text-ink border border-accent/30' : 'text-soft hover:bg-raised hover:text-ink border border-transparent')}>
                  <it.icon size={15} className="shrink-0 opacity-80" />
                  <span className="flex-1 truncate">{it.label}</span>
                  {v !== undefined && (isCount ? (v > 0 && <span className={cn('num text-[10px] px-1.5 rounded-full', it.key === 'catchup' ? 'bg-bad/20 text-bad' : 'bg-raised text-muted')}>{v}</span>) : (
                    <span className="flex items-center gap-1"><span className="w-8 h-1 rounded-full bg-line overflow-hidden"><span className="block h-full bg-accent/80" style={{ width: `${v}%` }} /></span><span className="num text-[10px] text-muted w-6 text-right">{v}</span></span>
                  ))}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>
      <div className="px-3 py-2 border-t border-line text-[10px] text-muted flex items-center justify-between"><span>Sept 2026 → May 2027</span><span className="kbd">Ctrl K</span></div>
    </aside>
  )
}

function ThemeButton() {
  const theme = useStore((s) => s.settings.theme || 'midnight')
  const setSettings = useStore((s) => s.setSettings)
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="text-soft hover:text-ink p-1.5" title="Theme"><Palette size={18} /></button>
      {open && (
        <div className="absolute right-0 top-9 w-56 card p-1.5 z-50 animate-fadeIn" onMouseLeave={() => setOpen(false)}>
          <div className="label px-2 py-1">Theme</div>
          {THEMES.map((t) => <button key={t.id} onClick={() => { setSettings({ theme: t.id }); setOpen(false) }} className={cn('w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12.5px] hover:bg-raised', theme === t.id ? 'text-ink bg-raised' : 'text-soft')}><span className="h-4 w-4 rounded-full border border-line2 shrink-0" style={{ background: `linear-gradient(135deg, ${t.swatch[0]} 50%, ${t.swatch[1]} 50%)` }} /><span className="flex-1 text-left">{t.name}</span>{theme === t.id && <span className="text-accent-glow">✓</span>}</button>)}
        </div>
      )}
    </div>
  )
}

function TopBar({ onMenu, onPalette }) {
  const state = useStore()
  const today = state.today()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const rems = useMemo(() => reminders(state, today), [state, today])
  const [open, setOpen] = useState(false)
  const st = useMemo(() => streak(state, today), [state.taskState, state.hoursLog, today])
  const month = getMonthForDate(today)
  return (
    <header className="h-14 shrink-0 border-b border-line bg-panel/80 backdrop-blur flex items-center gap-3 px-3 md:px-5">
      <button className="md:hidden text-soft" onClick={onMenu}><Menu size={20} /></button>
      <button onClick={onPalette} className="flex-1 min-w-0 max-w-xl flex items-center gap-2 bg-card border border-line rounded-lg px-3 py-1.5 text-[13px] text-muted hover:border-line2 text-left">
        <Search size={14} className="shrink-0" /><span className="flex-1 min-w-0 truncate"><span className="sm:hidden">Search…</span><span className="hidden sm:inline">Search SQL topics, projects, questions, metrics, companies…</span></span><span className="kbd hidden sm:inline">Ctrl K</span>
      </button>
      <div className="hidden lg:flex items-center gap-2 text-[11.5px]">
        <span className="chip text-accent-glow border-accent/40 bg-accent/10">{month.mode === 'JOB_SEARCH' ? 'JOB SEARCH MODE' : month.mode === 'LAUNCH' ? 'LAUNCH MODE' : 'LEARNING MODE'}</span>
        <span className="chip text-soft border-line2 bg-raised">{month.phase}</span>
        <span className="chip text-warn border-warn/40 bg-warn/10"><Sun size={11} />{st.current}d streak</span>
      </div>
      <ThemeButton />
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="relative text-soft hover:text-ink p-1.5"><Bell size={18} />{rems.length > 0 && <span className={cn('absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full text-[9.5px] font-bold flex items-center justify-center', rems.some((r) => r.level === 'warn') ? 'bg-bad text-white' : 'bg-accent text-white')}>{rems.length}</span>}</button>
        {open && (
          <div className="absolute right-0 top-9 w-[min(20rem,calc(100vw-1.5rem))] card p-2 z-50 animate-fadeIn" onMouseLeave={() => setOpen(false)}>
            <div className="label px-2 py-1">Reminders</div>
            {rems.length === 0 && <div className="text-[12.5px] text-muted px-2 py-3">All clear. Nothing pending.</div>}
            {rems.map((r, i) => (
              <button key={i} onClick={() => { nav(r.to); setOpen(false) }} className="w-full text-left flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-raised text-[12.5px]">
                <span className={cn('mt-1.5 h-1.5 w-1.5 rounded-full shrink-0', r.level === 'warn' ? 'bg-bad' : 'bg-accent')} /><span className="flex-1 text-soft">{r.text}</span><ChevronRight size={12} className="text-muted mt-1" />
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}

export default function Layout() {
  const [mobile, setMobile] = useState(false)
  const [palette, setPalette] = useState(false)
  const loc = useLocation()
  useEffect(() => { setMobile(false) }, [loc.pathname])
  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette((p) => !p) } }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [])
  return (
    <div className="h-full flex bg-base">
      <div className="hidden md:block h-full"><Sidebar /></div>
      {mobile && (
        <div className="fixed inset-0 z-[70] md:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobile(false)} />
          <div className="absolute left-0 top-0 h-full animate-fadeIn"><Sidebar onNavigate={() => setMobile(false)} /><button onClick={() => setMobile(false)} className="absolute top-3 -right-10 text-ink bg-card border border-line rounded-md p-1.5"><X size={16} /></button></div>
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col h-full">
        <TopBar onMenu={() => setMobile(true)} onPalette={() => setPalette(true)} />
        <main className="flex-1 overflow-y-auto grid-bg">
          <div className="max-w-[1400px] mx-auto p-4 md:p-6 animate-fadeIn" key={loc.pathname}><Outlet /></div>
        </main>
      </div>
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </div>
  )
}
