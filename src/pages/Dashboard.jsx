import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, ArrowRight, Target, AlertTriangle, Flame, Clock, Layers, ClipboardList, MessageSquare, Compass, Play, Check, CalendarClock, ChevronRight, Award } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Card, KpiCard, ProgressRing, Label, Bar, PriorityChip, SkillChip, Chip, H2 } from '../components/ui'
import { fmtLong, greeting, addDays, startOfWeek, diffDays, fmtShort } from '../lib/dates'
import { hrs, skillColor, cn } from '../lib/utils'
import { getWeekForDate, getMonthForDate, weekNumberFor, tasksForDate, isClosed, programWeekStart, weekStartFor, programDayIndex } from '../engine/tasks'
import { READINESS_LABELS, readiness, completionStats, weekStats, streak, roadmapProgress, projectsSummary, domainReadiness, xpAndLevel } from '../engine/scoring'
import { nextAction, dailyBuckets } from '../engine/priority'
import { SKILL_MAP } from '../data/skills'
import { PROJECTS } from '../data/projects'

const DOMAIN_LABEL = { retail: 'Retail / E-Commerce', bfsi: 'BFSI / FinTech', commercial: 'Commercial / Revenue' }

export default function Dashboard() {
  const state = useStore()
  const { setTaskStatus, moveTask } = state
  const today = state.today()
  const nav = useNavigate()
  const week = getWeekForDate(today)
  const month = getMonthForDate(today)
  const d = useMemo(() => {
    const r = readiness(state)
    return {
      r, cs: completionStats(state, today), ws: weekStats(state, programWeekStart(today)), st: streak(state, today), rp: roadmapProgress(state, today), ps: projectsSummary(state), dr: domainReadiness(state), xp: xpAndLevel(state),
      na: nextAction(state, today), buckets: dailyBuckets(state, today),
    }
  }, [state.taskState, state.taskOverrides, state.customTasks, state.topics, state.evidence, state.projects, state.interview, state.applications, state.aptitude, state.hoursLog, state.notes, today])
  const { r, cs, ws, st, rp, ps, dr, xp, na, buckets } = d
  const apps = state.applications
  const submitted = apps.filter((a) => !['Wishlist', 'Ready to Apply'].includes(a.status)).length
  const interviews = apps.filter((a) => a.interviewDate && a.interviewDate >= today).length
  const weekN = weekNumberFor(today)
  const weeklyTarget = state.settings.weeklyHours || 21
  const next = na.next
  const weakest = r.breakdown[0]
  const activeProject = ps.find((p) => !p.shipped) || ps[0]
  const nextMilestone = useMemo(() => {
    const m = [
      { when: addDays(weekStartFor(4), 6), label: 'SQL Window Functions without Google (W4)' }, { when: addDays(weekStartFor(8), 6), label: 'Executive Power BI dashboard on a star schema (W8)' }, { when: addDays(weekStartFor(10), 6), label: 'Project 1 shipped (W10)' },
      { when: addDays(weekStartFor(12), 6), label: 'Domain metric vault: 40+ metrics (W12)' }, { when: addDays(weekStartFor(14), 6), label: 'Project 3 shipped + mocks (W14)' }, { when: addDays(weekStartFor(16), 6), label: 'First application batch out (W16)' }, { when: '2027-05-30', label: 'Full-time analytics role secured' },
    ]
    return m.find((x) => x.when >= today) || m[m.length - 1]
  }, [today])
  const dayName = fmtLong(today)
  const todayDow = programDayIndex(today)
  const todayGoal = week.topics[Math.min(todayDow, week.topics.length - 1)]

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight">{greeting()}, {state.settings.name}.</h1>
          <p className="text-[13px] text-muted mt-0.5">{dayName} · Your personal analytics career command center.</p>
        </div>
        <div className="flex items-center gap-2">
          <Chip className="text-soft border-line2 bg-raised">{month.phase}</Chip>
          <Chip className="text-accent-glow border-accent/40 bg-accent/10">{week.code} — {week.title}</Chip>
          <Chip className="text-warn border-warn/40 bg-warn/10">Lvl {xp.level} · {xp.xp} XP</Chip>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label="Today" value={`${cs.done} / ${cs.total}`} sub={`${cs.pct}% · ${hrs(cs.minsDone)} of ${hrs(cs.minsPlanned)}`} ring={cs.pct} ringColor="#7c6cf6" onClick={() => nav('/today')} />
        <KpiCard label="This week" value={`${ws.done} / ${ws.total}`} sub={`tasks · ${ws.pct}% complete`} ring={ws.pct} ringColor="#a99cff" onClick={() => nav('/weekly')} />
        <KpiCard label="Roadmap Sep→Dec" value={`${rp.pct}%`} sub={`${rp.done} tasks · day ${rp.elapsed + 1}/${rp.days}`} ring={rp.pct} ringColor="#4fb7f5" onClick={() => nav('/roadmap')} />
        <KpiCard label="Readiness" value={`${r.total}`} sub={`target 85+ · gap ${Math.max(0, 85 - r.total)}`} ring={Math.round((r.total / 85) * 100)} ringColor={r.total >= 85 ? '#3ddc97' : r.total >= 50 ? '#f5b544' : '#f06a6a'} onClick={() => nav('/progress')} />
        <KpiCard label="Learning streak" value={`${st.current}d`} sub={`best ${st.best}d · ${st.activeDays} active days`} icon={Flame} />
        <KpiCard label="Hours / week" value={`${ws.hoursDone} / ${weeklyTarget}`} sub={`${Math.round((ws.hoursDone / weeklyTarget) * 100)}% of target`} ring={Math.round((ws.hoursDone / weeklyTarget) * 100)} ringColor="#3ddc97" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <KpiCard label="Current phase" value={month.phase.replace(/^Phase (\d) — /, 'P$1 · ')} sub={month.title.split('—')[0].trim()} icon={Compass} onClick={() => nav('/roadmap')} />
        <KpiCard label="Current week" value={`${week.code}`} sub={week.title} icon={Clock} onClick={() => nav('/weekly')} />
        <KpiCard label="Portfolio" value={`${ps.filter((p) => p.shipped).length} / 3`} sub={`avg ${Math.round(ps.reduce((a, p) => a + p.pct, 0) / 3)}% across projects`} icon={Layers} onClick={() => nav('/projects')} />
        <KpiCard label="Applications" value={submitted} sub={`${apps.length} tracked · ${apps.filter((a) => a.status === 'Offer').length} offers`} icon={ClipboardList} onClick={() => nav('/applications')} />
        <KpiCard label="Interviews" value={interviews} sub={`scheduled · ${r.iv.strong} strong answers`} icon={MessageSquare} onClick={() => nav('/interviews')} />
      </div>

      {/* next action + today's goal */}
      <div className="grid lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3 border-accent/40 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 glow-line" />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><Zap size={15} className="text-accent-glow" /><H2>What should I do next?</H2></div>
            {na.overdueCount > 0 && <Link to="/catch-up" className="chip text-bad border-bad/40 bg-bad/10 hover:bg-bad/20"><AlertTriangle size={11} />{na.overdueCount} overdue</Link>}
          </div>
          {next ? (
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5"><span className="label text-accent-glow">Priority 01</span><PriorityChip p={next.priority} /><SkillChip skill={next.skill} /><Chip className="text-muted border-line2 bg-raised">{next.type}</Chip>{next.date < today && <Chip className="text-bad border-bad/40 bg-bad/10">from {fmtShort(next.date)}</Chip>}</div>
              <div className="text-[18px] font-semibold leading-snug">{next.title}</div>
              <div className="mt-2 grid sm:grid-cols-3 gap-2 text-[12.5px]">
                <div className="bg-raised/60 border border-line rounded-md px-2.5 py-2"><div className="label">Reason</div><div className="text-soft mt-0.5">{next.reason}</div></div>
                <div className="bg-raised/60 border border-line rounded-md px-2.5 py-2"><div className="label">Estimated</div><div className="num text-ink mt-0.5 text-[15px] font-semibold">{hrs(next.estMin || 30)}</div><div className="text-muted">{next.difficulty}</div></div>
                <div className="bg-raised/60 border border-line rounded-md px-2.5 py-2"><div className="label">Resource</div><div className="mt-0.5">{next.resource?.url ? <a className="text-accent-glow hover:underline" href={next.resource.url.startsWith('/') ? '#' + next.resource.url : next.resource.url} target={next.resource.url.startsWith('/') ? undefined : '_blank'} rel="noreferrer">{next.resource.name}</a> : <span className="text-soft">{next.resource?.name || '—'}</span>}</div><div className="text-muted">then: {na.after[0]?.title?.slice(0, 40) || 'weekly review'}{na.after[0]?.title?.length > 40 ? '…' : ''}</div></div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <button className="btn-primary" onClick={() => { setTaskStatus(next, 'active'); nav('/today') }}><Play size={13} />Start Task</button>
                <Link to="/today" className="btn-ghost">View Plan</Link>
                <button className="btn-ghost" onClick={() => moveTask(next, addDays(today, 1))}><CalendarClock size={13} />Reschedule</button>
                <button className="btn-ghost" onClick={() => setTaskStatus(next, 'done')}><Check size={13} />Mark Done</button>
              </div>
              {na.after.length > 0 && (
                <div className="mt-3 pt-3 border-t border-line">
                  <div className="label mb-1">Up next</div>
                  {na.after.map((t, i) => <div key={t.id} className="flex items-center gap-2 text-[12.5px] py-0.5"><span className="num text-muted w-6">0{i + 2}</span><PriorityChip p={t.priority} /><span className="text-soft truncate flex-1">{t.title}</span><span className="num text-muted">{hrs(t.estMin || 30)}</span></div>)}
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center"><div className="text-ok font-semibold">Everything for today is closed.</div><div className="text-muted text-[13px] mt-1">Log SQL problems, rate interview questions, or open Revision.</div></div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-3"><Target size={15} className="text-ok" /><H2>Today's Goal</H2></div>
          <div className="text-[16px] font-semibold leading-snug">{week.goal}</div>
          <div className="text-[12.5px] text-muted mt-1">{week.code} focus today: <span className="text-soft">{todayGoal}</span> · {['Learn concept', 'Guided exercises', 'Business problems', 'Interview questions', 'Timed practice', 'Mini-project', 'Revision + test'][todayDow]}</div>
          <div className="mt-3 space-y-2">
            <div><div className="flex justify-between text-[11.5px] mb-1"><span className="text-muted">MUST do today</span><span className="num">{buckets.must.filter((t) => !isClosed(t, state)).length} open</span></div><Bar value={buckets.must.length ? Math.round((buckets.must.filter((t) => isClosed(t, state)).length / buckets.must.length) * 100) : 100} color="#f06a6a" /></div>
            <div><div className="flex justify-between text-[11.5px] mb-1"><span className="text-muted">SHOULD do</span><span className="num">{buckets.should.filter((t) => !isClosed(t, state)).length} open</span></div><Bar value={buckets.should.length ? Math.round((buckets.should.filter((t) => isClosed(t, state)).length / buckets.should.length) * 100) : 100} color="#4fb7f5" /></div>
            <div><div className="flex justify-between text-[11.5px] mb-1"><span className="text-muted">CAN postpone</span><span className="num">{buckets.can.filter((t) => !isClosed(t, state)).length} open</span></div><Bar value={buckets.can.length ? Math.round((buckets.can.filter((t) => isClosed(t, state)).length / buckets.can.length) * 100) : 100} color="#7c7c92" /></div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Chip className="text-soft border-line2 bg-raised">{month.name}</Chip>
            <Chip color={activeProject?.color}>Project: {activeProject?.name.split(' ').slice(0, 2).join(' ')}</Chip>
            <Chip color={skillColor(week.primary)}>Primary: {SKILL_MAP[week.primary]?.name || week.primary}</Chip>
          </div>
          <Link to="/today" className="btn-subtle w-full justify-center mt-3">Open Today <ArrowRight size={13} /></Link>
        </Card>
      </div>

      {na.overdueCount > 0 && (
        <div className="card p-3 border-warn/40 bg-warn/5 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[13px]"><span className="font-semibold text-warn">{na.overdueCount} overdue task{na.overdueCount > 1 ? 's' : ''}.</span> <span className="text-soft">Missing a day is normal — don't dump them all on today. Let the engine reschedule by priority.</span></div>
          <Link to="/catch-up" className="btn-subtle">Open Catch-Up Mode <ChevronRight size={13} /></Link>
        </div>
      )}

      {/* the 10 questions row */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <Label>What am I weak at?</Label>
          <div className="mt-2 space-y-2">
            {r.breakdown.slice(0, 3).map((b) => <div key={b.key}><div className="flex justify-between text-[12.5px]"><span className="text-soft">{READINESS_LABELS[b.key] || b.key}</span><span className="num text-muted">{b.score}% · −{b.gap} pts</span></div><Bar value={b.score} color={skillColor(b.key)} className="mt-1" /></div>)}
          </div>
          <div className="text-[11.5px] text-muted mt-2">Largest readiness gap: <span className="text-soft">{READINESS_LABELS[weakest.key]}</span> (worth {weakest.weight}% of the score).</div>
        </Card>
        <Card>
          <Label>Next milestone</Label>
          <div className="text-[15px] font-semibold mt-1.5 leading-snug">{nextMilestone.label}</div>
          <div className="text-[12px] text-muted mt-1">{fmtShort(nextMilestone.when)} · in {diffDays(today, nextMilestone.when)} days</div>
          <div className="mt-3"><Label>Project I'm building</Label><Link to={`/projects/${activeProject.id}`} className="block mt-1 text-[13px] text-soft hover:text-ink">{activeProject.code} — {activeProject.name}</Link><Bar value={activeProject.pct} color={activeProject.color} className="mt-1.5" /><div className="num text-[11px] text-muted mt-0.5">{activeProject.pct}% · {activeProject.done}/{activeProject.total} stages</div></div>
        </Card>
        <Card>
          <Label>Domain readiness</Label>
          <div className="mt-2 space-y-2">
            {['retail', 'commercial', 'bfsi'].map((k) => <div key={k}><div className="flex justify-between text-[12.5px]"><span className="text-soft">{DOMAIN_LABEL[k]}</span><span className="num">{dr[k]}%</span></div><Bar value={dr[k]} color={skillColor(k)} className="mt-1" /></div>)}
          </div>
          <div className="text-[11.5px] text-muted mt-2">Fastest route to interview readiness: <span className="text-ink font-medium">{DOMAIN_LABEL[dr.best]}</span>.</div>
        </Card>
        <Card>
          <Label>Am I on track for December?</Label>
          {(() => { const pace = rp.elapsedPct ? Math.round((rp.pct / rp.elapsedPct) * 100) : 100; const ok = pace >= 85; const early = rp.activeElapsed < 2; return (
            <div className="mt-1.5">
              <div className={cn('text-[15px] font-semibold', early ? 'text-info' : ok ? 'text-ok' : 'text-warn')}>{early ? 'Day 1 — pace measurable from tomorrow' : ok ? 'On track' : 'Behind pace'}</div>
              <div className="text-[12px] text-muted mt-1">{rp.elapsedPct}% of your Phase 1 time elapsed · {rp.pct}% of tasks done{!early && ` · pace index ${pace}`}</div>
              <div className="mt-2 text-[12px] text-soft">Readiness {r.total} → 85 needs +{Math.max(0, 85 - r.total)} pts in {diffDays(today, '2026-12-31')} days ({(Math.max(0, 85 - r.total) / Math.max(1, diffDays(today, '2026-12-31') / 7)).toFixed(1)} pts/week).</div>
              <Link to="/checklist" className="btn-ghost btn-xs mt-2">December checklist <ArrowRight size={11} /></Link>
            </div>
          ) })()}
        </Card>
      </div>

      {/* mission + week lanes */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-2"><Award size={14} className="text-accent-glow" /><Label>My mission</Label></div>
          <div className="text-[14px] font-medium leading-snug">Become an outstanding Retail / E-Commerce / Commercial / BFSI Analyst candidate before graduation.</div>
          <div className="mt-3 space-y-1.5 text-[12.5px]">
            <div className="flex gap-2"><span className="num text-accent-glow w-10">2026</span><span className="text-soft">Internship/job-ready by December — 3 flagship projects, SQL window-function fluency, executive Power BI.</span></div>
            <div className="flex gap-2"><span className="num text-accent-glow w-10">2027</span><span className="text-soft">Secure a full-time analytics role before graduation via aggressive, tracked applications and interview conversion.</span></div>
          </div>
          <div className="mt-3 text-[11.5px] text-muted">Execution rule: 20% theory / 80% practice · Learn → Practice → Apply → Explain → Test → Revise.</div>
        </Card>
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-2"><Label>This week's lanes — {week.code} ({Object.values(week.lanes).reduce((a, b) => a + b, 0)}h planned)</Label><Link to="/weekly" className="text-[12px] text-accent-glow hover:underline">Weekly plan</Link></div>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
            {Object.entries(week.lanes).filter(([, h]) => h > 0).sort((a, b) => b[1] - a[1]).map(([lane, h]) => {
              const doneMin = ws.perDay.length ? tasksForWeekLane(state, today, lane) : 0
              return <div key={lane}><div className="flex justify-between text-[12.5px]"><span className="text-soft">{SKILL_MAP[lane]?.name || lane}</span><span className="num text-muted">{(doneMin / 60).toFixed(1)} / {h}h</span></div><Bar value={Math.round((doneMin / 60 / h) * 100)} color={skillColor(lane)} className="mt-1" /></div>
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}

function tasksForWeekLane(state, today, lane) {
  const ws = programWeekStart(today)
  let m = 0
  for (let i = 0; i < 7; i++) for (const t of tasksForDate(addDays(ws, i), state)) if (t.skill === lane && state.taskState[t.id]?.status === 'done') m += t.estMin || 0
  return m
}
