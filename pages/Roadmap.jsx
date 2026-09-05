import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Circle, Lock } from 'lucide-react'
import { useStore } from '../store/useStore'
import { PageHeader, Card, Bar, Chip, Label, H2, Checkbox } from '../components/ui'
import { MONTHS, WEEKS, READINESS_CHECKLIST } from '../data/roadmap'
import { weekNumberFor, weekStartFor } from '../engine/tasks'
import { weekStats, readiness, projectsSummary, roadmapProgress } from '../engine/scoring'
import { skillColor, cn } from '../lib/utils'
import { SKILL_MAP } from '../data/skills'
import { fmtShort, addDays, monthKey } from '../lib/dates'

export default function Roadmap() {
  const state = useStore()
  const today = state.today()
  const curW = weekNumberFor(today)
  const rp = roadmapProgress(state, today)
  const curM = monthKey(today)
  return (
    <div>
      <PageHeader eyebrow="Roadmap" title="Master Roadmap — September 2026 → May 2027" subtitle="Four aggressive months to job-ready, then automatic switch to Job Search Mode. Subjects overlap on purpose: SQL never stops, aptitude is daily, projects start in week 3." right={<Chip className="text-accent-glow border-accent/40 bg-accent/10">Phase 1: {rp.pct}% · day {rp.elapsed + 1}/{rp.days}</Chip>} />

      <div className="relative">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-line hidden md:block" />
        <div className="space-y-6">
          {MONTHS.map((m) => {
            const weeks = WEEKS.filter((w) => w.month === m.key)
            const status = m.key < curM ? 'past' : m.key === curM ? 'current' : 'future'
            return (
              <div key={m.key} className="md:pl-10 relative">
                <div className={cn('absolute left-[9px] top-2 h-3.5 w-3.5 rounded-full border-2 hidden md:block', status === 'current' ? 'bg-accent border-accent shadow-glow' : status === 'past' ? 'bg-ok border-ok' : 'bg-panel border-line2')} />
                <Card className={cn(status === 'current' && 'border-accent/40')}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2"><Label>{m.name}</Label><Chip className="text-soft border-line2 bg-raised">{m.phase}</Chip><Chip className={m.mode === 'JOB_SEARCH' ? 'text-warn border-warn/40 bg-warn/10' : 'text-info border-info/40 bg-info/10'}>{m.mode.replace('_', ' ')}</Chip>{status === 'current' && <Chip className="text-accent-glow border-accent/40 bg-accent/10">NOW</Chip>}</div>
                      <h3 className="text-[17px] font-semibold mt-1">{m.title}</h3>
                      <p className="text-[13px] text-soft mt-1 max-w-3xl">{m.primary}</p>
                    </div>
                    <Link to="/monthly" className="btn-ghost btn-xs">Monthly plan</Link>
                  </div>
                  {weeks.length > 0 && (
                    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">
                      {weeks.map((w) => { const st = weekStats(state, weekStartFor(w.n)); const isCur = w.n === curW; return (
                        <div key={w.n} className={cn('rounded-lg border p-3', isCur ? 'border-accent/50 bg-accent/5' : w.n < curW ? 'border-line bg-raised/40' : 'border-line bg-panel/40')}>
                          <div className="flex justify-between items-center"><span className="text-[11.5px] font-bold tracking-wide" style={{ color: skillColor(w.primary) }}>{w.code} · {SKILL_MAP[w.primary]?.name || w.primary}</span>{w.n < curW && st.pct === 100 ? <CheckCircle2 size={13} className="text-ok" /> : w.n > curW ? <Lock size={12} className="text-muted" /> : <Circle size={12} className="text-accent-glow" />}</div>
                          <div className="text-[13.5px] font-semibold mt-1">{w.title}</div>
                          <div className="text-[11.5px] text-muted mt-0.5">{fmtShort(weekStartFor(w.n))} – {fmtShort(addDays(weekStartFor(w.n), 6))}</div>
                          <ul className="mt-2 space-y-0.5">{w.topics.map((t) => <li key={t} className="text-[11.5px] text-soft flex gap-1.5"><span className="text-muted">·</span>{t}</li>)}</ul>
                          <div className="mt-2 flex items-center gap-2"><Bar value={st.pct} color={skillColor(w.primary)} className="flex-1" /><span className="num text-[10.5px] text-muted">{st.done}/{st.total}</span></div>
                        </div>
                      ) })}
                    </div>
                  )}
                  {weeks.length === 0 && (
                    <div className="mt-3 grid sm:grid-cols-2 gap-2">{m.targets.map((t) => <div key={t} className="text-[12.5px] text-soft bg-raised/50 border border-line rounded-md px-2.5 py-1.5">{t}</div>)}</div>
                  )}
                </Card>
              </div>
            )
          })}
        </div>
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
