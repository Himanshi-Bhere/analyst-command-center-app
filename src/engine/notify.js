import { tasksForDate, overdueTasks, isClosed, isDone, programDayIndex, programWeekStart, getWeekForDate } from './tasks'
import { prioritize } from './priority'
import { projectsSummary } from './scoring'
import { githubPlan } from './github'
import { SHOWCASE_BY_WEEK } from '../data/weekly'
import { diffDays, addDays } from '../lib/dates'
import { hrs } from '../lib/utils'

/**
 * Notification centre. Time-aware, specific, actionable.
 * Each item: { id, kind, level: 'urgent'|'warn'|'info'|'ok', title, text, to, at }
 * `id` is stable per day so the user can dismiss it for today.
 */
export function buildNotifications(state, today, now = new Date()) {
  const out = []
  const hour = now.getHours()
  const push = (n) => out.push({ level: 'info', ...n, id: `${today}:${n.id}` })
  const all = tasksForDate(today, state)
  const ranked = prioritize(all, state, today)
  const open = ranked.filter((t) => !isClosed(t, state))
  const done = all.filter((t) => isDone(t, state))
  const active = open.find((t) => state.taskState?.[t.id]?.status === 'active')
  const must = open.filter((t) => ['CRITICAL', 'HIGH'].includes(t.priority))
  const leftMin = open.reduce((a, t) => a + (t.estMin || 30), 0)
  const week = getWeekForDate(today)
  const d = programDayIndex(today)

  // ---- start / continue nudges ----
  if (active) {
    const started = state.taskState[active.id]?.startedAt
    const mins = started ? Math.round((Date.now() - started) / 60000) : 0
    push({ id: 'active', kind: 'active', level: mins > (active.estMin || 30) * 1.5 ? 'warn' : 'info', title: 'In progress', text: `${active.title}${mins ? ` · ${mins} min elapsed of ${hrs(active.estMin || 30)}` : ''}${mins > (active.estMin || 30) * 1.5 ? ' — over time, wrap up or split it' : ''}`, to: '/today' })
  } else if (open.length && done.length === 0 && hour >= 9) {
    push({ id: 'not-started', kind: 'start', level: hour >= 14 ? 'warn' : 'info', title: hour >= 14 ? 'Nothing started yet today' : 'Start your day', text: `Start with: ${ranked[0].title} (${hrs(ranked[0].estMin || 30)})`, to: '/today', task: ranked[0] })
  } else if (open.length && !active) {
    push({ id: 'next', kind: 'next', level: 'info', title: 'Next up', text: `${open[0].title} · ${hrs(open[0].estMin || 30)}`, to: '/today', task: open[0] })
  }

  // ---- today's status ----
  if (must.length && hour >= 18) push({ id: 'must-evening', kind: 'must', level: 'urgent', title: `${must.length} must-do task${must.length > 1 ? 's' : ''} still open`, text: must.slice(0, 2).map((t) => t.title).join(' · ') + (must.length > 2 ? ` +${must.length - 2}` : ''), to: '/today' })
  else if (open.length && hour >= 21) push({ id: 'late', kind: 'late', level: 'warn', title: `${open.length} task${open.length > 1 ? 's' : ''} left, ${hrs(leftMin)}`, text: 'Finish the shortest one or move the rest to tomorrow — do not leave them to pile up.', to: '/today' })
  else if (open.length) push({ id: 'open', kind: 'open', level: 'info', title: `${done.length} / ${all.length} done today`, text: `${open.length} open · ${hrs(leftMin)} remaining${must.length ? ` · ${must.length} must-do` : ''}`, to: '/today' })
  if (all.length && open.length === 0) push({ id: 'all-done', kind: 'done', level: 'ok', title: 'Today is complete', text: 'Log SQL problems, rate 5 interview questions, or open Revision if you still have energy.', to: '/revision' })

  // ---- overdue ----
  const od = overdueTasks(today, state)
  if (od.length) {
    const hi = od.filter((t) => ['CRITICAL', 'HIGH'].includes(prioritize([t], state, today)[0]?.priority)).length
    push({ id: 'overdue', kind: 'overdue', level: od.length > 5 || hi ? 'warn' : 'info', title: `${od.length} overdue task${od.length > 1 ? 's' : ''}${hi ? ` (${hi} high priority)` : ''}`, text: `Oldest: ${od[0].title} (${fmtAgo(od[0].date, today)}). Reschedule by priority in Catch-Up Mode.`, to: '/catch-up' })
  }

  // ---- GitHub ----
  const gh = githubPlan(state, today)
  const ghLeft = gh.must.filter((i) => !i.pushed)
  const ghReady = ghLeft.filter((i) => i.kind !== 'task' || i.done)
  if (ghReady.length && hour >= 12) push({ id: 'gh-ready', kind: 'github', level: hour >= 20 ? 'warn' : 'info', title: `${ghReady.length} item${ghReady.length > 1 ? 's' : ''} ready to push to GitHub`, text: ghReady.slice(0, 2).map((i) => `${i.kind === 'task' ? i.task.title : i.title} → ${i.advice.repo}`).join(' · '), to: '/github' })
  else if (ghLeft.length && hour >= 20) push({ id: 'gh-left', kind: 'github', level: 'info', title: 'GitHub: nothing pushed yet today', text: `${ghLeft.length} item${ghLeft.length > 1 ? 's' : ''} planned — even a partial push keeps the streak.`, to: '/github' })

  // ---- weekly showcase ----
  const sc = SHOWCASE_BY_WEEK[week.n]
  if (sc) {
    const st = state.weekly?.[sc.id]?.stages || {}
    if (d === 5 && !st.built) push({ id: 'sc-build', kind: 'showcase', level: 'info', title: `Showcase day: ${sc.title}`, text: `${sc.hours}h · ${sc.stack.join(' + ')} · dataset linked in the brief`, to: `/showcase/${sc.id}` })
    if (d === 6 && !st.pushed) push({ id: 'sc-push', kind: 'showcase', level: 'warn', title: `Push ${sc.repo} today`, text: 'Even 60% done is worth pushing. Write what is missing in the README.', to: `/showcase/${sc.id}` })
    if (d < 5 && !st.scoped && d >= 2) push({ id: 'sc-scope', kind: 'showcase', level: 'info', title: `Scope this week's showcase (15 min)`, text: `${sc.title}: download the dataset, write 3 business questions.`, to: `/showcase/${sc.id}` })
  }
  // previous week's showcase never pushed
  const prev = SHOWCASE_BY_WEEK[week.n - 1]
  if (prev && !(state.weekly?.[prev.id]?.stages?.pushed)) push({ id: 'sc-prev', kind: 'showcase', level: 'warn', title: `Last week's showcase not pushed: ${prev.title}`, text: 'Ship it this week in a 45-minute slot — unpushed work is invisible.', to: `/showcase/${prev.id}` })

  // ---- career ----
  for (const a of state.applications || []) {
    if (a.interviewDate && a.interviewDate >= today && diffDays(today, a.interviewDate) <= 7) push({ id: `iv-${a.id}`, kind: 'interview', level: diffDays(today, a.interviewDate) <= 2 ? 'urgent' : 'warn', title: `Interview: ${a.company} in ${diffDays(today, a.interviewDate)}d`, text: `${a.role} · ${a.status}. Mock the round in the Interview Center.`, to: '/interviews' })
    if (a.nextActionDate && a.nextActionDate <= today && !['Rejected', 'Offer'].includes(a.status)) push({ id: `fu-${a.id}`, kind: 'followup', level: 'info', title: `Follow-up due: ${a.company}`, text: a.nextAction || 'Send the follow-up message', to: '/applications' })
    if (a.deadline && a.deadline >= today && diffDays(today, a.deadline) <= 3 && ['Wishlist', 'Ready to Apply'].includes(a.status)) push({ id: `dl-${a.id}`, kind: 'deadline', level: 'urgent', title: `Application deadline: ${a.company} in ${diffDays(today, a.deadline)}d`, text: `${a.role} — apply today.`, to: '/applications' })
  }
  for (const p of projectsSummary(state)) { const dl = state.projects?.[p.id]?.deadline; if (dl && !p.shipped && diffDays(today, dl) <= 7) push({ id: `pd-${p.id}`, kind: 'project', level: diffDays(today, dl) < 0 ? 'warn' : 'info', title: `Project deadline: ${p.name}`, text: `${diffDays(today, dl) < 0 ? Math.abs(diffDays(today, dl)) + 'd overdue' : 'in ' + diffDays(today, dl) + 'd'} · ${p.pct}% complete`, to: `/projects/${p.id}` }) }

  // ---- revision / reviews / streak ----
  const due = (state.revision || []).filter((r) => r.nextReview <= today && !r.retired)
  if (due.length) push({ id: 'rev', kind: 'revision', level: 'info', title: `${due.length} revision item${due.length > 1 ? 's' : ''} due`, text: due.slice(0, 2).map((r) => r.title).join(' · '), to: '/revision' })
  if (d === 6 && !state.weeklyReviews?.[programWeekStart(today)]) push({ id: 'wr', kind: 'weekly', level: 'info', title: 'Weekly review due today', text: `${week.code} scorecard: what worked, what was hardest, next week's plan.`, to: '/weekly' })
  if (today.slice(8) >= '28' && !state.monthlyReviews?.[today.slice(0, 7)]) push({ id: 'mr', kind: 'monthly', level: 'info', title: 'Monthly review due', text: 'Close the month before the next phase starts.', to: '/monthly' })
  const yday = addDays(today, -1)
  const ydayTasks = tasksForDate(yday, state)
  if (ydayTasks.length && !ydayTasks.some((t) => isDone(t, state)) && !(state.hoursLog?.[yday] > 0) && hour >= 9 && yday >= '2026-09-04') push({ id: 'streak', kind: 'streak', level: 'warn', title: 'Streak at risk — nothing logged yesterday', text: 'Do one 30-minute task today to keep momentum.', to: '/today' })

  const order = { urgent: 0, warn: 1, info: 2, ok: 3 }
  return out.sort((a, b) => order[a.level] - order[b.level])
}

function fmtAgo(date, today) { const n = diffDays(date, today); return n === 1 ? 'yesterday' : `${n} days ago` }

/** Browser notification helper (opt-in, works in the installed PWA too). */
export const canNotify = () => typeof window !== 'undefined' && 'Notification' in window
export async function requestNotifyPermission() { if (!canNotify()) return 'unsupported'; if (Notification.permission === 'granted') return 'granted'; return await Notification.requestPermission() }
export function showBrowserNotification(n) {
  if (!canNotify() || Notification.permission !== 'granted') return false
  try { const x = new Notification(n.title, { body: n.text, tag: n.id, icon: './icon-192.png', badge: './icon-192.png' }); x.onclick = () => { window.focus(); window.location.hash = n.to || '/' }; return true } catch { return false }
}
