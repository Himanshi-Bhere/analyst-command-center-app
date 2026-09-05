import { programWeekStart } from '../engine/tasks'
import React, { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Plus, Check, AlertTriangle } from 'lucide-react'
import { useStore } from '../store/useStore'
import TopicTable from '../components/TopicTable'
import { PageHeader, Card, Label, Bar, Chip, H2, Checkbox, Field, Confidence, Stepper, Collapsible, Tabs } from '../components/ui'
import { SKILL_MAP, LEVELS } from '../data/skills'
import { STATS_CONCEPTS, RESOURCES } from '../data/library'
import { skillEvidence, domainReadiness } from '../engine/scoring'
import { QUESTIONS } from '../data/interview'
import { skillColor, cn, pct } from '../lib/utils'
import { startOfWeek, addDays } from '../lib/dates'

// ---------------- STATISTICS ----------------
export function StatisticsPage() {
  const state = useStore()
  const { toggleTopic, setStatsQuiz, addEvidence } = state
  const ev = skillEvidence('statistics', state)
  const [open, setOpen] = useState(null)
  return (
    <div>
      <PageHeader eyebrow="Learning" title="Statistics for Analysts" subtitle="Interpretation over memorization. For every concept: what it means, the formula, when analysts use it, a business example, and the interview question." right={<Chip color="#4fb7f5">{ev.levelName} · {ev.score}%</Chip>} />
      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2"><TopicTable topics={SKILL_MAP.statistics.topics} /></div>
        <Card><H2>Evidence</H2><div className="mt-2 space-y-2">{ev.checks.map((c) => <div key={c.key}><div className="flex justify-between text-[12px]"><span className="text-soft">{c.label}</span>{!c.bool && c.key !== 'concepts' && <button className="text-accent-glow" onClick={() => addEvidence('statistics', c.key, 1)}>+1</button>}{c.bool && <button className="text-accent-glow" onClick={() => addEvidence('statistics', c.key, !c.ok)}>{c.ok ? 'passed' : 'mark'}</button>}</div><Bar value={c.progress} color="#4fb7f5" className="mt-1" height={4} /></div>)}</div></Card>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {STATS_CONCEPTS.map((c) => { const q = state.statsQuiz[c.id] || {}; return (
          <Card key={c.id} className={cn(q.understood && 'border-ok/30')}>
            <div className="flex items-start justify-between gap-2"><div><div className="text-[14px] font-semibold">{c.name}</div><div className="text-[12.5px] text-soft mt-0.5">{c.means}</div></div><button className={cn('btn-xs', q.understood ? 'btn-subtle' : 'btn-ghost')} onClick={() => { setStatsQuiz(c.id, { understood: !q.understood }); if (!q.understood) addEvidence('statistics', 'business', 1) }}>{q.understood ? 'Understood ✓' : 'Mark understood'}</button></div>
            <div className="grid sm:grid-cols-2 gap-2 mt-3 text-[12px]">
              <div className="bg-raised/60 border border-line rounded-md p-2"><Label>Formula</Label><div className="font-mono text-[12px] mt-0.5 text-ink">{c.formula}</div></div>
              <div className="bg-raised/60 border border-line rounded-md p-2"><Label>When analysts use it</Label><div className="text-soft mt-0.5">{c.when}</div></div>
              <div className="bg-raised/60 border border-line rounded-md p-2 sm:col-span-2"><Label>Business example</Label><div className="text-soft mt-0.5">{c.example}</div></div>
              <div className="bg-raised/60 border border-line rounded-md p-2 sm:col-span-2 flex flex-wrap items-center gap-2"><div className="flex-1"><Label>Interview question</Label><div className="text-ink mt-0.5">{c.iq}</div></div><div className="flex items-center gap-2"><span className="text-[11px] text-muted">confidence</span><Confidence size="sm" value={q.confidence} onChange={(v) => { setStatsQuiz(c.id, { confidence: v }); if (v >= 4 && !(q.confidence >= 4)) addEvidence('statistics', 'interview', 1) }} /></div></div>
            </div>
          </Card>
        ) })}
      </div>
    </div>
  )
}

// ---------------- APTITUDE ----------------
const APT_CATS = { Quantitative: ['Percentages', 'Ratio & Proportion', 'Averages', 'Profit & Loss', 'SI / CI', 'Time & Work', 'Time Speed Distance', 'Permutation & Combination', 'Probability', 'Number System'], Logical: ['Series', 'Coding-Decoding', 'Syllogisms', 'Seating Arrangement', 'Blood Relations', 'Puzzles', 'Statements & Assumptions', 'Direction Sense'], 'Data Interpretation': ['Tables', 'Bar / Line charts', 'Pie charts', 'Caselets', 'Mixed DI'], Verbal: ['Reading Comprehension', 'Grammar', 'Vocabulary', 'Para Jumbles'] }
export function AptitudePage() {
  const state = useStore()
  const { logAptitude, addRevision } = state
  const today = state.today()
  const apt = state.aptitude
  const [f, setF] = useState({ category: 'Quantitative', topic: 'Percentages', solved: 20, correct: 16, minutes: 25 })
  const stats = useMemo(() => {
    const byCat = {}
    for (const l of apt.log) { const c = (byCat[l.category] ||= { solved: 0, correct: 0, minutes: 0 }); c.solved += l.solved; c.correct += l.correct; c.minutes += l.minutes || 0 }
    const byTopic = {}
    for (const l of apt.log) { const c = (byTopic[l.topic] ||= { solved: 0, correct: 0 }); c.solved += l.solved; c.correct += l.correct }
    const weak = Object.entries(byTopic).filter(([, v]) => v.solved >= 10).sort((a, b) => a[1].correct / a[1].solved - b[1].correct / b[1].solved)[0]
    const ws = programWeekStart(today)
    const weekSolved = apt.log.filter((l) => l.date >= ws).reduce((a, l) => a + l.solved, 0)
    const todaySolved = apt.log.filter((l) => l.date === today).reduce((a, l) => a + l.solved, 0)
    return { byCat, byTopic, weak, weekSolved, todaySolved }
  }, [apt.log, today])
  const acc = apt.solved ? Math.round((apt.correct / apt.solved) * 100) : 0
  const avgT = apt.solved ? (apt.minutes / apt.solved).toFixed(2) : '0'
  const weekTopic = SKILL_MAP.aptitude.topics.find((t) => t.week === Math.min(12, Math.max(1, Math.floor((new Date(today) - new Date('2026-08-31')) / 604800000) + 1)))?.name
  const targetToday = { Quant: 20, Logical: 10, DI: 10 }
  return (
    <div>
      <PageHeader eyebrow="Learning" title="Aptitude — the first filter" subtitle="A 10 CGPA means nothing if the 45-minute aptitude test eliminates you. 60-minute protocol: 20 min concept → 35 min speed practice → 5 min mistake log." right={<Chip color="#c4b5fd">{apt.solved} solved · {acc}%</Chip>} />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        {[['Questions solved', apt.solved, 'target 800 by Dec'], ['Correct', apt.correct, `${apt.solved - apt.correct} wrong`], ['Accuracy', `${acc}%`, 'benchmark ≥ 80%'], ['Avg time', `${avgT} min`, 'target ≤ 1 min'], ['This week', stats.weekSolved, 'target 150'], ['Weak category', stats.weak ? stats.weak[0] : '—', stats.weak ? `${Math.round((stats.weak[1].correct / stats.weak[1].solved) * 100)}% accuracy` : 'need ≥10 per topic']].map(([l, v, s]) => <div key={l} className="card p-3"><Label>{l}</Label><div className="num text-[17px] font-bold mt-0.5 truncate">{v}</div><div className="text-[11px] text-muted truncate">{s}</div></div>)}
      </div>
      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="border-accent/40">
          <Label>Today's target</Label>
          <div className="text-[15px] font-semibold mt-1">{targetToday.Quant} Quant · {targetToday.Logical} Logical · {targetToday.DI} DI</div>
          <div className="text-[12px] text-muted mt-0.5">This week's topic: <span className="text-soft">{weekTopic}</span> · done today: <span className="num text-ink">{stats.todaySolved}</span> / 40</div>
          <Bar value={pct(stats.todaySolved, 40)} color="#c4b5fd" className="mt-2" />
          <div className="mt-3 text-[12px] text-soft space-y-1"><div>00–20 · <a className="text-accent-glow hover:underline" href="https://www.youtube.com/@CareerRideOfficial" target="_blank" rel="noreferrer">CareerRide</a> concept at 1.25× — note formula + 2 shortcuts</div><div>20–55 · <a className="text-accent-glow hover:underline" href="https://www.indiabix.com/" target="_blank" rel="noreferrer">IndiaBix</a> — 12–15 questions, no calculator</div><div>55–60 · log 2–3 wrong ones below → Revision</div></div>
        </Card>
        <Card>
          <H2>Log a session</H2>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Field label="Category" className="col-span-2"><select className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value, topic: APT_CATS[e.target.value][0] })}>{Object.keys(APT_CATS).map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Topic" className="col-span-2"><select className="input" value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })}>{APT_CATS[f.category].map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Solved"><input type="number" className="input" value={f.solved} onChange={(e) => setF({ ...f, solved: +e.target.value })} /></Field>
            <Field label="Correct"><input type="number" className="input" value={f.correct} onChange={(e) => setF({ ...f, correct: +e.target.value })} /></Field>
            <Field label="Minutes" className="col-span-2"><input type="number" className="input" value={f.minutes} onChange={(e) => setF({ ...f, minutes: +e.target.value })} /></Field>
          </div>
          <button className="btn-primary w-full justify-center mt-3" disabled={!f.solved} onClick={() => logAptitude({ date: today, ...f, correct: Math.min(f.correct, f.solved) })}><Plus size={13} />Log</button>
        </Card>
        <Card>
          <H2>Accuracy by category</H2>
          <div className="mt-2 space-y-2">{Object.keys(APT_CATS).map((c) => { const v = stats.byCat[c] || { solved: 0, correct: 0 }; const a = v.solved ? Math.round((v.correct / v.solved) * 100) : 0; return <div key={c}><div className="flex justify-between text-[12.5px]"><span className="text-soft">{c}</span><span className="num text-muted">{v.solved} · {a}%</span></div><Bar value={a} color={a >= 80 ? '#3ddc97' : a >= 60 ? '#f5b544' : '#f06a6a'} className="mt-1" /></div> })}</div>
          <div className="mt-3 text-[12px]"><button className="btn-ghost btn-xs" onClick={() => { const t = prompt('Describe the mistake (question type + trap)'); if (t) addRevision({ title: t, category: 'Aptitude mistakes', detail: f.topic }) }}><AlertTriangle size={11} />Log a mistake → Revision</button></div>
        </Card>
      </div>
      <Card>
        <H2>Topic accuracy</H2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-2">{Object.values(APT_CATS).flat().map((t) => { const v = stats.byTopic[t]; const a = v ? Math.round((v.correct / v.solved) * 100) : null; return <div key={t} className="border border-line rounded-md px-2.5 py-1.5 flex items-center justify-between text-[12px]"><span className="text-soft">{t}</span><span className={cn('num', a === null ? 'text-muted' : a >= 80 ? 'text-ok' : a >= 60 ? 'text-warn' : 'text-bad')}>{a === null ? '—' : `${a}% (${v.solved})`}</span></div> })}</div>
      </Card>
    </div>
  )
}

// ---------------- DSA LITE ----------------
export function DsaPage() {
  const state = useStore()
  const { setDsa, addEvidence } = state
  const ev = skillEvidence('dsa', state)
  return (
    <div>
      <PageHeader eyebrow="Learning · LOW priority" title="DSA Lite" subtitle="Analyst-interview-level foundations only. Priority is capped at LOW — this must never steal time from SQL, Power BI, Excel, Statistics, Projects or Aptitude." right={<Chip className="text-muted border-line2 bg-raised">Max 30 min · Saturdays · W3–W12</Chip>} />
      <Card className="mb-4 border-warn/30 bg-warn/5 text-[13px] text-soft flex gap-2"><AlertTriangle size={15} className="text-warn shrink-0 mt-0.5" />Analytics roles rarely ask DSA beyond arrays, strings, hash maps and basic complexity. If a company's OA is DSA-heavy, it's usually a software role mislabeled as analytics.</Card>
      <div className="grid md:grid-cols-2 gap-3">
        {SKILL_MAP.dsa.topics.map((t) => { const d = state.dsa[t.id] || {}; return (
          <Card key={t.id} className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[160px]"><div className="text-[14px] font-medium">{t.name}</div><div className="text-[11.5px] text-muted">questions · confidence</div></div>
            <Stepper value={d.questions || 0} onChange={(v) => { if (v > (d.questions || 0)) addEvidence('dsa', 'problems', 1); setDsa(t.id, { questions: v }) }} />
            <Confidence size="sm" value={d.confidence} onChange={(v) => setDsa(t.id, { confidence: v })} />
            <button className="btn-ghost btn-xs" onClick={() => state.toggleTopic(t.id)}>{state.topics[t.id] ? 'Learned ✓' : 'Mark learned'}</button>
          </Card>
        ) })}
      </div>
      <div className="text-[12px] text-muted mt-3">Resource: <a className="text-accent-glow hover:underline" href="https://neetcode.io/roadmap" target="_blank" rel="noreferrer">NeetCode — Arrays & Hashing / Two Pointers only</a> · Evidence: {ev.evidence.problems || 0}/30 problems</div>
    </div>
  )
}

// ---------------- BUSINESS ANALYTICS HUB ----------------
export function BusinessPage() {
  const state = useStore()
  const dr = domainReadiness(state)
  const rows = [['retail', 'Retail / E-Commerce', 'p1'], ['commercial', 'Commercial / Revenue', 'p3'], ['bfsi', 'BFSI / FinTech', 'p2']]
  const metricNotes = state.notes.filter((n) => /Metric/.test(n.template))
  return (
    <div>
      <PageHeader eyebrow="Learning" title="Business Analytics" subtitle="The interview winner. Speak the language of money: metrics, unit economics, and structured case thinking (DEFINE → SEGMENT → INVESTIGATE → MEASURE → VISUALIZE → EXPLAIN → RECOMMEND)." />
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        {rows.map(([k, name, p]) => { const ev = skillEvidence(k, state); return (
          <Link key={k} to={`/domain/${k}`} className="card card-hover p-4 block">
            <div className="flex items-center justify-between"><div className="text-[15px] font-semibold" style={{ color: skillColor(k) }}>{name}</div><span className="num text-[18px] font-bold">{dr[k]}%</span></div>
            <Bar value={dr[k]} color={skillColor(k)} className="mt-2" />
            <div className="text-[12px] text-muted mt-2">{ev.topicsDone}/{ev.skill.topics.length} metric groups · {ev.evidence.business || 0} cases · Project {p.toUpperCase()}</div>
            {dr.best === k && <Chip className="mt-2 text-ok border-ok/40 bg-ok/10">fastest route to interview-ready</Chip>}
          </Link>
        ) })}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card><H2>Metric vault — {metricNotes.length} metrics</H2><div className="mt-2 space-y-1.5 max-h-[360px] overflow-y-auto pr-1">{metricNotes.map((n) => <div key={n.id} className="border border-line rounded-md px-2.5 py-1.5"><div className="flex justify-between text-[13px]"><span className="font-medium">{n.title}</span><Chip color={skillColor(n.domain === 'E-Commerce' ? 'retail' : n.domain === 'BFSI' ? 'bfsi' : 'commercial')}>{n.domain}</Chip></div><div className="font-mono text-[11.5px] text-muted mt-0.5">{n.formula}</div></div>)}</div><Link to="/notes" className="btn-ghost btn-xs mt-3">Open Notes vault</Link></Card>
        <Card><H2>Business case practice</H2><div className="text-[12.5px] text-soft mt-1">Structured cases live in the Interview Center. Each case forces the 7-step framework.</div><div className="mt-3 grid grid-cols-1 gap-2">{[['E-Commerce Cases', 'Sales dropped 15% · conversion · returns · margin · delivery · retention · inventory'], ['BFSI Cases', 'Fraud · payment failures · default rate · churn · approval conversion'], ['Business Cases', 'Revenue · CAC · LTV · margin · pipeline conversion']].map(([t, d]) => <Link key={t} to={`/interviews?tab=${encodeURIComponent(t)}`} className="border border-line rounded-md p-2.5 hover:border-line2"><div className="text-[13px] font-medium">{t}</div><div className="text-[11.5px] text-muted">{d}</div></Link>)}</div></Card>
      </div>
    </div>
  )
}

// ---------------- DOMAIN TRACK ----------------
const DOMAIN_META = {
  retail: { name: 'Retail / E-Commerce Analytics', project: 'p1', domainKey: 'E-Commerce', questions: ['Why are customers abandoning checkout?', 'Which categories generate revenue but weak margins?', 'Which customer cohorts retain best?', 'What is driving declining conversion?', 'Which products should receive promotional spend?', 'Where is GMV leakage happening?'], caseTab: 'E-Commerce Cases', companies: 'Retail / E-Commerce', resume: 'retail' },
  bfsi: { name: 'BFSI / FinTech Analytics', project: 'p2', domainKey: 'BFSI', questions: ['Which customers are most likely to churn?', 'Which transactions look anomalous?', 'Which customer segments create the most revenue?', 'What factors correlate with loan default?', 'Which portfolio segments have higher delinquency?'], caseTab: 'BFSI Cases', companies: 'BFSI / FinTech', resume: 'bfsi' },
  commercial: { name: 'Commercial / Revenue Analytics', project: 'p3', domainKey: 'Commercial', questions: ['Why is net ARR flat while gross sales grow?', 'Which region hits revenue but misses margin?', 'Which plan has the highest churn hazard and when?', 'Is pipeline growth converting to bookings?', 'Which discounts destroy LTV:CAC?'], caseTab: 'Business Cases', companies: 'SaaS', resume: 'commercial' },
}
export function DomainPage() {
  const { id } = useParams()
  const state = useStore()
  const { toggleTopic, addEvidence } = state
  const meta = DOMAIN_META[id]
  const skill = SKILL_MAP[id]
  const ev = skillEvidence(id, state)
  const dr = domainReadiness(state)
  const notes = state.notes.filter((n) => n.domain === meta.domainKey)
  const [caseIdx, setCaseIdx] = useState(0)
  if (!meta) return null
  return (
    <div>
      <PageHeader eyebrow="Domain track" title={meta.name} subtitle="Same SQL, different vocabulary. Master the metric stack, the business questions, and the flagship project — then the interview writes itself." right={<Chip color={skillColor(id)}>{dr[id]}% ready · {ev.levelName}</Chip>} />
      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <H2>Metric stack — {ev.topicsDone} / {skill.topics.length}</H2>
          <div className="text-[12px] text-muted mb-2">Tick when you can define, compute in SQL, and interpret each group in business terms.</div>
        </Card>
        <Card>
          <H2>Evidence</H2>
          <div className="mt-2 space-y-2">{ev.checks.map((c) => <div key={c.key}><div className="flex justify-between text-[12px]"><span className="text-soft">{c.label}</span>{!c.bool && c.key !== 'concepts' && <button className="text-accent-glow" onClick={() => addEvidence(id, c.key, 1)}>+1</button>}{c.bool && <button className="text-accent-glow" onClick={() => addEvidence(id, c.key, !c.ok)}>{c.ok ? 'done' : 'mark'}</button>}</div><Bar value={c.progress} color={skillColor(id)} className="mt-1" height={4} /></div>)}</div>
          <Link to={`/projects/${meta.project}`} className="btn-subtle w-full justify-center mt-3">Open {meta.project.toUpperCase()} project</Link>
        </Card>
        <div className="lg:col-span-3"><TopicTable topics={skill.topics} /></div>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <H2>Business questions you must be able to answer</H2>
          <div className="mt-2 space-y-1.5">{meta.questions.map((q, i) => <div key={q} className="flex items-start gap-2 text-[13px] border border-line rounded-md px-2.5 py-2"><span className="num text-muted">{String(i + 1).padStart(2, '0')}</span><span className="flex-1 text-soft">{q}</span><button className="btn-ghost btn-xs" onClick={() => addEvidence(id, 'business', 1)}><Check size={11} />Answered</button></div>)}</div>
          <Link to={`/interviews?tab=${encodeURIComponent(meta.caseTab)}`} className="btn-ghost btn-xs mt-3">Practice {meta.caseTab}</Link>
        </Card>
        <Card>
          <H2>Metric notes ({notes.length})</H2>
          <div className="mt-2 space-y-1.5 max-h-[300px] overflow-y-auto pr-1">{notes.map((n) => <Collapsible key={n.id} title={n.title} right={<span className="font-mono text-[10.5px] text-muted hidden sm:inline">{n.formula.slice(0, 40)}</span>}><div className="text-[12.5px] space-y-1"><div><span className="text-muted">Formula:</span> <span className="font-mono">{n.formula}</span></div><div><span className="text-muted">Interpretation:</span> {n.interp}</div><div><span className="text-muted">Interview:</span> {n.iq}</div></div></Collapsible>)}</div>
          <div className="flex gap-2 mt-3"><Link to="/notes" className="btn-ghost btn-xs">Add metric note</Link><Link to={`/jobs?tab=companies&cat=${encodeURIComponent(meta.companies)}`} className="btn-ghost btn-xs">Target companies</Link><Link to="/resume" className="btn-ghost btn-xs">{id} resume version</Link></div>
        </Card>
      </div>
    </div>
  )
}
