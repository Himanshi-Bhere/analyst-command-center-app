import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ExternalLink as Ext, Github, BarChart3, FileText, Check, Circle, Save } from 'lucide-react'
import { useStore } from '../store/useStore'
import { PageHeader, Card, Label, Bar, Chip, H2, Checkbox, Field, Tabs, Confidence, ProgressRing } from '../components/ui'
import { PROJECTS, PROJECT_STAGES, GITHUB_REPOS } from '../data/projects'
import { projectProgress, projectsSummary } from '../engine/scoring'
import { PROJECT_SIM_QUESTIONS } from '../data/interview'
import { cn } from '../lib/utils'

export function ProjectHub() {
  const state = useStore()
  const ps = projectsSummary(state)
  return (
    <div>
      <PageHeader eyebrow="Projects" title="Project Hub" subtitle="Three flagship projects that simulate real analyst work. No Titanic, no Superstore. Each stage is evidence; 'shipped' = live dashboard + README + GitHub." right={<Chip className="text-accent-glow border-accent/40 bg-accent/10">{ps.filter((p) => p.shipped).length} / 3 shipped</Chip>} />
      <div className="grid lg:grid-cols-3 gap-4">
        {ps.map((p) => { const st = state.projects[p.id]?.stages || {}; return (
          <Card key={p.id} className="flex flex-col" style={{ borderTopColor: p.color, borderTopWidth: 2 }}>
            <div className="flex items-start justify-between gap-2"><div><Label>{p.code}</Label><Link to={`/projects/${p.id}`} className="text-[16px] font-semibold hover:text-accent-glow leading-snug block mt-0.5">{p.name}</Link></div><ProgressRing value={p.pct} size={52} stroke={5} color={p.color} /></div>
            <div className="text-[12.5px] text-muted mt-1">{p.tagline}</div>
            <div className="flex flex-wrap gap-1 mt-2">{p.stack.map((s) => <Chip key={s} className="text-soft border-line2 bg-raised">{s}</Chip>)}</div>
            <div className="font-mono text-[11px] text-muted mt-3">[{'█'.repeat(Math.round(p.pct / 5))}{'-'.repeat(20 - Math.round(p.pct / 5))}] {p.pct}%</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 text-[12px]">{PROJECT_STAGES.map((s) => <button key={s} onClick={() => state.toggleStage(p.id, s)} className={cn('flex items-center gap-1.5 text-left hover:text-ink', st[s] ? 'text-ok' : 'text-muted')}>{st[s] ? <Check size={11} /> : <Circle size={10} />}{s}</button>)}</div>
            <div className="flex gap-2 mt-4 pt-3 border-t border-line">
              <Link to={`/projects/${p.id}`} className="btn-primary btn-xs flex-1 justify-center">Open workspace</Link>
              {state.projects[p.id]?.links?.dashboard && <a className="btn-ghost btn-xs" href={state.projects[p.id].links.dashboard} target="_blank" rel="noreferrer"><BarChart3 size={11} /></a>}
              {state.projects[p.id]?.links?.github && <a className="btn-ghost btn-xs" href={state.projects[p.id].links.github} target="_blank" rel="noreferrer"><Github size={11} /></a>}
            </div>
          </Card>
        ) })}
      </div>
    </div>
  )
}

export function ProjectDetail() {
  const { id } = useParams()
  const state = useStore()
  const { toggleStage, setProject, setSim } = state
  const p = PROJECTS.find((x) => x.id === id)
  const pp = projectProgress(id, state)
  const ps = state.projects[id] || { stages: {}, links: {} }
  const [tab, setTab] = useState('Overview')
  const [links, setLinks] = useState({ github: '', dashboard: '', readme: '', caseStudy: '', ...(ps.links || {}) })
  const [text, setText] = useState({ insights: ps.insights || '', recs: ps.recs || '', notes: ps.notes || '', deadline: ps.deadline || '', dataset: ps.dataset || '' })
  const sim = state.simScores[id] || {}
  const simAvg = Object.values(sim).length ? (Object.values(sim).reduce((a, b) => a + b, 0) / Object.values(sim).length).toFixed(1) : '—'
  if (!p) return null
  const TABS = ['Overview', 'SQL', 'Python', 'Power BI', 'Excel', 'Insights & Recs', 'Links & README', 'Interview']
  return (
    <div>
      <PageHeader eyebrow={p.code} title={p.name} subtitle={p.tagline} right={<><Chip color={p.color}>{pp.pct}% · {pp.done}/{pp.total} stages</Chip>{pp.shipped && <Chip className="text-ok border-ok/40 bg-ok/10">SHIPPED</Chip>}</>} />
      <div className="grid lg:grid-cols-4 gap-4 mb-4">
        <Card className="lg:col-span-3">
          <H2>Stage tracker</H2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2">{PROJECT_STAGES.map((s, i) => <button key={s} onClick={() => toggleStage(id, s)} className={cn('text-left text-[12px] rounded-md border px-2 py-1.5 flex items-center gap-1.5', ps.stages?.[s] ? 'border-ok/40 bg-ok/10 text-ok' : 'border-line bg-raised/40 text-soft hover:border-line2')}>{ps.stages?.[s] ? <Check size={11} /> : <span className="num text-muted text-[10px]">{String(i + 1).padStart(2, '0')}</span>}{s}</button>)}</div>
          <Bar value={pp.pct} color={p.color} className="mt-3" />
        </Card>
        <Card>
          <Label>Deadline</Label><input type="date" className="input mt-1" value={text.deadline} onChange={(e) => { setText({ ...text, deadline: e.target.value }); setProject(id, { deadline: e.target.value }) }} />
          <Label className="mt-3">Stack</Label><div className="flex flex-wrap gap-1 mt-1">{p.stack.map((s) => <Chip key={s} className="text-soft border-line2 bg-raised">{s}</Chip>)}</div>
          <Label className="mt-3">Interview sim avg</Label><div className="num text-[18px] font-bold">{simAvg} <span className="text-muted text-[12px]">/ 5</span></div>
        </Card>
      </div>
      <Tabs tabs={TABS} value={tab} onChange={setTab} className="mb-3" />
      {tab === 'Overview' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card><Label>Business problem</Label><p className="text-[13.5px] text-soft mt-1 leading-relaxed">{p.problem}</p><Label className="mt-4">Data model</Label><p className="text-[13px] font-mono text-soft mt-1 leading-relaxed">{p.model}</p></Card>
          <Card><Label>Dataset</Label><p className="text-[13px] text-soft mt-1">{p.dataset.desc}</p><div className="mt-2 space-y-1">{p.dataset.sources.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[12.5px] text-accent-glow hover:underline">{s.name}<Ext size={11} /></a>)}</div><Field label="Dataset I chose (link / notes)" className="mt-3"><input className="input" value={text.dataset} onChange={(e) => setText({ ...text, dataset: e.target.value })} onBlur={() => setProject(id, { dataset: text.dataset })} placeholder="https://kaggle.com/… + why it fits" /></Field><Label className="mt-4">Metrics</Label><div className="flex flex-wrap gap-1 mt-1">{p.metrics.map((m) => <Chip key={m} color={p.color}>{m}</Chip>)}</div></Card>
        </div>
      )}
      {tab === 'SQL' && <ScopeCard title="SQL scope — CTEs, window functions, complex joins" items={p.sqlScope} stage="SQL Analysis" pid={id} />}
      {tab === 'Python' && <ScopeCard title="Python scope — cleaning pipeline, not ML" items={p.pythonScope} stage="Python" pid={id} />}
      {tab === 'Power BI' && <ScopeCard title="Power BI scope — executive dashboard" items={p.pbiScope} stage="Power BI" pid={id} />}
      {tab === 'Excel' && <ScopeCard title="Excel scope — reconciliation & scenarios" items={p.excelScope} stage="Excel" pid={id} />}
      {tab === 'Insights & Recs' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card><H2>Insights (fill the blanks with real numbers)</H2><div className="text-[12px] text-muted mt-1 space-y-0.5">{p.insightsTemplate.map((t) => <div key={t}>· {t}</div>)}</div><textarea rows={8} className="input mt-2 font-mono text-[12.5px]" value={text.insights} onChange={(e) => setText({ ...text, insights: e.target.value })} placeholder="1. Largest drop-off is at payment (31%), concentrated on Android app v4.2…" /><button className="btn-primary btn-xs mt-2" onClick={() => { setProject(id, { insights: text.insights }); if (text.insights.length > 80 && !ps.stages?.Insights) toggleStage(id, 'Insights') }}><Save size={11} />Save insights</button></Card>
          <Card><H2>Business recommendations</H2><div className="text-[12px] text-muted mt-1 space-y-0.5">{p.recsTemplate.map((t) => <div key={t}>· {t}</div>)}</div><textarea rows={8} className="input mt-2 font-mono text-[12.5px]" value={text.recs} onChange={(e) => setText({ ...text, recs: e.target.value })} placeholder="1. Fix payment-gateway retry on Android: projected recovery ₹18L/month…" /><button className="btn-primary btn-xs mt-2" onClick={() => { setProject(id, { recs: text.recs }); if (text.recs.length > 80 && !ps.stages?.Recommendations) toggleStage(id, 'Recommendations') }}><Save size={11} />Save recommendations</button></Card>
        </div>
      )}
      {tab === 'Links & README' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <H2>Links</H2>
            <div className="space-y-2 mt-2">{[['github', 'GitHub repository'], ['dashboard', 'Live dashboard (Power BI Service / NovyPro)'], ['readme', 'README / case study doc'], ['caseStudy', '1-page executive memo (PDF)']].map(([k, l]) => <Field key={k} label={l}><input className="input" value={links[k]} onChange={(e) => setLinks({ ...links, [k]: e.target.value })} placeholder="https://" /></Field>)}</div>
            <button className="btn-primary btn-xs mt-3" onClick={() => { setProject(id, { links }); if (links.github && !ps.stages?.GitHub) toggleStage(id, 'GitHub'); if (links.dashboard && !ps.stages?.['Live Dashboard']) toggleStage(id, 'Live Dashboard') }}><Save size={11} />Save links</button>
            <div className="flex gap-2 mt-3">{links.github && <a className="btn-ghost btn-xs" href={links.github} target="_blank" rel="noreferrer"><Github size={11} />Repo</a>}{links.dashboard && <a className="btn-ghost btn-xs" href={links.dashboard} target="_blank" rel="noreferrer"><BarChart3 size={11} />Dashboard</a>}{links.readme && <a className="btn-ghost btn-xs" href={links.readme} target="_blank" rel="noreferrer"><FileText size={11} />README</a>}</div>
          </Card>
          <Card>
            <H2>Executive README structure</H2>
            <ol className="mt-2 text-[13px] text-soft space-y-1 list-decimal pl-5"><li>One-line business problem + stakeholder</li><li>Architecture flowchart: Raw data → Python → SQL → Power BI</li><li>Live dashboard link + GIF of interactivity</li><li>Data model diagram (star schema)</li><li><code className="font-mono text-[12px]">sql_queries/</code> with commented CTEs & window functions</li><li>Key findings — 3 bullets, each with a number</li><li>Recommendations — 3 actions with expected ₹ impact</li><li>Validation & limitations</li><li>How to reproduce</li></ol>
            <Field label="Working notes" className="mt-3"><textarea rows={4} className="input" value={text.notes} onChange={(e) => setText({ ...text, notes: e.target.value })} onBlur={() => setProject(id, { notes: text.notes })} /></Field>
          </Card>
        </div>
      )}
      {tab === 'Interview' && (
        <Card>
          <H2>Project Interview Simulator</H2>
          <div className="text-[12.5px] text-muted mt-1">Answer each out loud (record yourself). Rate honestly. Interview confidence score feeds the "Interview Ready" stage.</div>
          <div className="mt-3 space-y-2">{[...PROJECT_SIM_QUESTIONS, ...p.interviewQs.filter((q) => !PROJECT_SIM_QUESTIONS.includes(q))].map((q, i) => <div key={q} className="border border-line rounded-md p-2.5 flex flex-wrap items-center gap-3"><span className="num text-muted text-[11px]">{String(i + 1).padStart(2, '0')}</span><div className="flex-1 min-w-[220px] text-[13px]">{q.replace('your project', `your ${p.name.split(' ')[0]} project`)}</div><Confidence size="sm" value={sim[i]} onChange={(v) => { setSim(id, i, v); const all = { ...sim, [i]: v }; const vals = Object.values(all); if (vals.length >= 8 && vals.reduce((a, b) => a + b, 0) / vals.length >= 4 && !ps.stages?.['Interview Ready']) toggleStage(id, 'Interview Ready') }} /></div>)}</div>
          <div className="mt-3 text-[12.5px]">Confidence score: <span className="num font-semibold">{simAvg}</span> / 5 — "Interview Ready" auto-unlocks at ≥ 4.0 across 8+ questions.</div>
        </Card>
      )}
    </div>
  )
}

function ScopeCard({ title, items, stage, pid }) {
  const state = useStore()
  const done = state.projects[pid]?.stages?.[stage]
  return (
    <Card>
      <div className="flex items-center justify-between"><H2>{title}</H2><button className={cn('btn-xs', done ? 'btn-subtle' : 'btn-primary')} onClick={() => state.toggleStage(pid, stage)}>{done ? `${stage} ✓` : `Mark ${stage} complete`}</button></div>
      <ul className="mt-3 space-y-1.5">{items.map((s, i) => <li key={s} className="flex gap-2 text-[13px] text-soft"><span className="num text-muted">{String(i + 1).padStart(2, '0')}</span>{s}</li>)}</ul>
    </Card>
  )
}

export function Portfolio() {
  const state = useStore()
  const ps = projectsSummary(state)
  return (
    <div>
      <PageHeader eyebrow="Projects" title="Portfolio" subtitle="What a recruiter sees in 15 seconds. Every project needs a clickable live dashboard, a README with numbers, and a 60-second pitch." />
      <div className="space-y-4">
        {ps.map((p) => { const st = state.projects[p.id] || {}; return (
          <Card key={p.id} className="grid lg:grid-cols-3 gap-4">
            <div><Label>{p.code}</Label><div className="text-[17px] font-semibold mt-0.5">{p.name}</div><div className="text-[12.5px] text-muted mt-1">{p.problem.slice(0, 160)}…</div><div className="flex flex-wrap gap-1 mt-2">{p.stack.map((s) => <Chip key={s} className="text-soft border-line2 bg-raised">{s}</Chip>)}</div></div>
            <div><Label>Insights</Label><div className="text-[12.5px] text-soft mt-1 whitespace-pre-wrap">{st.insights || <span className="text-muted italic">Not written yet — Insights tab in the project workspace.</span>}</div><Label className="mt-3">Recommendations</Label><div className="text-[12.5px] text-soft mt-1 whitespace-pre-wrap">{st.recs || <span className="text-muted italic">Not written yet.</span>}</div></div>
            <div><Label>Links</Label><div className="mt-1 space-y-1 text-[12.5px]">{[['dashboard', 'Live dashboard'], ['github', 'GitHub'], ['readme', 'README'], ['caseStudy', 'Executive memo']].map(([k, l]) => <div key={k} className="flex items-center gap-2">{st.links?.[k] ? <a href={st.links[k]} target="_blank" rel="noreferrer" className="text-accent-glow hover:underline inline-flex items-center gap-1">{l}<Ext size={11} /></a> : <span className="text-muted">{l} — missing</span>}</div>)}</div><Bar value={p.pct} color={p.color} className="mt-3" /><div className="text-[11px] num text-muted mt-1">{p.pct}% · {p.shipped ? 'shipped' : 'in progress'}</div><Link to={`/projects/${p.id}`} className="btn-ghost btn-xs mt-2">Open workspace</Link></div>
          </Card>
        ) })}
      </div>
    </div>
  )
}
