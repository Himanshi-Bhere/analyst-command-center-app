import React, { useState } from 'react'
import { Play, Check, SkipForward, CalendarClock, RotateCcw, ExternalLink as Ext, Trash2, Lightbulb } from 'lucide-react'
import { useStore } from '../store/useStore'
import { cn, hrs } from '../lib/utils'
import { PriorityChip, SkillChip, TypeChip, Chip } from './ui'
import { addDays, fmtShort } from '../lib/dates'
import { SKILL_MAP } from '../data/skills'

export default function TaskCard({ task, compact, showDate }) {
  const st = useStore((s) => s.taskState[task.id]?.status || 'open')
  const { setTaskStatus, moveTask, removeCustomTask, today } = useStore()
  const [open, setOpen] = useState(false)
  const done = st === 'done'
  const active = st === 'active'
  const skipped = st === 'skipped' || st === 'dropped'
  const t = today()

  return (
    <div className={cn('card p-3 transition-colors', active && 'border-accent/60 shadow-glow', done && 'opacity-60', skipped && 'opacity-50')}>
      <div className="flex items-start gap-3">
        <input type="checkbox" className="checkbox mt-1" checked={done} onChange={() => setTaskStatus(task, done ? 'open' : 'done')} aria-label="Mark complete" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            {task.priority && <PriorityChip p={task.priority} />}
            <SkillChip skill={task.skill} />
            <TypeChip type={task.type} />
            {task.difficulty && <Chip className="text-muted border-line2 bg-raised">{task.difficulty}</Chip>}
            <span className="num text-[11px] text-muted">{hrs(task.estMin || 30)}</span>
            {showDate && <span className="text-[11px] text-muted">· {fmtShort(task.date)}</span>}
            {task.movedFrom && <span className="text-[10.5px] text-warn">moved from {fmtShort(task.movedFrom)}</span>}
            {task.date < t && !done && <span className="text-[10.5px] text-bad font-semibold">OVERDUE</span>}
          </div>
          <button onClick={() => setOpen(!open)} className={cn('text-left text-[13.5px] font-medium leading-snug hover:text-accent-glow', done && 'line-through text-muted')}>{task.title}</button>
          {!open && task.reason && !compact && <div className="text-[11.5px] text-muted mt-0.5 flex items-baseline gap-1 min-w-0"><span className="truncate min-w-0"><span className="text-warn">Why now:</span> {task.reason}</span><button onClick={() => setOpen(true)} className="text-accent-glow shrink-0">more</button></div>}
          {!compact && (
            <div className="mt-1 text-[12px] text-muted flex flex-wrap gap-x-3 gap-y-0.5">
              <span>Topic: <span className="text-soft">{task.topic}</span></span>
              {task.resource?.name && <span>Resource: {task.resource.url ? <a href={task.resource.url.startsWith('/') ? '#' + task.resource.url : task.resource.url} target={task.resource.url.startsWith('/') ? undefined : '_blank'} rel="noreferrer" className="text-accent-glow hover:underline inline-flex items-center gap-0.5">{task.resource.name}<Ext size={10} /></a> : <span className="text-soft">{task.resource.name}</span>}</span>}
              <span>Due: <span className="text-soft">{task.date === t ? 'Today' : fmtShort(task.date)}</span></span>
            </div>
          )}
          {open && (task.reason || task.why || task.hint) && (
            <div className="mt-1.5 text-[12px] text-soft/90 bg-raised/60 border border-line rounded-md px-2.5 py-1.5 flex gap-2">
              <Lightbulb size={13} className="text-warn shrink-0 mt-0.5" />
              <div>
                {task.reason && <div><span className="text-muted">Why now:</span> {task.reason}</div>}
                {task.why && task.why !== task.reason && <div><span className="text-muted">Purpose:</span> {task.why}</div>}
                {task.hint && <div><span className="text-muted">Hint:</span> {task.hint}</div>}
                <div className="text-muted mt-0.5">Contributes to: {SKILL_MAP[task.skill]?.name || task.skill} readiness · Sequence: Learn → Practice → Apply → Explain → Test → Revise</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2 pl-7">
        {!done && !active && <button className="btn-primary btn-xs" onClick={() => setTaskStatus(task, 'active')}><Play size={11} />Start</button>}
        {active && <button className="btn-subtle btn-xs" onClick={() => setTaskStatus(task, 'open')}><RotateCcw size={11} />Pause</button>}
        {!done && <button className="btn-ghost btn-xs" onClick={() => setTaskStatus(task, 'done')}><Check size={11} />Mark Complete</button>}
        {done && <button className="btn-ghost btn-xs" onClick={() => setTaskStatus(task, 'open')}><RotateCcw size={11} />Undo</button>}
        {!done && !skipped && <button className="btn-ghost btn-xs" onClick={() => setTaskStatus(task, 'skipped')}><SkipForward size={11} />Skip</button>}
        {skipped && <button className="btn-ghost btn-xs" onClick={() => setTaskStatus(task, 'open')}><RotateCcw size={11} />Restore</button>}
        {!done && <button className="btn-ghost btn-xs" onClick={() => moveTask(task, addDays(t, 1))}><CalendarClock size={11} />Move to Tomorrow</button>}
        {task.source === 'custom' && <button className="btn-ghost btn-xs text-bad" onClick={() => removeCustomTask(task.id)}><Trash2 size={11} /></button>}
      </div>
    </div>
  )
}
