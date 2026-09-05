import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Eye, EyeOff, Repeat, Star } from 'lucide-react'
import { useStore } from '../store/useStore'
import { PageHeader, Card, Label, Bar, Chip, H2, Tabs, Confidence, Field, Checkbox } from '../components/ui'
import { QUESTIONS, INTERVIEW_TABS, CASES, CASE_FRAMEWORK } from '../data/interview'
import { interviewStats } from '../engine/scoring'
import { PROJECTS } from '../data/projects'
import { cn } from '../lib/utils'

const SKILL_FOR_TAB = { SQL: 'sql', 'Power BI': 'powerbi', Excel: 'excel', Statistics: 'statistics', Python: 'python', 'E-Commerce Cases': 'retail', 'BFSI Cases': 'bfsi', 'Business Cases': 'commercial', Project: 'communication', HR: 'communication', Behavioral: 'communication' }

export default function InterviewCenter() {
  const state = useStore()
  const { setInterview, addRevision, addEvidence } = state
  const today = state.today()
  const [sp, setSp] = useSearchParams()
  const [tab, setTab] = useState(sp.get('tab') || 'SQL')
  const [filter, setFilter] = useState('all')
  const [practice, setPractice] = useState(null)
  const focusQ = sp.get('q')
  useEffect(() => { const t = sp.get('tab'); if (t && INTERVIEW_TABS.includes(t)) setTab(t) }, [sp])
  useEffect(() => { if (focusQ) setTimeout(() => document.getElementById('q-' + focusQ)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100) }, [focusQ, tab])
  const stats = useMemo(() => interviewStats(state), [state.interview])
  const qs = QUESTIONS.filter((q) => q.tab === tab).filter((q) => { const c = state.interview[q.id] || {}; if (filter === 'weak') return (c.confidence || 0) > 0 && c.confidence < 4; if (filter === 'unrated') return !c.confidence; if (filter === 'revision') return c.needsRevision; return true })
  const isCase = tab.includes('Cases')
  const weakest = Object.entries(stats.byTab).map(([t, v]) => ({ t, avg: v.rated ? v.sum / v.rated : 0, ...v })).sort((a, b) => a.strong / a.total - b.strong / b.total).slice(0, 3)

  return (
    <div>
      <PageHeader eyebrow="Career" title="Interview Center" subtitle="Question → my answer → ideal answer → confidence. Confidence ≥ 4 counts as strong. 60 strong answers unlocks Interview Ready." right={<Chip className="text-accent-glow border-accent/40 bg-accent/10">{stats.strong} strong · {stats.rated}/{stats.total} rated · avg {stats.avg.toFixed(1)}</Chip>} />
      <div className="card overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="text-left border-b border-line bg-raised/40">
              <th className="label font-semibold px-4 py-2.5">Category</th>
              <th className="label font-semibold px-3 py-2.5 text-center">Questions</th>
              <th className="label font-semibold px-3 py-2.5 text-center">Rated</th>
              <th className="label font-semibold px-3 py-2.5 text-center">Strong (≥4)</th>
              <th className="label font-semibold px-3 py-2.5 text-center">Revision</th>
              <th className="label font-semibold px-3 py-2.5 w-[180px]">Coverage</th>
              <th className="label font-semibold px-3 py-2.5 text-center">Ready</th>
            </tr></thead>
            <tbody>
              {INTERVIEW_TABS.map((t) => {
                const v = stats.byTab[t] || { total: 0, strong: 0, rated: 0 }
                const rev = QUESTIONS.filter((q) => q.tab === t && state.interview[q.id]?.needsRevision).length
                const pct = v.total ? Math.round((v.strong / v.total) * 100) : 0
                return (
                  <tr key={t} onClick={() => { setTab(t); setSp({ tab: t }) }} className={cn('border-t border-line/70 cursor-pointer hover:bg-raised/30', tab === t && 'bg-accent/10')}>
                    <td className={cn('px-4 py-2 font-medium', tab === t ? 'text-ink' : 'text-soft')}>{t}</td>
                    <td className="px-3 py-2 text-center num text-muted">{v.total}</td>
                    <td className="px-3 py-2 text-center num">{v.rated || 0}</td>
                    <td className="px-3 py-2 text-center num text-ok">{v.strong}</td>
                    <td className="px-3 py-2 text-center num text-warn">{rev || ''}</td>
                    <td className="px-3 py-2"><div className="flex items-center gap-2"><div className="flex-1 h-1.5 rounded-full bg-line overflow-hidden"><div className="h-full bg-accent" style={{ width: `${pct}%` }} /></div><span className="num text-[11px] text-muted w-8 text-right">{pct}%</span></div></td>
                    <td className="px-3 py-2 text-center"><input type="checkbox" className="checkbox pointer-events-none" readOnly checked={v.total > 0 && v.strong >= Math.ceil(v.total * 0.8)} tabIndex={-1} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-line text-[11.5px] text-muted flex flex-wrap gap-x-4 gap-y-1"><span>Strong answers: <span className="num text-ink">{stats.strong}</span> / 60 for Interview Ready</span><span>Practice next: {weakest.map((w) => w.t).join(' · ')}</span></div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Tabs tabs={INTERVIEW_TABS} value={tab} onChange={(t) => { setTab(t); setSp({ tab: t }) }} className="flex-1" />
        <div className="flex gap-1">{[['all', 'All'], ['unrated', 'Unrated'], ['weak', 'Weak'], ['revision', 'Revision']].map(([k, l]) => <button key={k} onClick={() => setFilter(k)} className={cn('tab', filter === k && 'tab-active')}>{l}</button>)}</div>
      </div>
      {isCase && <CasePanel tab={tab} />}
      <div className="space-y-2">
        {qs.map((q) => <QuestionCard key={q.id} q={q} c={state.interview[q.id] || {}} focus={focusQ === q.id} onRate={(v) => { const prev = state.interview[q.id]?.confidence || 0; setInterview(q.id, { confidence: v, ratedOn: today }); const sk = SKILL_FOR_TAB[q.tab]; if (sk && v >= 4 && prev < 4) addEvidence(sk, 'interview', 1) }} onAnswer={(a) => setInterview(q.id, { myAnswer: a })} onRevision={() => { setInterview(q.id, { needsRevision: !state.interview[q.id]?.needsRevision }); if (!state.interview[q.id]?.needsRevision) addRevision({ title: q.question, category: 'Interview mistakes', detail: q.ideal }) }} onStrong={() => { setInterview(q.id, { confidence: 5, ratedOn: today }); const sk = SKILL_FOR_TAB[q.tab]; if (sk && (state.interview[q.id]?.confidence || 0) < 4) addEvidence(sk, 'interview', 1) }} />)}
        {!qs.length && <div className="text-muted text-[13px] py-6 text-center">No questions match this filter.</div>}
      </div>
    </div>
  )
}

function QuestionCard({ q, c, onRate, onAnswer, onRevision, onStrong, focus }) {
  const [show, setShow] = useState(false)
  const [ans, setAns] = useState(c.myAnswer || '')
  const dirty = ans !== (c.myAnswer || '')
  const dc = { Easy: 'text-ok', Medium: 'text-warn', Hard: 'text-bad' }[q.difficulty]
  return (
    <Card id={'q-' + q.id} className={cn('px-5 py-4', focus && 'border-accent/60')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-[260px]">
          <div className="text-[14.5px] font-semibold leading-snug">{q.question}</div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11.5px] text-muted"><span className={dc}>{q.difficulty}</span><span>{q.topic}</span>{c.needsRevision && <span className="text-warn inline-flex items-center gap-1"><Repeat size={10} />in revision</span>}{c.confidence >= 4 && <span className="text-ok">Strong</span>}</div>
        </div>
        <div className="flex items-center gap-2"><span className="text-[11px] text-muted">Confidence</span><Confidence value={c.confidence} onChange={onRate} /></div>
      </div>
      <div className="mt-3">
        <div className="label mb-1">My answer</div>
        <textarea rows={3} className="input" value={ans} onChange={(e) => setAns(e.target.value)} onBlur={() => dirty && onAnswer(ans)} placeholder="Answer out loud first, then write the skeleton here…" />
      </div>
      {show && <div className="mt-3 bg-raised/50 border border-line rounded-md px-3.5 py-3"><div className="label mb-1">Reference answer</div><div className="text-[12.5px] text-soft leading-relaxed">{q.ideal}</div></div>}
      <div className="flex flex-wrap gap-2 mt-3">
        <button className="btn-subtle btn-xs" onClick={() => setShow(!show)}>{show ? <><EyeOff size={11} />Hide reference</> : <><Eye size={11} />Reveal reference answer</>}</button>
        <button className={cn('btn-xs', c.needsRevision ? 'btn-subtle' : 'btn-ghost')} onClick={onRevision}><Repeat size={11} />{c.needsRevision ? 'In revision' : 'I got this wrong'}</button>
        <button className="btn-ghost btn-xs" onClick={onStrong}><Star size={11} />Mark ready</button>
        {dirty && <button className="btn-primary btn-xs ml-auto" onClick={() => onAnswer(ans)}>Save answer</button>}
      </div>
    </Card>
  )
}

function CasePanel({ tab }) {
  const state = useStore()
  const { setCaseNote, addEvidence } = state
  const domain = tab === 'E-Commerce Cases' ? 'E-Commerce' : tab === 'BFSI Cases' ? 'BFSI' : 'Commercial'
  const cases = CASES[domain]
  const [sel, setSel] = useState(cases[0])
  useEffect(() => setSel(CASES[domain][0]), [domain])
  const key = `${domain}:${sel}`
  const note = state.caseNotes[key] || {}
  const filled = CASE_FRAMEWORK.filter((s) => (note[s] || '').length > 20).length
  const skill = domain === 'E-Commerce' ? 'retail' : domain === 'BFSI' ? 'bfsi' : 'commercial'
  return (
    <Card className="mb-4 border-l-2" style={{ borderLeftColor: '#e879a5' }}>
      <div className="flex flex-wrap items-center justify-between gap-2"><H2>Business case practice — {domain}</H2><span className="text-[12px] text-muted">{filled}/7 steps written</span></div>
      <div className="flex flex-wrap gap-1.5 mt-2">{cases.map((c) => <button key={c} onClick={() => setSel(c)} className={cn('tab', sel === c && 'tab-active')}>{c}</button>)}</div>
      <div className="text-[13px] text-soft mt-3">Scenario: <span className="text-ink font-medium">"{sel}."</span> Structure your answer through every step. Write in bullet points as you would speak them.</div>
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-2 mt-3">{CASE_FRAMEWORK.map((s, i) => <Field key={s} label={`${i + 1}. ${s}`}><textarea rows={3} className="input text-[12.5px]" value={note[s] || ''} onChange={(e) => setCaseNote(key, { [s]: e.target.value })} placeholder={{ DEFINE: 'Which metric exactly? Time window? Baseline?', SEGMENT: 'Device, geo, category, cohort, channel, new vs repeat…', INVESTIGATE: 'Hypotheses ranked; what data disproves each?', MEASURE: 'Quantify impact in ₹ / % / customers', VISUALIZE: 'Waterfall / funnel / cohort heat map / trend', EXPLAIN: 'Root cause in one sentence a director understands', RECOMMEND: '3 actions, owner, expected impact, how to validate' }[s]} /></Field>)}</div>
      <div className="flex items-center gap-2 mt-3"><button className="btn-primary btn-xs" disabled={filled < 7 || note.done} onClick={() => { setCaseNote(key, { done: true }); addEvidence(skill, 'business', 1) }}>{note.done ? 'Case completed ✓' : 'Mark case complete (+1 business evidence)'}</button><span className="text-[11.5px] text-muted">Completing a case adds evidence to {domain} readiness.</span></div>
    </Card>
  )
}
