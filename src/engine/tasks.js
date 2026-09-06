import { WEEKS, JOB_SEARCH_WEEK, PROGRAM_START, DAY_TEMPLATES, MONTHS } from '../data/roadmap'
import { SKILL_MAP } from '../data/skills'
import { SQL_CHALLENGES, DAX_CHALLENGES, EXCEL_CHALLENGES } from '../data/library'
import { SHOWCASE_BY_WEEK } from '../data/weekly'
import { diffDays, monthKey, addDays } from '../lib/dates'

export const weekNumberFor = (date) => Math.floor(diffDays(PROGRAM_START, date) / 7) + 1
export const weekStartFor = (n) => addDays(PROGRAM_START, (n - 1) * 7)
// Program days run from PROGRAM_START's weekday: day 0 = Learn concept ... day 6 = Revision + test
export const programDayIndex = (date) => ((diffDays(PROGRAM_START, date) % 7) + 7) % 7
export const programWeekStart = (date) => addDays(date, -programDayIndex(date))
export const beforeProgram = (date) => date < PROGRAM_START

export function getWeek(n) {
  if (n < 1) return { ...WEEKS[0], n: 1, pre: true }
  const w = WEEKS.find((w) => w.n === n)
  if (w) return w
  const start = weekStartFor(n)
  return JOB_SEARCH_WEEK(n, monthKey(start))
}
export const getWeekForDate = (date) => getWeek(weekNumberFor(date))
export const getMonth = (key) => MONTHS.find((m) => m.key === key) || MONTHS[MONTHS.length - 1]
export const getMonthForDate = (date) => getMonth(monthKey(date))

const PLATFORM = {
  sql: ['DataLemur', 'StrataScratch', 'LeetCode SQL', 'Mode SQL'],
  powerbi: ['Microsoft Learn', 'SQLBI', 'DAX Patterns'],
  excel: ['ExcelIsFun', 'Microsoft Learn'],
  statistics: ['StatQuest', 'Khan Academy'],
  python: ['Kaggle Learn', 'Pandas docs'],
  aptitude: ['IndiaBix', 'PrepInsta'],
  business: ['ChartMogul', 'Company blogs / annual reports'],
  project: ['Kaggle', 'GitHub'],
  interview: ['DataLemur', 'Interview Center'],
  application: ['LinkedIn Jobs', 'Naukri'],
  dsa: ['NeetCode (Arrays/Hashing only)'],
}
const URLS = {
  DataLemur: 'https://datalemur.com/questions', StrataScratch: 'https://platform.stratascratch.com/coding', 'LeetCode SQL': 'https://leetcode.com/studyplan/top-sql-50/', 'Mode SQL': 'https://mode.com/sql-tutorial/',
  'Microsoft Learn': 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi', SQLBI: 'https://www.sqlbi.com/', 'DAX Patterns': 'https://www.daxpatterns.com/', ExcelIsFun: 'https://www.youtube.com/@excelisfun',
  StatQuest: 'https://www.youtube.com/@statquest', 'Khan Academy': 'https://www.khanacademy.org/math/statistics-probability', 'Kaggle Learn': 'https://www.kaggle.com/learn/pandas', 'Pandas docs': 'https://pandas.pydata.org/docs/user_guide/10min.html',
  IndiaBix: 'https://www.indiabix.com/', PrepInsta: 'https://prepinsta.com/', ChartMogul: 'https://chartmogul.com/resources/', Kaggle: 'https://www.kaggle.com/datasets', GitHub: 'https://github.com/',
  'Interview Center': '/interviews', 'LinkedIn Jobs': 'https://www.linkedin.com/jobs/', Naukri: 'https://www.naukri.com/', 'Company blogs / annual reports': 'https://www.google.com/search?q=annual+report+analytics',
  'NeetCode (Arrays/Hashing only)': 'https://neetcode.io/roadmap',
}
const res = (name) => ({ name, url: URLS[name] || '' })

const round15 = (m) => Math.max(15, Math.round(m / 15) * 15)
const diffFor = (weekN, lane) => {
  if (lane === 'dsa') return 'Beginner'
  if (weekN <= 2) return 'Beginner'
  if (weekN <= 6) return 'Intermediate'
  if (weekN <= 12) return 'Intermediate'
  return 'Advanced'
}

// ---------- primary lane daily plan ----------
function primaryTasks(week, date, d) {
  const t = week.topics
  const lane = week.primary
  const hours = week.lanes[lane] || 6
  const perDay = (hours * 60) / 7
  const plat = PLATFORM[lane] || []
  const P = (i) => res(plat[i % plat.length])
  const tt = week.title
  const diff = diffFor(week.n, lane)
  const base = { skill: lane, weekN: week.n, difficulty: diff, primary: true }
  const dayIdx = weekNumberFor(date) // used for challenge rotation
  const chal = lane === 'sql' ? SQL_CHALLENGES[(dayIdx * 7 + d) % SQL_CHALLENGES.length] : lane === 'powerbi' ? DAX_CHALLENGES[(dayIdx * 7 + d) % DAX_CHALLENGES.length] : null

  if (lane === 'application') return applicationDay(week, d)
  if (lane === 'interview') return interviewWeekDay(week, d)
  if (lane === 'project') return projectWeekDay(week, d)

  switch (d) {
    case 0: return [
      { ...base, title: `Learn: ${t[0]} + ${t[1]}`, topic: t[0], type: 'Learning', estMin: round15(perDay * 0.55), resource: week.resource, why: `Opens ${week.code}: ${week.goal}` },
      { ...base, title: `Learn: ${t[2]} + ${t[3]}`, topic: t[2], type: 'Learning', estMin: round15(perDay * 0.3), resource: week.resource },
      { ...base, title: `Write 3 concept notes into the Vault (${week.code})`, topic: tt, type: 'Revision', estMin: 15, resource: { name: 'Notes', url: '/notes' }, why: 'Explain → retain. 20% theory / 80% practice starts with your own words.' },
    ]
    case 1: return [
      { ...base, title: `Learn: ${t[4]} + ${t[5]}`, topic: t[4], type: 'Learning', estMin: round15(perDay * 0.35), resource: week.resource },
      { ...base, title: `Guided exercises on ${t[0]}, ${t[1]}, ${t[2]} (8 problems)`, topic: t[0], type: 'Practice', estMin: round15(perDay * 0.65), resource: P(3), why: 'Muscle memory: type every query, never copy-paste.' },
    ]
    case 2: return [
      { ...base, title: `Learn: ${t[6]} + ${t[7]}`, topic: t[6], type: 'Learning', estMin: round15(perDay * 0.3), resource: week.resource },
      { ...base, title: `Solve 5 business problems using ${tt}`, topic: tt, type: 'Practice', estMin: round15(perDay * 0.7), resource: P(1), why: 'Business framing is what interviewers grade — not syntax.' },
    ]
    case 3: return [
      { ...base, title: `Answer 5 interview questions on ${tt} (out loud)`, topic: tt, type: 'Interview', estMin: round15(perDay * 0.45), resource: { name: 'Interview Center', url: '/interviews' }, why: 'Explaining verbally is an evidence gate for Interview Ready.' },
      { ...base, title: `Practice 6 ${SKILL_MAP[lane]?.name || lane} problems on ${P(0).name}`, topic: t[3], type: 'Practice', estMin: round15(perDay * 0.55), resource: P(0) },
    ]
    case 4: return [
      { ...base, title: chal ? `Timed challenge (30 min): ${chal.q}` : `Timed drill: 5 problems on ${tt} in 30 min`, topic: tt, type: 'Practice', estMin: 30, resource: P(0), hint: chal?.hint, why: 'Timed = interview conditions. Log accuracy + time.' },
      { ...base, title: `Review every mistake → create Revision items`, topic: tt, type: 'Revision', estMin: 20, resource: { name: 'Revision Center', url: '/revision' } },
      { ...base, title: `5 more ${SKILL_MAP[lane]?.name || lane} problems (medium)`, topic: t[5], type: 'Practice', estMin: round15(perDay - 50), resource: P(2) },
    ]
    case 5: {
      const sc = SHOWCASE_BY_WEEK[week.n]
      if (sc) return [
        { ...base, skill: sc.skill, title: `Weekly Showcase: ${sc.title} — build the deliverables`, topic: sc.title, type: 'Project', estMin: round15(Math.max(perDay * 1.1, (sc.hours - 1) * 60)), resource: { name: 'Showcase brief', url: `/showcase/${sc.id}` }, why: `Industry-shaped mini project that proves ${tt} on a real dataset. Ships to GitHub tomorrow.`, showcase: sc.id, showcaseStage: 'built' },
      ]
      return [
        { ...base, title: `Mini-project: apply ${tt} on a real dataset (write-up + 3 findings)`, topic: tt, type: 'Project', estMin: round15(perDay * 1.1), resource: res('Kaggle'), why: 'Evidence > tutorials. A mini-project is an Interview Ready gate.' },
      ]
    }
    default: return [
      ...(SHOWCASE_BY_WEEK[week.n] ? [{ ...base, skill: 'project', title: `Push ${SHOWCASE_BY_WEEK[week.n].repo} to GitHub + write the executive README`, topic: SHOWCASE_BY_WEEK[week.n].title, type: 'Project', estMin: 60, resource: { name: 'GitHub Center', url: '/github' }, why: 'A pushed repo with a README is evidence; a folder on your laptop is not.', showcase: SHOWCASE_BY_WEEK[week.n].id, showcaseStage: 'pushed' }] : []),
      { ...base, title: `Revise all ${week.code} topics + 10-question self-test`, topic: tt, type: 'Revision', estMin: round15(perDay * 0.8), resource: { name: 'Revision Center', url: '/revision' } },
      { ...base, title: `Weekly Review: ${week.code} scorecard + plan next week`, topic: 'Weekly review', type: 'Revision', estMin: 20, resource: { name: 'Weekly Plan', url: '/weekly' }, why: 'Answer: what did I achieve, what was hardest, what moves to next week?' },
    ]
  }
}

function applicationDay(week, d) {
  const base = { skill: 'application', weekN: week.n, difficulty: 'Intermediate', primary: true }
  const perDay = ((week.lanes.application || 7) * 60) / 6
  if (d === 6) return [{ ...base, title: 'Weekly pipeline review: follow-ups, response rate, next week targets', topic: 'Applications', type: 'Revision', estMin: 30, resource: { name: 'Applications', url: '/applications' } }]
  return [
    { ...base, title: 'Submit 5–10 quality applications (tailored resume version)', topic: 'Applications', type: 'Project', estMin: round15(perDay * 0.65), resource: res('LinkedIn Jobs'), why: 'Top-of-funnel volume × quality drives interviews.' },
    { ...base, title: 'Send 3 referral requests to alumni / employees', topic: 'Networking', type: 'Project', estMin: round15(perDay * 0.2), resource: { name: 'Networking', url: '/networking' } },
    { ...base, title: 'Follow up on applications older than 5 days', topic: 'Applications', type: 'Practice', estMin: 15, resource: { name: 'Applications', url: '/applications' } },
  ]
}
function interviewWeekDay(week, d) {
  const base = { skill: 'interview', weekN: week.n, difficulty: 'Advanced', primary: true }
  const t = week.topics
  const perDay = ((week.lanes.interview || 6) * 60) / 6
  if (d === 6) return [{ ...base, title: 'Weekly Review + list weak interview topics for next week', topic: 'Weekly review', type: 'Revision', estMin: 30, resource: { name: 'Weekly Plan', url: '/weekly' } }]
  return [
    { ...base, title: `${t[d] || t[0]} — full mock (record yourself)`, topic: t[d] || t[0], type: 'Interview', estMin: round15(perDay * 0.65), resource: { name: 'Interview Center', url: '/interviews' }, why: 'Confidence ≥ 4/5 across 60 questions unlocks Interview Ready.' },
    { ...base, title: 'Rate confidence on 10 questions; add weak ones to Revision', topic: 'Interview bank', type: 'Interview', estMin: round15(perDay * 0.35), resource: { name: 'Interview Center', url: '/interviews' } },
  ]
}
function projectWeekDay(week, d) {
  const base = { skill: 'project', weekN: week.n, difficulty: 'Advanced', primary: true }
  const t = week.topics
  const perDay = ((week.lanes.project || 7) * 60) / 6
  if (d === 6) return [{ ...base, title: 'Weekly Review: project stage progress + blockers', topic: 'Weekly review', type: 'Revision', estMin: 30, resource: { name: 'Project Hub', url: '/projects' } }]
  return [
    { ...base, title: `${t[d] || t[0]}`, topic: t[d] || t[0], type: 'Project', estMin: round15(perDay), resource: { name: 'Project Hub', url: '/projects' }, why: 'Portfolio = 15% of readiness and the #1 interview talking point.' },
  ]
}

// ---------- secondary lanes ----------
const LANE_DAYS = {
  aptitude: [0, 1, 2, 3, 4, 5], excel: [0, 2, 4], statistics: [1, 3], python: [1, 3, 5], project: [2, 5], interview: [3], business: [2, 5], application: [0, 1, 2, 3, 4], sql: [1, 4], powerbi: [2, 5], dsa: [5],
}
const APT_MIX = ['20 Quant + 10 Logical', '15 Quant + 10 DI', '20 Quant + 10 Logical', '15 Quant + 10 DI + 5 Verbal', '20 Quant + 10 Logical', 'Timed mini-test: 30 mixed in 30 min']

function secondaryTasks(week, date, d) {
  const out = []
  const lanes = { ...week.lanes }
  const primary = week.primary
  const dsaEnabled = weekNumberFor(date) >= 3 && weekNumberFor(date) <= 12
  if (dsaEnabled && !lanes.dsa) lanes.dsa = 0.5
  for (const [lane, hours] of Object.entries(lanes)) {
    if (lane === primary || !hours) continue
    const days = LANE_DAYS[lane] || [1, 4]
    if (!days.includes(d)) continue
    const mins = round15((hours * 60) / days.length)
    const sec = (week.secondary || {})[lane] || []
    const idx = days.indexOf(d)
    const FALLBACK = { project: ['Iterate a portfolio project from interview feedback', 'Polish README / dashboard GIFs', 'Rehearse the 60-second pitch for one project'], business: ['Revise 5 metric-vault cards out loud', 'Structure 1 business case (DEFINE→RECOMMEND)', 'Read one company annual report section; note 3 metrics'], application: ['Submit 3–5 tailored applications + 2 referral requests'] }
    const skillTopics = (SKILL_MAP[lane]?.topics || []).filter((t) => !t.week || t.week <= week.n)
    const maintain = skillTopics.length && week.n > 12
    const topic = sec.length ? sec[idx % sec.length] : FALLBACK[lane] ? FALLBACK[lane][(week.n + idx) % FALLBACK[lane].length] : (SKILL_MAP[lane]?.topics.find((t) => t.week === week.n)?.name || (skillTopics.length ? skillTopics[(week.n + idx) % skillTopics.length].name : lane))
    const plat = PLATFORM[lane] || []
    const diff = diffFor(week.n, lane)
    const base = { skill: lane, weekN: week.n, difficulty: diff, primary: false, estMin: mins }
    switch (lane) {
      case 'aptitude': {
        const aptTopic = SKILL_MAP.aptitude.topics.find((t) => t.week === week.n)?.name || SKILL_MAP.aptitude.topics[(week.n - 1) % 12].name
        out.push({ ...base, title: `Aptitude: ${APT_MIX[idx % APT_MIX.length]} — ${aptTopic}`, topic: aptTopic, type: 'Practice', resource: res('IndiaBix'), why: 'The aptitude test is the first filter. 20 min concept, 35 min speed, 5 min mistake log.' })
        break
      }
      case 'excel': out.push({ ...base, title: maintain ? `Excel interview drill: ${topic} — ${EXCEL_CHALLENGES[(week.n + idx) % EXCEL_CHALLENGES.length]}` : `Excel: ${topic}` + (idx === 2 ? ` — challenge: ${EXCEL_CHALLENGES[(week.n + idx) % EXCEL_CHALLENGES.length]}` : ' (build a small workbook)'), topic, type: idx === 2 || maintain ? 'Practice' : 'Learning', resource: res(plat[0]) }); break
      case 'statistics': out.push({ ...base, title: `Statistics: ${topic} — what it means, formula, business example`, topic, type: idx ? 'Practice' : 'Learning', resource: { name: 'Statistics page', url: '/statistics' } }); break
      case 'python': out.push({ ...base, title: `Python: ${topic}` + (idx === 2 ? ' — apply on a CSV (10 lines of Pandas)' : ''), topic, type: idx === 2 ? 'Practice' : 'Learning', resource: res(plat[idx % plat.length]) }); break
      case 'project': out.push({ ...base, title: sec.length ? `Project: ${topic}` : topic, topic: sec.length ? topic : 'Portfolio', type: 'Project', resource: { name: 'Project Hub', url: '/projects' }, why: 'Portfolio = 15% of readiness.' }); break
      case 'interview': out.push({ ...base, title: sec.length ? `Interview: ${topic}` : `Interview: rate 5 questions, practice 2 out loud`, topic: sec.length ? topic : 'Interview bank', type: 'Interview', resource: { name: 'Interview Center', url: '/interviews' } }); break
      case 'business': out.push({ ...base, title: sec.length ? `Domain: ${topic}` : topic, topic: sec.length ? topic : 'Domain knowledge', type: idx || !sec.length ? 'Practice' : 'Learning', resource: { name: 'Domain tracks', url: '/business' } }); break
      case 'application': out.push({ ...base, title: `Applications: ${topic || 'submit 3–5 tailored applications + 2 referral requests'}`, topic: 'Applications', type: 'Project', resource: res('LinkedIn Jobs') }); break
      case 'sql': out.push({ ...base, title: `SQL maintenance: ${topic}`, topic, type: 'Practice', resource: res('DataLemur'), why: 'SQL decays fast. 20% of readiness weight.' }); break
      case 'powerbi': out.push({ ...base, title: maintain ? `Power BI interview drill: ${topic} — ${DAX_CHALLENGES[(week.n + idx) % DAX_CHALLENGES.length].q}` : `Power BI: ${topic}`, topic, type: 'Practice', resource: res('SQLBI') }); break
      case 'dsa': out.push({ ...base, title: `DSA Lite (30 min max): 2 easy problems — ${SKILL_MAP.dsa.topics[(week.n - 3) % 10].name}`, topic: SKILL_MAP.dsa.topics[(week.n - 3) % 10].name, type: 'Practice', estMin: 30, resource: res(plat[0]), why: 'Low priority. Never let this steal time from SQL / BI / projects.' }); break
      default: out.push({ ...base, title: `${lane}: ${topic}`, topic, type: 'Learning', resource: res(plat[0]) })
    }
  }
  return out
}

export function generateTasksForDate(date, laneOverrides) {
  const week0 = getWeekForDate(date)
  const week = laneOverrides?.[week0.n] ? { ...week0, lanes: { ...week0.lanes, ...laneOverrides[week0.n] } } : week0
  const d = programDayIndex(date)
  const raw = [...primaryTasks(week, date, d), ...secondaryTasks(week, date, d)]
  return raw.map((t, i) => ({ ...t, id: `g-${date}-${t.skill}-${i}`, date, origDate: date, source: 'generated', dayTemplate: DAY_TEMPLATES[d].label }))
}

// ---------- effective tasks for a date incl. overrides and custom ----------
export function tasksForDate(date, state) {
  const { taskOverrides = {}, customTasks = [], settings = {} } = state
  const gen = beforeProgram(date) ? [] : generateTasksForDate(date, settings.laneOverrides)
  const here = gen.filter((t) => !taskOverrides[t.id]?.date || taskOverrides[t.id].date === date).map((t) => ({ ...t, date }))
  // tasks moved into this date from elsewhere
  const movedIn = Object.entries(taskOverrides).filter(([id, o]) => o.date === date && !id.startsWith(`g-${date}-`) && id.startsWith('g-')).map(([id, o]) => {
    const t = generateTasksForDate(o.origDate, settings.laneOverrides).find((x) => x.id === id)
    return t ? { ...t, date, movedFrom: o.origDate } : null
  }).filter(Boolean)
  const custom = customTasks.filter((t) => (taskOverrides[t.id]?.date || t.date) === date).map((t) => ({ ...t, date, source: 'custom' }))
  return [...here, ...movedIn, ...custom]
}

export const taskStatus = (t, state) => state.taskState?.[t.id]?.status || 'open'
export const isDone = (t, state) => taskStatus(t, state) === 'done'
export const isClosed = (t, state) => ['done', 'skipped', 'dropped'].includes(taskStatus(t, state))

export function tasksForRange(start, days, state) {
  const out = []
  for (let i = 0; i < days; i++) { const d = addDays(start, i); out.push(...tasksForDate(d, state)) }
  return out
}
export const tasksForWeekOf = (date, state) => tasksForRange(programWeekStart(date), 7, state)

// overdue = open tasks dated before today, back to program start (cap 60 days for perf)
export function overdueTasks(today, state) {
  const from = Math.min(diffDays(PROGRAM_START, today), 60)
  if (from <= 0) return []
  const startedOn = state.settings?.startedOn || PROGRAM_START
  const out = []
  for (let i = from; i >= 1; i--) {
    const d = addDays(today, -i)
    if (d < PROGRAM_START || d < startedOn) continue
    out.push(...tasksForDate(d, state).filter((t) => !isClosed(t, state)))
  }
  return out
}
