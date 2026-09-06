import { SKILL_TREE, SKILL_MAP, LEVELS, BADGES } from '../data/skills'
import { PROJECTS, PROJECT_STAGES } from '../data/projects'
import { WEEKLY_SHOWCASE } from '../data/weekly'
import { QUESTIONS } from '../data/interview'
import { clamp, pct } from '../lib/utils'
import { addDays, diffDays } from '../lib/dates'
import { tasksForDate, isDone, isClosed } from './tasks'
import { PROGRAM_START } from '../data/roadmap'

// ---------- skill evidence + levels ----------
export function skillEvidence(skillId, state) {
  const s = SKILL_MAP[skillId]
  if (!s) return null
  const ev0 = state.evidence?.[skillId] || {}
  // shipped Weekly Showcases (pushed + README) count as mini-project evidence for their skill
  const shipped = WEEKLY_SHOWCASE.filter((w) => w.skill === skillId && state.weekly?.[w.id]?.stages?.pushed && state.weekly?.[w.id]?.stages?.readme).length
  const ev = shipped ? { ...ev0, project: (ev0.project || 0) + shipped } : ev0
  const topicsDone = s.topics.filter((t) => state.topics?.[t.id]).length
  const conceptPct = pct(topicsDone, s.topics.length)
  const g = s.gates
  const checks = [
    { key: 'concepts', label: `Concepts completed (${topicsDone}/${s.topics.length})`, ok: topicsDone === s.topics.length, progress: conceptPct },
    { key: 'problems', label: s.gateLabels.problems, ok: g.problems ? (ev.problems || 0) >= g.problems : true, progress: g.problems ? pct(Math.min(ev.problems || 0, g.problems), g.problems) : 100, value: ev.problems || 0, target: g.problems },
    { key: 'business', label: s.gateLabels.business, ok: g.business ? (ev.business || 0) >= g.business : true, progress: g.business ? pct(Math.min(ev.business || 0, g.business), g.business) : 100, value: ev.business || 0, target: g.business },
    { key: 'interview', label: s.gateLabels.interview, ok: g.interview ? (ev.interview || 0) >= g.interview : true, progress: g.interview ? pct(Math.min(ev.interview || 0, g.interview), g.interview) : 100, value: ev.interview || 0, target: g.interview },
    { key: 'project', label: s.gateLabels.project, ok: g.project ? (ev.project || 0) >= g.project : true, progress: g.project ? pct(Math.min(ev.project || 0, g.project), g.project) : 100, value: ev.project || 0, target: g.project },
    { key: 'timed', label: s.gateLabels.timed, ok: g.timed ? !!ev.timed : true, progress: g.timed ? (ev.timed ? 100 : 0) : 100, bool: true, applicable: !!g.timed },
    { key: 'explain', label: s.gateLabels.explain, ok: g.explain ? !!ev.explain : true, progress: g.explain ? (ev.explain ? 100 : 0) : 100, bool: true, applicable: !!g.explain },
  ].filter((c) => !(c.target === 0) && !(c.bool && !c.applicable))
  const score = Math.round(checks.reduce((a, c) => a + c.progress, 0) / checks.length) // 0..100 evidence score
  // level: evidence-gated
  let level = 0
  if (conceptPct >= 25 || (ev.problems || 0) > 0) level = 1
  if (conceptPct >= 60 && checks.find((c) => c.key === 'problems').progress >= 40) level = 2
  if (conceptPct === 100 && checks.filter((c) => c.key !== 'concepts').every((c) => c.progress >= 60)) level = 3
  if (checks.every((c) => c.ok)) level = 4
  return { skill: s, topicsDone, conceptPct, checks, score, level, levelName: LEVELS[level], evidence: ev }
}

export const allSkillEvidence = (state) => Object.fromEntries(SKILL_TREE.map((s) => [s.id, skillEvidence(s.id, state)]))

// ---------- projects ----------
export function projectProgress(pid, state) {
  const done = state.projects?.[pid]?.stages || {}
  const n = PROJECT_STAGES.filter((s) => done[s]).length
  return { done: n, total: PROJECT_STAGES.length, pct: pct(n, PROJECT_STAGES.length), shipped: !!(done['Live Dashboard'] && done['README'] && done['GitHub']) }
}
export const projectsSummary = (state) => PROJECTS.map((p) => ({ ...p, ...projectProgress(p.id, state) }))

// ---------- interview ----------
export function interviewStats(state) {
  const conf = state.interview || {}
  const rated = QUESTIONS.filter((q) => conf[q.id]?.confidence)
  const strong = rated.filter((q) => conf[q.id].confidence >= 4)
  const byTab = {}
  for (const q of QUESTIONS) { const t = (byTab[q.tab] ||= { total: 0, rated: 0, strong: 0, sum: 0 }); t.total++; const c = conf[q.id]?.confidence; if (c) { t.rated++; t.sum += c; if (c >= 4) t.strong++ } }
  const avg = rated.length ? rated.reduce((a, q) => a + conf[q.id].confidence, 0) / rated.length : 0
  return { total: QUESTIONS.length, rated: rated.length, strong: strong.length, avg, byTab, score: Math.round(((strong.length / Math.min(60, QUESTIONS.length)) * 70 + (rated.length / QUESTIONS.length) * 30)) }
}

// ---------- readiness (weighted) ----------
export const READINESS_WEIGHTS = { sql: 20, powerbi: 15, excel: 10, statistics: 10, python: 10, business: 10, project: 15, aptitude: 5, interview: 5 }
export const READINESS_LABELS = { sql: 'SQL', powerbi: 'Power BI', excel: 'Excel', statistics: 'Statistics', python: 'Python', business: 'Business / Domain', project: 'Projects', aptitude: 'Aptitude', interview: 'Interview' }

export function readiness(state) {
  const ev = allSkillEvidence(state)
  const projects = projectsSummary(state)
  const projScore = Math.round(projects.reduce((a, p) => a + p.pct, 0) / projects.length)
  const domainScore = Math.round((ev.retail.score + ev.bfsi.score + ev.commercial.score) / 3)
  const apt = state.aptitude || { solved: 0, correct: 0 }
  const aptAcc = apt.solved ? apt.correct / apt.solved : 0
  const aptScore = clamp(Math.round(Math.min(apt.solved / 800, 1) * 60 + aptAcc * 40))
  const iv = interviewStats(state)
  const parts = {
    sql: ev.sql.score, powerbi: ev.powerbi.score, excel: ev.excel.score, statistics: ev.statistics.score, python: ev.python.score,
    business: domainScore, project: projScore, aptitude: aptScore, interview: clamp(iv.score),
  }
  const total = Math.round(Object.entries(READINESS_WEIGHTS).reduce((a, [k, w]) => a + (parts[k] * w) / 100, 0))
  const breakdown = Object.entries(READINESS_WEIGHTS).map(([k, w]) => ({ key: k, weight: w, score: parts[k], contrib: +((parts[k] * w) / 100).toFixed(1), max: w, gap: +(w - (parts[k] * w) / 100).toFixed(1) })).sort((a, b) => b.gap - a.gap)
  return { total: clamp(total), target: 85, parts, breakdown, ev, projects, iv }
}

export function domainReadiness(state) {
  const ev = allSkillEvidence(state)
  const p = Object.fromEntries(projectsSummary(state).map((x) => [x.id, x.pct]))
  const core = (ev.sql.score * 0.35 + ev.powerbi.score * 0.25 + ev.excel.score * 0.15 + ev.statistics.score * 0.1 + ev.python.score * 0.15)
  const mk = (dom, proj, w = 0.35) => clamp(Math.round(core * 0.4 + ev[dom].score * w + p[proj] * (0.6 - w)))
  const r = { retail: mk('retail', 'p1'), bfsi: mk('bfsi', 'p2'), commercial: mk('commercial', 'p3') }
  const best = Object.entries(r).sort((a, b) => b[1] - a[1])[0][0]
  return { ...r, best }
}

// ---------- weak skills ----------
export function weakSkills(state, n = 3) {
  const r = readiness(state)
  return r.breakdown.slice(0, n)
}

// ---------- streak / hours / completion ----------
export function completionStats(state, today) {
  const dayTasks = tasksForDate(today, state)
  const dayDone = dayTasks.filter((t) => isDone(t, state))
  const minsDone = dayDone.reduce((a, t) => a + (t.estMin || 0), 0)
  const minsPlanned = dayTasks.reduce((a, t) => a + (t.estMin || 0), 0)
  return { total: dayTasks.length, done: dayDone.length, pct: pct(dayDone.length, dayTasks.length), minsDone, minsPlanned }
}

export function weekStats(state, weekStart) {
  let total = 0, done = 0, minsDone = 0, minsPlanned = 0
  const perDay = []
  for (let i = 0; i < 7; i++) {
    const d = addDays(weekStart, i)
    const ts = tasksForDate(d, state)
    const dn = ts.filter((t) => isDone(t, state))
    total += ts.length; done += dn.length
    const md = dn.reduce((a, t) => a + (t.estMin || 0), 0)
    const mp = ts.reduce((a, t) => a + (t.estMin || 0), 0)
    minsDone += md; minsPlanned += mp
    perDay.push({ date: d, total: ts.length, done: dn.length, minsDone: md, minsPlanned: mp })
  }
  const logged = Object.entries(state.hoursLog || {}).filter(([d]) => d >= weekStart && d < addDays(weekStart, 7)).reduce((a, [, m]) => a + m, 0)
  return { total, done, pct: pct(done, total), minsDone, minsPlanned, hoursDone: +((minsDone + logged) / 60).toFixed(1), perDay }
}

export function streak(state, today) {
  // day counts if ≥1 task done that day (by completedAt date) or hours logged
  const doneDates = new Set()
  for (const v of Object.values(state.taskState || {})) if (v.status === 'done' && v.completedOn) doneDates.add(v.completedOn)
  for (const [d, m] of Object.entries(state.hoursLog || {})) if (m > 0) doneDates.add(d)
  let cur = 0
  let d = today
  if (!doneDates.has(d)) d = addDays(d, -1) // allow today to be in progress
  while (doneDates.has(d)) { cur++; d = addDays(d, -1) }
  // best
  const sorted = [...doneDates].sort()
  let best = 0, run = 0, prev = null
  for (const x of sorted) { run = prev && diffDays(prev, x) === 1 ? run + 1 : 1; best = Math.max(best, run); prev = x }
  return { current: cur, best: Math.max(best, cur), activeDays: doneDates.size }
}

export function roadmapProgress(state, today) {
  // phase 1 tasks Sept 1 → Dec 31; counts completed among elapsed days + total planned
  const end = '2026-12-31'
  const upto = today < end ? today : end
  const elapsed = Math.max(0, diffDays(PROGRAM_START, upto))
  const startedOn = PROGRAM_START
  let planned = 0, done = 0
  for (let i = 0; i <= elapsed; i++) { const d = addDays(PROGRAM_START, i); const ts = tasksForDate(d, state); planned += ts.length; done += ts.filter((t) => isDone(t, state)).length }
  const totalDays = diffDays(PROGRAM_START, end) + 1
  const totalPlanned = Math.round((planned / Math.max(1, elapsed + 1)) * totalDays)
  const activeElapsed = Math.max(0, diffDays(startedOn, upto))
  const activeDays = diffDays(startedOn, end) + 1
  return { done, planned, totalPlanned, pct: pct(done, totalPlanned), elapsedPct: pct(activeElapsed, activeDays), days: totalDays, elapsed, activeElapsed, activeDays }
}

export function xpAndLevel(state) {
  let xp = 0
  for (const v of Object.values(state.taskState || {})) if (v.status === 'done') xp += 10 + Math.round((v.estMin || 30) / 10)
  xp += (state.aptitude?.solved || 0)
  for (const s of Object.values(state.evidence || {})) xp += (s.problems || 0) * 2 + (s.business || 0) * 5 + (s.interview || 0) * 5
  for (const p of Object.values(state.projects || {})) xp += Object.values(p.stages || {}).filter(Boolean).length * 40
  xp += (state.applications || []).length * 5
  const level = Math.floor(Math.sqrt(xp / 50)) + 1
  const next = Math.pow(level, 2) * 50
  const prev = Math.pow(level - 1, 2) * 50
  return { xp, level, next, prev, pct: pct(xp - prev, next - prev) }
}

export function badges(state, today) {
  const ev = state.evidence || {}
  const st = streak(state, today)
  const notes = (state.notes || []).filter((n) => /Metric/.test(n.template)).length
  const s = {
    sqlTopics: SKILL_MAP.sql.topics.filter((t) => state.topics?.[t.id]).length, sqlProblems: ev.sql?.problems || 0,
    pbiTopics: SKILL_MAP.powerbi.topics.filter((t) => state.topics?.[t.id]).length, daxProblems: ev.powerbi?.problems || 0,
    excelTopics: SKILL_MAP.excel.topics.filter((t) => state.topics?.[t.id]).length, excelProblems: ev.excel?.problems || 0,
    metricNotes: notes, projectsShipped: projectsSummary(state).filter((p) => p.shipped).length,
    strongInterview: interviewStats(state).strong, applications: (state.applications || []).filter((a) => !['Wishlist', 'Ready to Apply'].includes(a.status)).length,
    bestStreak: st.best,
  }
  return BADGES.map((b) => ({ ...b, earned: b.test(s) }))
}

export function differentiation(state) {
  const ev = allSkillEvidence(state)
  const projects = projectsSummary(state)
  const iv = interviewStats(state)
  const notes = state.notes || []
  const apps = (state.applications || []).filter((a) => !['Wishlist', 'Ready to Apply'].includes(a.status)).length
  const tw = ['sql-cte', 'sql-rank', 'sql-laglead', 'sql-rolling'].filter((t) => state.topics?.[t]).length
  const rows = [
    { key: 'SQL depth', desc: 'Window functions + CTEs + 50 problems', score: clamp(Math.round(tw * 12.5 + Math.min(ev.sql.evidence.problems || 0, 50)))},
    { key: 'Business understanding', desc: 'Metric vault + business problems solved', score: clamp(Math.round(Math.min(notes.length, 40) * 1.5 + Math.min((ev.retail.evidence.business || 0) + (ev.bfsi.evidence.business || 0) + (ev.commercial.evidence.business || 0), 16) * 2.5)) },
    { key: 'Portfolio quality', desc: 'End-to-end projects with live dashboards + READMEs', score: clamp(Math.round(projects.reduce((a, p) => a + p.pct, 0) / 3)) },
    { key: 'Domain specialization', desc: 'Retail / BFSI / Commercial evidence', score: clamp(Math.round((ev.retail.score + ev.bfsi.score + ev.commercial.score) / 3)) },
    { key: 'Interview readiness', desc: 'Questions at confidence ≥ 4', score: clamp(iv.score) },
    { key: 'Communication', desc: '60-sec pitch, STAR stories, executive memos', score: ev.communication.score },
    { key: 'Project evidence', desc: 'Shipped projects, GitHub, case studies', score: clamp(projects.filter((p) => p.shipped).length * 33 + (projects.filter((p) => state.projects?.[p.id]?.stages?.['Case Study']).length * 1)) },
    { key: 'Application volume', desc: 'Real applications submitted', score: clamp(Math.round(Math.min(apps, 150) / 1.5)) },
  ]
  return rows
}
