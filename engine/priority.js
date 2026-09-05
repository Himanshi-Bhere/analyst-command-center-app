import { tasksForDate, overdueTasks, isClosed, isDone, programDayIndex, programWeekStart } from './tasks'
import { readiness, projectsSummary } from './scoring'
import { PRIORITY_ORDER } from '../lib/utils'
import { diffDays, addDays } from '../lib/dates'
import { SKILL_MAP } from '../data/skills'

const LANE_TO_READINESS = { sql: 'sql', powerbi: 'powerbi', excel: 'excel', statistics: 'statistics', python: 'python', business: 'business', retail: 'business', bfsi: 'business', commercial: 'business', project: 'project', aptitude: 'aptitude', interview: 'interview', application: 'interview', dsa: null }

/**
 * Smart Priority Engine.
 * Rules: interview deadline > application deadline > project deadline > weak skill > normal learning.
 * DSA is capped at LOW. Overdue high-value tasks get a boost. Returns tasks with {priority, score, reason}.
 */
export function prioritize(tasks, state, today) {
  const r = readiness(state)
  const gapByKey = Object.fromEntries(r.breakdown.map((b) => [b.key, b]))
  const weakest = r.breakdown.slice(0, 2).map((b) => b.key)
  const interviews = (state.applications || []).filter((a) => a.interviewDate && a.interviewDate >= today && ['HR', 'Technical', 'Managerial', 'Assessment'].includes(a.status))
  const nearInterview = interviews.filter((a) => diffDays(today, a.interviewDate) <= 5)
  const deadlines = (state.applications || []).filter((a) => a.deadline && a.deadline >= today && diffDays(today, a.deadline) <= 3 && ['Wishlist', 'Ready to Apply'].includes(a.status))
  const projects = projectsSummary(state)
  const projDeadlineSoon = projects.filter((p) => state.projects?.[p.id]?.deadline && diffDays(today, state.projects[p.id].deadline) <= 7 && !p.shipped)

  return tasks.map((t) => {
    let score = 50
    let reasons = []
    const cap = SKILL_MAP[t.skill]?.maxPriority
    const k = LANE_TO_READINESS[t.skill]
    if (t.primary) { score += 15; reasons.push(`primary lane this week`) }
    if (t.type === 'Interview' && nearInterview.length) { score += 40; reasons.push(`interview with ${nearInterview[0].company} in ${diffDays(today, nearInterview[0].interviewDate)}d`) }
    if (t.skill === 'application' && deadlines.length) { score += 32; reasons.push(`application deadline: ${deadlines[0].company}`) }
    if (t.skill === 'project' && projDeadlineSoon.length) { score += 26; reasons.push(`project deadline: ${projDeadlineSoon[0].name}`) }
    if (k && weakest.includes(k)) { score += 18; reasons.push(`${({ business: 'Business / Domain', project: 'Projects' })[k] || SKILL_MAP[k]?.name || k} is your largest readiness gap (−${gapByKey[k].gap} pts)`) }
    else if (k && gapByKey[k]) { score += Math.round(gapByKey[k].gap) }
    if (t.type === 'Practice' || t.type === 'Project') { score += 6 }
    if (t.type === 'Learning') { score -= 2 }
    if (t.date < today) { const age = diffDays(t.date, today); score += Math.min(14, 4 + age * 2); reasons.push(`overdue ${age}d`) }
    if (t.priorityOverride) { score += { CRITICAL: 40, HIGH: 20, MEDIUM: 0, LOW: -25 }[t.priorityOverride] }
    if (t.skill === 'dsa') { score = Math.min(score, 40); reasons = ['DSA Lite is intentionally capped at LOW'] }
    let priority = score >= 95 ? 'CRITICAL' : score >= 72 ? 'HIGH' : score >= 52 ? 'MEDIUM' : 'LOW'
    if (cap === 'LOW') priority = 'LOW'
    if (!reasons.length) reasons.push(t.why ? t.why : 'scheduled by the weekly curriculum')
    return { ...t, priority, score, reason: reasons.join(' · ') }
  }).sort((a, b) => b.score - a.score || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
}

/** "What should I do next?" — the single highest-value open task right now. */
export function nextAction(state, today) {
  const todays = tasksForDate(today, state).filter((t) => !isClosed(t, state))
  const overdue = overdueTasks(today, state)
  const pool = [...todays, ...overdue.filter((t) => t.primary || t.type !== 'Learning').slice(0, 20)]
  const ranked = prioritize(pool, state, today)
  const active = ranked.find((t) => state.taskState?.[t.id]?.status === 'active')
  const first = active || ranked[0]
  const after = ranked.filter((t) => t.id !== first?.id).slice(0, 3)
  return { next: first, after, ranked, overdueCount: overdue.length, allDoneToday: todays.length === 0 }
}

/** MUST / SHOULD / CAN buckets for today. */
export function dailyBuckets(state, today) {
  const ranked = prioritize(tasksForDate(today, state), state, today)
  return {
    must: ranked.filter((t) => ['CRITICAL', 'HIGH'].includes(t.priority)),
    should: ranked.filter((t) => t.priority === 'MEDIUM'),
    can: ranked.filter((t) => t.priority === 'LOW'),
    ranked,
  }
}

/** Catch-Up Mode: classify overdue tasks and produce a reschedule plan that never overloads a day. */
export function catchUpPlan(state, today, dailyCapMin = 60) {
  const overdue = prioritize(overdueTasks(today, state), state, today)
  const high = overdue.filter((t) => ['CRITICAL', 'HIGH'].includes(t.priority))
  const medium = overdue.filter((t) => t.priority === 'MEDIUM')
  const low = overdue.filter((t) => t.priority === 'LOW')
  // plan: high → spread over next 5 days within cap; medium → next week; low → defer (drop)
  const plan = []
  let dayIdx = 0, used = 0
  const cursor = () => addDays(today, dayIdx)
  for (const t of high) {
    if (used + (t.estMin || 30) > dailyCapMin && used > 0) { dayIdx++; used = 0 }
    if (dayIdx > 5) { plan.push({ task: t, action: 'defer', to: null }); continue }
    plan.push({ task: t, action: 'move', to: cursor() }); used += t.estMin || 30
  }
  let d2 = Math.max(dayIdx + 1, 3), used2 = 0
  for (const t of medium) {
    if (used2 + (t.estMin || 30) > dailyCapMin * 0.7 && used2 > 0) { d2++; used2 = 0 }
    if (d2 > 10) { plan.push({ task: t, action: 'defer', to: null }); continue }
    plan.push({ task: t, action: 'move', to: addDays(today, d2) }); used2 += t.estMin || 30
  }
  for (const t of low) plan.push({ task: t, action: 'defer', to: null })
  return { overdue, high, medium, low, plan }
}

/** Reminders / notifications derived from state. */
export function reminders(state, today) {
  const out = []
  const open = tasksForDate(today, state).filter((t) => !isClosed(t, state))
  if (open.length) out.push({ kind: 'tasks', level: 'info', text: `${open.length} task${open.length > 1 ? 's' : ''} still open today`, to: '/today' })
  const od = overdueTasks(today, state).length
  if (od) out.push({ kind: 'overdue', level: od > 5 ? 'warn' : 'info', text: `${od} overdue task${od > 1 ? 's' : ''} — use Catch-Up Mode, don't dump them on today`, to: '/catch-up' })
  for (const a of state.applications || []) {
    if (a.interviewDate && a.interviewDate >= today && diffDays(today, a.interviewDate) <= 7) out.push({ kind: 'interview', level: 'warn', text: `Interview: ${a.company} — ${a.role} in ${diffDays(today, a.interviewDate)}d`, to: '/applications' })
    if (a.nextActionDate && a.nextActionDate <= today && !['Rejected', 'Offer'].includes(a.status)) out.push({ kind: 'followup', level: 'info', text: `Follow-up due: ${a.company}${a.nextAction ? ' — ' + a.nextAction : ''}`, to: '/applications' })
    if (a.deadline && a.deadline >= today && diffDays(today, a.deadline) <= 3 && ['Wishlist', 'Ready to Apply'].includes(a.status)) out.push({ kind: 'deadline', level: 'warn', text: `Application deadline: ${a.company} in ${diffDays(today, a.deadline)}d`, to: '/applications' })
  }
  for (const p of projectsSummary(state)) { const dl = state.projects?.[p.id]?.deadline; if (dl && !p.shipped && diffDays(today, dl) <= 7) out.push({ kind: 'project', level: diffDays(today, dl) < 0 ? 'warn' : 'info', text: `Project deadline: ${p.name} ${diffDays(today, dl) < 0 ? 'overdue' : 'in ' + diffDays(today, dl) + 'd'}`, to: '/projects' }) }
  const due = (state.revision || []).filter((r) => r.nextReview <= today && !r.retired).length
  if (due) out.push({ kind: 'revision', level: 'info', text: `${due} revision item${due > 1 ? 's' : ''} due`, to: '/revision' })
  const dowN = programDayIndex(today)
  if (dowN === 6 && !state.weeklyReviews?.[programWeekStart(today)]) out.push({ kind: 'weekly', level: 'info', text: 'Weekly review due today', to: '/weekly' })
  if (today.slice(8) >= '28' && !state.monthlyReviews?.[today.slice(0, 7)]) out.push({ kind: 'monthly', level: 'info', text: 'Monthly review due', to: '/monthly' })
  return out
}
