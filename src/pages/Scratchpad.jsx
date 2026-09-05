import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Trash2, Pin, PinOff, Search, Check } from 'lucide-react'
import { useStore } from '../store/useStore'
import { PageHeader, Card, Chip, Empty } from '../components/ui'
import { cn } from '../lib/utils'
import { fmtShort } from '../lib/dates'

// Random notes: no structure, no categories. Type and it saves. Optional #tags inside the text.
const tagsOf = (text) => [...new Set((text.match(/#[\w-]+/g) || []).map((t) => t.slice(1).toLowerCase()))]
const titleOf = (text) => (text.trim().split('\n')[0] || 'Untitled').replace(/^#+\s*/, '').slice(0, 80)

export default function ScratchpadPage() {
  const state = useStore()
  const { addScratch, updateScratch, removeScratch } = state
  const notes = state.scratch || []
  const [q, setQ] = useState('')
  const [tag, setTag] = useState(null)
  const [activeId, setActiveId] = useState(notes[0]?.id || null)
  const active = notes.find((n) => n.id === activeId) || null
  const allTags = useMemo(() => { const c = {}; notes.forEach((n) => tagsOf(n.text).forEach((t) => (c[t] = (c[t] || 0) + 1))); return Object.entries(c).sort((a, b) => b[1] - a[1]) }, [notes])
  const list = notes
    .filter((n) => (!q || n.text.toLowerCase().includes(q.toLowerCase())) && (!tag || tagsOf(n.text).includes(tag)))
    .sort((a, b) => (b.pinned - a.pinned) || (b.updatedAt - a.updatedAt))
  const create = () => { const id = addScratch({ text: '' }); setActiveId(id); setQ(''); setTag(null) }
  const remove = (n) => { if (n.text.trim() && !confirm('Delete this note?')) return; removeScratch(n.id); if (activeId === n.id) setActiveId(null) }
  return (
    <div>
      <PageHeader eyebrow="System" title="Scratchpad" subtitle="Random notes. No structure, no categories — just type. Use #tags anywhere in the text if you want to group them." right={<button className="btn-primary btn-xs" onClick={create}><Plus size={12} />New</button>} />
      <div className="grid lg:grid-cols-[320px_1fr] gap-4">
        <div className={cn('space-y-2', active && 'hidden lg:block')}>
          <div className="relative"><Search size={13} className="absolute left-2.5 top-2.5 text-muted" /><input className="input pl-8 py-1.5" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          {allTags.length > 0 && <div className="flex flex-wrap gap-1">{allTags.map(([t, c]) => <button key={t} onClick={() => setTag(tag === t ? null : t)} className={cn('chip', tag === t ? 'text-accent-glow border-accent/50 bg-accent/10' : 'text-muted border-line2 bg-raised hover:text-ink')}>#{t} <span className="opacity-60">{c}</span></button>)}</div>}
          <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
            {list.map((n) => (
              <button key={n.id} onClick={() => setActiveId(n.id)} className={cn('w-full text-left card p-3 transition-colors hover:border-line2', n.id === activeId && 'border-accent/60')}>
                <div className="flex items-start gap-2"><div className="min-w-0 flex-1"><div className="text-[13px] font-medium truncate">{titleOf(n.text)}</div><div className="text-[11.5px] text-muted truncate mt-0.5">{n.text.trim().split('\n').slice(1).join(' ').slice(0, 90) || <span className="italic">empty</span>}</div></div>{n.pinned && <Pin size={11} className="text-warn shrink-0 mt-1" />}</div>
                <div className="text-[10.5px] text-muted mt-1.5 num">{fmtShort(n.createdAt)}</div>
              </button>
            ))}
            {!list.length && <Empty text={notes.length ? 'No notes match.' : 'Nothing here yet.'} action={<button className="btn-primary btn-xs" onClick={create}><Plus size={12} />Write something</button>} />}
          </div>
        </div>
        <div>
          {active ? <Editor key={active.id} note={active} onChange={(text) => updateScratch(active.id, { text })} onPin={() => updateScratch(active.id, { pinned: !active.pinned })} onDelete={() => remove(active)} onBack={() => setActiveId(null)} />
            : <Card className="h-full min-h-[300px] flex items-center justify-center text-muted text-[13px]">Pick a note on the left, or <button className="text-accent-glow ml-1" onClick={create}>start a new one</button>.</Card>}
        </div>
      </div>
    </div>
  )
}

function Editor({ note, onChange, onPin, onDelete, onBack }) {
  const [text, setText] = useState(note.text)
  const [saved, setSaved] = useState(true)
  const ref = useRef(null)
  useEffect(() => { if (!note.text) ref.current?.focus() }, [])
  useEffect(() => { if (text === note.text) return; setSaved(false); const t = setTimeout(() => { onChange(text); setSaved(true) }, 400); return () => clearTimeout(t) }, [text])
  const tags = tagsOf(text)
  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-line bg-panel/60">
        <button className="lg:hidden btn-ghost btn-xs" onClick={onBack}>← All notes</button>
        <span className="text-[11.5px] text-muted num">{fmtShort(note.createdAt)}</span>
        <span className={cn('text-[11px] flex items-center gap-1', saved ? 'text-ok' : 'text-muted')}><Check size={11} />{saved ? 'Saved' : 'Saving…'}</span>
        <div className="ml-auto flex items-center gap-1">
          {tags.map((t) => <Chip key={t} className="text-accent-glow border-accent/40 bg-accent/10 hidden sm:inline-flex">#{t}</Chip>)}
          <button className="btn-ghost btn-xs" onClick={onPin} title={note.pinned ? 'Unpin' : 'Pin to top'}>{note.pinned ? <PinOff size={12} /> : <Pin size={12} />}</button>
          <button className="btn-ghost btn-xs text-muted hover:text-bad" onClick={onDelete}><Trash2 size={12} /></button>
        </div>
      </div>
      <textarea ref={ref} value={text} onChange={(e) => setText(e.target.value)} placeholder={'First line becomes the title.\n\nWrite anything — ideas, links, things to ask, a query that confused you… #sql #todo'} className="w-full min-h-[60vh] bg-transparent p-4 text-[14px] leading-relaxed text-ink placeholder:text-muted/60 focus:outline-none resize-y" spellCheck />
    </Card>
  )
}
