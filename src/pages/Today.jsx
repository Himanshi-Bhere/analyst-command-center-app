import React, { useMemo, useState } from 'react'
import { Plus, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore'
import { PageHeader, Card, Label, ProgressRing, Bar, Modal, Field, Chip, Empty } from '../components/ui'
import TaskCard from '../components/TaskCard'
import { fmtLong, addDays, fmtMed } from '../lib/dates'
import { hrs, cn } from '../lib/utils'
import { tasksForDate, isClosed, getWeekForDate } from '../engine/tasks'
import { prioritize } from '../engine/priority'
import { completionStats } from '../engine/scoring'
import { SKILL_TREE, SKILL_MAP } from '../data/skills'

export default function Today() {
  const state = useStore()
  const { addCustomTask, logHours } = state
  const real = state.today()
  const [offset, setOffset] = useState(0)
  const date = addDays(real, offset)
  const [add, setAdd] = useState(false)
  const [form, setForm] = useState({ title: '', skill: 'sql', topic: '', type: 'Practice', difficulty: 'Intermediate', estMin: 30, resourceName: '', resourceUrl: '' })
  const [extra, setExtra] = useState(30)
  const week = getWeekForDate(date)
  const ranked = useMemo(() => prioritize(tasksForDate(date, state), state, real), [state.taskState, state.taskOverrides, state.customTasks, state.evidence, state.topics, state.projects, state.applications, state.interview, date, real])
  const cs = completionStats(state, date)
  const targetMin = Math.round(((state.settings.weeklyHours || 21) * 60) / 7)
  const open = ranked.filter((t) => !isClosed(t, state))
  const closed = ranked.filter((t) => isClosed(t, state))
  const must = open.filter((t) => ['CRITICAL', 'HIGH'].includes(t.priority))
  const should = open.filter((t) => t.priority === 'MEDIUM')
  const can = open.filter((t) => t.priority === 'LOW')
  const logged = state.hoursLog[date] || 0

  const [view, setView] = useState('all')
  const [cat, setCat] = useState('all')
  const cats = useMemo(() => Array.from(new Set(ranked.map((t) => t.type).filter(Boolean))), [ranked])
  const visible = ranked.filter((t) => (view === 'all' ? true : view === 'todo' ? !isClosed(t, state) : isClosed(t, state))).filter((t) => cat === 'all' || t.type === cat)
  const totalMin = ranked.reduce((a, t) => a + (t.estMin || 0), 0)

  return (
    <div className="max-w-[1100px]">
      <PageHeader eyebrow="Plan" title="Today" subtitle="Ranked by the priority engine. Every checkbox updates every metric." right={
        <div className="flex items-center gap-1">
          <button className="btn-ghost btn-xs" onClick={() => setOffset(offset - 1)}><ChevronLeft size={13} /></button>
          <button className="btn-ghost btn-xs" onClick={() => setOffset(0)}>Today</button>
          <button className="btn-ghost btn-xs" onClick={() => setOffset(offset + 1)}><ChevronRight size={13} /></button>
          <button className="btn-primary btn-xs ml-2" onClick={() => setAdd(true)}><Plus size={13} />Add task</button>
        </div>
      } />

      <Card className="mb-4 flex flex-wrap items-center gap-5">
        <ProgressRing value={cs.pct} size={64} stroke={6}><div className="num text-[14px] font-bold">{cs.pct}%</div></ProgressRing>
        <div className="flex-1 min-w-[220px]">
          <div className="text-[16px] font-semibold">{fmtLong(date)} {offset !== 0 && <span className="text-muted text-[12px] font-normal">({offset > 0 ? '+' : ''}{offset}d)</span>}</div>
          <div className="text-[12.5px] text-muted mt-0.5">{week.code} — {week.title} · {ranked[0]?.dayTemplate}</div>
        </div>
        <div className="grid grid-cols-3 gap-6 text-[12.5px]">
          <div><Label>Tasks</Label><div className="num text-[16px] font-semibold">{cs.done} <span className="text-muted text-[12px]">/ {cs.total}</span></div></div>
          <div><Label>Hours</Label><div className="num text-[16px] font-semibold">{hrs(cs.minsDone + logged)} <span className="text-muted text-[12px]">/ {hrs(Math.max(targetMin, totalMin))}</span></div></div>
          <div><Label>Must-do open</Label><div className={cn('num text-[16px] font-semibold', must.length ? 'text-bad' : 'text-ok')}>{must.length}</div></div>
        </div>
        <div className="flex items-center gap-2 text-[12px] w-full sm:w-auto"><Clock size={13} className="text-muted" /><span className="text-muted">Log extra</span><input type="number" className="input w-20 py-1" value={extra} onChange={(e) => setExtra(+e.target.value)} /><button className="btn-ghost btn-xs" onClick={() => logHours(date, extra)}>+ min</button></div>
      </Card>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="flex gap-1">{[['all', 'All'], ['todo', 'To do'], ['done', 'Done']].map(([k, l]) => <button key={k} onClick={() => setView(k)} className={cn('tab', view === k && 'tab-active')}>{l}</button>)}</div>
        <select className="input w-auto py-1 text-[12.5px]" value={cat} onChange={(e) => setCat(e.target.value)}><option value="all">All categories</option>{cats.map((c) => <option key={c}>{c}</option>)}</select>
        <span className="text-[12px] text-muted ml-auto">{visible.length} shown · {open.length} open · {closed.length} done</span>
      </div>

      {ranked.length === 0 && <Empty text="No tasks scheduled for this day." />}
      {view === 'all' && cat === 'all' ? (
        <>
          <Section title="Must do" tone="bad" tasks={must} />
          <Section title="Should do" tone="info" tasks={should} />
          <Section title="Can postpone" tone="muted" tasks={can} />
          {closed.length > 0 && <Section title="Done" tone="ok" tasks={closed} compact />}
        </>
      ) : (
        <div className="space-y-2">{visible.map((t) => <TaskCard key={t.id} task={t} compact={isClosed(t, state)} />)}{!visible.length && ranked.length > 0 && <Empty text="Nothing matches this filter." />}</div>
      )}

      <Modal open={add} onClose={() => setAdd(false)} title="Add a custom task">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Task" className="sm:col-span-2"><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Solve 5 SQL ranking questions" /></Field>
          <Field label="Skill"><select className="input" value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })}>{SKILL_TREE.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}<option value="application">Applications</option></select></Field>
          <Field label="Topic"><input className="input" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} /></Field>
          <Field label="Type"><select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{['Learning', 'Practice', 'Project', 'Revision', 'Interview'].map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Difficulty"><select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>{['Beginner', 'Intermediate', 'Advanced'].map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Estimated (min)"><input type="number" className="input" value={form.estMin} onChange={(e) => setForm({ ...form, estMin: +e.target.value })} /></Field>
          <Field label="Resource name"><input className="input" value={form.resourceName} onChange={(e) => setForm({ ...form, resourceName: e.target.value })} placeholder="DataLemur" /></Field>
          <Field label="Resource URL" className="sm:col-span-2"><input className="input" value={form.resourceUrl} onChange={(e) => setForm({ ...form, resourceUrl: e.target.value })} placeholder="https://" /></Field>
        </div>
        <div className="flex justify-end gap-2 mt-4"><button className="btn-ghost" onClick={() => setAdd(false)}>Cancel</button><button className="btn-primary" disabled={!form.title} onClick={() => { addCustomTask({ title: form.title, skill: form.skill, topic: form.topic || SKILL_MAP[form.skill]?.name, type: form.type, difficulty: form.difficulty, estMin: form.estMin, resource: { name: form.resourceName, url: form.resourceUrl }, date }); setAdd(false); setForm({ ...form, title: '', topic: '' }) }}>Add</button></div>
      </Modal>
    </div>
  )
}

function Section({ title, tone, tasks, compact }) {
  if (!tasks.length) return null
  const total = tasks.reduce((a, t) => a + (t.estMin || 0), 0)
  const c = { bad: 'text-bad', info: 'text-info', muted: 'text-muted', ok: 'text-ok' }[tone]
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2"><span className={cn('label', c)}>{title}</span><span className="num text-[11px] text-muted">{tasks.length} · {hrs(total)}</span><div className="flex-1 h-px bg-line" /></div>
      <div className="space-y-2">{tasks.map((t) => <TaskCard key={t.id} task={t} compact={compact} />)}</div>
    </div>
  )
}
