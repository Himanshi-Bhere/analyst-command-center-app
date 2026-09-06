import React, { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ExternalLink as Ext, Copy, Check, ArrowLeft, Github } from 'lucide-react'
import { useStore } from '../store/useStore'
import { PageHeader, Card, H2, Label, Field } from '../components/ui'
import { WEEKLY_SHOWCASE, SHOWCASE_STAGES, SHOWCASE_BY_WEEK } from '../data/weekly'
import { weekNumberFor, weekStartFor } from '../engine/tasks'
import { DAY_SHORT, dow } from '../lib/dates'
import { showcaseSummary } from '../engine/github'
import { fmtShort, addDays } from '../lib/dates'
import { cn, skillColor } from '../lib/utils'
import { SKILL_MAP } from '../data/skills'

const DOMAIN = { retail: 'Retail / E-Com', bfsi: 'BFSI', commercial: 'Commercial' }

export function ShowcaseTracker() {
  const state = useStore()
  const today = state.today()
  const curW = weekNumberFor(today)
  const sum = useMemo(() => showcaseSummary(state), [state.weekly])
  const stageCount = (k) => WEEKLY_SHOWCASE.filter((s) => state.weekly[s.id]?.stages?.[k]).length
  const cur = SHOWCASE_BY_WEEK[curW]

  return (
    <div>
      <PageHeader eyebrow="Build" title="Weekly Showcase" subtitle="One industry-shaped mini project every week — real dataset, a manager's brief, 3–4 hours, its own GitHub repo. Proof accumulates weekly instead of waiting for the flagship projects." right={<span className="chip text-accent-glow border-accent/40 bg-accent/10">{sum.shipped} / {sum.total} shipped</span>} />

      {cur && (
        <Card className="mb-4 border-accent/40">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <Label>This week · W{cur.week} · build {DAY_SHORT[dow(addDays(weekStartFor(cur.week), 5))]} → push {DAY_SHORT[dow(addDays(weekStartFor(cur.week), 6))]}</Label>
              <div className="text-[17px] font-semibold mt-1">{cur.title}</div>
              <div className="text-[12.5px] text-soft mt-1 max-w-3xl">{cur.brief}</div>
              <div className="flex flex-wrap gap-1.5 mt-2">{cur.stack.map((t) => <span key={t} className="chip text-soft border-line2 bg-raised">{t}</span>)}<span className="chip text-muted border-line2 bg-raised">{cur.hours}h</span><span className="chip" style={{ color: skillColor(cur.domain), borderColor: skillColor(cur.domain) + '55', background: skillColor(cur.domain) + '14' }}>{DOMAIN[cur.domain]}</span></div>
            </div>
            <Link to={`/showcase/${cur.id}`} className="btn-primary">Open brief</Link>
          </div>
        </Card>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-[13px]">
          <thead><tr className="text-left border-b border-line bg-raised/40">
            <th className="label font-semibold px-4 py-2.5">Week</th><th className="label font-semibold px-3 py-2.5">Showcase</th><th className="label font-semibold px-3 py-2.5">Domain</th><th className="label font-semibold px-3 py-2.5">Stack</th>
            {SHOWCASE_STAGES.map((s) => <th key={s.key} title={s.hint} className="label font-semibold px-2 py-2.5 text-center whitespace-nowrap">{s.label}<div className="num text-[10px] text-muted font-normal">{stageCount(s.key)}/{WEEKLY_SHOWCASE.length}</div></th>)}
            <th className="label font-semibold px-3 py-2.5">Repo</th>
          </tr></thead>
          <tbody>{WEEKLY_SHOWCASE.map((s) => { const w = state.weekly[s.id] || { stages: {} }; const isCur = s.week === curW; const due = addDays(weekStartFor(s.week), 6); const late = due < today && !w.stages?.pushed; const n = SHOWCASE_STAGES.filter((k) => w.stages?.[k.key]).length; return (
            <tr key={s.id} className={cn('border-t border-line/70 hover:bg-raised/30', isCur && 'bg-accent/10')}>
              <td className="px-4 py-2 num whitespace-nowrap"><span className="font-semibold">W{s.week}</span><div className="text-[10.5px] text-muted">{fmtShort(due)}</div></td>
              <td className="px-3 py-2"><Link to={`/showcase/${s.id}`} className={cn('font-medium hover:text-accent-glow', n === 5 && 'text-ok')}>{s.title}</Link><div className="text-[11px] text-muted truncate max-w-[340px]">{s.proves}</div>{late && <div className="text-[10.5px] text-warn">overdue — push what exists</div>}</td>
              <td className="px-3 py-2 whitespace-nowrap" style={{ color: skillColor(s.domain) }}>{DOMAIN[s.domain]}</td>
              <td className="px-3 py-2 text-muted whitespace-nowrap text-[12px]">{s.stack.join(' · ')}</td>
              {SHOWCASE_STAGES.map((k) => <td key={k.key} className="px-2 py-2 text-center"><input type="checkbox" className="checkbox" checked={!!w.stages?.[k.key]} onChange={() => state.toggleShowcaseStage(s.id, k.key)} aria-label={`${s.title} ${k.label}`} /></td>)}
              <td className="px-3 py-2">{w.url ? <a href={w.url} target="_blank" rel="noreferrer" className="text-accent-glow hover:underline inline-flex items-center gap-1 font-mono text-[11.5px]">{s.repo}<Ext size={10} /></a> : <span className="font-mono text-[11.5px] text-muted">{s.repo}</span>}</td>
            </tr>
          ) })}</tbody>
        </table></div>
        <div className="px-4 py-2 border-t border-line text-[11.5px] text-muted">Scoped = dataset + 3 questions · Built = deliverables exist · Pushed = public repo · README = executive template · Shared = linked on LinkedIn/resume. Day 6 of each program week builds it, day 7 pushes it (both appear automatically in Today).</div>
      </div>
    </div>
  )
}

export function ShowcaseDetail() {
  const { id } = useParams()
  const state = useStore()
  const s = WEEKLY_SHOWCASE.find((x) => x.id === id)
  const w = state.weekly[id] || { stages: {}, checks: {} }
  const [copied, setCopied] = useState(false)
  const user = state.github?.username || 'YOUR-USERNAME'
  if (!s) return <div className="text-muted">Unknown showcase. <Link to="/showcase" className="text-accent-glow">Back</Link></div>
  const checks = w.checks || {}
  const toggleCheck = (i) => state.setShowcase(id, { checks: { ...checks, [i]: !checks[i] } })
  const builtCount = s.deliverables.filter((_, i) => checks[i]).length
  const cmd = `mkdir ${s.repo}\ncd ${s.repo}\ngit init\ngit add .\ngit commit -m "feat: ${s.title.toLowerCase()} — initial deliverables"\ngit branch -M main\ngit remote add origin https://github.com/${user}/${s.repo}.git\ngit push -u origin main`

  return (
    <div className="max-w-[1100px]">
      <Link to="/showcase" className="text-[12.5px] text-muted hover:text-ink inline-flex items-center gap-1 mb-3"><ArrowLeft size={13} />All showcases</Link>
      <PageHeader eyebrow={`Weekly Showcase · W${s.week} · ${DOMAIN[s.domain]}`} title={s.title} subtitle={s.proves} right={<div className="flex flex-wrap gap-1.5">{s.stack.map((t) => <span key={t} className="chip text-soft border-line2 bg-raised">{t}</span>)}<span className="chip text-muted border-line2 bg-raised">~{s.hours}h</span></div>} />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <Label>The brief (as a manager would send it)</Label>
            <div className="text-[14px] text-ink mt-1.5 leading-relaxed">"{s.brief}"</div>
            <div className="mt-3 text-[12.5px]"><span className="text-muted">Dataset: </span>{s.dataset.url.startsWith('/') ? <Link to={s.dataset.url} className="text-accent-glow hover:underline">{s.dataset.name}</Link> : <a href={s.dataset.url} target="_blank" rel="noreferrer" className="text-accent-glow hover:underline inline-flex items-center gap-1">{s.dataset.name}<Ext size={11} /></a>}</div>
          </Card>
          <Card>
            <div className="flex items-center justify-between mb-2"><H2>Deliverables</H2><span className="num text-[12px] text-muted">{builtCount} / {s.deliverables.length}</span></div>
            <div className="space-y-2">{s.deliverables.map((d, i) => <label key={i} className="flex items-start gap-2.5 cursor-pointer"><input type="checkbox" className="checkbox mt-0.5" checked={!!checks[i]} onChange={() => toggleCheck(i)} /><span className={cn('text-[13px]', checks[i] ? 'text-muted line-through' : 'text-ink')}>{d}</span></label>)}</div>
            {builtCount === s.deliverables.length && !w.stages?.built && <button className="btn-primary btn-xs mt-3" onClick={() => state.toggleShowcaseStage(id, 'built')}>Mark as Built</button>}
          </Card>
          <Card>
            <H2>Resume bullet this earns you</H2>
            <div className="text-[13px] text-soft mt-1.5 leading-relaxed">{s.resumeBullet}</div>
            <div className="text-[11.5px] text-muted mt-2">Replace the numbers with your real findings. Bullets with a number + a decision beat bullets with a tool list.</div>
          </Card>
          <Card>
            <H2>Notes / findings</H2>
            <textarea rows={4} className="input mt-2" value={w.notes || ''} onChange={(e) => state.setShowcase(id, { notes: e.target.value })} placeholder="Write the 3 findings here as you discover them — they go straight into the README." />
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <H2>Stage tracker</H2>
            <div className="mt-2 space-y-2">{SHOWCASE_STAGES.map((k) => <label key={k.key} className="flex items-start gap-2.5 cursor-pointer"><input type="checkbox" className="checkbox mt-0.5" checked={!!w.stages?.[k.key]} onChange={() => state.toggleShowcaseStage(id, k.key)} /><span><span className={cn('text-[13px]', w.stages?.[k.key] ? 'text-ok' : 'text-ink')}>{k.label}</span><span className="block text-[11px] text-muted">{k.hint}</span></span></label>)}</div>
          </Card>
          <Card>
            <div className="flex items-center gap-2 mb-2"><Github size={14} className="text-accent-glow" /><H2>Repo</H2></div>
            <Field label="Repository URL"><input className="input" value={w.url || ''} onChange={(e) => state.setShowcase(id, { url: e.target.value })} placeholder={`https://github.com/${user}/${s.repo}`} /></Field>
            <div className="text-[11.5px] text-muted mt-3 mb-1">First push (create an empty public repo named <span className="font-mono text-soft">{s.repo}</span> on GitHub first):</div>
            <div className="relative group"><pre className="bg-base border border-line rounded-md px-3 py-2.5 text-[11.5px] font-mono text-soft overflow-x-auto whitespace-pre">{cmd}</pre><button onClick={() => { navigator.clipboard?.writeText(cmd); setCopied(true); setTimeout(() => setCopied(false), 1200) }} className="absolute top-1.5 right-1.5 btn-ghost btn-xs">{copied ? <Check size={11} /> : <Copy size={11} />}</button></div>
            <Link to="/github" className="btn-ghost btn-xs mt-3 w-full justify-center">Full git guide</Link>
          </Card>
          <Card>
            <Label>Feeds</Label>
            <div className="text-[12.5px] text-soft mt-1.5 space-y-1">
              <div>Skill: <Link to={s.skill === 'statistics' ? '/statistics' : s.skill === 'business' ? `/domain/${s.domain}` : ['sql', 'excel', 'powerbi', 'python'].includes(s.skill) ? `/skills/${s.skill}` : '/projects'} className="text-accent-glow hover:underline">{SKILL_MAP[s.skill]?.name || s.skill}</Link> — counts as the week's mini-project evidence gate</div>
              <div>Domain: <span style={{ color: skillColor(s.domain) }}>{DOMAIN[s.domain]}</span></div>
              <div>Flagship: warms up the {s.domain === 'retail' ? 'E-Commerce Checkout Intelligence' : s.domain === 'bfsi' ? 'BFSI Risk & Fraud' : 'Commercial Revenue Command Center'} project</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
