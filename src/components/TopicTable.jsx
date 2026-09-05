import React from 'react'
import { useStore } from '../store/useStore'
import { cn } from '../lib/utils'

export const STAGES = [
  { key: 'learn', label: 'Learn', hint: 'Watched / read the concept and wrote notes' },
  { key: 'practice', label: 'Practice', hint: '8+ guided problems typed by hand' },
  { key: 'build', label: 'Build', hint: 'Used it in a project or business problem' },
  { key: 'revise', label: 'Revise', hint: 'Revised after 3+ days without notes' },
  { key: 'ready', label: 'Interview Ready', hint: 'Can explain it out loud in 60 seconds' },
]

// Reference-style skill tree: one row per topic, five checkbox columns.
export default function TopicTable({ topics, groupBy, weekLabel = (w) => `W${w}`, className }) {
  const stages = useStore((s) => s.topicStages || {})
  const topicsDone = useStore((s) => s.topics || {})
  const setTopicStage = useStore((s) => s.setTopicStage)
  const groups = groupBy ? groupBy(topics) : [{ title: null, items: topics }]
  const doneCount = (k) => topics.filter((t) => (k === 'learn' ? topicsDone[t.id] : stages[t.id]?.[k])).length

  return (
    <div className={cn('card overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left border-b border-line bg-raised/40">
              <th className="label font-semibold px-4 py-2.5 whitespace-nowrap">Topic</th>
              <th className="label font-semibold px-3 py-2.5 whitespace-nowrap text-center">Week</th>
              {STAGES.map((s) => <th key={s.key} title={s.hint} className="label font-semibold px-3 py-2.5 text-center whitespace-nowrap">{s.label}<div className="num text-[10px] text-muted font-normal">{doneCount(s.key)}/{topics.length}</div></th>)}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <React.Fragment key={g.title || 'all'}>
                {g.title && <tr><td colSpan={2 + STAGES.length} className="px-4 pt-3 pb-1 text-[11.5px] font-semibold text-accent-glow uppercase tracking-wide">{g.title}</td></tr>}
                {g.items.map((t) => {
                  const st = stages[t.id] || {}
                  const ready = st.ready
                  const n = STAGES.filter((s) => (s.key === 'learn' ? topicsDone[t.id] : st[s.key])).length
                  return (
                    <tr key={t.id} className="border-t border-line/70 hover:bg-raised/30">
                      <td className="px-4 py-2">
                        <div className={cn('font-medium', ready ? 'text-ok' : n > 0 ? 'text-ink' : 'text-soft')}>{t.name}</div>
                        {n > 0 && !ready && <div className="mt-1 h-1 w-24 rounded-full bg-line overflow-hidden"><div className="h-full bg-accent" style={{ width: `${(n / STAGES.length) * 100}%` }} /></div>}
                      </td>
                      <td className="px-3 py-2 text-center num text-muted whitespace-nowrap">{t.week ? weekLabel(t.week) : '—'}</td>
                      {STAGES.map((s) => {
                        const v = s.key === 'learn' ? !!topicsDone[t.id] : !!st[s.key]
                        return <td key={s.key} className="px-3 py-2 text-center"><input type="checkbox" className="checkbox" checked={v} onChange={() => setTopicStage(t.id, s.key, !v)} aria-label={`${t.name} ${s.label}`} /></td>
                      })}
                    </tr>
                  )
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
