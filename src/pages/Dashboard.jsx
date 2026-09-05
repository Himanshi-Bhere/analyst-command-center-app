import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, ArrowRight, Target, AlertTriangle, Play, Check, CalendarClock, ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Card, ProgressRing, Label, H2, Bar } from '../components/ui'
import TaskCard from '../components/TaskCard'
import { fmtLong, greeting, addDays, diffDays, fmtShort } from '../lib/dates'
import { hrs, skillColor, cn } from '../lib/utils'
import { getWeekForDate, getMonthForDate, tasksForDate, isClosed, programWeekStart, weekStartFor, programDayIndex } from '../engine/tasks'
import { READINESS_LABELS, readiness, completionStats, weekStats, streak, roadmapProgress, projectsSummary, domainReadiness } from '../engine/scoring'
import { nextAction } from '../engine/priority'
import { SKILL_MAP } from '../data/skills'

const DOMAIN_LABEL = { retail: 'Retail / E-Commerce', bfsi: 'BFSI / FinTech', commercial: 'Commercial / Revenue' }
const DAY_MODE = ['Learn concept', 'Guided exercises', 'Business problems', 'Interview questions', 'Timed practice', 'Mini-project', 'Revision + test']

function Kpi({ label, value, sub, ring, color, to }) {
  const nav = useNavigate()
  return (
    <div onClick={() => nav(to)} className="card p-4 flex items-center gap-4 cursor-pointer card-hover">
      <ProgressRing value={ring} size={56} stroke={5} color={color} />
      <div className="min-w-0">
        <div className="label">{label}</div>
        <div className="num text-[22px] font-bold leading-tight mt-0.5">{value}</div>
        <div className="text-[11.5px] text-muted mt-0.5 truncate">{sub}</div>
      </div>
    </div>
  )
}

function Stat({ label, value, sub, to }) {
  const nav = useNavigate()
  return (
    <div onClick={to ? () => nav(to) : undefined} className={cn('card px-4 py-3', to && 'cursor-pointer card-hover')}>
      <div className="label">{label}</div>
      <div className="num text-[17px] font-semibold mt-0.5 leading-tight">{value}</div>
      {sub && <div className="text-[11px] text-muted mt-0.5 truncate">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const state = useStore()
  const { setTaskStatus, moveTask } = state
  const today = state.today()
  const nav = useNavigate()
  const week = getWeekForDate(today)
  const month = getMonthForDate(today)
  const d = useMemo(() => {
    const r = readiness(state)
    return { r, cs: completionStats(state, today), ws: weekStats(state, programWeekStart(today)), st: streak(state, today), rp: roadmapProgress(state, today), ps: projectsSummary(state), dr: domainReadiness(state), na: nextAction(state, today), tasks: tasksForDate(today, state) }
  }, [state.taskState, state.taskOverrides, state.customTasks, state.topics, state.evidence, state.projects, state.interview, state.applications, state.aptitude, state.hoursLog, state.notes, today])
  const { r, cs, ws, st, rp, ps, dr, na, tasks } = d
  const apps = state.applications
  const submitted = apps.filter((a) => !['Wishlist', 'Ready to Apply'].includes(a.status)).length
  const weeklyTarget = state.settings.weeklyHours || 21
  const next = na.next
  const weakest = r.breakdown[0]
  const activeProject = ps.find((p) => !p.shipped) || ps[0]
  const nextMilestone = useMemo(() => {
    const m = [
      { when: addDays(weekStartFor(4), 6), label: 'SQL window functions without Google (W4)' }, { when: addDays(weekStartFor(8), 6), label: 'Executive Power BI dashboard on a star schema (W8)' }, { when: addDays(weekStartFor(10), 6), label: 'Project 1 shipped (W10)' },
      { when: addDays(weekStartFor(12), 6), label: 'Domain metric vault: 40+ metrics (W12)' }, { when: addDays(weekStartFor(14), 6), label: 'Project 3 shipped + mocks (W14)' }, { when: addDays(weekStartFor(16), 6), label: 'First application batch out (W16)' }, { when: '2027-05-30', label: 'Full-time analytics role secured' },
    ]
    return m.find((x) => x.when >= today) || m[m.length - 1]
  }, [today])
  const todayDow = programDayIndex(today)
  const todayTopic = week.topics[Math.min(todayDow, week.topics.length - 1)]
  const openTasks = tasks.filter((t) => !isClosed(t, state))
  const pace = rp.elapsedPct ? Math.round((rp.pct / rp.elapsedPct) * 100) : 100

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight">{greeting()}, {state.settings.name}.</h1>
          <p className="text-[13px] text-muted mt-0.5">{fmtLong(today)} · {week.code} — {week.title} · {month.phase}</p>
        </div>
        <Link to="/today" className="btn-primary">Open Today <ArrowRight size={13} /></Link>
      </div>

      {/* 4 primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <Kpi label="Today" value={`${cs.done} / ${cs.total}`} sub={`${hrs(cs.minsDone)} of ${hrs(cs.minsPlanned)} planned`} ring={cs.pct} color="rgb(var(--c-accent))" to="/today" />
        <Kpi label="This week" value={`${ws.done} / ${ws.total}`} sub={`${ws.hoursDone}h of ${weeklyTarget}h target`} ring={ws.pct} color="rgb(var(--c-info))" to="/weekly" />
        <Kpi label="Roadmap · Sep → Dec" value={`${rp.pct}%`} sub={`day ${rp.elapsed + 1} of ${rp.days} · ${rp.done} tasks done`} ring={rp.pct} color="rgb(var(--c-ok))" to="/roadmap" />
        <Kpi label="Readiness score" value={`${r.total} / 100`} sub={`target 85 · weakest: ${READINESS_LABELS[weakest.key]}`} ring={Math.round((r.total / 85) * 100)} color={r.total >= 85 ? 'rgb(var(--c-ok))' : r.total >= 50 ? 'rgb(var(--c-warn))' : 'rgb(var(--c-bad))'} to="/progress" />
      </div>

      {/* 6 small stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <Stat label="Streak" value={`${st.current} days`} sub={`best ${st.best}`} />
        <Stat label="Projects shipped" value={`${ps.filter((p) => p.shipped).length} / 3`} sub={`${activeProject.code} at ${activeProject.pct}%`} to="/projects" />
        <Stat label="Applications" value={submitted} sub={`${apps.length} tracked`} to="/applications" />
        <Stat label="Interview answers" value={r.iv.strong} sub="rated 4–5" to="/interviews" />
        <Stat label="Best domain" value={DOMAIN_LABEL[dr.best].split(' / ')[0]} sub={`${dr[dr.best]}% ready`} to="/domain/retail" />
        <Stat label="Pace" value={rp.activeElapsed < 2 ? 'Day 1' : pace >= 85 ? 'On track' : 'Behind'} sub={`${rp.elapsedPct}% time · ${rp.pct}% done`} to="/checklist" />
      </div>

      {/* next action + today's goal */}
      <div className="grid lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><Zap size={15} className="text-accent-glow" /><H2>What should I do next?</H2></div>
            <span className="text-[11px] text-muted">Computed from interviews → applications → deadlines → weak skills → plan</span>
          </div>
          {next ? (
            <div>
              <div className="text-[17px] font-semibold leading-snug">{next.title}</div>
              <div className="text-[12.5px] text-muted mt-1">{next.reason}</div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[12px] text-muted">
                <span className={cn('font-semibold', next.priority === 'CRITICAL' || next.priority === 'HIGH' ? 'text-bad' : next.priority === 'MEDIUM' ? 'text-warn' : 'text-muted')}>{next.priority}</span>
                <span>{hrs(next.estMin || 30)}</span><span>{SKILL_MAP[next.skill]?.name || next.skill}</span><span>{next.type}</span>
                {next.date < today && <span className="text-bad">Overdue since {fmtShort(next.date)}</span>}
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <button className="btn-primary" onClick={() => { setTaskStatus(next, 'active'); nav('/today') }}><Play size={13} />Start</button>
                <button className="btn-ghost" onClick={() => setTaskStatus(next, 'done')}><Check size={13} />Done</button>
                <button className="btn-ghost" onClick={() => moveTask(next, addDays(today, 1))}><CalendarClock size={13} />Tomorrow</button>
              </div>
              {na.after.length > 0 && (
                <div className="mt-4 pt-3 border-t border-line">
                  <div className="label mb-1.5">Then</div>
                  {na.after.map((t, i) => <div key={t.id} className="flex items-center gap-3 text-[12.5px] py-1"><span className="num text-muted w-4">{i + 2}</span><span className="text-soft truncate flex-1">{t.title}</span><span className="num text-muted">{hrs(t.estMin || 30)}</span></div>)}
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center"><div className="text-ok font-semibold">Everything for today is closed.</div><div className="text-muted text-[13px] mt-1">Log SQL problems, rate interview questions, or open Revision.</div></div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-3"><Target size={15} className="text-ok" /><H2>Today's goal</H2></div>
          <div className="text-[15px] font-semibold leading-snug">{week.goal}</div>
          <div className="mt-3 space-y-2 text-[12.5px]">
            <div className="flex justify-between gap-3"><span className="text-muted">Focus topic</span><span className="text-soft text-right">{todayTopic}</span></div>
            <div className="flex justify-between gap-3"><span className="text-muted">Day type</span><span className="text-soft">{DAY_MODE[todayDow]}</span></div>
            <div className="flex justify-between gap-3"><span className="text-muted">Primary skill</span><span className="text-soft">{SKILL_MAP[week.primary]?.name || week.primary}</span></div>
            <div className="flex justify-between gap-3"><span className="text-muted">Project</span><Link to={`/projects/${activeProject.id}`} className="text-accent-glow hover:underline text-right truncate">{activeProject.code} · {activeProject.pct}%</Link></div>
            <div className="flex justify-between gap-3"><span className="text-muted">Next milestone</span><span className="text-soft text-right">{nextMilestone.label} · {diffDays(today, nextMilestone.when)}d</span></div>
          </div>
          <div className="mt-4 pt-3 border-t border-line">
            <div className="flex justify-between text-[11.5px] mb-1"><span className="text-muted">Weekly hours</span><span className="num">{ws.hoursDone} / {weeklyTarget}h</span></div>
            <Bar value={Math.round((ws.hoursDone / weeklyTarget) * 100)} />
          </div>
        </Card>
      </div>

      {na.overdueCount > 0 && (
        <div className="card px-4 py-3 border-warn/40 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[13px] flex items-center gap-2"><AlertTriangle size={14} className="text-warn" /><span className="font-semibold text-warn">{na.overdueCount} overdue task{na.overdueCount > 1 ? 's' : ''}.</span><span className="text-soft">Let Catch-Up Mode reschedule them by priority instead of piling them on today.</span></div>
          <Link to="/catch-up" className="btn-subtle">Open Catch-Up Mode <ChevronRight size={13} /></Link>
        </div>
      )}

      {/* today's plan */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <H2>Today's plan <span className="text-muted font-normal text-[13px]">· {openTasks.length} open · {hrs(cs.minsPlanned - cs.minsDone)} left</span></H2>
          <Link to="/today" className="text-[12.5px] text-accent-glow hover:underline">Full list</Link>
        </div>
        {tasks.length === 0 ? <Card className="text-center text-muted text-[13px]">No tasks scheduled today.</Card> : (
          <div className="space-y-2">{tasks.slice(0, 6).map((t) => <TaskCard key={t.id} task={t} compact />)}{tasks.length > 6 && <Link to="/today" className="block text-center text-[12.5px] text-muted hover:text-ink py-1">+{tasks.length - 6} more on Today</Link>}</div>
        )}
      </div>

      {/* weak areas + domains — two calm cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-3"><H2>Where I'm weakest</H2><Link to="/progress" className="text-[12px] text-accent-glow hover:underline">Why is my score {r.total}?</Link></div>
          <div className="space-y-2.5">
            {r.breakdown.slice(0, 4).map((b) => <div key={b.key}><div className="flex justify-between text-[12.5px]"><span className="text-soft">{READINESS_LABELS[b.key] || b.key}</span><span className="num text-muted">{b.score}% · −{b.gap} pts</span></div><Bar value={b.score} color={skillColor(b.key)} className="mt-1" /></div>)}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-3"><H2>Domain readiness</H2><span className="text-[12px] text-muted">Fastest route: <span className="text-ink">{DOMAIN_LABEL[dr.best]}</span></span></div>
          <div className="space-y-2.5">
            {['retail', 'commercial', 'bfsi'].map((k) => <div key={k}><div className="flex justify-between text-[12.5px]"><span className="text-soft">{DOMAIN_LABEL[k]}</span><span className="num">{dr[k]}%</span></div><Bar value={dr[k]} color={skillColor(k)} className="mt-1" /></div>)}
          </div>
          <div className="mt-3 pt-3 border-t border-line text-[12px] text-muted">Rule: 20% theory / 80% practice · Learn → Practice → Apply → Explain → Test → Revise.</div>
        </Card>
      </div>
    </div>
  )
}
