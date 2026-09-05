import React, { useMemo, useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ResponsiveContainer, BarChart, Bar as RBar, XAxis, YAxis, Tooltip, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, CartesianGrid } from 'recharts'
import { Plus, Trash2, ExternalLink as Ext, Download, Upload, RotateCcw, Award, CheckCircle2, ArrowRight, Wand2, Search, Pencil } from 'lucide-react'
import { useStore } from '../store/useStore'
import { PageHeader, Card, Label, Bar, Chip, H2, Tabs, Field, Checkbox, ProgressRing, PriorityChip, SkillChip, Empty, Collapsible, Modal } from '../components/ui'
import TaskCard from '../components/TaskCard'
import { READINESS_LABELS, readiness, domainReadiness, streak, weekStats, xpAndLevel, badges, differentiation, allSkillEvidence, projectsSummary, interviewStats } from '../engine/scoring'
import { catchUpPlan } from '../engine/priority'
import { RESOURCES, NOTE_TEMPLATES } from '../data/library'
import { SKILL_MAP, SKILL_TREE } from '../data/skills'
import { weekStartFor, weekNumberFor } from '../engine/tasks'
import { skillColor, cn, hrs, pct } from '../lib/utils'
import { THEMES } from '../lib/theme'
import { fmtShort, addDays, diffDays } from '../lib/dates'
import { REVISION_INTERVALS } from '../store/useStore'

const tip = { contentStyle: { background: 'rgb(var(--c-card))', border: '1px solid rgb(var(--c-line2))', borderRadius: 8, fontSize: 12 }, labelStyle: { color: 'rgb(var(--c-soft))' }, itemStyle: { color: 'rgb(var(--c-ink))' } }
const DOMAIN_LABEL = { retail: 'Retail / E-Commerce', bfsi: 'BFSI / FinTech', commercial: 'Commercial / Revenue' }

// ---------------- PROGRESS ----------------
export function ProgressPage() {
  const state = useStore()
  const today = state.today()
  const r = useMemo(() => readiness(state), [state])
  const dr = domainReadiness(state)
  const st = streak(state, today)
  const xp = xpAndLevel(state)
  const bd = badges(state, today)
  const curW = weekNumberFor(today)
  const weekly = useMemo(() => Array.from({ length: Math.min(curW, 16) }, (_, i) => { const n = curW - Math.min(curW, 16) + 1 + i; const ws = weekStats(state, weekStartFor(n)); return { week: `W${n}`, hours: ws.hoursDone, tasks: ws.pct } }), [state.taskState, curW])
  const sqlAcc = useMemo(() => [...state.sqlLog].reverse().slice(-20).map((l, i) => { const n = l.easy + l.medium + l.hard; return { i: i + 1, acc: n ? Math.round((l.correct / n) * 100) : 0, date: l.date.slice(5) } }), [state.sqlLog])
  const aptAcc = useMemo(() => [...state.aptitude.log].reverse().slice(-20).map((l, i) => ({ i: i + 1, acc: l.solved ? Math.round((l.correct / l.solved) * 100) : 0, date: l.date.slice(5) })), [state.aptitude.log])
  const radar = SKILL_TREE.filter((s) => ['sql', 'excel', 'powerbi', 'statistics', 'python', 'retail', 'bfsi', 'commercial', 'aptitude'].includes(s.id)).map((s) => ({ skill: s.name.split(' ')[0], v: r.ev[s.id].score }))
  return (
    <div>
      <PageHeader eyebrow="System" title="Progress Analytics" subtitle="The app is itself an analytics dashboard. Every chart answers one question." right={<Chip className="text-warn border-warn/40 bg-warn/10">Level {xp.level} · {xp.xp} XP · {xp.pct}% to next</Chip>} />
      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-1 border-accent/40">
          <Label>Analytics Job Readiness Score</Label>
          <div className="flex items-center gap-4 mt-2"><ProgressRing value={Math.round((r.total / 100) * 100)} size={96} stroke={8} color={r.total >= 85 ? '#3ddc97' : r.total >= 50 ? '#f5b544' : 'rgb(var(--c-accent))'}><div className="text-center"><div className="num text-[26px] font-bold leading-none">{r.total}</div><div className="text-[10px] text-muted">/ 100</div></div></ProgressRing><div className="text-[12.5px] space-y-1"><div><span className="text-muted">Current</span> <span className="num font-semibold">{r.total}</span></div><div><span className="text-muted">Target</span> <span className="num font-semibold text-ok">85+</span></div><div><span className="text-muted">Gap</span> <span className="num font-semibold text-warn">{Math.max(0, 85 - r.total)} pts</span></div><div className="text-muted">{diffDays(today, '2026-12-31')} days to Dec 31</div></div></div>
          <div className="mt-4"><Label>Why is my score {r.total}?</Label>
            <div className="mt-2 space-y-1.5">{r.breakdown.map((b) => <div key={b.key}><div className="flex justify-between text-[12px]"><span className="text-soft">{READINESS_LABELS[b.key] || b.key} <span className="text-muted">({b.weight}%)</span></span><span className="num"><span className="text-ink">{b.contrib}</span><span className="text-muted"> / {b.max} · −{b.gap}</span></span></div><Bar value={b.score} color={skillColor(b.key)} className="mt-0.5" height={4} /></div>)}</div>
            <div className="text-[11.5px] text-muted mt-2">Biggest lever: <span className="text-ink">{READINESS_LABELS[r.breakdown[0].key]}</span> — closing it fully adds +{r.breakdown[0].gap} pts.</div>
          </div>
        </Card>
        <Card><Label>Skill radar (evidence score)</Label><div className="h-[260px] mt-1"><ResponsiveContainer><RadarChart data={radar} outerRadius="75%"><PolarGrid stroke="rgb(var(--c-line2))" /><PolarAngleAxis dataKey="skill" tick={{ fill: '#b4b4c6', fontSize: 11 }} /><Radar dataKey="v" stroke="rgb(var(--c-accent))" fill="rgb(var(--c-accent))" fillOpacity={0.3} /><Tooltip {...tip} /></RadarChart></ResponsiveContainer></div>
          <Label className="mt-1">Domain readiness</Label><div className="mt-1 space-y-1.5">{['retail', 'commercial', 'bfsi'].map((k) => <div key={k}><div className="flex justify-between text-[12px]"><span className="text-soft">{DOMAIN_LABEL[k]}</span><span className="num">{dr[k]}%</span></div><Bar value={dr[k]} color={skillColor(k)} className="mt-0.5" height={4} /></div>)}</div><div className="text-[11.5px] text-muted mt-2">Fastest route to interview-ready: <span className="text-ink">{DOMAIN_LABEL[dr.best]}</span>.</div></Card>
        <Card><Label>Hours & completion per week</Label><div className="h-[220px] mt-1"><ResponsiveContainer><BarChart data={weekly}><CartesianGrid stroke="rgb(var(--c-line))" vertical={false} /><XAxis dataKey="week" tick={{ fill: 'rgb(var(--c-muted))', fontSize: 11 }} /><YAxis tick={{ fill: 'rgb(var(--c-muted))', fontSize: 11 }} width={28} /><Tooltip {...tip} /><RBar dataKey="hours" name="Hours" fill="rgb(var(--c-accent))" radius={[3, 3, 0, 0]} /><RBar dataKey="tasks" name="Tasks %" fill="#3ddc97" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div>
          <div className="grid grid-cols-3 gap-2 mt-2 text-[12px]"><div className="bg-raised/60 border border-line rounded-md p-2"><Label>Streak</Label><div className="num font-semibold">{st.current}d <span className="text-muted">/ best {st.best}</span></div></div><div className="bg-raised/60 border border-line rounded-md p-2"><Label>Active days</Label><div className="num font-semibold">{st.activeDays}</div></div><div className="bg-raised/60 border border-line rounded-md p-2"><Label>Consistency</Label><div className="num font-semibold">{pct(st.activeDays, Math.max(1, diffDays('2026-08-31', today) + 1))}%</div></div></div></Card>
      </div>
      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card><Label>SQL accuracy (last 20 sessions)</Label>{sqlAcc.length ? <div className="h-[160px] mt-1"><ResponsiveContainer><LineChart data={sqlAcc}><CartesianGrid stroke="rgb(var(--c-line))" vertical={false} /><XAxis dataKey="date" tick={{ fill: 'rgb(var(--c-muted))', fontSize: 10 }} /><YAxis domain={[0, 100]} tick={{ fill: 'rgb(var(--c-muted))', fontSize: 10 }} width={28} /><Tooltip {...tip} /><Line type="monotone" dataKey="acc" name="Accuracy %" stroke="rgb(var(--c-accent))" strokeWidth={2} dot={{ r: 2 }} /></LineChart></ResponsiveContainer></div> : <div className="text-muted text-[12.5px] py-8 text-center">Log SQL sessions on the SQL page to see accuracy trend.</div>}</Card>
        <Card><Label>Aptitude accuracy (last 20 sessions)</Label>{aptAcc.length ? <div className="h-[160px] mt-1"><ResponsiveContainer><LineChart data={aptAcc}><CartesianGrid stroke="rgb(var(--c-line))" vertical={false} /><XAxis dataKey="date" tick={{ fill: 'rgb(var(--c-muted))', fontSize: 10 }} /><YAxis domain={[0, 100]} tick={{ fill: 'rgb(var(--c-muted))', fontSize: 10 }} width={28} /><Tooltip {...tip} /><Line type="monotone" dataKey="acc" name="Accuracy %" stroke="#c4b5fd" strokeWidth={2} dot={{ r: 2 }} /></LineChart></ResponsiveContainer></div> : <div className="text-muted text-[12.5px] py-8 text-center">Log aptitude sessions to see the trend vs the 80% benchmark.</div>}</Card>
        <Card><Label>Project progress</Label><div className="mt-2 space-y-2">{r.projects.map((p) => <div key={p.id}><div className="flex justify-between text-[12.5px]"><span className="text-soft">{p.code} · {p.name}</span><span className="num">{p.pct}%</span></div><Bar value={p.pct} color={p.color} className="mt-1" /></div>)}</div><Label className="mt-4">Interview conversion</Label><div className="text-[12.5px] text-soft mt-1">{r.iv.strong} strong / {r.iv.rated} rated / {r.iv.total} total · avg {r.iv.avg.toFixed(1)}</div></Card>
      </div>
      <Card><div className="flex items-center gap-2 mb-2"><Award size={14} className="text-warn" /><H2>Milestones & badges</H2><span className="text-[12px] text-muted">{bd.filter((b) => b.earned).length}/{bd.length}</span></div><div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-2">{bd.map((b) => <div key={b.id} className={cn('border rounded-md p-2.5', b.earned ? 'border-warn/40 bg-warn/5' : 'border-line bg-raised/30 opacity-60')}><div className="flex items-center gap-1.5 text-[12.5px] font-semibold">{b.earned ? <CheckCircle2 size={12} className="text-warn" /> : <Award size={12} className="text-muted" />}{b.name}</div><div className="text-[11px] text-muted mt-0.5">{b.desc}</div></div>)}</div></Card>
    </div>
  )
}

// ---------------- DIFFERENTIATION ----------------
export function DifferentiationPage() {
  const state = useStore()
  const rows = differentiation(state)
  const avg = Math.round(rows.reduce((a, r) => a + r.score, 0) / rows.length)
  const typical = { 'SQL depth': 25, 'Business understanding': 15, 'Portfolio quality': 20, 'Domain specialization': 10, 'Interview readiness': 30, Communication: 30, 'Project evidence': 15, 'Application volume': 40 }
  const items = [
    ['Complex SQL (CTEs + windows)', ['sql-cte', 'sql-rank', 'sql-laglead', 'sql-rolling'].filter((t) => state.topics[t]).length + '/4 topics'],
    ['Business metrics in vault', state.notes.filter((n) => /Metric/.test(n.template)).length + ' notes'],
    ['Messy datasets cleaned', (state.evidence.python?.business || 0) + ' logged'],
    ['End-to-end projects', projectsSummary(state).filter((p) => p.shipped).length + '/3 shipped'],
    ['Business recommendations written', Object.values(state.projects).filter((p) => (p.recs || '').length > 80).length + '/3'],
    ['Executive dashboards live', Object.values(state.projects).filter((p) => p.stages?.['Live Dashboard']).length + '/3'],
    ['Portfolio storytelling (pitch ≥4/5)', Object.values(state.simScores).filter((s) => Object.values(s).length && Object.values(s).reduce((a, b) => a + b, 0) / Object.values(s).length >= 4).length + '/3'],
    ['Domain knowledge (metric groups)', ['retail', 'bfsi', 'commercial'].reduce((a, k) => a + SKILL_MAP[k].topics.filter((t) => state.topics[t.id]).length, 0) + '/24'],
    ['Interview performance (strong)', interviewStats(state).strong + ' answers'],
    ['Aptitude speed', state.aptitude.solved ? (state.aptitude.minutes / state.aptitude.solved).toFixed(2) + ' min/q' : '—'],
    ['Real application volume', state.applications.filter((a) => !['Wishlist', 'Ready to Apply'].includes(a.status)).length + ' submitted'],
  ]
  return (
    <div>
      <PageHeader eyebrow="System" title="Top 1% Differentiation System" subtitle="Tutorials don't count. This tracks only what separates you from a typical fresher: depth, evidence, business language, and shipped work." right={<Chip className="text-accent-glow border-accent/40 bg-accent/10">Differentiation index {avg}</Chip>} />
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="border-accent/30"><H2>How are you different from a typical fresher?</H2><div className="mt-3 space-y-3">{rows.map((r) => <div key={r.key}><div className="flex justify-between text-[12.5px]"><span className="text-ink font-medium">{r.key}</span><span className="num"><span className={r.score >= typical[r.key] ? 'text-ok' : 'text-warn'}>{r.score}</span><span className="text-muted"> vs typical {typical[r.key]}</span></span></div><div className="text-[11px] text-muted">{r.desc}</div><div className="relative mt-1"><Bar value={r.score} color={r.score >= typical[r.key] ? '#3ddc97' : '#f5b544'} /><div className="absolute top-[-2px] h-[10px] w-px bg-ink/60" style={{ left: `${typical[r.key]}%` }} title="typical fresher" /></div></div>)}</div><div className="text-[11px] text-muted mt-3">Tick mark = typical fresher baseline. You want every bar past the tick before December.</div></Card>
        <Card><H2>Differentiator tracker</H2><div className="mt-2 divide-y divide-line">{items.map(([k, v]) => <div key={k} className="py-2 flex justify-between text-[13px]"><span className="text-soft">{k}</span><span className="num text-ink">{v}</span></div>)}</div></Card>
      </div>
    </div>
  )
}

// ---------------- RESOURCES ----------------
export function ResourcesPage() {
  const state = useStore()
  const { setResource } = state
  const [skill, setSkill] = useState('all')
  const [q, setQ] = useState('')
  const skills = ['all', ...new Set(RESOURCES.map((r) => r.skill))]
  const list = RESOURCES.filter((r) => (skill === 'all' || r.skill === skill) && (!q || r.name.toLowerCase().includes(q.toLowerCase())))
  return (
    <div>
      <PageHeader eyebrow="System" title="Resources Center" subtitle="Curated, not exhaustive. Each resource has a job: learn, practice, or reference. Status tracks what you actually used." />
      <div className="flex flex-wrap items-center gap-2 mb-3"><Tabs tabs={skills.map((s) => ({ key: s, label: s === 'all' ? 'All' : SKILL_MAP[s]?.name || s }))} value={skill} onChange={setSkill} className="flex-1" /><div className="relative"><Search size={13} className="absolute left-2 top-2.5 text-muted" /><input className="input pl-7 py-1.5 w-44" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} /></div></div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">{list.map((r) => { const s = state.resources[r.id] || 'Not started'; return <Card key={r.id} className="flex flex-col"><div className="flex items-start justify-between gap-2"><a href={r.url} target="_blank" rel="noreferrer" className="text-[14px] font-semibold hover:text-accent-glow inline-flex items-center gap-1">{r.name}<Ext size={11} className="text-muted" /></a><SkillChip skill={r.skill} /></div><div className="text-[11.5px] text-muted mt-0.5">{r.type} · {r.difficulty}</div><div className="text-[12.5px] text-soft mt-1.5 flex-1">{r.why}</div><select className="input mt-3 py-1 text-[12px]" value={s} onChange={(e) => setResource(r.id, e.target.value)}>{['Not started', 'In progress', 'Completed', 'Reference'].map((x) => <option key={x}>{x}</option>)}</select></Card> })}</div>
    </div>
  )
}

// ---------------- NOTES / VAULT ----------------
export function NotesPage() {
  const state = useStore()
  const { addNote, updateNote, removeNote } = state
  const [sp] = useSearchParams()
  const [q, setQ] = useState(sp.get('q') || '')
  const [cat, setCat] = useState('all')
  const [editing, setEditing] = useState(null) // null | 'new' | note object
  useEffect(() => { if (sp.get('q')) setQ(sp.get('q')) }, [sp])
  const text = (n) => [n.interp, n.body].filter(Boolean).join('\n\n')
  const list = state.notes.filter((n) => (cat === 'all' || n.template === cat) && (!q || (n.title + ' ' + (n.formula || '') + ' ' + text(n) + ' ' + (n.iq || '')).toLowerCase().includes(q.toLowerCase())))
  return (
    <div>
      <PageHeader eyebrow="System" title="Notes" subtitle="Your own words, in one place. Writing a concept down is the 'Explain' step — keep it short." right={<button className="btn-primary btn-xs" onClick={() => setEditing('new')}><Plus size={12} />New note</button>} />
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]"><Search size={13} className="absolute left-2.5 top-2.5 text-muted" /><input className="input pl-8 py-1.5 w-full" placeholder="Search notes…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select className="input py-1.5 w-auto" value={cat} onChange={(e) => setCat(e.target.value)}><option value="all">All categories ({state.notes.length})</option>{NOTE_TEMPLATES.map((t) => <option key={t} value={t}>{t} ({state.notes.filter((n) => n.template === t).length})</option>)}</select>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
        {list.map((n) => (
          <Card key={n.id} className="flex flex-col cursor-pointer hover:border-line2 transition-colors" onClick={() => setEditing(n)}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0"><Chip className="text-muted border-line2 bg-raised">{n.template}</Chip><div className="text-[14px] font-semibold mt-1.5 leading-snug">{n.title}</div></div>
              <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button className="btn-ghost btn-xs" title="Edit" onClick={() => setEditing(n)}><Pencil size={12} />Edit</button>
                <button className="text-muted hover:text-bad p-1" title="Delete" onClick={() => { if (confirm(`Delete "${n.title}"?`)) removeNote(n.id) }}><Trash2 size={12} /></button>
              </div>
            </div>
            {n.formula && <pre className="mt-2 text-[12px] font-mono text-accent-glow bg-raised border border-line rounded-md px-2.5 py-2 whitespace-pre-wrap break-words">{n.formula}</pre>}
            {text(n) && <div className="text-[12.5px] text-soft mt-2 whitespace-pre-wrap line-clamp-4">{text(n)}</div>}
            {n.iq && <div className="text-[12px] text-muted mt-2 pt-2 border-t border-line"><span className="text-warn">Interview:</span> {n.iq}</div>}
          </Card>
        ))}
      </div>
      {!list.length && <Empty text={state.notes.length ? 'No notes match your search.' : 'No notes yet.'} action={<button className="btn-primary btn-xs" onClick={() => setEditing('new')}><Plus size={12} />Write your first note</button>} />}
      {editing && <NoteEditor note={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSave={(data) => { if (editing === 'new') addNote(data); else updateNote(editing.id, data); setEditing(null) }} onDelete={editing !== 'new' ? () => { if (confirm(`Delete "${editing.title}"?`)) { removeNote(editing.id); setEditing(null) } } : null} />}
    </div>
  )
}

function NoteEditor({ note, onClose, onSave, onDelete }) {
  const [f, setF] = useState({ template: note?.template || 'SQL Concept', title: note?.title || '', text: [note?.interp, note?.body].filter(Boolean).join('\n\n'), formula: note?.formula || '', iq: note?.iq || '', domain: note?.domain || 'General' })
  const [more, setMore] = useState(!!(note?.formula || note?.iq))
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const save = () => onSave({ template: f.template, title: f.title.trim(), interp: f.text.trim(), body: '', formula: f.formula.trim(), iq: f.iq.trim(), domain: f.domain })
  return (
    <Modal open onClose={onClose} title={note ? 'Edit note' : 'New note'} wide>
      <div className="p-4 space-y-3">
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Title" className="sm:col-span-2"><input className="input" autoFocus value={f.title} onChange={set('title')} placeholder="e.g. What is a CTE?" /></Field>
          <Field label="Category"><select className="input" value={f.template} onChange={set('template')}>{NOTE_TEMPLATES.map((t) => <option key={t}>{t}</option>)}</select></Field>
        </div>
        <Field label="Notes"><textarea rows={8} className="input text-[13px] leading-relaxed" value={f.text} onChange={set('text')} placeholder="Write it in your own words. What it is, when to use it, one example." /></Field>
        <button className="text-[12px] text-accent-glow" onClick={() => setMore(!more)}>{more ? '− Hide' : '+ Add'} formula / interview question (optional)</button>
        {more && (
          <div className="grid sm:grid-cols-3 gap-3 animate-fadeIn">
            <Field label="Formula / syntax" className="sm:col-span-2"><input className="input font-mono" value={f.formula} onChange={set('formula')} placeholder="SELECT … FROM … WHERE …" /></Field>
            <Field label="Used for"><select className="input" value={f.domain} onChange={set('domain')}>{['General', 'SQL', 'Power BI', 'Excel', 'Statistics', 'Python', 'E-Commerce', 'BFSI', 'Commercial'].map((t) => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Interview question this answers" className="sm:col-span-3"><input className="input" value={f.iq} onChange={set('iq')} placeholder="e.g. Difference between WHERE and HAVING?" /></Field>
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-line">
          {onDelete ? <button className="btn-danger btn-xs" onClick={onDelete}><Trash2 size={11} />Delete</button> : <span />}
          <div className="flex gap-2"><button className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn-primary" disabled={!f.title.trim()} onClick={save}>Save</button></div>
        </div>
      </div>
    </Modal>
  )
}

// ---------------- REVISION ----------------
export function RevisionPage() {
  const state = useStore()
  const { addRevision, reviewRevision, removeRevision } = state
  const today = state.today()
  const cats = ['SQL mistakes', 'DAX mistakes', 'Excel mistakes', 'Statistics mistakes', 'Aptitude mistakes', 'Interview mistakes', 'Business concepts', 'Power BI mistakes', 'Python mistakes']
  const [f, setF] = useState({ title: '', category: 'SQL mistakes', detail: '' })
  const [cat, setCat] = useState('all')
  const items = state.revision.filter((r) => cat === 'all' || r.category === cat)
  const due = items.filter((r) => !r.retired && r.nextReview <= today)
  const upcoming = items.filter((r) => !r.retired && r.nextReview > today).sort((a, b) => a.nextReview.localeCompare(b.nextReview))
  const retired = items.filter((r) => r.retired)
  return (
    <div>
      <PageHeader eyebrow="System" title="Revision Center" subtitle="Spaced repetition: 1 → 3 → 7 → 14 → 30 days. Every mistake becomes an item; recall it five times and it retires." right={<Chip className={due.length ? 'text-warn border-warn/40 bg-warn/10' : 'text-ok border-ok/40 bg-ok/10'}>{due.length} due today</Chip>} />
      <div className="grid lg:grid-cols-3 gap-4">
        <Card><H2>Add revision item</H2><Field label="Category" className="mt-2"><select className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{cats.map((c) => <option key={c}>{c}</option>)}</select></Field><Field label="What to revise" className="mt-2"><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field><Field label="Detail / correct approach" className="mt-2"><textarea rows={3} className="input" value={f.detail} onChange={(e) => setF({ ...f, detail: e.target.value })} /></Field><button className="btn-primary mt-3 w-full justify-center" disabled={!f.title} onClick={() => { addRevision(f); setF({ ...f, title: '', detail: '' }) }}><Plus size={13} />Add</button>
          <div className="mt-4"><Label>By category</Label><div className="mt-1 space-y-1">{cats.map((c) => { const n = state.revision.filter((r) => r.category === c && !r.retired).length; return <button key={c} onClick={() => setCat(cat === c ? 'all' : c)} className={cn('flex justify-between w-full text-[12.5px] px-2 py-1 rounded', cat === c ? 'bg-raised text-ink' : 'text-soft hover:bg-raised/60')}><span>{c}</span><span className="num text-muted">{n}</span></button> })}</div></div></Card>
        <div className="lg:col-span-2 space-y-4">
          <Card><H2>Due now ({due.length})</H2>{!due.length && <div className="text-muted text-[13px] mt-2">Nothing due. Mistakes from timed challenges and interview questions land here automatically.</div>}<div className="mt-2 space-y-2">{due.map((r) => <RevItem key={r.id} r={r} today={today} onOk={() => reviewRevision(r.id, true)} onFail={() => reviewRevision(r.id, false)} onDel={() => removeRevision(r.id)} />)}</div></Card>
          <Card><H2>Upcoming ({upcoming.length})</H2><div className="mt-2 space-y-2">{upcoming.slice(0, 20).map((r) => <RevItem key={r.id} r={r} today={today} onDel={() => removeRevision(r.id)} />)}</div></Card>
          {retired.length > 0 && <Card><H2>Retired — mastered ({retired.length})</H2><div className="mt-2 flex flex-wrap gap-1.5">{retired.map((r) => <Chip key={r.id} className="text-ok border-ok/40 bg-ok/10">{r.title}</Chip>)}</div></Card>}
        </div>
      </div>
    </div>
  )
}
function RevItem({ r, today, onOk, onFail, onDel }) {
  return (
    <div className="border border-line rounded-md p-2.5">
      <div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="flex items-center gap-1.5 flex-wrap"><Chip className="text-muted border-line2 bg-raised">{r.category}</Chip><span className="num text-[10.5px] text-muted">step {r.step + 1}/5 · {r.nextReview <= today ? <span className="text-warn">due</span> : `due ${fmtShort(r.nextReview)}`}</span></div><div className="text-[13px] font-medium mt-1">{r.title}</div>{r.detail && <div className="text-[12px] text-muted mt-0.5">{r.detail}</div>}</div><button className="text-muted hover:text-bad" onClick={onDel}><Trash2 size={12} /></button></div>
      <div className="flex items-center gap-1 mt-2">{REVISION_INTERVALS.map((d, i) => <span key={d} className={cn('num text-[10px] px-1.5 py-0.5 rounded border', i < r.step ? 'border-ok/40 text-ok bg-ok/10' : i === r.step ? 'border-accent/50 text-accent-glow' : 'border-line text-muted')}>{d}d</span>)}{onOk && <div className="ml-auto flex gap-1.5"><button className="btn-subtle btn-xs" onClick={onOk}>Recalled ✓</button><button className="btn-ghost btn-xs" onClick={onFail}>Forgot ↺</button></div>}</div>
    </div>
  )
}

// ---------------- CATCH-UP ----------------
export function CatchUpPage() {
  const state = useStore()
  const { moveTask, dropTask, setSettings } = state
  const today = state.today()
  const cap = state.settings.dailyCatchUpCap || 60
  const plan = useMemo(() => catchUpPlan(state, today, cap), [state.taskState, state.taskOverrides, state.customTasks, state.evidence, state.topics, cap, today])
  const [applied, setApplied] = useState(null)
  const apply = () => {
    let moved = 0, deferred = 0
    for (const p of plan.plan) { if (p.action === 'move') { moveTask(p.task, p.to); moved++ } else { dropTask(p.task); deferred++ } }
    setApplied({ moved, deferred, high: plan.high.length })
  }
  if (!plan.overdue.length && !applied) return (
    <div><PageHeader eyebrow="System" title="Catch-Up Mode" subtitle="Nothing overdue. When you miss a day, this is where the engine triages instead of dumping everything on tomorrow." /><Card className="border-ok/30 text-center py-10"><CheckCircle2 size={28} className="text-ok mx-auto" /><div className="text-[15px] font-semibold mt-2">You're clear.</div><div className="text-muted text-[13px] mt-1">No missed tasks in the last 60 days.</div><Link to="/today" className="btn-primary btn-xs mt-4">Go to Today <ArrowRight size={11} /></Link></Card></div>
  )
  const byDay = {}
  for (const p of plan.plan) if (p.action === 'move') (byDay[p.to] ||= []).push(p.task)
  return (
    <div>
      <PageHeader eyebrow="System" title="Catch-Up Mode" subtitle="Missing a day is normal. The engine classifies missed work by priority, moves only the essentials into the next few days (capped per day), and defers the rest." right={<div className="flex items-center gap-2 text-[12px]"><span className="text-muted">Daily catch-up cap</span><select className="input py-1 w-24" value={cap} onChange={(e) => setSettings({ dailyCatchUpCap: +e.target.value })}>{[30, 45, 60, 90, 120].map((v) => <option key={v} value={v}>{v} min</option>)}</select></div>} />
      {applied && <Card className="mb-4 border-ok/40 bg-ok/5"><div className="flex items-center gap-2 text-[14px] font-semibold text-ok"><CheckCircle2 size={16} />Auto-reschedule applied</div><div className="text-[13px] text-soft mt-1">I moved <span className="num text-ink">{applied.moved}</span> essential task{applied.moved === 1 ? '' : 's'} into the coming days (≤ {cap} min/day extra). <span className="num text-ink">{applied.deferred}</span> low-priority task{applied.deferred === 1 ? ' was' : 's were'} deferred. Nothing critical was overloaded.</div><Link to="/today" className="btn-primary btn-xs mt-3">Back to Today <ArrowRight size={11} /></Link></Card>}
      <div className="grid md:grid-cols-4 gap-3 mb-4">
        <Card><Label>Missed</Label><div className="num text-[24px] font-bold">{plan.overdue.length}</div><div className="text-[11.5px] text-muted">{hrs(plan.overdue.reduce((a, t) => a + (t.estMin || 0), 0))} of work</div></Card>
        <Card className="border-bad/30"><Label className="text-bad">High priority</Label><div className="num text-[24px] font-bold">{plan.high.length}</div><div className="text-[11.5px] text-muted">rescheduled within 5 days</div></Card>
        <Card className="border-info/30"><Label className="text-info">Medium priority</Label><div className="num text-[24px] font-bold">{plan.medium.length}</div><div className="text-[11.5px] text-muted">spread across next week</div></Card>
        <Card><Label>Low priority</Label><div className="num text-[24px] font-bold">{plan.low.length}</div><div className="text-[11.5px] text-muted">deferred — curriculum re-covers them</div></Card>
      </div>
      {!applied && (
        <Card className="mb-4 border-accent/40"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2"><Wand2 size={15} className="text-accent-glow" /><H2>Auto-reschedule plan</H2></div><div className="text-[12.5px] text-soft mt-1">Move {plan.plan.filter((p) => p.action === 'move').length} tasks · defer {plan.plan.filter((p) => p.action === 'defer').length} · max {cap} min extra per day</div></div><button className="btn-primary" onClick={apply}><Wand2 size={13} />Apply auto-reschedule</button></div>
          <div className="grid md:grid-cols-3 xl:grid-cols-5 gap-2 mt-3">{Object.entries(byDay).sort().map(([d, ts]) => <div key={d} className="border border-line rounded-md p-2"><div className="flex justify-between text-[12px]"><span className="font-semibold">{d === today ? 'Today' : fmtShort(d)}</span><span className="num text-muted">{hrs(ts.reduce((a, t) => a + (t.estMin || 0), 0))}</span></div><div className="mt-1 space-y-0.5">{ts.map((t) => <div key={t.id} className="text-[11.5px] text-soft truncate flex items-center gap-1"><PriorityChip p={t.priority} />{t.title}</div>)}</div></div>)}</div>
        </Card>
      )}
      <div className="space-y-4">
        {[['HIGH PRIORITY — reschedule', plan.high, 'text-bad'], ['MEDIUM PRIORITY — next week', plan.medium, 'text-info'], ['LOW PRIORITY — defer', plan.low, 'text-muted']].map(([t, list, c]) => list.length > 0 && <div key={t}><div className={cn('label mb-2', c)}>{t} ({list.length})</div><div className="space-y-2">{list.map((task) => <TaskCard key={task.id} task={task} showDate compact />)}</div></div>)}
      </div>
    </div>
  )
}

// ---------------- SETTINGS ----------------
export function SettingsPage() {
  const state = useStore()
  const { setSettings, exportState, importState, resetAll } = state
  const s = state.settings
  const [links, setLinks] = useState(s.links)
  const size = useMemo(() => Math.round((localStorage.getItem('acc-state-v1') || '').length / 1024), [state])
  return (
    <div>
      <PageHeader eyebrow="System" title="Settings" subtitle="Profile, workload, links, and data. Everything is persisted in this browser's localStorage — export a backup regularly." />
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="lg:col-span-2"><H2>Appearance</H2><div className="text-[12.5px] text-muted mt-1">Each theme is a different look — background, card material, fonts, corners and spacing. Applies instantly.</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">{THEMES.map((t) => <button key={t.id} onClick={() => setSettings({ theme: t.id })} className={cn('text-left rounded-xl border overflow-hidden transition-all', (s.theme || 'midnight') === t.id ? 'border-accent ring-2 ring-accent/30' : 'border-line hover:border-line2')}><div className="h-20 relative" style={{ background: t.preview }}><div className="absolute left-3 top-3 right-3 h-3 rounded-sm opacity-80" style={{ background: t.id === 'paper' ? '#fff' : 'rgba(255,255,255,0.12)', border: '1px solid rgba(127,127,127,0.25)' }} /><div className="absolute left-3 top-8 w-1/2 h-3 rounded-sm" style={{ background: t.swatch[1] }} /></div><div className="p-2.5"><div className="text-[13px] font-semibold flex items-center justify-between">{t.name}{(s.theme || 'midnight') === t.id && <span className="text-accent-glow text-[11px]">Active</span>}</div><div className="text-[11px] text-muted mt-0.5 leading-snug">{t.desc}</div></div></button>)}</div>
        </Card>
        <Card><H2>Profile & workload</H2><div className="grid sm:grid-cols-2 gap-3 mt-3"><Field label="Name"><input className="input" value={s.name} onChange={(e) => setSettings({ name: e.target.value })} /></Field><Field label="Title"><input className="input" value={s.title} onChange={(e) => setSettings({ title: e.target.value })} /></Field><Field label="Weekly hours target"><input type="number" className="input" value={s.weeklyHours} onChange={(e) => setSettings({ weeklyHours: +e.target.value })} /></Field><Field label="Daily catch-up cap (min)"><input type="number" className="input" value={s.dailyCatchUpCap} onChange={(e) => setSettings({ dailyCatchUpCap: +e.target.value })} /></Field><Field label="Program start date — Week 1, Day 1 (nothing is scheduled before it)"><input type="date" className="input" value={s.startedOn || ''} onChange={(e) => setSettings({ startedOn: e.target.value })} /></Field><Field label="Simulate date (blank = real today)"><input type="date" className="input" value={s.todayOverride} onChange={(e) => setSettings({ todayOverride: e.target.value })} /><div className="text-[11px] text-muted mt-1">Useful to preview future weeks or test Catch-Up Mode. Clear it for daily use.</div></Field></div></Card>
        <Card><H2>Links</H2><div className="space-y-3 mt-3">{[['github', 'GitHub profile'], ['linkedin', 'LinkedIn profile'], ['portfolio', 'Portfolio / NovyPro']].map(([k, l]) => <Field key={k} label={l}><input className="input" value={links[k] || ''} onChange={(e) => setLinks({ ...links, [k]: e.target.value })} onBlur={() => setSettings({ links })} /></Field>)}</div></Card>
        <Card><H2>Data</H2><div className="text-[12.5px] text-muted mt-1">Stored locally ({size} KB). Refreshing never loses progress. To move between devices, export and import.</div><div className="flex flex-wrap gap-2 mt-3"><button className="btn-subtle" onClick={() => { const blob = new Blob([exportState()], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `analyst-command-center-${state.today()}.json`; a.click() }}><Download size={13} />Export backup</button><label className="btn-subtle cursor-pointer"><Upload size={13} />Import backup<input type="file" accept="application/json" className="hidden" onChange={(e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { importState(r.result); alert('Imported.') } catch { alert('Invalid file') } }; r.readAsText(f) }} /></label><button className="btn-danger" onClick={() => { if (confirm('Reset ALL progress? This cannot be undone.')) resetAll() }}><RotateCcw size={13} />Reset everything</button></div></Card>
        <Card><H2>Execution philosophy</H2><div className="text-[13px] text-soft mt-2 space-y-1.5"><div>· 20% theory / 80% practical. Learning tasks are deliberately short; practice and project tasks are long.</div><div>· Sequence for every topic: Learn → Practice → Apply → Explain → Test → Revise.</div><div>· Priority rules: interview deadline &gt; application deadline &gt; project deadline &gt; weak skill &gt; normal learning.</div><div>· DSA Lite is capped at LOW and never exceeds 30 min.</div><div>· Skills reach "Interview Ready" only through evidence gates, never by watching a course.</div><div>· December 2026 flips the app from Learning Mode to Job Search Mode automatically.</div></div></Card>
      </div>
    </div>
  )
}
