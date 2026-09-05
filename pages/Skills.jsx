import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Timer, Play, Square, Check, Plus, Lock, Unlock, ExternalLink as Ext } from 'lucide-react'
import { useStore } from '../store/useStore'
import { PageHeader, Card, Label, Bar, Chip, H2, Tabs, Checkbox, Stepper, ProgressRing, Field, Confidence } from '../components/ui'
import { SKILL_MAP, LEVELS } from '../data/skills'
import { skillEvidence } from '../engine/scoring'
import { SQL_CHALLENGES, DAX_CHALLENGES, EXCEL_CHALLENGES, RESOURCES } from '../data/library'
import { QUESTIONS } from '../data/interview'
import { skillColor, cn, pct } from '../lib/utils'
import { diffDays } from '../lib/dates'
import { PROGRAM_START } from '../data/roadmap'

const TABS = ['Learn', 'Practice', 'Interview', 'Project', 'Revision']
const TAB_MAP = { sql: 'SQL', powerbi: 'Power BI', excel: 'Excel', python: 'Python' }

export default function SkillPage() {
  const { id } = useParams()
  const state = useStore()
  const { toggleTopic, addEvidence, logSql, addRevision, setInterview } = state
  const today = state.today()
  const skill = SKILL_MAP[id]
  const [tab, setTab] = useState('Learn')
  const ev = useMemo(() => skillEvidence(id, state), [id, state.topics, state.evidence])
  useEffect(() => setTab('Learn'), [id])
  if (!skill) return <div>Unknown skill</div>
  const color = skill.color
  const sqlLog = state.sqlLog
  const totals = sqlLog.reduce((a, l) => ({ e: a.e + (l.easy || 0), m: a.m + (l.medium || 0), h: a.h + (l.hard || 0), c: a.c + (l.correct || 0), min: a.min + (l.minutes || 0) }), { e: 0, m: 0, h: 0, c: 0, min: 0 })
  const solved = totals.e + totals.m + totals.h
  const acc = solved ? Math.round((totals.c / solved) * 100) : 0
  const avgTime = solved ? Math.round(totals.min / solved) : 0
  const streakDays = useMemo(() => { const days = new Set(sqlLog.map((l) => l.date)); let n = 0, d = today; while (days.has(d)) { n++; d = addDaysLocal(d, -1) } return n }, [sqlLog, today])
  const currentTopic = skill.topics.find((t) => !state.topics[t.id])
  const weak = skill.topics.filter((t) => !state.topics[t.id]).slice(0, 3)
  const challenges = id === 'sql' ? SQL_CHALLENGES : id === 'powerbi' ? DAX_CHALLENGES : id === 'excel' ? EXCEL_CHALLENGES.map((q) => ({ q })) : null
  const dayIdx = Math.max(0, diffDays(PROGRAM_START, today))
  const challenge = challenges ? challenges[dayIdx % challenges.length] : null
  const qs = QUESTIONS.filter((q) => q.tab === TAB_MAP[id])
  const relRes = RESOURCES.filter((r) => r.skill === id)

  return (
    <div>
      <PageHeader eyebrow={`Skill · ${skill.domain}`} title={skill.name} subtitle={`Evidence-based progression: ${LEVELS.join(' → ')}. "Interview Ready" unlocks only when every gate is met — watching a course is not evidence.`} right={<Chip color={color}>{ev.levelName}</Chip>} />

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 mb-4">
        <Stat label="Current level" value={ev.levelName} sub={`${ev.score}% evidence`} />
        <Stat label={id === 'sql' ? 'Questions solved' : 'Problems logged'} value={id === 'sql' ? solved : ev.evidence.problems || 0} sub={id === 'sql' ? `${totals.e}E · ${totals.m}M · ${totals.h}H` : `target ${skill.gates.problems}`} />
        {id === 'sql' && <Stat label="Accuracy" value={`${acc}%`} sub={`avg ${avgTime} min / problem`} />}
        <Stat label="Current topic" value={currentTopic?.name.split(' ')[0] || 'Done'} sub={currentTopic?.name || 'All topics complete'} />
        <Stat label="Weak areas" value={weak.length} sub={weak.map((w) => w.name.split(' ')[0]).join(', ') || 'none'} />
        {id === 'sql' && <Stat label="Practice streak" value={`${streakDays}d`} sub="days with logged problems" />}
        <Stat label="Interview readiness" value={`${ev.checks.find((c) => c.key === 'interview')?.progress ?? 0}%`} sub={`${ev.evidence.interview || 0} / ${skill.gates.interview} interview problems`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-2"><H2>Evidence gates → Interview Ready</H2><span className="text-[12px] text-muted">{ev.checks.filter((c) => c.ok).length} / {ev.checks.length} met</span></div>
          <div className="space-y-2">
            {ev.checks.map((c) => (
              <div key={c.key} className="flex items-center gap-3">
                {c.ok ? <Unlock size={13} className="text-ok shrink-0" /> : <Lock size={13} className="text-muted shrink-0" />}
                <div className="flex-1 min-w-0"><div className="flex justify-between text-[12.5px]"><span className={cn(c.ok ? 'text-ink' : 'text-soft')}>{c.label}</span>{c.target !== undefined && !c.bool && <span className="num text-muted">{c.value} / {c.target}</span>}</div><Bar value={c.progress} color={c.ok ? '#3ddc97' : color} className="mt-1" height={4} /></div>
                {!c.bool && c.key !== 'concepts' && <div className="flex gap-1"><button className="btn-ghost btn-xs" onClick={() => addEvidence(id, c.key, 1)}>+1</button><button className="btn-ghost btn-xs" onClick={() => addEvidence(id, c.key, 5)}>+5</button></div>}
                {c.bool && <button className={cn('btn-xs', c.ok ? 'btn-subtle' : 'btn-ghost')} onClick={() => addEvidence(id, c.key, !c.ok)}>{c.ok ? 'Passed' : 'Mark passed'}</button>}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 mt-3 text-[11px] text-muted">{LEVELS.map((l, i) => <React.Fragment key={l}><span className={cn(i <= ev.level ? 'text-ink font-medium' : '')}>{l}</span>{i < 4 && <span>→</span>}</React.Fragment>)}</div>
        </Card>
        {challenge && (
          <ChallengeCard title={id === 'sql' ? 'SQL Challenge of the Day' : id === 'powerbi' ? 'DAX Challenge of the Day' : 'Excel Mini Challenge'} challenge={challenge} color={color} onDone={(mins, ok) => { if (id === 'sql') logSql({ date: today, platform: 'Challenge', easy: 0, medium: 1, hard: 0, correct: ok ? 1 : 0, minutes: mins, business: 1 }); else { addEvidence(id, 'problems', 1); addEvidence(id, 'business', 1) } if (!ok) addRevision({ title: challenge.q, category: `${skill.name} mistakes`, detail: challenge.hint || '' }) }} />
        )}
      </div>

      <Tabs tabs={TABS} value={tab} onChange={setTab} className="mb-3" />
      {tab === 'Learn' && (
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <H2>Concept checklist — {ev.topicsDone} / {skill.topics.length}</H2>
            <div className="text-[12px] text-muted mb-3">Tick a concept only after: Learn → Practice → Apply → Explain. Each concept maps to a roadmap week.</div>
            <div className="space-y-2">{skill.topics.map((t) => <div key={t.id} className="flex items-center gap-2"><Checkbox label={t.name} checked={state.topics[t.id]} onChange={() => toggleTopic(t.id)} className="flex-1" />{t.week && <Chip className="text-muted border-line2 bg-raised">W{t.week}</Chip>}</div>)}</div>
          </Card>
          <Card>
            <H2>Resources</H2>
            <div className="mt-2 space-y-2">{relRes.map((r) => <a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="block border border-line rounded-md p-2.5 hover:border-line2"><div className="flex items-center justify-between text-[13px] font-medium">{r.name}<Ext size={12} className="text-muted" /></div><div className="text-[11.5px] text-muted">{r.type} · {r.difficulty} · {r.why}</div></a>)}</div>
          </Card>
        </div>
      )}
      {tab === 'Practice' && (id === 'sql' ? <SqlPracticeLog /> : <GenericPractice id={id} color={color} />)}
      {tab === 'Interview' && (
        <Card>
          <H2>{skill.name} interview questions ({qs.length})</H2>
          <div className="text-[12px] text-muted mb-3">Rate your confidence after answering out loud. ≥4 counts as strong. Full bank in the <Link to={`/interviews?tab=${encodeURIComponent(TAB_MAP[id])}`} className="text-accent-glow hover:underline">Interview Center</Link>.</div>
          <div className="space-y-2">{qs.map((q) => { const c = state.interview[q.id] || {}; return <div key={q.id} className="border border-line rounded-md p-2.5 flex flex-wrap items-center gap-2"><div className="flex-1 min-w-[240px]"><div className="text-[13px]">{q.question}</div><div className="text-[11px] text-muted">{q.topic} · {q.difficulty}</div></div><Confidence value={c.confidence} onChange={(v) => { setInterview(q.id, { confidence: v, ratedOn: today }); if (v >= 4 && !(c.confidence >= 4)) addEvidence(id, 'interview', 1) }} size="sm" /></div> })}</div>
        </Card>
      )}
      {tab === 'Project' && (
        <Card>
          <H2>Apply {skill.name} in a flagship project</H2>
          <div className="text-[12.5px] text-soft mt-1">Evidence gate: {skill.gateLabels.project}. Mark the matching project stage in the Project Hub, then increment the gate here.</div>
          <div className="grid md:grid-cols-3 gap-3 mt-3">{['p1', 'p2', 'p3'].map((p) => <Link key={p} to={`/projects/${p}`} className="border border-line rounded-md p-3 hover:border-line2 text-[13px]">{p.toUpperCase()} → open project</Link>)}</div>
          <button className="btn-subtle mt-3" onClick={() => addEvidence(id, 'project', 1)}><Plus size={13} />Log a completed mini-project</button>
        </Card>
      )}
      {tab === 'Revision' && <RevisionQuick category={`${skill.name} mistakes`} />}
    </div>
  )
}

function addDaysLocal(s, n) { const [y, m, d] = s.split('-').map(Number); const dt = new Date(y, m - 1, d + n); return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}` }

function Stat({ label, value, sub }) { return <div className="card p-3"><Label>{label}</Label><div className="num text-[17px] font-bold mt-0.5 truncate">{value}</div><div className="text-[11px] text-muted truncate">{sub}</div></div> }

export function ChallengeCard({ title, challenge, color, onDone, minutes = 30 }) {
  const [running, setRunning] = useState(false)
  const [start, setStart] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [phase, setPhase] = useState('idle') // idle | running | submitted
  useEffect(() => { if (!running) return; const i = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000); return () => clearInterval(i) }, [running, start])
  const left = Math.max(0, minutes * 60 - elapsed)
  const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0')
  return (
    <Card className="border-l-2" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between"><Label>{title}</Label><span className={cn('num text-[15px] font-bold', left < 300 && running ? 'text-bad' : 'text-ink')}><Timer size={13} className="inline mr-1 -mt-0.5" />{mm}:{ss}</span></div>
      <div className="text-[14px] font-medium mt-2 leading-snug">{challenge.q}</div>
      {challenge.hint && phase === 'submitted' && <div className="text-[12px] text-muted mt-1">Hint / approach: {challenge.hint}</div>}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {phase === 'idle' && <button className="btn-primary btn-xs" onClick={() => { setStart(Date.now()); setRunning(true); setPhase('running') }}><Play size={11} />Start</button>}
        {phase === 'running' && <button className="btn-subtle btn-xs" onClick={() => { setRunning(false); setPhase('submitted') }}><Square size={11} />Submit</button>}
        {phase === 'submitted' && <><button className="btn-primary btn-xs" onClick={() => { onDone(Math.max(1, Math.round(elapsed / 60)), true); setPhase('done') }}><Check size={11} />Solved — mark reviewed</button><button className="btn-ghost btn-xs" onClick={() => { onDone(Math.max(1, Math.round(elapsed / 60)), false); setPhase('done') }}>Couldn't solve → add to revision</button></>}
        {phase === 'done' && <span className="text-[12px] text-ok">Logged. Come back tomorrow for a new challenge.</span>}
      </div>
    </Card>
  )
}

function SqlPracticeLog() {
  const state = useStore()
  const { logSql } = state
  const today = state.today()
  const [f, setF] = useState({ platform: 'DataLemur', easy: 0, medium: 0, hard: 0, correct: 0, minutes: 0, business: 0, interview: 0 })
  const total = f.easy + f.medium + f.hard
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card>
        <H2>Log a practice session</H2>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Field label="Platform" className="col-span-2"><select className="input" value={f.platform} onChange={(e) => setF({ ...f, platform: e.target.value })}>{['DataLemur', 'StrataScratch', 'LeetCode SQL', 'Mode SQL', 'HackerRank', 'Other'].map((p) => <option key={p}>{p}</option>)}</select></Field>
          {[['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard'], ['correct', 'Correct (first try)'], ['minutes', 'Total minutes'], ['business', 'Business problems'], ['interview', 'Interview problems']].map(([k, l]) => <Field key={k} label={l}><input type="number" min={0} className="input" value={f[k]} onChange={(e) => setF({ ...f, [k]: Math.max(0, +e.target.value) })} /></Field>)}
        </div>
        <button className="btn-primary mt-3 w-full justify-center" disabled={!total} onClick={() => { logSql({ date: today, ...f, correct: Math.min(f.correct, total) }); setF({ ...f, easy: 0, medium: 0, hard: 0, correct: 0, minutes: 0, business: 0, interview: 0 }) }}><Plus size={13} />Log {total} problem{total === 1 ? '' : 's'}</button>
        <div className="text-[11.5px] text-muted mt-2">Updates: questions solved, accuracy, avg time, evidence gates, XP, streak.</div>
      </Card>
      <Card className="lg:col-span-2">
        <H2>Session history</H2>
        {state.sqlLog.length === 0 && <div className="text-muted text-[13px] mt-2">No sessions yet. Your first DataLemur session goes here.</div>}
        <div className="mt-2 divide-y divide-line">{state.sqlLog.slice(0, 20).map((l) => <div key={l.id} className="py-2 flex flex-wrap items-center gap-3 text-[12.5px]"><span className="num text-muted w-24">{l.date}</span><span className="font-medium w-28">{l.platform}</span><span className="num">{l.easy}E · {l.medium}M · {l.hard}H</span><span className="num text-muted">acc {(l.easy + l.medium + l.hard) ? Math.round((l.correct / (l.easy + l.medium + l.hard)) * 100) : 0}%</span><span className="num text-muted">{l.minutes} min</span>{l.business > 0 && <Chip className="text-info border-info/40 bg-info/10">{l.business} business</Chip>}{l.interview > 0 && <Chip className="text-bad border-bad/40 bg-bad/10">{l.interview} interview</Chip>}</div>)}</div>
      </Card>
    </div>
  )
}

function GenericPractice({ id, color }) {
  const state = useStore()
  const { addEvidence } = state
  const ev = state.evidence[id] || {}
  const lists = { powerbi: DAX_CHALLENGES.map((c) => c.q), excel: EXCEL_CHALLENGES, python: ['Read a CSV, show shape, dtypes, nulls per column', 'Clean: strip whitespace, parse dates, drop exact duplicates', 'GroupBy month → revenue, orders, AOV', 'Merge orders with customers; validate one_to_many', 'Pivot: category × month revenue table', 'Datetime: days between first and second purchase per user', 'Plot monthly revenue with Matplotlib (labelled axes)', 'Write a script that processes every CSV in a folder and writes an Excel summary', 'Flag outliers with z-score per customer', 'Compute cohort retention table in Pandas'] }
  const items = lists[id] || []
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2"><H2>Challenge list</H2><div className="mt-2 space-y-1.5">{items.map((q, i) => <div key={i} className="flex items-center gap-2 text-[13px] border border-line rounded-md px-2.5 py-1.5"><span className="num text-muted w-6">{String(i + 1).padStart(2, '0')}</span><span className="flex-1">{q}</span><button className="btn-ghost btn-xs" onClick={() => addEvidence(id, 'problems', 1)}><Check size={11} />Done</button></div>)}</div></Card>
      <Card><H2>Counters</H2><div className="mt-3 space-y-3">{[['problems', 'Problems / challenges'], ['business', 'Business applications'], ['interview', 'Interview problems'], ['project', 'Mini-projects']].map(([k, l]) => <div key={k} className="flex items-center justify-between"><span className="text-[13px] text-soft">{l}</span><Stepper value={ev[k] || 0} onChange={(v) => addEvidence(id, k, v - (ev[k] || 0))} /></div>)}</div></Card>
    </div>
  )
}

export function RevisionQuick({ category }) {
  const state = useStore()
  const { addRevision, reviewRevision } = state
  const today = state.today()
  const [t, setT] = useState(''); const [d, setD] = useState('')
  const items = state.revision.filter((r) => r.category === category && !r.retired)
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card><H2>Log a mistake</H2><div className="text-[12px] text-muted mb-2">Every mistake becomes a spaced-repetition item: 1 → 3 → 7 → 14 → 30 days.</div><Field label="What went wrong"><input className="input" value={t} onChange={(e) => setT(e.target.value)} /></Field><Field label="Correct approach" className="mt-2"><textarea rows={3} className="input" value={d} onChange={(e) => setD(e.target.value)} /></Field><button className="btn-primary mt-3" disabled={!t} onClick={() => { addRevision({ title: t, category, detail: d }); setT(''); setD('') }}><Plus size={13} />Add to revision</button></Card>
      <Card className="lg:col-span-2"><H2>{category} ({items.length})</H2><div className="mt-2 space-y-2">{items.map((r) => <div key={r.id} className="border border-line rounded-md p-2.5"><div className="flex items-center justify-between gap-2"><div className="text-[13px] font-medium">{r.title}</div><span className={cn('num text-[11px]', r.nextReview <= today ? 'text-warn' : 'text-muted')}>due {r.nextReview}</span></div>{r.detail && <div className="text-[12px] text-muted mt-0.5">{r.detail}</div>}{r.nextReview <= today && <div className="flex gap-1.5 mt-2"><button className="btn-subtle btn-xs" onClick={() => reviewRevision(r.id, true)}>Recalled ✓</button><button className="btn-ghost btn-xs" onClick={() => reviewRevision(r.id, false)}>Forgot ↺</button></div>}</div>)}{!items.length && <div className="text-muted text-[13px]">No items. Timed challenges you fail land here automatically.</div>}</div></Card>
    </div>
  )
}
