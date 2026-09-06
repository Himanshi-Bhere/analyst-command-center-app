import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, BellRing, X, ChevronRight, Play, Check, CalendarClock } from 'lucide-react'
import { useStore } from '../store/useStore'
import { buildNotifications, canNotify, requestNotifyPermission, showBrowserNotification } from '../engine/notify'
import { cn } from '../lib/utils'
import { addDays } from '../lib/dates'

const DOT = { urgent: 'bg-bad', warn: 'bg-warn', info: 'bg-accent', ok: 'bg-ok' }
const KIND_LABEL = { active: 'In progress', start: 'Start', next: 'Next', must: 'Must do', late: 'Late', open: 'Today', done: 'Done', overdue: 'Overdue', github: 'GitHub', showcase: 'Showcase', interview: 'Interview', followup: 'Follow-up', deadline: 'Deadline', project: 'Project', revision: 'Revision', weekly: 'Review', monthly: 'Review', streak: 'Streak' }

export default function NotificationCenter() {
  const state = useStore()
  const { dismissNotification, clearDismissed, setNotify, setTaskStatus, moveTask } = state
  const today = state.today()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const [tick, setTick] = useState(0)
  const ref = useRef(null)
  // re-evaluate every 5 minutes so time-of-day nudges (evening must-do, GitHub reminder) appear without a reload
  useEffect(() => { const i = setInterval(() => setTick((t) => t + 1), 5 * 60 * 1000); return () => clearInterval(i) }, [])
  useEffect(() => { if (!open) return; const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h) }, [open])

  const all = useMemo(() => buildNotifications(state, today), [state.taskState, state.taskOverrides, state.customTasks, state.applications, state.projects, state.revision, state.weekly, state.github, state.weeklyReviews, state.monthlyReviews, state.hoursLog, today, tick])
  const dismissed = state.notify?.dismissed || {}
  const items = all.filter((n) => !dismissed[n.id])
  const urgent = items.filter((n) => n.level === 'urgent').length
  const warn = items.filter((n) => n.level === 'warn').length

  // Browser notifications (opt-in): show each urgent/warn item once per day
  useEffect(() => {
    if (!state.notify?.browser || !canNotify() || Notification.permission !== 'granted') return
    const shown = { ...(state.notify.lastShown || {}) }
    let changed = false
    for (const n of items) { if (['urgent', 'warn'].includes(n.level) && !shown[n.id]) { if (showBrowserNotification(n)) { shown[n.id] = Date.now(); changed = true } } }
    if (changed) setNotify({ lastShown: Object.fromEntries(Object.entries(shown).filter(([k]) => k.startsWith(today) || k.startsWith(addDays(today, -1)))) })
  }, [items.map((i) => i.id).join('|'), state.notify?.browser])

  const enableBrowser = async () => { const p = await requestNotifyPermission(); setNotify({ browser: p === 'granted' }); if (p === 'granted') showBrowserNotification({ id: 'test', title: 'Notifications on', text: 'You will get a nudge for must-do tasks, overdue work, GitHub pushes and interviews.', to: '/' }) }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative text-soft hover:text-ink p-1.5" aria-label="Notifications">
        {urgent ? <BellRing size={18} className="text-bad" /> : <Bell size={18} />}
        {items.length > 0 && <span className={cn('absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full text-[9.5px] font-bold flex items-center justify-center text-white', urgent ? 'bg-bad' : warn ? 'bg-warn' : 'bg-accent')}>{items.length}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-9 w-[min(24rem,calc(100vw-1.5rem))] card z-50 animate-fadeIn overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-line">
            <div className="text-[13px] font-semibold">Notifications <span className="text-muted font-normal">· {items.length}</span></div>
            <div className="flex items-center gap-2">
              {Object.keys(dismissed).length > 0 && <button className="text-[11px] text-muted hover:text-ink" onClick={clearDismissed}>Show dismissed</button>}
              {canNotify() && !state.notify?.browser && <button className="text-[11px] text-accent-glow hover:underline" onClick={enableBrowser}>Enable browser alerts</button>}
              {state.notify?.browser && <span className="text-[11px] text-ok">Browser alerts on</span>}
            </div>
          </div>
          <div className="max-h-[70vh] overflow-y-auto p-1.5">
            {items.length === 0 && <div className="text-[12.5px] text-muted px-3 py-6 text-center">All clear — nothing pending right now.</div>}
            {items.map((n) => (
              <div key={n.id} className="group flex items-start gap-2.5 px-2.5 py-2 rounded-md hover:bg-raised/60">
                <span className={cn('mt-1.5 h-2 w-2 rounded-full shrink-0', DOT[n.level])} />
                <button onClick={() => { nav(n.to || '/'); setOpen(false) }} className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2"><span className="text-[10.5px] uppercase tracking-wide text-muted">{KIND_LABEL[n.kind] || n.kind}</span></div>
                  <div className="text-[13px] font-medium leading-snug text-ink">{n.title}</div>
                  <div className="text-[12px] text-muted leading-snug mt-0.5 line-clamp-2">{n.text}</div>
                  {n.task && (
                    <div className="flex gap-1.5 mt-1.5" onClick={(e) => e.stopPropagation()}>
                      <button className="btn-primary btn-xs" onClick={() => { setTaskStatus(n.task, 'active'); nav('/today'); setOpen(false) }}><Play size={10} />Start</button>
                      <button className="btn-ghost btn-xs" onClick={() => setTaskStatus(n.task, 'done')}><Check size={10} />Done</button>
                      <button className="btn-ghost btn-xs" onClick={() => moveTask(n.task, addDays(today, 1))}><CalendarClock size={10} />Tomorrow</button>
                    </div>
                  )}
                </button>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <button onClick={() => dismissNotification(n.id)} className="text-muted hover:text-ink opacity-0 group-hover:opacity-100 p-0.5" title="Dismiss for today"><X size={12} /></button>
                  <ChevronRight size={12} className="text-muted" />
                </div>
              </div>
            ))}
          </div>
          <div className="px-3.5 py-2 border-t border-line text-[11px] text-muted">Re-checked every 5 min · evening nudges for must-do tasks and GitHub pushes · dismissed items return tomorrow</div>
        </div>
      )}
    </div>
  )
}
