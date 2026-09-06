import { tasksForDate, isDone, programDayIndex, getWeekForDate, programWeekStart } from './tasks'
import { SHOWCASE_BY_WEEK, LEARNING_LOG_REPO } from '../data/weekly'
import { addDays } from '../lib/dates'

/**
 * GitHub coach: decides, per task, whether the work should be pushed, where it goes and how.
 * Rules (recruiter-value first):
 *  - Practice output (SQL files, Excel workbooks, DAX, notebooks) → YES, it is evidence.
 *  - Project / showcase work → YES, its own repo.
 *  - Interview answers → OPTIONAL (my-answers.md is useful for you, mildly useful to recruiters).
 *  - Learning (watching/reading) → NO. Push a 10-line concept note only if you wrote it yourself.
 *  - Revision, aptitude, weekly review → NO. GitHub is for artefacts, not activity.
 */
export function pushAdvice(task) {
  const w = `w${String(task.weekN || getWeekForDate(task.date).n).padStart(2, '0')}`
  const log = LEARNING_LOG_REPO.name
  const s = task.skill
  if (task.type === 'Project' || s === 'project') {
    const sc = SHOWCASE_BY_WEEK[task.weekN]
    if (task.showcase && sc) return { push: 'yes', repo: sc.repo, path: '/', what: 'The whole deliverable set', how: 'Own repository. Push after every working session — small commits beat one big dump.', commit: `feat: ${sc.title.toLowerCase()} — ${task.showcaseStage || 'progress'}` }
    return { push: 'yes', repo: 'flagship project repo', path: 'sql/ · notebooks/ · dashboard/', what: 'Queries, notebook, .pbix screenshots, README progress', how: 'Commit the artefact you produced today, then tick the matching project stage.', commit: `feat: ${(task.topic || 'project work').toLowerCase()}` }
  }
  if (s === 'sql' && task.type === 'Practice') return { push: 'yes', repo: log, path: `sql/${w}/`, what: 'One .sql file per problem', how: 'Header comment: source + question + approach in one line. Only working queries.', commit: `sql(${w}): ${(task.topic || 'practice').toLowerCase()} — ${task.title.match(/\d+/)?.[0] || 'n'} problems` }
  if (s === 'excel' && task.type !== 'Learning') return { push: 'yes', repo: log, path: `excel/${w}/`, what: 'The workbook + one screenshot', how: 'Name the sheet tabs clearly; add a 3-line "what this shows" cell at the top.', commit: `excel(${w}): ${(task.topic || 'workbook').toLowerCase()}` }
  if (s === 'powerbi' && task.type !== 'Learning') return { push: 'yes', repo: log, path: `powerbi/${w}/`, what: '.pbix (if < 100 MB) + screenshots/ + measures.md', how: 'Never rely on the .pbix alone — recruiters cannot open it. Screenshots + measures list carry the value.', commit: `pbi(${w}): ${(task.topic || 'dashboard').toLowerCase()}` }
  if (s === 'python' && task.type !== 'Learning') return { push: 'yes', repo: log, path: `python/${w}/`, what: 'Notebook or script (outputs cleared unless they are the point)', how: 'Add a 2-line docstring: what it does, how to run.', commit: `py(${w}): ${(task.topic || 'analysis').toLowerCase()}` }
  if (s === 'statistics' && task.type !== 'Learning') return { push: 'optional', repo: log, path: `statistics/`, what: 'One .md per concept: meaning · formula · business example', how: 'Only if written in your own words — copied definitions are worth nothing.', commit: `stats: ${(task.topic || 'concept').toLowerCase()} note` }
  if (task.type === 'Interview' || s === 'interview') return { push: 'optional', repo: log, path: `interview/my-answers.md`, what: 'Your answer skeletons (not the reference answers)', how: 'Append 3–5 answers per session. Useful for revision; keep it private if you prefer.', commit: `interview: ${(task.topic || 'answers').toLowerCase()}` }
  if (['retail', 'bfsi', 'commercial', 'business'].includes(s)) return { push: 'optional', repo: log, path: `notes/metrics/`, what: 'Metric cards (definition, SQL, interpretation)', how: 'Good for you; low recruiter value. 15 minutes max.', commit: `notes: ${(task.topic || 'metrics').toLowerCase()}` }
  if (s === 'dsa') return { push: 'optional', repo: log, path: `python/dsa-lite/`, what: 'Solutions only if clean', how: 'Low priority. Never spend project time here.', commit: `dsa: ${(task.topic || 'practice').toLowerCase()}` }
  if (task.type === 'Learning') return { push: 'no', repo: '—', path: '—', what: 'Nothing — watching/reading is not an artefact', how: 'Push the practice that follows it instead. A 10-line concept note in your own words is the only exception.' }
  return { push: 'no', repo: '—', path: '—', what: 'Nothing', how: 'Aptitude, revision and reviews are activity, not artefacts. GitHub should show output.' }
}

/** Items you should push today (or tonight), derived from today's tasks + the week's showcase + weekly log. */
export function githubPlan(state, date) {
  const tasks = tasksForDate(date, state)
  const d = programDayIndex(date)
  const week = getWeekForDate(date)
  const sc = SHOWCASE_BY_WEEK[week.n]
  const pushed = state.github?.pushLog?.[date] || {}
  const items = []
  for (const t of tasks) {
    const a = pushAdvice(t)
    if (a.push === 'no') continue
    items.push({ id: t.id, kind: 'task', task: t, done: isDone(t, state), advice: a, pushed: !!pushed[t.id] })
  }
  if (sc && d >= 5) {
    const st = state.weekly?.[sc.id]?.stages || {}
    if (!st.pushed) items.push({ id: `sc-${sc.id}`, kind: 'showcase', title: `Push showcase repo: ${sc.repo}`, advice: { push: 'yes', repo: sc.repo, path: '/', what: sc.deliverables.length + ' deliverables + README', how: 'Public repo. Even 60% done is worth pushing — finish in the README what is missing.', commit: `feat: ${sc.title.toLowerCase()} — initial deliverables` }, pushed: !!pushed[`sc-${sc.id}`], showcase: sc })
    else if (!st.readme) items.push({ id: `scr-${sc.id}`, kind: 'showcase', title: `Write README for ${sc.repo}`, advice: { push: 'yes', repo: sc.repo, path: 'README.md', what: 'Problem → data → approach → 3 findings → recommendation → how to run', how: 'One screenshot at the top. Recruiters read READMEs, not code.', commit: 'docs: executive README' }, pushed: !!pushed[`scr-${sc.id}`], showcase: sc })
  }
  if (d === 6) items.push({ id: `log-${week.code}`, kind: 'log', title: `Update weekly log table in ${LEARNING_LOG_REPO.name}/README.md (${week.code})`, advice: { push: 'yes', repo: LEARNING_LOG_REPO.name, path: 'README.md', what: `Row: ${week.code} · topics · problems solved · showcase link`, how: 'A visible weekly cadence is the streak recruiters actually notice.', commit: `docs: ${week.code} weekly log` }, pushed: !!pushed[`log-${week.code}`] })
  // yes first, then optional; done tasks first inside each
  const rank = (i) => (i.advice.push === 'yes' ? 0 : 1) * 10 + (i.kind === 'task' && !i.done ? 5 : 0)
  items.sort((a, b) => rank(a) - rank(b))
  return { items, must: items.filter((i) => i.advice.push === 'yes'), optional: items.filter((i) => i.advice.push === 'optional'), pushedCount: items.filter((i) => i.pushed).length }
}

/** Streak of consecutive days (ending today or yesterday) with at least one logged push. */
export function githubStreak(state, today) {
  const log = state.github?.pushLog || {}
  const has = (d) => Object.values(log[d] || {}).some(Boolean)
  let n = 0; let d = has(today) ? today : addDays(today, -1)
  while (has(d)) { n++; d = addDays(d, -1) }
  const days = Object.keys(log).filter((k) => has(k))
  return { current: n, activeDays: days.length, thisWeek: Array.from({ length: 7 }, (_, i) => addDays(programWeekStart(today), i)).filter((x) => x <= today && has(x)).length }
}

export function showcaseSummary(state) {
  const w = state.weekly || {}
  const all = Object.values(SHOWCASE_BY_WEEK)
  const shipped = all.filter((s) => w[s.id]?.stages?.pushed && w[s.id]?.stages?.readme)
  return { total: all.length, shipped: shipped.length, pushed: all.filter((s) => w[s.id]?.stages?.pushed).length }
}
