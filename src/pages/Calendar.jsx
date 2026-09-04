import React, { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore'
import { PageHeader, Card, Tabs, Modal, Chip } from '../components/ui'
import TaskCard from '../components/TaskCard'
import { PROGRAM_START } from '../data/roadmap'
import { addDays, startOfWeek, parseISO, toISO, DAY_SHORT, MONTHS, fmtLong, monthKey, fmtShort } from '../lib/dates'
import { skillColor, cn, hrs } from '../lib/utils'
import { tasksForDate, isDone, getWeekForDate, programDayIndex } from '../engine/tasks'
import { prioritize } from '../engine/priority'

const CAT = { Learning: '#4fb7f5', Practice: '#3ddc97', Project: '#a99cff', Aptitude: '#c4b5fd', Interview: '#f06a6a', Application: '#fb923c', Deadline: '#f5b544', Revision: '#b4b4c6' }
const catOf = (t) => (t.skill === 'aptitude' ? 'Aptitude' : t.skill === 'application' ? 'Application' : t.type)

export default function CalendarPage() {
  const state = useStore()
  const today = state.today()
  const [view, setView] = useState('Month')
  const [anchor, setAnchor] = useState(today)
  const [sel, setSel] = useState(null)
  const events = useMemo(() => {
    const ev = {}
    for (const a of state.applications) {
      if (a.interviewDate) (ev[a.interviewDate] ||= []).push({ id: 'iv-' + a.id, cat: 'Interview', title: `Interview: ${a.company} — ${a.role}`, kind: 'event' })
      if (a.deadline) (ev[a.deadline] ||= []).push({ id: 'dl-' + a.id, cat: 'Deadline', title: `Deadline: ${a.company}`, kind: 'event' })
      if (a.nextActionDate) (ev[a.nextActionDate] ||= []).push({ id: 'na-' + a.id, cat: 'Application', title: `${a.company}: ${a.nextAction || 'follow up'}`, kind: 'event' })
    }
    for (const [pid, p] of Object.entries(state.projects)) if (p.deadline) (ev[p.deadline] ||= []).push({ id: 'pd-' + pid, cat: 'Deadline', title: `Project deadline: ${pid.toUpperCase()}`, kind: 'event' })
    for (const r of state.revision) if (r.nextReview && !r.retired) (ev[r.nextReview] ||= []).push({ id: 'rv-' + r.id, cat: 'Revision', title: `Revise: ${r.title}`, kind: 'event' })
    return ev
  }, [state.applications, state.projects, state.revision])

  const dayItems = (d) => [...tasksForDate(d, state).map((t) => ({ ...t, cat: catOf(t) })), ...(events[d] || [])]
  const move = (n) => { const d = parseISO(anchor); if (view === 'Month') d.setMonth(d.getMonth() + n); else if (view === 'Week') d.setDate(d.getDate() + 7 * n); else d.setDate(d.getDate() + n); setAnchor(toISO(d)) }

  const monthGrid = useMemo(() => {
    const d = parseISO(anchor); const first = new Date(d.getFullYear(), d.getMonth(), 1); const start = startOfWeek(toISO(first)); const cells = []
    for (let i = 0; i < 42; i++) cells.push(addDays(start, i))
    return { cells, month: d.getMonth(), year: d.getFullYear() }
  }, [anchor])

  return (
    <div>
      <PageHeader eyebrow="Calendar" title={view === 'Month' ? `${MONTHS[monthGrid.month]} ${monthGrid.year}` : view === 'Week' ? `Week of ${fmtShort(startOfWeek(anchor))}` : fmtLong(anchor)} right={
        <div className="flex items-center gap-2"><Tabs tabs={['Month', 'Week', 'Today']} value={view} onChange={(v) => { setView(v); if (v === 'Today') setAnchor(today) }} /><button className="btn-ghost btn-xs" onClick={() => move(-1)}><ChevronLeft size={13} /></button><button className="btn-ghost btn-xs" onClick={() => setAnchor(today)}>Today</button><button className="btn-ghost btn-xs" onClick={() => move(1)}><ChevronRight size={13} /></button></div>
      } />
      <div className="flex flex-wrap gap-2 mb-3">{Object.entries(CAT).map(([k, c]) => <span key={k} className="text-[11px] text-muted inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: c }} />{k}</span>)}</div>

      {view === 'Month' && (
        <Card className="p-2">
          <div className="grid grid-cols-7 gap-px text-[11px] text-muted mb-1">{DAY_SHORT.map((d) => <div key={d} className="px-2 py-1 label">{d}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">
            {monthGrid.cells.map((d) => { const items = dayItems(d); const inMonth = parseISO(d).getMonth() === monthGrid.month; const done = items.filter((t) => t.kind !== 'event' && isDone(t, state)).length; const tasks = items.filter((t) => t.kind !== 'event').length; const wk = getWeekForDate(d); return (
              <button key={d} onClick={() => { setAnchor(d); setSel(d) }} className={cn('text-left rounded-md border p-1.5 min-h-[92px] hover:border-line2 transition-colors', d === today ? 'border-accent/60 bg-accent/5' : 'border-line bg-raised/30', !inMonth && 'opacity-40')}>
                <div className="flex justify-between items-center"><span className={cn('num text-[12px]', d === today && 'text-accent-glow font-bold')}>{parseISO(d).getDate()}</span>{programDayIndex(d) === 0 && d >= PROGRAM_START && <span className="text-[9px] text-accent-glow">{wk.code}</span>}</div>
                <div className="mt-1 space-y-0.5">
                  {items.slice(0, 4).map((it) => <div key={it.id} className="flex items-center gap-1 text-[10px] truncate" style={{ color: it.kind === 'event' ? CAT[it.cat] : undefined }}><span className="h-1.5 w-1.5 rounded-sm shrink-0" style={{ background: CAT[it.cat] || '#7c7c92' }} /><span className={cn('truncate', it.kind !== 'event' && (isDone(it, state) ? 'text-muted line-through' : 'text-soft'))}>{it.title}</span></div>)}
                  {items.length > 4 && <div className="text-[10px] text-muted">+{items.length - 4} more</div>}
                </div>
                {tasks > 0 && <div className="mt-1 h-0.5 bg-line rounded"><div className="h-full bg-ok rounded" style={{ width: `${(done / tasks) * 100}%` }} /></div>}
              </button>
            ) })}
          </div>
        </Card>
      )}

      {view === 'Week' && (
        <div className="grid md:grid-cols-7 gap-2">
          {Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(anchor), i)).map((d, i) => { const items = dayItems(d); return (
            <Card key={d} className={cn('p-2.5', d === today && 'border-accent/50')}>
              <button onClick={() => setSel(d)} className="w-full text-left"><div className="text-[12px] font-semibold">{DAY_SHORT[i]} <span className="text-muted font-normal">{fmtShort(d)}</span></div></button>
              <div className="mt-2 space-y-1">{items.map((it) => <div key={it.id} className="flex gap-1.5 text-[11.5px] leading-snug"><span className="h-1.5 w-1.5 rounded-sm mt-1.5 shrink-0" style={{ background: CAT[it.cat] || '#7c7c92' }} /><span className={cn(it.kind === 'event' ? 'font-medium' : isDone(it, state) ? 'text-muted line-through' : 'text-soft')} style={it.kind === 'event' ? { color: CAT[it.cat] } : undefined}>{it.title}</span></div>)}</div>
            </Card>
          ) })}
        </div>
      )}

      {view === 'Today' && <DayDetail date={anchor} state={state} events={events[anchor] || []} />}

      <Modal open={!!sel} onClose={() => setSel(null)} title={sel ? fmtLong(sel) : ''} wide>
        {sel && <DayDetail date={sel} state={state} events={events[sel] || []} />}
      </Modal>
    </div>
  )
}

function DayDetail({ date, state, events }) {
  const ranked = prioritize(tasksForDate(date, state), state, state.today())
  return (
    <div className="space-y-2">
      {events.map((e) => <div key={e.id} className="card p-2.5 text-[13px] font-medium flex items-center gap-2" style={{ borderColor: CAT[e.cat] + '66' }}><span className="h-2 w-2 rounded-sm" style={{ background: CAT[e.cat] }} />{e.title}<Chip color={CAT[e.cat]}>{e.cat}</Chip></div>)}
      {ranked.map((t) => <TaskCard key={t.id} task={t} />)}
      {!ranked.length && !events.length && <div className="text-muted text-[13px]">Nothing scheduled.</div>}
    </div>
  )
}
