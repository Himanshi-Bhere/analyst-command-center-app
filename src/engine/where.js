import { pushAdvice } from './github'
import { SHOWCASE_BY_WEEK } from '../data/weekly'

/**
 * "Where do I solve this, and where does it go?"
 * Returns { solve: [{name,url,note}], push: {repo,path,file,commit}, tool }
 * Links are deliberately specific (filtered problem lists / exact tutorial page), not homepages.
 */

const DL = (topic) => `https://datalemur.com/questions?category=SQL&topic=${encodeURIComponent(topic)}`
const SS = (q) => `https://platform.stratascratch.com/coding?code_type=1&is_freemium=1&q=${encodeURIComponent(q)}`
const LC = 'https://leetcode.com/studyplan/top-sql-50/'
const MODE = {
  basic: 'https://mode.com/sql-tutorial/introduction-to-sql/', inter: 'https://mode.com/sql-tutorial/intro-to-intermediate-sql/', joins: 'https://mode.com/sql-tutorial/sql-joins/',
  window: 'https://mode.com/sql-tutorial/sql-window-functions/', sub: 'https://mode.com/sql-tutorial/sql-subqueries/', case: 'https://mode.com/sql-tutorial/sql-case/', agg: 'https://mode.com/sql-tutorial/sql-aggregate-functions/', date: 'https://mode.com/sql-tutorial/sql-datetime-format/', string: 'https://mode.com/sql-tutorial/sql-string-functions-for-cleaning/',
}
const SQLBOLT = 'https://sqlbolt.com/'
const PGEX = 'https://pgexercises.com/questions/basic/'

// SQL: per program week → learn page + practice lists (easy → business → timed)
const SQL_WEEK = {
  1: { learn: [{ name: 'Mode — Basic SQL (SELECT…LIMIT)', url: MODE.basic }, { name: 'SQLBolt lessons 1–6 (interactive)', url: SQLBOLT }], practice: [{ name: 'DataLemur — Easy (SELECT/WHERE)', url: DL('Easy') }, { name: 'pgexercises — Basic', url: PGEX }, { name: 'LeetCode Top SQL 50 — Select', url: LC }], business: [{ name: 'StrataScratch — easy, free', url: SS('') }] },
  2: { learn: [{ name: 'Mode — Aggregates', url: MODE.agg }, { name: 'Mode — CASE', url: MODE.case }, { name: 'Mode — Dates', url: MODE.date }, { name: 'Mode — String functions', url: MODE.string }], practice: [{ name: 'DataLemur — Aggregation', url: DL('Aggregation') }, { name: 'DataLemur — CASE', url: DL('CASE') }, { name: 'pgexercises — Aggregates', url: 'https://pgexercises.com/questions/aggregates/' }], business: [{ name: 'StrataScratch — aggregation (business)', url: SS('aggregat') }, { name: 'LeetCode Top SQL 50 — Basic Aggregate', url: LC }] },
  3: { learn: [{ name: 'Mode — Joins', url: MODE.joins }, { name: 'SQLBolt lessons 6–8', url: SQLBOLT }], practice: [{ name: 'DataLemur — Joins', url: DL('JOIN') }, { name: 'pgexercises — Joins', url: 'https://pgexercises.com/questions/joins/' }, { name: 'LeetCode Top SQL 50 — Basic Joins', url: LC }], business: [{ name: 'StrataScratch — join (business)', url: SS('join') }] },
  4: { learn: [{ name: 'Mode — Window functions', url: MODE.window }, { name: 'Mode — Subqueries & CTEs', url: MODE.sub }], practice: [{ name: 'DataLemur — Window functions', url: DL('Window Functions') }, { name: 'DataLemur — CTE / Subquery', url: DL('CTE') }, { name: 'LeetCode Top SQL 50 — Advanced', url: LC }], business: [{ name: 'StrataScratch — window (business)', url: SS('rank') }, { name: 'DataLemur — Medium', url: DL('Medium') }] },
}
const sqlWeek = (n) => SQL_WEEK[Math.min(4, Math.max(1, n || 1))] || SQL_WEEK[4]
const SQL_MAINT = [{ name: 'DataLemur — Medium (maintenance)', url: DL('Medium') }, { name: 'StrataScratch — free medium', url: SS('') }, { name: 'LeetCode Top SQL 50', url: LC }]

const EXCEL = {
  formulas: [{ name: 'ExcelIsFun — IF/SUMIFS/COUNTIFS class', url: 'https://www.youtube.com/playlist?list=PLrRPvpgDmw0lW0pvYPdOgJXYa2nMBnjrK' }, { name: 'Exceljet — SUMIFS examples', url: 'https://exceljet.net/functions/sumifs-function' }],
  lookup: [{ name: 'Exceljet — XLOOKUP', url: 'https://exceljet.net/functions/xlookup-function' }, { name: 'Exceljet — INDEX/MATCH', url: 'https://exceljet.net/articles/index-and-match' }],
  pivot: [{ name: 'Microsoft — Create a PivotTable', url: 'https://support.microsoft.com/en-us/office/create-a-pivottable-to-analyze-worksheet-data-a9a84538-bfe9-40a9-a8e9-f99134456576' }, { name: 'Practice data: Olist orders (Kaggle)', url: 'https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce' }],
  clean: [{ name: 'Exceljet — TRIM/CLEAN/TEXT', url: 'https://exceljet.net/articles/how-to-clean-text-in-excel' }, { name: 'Practice: messy dataset (Kaggle)', url: 'https://www.kaggle.com/datasets?search=dirty+data' }],
  pq: [{ name: 'Microsoft Learn — Power Query in Excel', url: 'https://learn.microsoft.com/en-us/power-query/power-query-what-is-power-query' }],
  charts: [{ name: 'Exceljet — conditional formatting', url: 'https://exceljet.net/articles/conditional-formatting-with-formulas' }],
  dash: [{ name: 'ExcelIsFun — Dashboards', url: 'https://www.youtube.com/@excelisfun/search?query=dashboard' }],
  model: [{ name: 'CFI — Scenario analysis in Excel', url: 'https://corporatefinanceinstitute.com/resources/financial-modeling/scenario-analysis/' }],
  default: [{ name: 'ExcelIsFun channel', url: 'https://www.youtube.com/@excelisfun' }, { name: 'Exceljet function index', url: 'https://exceljet.net/functions' }],
}
const PBI = {
  pq: [{ name: 'MS Learn — Prepare data (Power Query)', url: 'https://learn.microsoft.com/en-us/training/paths/prepare-data-power-bi/' }],
  model: [{ name: 'MS Learn — Model data', url: 'https://learn.microsoft.com/en-us/training/paths/model-power-bi/' }, { name: 'SQLBI — Star schema', url: 'https://www.sqlbi.com/articles/power-bi-star-schema-or-single-table/' }],
  dax: [{ name: 'SQLBI — Introducing DAX (free)', url: 'https://www.sqlbi.com/p/introducing-dax-video-course/' }, { name: 'DAX.do — practice sandbox', url: 'https://dax.do/' }],
  context: [{ name: 'SQLBI — Filter context', url: 'https://www.sqlbi.com/articles/row-context-and-filter-context-in-dax/' }, { name: 'DAX.do — practice sandbox', url: 'https://dax.do/' }],
  time: [{ name: 'SQLBI — Time intelligence', url: 'https://www.sqlbi.com/articles/time-intelligence-in-power-bi-desktop/' }, { name: 'DAX Patterns — Time patterns', url: 'https://www.daxpatterns.com/time-patterns/' }],
  visual: [{ name: 'MS Learn — Design reports', url: 'https://learn.microsoft.com/en-us/training/paths/visualize-data-power-bi/' }, { name: 'NovyPro — publish for free', url: 'https://www.novypro.com/' }],
  default: [{ name: 'MS Learn — PL-300 path', url: 'https://learn.microsoft.com/en-us/credentials/certifications/data-analyst-associate/' }, { name: 'SQLBI', url: 'https://www.sqlbi.com/' }],
}
const PY = {
  basics: [{ name: 'Kaggle Learn — Python', url: 'https://www.kaggle.com/learn/python' }], pandas: [{ name: 'Kaggle Learn — Pandas', url: 'https://www.kaggle.com/learn/pandas' }, { name: '10 minutes to pandas', url: 'https://pandas.pydata.org/docs/user_guide/10min.html' }],
  clean: [{ name: 'Kaggle Learn — Data Cleaning', url: 'https://www.kaggle.com/learn/data-cleaning' }], eda: [{ name: 'Kaggle Learn — Data Visualization', url: 'https://www.kaggle.com/learn/data-visualization' }],
  default: [{ name: 'Kaggle Learn — Pandas', url: 'https://www.kaggle.com/learn/pandas' }, { name: 'Practice notebooks: Kaggle', url: 'https://www.kaggle.com/code' }],
}
const STATS = [{ name: 'StatQuest — Statistics Fundamentals', url: 'https://www.youtube.com/playlist?list=PLblh5JKOoLUK0FLuzwntyYI10UQFUhsY9' }, { name: 'Khan Academy — Statistics & probability', url: 'https://www.khanacademy.org/math/statistics-probability' }, { name: 'Statistics page (in-app quiz)', url: '/statistics' }]
const APT = (topic) => [{ name: `IndiaBix — Aptitude (${topic})`, url: 'https://www.indiabix.com/aptitude/questions-and-answers/' }, { name: 'IndiaBix — Logical reasoning', url: 'https://www.indiabix.com/logical-reasoning/questions-and-answers/' }, { name: 'IndiaBix — Data interpretation', url: 'https://www.indiabix.com/data-interpretation/questions-and-answers/' }]
const DOMAIN = { retail: [{ name: 'ChartMogul — metrics cheat-sheet', url: 'https://chartmogul.com/resources/saas-metrics-cheat-sheet/' }, { name: 'Shopify — e-commerce KPIs', url: 'https://www.shopify.com/blog/ecommerce-metrics' }, { name: 'Domain track (in-app)', url: '/domain/retail' }], bfsi: [{ name: 'RBI — Financial stability report', url: 'https://www.rbi.org.in/Scripts/PublicationReportDetails.aspx' }, { name: 'Lending Club dataset', url: 'https://www.kaggle.com/datasets/wordsforthewise/lending-club' }, { name: 'Domain track (in-app)', url: '/domain/bfsi' }], commercial: [{ name: 'ChartMogul — SaaS metrics', url: 'https://chartmogul.com/resources/saas-metrics-cheat-sheet/' }, { name: 'Domain track (in-app)', url: '/domain/commercial' }] }

function pick(map, topic = '') {
  const t = topic.toLowerCase()
  for (const [k, v] of Object.entries(map)) if (k !== 'default' && t.includes(k)) return v
  if (map.lookup && /xlookup|vlookup|index/.test(t)) return map.lookup
  if (map.pivot && /pivot/.test(t)) return map.pivot
  if (map.formulas && /if|sumif|countif|formula/.test(t)) return map.formulas
  if (map.clean && /clean|trim|text|missing|duplicate/.test(t)) return map.clean
  if (map.dax && /dax|calculate|measure/.test(t)) return map.dax
  if (map.time && /yoy|mom|rolling|time/.test(t)) return map.time
  if (map.model && /schema|model|relationship/.test(t)) return map.model
  if (map.pandas && /pandas|groupby|merge|dataframe/.test(t)) return map.pandas
  return map.default
}

export function whereFor(task) {
  const s = task.skill, ty = task.type, w = task.weekN || 1, topic = task.topic || '', title = task.title || ''
  let solve = []
  let tool = ''
  if (task.showcase) {
    const sc = SHOWCASE_BY_WEEK[w]
    solve = [{ name: 'Showcase brief (in-app)', url: `/showcase/${task.showcase}`, note: 'Brief, deliverables, README template' }, sc?.dataset ? { name: `Dataset: ${sc.dataset.name}`, url: sc.dataset.url } : null].filter(Boolean)
    tool = sc ? sc.stack.join(' + ') : 'SQL + Excel'
  } else if (s === 'sql') {
    const wk = sqlWeek(w)
    tool = 'Any SQL editor: the platform\'s built-in editor, or DBeaver / pgAdmin locally'
    if (ty === 'Learning') solve = wk.learn
    else if (/business/i.test(title)) solve = [...wk.business, { name: 'Olist dataset for your own business queries', url: 'https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce' }]
    else if (/timed|challenge/i.test(title)) solve = [{ name: 'DataLemur — timed set (pick 5, 40 min)', url: DL(w >= 4 ? 'Window Functions' : 'Easy') }, { name: 'SQL Challenge of the Day (in-app)', url: '/skills/sql' }]
    else if (/interview/i.test(title)) solve = [{ name: 'Interview Center — SQL (in-app)', url: '/interviews?tab=SQL' }, { name: 'DataLemur — SQL interview questions', url: DL('Medium') }]
    else if (/maintenance/i.test(title)) solve = SQL_MAINT
    else solve = wk.practice
  } else if (s === 'excel') { solve = pick(EXCEL, topic + ' ' + title); tool = 'Excel desktop (or Excel Online / Google Sheets for XLOOKUP-compatible formulas)' }
  else if (s === 'powerbi') { solve = pick(PBI, topic + ' ' + title); tool = 'Power BI Desktop (free) · DAX.do for measure practice' }
  else if (s === 'python') { solve = pick(PY, topic + ' ' + title); tool = 'Jupyter / VS Code notebook, or Kaggle Notebooks (no install)' }
  else if (s === 'statistics') { solve = STATS; tool = 'Notebook + a paragraph in your own words' }
  else if (s === 'aptitude') { solve = APT(topic); tool = 'Timer on. 20 min concept, 35 min speed, 5 min mistake log (in-app Aptitude page)' ; solve.push({ name: 'Log score (in-app)', url: '/aptitude' }) }
  else if (['retail', 'bfsi', 'commercial', 'business'].includes(s)) { solve = DOMAIN[s] || DOMAIN.retail; tool = 'Metric cards → Notes vault' }
  else if (s === 'interview' || ty === 'Interview') { solve = [{ name: 'Interview Center (in-app)', url: '/interviews' }, { name: 'DataLemur — interview questions', url: DL('Medium') }]; tool = 'Answer out loud first, then type the skeleton' }
  else if (s === 'project') { solve = [{ name: 'Project Hub (in-app)', url: '/projects' }, { name: 'Kaggle datasets', url: 'https://www.kaggle.com/datasets' }]; tool = 'SQL + Power BI + Python as the stage requires' }
  else if (s === 'application') { solve = [{ name: 'LinkedIn Jobs — analyst, India', url: 'https://www.linkedin.com/jobs/search/?keywords=data%20analyst&location=India' }, { name: 'Naukri — data analyst', url: 'https://www.naukri.com/data-analyst-jobs' }, { name: 'Applications tracker (in-app)', url: '/applications' }]; tool = 'Tailored resume version per domain' }
  else if (s === 'dsa') { solve = [{ name: 'NeetCode — Arrays & Hashing only', url: 'https://neetcode.io/roadmap' }]; tool = '30 min max' }
  if (ty === 'Revision') solve = [{ name: 'Revision Center (in-app)', url: '/revision' }, ...(s === 'sql' ? [{ name: 'DataLemur — redo 3 missed problems', url: DL('Easy') }] : [])]
  // always include the task's own resource if it is not already there
  if (task.resource?.url && !solve.some((x) => x.url === task.resource.url)) solve.unshift({ name: task.resource.name, url: task.resource.url })

  const adv = pushAdvice(task)
  const n = title.match(/\d+/)?.[0]
  const slug = (topic || 'practice').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 32)
  let file = ''
  if (adv.push !== 'no') {
    if (s === 'sql') file = `${adv.path}${String(n || '01').padStart(2, '0')}_${slug}.sql  (one file per problem)`
    else if (s === 'excel') file = `${adv.path}${slug}.xlsx + ${slug}.png`
    else if (s === 'powerbi') file = `${adv.path}${slug}.pbix + screenshots/ + measures.md`
    else if (s === 'python') file = `${adv.path}${slug}.ipynb`
    else if (s === 'statistics') file = `${adv.path}${slug}.md`
    else if (task.showcase) file = 'README.md + sql/ + excel/ + screenshots/'
    else file = adv.path
  }
  return { solve, tool, push: { ...adv, file } }
}
