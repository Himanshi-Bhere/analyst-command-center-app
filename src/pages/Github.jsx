import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Github, Check, Copy, ExternalLink as Ext, ChevronDown, ChevronRight, Terminal, GitCommit, FolderTree, HelpCircle } from 'lucide-react'
import { useStore } from '../store/useStore'
import { PageHeader, Card, H2, Label, Bar, Checkbox, Tabs } from '../components/ui'
import { githubPlan, githubStreak, showcaseSummary } from '../engine/github'
import { LEARNING_LOG_REPO, WEEKLY_SHOWCASE } from '../data/weekly'
import { GITHUB_REPOS } from '../data/projects'
import { fmtLong, addDays } from '../lib/dates'
import { whereFor } from '../engine/where'
import { cn, hrs } from '../lib/utils'

const PUSH_STYLE = { yes: 'text-ok border-ok/30 bg-ok/10', optional: 'text-warn border-warn/30 bg-warn/10', no: 'text-muted border-line2 bg-raised' }
const PUSH_LABEL = { yes: 'Push', optional: 'Optional', no: 'Skip' }

function Code({ children, copy }) {
  const [c, setC] = useState(false)
  return (
    <div className="relative group">
      <pre className="bg-base border border-line rounded-md px-3 py-2.5 text-[12px] font-mono text-soft overflow-x-auto whitespace-pre">{children}</pre>
      <button onClick={() => { navigator.clipboard?.writeText(copy ?? children); setC(true); setTimeout(() => setC(false), 1200) }} className="absolute top-1.5 right-1.5 btn-ghost btn-xs opacity-0 group-hover:opacity-100">{c ? <Check size={11} /> : <Copy size={11} />}{c ? 'Copied' : 'Copy'}</button>
    </div>
  )
}

export default function GithubPage() {
  const state = useStore()
  const { togglePushed, setGithub, setRepo, toggleRepoItem } = state
  const today = state.today()
  const [offset, setOffset] = useState(0)
  const date = addDays(today, offset)
  const [tab, setTab] = useState('Today')
  const plan = useMemo(() => githubPlan(state, date), [state.taskState, state.taskOverrides, state.customTasks, state.weekly, state.github, date])
  const streak = useMemo(() => githubStreak(state, today), [state.github, today])
  const sc = useMemo(() => showcaseSummary(state), [state.weekly])
  const user = state.github?.username || ''
  const logUrl = state.github?.logRepoUrl || (user ? `https://github.com/${user}/${LEARNING_LOG_REPO.name}` : '')

  return (
    <div className="max-w-[1200px]">
      <PageHeader eyebrow="Build" title="GitHub Center" subtitle="What to push today, where it goes, and how — so your GitHub shows output, not activity." right={
        <div className="flex items-center gap-2">
          <input className="input w-44 py-1 text-[12.5px]" value={user} onChange={(e) => setGithub({ username: e.target.value.trim() })} placeholder="GitHub username" />
          {user && <a href={`https://github.com/${user}`} target="_blank" rel="noreferrer" className="btn-ghost btn-xs"><Github size={12} />Profile</a>}
        </div>
      } />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="card px-4 py-3"><Label>Push today</Label><div className="num text-[17px] font-semibold mt-0.5">{plan.pushedCount} / {plan.must.length}</div><div className="text-[11px] text-muted">{plan.optional.length} optional</div></div>
        <div className="card px-4 py-3"><Label>Push streak</Label><div className="num text-[17px] font-semibold mt-0.5">{streak.current} days</div><div className="text-[11px] text-muted">{streak.thisWeek} / 7 this week</div></div>
        <div className="card px-4 py-3"><Label>Showcase repos</Label><div className="num text-[17px] font-semibold mt-0.5">{sc.pushed} / {sc.total}</div><div className="text-[11px] text-muted">{sc.shipped} with README</div></div>
        <div className="card px-4 py-3"><Label>Active days</Label><div className="num text-[17px] font-semibold mt-0.5">{streak.activeDays}</div><div className="text-[11px] text-muted">days with a logged push</div></div>
      </div>

      <Tabs tabs={['Today', 'How to push', 'Repos']} value={tab} onChange={setTab} className="mb-3" />

      {tab === 'Today' && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <H2>What to push — {fmtLong(date)}</H2>
              <div className="flex items-center gap-1"><button className="btn-ghost btn-xs" onClick={() => setOffset(offset - 1)}>‹</button><button className="btn-ghost btn-xs" onClick={() => setOffset(0)}>Today</button><button className="btn-ghost btn-xs" onClick={() => setOffset(offset + 1)}>›</button></div>
            </div>
            {plan.items.length === 0 && <Card className="text-center text-muted text-[13px] py-8">Nothing to push on this day — learning, aptitude and revision are activity, not artefacts.</Card>}
            {plan.items.map((it) => <PushRow key={it.id} it={it} date={date} onToggle={() => togglePushed(date, it.id)} />)}
          </div>
          <div className="space-y-4">
            <Card>
              <div className="flex items-center gap-2 mb-2"><HelpCircle size={14} className="text-accent-glow" /><H2>Is it necessary to push what I learn?</H2></div>
              <div className="text-[12.5px] text-soft space-y-2 leading-relaxed">
                <p><span className="text-ink font-medium">Short answer: push output, not learning.</span> Nobody hires you for having watched a tutorial. They look for proof you can produce: working SQL, a clean workbook, a dashboard, a notebook, a README that explains a decision.</p>
                <p><span className="text-ok font-medium">Always push:</span> practice queries, Excel/Power BI artefacts, notebooks, every Weekly Showcase, flagship project work.</p>
                <p><span className="text-warn font-medium">Optional:</span> concept notes in your own words, your interview answer skeletons, metric cards.</p>
                <p><span className="text-muted font-medium">Never bother:</span> course notes copied from a video, aptitude, revision logs, certificates screenshots.</p>
                <p>Rule of thumb: <span className="text-ink">one learning-log repo</span> for daily practice + <span className="text-ink">one repo per Showcase / project</span>. Recruiters open pinned repos and READMEs — that is where the effort goes.</p>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-2 mb-2"><FolderTree size={14} className="text-accent-glow" /><H2>Learning-log repo layout</H2></div>
              <div className="flex items-center gap-2 mb-2"><input className="input py-1 text-[12px]" value={state.github?.logRepoUrl || ''} onChange={(e) => setGithub({ logRepoUrl: e.target.value })} placeholder={logUrl || 'https://github.com/you/analytics-learning-log'} />{logUrl && <a href={logUrl} target="_blank" rel="noreferrer" className="btn-ghost btn-xs"><Ext size={11} /></a>}</div>
              <div className="font-mono text-[11.5px] text-soft space-y-1">{LEARNING_LOG_REPO.tree.map((l) => <div key={l} className="flex gap-2"><span className="text-muted">{l.split('  ←')[0]}</span><span className="text-muted/70 truncate">← {l.split('  ←')[1]}</span></div>)}</div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'How to push' && <HowTo user={user} />}

      {tab === 'Repos' && (
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-line flex items-center justify-between"><H2>Weekly Showcase repos</H2><Link to="/showcase" className="text-[12px] text-accent-glow hover:underline">Open Showcase tracker</Link></div>
            <table className="w-full text-[13px]"><thead><tr className="text-left border-b border-line bg-raised/40"><th className="label font-semibold px-4 py-2.5">Week</th><th className="label font-semibold px-3 py-2.5">Repo</th><th className="label font-semibold px-3 py-2.5 text-center">Pushed</th><th className="label font-semibold px-3 py-2.5 text-center">README</th><th className="label font-semibold px-3 py-2.5">URL</th></tr></thead>
              <tbody>{WEEKLY_SHOWCASE.map((s) => { const w = state.weekly[s.id] || { stages: {} }; return (
                <tr key={s.id} className="border-t border-line/70"><td className="px-4 py-2 num">W{s.week}</td><td className="px-3 py-2 font-mono text-[12px]"><Link to={`/showcase/${s.id}`} className="hover:text-accent-glow">{s.repo}</Link></td><td className="px-3 py-2 text-center"><input type="checkbox" className="checkbox" checked={!!w.stages?.pushed} onChange={() => state.toggleShowcaseStage(s.id, 'pushed')} /></td><td className="px-3 py-2 text-center"><input type="checkbox" className="checkbox" checked={!!w.stages?.readme} onChange={() => state.toggleShowcaseStage(s.id, 'readme')} /></td><td className="px-3 py-2"><input className="input py-1 text-[12px]" value={w.url || ''} onChange={(e) => state.setShowcase(s.id, { url: e.target.value })} placeholder={user ? `https://github.com/${user}/${s.repo}` : 'https://github.com/…'} /></td></tr>
              ) })}</tbody></table>
          </div>
          <div>
            <H2 className="mb-2">Flagship & portfolio repos</H2>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {GITHUB_REPOS.map((r) => { const s = state.repos[r.id] || { checklist: {} }; const done = r.checklist.filter((c) => s.checklist?.[c]).length; return (
                <Card key={r.id}>
                  <div className="flex items-center justify-between"><div className="font-mono text-[13px] font-semibold">{r.name}</div><span className="num text-[11px] text-muted">{done}/{r.checklist.length}</span></div>
                  <div className="text-[12px] text-muted mt-0.5">{r.desc}</div>
                  <input className="input mt-2 text-[12px]" placeholder="https://github.com/you/repo" value={s.url || ''} onChange={(e) => setRepo(r.id, { url: e.target.value })} />
                  <div className="grid grid-cols-2 gap-1 mt-2">{r.checklist.map((c) => <Checkbox key={c} label={c} checked={s.checklist?.[c]} onChange={() => toggleRepoItem(r.id, c)} />)}</div>
                  <Bar value={Math.round((done / r.checklist.length) * 100)} className="mt-3" />
                </Card>
              ) })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PushRow({ it, onToggle }) {
  const [open, setOpen] = useState(false)
  const a = it.advice
  const title = it.kind === 'task' ? it.task.title : it.title
  return (
    <div className={cn('card px-4 py-3', it.pushed && 'opacity-60')}>
      <div className="flex items-start gap-3">
        <input type="checkbox" className="checkbox mt-[3px]" checked={it.pushed} onChange={onToggle} aria-label="Mark pushed" />
        <div className="flex-1 min-w-0">
          <div className={cn('text-[13.5px] font-medium leading-snug', it.pushed && 'line-through text-muted')}>{title}</div>
          <div className="text-[12px] text-muted mt-0.5">{a.what} → <span className="font-mono text-soft">{a.repo}{a.path !== '/' && a.path !== '—' ? '/' + a.path.replace(/^\//, '') : ''}</span></div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-[11px] text-muted">
            <span className={cn('chip', PUSH_STYLE[a.push])}>{PUSH_LABEL[a.push]}</span>
            {it.kind === 'task' && <span className={it.done ? 'text-ok' : 'text-warn'}>{it.done ? 'task done' : 'task not finished yet'}</span>}
            {it.kind === 'showcase' && <Link to={`/showcase/${it.showcase.id}`} className="text-accent-glow hover:underline">showcase brief</Link>}
            <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-0.5 hover:text-ink">{open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}how</button>
          </div>
          {open && (
            <div className="mt-2 space-y-2">
              {it.kind === 'task' && (() => { const w = whereFor(it.task); return (
                <div className="text-[12px] grid sm:grid-cols-2 gap-x-4 gap-y-1">
                  <div><div className="label mb-0.5">Solve it here</div>{w.solve.map((x) => x.url.startsWith('/') ? <a key={x.url} href={'#' + x.url} className="block text-accent-glow hover:underline">{x.name}</a> : <a key={x.url} href={x.url} target="_blank" rel="noreferrer" className="block text-accent-glow hover:underline">{x.name} ↗</a>)}</div>
                  <div><div className="label mb-0.5">Save as</div><div className="font-mono text-[11px] text-soft break-all">{w.push.file}</div></div>
                </div>
              ) })()}
              <div className="text-[12px] text-soft">{a.how}</div>
              {a.commit && <Code copy={`git add .\ngit commit -m "${a.commit}"\ngit push`}>{`git add .\ngit commit -m "${a.commit}"\ngit push`}</Code>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function HowTo({ user }) {
  const u = user || 'YOUR-USERNAME'
  const [open, setOpen] = useState('first')
  const S = ({ id, title, children }) => (
    <div className="border border-line rounded-lg overflow-hidden">
      <button onClick={() => setOpen(open === id ? null : id)} className="w-full flex items-center justify-between px-4 py-2.5 bg-raised/40 hover:bg-raised text-left"><span className="text-[13px] font-medium">{title}</span><span className="text-muted text-[11px]">{open === id ? '−' : '+'}</span></button>
      {open === id && <div className="p-4 space-y-3 text-[12.5px] text-soft">{children}</div>}
    </div>
  )
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-3">
        <S id="first" title="1 · One-time setup (5 minutes, Windows + VS Code)">
          <p>Install Git from git-scm.com (defaults are fine). Open a terminal in VS Code (Ctrl + `) and tell Git who you are:</p>
          <Code>{`git config --global user.name "Himanshi Bhere"\ngit config --global user.email "your-github-email@example.com"`}</Code>
          <p>On GitHub → profile photo → <b>Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate</b> (scope: <span className="font-mono">repo</span>). Windows will ask for it once as the password on your first push and remember it.</p>
        </S>
        <S id="new" title="2 · Create a repo and push the first time (the learning log)">
          <p>On GitHub: <b>New repository</b> → name <span className="font-mono">{LEARNING_LOG_REPO.name}</span> → Public → <b>do not</b> tick "Add README" → Create. Then on your PC:</p>
          <Code>{`mkdir ${LEARNING_LOG_REPO.name}\ncd ${LEARNING_LOG_REPO.name}\ngit init\nmkdir sql excel powerbi python statistics interview\necho "# Analytics learning log" > README.md\ngit add .\ngit commit -m "chore: initial structure"\ngit branch -M main\ngit remote add origin https://github.com/${u}/${LEARNING_LOG_REPO.name}.git\ngit push -u origin main`}</Code>
          <p>Refresh GitHub — your folders are live. Every Weekly Showcase gets its own repo the same way (change the name).</p>
        </S>
        <S id="daily" title="3 · The daily push (30 seconds, after each practice session)">
          <p>Save your files into the right folder (e.g. <span className="font-mono">sql/w01/03_orders_by_state.sql</span>), then:</p>
          <Code>{`git add .\ngit commit -m "sql(w01): where filtering — 8 problems"\ngit push`}</Code>
          <p>Commit message pattern: <span className="font-mono">area(week): what — how much</span>. Small, frequent commits look like real work because they are.</p>
        </S>
        <S id="sqlfile" title="4 · What a pushed SQL file should look like">
          <Code>{`-- Source: DataLemur — "Histogram of Tweets"\n-- Question: bucket users by tweets per user in 2022\n-- Approach: CTE counts tweets per user, outer query groups by that count\nWITH per_user AS (\n  SELECT user_id, COUNT(*) AS tweets\n  FROM tweets\n  WHERE tweet_date BETWEEN '2022-01-01' AND '2022-12-31'\n  GROUP BY user_id\n)\nSELECT tweets AS tweet_bucket, COUNT(*) AS users_num\nFROM per_user\nGROUP BY tweets\nORDER BY tweets;`}</Code>
          <p>Three comment lines turn a snippet into evidence a reviewer can read in 10 seconds.</p>
        </S>
        <S id="readme" title="5 · Executive README template (copy into every Showcase repo)">
          <Code>{`# ${'{Project title}'}\n\n![dashboard](screenshots/overview.png)\n\n## Business problem\nOne paragraph: who asked, what decision depends on it.\n\n## Data\nSource · rows · grain · known quality issues.\n\n## Approach\n3–5 bullets: SQL → model → dashboard / notebook. Link the files.\n\n## 3 findings\n1. Number + so-what\n2. Number + so-what\n3. Number + so-what\n\n## Recommendation\nWhat to do Monday morning, and what it is worth.\n\n## How to run\nTools, versions, one command.`}</Code>
        </S>
        <S id="fix" title="6 · When something goes wrong">
          <Code>{`git status                 # what changed / what is staged\ngit pull --rebase          # remote has commits you don't (edited README on GitHub)\ngit restore <file>         # undo local edits to a file\ngit rm --cached <file>     # pushed something by mistake (then commit + push)\n# file > 100 MB (.pbix / big CSV): don't push it — add to .gitignore, push screenshots + a sample`}</Code>
          <p>Add a <span className="font-mono">.gitignore</span> with <span className="font-mono">*.csv</span> over 50 MB, <span className="font-mono">.ipynb_checkpoints/</span>, <span className="font-mono">~$*.xlsx</span>.</p>
        </S>
      </div>
      <div className="space-y-4">
        <Card>
          <div className="flex items-center gap-2 mb-2"><GitCommit size={14} className="text-accent-glow" /><H2>Commit message patterns</H2></div>
          <div className="font-mono text-[11.5px] text-soft space-y-1.5">
            <div>sql(w04): window functions — 6 problems</div><div>excel(w02): category pivot + sparklines</div><div>pbi(w08): YoY measures + drill-through</div><div>py(w09): ab_test.py + readout notebook</div><div>feat: checkout funnel — funnel CTE + rolling conv</div><div>docs: executive README + screenshots</div><div>fix: null handling in repeat-customer flag</div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-2"><Terminal size={14} className="text-accent-glow" /><H2>Weekly GitHub hygiene (Sunday, 15 min)</H2></div>
          <ul className="text-[12.5px] text-soft space-y-1.5 list-disc pl-4"><li>Add the week's row to the learning-log README table.</li><li>Pin the best 6 repos (Profile → Customize pins).</li><li>Every repo has a description + 3 topics (sql, power-bi, retail-analytics…).</li><li>Screenshots folder in every Showcase.</li><li>Profile README: 3 lines + links to portfolio, LinkedIn, live dashboards.</li></ul>
        </Card>
      </div>
    </div>
  )
}
