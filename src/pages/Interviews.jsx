import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Eye, EyeOff, Repeat, Star, Filter, Play } from 'lucide-react'
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
      <div className="grid md:grid-cols-4 gap-3 mb-4">
        <Card className="md:col-span-3"><Label>Coverage by round</Label><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2 mt-2">{INTERVIEW_TABS.map((t) => { const v = stats.byTab[t] || { total: 0, strong: 0 }; return <button key={t} onClick={() => setTab(t)} className="text-left"><div className="flex justify-between text-[12px]"><span className={cn(tab === t ? 'text-ink font-medium' : 'text-soft')}>{t}</span><span className="num text-muted">{v.strong}/{v.total}</span></div><Bar value={v.total ? Math.round((v.strong / v.total) * 100) : 0} color={tab === t ? '#7c6cf6' : '#3a3a4c'} className="mt-1" height={4} /></button> })}</div></Card>
        <Card><Label>Practice these next</Label><div className="mt-2 space-y-1">{weakest.map((w) => <button key={w.t} onClick={() => setTab(w.t)} className="block text-[12.5px] text-soft hover:text-ink">› {w.t} <span className="text-muted num">({w.strong}/{w.total} strong)</span></button>)}</div><Link to="/projects" className="btn-ghost btn-xs mt-3"><Play size={11} />Project simulator</Link></Card>
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
  const [edit, setEdit] = useState(false)
  const [ans, setAns] = useState(c.myAnswer || '')
  const dc = { Easy: 'text-ok border-ok/40 bg-ok/10', Medium: 'text-warn border-warn/40 bg-warn/10', Hard: 'text-bad border-bad/40 bg-bad/10' }[q.difficulty]
  return (
    <Card id={'q-' + q.id} className={cn(focus && 'border-accent/60 shadow-glow', c.confidence >= 4 && 'border-ok/20')}>
      <div className="flex flex-wrap items-start gap-2">
        <div className="flex-1 min-w-[260px]">
          <div className="flex flex-wrap gap-1.5 mb-1"><Chip className={dc}>{q.difficulty}</Chip><Chip className="text-muted border-line2 bg-raised">{q.topic}</Chip>{c.needsRevision && <Chip className="text-warn border-warn/40 bg-warn/10"><Repeat size={10} />revision</Chip>}</div>
          <div className="text-[14px] font-medium leading-snug">{q.question}</div>
        </div>
        <div className="flex flex-col items-end gap-1"><span className="text-[10.5px] text-muted">My confidence</span><Confidence value={c.confidence} onChange={onRate} /></div>
      </div>
      <div className="mt-3 grid lg:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between"><Label>My answer</Label><button className="text-[11px] text-accent-glow" onClick={() => { if (edit) onAnswer(ans); setEdit(!edit) }}>{edit ? 'Save' : c.myAnswer ? 'Edit' : 'Write'}</button></div>
          {edit ? <textarea rows={4} className="input mt-1" value={ans} onChange={(e) => setAns(e.target.value)} placeholder="Answer out loud first, then write the skeleton here…" /> : <div className="text-[12.5px] text-soft mt-1 whitespace-pre-wrap min-h-[24px]">{c.myAnswer || <span className="text-muted italic">Not answered yet.</span>}</div>}
        </div>
        <div>
          <div className="flex items-center justify-between"><Label>Ideal answer</Label><button className="text-[11px] text-accent-glow inline-flex items-center gap-1" onClick={() => setShow(!show)}>{show ? <><EyeOff size={11} />Hide</> : <><Eye size={11} />Reveal</>}</button></div>
          <div className={cn('text-[12.5px] mt-1 leading-relaxed', show ? 'text-soft' : 'text-transparent select-none blur-sm')}>{q.ideal}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-line">
        <button className="btn-ghost btn-xs" onClick={() => { setEdit(true); setShow(false) }}><Play size={11} />Practice</button>
        <button className="btn-ghost btn-xs" onClick={onStrong}><Star size={11} />Mark Strong</button>
        <button className={cn('btn-xs', c.needsRevision ? 'btn-subtle' : 'btn-ghost')} onClick={onRevision}><Repeat size={11} />{c.needsRevision ? 'In revision' : 'Add to Revision'}</button>
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
