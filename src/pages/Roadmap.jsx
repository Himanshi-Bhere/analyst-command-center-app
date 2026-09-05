import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Circle, Lock } from 'lucide-react'
import { useStore } from '../store/useStore'
import { PageHeader, Card, Bar, Chip, Label, H2, Checkbox } from '../components/ui'
import { MONTHS, WEEKS, READINESS_CHECKLIST } from '../data/roadmap'
import { weekNumberFor, weekStartFor } from '../engine/tasks'
import { weekStats, readiness, projectsSummary, roadmapProgress, READINESS_LABELS } from '../engine/scoring'
import { skillColor, cn } from '../lib/utils'
import { SKILL_MAP, SKILL_TREE } from '../data/skills'
import { fmtShort, addDays, monthKey } from '../lib/dates'

const MILESTONES = [
  { week: 4, label: 'SQL: CTEs + window functions without Google', check: (s) => ['sql-cte', 'sql-rank', 'sql-laglead', 'sql-rolling'].every((t) => s.topics[t]) },
  { week: 4, label: 'Aptitude habit locked: 4 quant topics, 400+ questions', check: (s) => (s.aptitude?.solved || 0) >= 400 },
  { week: 6, label: 'Excel: XLOOKUP + Pivot Tables + cleaning workflow', check: (s, ev) => ev.excel.conceptPct >= 70 },
  { week: 8, label: 'Executive Power BI dashboard on a star schema', check: (s, ev) => ev.powerbi.conceptPct >= 80 },
  { week: 10, label: 'Project 1: E-Commerce Checkout Intelligence shipped', check: (s, ev, ps) => ps[0]?.shipped },
  { week: 12, label: 'Domain metric vault: 40+ metrics interpreted', check: (s, ev) => ev.retail.conceptPct === 100 && ev.bfsi.conceptPct === 100 && ev.commercial.conceptPct === 100 },
  { week: 12, label: 'Project 2: BFSI Risk & Fraud Intelligence shipped', check: (s, ev, ps) => ps[1]?.shipped },
  { week: 14, label: 'Project 3: Commercial Revenue Command Center shipped', check: (s, ev, ps) => ps[2]?.shipped },
  { week: 15, label: 'Resume (3 versions) + LinkedIn + GitHub polished', check: (s) => (s.resume?.score || 0) >= 80 && !!s.resume?.versions?.retail },
  { week: 16, label: 'Readiness ≥ 85 · first application batch (50+) out', check: (s, ev, ps, r) => r.total >= 85 },
]

const SEQUENCE_RULES = [
  'SQL runs first and never stops — window functions by week 4 are the filter every analyst interview applies.',
  'Aptitude is a daily 1-hour habit from day 1 (IndiaBix) because the aptitude test is the first screen at Indian employers.',
  'Power BI only starts after SQL joins (week 5) so every dashboard sits on a proper data model, not a flat CSV.',
  'Python is deliberately late (week 9+) and analytics-only: Pandas cleaning and automation, never software engineering.',
  'Projects begin in week 3 and overlap with learning — 20% theory / 80% practice.',
  'DSA Lite is capped at LOW priority and lives inside spare slots; it must never steal from SQL, Power BI, Excel, Stats, Projects or Aptitude.',
]

export default function Roadmap() {
  const state = useStore()
  const today = state.today()
  const curW = weekNumberFor(today)
  const rp = roadmapProgress(state, today)
  const curM = monthKey(today)
  const r = useMemo(() => readiness(state), [state.topics, state.evidence, state.projects, state.interview, state.aptitude])
  const ps = useMemo(() => projectsSummary(state), [state.projects])
  const ev = r.ev
  const monthPct = (m) => { const ws = WEEKS.filter((w) => w.month === m.key); if (!ws.length) return null; const st = ws.map((w) => weekStats(state, weekStartFor(w.n))); const t = st.reduce((a, x) => a + x.total, 0); const d = st.reduce((a, x) => a + x.done, 0); return t ? Math.round((d / t) * 100) : 0 }
  const learned = Object.keys(state.topics).filter((k) => state.topics[k])
  const foundation = SKILL_TREE.flatMap((s) => s.topics.filter((t) => state.topics[t.id]).map((t) => t.name)).slice(0, 12)
  const gaps = SKILL_TREE.filter((s) => ['sql', 'powerbi', 'excel', 'statistics'].includes(s.id)).flatMap((s) => s.topics.filter((t) => !state.topics[t.id] && t.week <= Math.max(curW, 4)).map((t) => t.name)).slice(0, 10)
  const nextTopics = WEEKS.filter((w) => w.n >= curW).slice(0, 2).flatMap((w) => w.topics.slice(0, 4))

  return (
    <div>
      <PageHeader eyebrow="Plan" title="Roadmap" subtitle="September 2026 → May 2027. Four months to job-ready, then automatic Job Search Mode." right={<Chip className="text-accent-glow border-accent/40 bg-accent/10">{rp.pct}% of Phase 1 · day {rp.elapsed + 1}/{rp.days}</Chip>} />

      {/* month phase strip */}
      <div className="overflow-x-auto pb-2 mb-4">
        <div className="flex gap-2 min-w-max">
          {MONTHS.map((m) => { const pct = monthPct(m); const cur = m.key === curM; const past = m.key < curM; return (
            <Link key={m.key} to="/monthly" className={cn('w-[168px] shrink-0 card px-3.5 py-3 card-hover', cur && 'border-accent ring-1 ring-accent/50', past && 'opacity-70')}>
              <div className="text-[10.5px] text-muted">{m.name.split(' ')[0]} {m.name.split(' ')[1]}</div>
              <div className="text-[12.5px] font-semibold leading-snug mt-1 min-h-[34px]">{m.title.split(' — ')[0].split(' + ').slice(0, 3).join(' + ')}</div>
              <div className="flex items-center justify-between mt-2 text-[10.5px]"><span className={cn(m.mode === 'JOB_SEARCH' ? 'text-warn' : m.mode === 'LAUNCH' ? 'text-ok' : 'text-info')}>{m.mode === 'JOB_SEARCH' ? 'Job search' : m.mode === 'LAUNCH' ? 'Launch' : 'Learning'}</span>{pct !== null && <span className="num text-muted">{pct}%</span>}</div>
              {pct !== null && <div className="mt-1.5 h-1 rounded-full bg-line overflow-hidden"><div className="h-full bg-accent" style={{ width: `${pct}%` }} /></div>}
            </Link>
          ) })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* milestone timeline */}
        <div className="card overflow-hidden self-start">
          <div className="px-5 py-3 border-b border-line flex items-center justify-between"><H2>Milestone timeline</H2><span className="text-[12px] text-muted num">{MILESTONES.filter((m) => m.check(state, ev, ps, r)).length} / {MILESTONES.length} reached</span></div>
          <div className="relative px-5 py-2">
            <div className="absolute left-[27px] top-4 bottom-4 w-px bg-line" />
            {MILESTONES.map((m, i) => { const due = addDays(weekStartFor(m.week), 6); const hit = m.check(state, ev, ps, r); const late = !hit && due < today; const st = weekStats(state, weekStartFor(m.week)); return (
              <div key={i} className="relative flex items-start gap-4 py-2.5 pl-1">
                <span className={cn('relative z-10 mt-1 h-3 w-3 rounded-full border-2 shrink-0 bg-card', hit ? 'border-ok bg-ok' : late ? 'border-warn' : m.week === curW ? 'border-accent' : 'border-line2')} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3"><span className={cn('text-[13px] font-medium leading-snug', hit ? 'text-ok' : 'text-ink')}>{m.label}</span><span className={cn('num text-[11px] shrink-0', late ? 'text-warn' : 'text-muted')}>{due}</span></div>
                  <div className="text-[11px] text-muted mt-0.5">W{m.week} · {hit ? 'Reached' : late ? 'Overdue — review in Catch-Up' : `week ${st.pct}% complete`}</div>
                </div>
              </div>
            ) })}
            <div className="relative flex items-start gap-4 py-2.5 pl-1"><span className="relative z-10 mt-1 h-3 w-3 rounded-full border-2 border-line2 bg-card shrink-0" /><div className="flex-1"><div className="flex justify-between gap-3"><span className="text-[13px] font-medium">Full-time analytics role secured before graduation</span><span className="num text-[11px] text-muted">2027-05-30</span></div><div className="text-[11px] text-muted mt-0.5">Job Search Mode · Jan → May 2027</div></div></div>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <H2>Sequence rules (why the roadmap is ordered this way)</H2>
            <ol className="mt-3 space-y-2 text-[12.5px] text-soft list-decimal pl-5">{SEQUENCE_RULES.map((t) => <li key={t}>{t}</li>)}</ol>
          </Card>
          <Card>
            <H2>Where I am currently</H2>
            <div className="grid sm:grid-cols-2 gap-4 mt-3">
              <div>
                <div className="label mb-1.5">Confirmed foundation ({learned.length})</div>
                <div className="flex flex-wrap gap-1.5">{foundation.length ? foundation.map((t) => <span key={t} className="chip text-ok border-ok/30 bg-ok/10">{t}</span>) : <span className="text-[12px] text-muted">Nothing marked learned yet — tick topics in the Skill trees.</span>}</div>
              </div>
              <div>
                <div className="label mb-1.5">Primary gaps</div>
                <div className="flex flex-wrap gap-1.5">{gaps.map((t) => <span key={t} className="chip text-bad border-bad/30 bg-bad/10">{t}</span>)}</div>
              </div>
            </div>
            <div className="mt-4 text-[12.5px]"><span className="label">Next up</span><div className="text-soft mt-1">{nextTopics.join(' · ')}</div></div>
            <div className="mt-3 text-[12.5px]"><span className="label">Fundamental gaps to fill</span><div className="text-soft mt-1">{r.breakdown.slice(0, 3).map((b) => `${READINESS_LABELS[b.key] || b.key} (${b.score}%)`).join(' · ')}</div></div>
            <div className="mt-3 text-[12.5px]"><span className="label">Biggest mistakes to avoid</span><div className="text-soft mt-1">Watching courses without typing queries · treating Python like software engineering · starting Power BI before joins · skipping the daily aptitude hour · shipping projects without a live dashboard link.</div></div>
          </Card>
        </div>
      </div>

      {/* week table */}
      <div className="card overflow-hidden mt-4">
        <div className="px-5 py-3 border-b border-line flex items-center justify-between"><H2>Week by week — Phase 1</H2><Link to="/weekly" className="text-[12px] text-accent-glow hover:underline">Open weekly plan</Link></div>
        <div className="overflow-x-auto"><table className="w-full text-[13px]">
          <thead><tr className="text-left border-b border-line bg-raised/40"><th className="label font-semibold px-4 py-2.5">Week</th><th className="label font-semibold px-3 py-2.5">Dates</th><th className="label font-semibold px-3 py-2.5">Primary</th><th className="label font-semibold px-3 py-2.5">Focus</th><th className="label font-semibold px-3 py-2.5 w-[160px]">Progress</th><th className="label font-semibold px-3 py-2.5 text-center">Status</th></tr></thead>
          <tbody>{WEEKS.map((w) => { const st = weekStats(state, weekStartFor(w.n)); const cur = w.n === curW; const done = st.total > 0 && st.done === st.total; return (
            <tr key={w.n} className={cn('border-t border-line/70', cur && 'bg-accent/10')}>
              <td className="px-4 py-2 num font-semibold">{w.code}</td>
              <td className="px-3 py-2 text-muted whitespace-nowrap num">{fmtShort(weekStartFor(w.n))} – {fmtShort(addDays(weekStartFor(w.n), 6))}</td>
              <td className="px-3 py-2"><span className="chip" style={{ color: skillColor(w.primary), borderColor: skillColor(w.primary) + '55', background: skillColor(w.primary) + '14' }}>{SKILL_MAP[w.primary]?.name || w.primary}</span></td>
              <td className="px-3 py-2"><div className="font-medium">{w.title}</div><div className="text-[11.5px] text-muted truncate max-w-[420px]">{w.topics.join(' · ')}</div></td>
              <td className="px-3 py-2"><div className="flex items-center gap-2"><div className="flex-1 h-1.5 rounded-full bg-line overflow-hidden"><div className={cn('h-full', done ? 'bg-ok' : 'bg-accent')} style={{ width: `${st.pct}%` }} /></div><span className="num text-[11px] text-muted w-10 text-right">{st.done}/{st.total}</span></div></td>
              <td className="px-3 py-2 text-center"><input type="checkbox" className="checkbox pointer-events-none" readOnly tabIndex={-1} checked={done} /></td>
            </tr>
          ) })}</tbody>
        </table></div>
      </div>
    </div>
  )
}

export function DecemberChecklist() {
  const state = useStore()
  const { toggleChecklist } = state
  const r = readiness(state)
  const all = Object.values(READINESS_CHECKLIST).flat()
  const done = all.filter((i) => state.checklist[i]).length
  // auto-suggestions from evidence
  const auto = useMemo(() => {
    const ev = r.ev; const ps = projectsSummary(state); const s = {}
    s['Window Functions'] = state.topics['sql-rank'] && state.topics['sql-laglead'] && state.topics['sql-rolling']; s['CTEs'] = state.topics['sql-cte']; s['Complex joins'] = state.topics['sql-joins'] && state.topics['sql-union']
    s['SQL interview ready'] = ev.sql.level === 4; s['Power BI ready'] = ev.powerbi.level >= 3; s['DAX ready'] = state.topics['pbi-dax1'] && state.topics['pbi-context'] && state.topics['pbi-time']; s['Star Schema'] = state.topics['pbi-model']; s['Excel ready'] = ev.excel.level >= 3; s['Statistics ready'] = ev.statistics.level >= 3; s['Python analytics ready'] = ev.python.level >= 3
    s['E-Commerce metrics'] = ev.retail.conceptPct === 100; s['BFSI metrics'] = ev.bfsi.conceptPct === 100; s['Commercial metrics'] = ev.commercial.conceptPct === 100
    s['3 major projects'] = ps.every((p) => p.shipped); s['Live dashboards'] = ps.every((p) => state.projects[p.id]?.stages?.['Live Dashboard']); s['READMEs'] = ps.every((p) => state.projects[p.id]?.stages?.['README']); s['Case studies'] = ps.every((p) => state.projects[p.id]?.stages?.['Case Study']); s['GitHub polished'] = ps.every((p) => state.projects[p.id]?.stages?.['GitHub'])
    s['Applications started'] = state.applications.some((a) => !['Wishlist', 'Ready to Apply'].includes(a.status)); s['Job trackers'] = state.applications.length > 0
    return s
  }, [state])
  return (
    <div>
      <PageHeader eyebrow="Milestone" title="DECEMBER 2026 — APPLICATION READY" subtitle="The gate between Learning Mode and Job Search Mode. Items with a dot are auto-detected from your evidence; you still confirm them manually." right={<Chip className="text-accent-glow border-accent/40 bg-accent/10">{done} / {all.length} · readiness {r.total}</Chip>} />
      <Bar value={Math.round((done / all.length) * 100)} className="mb-4" color="#3ddc97" height={8} />
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Object.entries(READINESS_CHECKLIST).map(([g, items]) => (
          <Card key={g}><Label>{g}</Label><div className="mt-2 space-y-2">{items.map((i) => <div key={i} className="flex items-center gap-2"><Checkbox label={i} checked={state.checklist[i]} onChange={() => toggleChecklist(i)} className="flex-1" />{auto[i] && !state.checklist[i] && <span className="h-1.5 w-1.5 rounded-full bg-ok" title="Evidence suggests this is done" />}</div>)}</div></Card>
        ))}
      </div>
    </div>
  )
}
