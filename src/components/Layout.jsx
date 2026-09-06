import React, { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Sparkles, LayoutDashboard, CalendarCheck, CalendarRange, CalendarDays, Calendar, Map, Database, Table2, BarChart3, Sigma, Code2, Briefcase, Brain, Binary, ShoppingCart, TrendingUp, Landmark, FolderKanban, Layers, Github, Search, ClipboardList, MessageSquare, FileText, Linkedin, Users, Activity, Library, StickyNote, Repeat, LifeBuoy, Settings, Menu, X, Bell, Command, Zap, ChevronRight, Sun, Award, PenLine, Palette } from 'lucide-react'
import { useStore } from '../store/useStore'
import { THEMES } from '../lib/theme'
import { cn } from '../lib/utils'
import { streak } from '../engine/scoring'
import { reminders } from '../engine/priority'
import NotificationCenter from './NotificationCenter'
import CommandPalette from './CommandPalette'
import { getMonthForDate, getWeekForDate } from '../engine/tasks'

const NAV = [
  { group: 'Plan', items: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/today', label: 'Today', icon: CalendarCheck },
    { to: '/weekly', label: 'Weekly Plan', icon: CalendarRange },
    { to: '/monthly', label: 'Monthly Plan', icon: CalendarDays },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/roadmap', label: 'Roadmap', icon: Map },
    { to: '/catch-up', label: 'Catch-Up Mode', icon: LifeBuoy, key: 'catchup' },
  ] },
  { group: 'Skills', items: [
    { to: '/skills/sql', label: 'SQL', icon: Database },
    { to: '/skills/excel', label: 'Excel', icon: Table2 },
    { to: '/skills/powerbi', label: 'Power BI', icon: BarChart3 },
    { to: '/statistics', label: 'Statistics', icon: Sigma },
    { to: '/skills/python', label: 'Python', icon: Code2 },
    { to: '/aptitude', label: 'Aptitude', icon: Brain },
    { to: '/dsa', label: 'DSA Lite', icon: Binary },
    { to: '/business', label: 'Business Cases', icon: Briefcase },
    { to: '/domain/retail', label: 'Domain Tracks', icon: Landmark },
  ] },
  { group: 'Build', items: [
    { to: '/showcase', label: 'Weekly Showcase', icon: Sparkles },
    { to: '/projects', label: 'Flagship Projects', icon: FolderKanban },
    { to: '/portfolio', label: 'Portfolio', icon: Layers },
    { to: '/github', label: 'GitHub', icon: Github },
    { to: '/resources', label: 'Resources', icon: Library },
  ] },
  { group: 'Career', items: [
    { to: '/interviews', label: 'Interviews', icon: MessageSquare },
    { to: '/applications', label: 'Applications', icon: ClipboardList, key: 'applications' },
    { to: '/jobs', label: 'Jobs & Companies', icon: Search },
    { to: '/resume', label: 'Resume', icon: FileText },
    { to: '/linkedin', label: 'LinkedIn', icon: Linkedin },
    { to: '/networking', label: 'Networking', icon: Users },
  ] },
  { group: 'System', items: [
    { to: '/progress', label: 'Analytics', icon: Activity },
    { to: '/differentiation', label: 'Top 1% System', icon: Award },
    { to: '/revision', label: 'Revision', icon: Repeat, key: 'revision' },
    { to: '/notes', label: 'Notes', icon: StickyNote },
    { to: '/scratchpad', label: 'Scratchpad', icon: PenLine },
    { to: '/settings', label: 'Settings', icon: Settings },
  ] },
]

function useSidebarMetrics() {
  const state = useStore()
  const today = state.today()
  return useMemo(() => {
    const od = reminders(state, today).find((x) => x.kind === 'overdue')
    const dueRev = (state.revision || []).filter((x) => x.nextReview && x.nextReview <= today && !x.retired).length
    return { applications: (state.applications || []).length, revision: dueRev, catchup: od ? parseInt(od.text) : 0 }
  }, [state.taskState, state.taskOverrides, state.applications, state.revision, today])
}

function Sidebar({ onNavigate }) {
  const m = useSidebarMetrics()
  const settings = useStore((s) => s.settings)
  return (
    <aside className="w-[220px] shrink-0 h-full bg-panel border-r border-line flex flex-col">
      <div className="px-4 pt-4 pb-3 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-md bg-accent flex items-center justify-center text-white text-[12px] font-bold">AC</div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold leading-tight truncate">Analyst Command Center</div>
            <div className="text-[10.5px] text-muted truncate">Sept 2026 → May 2027 · {settings.name}</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {NAV.map((g) => (
          <div key={g.group} className="mb-2">
            <div className="label px-2.5 pt-2 pb-1">{g.group}</div>
            {g.items.map((it) => {
              const v = it.key ? m[it.key] : undefined
              return (
                <NavLink key={it.to} to={it.to} end={it.end} onClick={onNavigate} className={({ isActive }) => cn('flex items-center gap-2.5 px-2.5 py-[6px] rounded-md text-[13px] transition-colors', isActive ? 'bg-accent text-white' : 'text-soft hover:bg-raised hover:text-ink')}>
                  <it.icon size={15} className="shrink-0 opacity-80" />
                  <span className="flex-1 truncate">{it.label}</span>
                  {v > 0 && <span className={cn('num text-[10px] px-1.5 rounded-full', it.key === 'catchup' ? 'bg-bad text-white' : 'bg-raised text-muted')}>{v}</span>}
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
          {THEMES.map((t) => <button key={t.id} onClick={() => { setSettings({ theme: t.id, themeChosen: true }); setOpen(false) }} className={cn('w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12.5px] hover:bg-raised', theme === t.id ? 'text-ink bg-raised' : 'text-soft')}><span className="h-5 w-8 rounded border border-line2 shrink-0" style={{ background: t.preview }} /><span className="flex-1 text-left">{t.name}</span>{theme === t.id && <span className="text-accent-glow">✓</span>}</button>)}
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
  const st = useMemo(() => streak(state, today), [state.taskState, state.hoursLog, today])
  const month = getMonthForDate(today)
  const week = getWeekForDate(today)
  return (
    <header className="theme-header relative z-40 h-14 shrink-0 border-b border-line bg-panel/80 backdrop-blur flex items-center gap-3 px-3 md:px-5">
      <button className="md:hidden text-soft" onClick={onMenu}><Menu size={20} /></button>
      <button onClick={onPalette} className="flex-1 min-w-0 max-w-xl flex items-center gap-2 bg-card border border-line rounded-lg px-3 py-1.5 text-[13px] text-muted hover:border-line2 text-left">
        <Search size={14} className="shrink-0" /><span className="flex-1 min-w-0 truncate"><span className="sm:hidden">Search…</span><span className="hidden sm:inline">Search SQL topics, projects, questions, metrics, companies…</span></span><span className="kbd hidden sm:inline">Ctrl K</span>
      </button>
      <div className="hidden lg:flex items-center gap-2 text-[11.5px]">
        <span className="chip text-soft border-line2 bg-raised">{week.code} · {month.mode === 'JOB_SEARCH' ? 'Job search' : month.phase.replace(/^Phase \d — /, '')}</span>
        <span className="chip text-accent-glow border-accent/40 bg-accent/10">{week.title}</span>
        {st.current > 0 && <span className="chip text-warn border-warn/40 bg-warn/10"><Sun size={11} />{st.current}d streak</span>}
      </div>
      <ThemeButton />
      <NotificationCenter />
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
    <div className="app-shell h-full flex bg-base">
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
