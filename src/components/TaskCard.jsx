import React, { useEffect, useRef, useState } from 'react'
import { MoreHorizontal, Play, Check, SkipForward, CalendarClock, RotateCcw, Trash2, Clock, ExternalLink as Ext, Info, MapPin } from 'lucide-react'
import { useStore } from '../store/useStore'
import { cn, hrs } from '../lib/utils'
import { addDays, fmtShort } from '../lib/dates'
import { SKILL_MAP } from '../data/skills'
import { whereFor } from '../engine/where'

// Reference anatomy: [checkbox] Title / one-line description / small chip row ........ [⋯]
// Everything else (why, start, skip, move, delete) lives behind the ⋯ menu.

const PRIORITY = { CRITICAL: 'text-bad border-bad/40 bg-bad/10', HIGH: 'text-bad border-bad/30 bg-bad/10', MEDIUM: 'text-warn border-warn/30 bg-warn/10', LOW: 'text-muted border-line2 bg-raised' }
const TYPE = { Learning: 'text-info border-info/30 bg-info/10', Practice: 'text-ok border-ok/30 bg-ok/10', Project: 'text-accent-glow border-accent/30 bg-accent/10', Revision: 'text-soft border-line2 bg-raised', Interview: 'text-warn border-warn/30 bg-warn/10' }

export default function TaskCard({ task, compact, showDate }) {
  const st = useStore((s) => s.taskState[task.id]?.status || 'open')
  const { setTaskStatus, moveTask, removeCustomTask, today } = useStore()
  const [menu, setMenu] = useState(false)
  const [why, setWhy] = useState(false)
  const [where, setWhere] = useState(false)
  const ref = useRef(null)
  const done = st === 'done'
  const active = st === 'active'
  const skipped = st === 'skipped' || st === 'dropped'
  const t = today()
  const overdue = task.date < t && !done && !skipped
  const generic = /^(scheduled by the weekly curriculum|primary lane this week)/i
  const desc = task.why && task.why !== task.reason ? task.why : task.hint || (task.reason && !generic.test(task.reason) ? task.reason : `${task.topic || ''}${task.topic ? ' · ' : ''}${SKILL_MAP[task.skill]?.name || task.skill}`)
  const res = task.resource

  useEffect(() => {
    if (!menu) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenu(false) }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [menu])

  const Item = ({ icon: I, children, onClick, danger }) => <button onClick={() => { onClick(); setMenu(false) }} className={cn('w-full flex items-center gap-2 px-2.5 py-1.5 text-[12.5px] rounded-md text-left hover:bg-raised', danger ? 'text-bad' : 'text-soft hover:text-ink')}><I size={13} />{children}</button>

  return (
    <div className={cn('card px-4 py-3 transition-colors', active && 'border-accent/60', (done || skipped) && 'opacity-55', menu && 'relative z-40')}>
      <div className="flex items-start gap-3">
        <input type="checkbox" className="checkbox mt-[3px]" checked={done} onChange={() => setTaskStatus(task, done ? 'open' : 'done')} aria-label="Mark complete" />
        <div className="min-w-0 flex-1">
          <div className={cn('text-[13.5px] font-medium leading-snug', done && 'line-through text-muted')}>{task.title}</div>
          {!compact && desc && <div className="text-[12px] text-muted mt-0.5 leading-snug line-clamp-2">{desc}</div>}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-[11px] text-muted">
            <span className="inline-flex items-center gap-1"><Clock size={11} />{hrs(task.estMin || 30)}</span>
            {task.priority && <span className={cn('chip', PRIORITY[task.priority])}>{task.priority[0] + task.priority.slice(1).toLowerCase()}</span>}
            {task.type && <span className={cn('chip', TYPE[task.type] || TYPE.Revision)}>{task.type}</span>}
            {task.difficulty && <span>{task.difficulty}</span>}
            {res?.name && (res.url ? <a href={res.url.startsWith('/') ? '#' + res.url : res.url} target={res.url.startsWith('/') ? undefined : '_blank'} rel="noreferrer" className="inline-flex items-center gap-1 text-info hover:underline"><span className="h-1.5 w-1.5 rounded-sm bg-info inline-block" />{res.name}</a> : <span>{res.name}</span>)}
            {showDate && <span>· {fmtShort(task.date)}</span>}
            {task.movedFrom && <span className="text-warn">moved from {fmtShort(task.movedFrom)}</span>}
            {task.showcase && <a href={`#/showcase/${task.showcase}`} className="text-accent-glow hover:underline">Showcase brief</a>}
            {!done && !skipped && <button onClick={() => setWhere(!where)} className={cn('inline-flex items-center gap-0.5 hover:text-ink', where && 'text-ink')}><MapPin size={10} />Where?</button>}
            {overdue && <span className="text-bad font-semibold">Overdue</span>}
            {active && <span className="text-accent-glow font-medium">In progress</span>}
          </div>
          {why && <div className="mt-2 text-[12px] text-soft bg-raised/60 border border-line rounded-md px-3 py-2 space-y-0.5">
            {task.reason && <div><span className="text-muted">Why now: </span>{task.reason}</div>}
            {task.why && task.why !== task.reason && <div><span className="text-muted">Purpose: </span>{task.why}</div>}
            <div><span className="text-muted">Topic: </span>{task.topic} · <span className="text-muted">Builds: </span>{SKILL_MAP[task.skill]?.name || task.skill}</div>
          </div>}
          {where && <WherePanel task={task} />}
        </div>
        <div className="relative shrink-0" ref={ref}>
          <button onClick={() => setMenu(!menu)} className="text-muted hover:text-ink p-1 rounded-md hover:bg-raised" aria-label="Task actions"><MoreHorizontal size={16} /></button>
          {menu && (
            <div className="absolute right-0 top-7 w-48 card p-1 z-50 shadow-xl animate-fadeIn">
              {!done && !active && <Item icon={Play} onClick={() => setTaskStatus(task, 'active')}>Start now</Item>}
              {active && <Item icon={RotateCcw} onClick={() => setTaskStatus(task, 'open')}>Pause</Item>}
              {!done && <Item icon={Check} onClick={() => setTaskStatus(task, 'done')}>Mark complete</Item>}
              {done && <Item icon={RotateCcw} onClick={() => setTaskStatus(task, 'open')}>Undo complete</Item>}
              {!done && !skipped && <Item icon={SkipForward} onClick={() => setTaskStatus(task, 'skipped')}>Skip</Item>}
              {skipped && <Item icon={RotateCcw} onClick={() => setTaskStatus(task, 'open')}>Restore</Item>}
              {!done && <Item icon={CalendarClock} onClick={() => moveTask(task, addDays(t, 1))}>Move to tomorrow</Item>}
              <Item icon={Info} onClick={() => setWhy(!why)}>{why ? 'Hide details' : 'Why this task?'}</Item>
              <Item icon={MapPin} onClick={() => setWhere(!where)}>{where ? 'Hide where' : 'Where to solve / push?'}</Item>
              {res?.url && !res.url.startsWith('/') && <Item icon={Ext} onClick={() => window.open(res.url, '_blank')}>Open resource</Item>}
              {task.source === 'custom' && <Item icon={Trash2} danger onClick={() => removeCustomTask(task.id)}>Delete</Item>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function WherePanel({ task }) {
  const w = whereFor(task)
  const link = (x) => (x.url.startsWith('/') ? <a key={x.url} href={'#' + x.url} className="text-accent-glow hover:underline">{x.name}</a> : <a key={x.url} href={x.url} target="_blank" rel="noreferrer" className="text-accent-glow hover:underline inline-flex items-center gap-0.5">{x.name}<Ext size={10} /></a>)
  return (
    <div className="mt-2 text-[12px] bg-raised/60 border border-line rounded-md px-3 py-2 grid sm:grid-cols-2 gap-x-4 gap-y-2">
      <div>
        <div className="label mb-1">Where to solve</div>
        <div className="flex flex-col gap-0.5">{w.solve.map(link)}</div>
        {w.tool && <div className="text-muted mt-1">Tool: <span className="text-soft">{w.tool}</span></div>}
      </div>
      <div>
        <div className="label mb-1">Where it goes on GitHub</div>
        {w.push.push === 'no' ? <div className="text-muted">Skip — {w.push.how}</div> : (
          <div className="space-y-0.5">
            <div><span className={w.push.push === 'yes' ? 'text-ok' : 'text-warn'}>{w.push.push === 'yes' ? 'Push' : 'Optional'}</span> → <span className="font-mono text-soft">{w.push.repo}</span></div>
            {w.push.file && <div className="font-mono text-[11px] text-soft break-all">{w.push.file}</div>}
            <div className="text-muted">{w.push.how}</div>
            {w.push.commit && <div className="font-mono text-[11px] text-muted break-all">git commit -m "{w.push.commit}"</div>}
          </div>
        )}
      </div>
    </div>
  )
}
