import React, { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore'
import { PageHeader, H2 } from '../components/ui'
import TaskCard from '../components/TaskCard'
import { PROGRAM_START } from '../data/roadmap'
import { addDays, startOfWeek, parseISO, toISO, DAY_SHORT, MONTHS, fmtLong, fmtShort } from '../lib/dates'
import { cn, hrs } from '../lib/utils'
import { tasksForDate, isDone, isClosed, getWeekForDate, programDayIndex } from '../engine/tasks'
import { prioritize } from '../engine/priority'

const EVENT_COLOR = { Interview: 'rgb(var(--c-bad))', Deadline: 'rgb(var(--c-warn))', Application: 'rgb(var(--c-info))', Revision: 'rgb(var(--c-muted))' }

// Reference layout: month grid (day number + % complete) on the left, selected day's task list on the right.
export default function CalendarPage() {
  const state = useStore()
  const today = state.today()
  const [anchor, setAnchor] = useState(today)
  const [sel, setSel] = useState(today)

  const events = useMemo(() => {
    const ev = {}
    for (const a of state.applications) {
      if (a.interviewDate) (ev[a.interviewDate] ||= []).push({ id: 'iv-' + a.id, cat: 'Interview', title: `Interview: ${a.company} — ${a.role}` })
      if (a.deadline) (ev[a.deadline] ||= []).push({ id: 'dl-' + a.id, cat: 'Deadline', title: `Deadline: ${a.company}` })
      if (a.nextActionDate) (ev[a.nextActionDate] ||= []).push({ id: 'na-' + a.id, cat: 'Application', title: `${a.company}: ${a.nextAction || 'follow up'}` })
    }
    for (const [pid, p] of Object.entries(state.projects)) if (p.deadline) (ev[p.deadline] ||= []).push({ id: 'pd-' + pid, cat: 'Deadline', title: `Project deadline: ${pid.toUpperCase()}` })
    for (const r of state.revision) if (r.nextReview && !r.retired) (ev[r.nextReview] ||= []).push({ id: 'rv-' + r.id, cat: 'Revision', title: `Revise: ${r.title}` })
    return ev
  }, [state.applications, state.projects, state.revision])

  const grid = useMemo(() => {
    const d = parseISO(anchor); const first = new Date(d.getFullYear(), d.getMonth(), 1); const start = startOfWeek(toISO(first))
    const cells = []; for (let i = 0; i < 42; i++) cells.push(addDays(start, i))
    const rows = cells.length && parseISO(cells[35]).getMonth() !== d.getMonth() ? cells.slice(0, 35) : cells
    return { cells: rows, month: d.getMonth(), year: d.getFullYear() }
  }, [anchor])
  const moveMonth = (n) => { const d = parseISO(anchor); d.setDate(1); d.setMonth(d.getMonth() + n); setAnchor(toISO(d)) }

  const dayStat = (d) => { const ts = tasksForDate(d, state); const done = ts.filter((t) => isDone(t, state)).length; return { total: ts.length, done, pct: ts.length ? Math.round((done / ts.length) * 100) : 0, events: (events[d] || []).length } }
  const monthStat = useMemo(() => { let t = 0, dn = 0; for (const c of grid.cells) { if (parseISO(c).getMonth() !== grid.month) continue; const s = dayStat(c); t += s.total; dn += s.done } return { t, dn } }, [grid, state.taskState, state.taskOverrides, state.customTasks])

  const ranked = prioritize(tasksForDate(sel, state), state, today)
  const selEvents = events[sel] || []
  const selDone = ranked.filter((t) => isClosed(t, state)).length
  const week = getWeekForDate(sel)

  return (
    <div>
      <PageHeader eyebrow="Plan" title="Calendar" subtitle="Daily completion at a glance. Click a day to see its plan." />
      <div className="grid xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-4">
        <div className="card overflow-hidden self-start">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line">
            <button className="btn-ghost btn-xs" onClick={() => moveMonth(-1)}><ChevronLeft size={14} /></button>
            <div className="text-center"><div className="text-[14px] font-semibold">{MONTHS[grid.month]} {grid.year}</div><div className="text-[11px] text-muted num">{monthStat.dn} / {monthStat.t} tasks done this month</div></div>
            <div className="flex gap-1"><button className="btn-ghost btn-xs" onClick={() => { setAnchor(today); setSel(today) }}>Today</button><button className="btn-ghost btn-xs" onClick={() => moveMonth(1)}><ChevronRight size={14} /></button></div>
          </div>
          <div className="grid grid-cols-7 border-b border-line">{DAY_SHORT.map((d) => <div key={d} className="label text-center py-2">{d[0]}</div>)}</div>
          <div className="grid grid-cols-7">
            {grid.cells.map((d, i) => {
              const inMonth = parseISO(d).getMonth() === grid.month
              const s = dayStat(d)
              const isSel = d === sel; const isT = d === today
              const past = d < today
              const weekStart = programDayIndex(d) === 0 && d >= PROGRAM_START
              return (
                <button key={d} onClick={() => setSel(d)} className={cn('relative text-left h-[68px] px-2 py-1.5 border-b border-r border-line/70 transition-colors', i % 7 === 6 && 'border-r-0', !inMonth && 'opacity-35', isSel ? 'bg-accent/15 ring-1 ring-inset ring-accent' : 'hover:bg-raised/40', isT && !isSel && 'bg-raised/30')}>
                  <div className="flex items-start justify-between">
                    <span className={cn('num text-[12.5px] leading-none', isT ? 'text-accent-glow font-bold' : 'text-soft')}>{parseISO(d).getDate()}</span>
                    {weekStart && <span className="text-[9.5px] text-accent-glow font-semibold">{getWeekForDate(d).code}</span>}
                  </div>
                  {s.total > 0 && (
                    <div className="absolute left-2 right-2 bottom-1.5">
                      <div className={cn('num text-[10.5px] leading-none mb-1', s.pct === 100 ? 'text-ok' : past && s.pct < 100 ? 'text-warn' : 'text-muted')}>{s.pct}%</div>
                      <div className="h-[3px] rounded-full bg-line overflow-hidden"><div className={cn('h-full', s.pct === 100 ? 'bg-ok' : 'bg-accent')} style={{ width: `${s.pct}%` }} /></div>
                    </div>
                  )}
                  {s.events > 0 && <div className="absolute right-2 bottom-[22px] flex gap-0.5">{(events[d] || []).slice(0, 3).map((e) => <span key={e.id} className="h-1.5 w-1.5 rounded-full" style={{ background: EVENT_COLOR[e.cat] }} />)}</div>}
                </button>
              )
            })}
          </div>
          <div className="px-4 py-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
            <span className="inline-flex items-center gap-1"><span className="h-1.5 w-4 rounded bg-accent inline-block" />done %</span>
            {Object.entries(EVENT_COLOR).map(([k, c]) => <span key={k} className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: c }} />{k}</span>)}
          </div>
        </div>

        <div className="card overflow-hidden self-start">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line">
            <div><H2>{fmtLong(sel)}</H2><div className="text-[11.5px] text-muted mt-0.5">{sel < PROGRAM_START ? 'Before program start (4 Sep 2026)' : `${week.code} — ${week.title}`}{ranked.length > 0 && ` · ${hrs(ranked.reduce((a, t) => a + (t.estMin || 0), 0))} planned`}</div></div>
            <div className="num text-[12px] text-muted">{selDone}/{ranked.length}</div>
          </div>
          <div className="p-3 space-y-2 max-h-[70vh] overflow-y-auto">
            {selEvents.map((e) => <div key={e.id} className="flex items-center gap-2 px-3 py-2 rounded-md border border-line text-[13px]"><span className="h-2 w-2 rounded-full shrink-0" style={{ background: EVENT_COLOR[e.cat] }} /><span className="flex-1 truncate">{e.title}</span><span className="text-[11px] text-muted">{e.cat}</span></div>)}
            {ranked.map((t) => <TaskCard key={t.id} task={t} />)}
            {!ranked.length && !selEvents.length && <div className="text-muted text-[13px] text-center py-10">Nothing scheduled on {fmtShort(sel)}.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
