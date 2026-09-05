import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Save, Sliders, CheckCircle2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { PageHeader, Card, Label, Bar, Chip, H2, Field, Checkbox, ProgressRing } from '../components/ui'
import TaskCard from '../components/TaskCard'
import { addDays, startOfWeek, fmtShort, DAY_SHORT, monthKey, fmtMed, dow } from '../lib/dates'
import { hrs, skillColor, cn } from '../lib/utils'
import { getWeek, weekNumberFor, weekStartFor, tasksForDate, isDone, getMonth } from '../engine/tasks'
import { weekStats, readiness, projectsSummary, interviewStats } from '../engine/scoring'
import { SKILL_MAP } from '../data/skills'
import { MONTHS, WEEKS } from '../data/roadmap'

// ---------------- WEEKLY ----------------
function DayRow({ date, isToday, defaultOpen, count, done, mins, children }) {
  const [open, setOpen] = useState(defaultOpen)
  const pct = count ? Math.round((done / count) * 100) : 0
  return (
    <div className="border-t border-line/70 first:border-t-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-4 px-5 py-2.5 text-left hover:bg-raised/30">
        <span className="text-muted text-[11px] w-3">{open ? '▾' : '▸'}</span>
        <span className={cn('text-[13px] font-semibold w-28', isToday ? 'text-accent-glow' : 'text-ink')}>{DAY_SHORT[dow(date)]} {fmtShort(date)}{isToday && <span className="text-[10px] text-muted font-normal ml-1">today</span>}</span>
        <span className="num text-[12px] text-muted w-20">{done} / {count} tasks</span>
        <span className="num text-[12px] text-muted w-14">{hrs(mins)}</span>
        <span className="flex-1 h-1.5 rounded-full bg-line overflow-hidden max-w-[220px]"><span className="block h-full bg-accent" style={{ width: `${pct}%` }} /></span>
        <span className="num text-[11px] text-muted w-8 text-right">{pct}%</span>
      </button>
      {open && <div className="px-5 pb-4 pt-1">{children}</div>}
    </div>
  )
}

export function WeeklyPlan() {
  const state = useStore()
  const { saveWeeklyReview, setLaneOverride } = state
  const today = state.today()
  const [n, setN] = useState(weekNumberFor(today))
  const week0 = getWeek(n)
  const ov = state.settings.laneOverrides?.[n]
  const week = ov ? { ...week0, lanes: { ...week0.lanes, ...ov } } : week0
  const ws = weekStartFor(n)
  const stats = useMemo(() => weekStats(state, ws), [state.taskState, state.taskOverrides, state.customTasks, state.hoursLog, ws])
  const [tune, setTune] = useState(false)
  const rev = state.weeklyReviews[ws] || {}
  const [form, setForm] = useState(rev)
  const total = Object.values(week.lanes).reduce((a, b) => a + b, 0)
  const laneDone = useMemo(() => { const m = {}; for (let i = 0; i < 7; i++) for (const t of tasksForDate(addDays(ws, i), state)) if (isDone(t, state)) m[t.skill] = (m[t.skill] || 0) + (t.estMin || 0); return m }, [state.taskState, ws])
  const sqlThisWeek = state.sqlLog.filter((l) => l.date >= ws && l.date < addDays(ws, 7)).reduce((a, l) => a + (l.easy || 0) + (l.medium || 0) + (l.hard || 0), 0)
  const aptThisWeek = state.aptitude.log.filter((l) => l.date >= ws && l.date < addDays(ws, 7)).reduce((a, l) => a + l.solved, 0)
  const ivThisWeek = Object.values(state.interview).filter((x) => x.ratedOn >= ws && x.ratedOn < addDays(ws, 7)).length
  const isCurrent = n === weekNumberFor(today)

  return (
    <div>
      <PageHeader eyebrow="Weekly Plan" title={`${week.code} — ${week.title}`} subtitle={`${fmtMed(ws)} → ${fmtMed(addDays(ws, 6))} · ${week.goal}`} right={
        <div className="flex items-center gap-1"><button className="btn-ghost btn-xs" onClick={() => setN(Math.max(1, n - 1))}><ChevronLeft size={13} /></button><button className="btn-ghost btn-xs" onClick={() => setN(weekNumberFor(today))}>This week</button><button className="btn-ghost btn-xs" onClick={() => setN(n + 1)}><ChevronRight size={13} /></button><button className="btn-subtle btn-xs ml-2" onClick={() => setTune(!tune)}><Sliders size={12} />Adjust hours</button></div>
      } />
      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-2"><H2>Targets — {total}h planned</H2><span className="text-[12px] text-muted">planned · completed · remaining</span></div>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
            {Object.entries(week.lanes).filter(([, h]) => h > 0).sort((a, b) => b[1] - a[1]).map(([lane, h]) => { const d = (laneDone[lane] || 0) / 60; return (
              <div key={lane}>
                <div className="flex justify-between text-[12.5px]"><span className="text-soft">{SKILL_MAP[lane]?.name || lane}</span><span className="num text-muted">{h}h · <span className="text-ink">{d.toFixed(1)}h</span> · {Math.max(0, h - d).toFixed(1)}h left</span></div>
                <Bar value={Math.round((d / h) * 100)} color={skillColor(lane)} className="mt-1" />
                {tune && <input type="range" min={0} max={12} step={0.5} value={week.lanes[lane]} onChange={(e) => setLaneOverride(n, { ...(ov || {}), [lane]: +e.target.value })} className="w-full mt-1 accent-[#7c6cf6]" />}
              </div>
            ) })}
          </div>
          {tune && <div className="text-[11.5px] text-muted mt-3">Project-heavy week? Move hours from learning lanes into Project. Interview week? Raise Interview. Total is now {total}h (default 21h). <button className="text-accent-glow hover:underline" onClick={() => setLaneOverride(n, {})}>Reset to default</button></div>}
        </Card>
        <Card>
          <H2>Week status</H2>
          <div className="flex items-center gap-4 mt-3">
            <ProgressRing value={stats.pct} size={68} stroke={6} />
            <div className="text-[12.5px] space-y-1"><div><span className="text-muted">Tasks</span> <span className="num">{stats.done} / {stats.total}</span></div><div><span className="text-muted">Hours</span> <span className="num">{stats.hoursDone} / {state.settings.weeklyHours}</span></div><div><span className="text-muted">Remaining</span> <span className="num">{stats.total - stats.done} tasks</span></div></div>
          </div>
          <div className="grid grid-cols-7 gap-1 mt-3">
            {stats.perDay.map((d, i) => <Link to="/today" key={d.date} className={cn('rounded-md border p-1 text-center', d.date === today ? 'border-accent/60 bg-accent/10' : 'border-line bg-raised/50')}><div className="text-[10px] text-muted">{DAY_SHORT[dow(d.date)]}</div><div className="num text-[12px] font-semibold">{d.done}/{d.total}</div></Link>)}
          </div>
        </Card>
      </div>

      <Card className="mb-4">
        <H2>Topics this week</H2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-2">{week.topics.map((t, i) => <div key={t} className="text-[12.5px] text-soft bg-raised/60 border border-line rounded-md px-2.5 py-1.5 flex gap-2"><span className="num text-muted">{String(i + 1).padStart(2, '0')}</span>{t}</div>)}</div>
        {Object.keys(week.secondary || {}).length > 0 && <div className="mt-3 flex flex-wrap gap-2 text-[12px]">{Object.entries(week.secondary).map(([k, v]) => <span key={k} className="text-muted"><span style={{ color: skillColor(k) }} className="font-medium">{SKILL_MAP[k]?.name || k}:</span> {v.join(' · ')}</span>)}</div>}
        <div className="mt-2 text-[12px]">Primary resource: <a className="text-accent-glow hover:underline" href={week.resource.url} target="_blank" rel="noreferrer">{week.resource.name}</a></div>
      </Card>

      <div className="card overflow-hidden mb-4">
        <div className="px-5 py-3 border-b border-line flex items-center justify-between"><H2>Day by day</H2><span className="text-[12px] text-muted">Click a day to expand its tasks · checkboxes work here too</span></div>
        {stats.perDay.map((d) => { const ts = tasksForDate(d.date, state); const done = ts.filter((t) => isDone(t, state)).length; const isT = d.date === today; return (
          <DayRow key={d.date} date={d.date} isToday={isT} defaultOpen={isT} count={ts.length} done={done} mins={d.minsPlanned}>
            <div className="space-y-2">{ts.map((t) => <TaskCard key={t.id} task={t} compact />)}{!ts.length && <div className="text-[12.5px] text-muted">Rest day — nothing scheduled.</div>}</div>
          </DayRow>
        ) })}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3"><H2>Weekly Review — {week.code}</H2>{rev.savedAt && <Chip className="text-ok border-ok/40 bg-ok/10"><CheckCircle2 size={11} />saved {rev.savedAt}</Chip>}</div>
        <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4 text-[12.5px]">
          {[['Tasks', `${stats.done} / ${stats.total}`], ['Hours', `${stats.hoursDone} / ${state.settings.weeklyHours}`], ['SQL', `${sqlThisWeek} questions`], ['Aptitude', `${aptThisWeek} questions`], ['Project', `${Math.round(projectsSummary(state).reduce((a, p) => a + p.pct, 0) / 3)}%`], ['Interview', `${ivThisWeek} rated`]].map(([k, v]) => <div key={k} className="bg-raised/60 border border-line rounded-md px-2.5 py-2"><Label>{k}</Label><div className="num font-semibold mt-0.5">{v}</div></div>)}
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {[['achieved', 'What did you actually achieve?'], ['hardest', 'Which topic was hardest?'], ['moveNext', 'What should be moved to next week?'], ['improved', 'What improved?'], ['weak', 'What remained weak?'], ['mistake', 'Biggest mistake?'], ['priority', 'What should be prioritized next week?']].map(([k, l]) => <Field key={k} label={l}><textarea rows={2} className="input" value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></Field>)}
        </div>
        <button className="btn-primary mt-3" onClick={() => saveWeeklyReview(ws, { ...form, savedAt: today })}><Save size={13} />Save review</button>
      </Card>
    </div>
  )
}

// ---------------- MONTHLY ----------------
export function MonthlyPlan() {
  const state = useStore()
  const today = state.today()
  const [key, setKey] = useState(monthKey(today))
  const idx = Math.max(0, MONTHS.findIndex((m) => m.key === key))
  const m = MONTHS[idx]
  const weeks = WEEKS.filter((w) => w.month === m.key)
  const rev = state.monthlyReviews[m.key] || {}
  const [form, setForm] = useState(rev)
  const r = readiness(state)
  const monthDone = useMemo(() => { const t = rev.targets || {}; return Object.values(t).filter(Boolean).length }, [rev])
  return (
    <div>
      <PageHeader eyebrow="Monthly Plan" title={m.name} subtitle={m.title} right={<div className="flex items-center gap-1"><button className="btn-ghost btn-xs" disabled={idx === 0} onClick={() => setKey(MONTHS[idx - 1].key)}><ChevronLeft size={13} /></button><button className="btn-ghost btn-xs" onClick={() => setKey(monthKey(today))}>This month</button><button className="btn-ghost btn-xs" disabled={idx === MONTHS.length - 1} onClick={() => setKey(MONTHS[idx + 1].key)}><ChevronRight size={13} /></button></div>} />
      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <Label>Primary goal</Label><div className="text-[16px] font-semibold mt-1">{m.primary}</div>
          <Label className="mt-4">Secondary goals</Label>
          <ul className="mt-1 space-y-1">{m.secondary.map((s) => <li key={s} className="text-[13px] text-soft flex gap-2"><span className="text-accent-glow">›</span>{s}</li>)}</ul>
          <div className="mt-4 flex flex-wrap gap-2"><Chip className="text-accent-glow border-accent/40 bg-accent/10">{m.phase}</Chip><Chip className="text-soft border-line2 bg-raised">{m.mode.replace('_', ' ')} MODE</Chip></div>
        </Card>
        <Card>
          <Label>Targets — {monthDone} / {m.targets.length}</Label>
          <div className="mt-2 space-y-2">{m.targets.map((t) => <Checkbox key={t} label={t} checked={rev.targets?.[t]} onChange={() => state.saveMonthlyReview(m.key, { ...rev, targets: { ...(rev.targets || {}), [t]: !rev.targets?.[t] } })} />)}</div>
          <Bar value={Math.round((monthDone / m.targets.length) * 100)} className="mt-3" color="#3ddc97" />
        </Card>
      </div>
      {weeks.length > 0 && (
        <Card className="mb-4">
          <H2>Weeks</H2>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3 mt-2">
            {weeks.map((w) => { const st = weekStats(state, weekStartFor(w.n)); return (
              <div key={w.n} className={cn('border rounded-lg p-3', weekNumberFor(today) === w.n ? 'border-accent/50 bg-accent/5' : 'border-line bg-raised/40')}>
                <div className="flex justify-between items-center"><span className="text-[12px] font-semibold" style={{ color: skillColor(w.primary) }}>{w.code}</span><span className="num text-[11px] text-muted">{st.done}/{st.total}</span></div>
                <div className="text-[13px] font-medium mt-0.5">{w.title}</div>
                <div className="text-[11.5px] text-muted mt-1 line-clamp-2">{w.goal}</div>
                <Bar value={st.pct} color={skillColor(w.primary)} className="mt-2" />
              </div>
            ) })}
          </div>
        </Card>
      )}
      <Card>
        <H2>Monthly Review</H2>
        <div className="grid sm:grid-cols-4 gap-2 my-3 text-[12.5px]">{[['Readiness', `${r.total} / 85`], ['Projects', `${r.projects.filter((p) => p.shipped).length} / 3 shipped`], ['SQL problems', state.evidence.sql?.problems || 0], ['Applications', state.applications.length]].map(([k, v]) => <div key={k} className="bg-raised/60 border border-line rounded-md px-2.5 py-2"><Label>{k}</Label><div className="num font-semibold mt-0.5">{v}</div></div>)}</div>
        <div className="grid md:grid-cols-2 gap-3">{[['wins', 'Biggest wins this month'], ['gaps', 'Gaps that remain'], ['change', 'What changes next month?'], ['risk', 'Biggest risk to December readiness']].map(([k, l]) => <Field key={k} label={l}><textarea rows={2} className="input" value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></Field>)}</div>
        <button className="btn-primary mt-3" onClick={() => state.saveMonthlyReview(m.key, { ...rev, ...form, savedAt: today })}><Save size={13} />Save review</button>
      </Card>
    </div>
  )
}
