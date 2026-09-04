import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Plus, ExternalLink as Ext, Trash2, LayoutGrid, Table as TableIcon, Linkedin, Github, FileText, Save, Search } from 'lucide-react'
import { useStore } from '../store/useStore'
import { PageHeader, Card, Label, Bar, Chip, H2, Tabs, Field, Modal, Checkbox, Empty, ProgressRing, Confidence } from '../components/ui'
import { JOB_PLATFORMS, JOB_CATEGORIES, COMPANIES, COMPANY_CATEGORIES, ATS_CHECKLIST, IMPACT_STATEMENTS, LINKEDIN_CHECKLIST, LINKEDIN_WEEKLY } from '../data/library'
import { cn, priorityColor, pct } from '../lib/utils'
import { startOfWeek, monthKey, addDays, fmtShort, diffDays } from '../lib/dates'
import { getMonthForDate, programWeekStart } from '../engine/tasks'

export const STATUSES = ['Wishlist', 'Ready to Apply', 'Applied', 'Assessment', 'HR', 'Technical', 'Managerial', 'Follow-up', 'Offer', 'Rejected']
const STATUS_COLOR = { Wishlist: '#7c7c92', 'Ready to Apply': '#b4b4c6', Applied: '#4fb7f5', Assessment: '#c4b5fd', HR: '#f5b544', Technical: '#fb923c', Managerial: '#e879a5', 'Follow-up': '#a99cff', Offer: '#3ddc97', Rejected: '#f06a6a' }
const DOMAINS = ['E-Commerce', 'Retail', 'Quick Commerce', 'BFSI', 'FinTech', 'GCC', 'Consulting', 'Analytics Firm', 'SaaS', 'Startup', 'Other']

// ---------------- JOBS ----------------
export function JobsPage() {
  const state = useStore()
  const { setCompany, addCompany, removeCompany } = state
  const [sp] = useSearchParams()
  const [tab, setTab] = useState(sp.get('tab') === 'companies' ? 'Target Companies' : 'Where to Search')
  const [cat, setCat] = useState(sp.get('cat') || 'All')
  const [q, setQ] = useState(sp.get('q') || '')
  const [add, setAdd] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'Retail / E-Commerce', roles: '', career: '', linkedin: '', priority: 'MEDIUM' })
  useEffect(() => { if (sp.get('tab') === 'companies') setTab('Target Companies'); if (sp.get('q')) setQ(sp.get('q')); if (sp.get('cat')) setCat(sp.get('cat')) }, [sp])
  const all = [...COMPANIES, ...state.customCompanies]
  const list = all.filter((c) => (cat === 'All' || c.category === cat) && (!q || c.name.toLowerCase().includes(q.toLowerCase())))
  const applied = all.filter((c) => state.companies[c.id]?.applied).length
  return (
    <div>
      <PageHeader eyebrow="Career" title="Jobs — Where should I apply?" subtitle="Discovery platforms and a curated target-company list with real career pages. No fake vacancies: you search, you log the application." right={<Chip className="text-accent-glow border-accent/40 bg-accent/10">{applied} / {all.length} companies applied</Chip>} />
      <Tabs tabs={['Where to Search', 'Target Companies']} value={tab} onChange={setTab} className="mb-4" />
      {tab === 'Where to Search' && (
        <div className="space-y-4">
          <Card><H2>Categories to search</H2><div className="flex flex-wrap gap-1.5 mt-2">{JOB_CATEGORIES.map((c) => <a key={c} href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(c + ' data analyst')}&location=India&f_E=1%2C2`} target="_blank" rel="noreferrer" className="chip text-soft border-line2 bg-raised hover:border-accent/50 hover:text-ink">{c} <Ext size={10} /></a>)}</div><div className="text-[11.5px] text-muted mt-2">Search strings: "Business Analyst" · "Data Analyst" · "Analytics Intern" · "BI Analyst" · "Revenue Analyst" · "Risk Analyst" · "Category Analyst" · "Growth Analyst" — filter Entry level + Past week.</div></Card>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">{JOB_PLATFORMS.map((p) => <a key={p.name} href={p.url} target="_blank" rel="noreferrer" className="card card-hover p-3 block"><div className="flex items-center justify-between text-[14px] font-semibold">{p.name}<Ext size={12} className="text-muted" /></div><div className="text-[11.5px] text-muted mt-0.5">{p.note || 'Data analyst · India'}</div></a>)}</div>
          <Card><H2>Application strategy — December launch</H2><ApplicationFunnel compact /></Card>
        </div>
      )}
      {tab === 'Target Companies' && (
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="flex gap-1 overflow-x-auto">{['All', ...COMPANY_CATEGORIES].map((c) => <button key={c} onClick={() => setCat(c)} className={cn('tab', cat === c && 'tab-active')}>{c}</button>)}</div>
            <div className="flex-1" />
            <div className="relative"><Search size={13} className="absolute left-2 top-2.5 text-muted" /><input className="input pl-7 py-1.5 w-48" placeholder="Filter…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <button className="btn-primary btn-xs" onClick={() => setAdd(true)}><Plus size={12} />Add company</button>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {list.map((c) => { const s = state.companies[c.id] || {}; const pr = s.priority || c.priority; return (
              <Card key={c.id} className={cn(s.applied && 'border-ok/30')}>
                <div className="flex items-start justify-between gap-2"><div><div className="text-[15px] font-semibold">{c.name}</div><div className="text-[11.5px] text-muted">{c.category}</div></div><select value={pr} onChange={(e) => setCompany(c.id, { priority: e.target.value })} className={cn('chip bg-transparent cursor-pointer', priorityColor(pr))}>{['HIGH', 'MEDIUM', 'LOW'].map((p) => <option key={p} className="bg-card text-ink">{p}</option>)}</select></div>
                <div className="flex flex-wrap gap-1 mt-2">{(Array.isArray(c.roles) ? c.roles : String(c.roles).split(',')).filter(Boolean).map((r) => <Chip key={r} className="text-soft border-line2 bg-raised">{r.trim()}</Chip>)}</div>
                <div className="flex gap-2 mt-2 text-[12px]"><a href={c.career} target="_blank" rel="noreferrer" className="text-accent-glow hover:underline inline-flex items-center gap-1">Career page<Ext size={10} /></a><a href={c.linkedin} target="_blank" rel="noreferrer" className="text-accent-glow hover:underline inline-flex items-center gap-1"><Linkedin size={11} />Jobs</a></div>
                <div className="flex flex-wrap items-center gap-3 mt-2"><Checkbox label="Applied" checked={s.applied} onChange={() => setCompany(c.id, { applied: !s.applied })} /><Checkbox label="Referral" checked={s.referral} onChange={() => setCompany(c.id, { referral: !s.referral })} />{c.id.startsWith('cc-') && <button className="text-muted hover:text-bad ml-auto" onClick={() => removeCompany(c.id)}><Trash2 size={12} /></button>}</div>
                <input className="input mt-2 text-[12px] py-1" placeholder="Notes: contact, role seen, drive date…" value={s.notes || ''} onChange={(e) => setCompany(c.id, { notes: e.target.value })} />
              </Card>
            ) })}
          </div>
          <Modal open={add} onClose={() => setAdd(false)} title="Add target company">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Company" className="sm:col-span-2"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Category"><select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{COMPANY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
              <Field label="Priority"><select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{['HIGH', 'MEDIUM', 'LOW'].map((c) => <option key={c}>{c}</option>)}</select></Field>
              <Field label="Target roles (comma separated)" className="sm:col-span-2"><input className="input" value={form.roles} onChange={(e) => setForm({ ...form, roles: e.target.value })} /></Field>
              <Field label="Career page URL"><input className="input" value={form.career} onChange={(e) => setForm({ ...form, career: e.target.value })} /></Field>
              <Field label="LinkedIn jobs URL"><input className="input" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} /></Field>
            </div>
            <div className="flex justify-end gap-2 mt-4"><button className="btn-ghost" onClick={() => setAdd(false)}>Cancel</button><button className="btn-primary" disabled={!form.name} onClick={() => { addCompany({ ...form, roles: form.roles.split(',').map((s) => s.trim()).filter(Boolean) }); setAdd(false) }}>Add</button></div>
          </Modal>
        </div>
      )}
    </div>
  )
}

// ---------------- APPLICATIONS (ATS) ----------------
export function ApplicationsPage() {
  const state = useStore()
  const { addApplication, updateApplication, removeApplication } = state
  const today = state.today()
  const [sp, setSp] = useSearchParams()
  const [view, setView] = useState('Kanban')
  const [edit, setEdit] = useState(null)
  const blank = { company: '', role: 'Data Analyst', domain: 'E-Commerce', location: '', link: '', source: 'LinkedIn', dateApplied: '', status: 'Wishlist', resumeVersion: 'retail', referral: '', assessment: '', round: '', nextAction: '', nextActionDate: '', deadline: '', interviewDate: '', notes: '' }
  useEffect(() => { if (sp.get('new')) { setEdit({ ...blank }); setSp({}) } }, [sp])
  const apps = state.applications
  const byStatus = useMemo(() => Object.fromEntries(STATUSES.map((s) => [s, apps.filter((a) => a.status === s)])), [apps])
  return (
    <div>
      <PageHeader eyebrow="Career" title="Applications — Tracking System" subtitle="Every application, assessment, round and follow-up in one pipeline. Interview dates feed the priority engine and calendar." right={<div className="flex gap-1"><button className={cn('tab', view === 'Kanban' && 'tab-active')} onClick={() => setView('Kanban')}><LayoutGrid size={13} className="inline mr-1" />Kanban</button><button className={cn('tab', view === 'Table' && 'tab-active')} onClick={() => setView('Table')}><TableIcon size={13} className="inline mr-1" />Table</button><button className="btn-primary btn-xs ml-2" onClick={() => setEdit({ ...blank })}><Plus size={12} />Add</button></div>} />
      <Card className="mb-4"><ApplicationFunnel /></Card>
      {apps.length === 0 && <Empty text="No applications yet. Wishlist target roles now; December is launch." action={<button className="btn-primary btn-xs" onClick={() => setEdit({ ...blank })}>Add first application</button>} />}
      {view === 'Kanban' && apps.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-3">
          {STATUSES.map((s) => (
            <div key={s} className="w-[240px] shrink-0">
              <div className="flex items-center justify-between mb-2 px-1"><span className="text-[12px] font-semibold" style={{ color: STATUS_COLOR[s] }}>{s}</span><span className="num text-[11px] text-muted">{byStatus[s].length}</span></div>
              <div className="space-y-2 min-h-[60px] rounded-lg border border-dashed border-line p-1.5" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { const id = e.dataTransfer.getData('id'); if (id) updateApplication(id, { status: s, ...(s === 'Applied' && !apps.find((a) => a.id === id)?.dateApplied ? { dateApplied: today } : {}) }) }}>
                {byStatus[s].map((a) => <div key={a.id} draggable onDragStart={(e) => e.dataTransfer.setData('id', a.id)} onClick={() => setEdit(a)} className="card p-2.5 cursor-pointer card-hover"><div className="text-[13px] font-semibold leading-snug">{a.company}</div><div className="text-[11.5px] text-muted">{a.role}</div><div className="flex flex-wrap gap-1 mt-1.5"><Chip className="text-soft border-line2 bg-raised">{a.domain}</Chip>{a.interviewDate && a.interviewDate >= today && <Chip className="text-bad border-bad/40 bg-bad/10">IV {fmtShort(a.interviewDate)}</Chip>}{a.deadline && <Chip className="text-warn border-warn/40 bg-warn/10">due {fmtShort(a.deadline)}</Chip>}{a.nextActionDate && a.nextActionDate <= today && !['Offer', 'Rejected'].includes(a.status) && <Chip className="text-info border-info/40 bg-info/10">follow-up</Chip>}</div></div>)}
              </div>
            </div>
          ))}
        </div>
      )}
      {view === 'Table' && apps.length > 0 && (
        <Card className="p-0 overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead><tr className="text-left border-b border-line">{['Company', 'Role', 'Domain', 'Location', 'Source', 'Applied', 'Status', 'Resume', 'Referral', 'Assessment', 'Round', 'Next action', 'Deadline', 'Interview', ''].map((h) => <th key={h} className="label px-3 py-2 whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody>{apps.map((a) => <tr key={a.id} className="border-b border-line hover:bg-raised/40 cursor-pointer" onClick={() => setEdit(a)}><td className="px-3 py-2 font-medium whitespace-nowrap">{a.company}{a.link && <a href={a.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="ml-1 text-accent-glow"><Ext size={10} className="inline" /></a>}</td><td className="px-3 py-2">{a.role}</td><td className="px-3 py-2">{a.domain}</td><td className="px-3 py-2">{a.location}</td><td className="px-3 py-2">{a.source}</td><td className="px-3 py-2 num">{a.dateApplied}</td><td className="px-3 py-2"><span className="chip" style={{ color: STATUS_COLOR[a.status], borderColor: STATUS_COLOR[a.status] + '55' }}>{a.status}</span></td><td className="px-3 py-2">{a.resumeVersion}</td><td className="px-3 py-2">{a.referral}</td><td className="px-3 py-2">{a.assessment}</td><td className="px-3 py-2">{a.round}</td><td className="px-3 py-2">{a.nextAction}{a.nextActionDate && <span className="text-muted"> · {a.nextActionDate}</span>}</td><td className="px-3 py-2 num">{a.deadline}</td><td className="px-3 py-2 num">{a.interviewDate}</td><td className="px-3 py-2"><button onClick={(e) => { e.stopPropagation(); removeApplication(a.id) }} className="text-muted hover:text-bad"><Trash2 size={12} /></button></td></tr>)}</tbody>
          </table>
        </Card>
      )}
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? `${edit.company} — ${edit.role}` : 'Add application'} wide>
        {edit && (
          <div>
            <div className="grid sm:grid-cols-3 gap-3">
              {[['company', 'Company'], ['role', 'Role'], ['location', 'Location'], ['link', 'Job link'], ['referral', 'Referral (name)'], ['assessment', 'Assessment (type / score)'], ['round', 'Interview round'], ['nextAction', 'Next action']].map(([k, l]) => <Field key={k} label={l}><input className="input" value={edit[k] || ''} onChange={(e) => setEdit({ ...edit, [k]: e.target.value })} /></Field>)}
              <Field label="Domain"><select className="input" value={edit.domain} onChange={(e) => setEdit({ ...edit, domain: e.target.value })}>{DOMAINS.map((d) => <option key={d}>{d}</option>)}</select></Field>
              <Field label="Source"><select className="input" value={edit.source} onChange={(e) => setEdit({ ...edit, source: e.target.value })}>{['LinkedIn', 'Naukri', 'Referral', 'Career page', 'Campus', 'Unstop', 'Internshala', 'Wellfound', 'Indeed', 'Other'].map((d) => <option key={d}>{d}</option>)}</select></Field>
              <Field label="Status"><select className="input" value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>{STATUSES.map((d) => <option key={d}>{d}</option>)}</select></Field>
              <Field label="Resume version"><select className="input" value={edit.resumeVersion} onChange={(e) => setEdit({ ...edit, resumeVersion: e.target.value })}>{['retail', 'bfsi', 'commercial'].map((d) => <option key={d}>{d}</option>)}</select></Field>
              {[['dateApplied', 'Date applied'], ['nextActionDate', 'Next action date'], ['deadline', 'Deadline'], ['interviewDate', 'Interview date']].map(([k, l]) => <Field key={k} label={l}><input type="date" className="input" value={edit[k] || ''} onChange={(e) => setEdit({ ...edit, [k]: e.target.value })} /></Field>)}
              <Field label="Notes" className="sm:col-span-3"><textarea rows={3} className="input" value={edit.notes || ''} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} /></Field>
            </div>
            <div className="flex justify-between mt-4">{edit.id ? <button className="btn-danger btn-xs" onClick={() => { removeApplication(edit.id); setEdit(null) }}><Trash2 size={11} />Delete</button> : <span />}<div className="flex gap-2"><button className="btn-ghost" onClick={() => setEdit(null)}>Cancel</button><button className="btn-primary" disabled={!edit.company} onClick={() => { const patch = { ...edit }; if (patch.status === 'Applied' && !patch.dateApplied) patch.dateApplied = today; if (edit.id) updateApplication(edit.id, patch); else addApplication(patch); setEdit(null) }}><Save size={13} />Save</button></div></div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export function ApplicationFunnel({ compact }) {
  const state = useStore()
  const today = state.today()
  const apps = state.applications
  const submitted = apps.filter((a) => !['Wishlist', 'Ready to Apply'].includes(a.status))
  const oa = apps.filter((a) => a.assessment || ['Assessment', 'HR', 'Technical', 'Managerial', 'Offer'].includes(a.status))
  const tech = apps.filter((a) => ['Technical', 'Managerial', 'Offer'].includes(a.status) || a.round)
  const iv = apps.filter((a) => a.interviewDate || ['HR', 'Technical', 'Managerial', 'Offer'].includes(a.status))
  const offers = apps.filter((a) => a.status === 'Offer')
  const ws = programWeekStart(today)
  const weekApps = submitted.filter((a) => a.dateApplied >= ws).length
  const monthApps = submitted.filter((a) => (a.dateApplied || '').startsWith(monthKey(today))).length
  const responded = apps.filter((a) => ['Assessment', 'HR', 'Technical', 'Managerial', 'Offer', 'Rejected'].includes(a.status)).length
  const mode = getMonthForDate(today).mode
  const target = mode === 'LEARNING' ? (today >= '2026-12-01' ? 5 : 0) : 7
  const steps = [['Applications', submitted.length], ['OA / Aptitude', oa.length], ['Technical', tech.length], ['Interview', iv.length], ['Offer', offers.length]]
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3"><H2>{mode === 'LEARNING' ? 'December application launch' : 'Application pipeline'}</H2><span className="text-[12px] text-muted">Target: {target ? `${target}/day` : 'launch Dec 2026'} · adjusts with interview load</span></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-3 text-[12.5px]">
        {[['This week', weekApps], ['This month', monthApps], ['Response rate', pct(responded, submitted.length) + '%'], ['Assessment rate', pct(oa.length, submitted.length) + '%'], ['Interview rate', pct(iv.length, submitted.length) + '%'], ['Offer rate', pct(offers.length, submitted.length) + '%']].map(([k, v]) => <div key={k} className="bg-raised/60 border border-line rounded-md px-2.5 py-2"><Label>{k}</Label><div className="num font-semibold text-[15px] mt-0.5">{v}</div></div>)}
      </div>
      {!compact && <div className="flex items-stretch gap-1">{steps.map(([k, v], i) => <div key={k} className="flex-1 min-w-0"><div className="rounded-md border border-line bg-raised/40 p-2 text-center" style={{ opacity: 1 - i * 0.12 }}><div className="num text-[18px] font-bold">{v}</div><div className="text-[10.5px] text-muted truncate">{k}</div></div>{i < steps.length - 1 && <div className="text-center text-[10px] text-muted mt-0.5">↓ {pct(steps[i + 1][1], v)}%</div>}</div>)}</div>}
    </div>
  )
}

// ---------------- RESUME ----------------
export function ResumePage() {
  const state = useStore()
  const { setResume } = state
  const r = state.resume
  const ats = ATS_CHECKLIST.filter((i) => r.ats[i]).length
  const skills = ['SQL (window functions, CTEs)', 'Power BI + DAX', 'Star schema modeling', 'Excel (Power Query, pivots, XLOOKUP)', 'Python (Pandas)', 'Statistics (A/B, regression)', 'Domain metrics (GMV/AOV · NPA/DPD · MRR/NRR)']
  const projects = ['3 projects with live dashboard links', 'Each project bullet has ₹ / % impact', 'Architecture mentioned (SQL → Power BI)', 'Business recommendation stated']
  const sk = skills.filter((i) => r.ats['s:' + i]).length, pj = projects.filter((i) => r.ats['p:' + i]).length
  const score = Math.round((ats / ATS_CHECKLIST.length) * 50 + (sk / skills.length) * 25 + (pj / projects.length) * 25)
  useEffect(() => { if (score !== r.score) setResume({ score }) }, [score])
  const toggle = (k) => setResume({ ats: { ...r.ats, [k]: !r.ats[k] } })
  return (
    <div>
      <PageHeader eyebrow="Career" title="Resume Center" subtitle="One page. ATS-safe. Every bullet has a number. Three versions that swap domain vocabulary, not skills." right={<div className="flex items-center gap-2"><ProgressRing value={score} size={44} stroke={4} color={score >= 80 ? '#3ddc97' : '#f5b544'} /><span className="text-[12px] text-muted">Resume score</span></div>} />
      <div className="grid lg:grid-cols-3 gap-4">
        <Card><H2>ATS checklist — {ats}/{ATS_CHECKLIST.length}</H2><div className="mt-2 space-y-2">{ATS_CHECKLIST.map((i) => <Checkbox key={i} label={i} checked={r.ats[i]} onChange={() => toggle(i)} />)}</div></Card>
        <Card><H2>Skills checklist</H2><div className="mt-2 space-y-2">{skills.map((i) => <Checkbox key={i} label={i} checked={r.ats['s:' + i]} onChange={() => toggle('s:' + i)} />)}</div><H2 className="mt-4">Project checklist</H2><div className="mt-2 space-y-2">{projects.map((i) => <Checkbox key={i} label={i} checked={r.ats['p:' + i]} onChange={() => toggle('p:' + i)} />)}</div></Card>
        <Card><H2>Resume versions</H2><div className="mt-2 space-y-3">{[['retail', 'Retail / E-Commerce Analytics Resume', 'GMV · AOV · CVR · cohort retention · Project 1 first'], ['bfsi', 'BFSI / FinTech Analytics Resume', 'NPA · DPD · PD/LGD/EAD · fraud · Project 2 first'], ['commercial', 'Commercial / Revenue Analytics Resume', 'MRR · NRR · LTV:CAC · pipeline · Project 3 first']].map(([k, l, d]) => <div key={k}><Label>{l}</Label><div className="text-[11.5px] text-muted mb-1">{d}</div><div className="flex gap-2"><input className="input" placeholder="Google Docs / Drive / PDF link" value={r.versions[k] || ''} onChange={(e) => setResume({ versions: { ...r.versions, [k]: e.target.value } })} />{r.versions[k] && <a className="btn-ghost btn-xs" href={r.versions[k]} target="_blank" rel="noreferrer"><FileText size={12} /></a>}</div></div>)}</div></Card>
      </div>
      <Card className="mt-4"><H2>Impact statement patterns</H2><div className="text-[12px] text-muted mb-2">Rewrite each with your real numbers. "Analyzed X rows with Y technique to find Z insight, worth ₹N — recommended A."</div><div className="grid md:grid-cols-2 gap-2">{IMPACT_STATEMENTS.map((s, i) => <div key={i} className="text-[12.5px] text-soft border border-line rounded-md p-2.5 bg-raised/40">{s}</div>)}</div><Field label="My impact statements" className="mt-3"><textarea rows={5} className="input font-mono text-[12.5px]" value={(r.impact || []).join('\n')} onChange={(e) => setResume({ impact: e.target.value.split('\n') })} placeholder="One bullet per line…" /></Field></Card>
    </div>
  )
}

// ---------------- LINKEDIN ----------------
export function LinkedInPage() {
  const state = useStore()
  const { setLinkedin } = state
  const today = state.today()
  const ws = programWeekStart(today)
  const li = state.linkedin
  const done = LINKEDIN_CHECKLIST.filter((i) => li.checklist[i]).length
  const strength = Math.round((done / LINKEDIN_CHECKLIST.length) * 100)
  const wk = li.weekly[ws] || {}
  return (
    <div>
      <PageHeader eyebrow="Career" title="LinkedIn Center" subtitle="Recruiters search LinkedIn before they read resumes. Headline, About, Featured projects, and a weekly networking cadence." right={<div className="flex items-center gap-2"><ProgressRing value={strength} size={44} stroke={4} color="#4fb7f5" /><span className="text-[12px] text-muted">Profile strength</span></div>} />
      <div className="grid lg:grid-cols-2 gap-4">
        <Card><H2>Profile checklist — {done}/{LINKEDIN_CHECKLIST.length}</H2><div className="mt-2 space-y-2">{LINKEDIN_CHECKLIST.map((i) => <Checkbox key={i} label={i} checked={li.checklist[i]} onChange={() => setLinkedin({ checklist: { ...li.checklist, [i]: !li.checklist[i] } })} />)}</div><div className="mt-3 flex gap-2"><a className="btn-ghost btn-xs" href={state.settings.links.linkedin} target="_blank" rel="noreferrer"><Linkedin size={12} />My profile</a><a className="btn-ghost btn-xs" href={state.settings.links.github} target="_blank" rel="noreferrer"><Github size={12} />GitHub</a></div></Card>
        <Card><H2>This week's networking — {fmtShort(ws)}</H2><div className="mt-2 space-y-2">{LINKEDIN_WEEKLY.map((i) => <Checkbox key={i} label={i} checked={wk[i]} onChange={() => setLinkedin({ weekly: { ...li.weekly, [ws]: { ...wk, [i]: !wk[i] } } })} />)}</div><Bar value={pct(LINKEDIN_WEEKLY.filter((i) => wk[i]).length, LINKEDIN_WEEKLY.length)} className="mt-3" color="#4fb7f5" /><div className="text-[11.5px] text-muted mt-2">Weeks completed: {Object.values(li.weekly).filter((w) => LINKEDIN_WEEKLY.every((i) => w[i])).length}</div></Card>
      </div>
    </div>
  )
}

// ---------------- NETWORKING ----------------
export function NetworkingPage() {
  const state = useStore()
  const { addNote } = state
  const [contacts, setContacts] = useState(() => JSON.parse(localStorage.getItem('acc-contacts') || '[]'))
  const [f, setF] = useState({ name: '', company: '', role: '', channel: 'LinkedIn', status: 'To contact', notes: '' })
  const save = (list) => { setContacts(list); localStorage.setItem('acc-contacts', JSON.stringify(list)) }
  const templates = [
    ['Alumni referral ask', 'Hi {Name}, I\'m a 2027 EXTC grad from {College} pivoting into analytics. I built an e-commerce checkout funnel analysis (SQL + Power BI, live link: …) that quantified lost GMV by device. I noticed {Company} is hiring a {Role} — would you be open to a referral or a 10-minute chat about what the team values? Happy to share the dashboard.'],
    ['Post-application follow-up', 'Hi {Name}, I applied for {Role} at {Company} on {Date}. I\'m especially interested because {specific reason}. My portfolio (3 live dashboards) is at … — I\'d value any feedback, even if the role is filled.'],
    ['Analyst cold reach', 'Hi {Name}, your post on {topic} resonated — I\'m working on a similar cohort retention problem in a personal project. Could I ask one question about how your team defines churn?'],
  ]
  return (
    <div>
      <PageHeader eyebrow="Career" title="Networking" subtitle="Referrals convert 5–10× better than cold applications. Track people, not just companies." />
      <div className="grid lg:grid-cols-3 gap-4">
        <Card><H2>Add contact</H2><div className="grid grid-cols-2 gap-2 mt-2">{[['name', 'Name'], ['company', 'Company'], ['role', 'Role']].map(([k, l]) => <Field key={k} label={l} className={k === 'name' ? 'col-span-2' : ''}><input className="input" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></Field>)}<Field label="Channel"><select className="input" value={f.channel} onChange={(e) => setF({ ...f, channel: e.target.value })}>{['LinkedIn', 'Email', 'Alumni network', 'Referral', 'Event'].map((c) => <option key={c}>{c}</option>)}</select></Field><Field label="Status"><select className="input" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{['To contact', 'Messaged', 'Replied', 'Call done', 'Referred'].map((c) => <option key={c}>{c}</option>)}</select></Field><Field label="Notes" className="col-span-2"><input className="input" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field></div><button className="btn-primary w-full justify-center mt-3" disabled={!f.name} onClick={() => { save([{ id: Date.now(), date: state.today(), ...f }, ...contacts]); setF({ ...f, name: '', company: '', role: '', notes: '' }) }}><Plus size={13} />Add</button></Card>
        <Card className="lg:col-span-2"><H2>Contacts ({contacts.length})</H2>{!contacts.length && <div className="text-muted text-[13px] mt-2">No contacts yet. Target: 10 new analyst connections/week from Week 15.</div>}<div className="mt-2 divide-y divide-line">{contacts.map((c) => <div key={c.id} className="py-2 flex flex-wrap items-center gap-3 text-[12.5px]"><div className="flex-1 min-w-[160px]"><div className="font-medium">{c.name} <span className="text-muted font-normal">· {c.company} · {c.role}</span></div><div className="text-[11.5px] text-muted">{c.channel} · {c.date}{c.notes && ' · ' + c.notes}</div></div><select className="input w-32 py-1 text-[12px]" value={c.status} onChange={(e) => save(contacts.map((x) => (x.id === c.id ? { ...x, status: e.target.value } : x)))}>{['To contact', 'Messaged', 'Replied', 'Call done', 'Referred'].map((s) => <option key={s}>{s}</option>)}</select><button className="text-muted hover:text-bad" onClick={() => save(contacts.filter((x) => x.id !== c.id))}><Trash2 size={12} /></button></div>)}</div></Card>
      </div>
      <Card className="mt-4"><H2>Message templates</H2><div className="grid md:grid-cols-3 gap-3 mt-2">{templates.map(([t, m]) => <div key={t} className="border border-line rounded-md p-3 bg-raised/40"><Label>{t}</Label><div className="text-[12.5px] text-soft mt-1 leading-relaxed">{m}</div><button className="btn-ghost btn-xs mt-2" onClick={() => navigator.clipboard?.writeText(m)}>Copy</button></div>)}</div></Card>
    </div>
  )
}
