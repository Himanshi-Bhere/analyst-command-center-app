// MASTER ROADMAP — Sept 2026 → May 2027
// Every week defines: primary skill, topics, secondary lanes, hour allocation.
// The task engine converts these into daily microtasks (Day1=Learn, Day2=Guided, Day3=Business, Day4=Interview, Day5=Timed, Day6=Mini-project, Day7=Revision+Test — days counted from PROGRAM_START).

export const DEFAULT_PROGRAM_START = '2026-09-04' // Week 1, Day 1 (Himanshi's start date). Program weeks run from this weekday.
export let PROGRAM_START = DEFAULT_PROGRAM_START
export const setProgramStart = (iso) => { if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) PROGRAM_START = iso }
export const PHASE1_END = '2026-12-31'
export const PROGRAM_END = '2027-05-30'

export const SKILLS = {
  sql: { id: 'sql', name: 'SQL', weight: 20, short: 'SQL' },
  powerbi: { id: 'powerbi', name: 'Power BI', weight: 15, short: 'PBI' },
  excel: { id: 'excel', name: 'Excel', weight: 10, short: 'XLS' },
  statistics: { id: 'statistics', name: 'Statistics', weight: 10, short: 'STAT' },
  python: { id: 'python', name: 'Python', weight: 10, short: 'PY' },
  business: { id: 'business', name: 'Business / Domain', weight: 10, short: 'BIZ' },
  project: { id: 'project', name: 'Projects', weight: 15, short: 'PRJ' },
  aptitude: { id: 'aptitude', name: 'Aptitude', weight: 5, short: 'APT' },
  interview: { id: 'interview', name: 'Interview', weight: 5, short: 'INT' },
  dsa: { id: 'dsa', name: 'DSA Lite', weight: 0, short: 'DSA' },
}

export const MONTHS = [
  {
    key: '2026-09', name: 'September 2026', phase: 'Phase 1 — Technical Core', title: 'Technical Core — SQL + Excel Foundation + Aptitude',
    primary: 'Master SQL end-to-end (basics → window functions) and become fluent in business Excel.',
    secondary: ['Excel formulas, lookups, pivots, cleaning', 'Daily aptitude habit (1h)', 'Descriptive statistics foundation'],
    targets: ['SQL: 80+ problems solved (Mode → DataLemur)', 'Window functions & CTEs without Google', 'Excel: XLOOKUP, Pivot Tables, cleaning workflow', 'Aptitude: 400+ questions, 4 quant topics', 'Stats: descriptive stats + distributions basics', 'Project 1 dataset chosen + business questions written'],
    mode: 'LEARNING',
  },
  {
    key: '2026-10', name: 'October 2026', phase: 'Phase 2 — BI Engineering', title: 'BI Engineering — Power BI + DAX + Data Modeling',
    primary: 'Build executive-grade Power BI dashboards on a proper star schema with correct DAX.',
    secondary: ['Excel advanced pivots + Power Query + dashboards', 'Python basics → Pandas basics', 'SQL maintenance: 3 interview problems/week', 'Aptitude continues daily'],
    targets: ['Power Query cleaning pipeline', 'Star schema with fact/dim + date table', 'DAX: CALCULATE, filter context, time intelligence', 'One executive dashboard with drill-through + bookmarks', 'Project 1 SQL + data model complete', 'Aptitude: 500+ questions, DI started'],
    mode: 'LEARNING',
  },
  {
    key: '2026-11', name: 'November 2026', phase: 'Phase 3 — Business Analytics', title: 'Business Analytics — Statistics + Python + Domain + Projects',
    primary: 'Speak the language of money: domain metrics, inferential stats, Pandas pipelines, and ship Projects 1 & 2.',
    secondary: ['Retail/E-Com, BFSI and Commercial metric mastery', 'Hypothesis testing, A/B, regression interpretation', 'Pandas cleaning + EDA + automation', 'Business case practice starts'],
    targets: ['Project 1 shipped (live dashboard + README)', 'Project 2 SQL + Python pipeline complete', 'Domain metric vault: 40+ metrics with interpretation', 'Stats: hypothesis testing + A/B interpreted in business terms', 'Python: 20 Pandas exercises + 1 automation script', '10 business cases structured (DEFINE→RECOMMEND)'],
    mode: 'LEARNING',
  },
  {
    key: '2026-12', name: 'December 2026', phase: 'Phase 4 — Launch', title: 'Portfolio + Interview + Applications + Internship/Job Launch',
    primary: 'Become application-ready: 3 flagship projects live, resume/LinkedIn finished, first application batches out.',
    secondary: ['100+ SQL interview problems cumulative', 'Mock interviews: SQL, PBI, Excel, project, HR, case', 'Aptitude benchmark passed', 'Application launch: 5–10 quality/day'],
    targets: ['3 portfolio projects live', 'GitHub polished with executive READMEs', 'Resume finished (3 versions)', 'LinkedIn finished', '100+ SQL interview problems', 'Power BI + Excel interview ready', 'Aptitude benchmark ≥ 80%', '30 mock interview questions', 'First application batch (50+)'],
    mode: 'LAUNCH',
  },
  { key: '2027-01', name: 'January 2027', phase: 'Job Search', title: 'Applications + Interviews + Portfolio Improvement', primary: 'Volume + quality: 5–10 applications/day, convert OAs into interviews, patch every gap an interview exposes.', secondary: ['Weekly SQL + case mock', 'Portfolio iteration based on feedback', 'Referral outreach: 10/week'], targets: ['150+ applications cumulative', '10+ OAs cleared', '5+ interviews', 'Project READMEs iterated from feedback'], mode: 'JOB_SEARCH' },
  { key: '2027-02', name: 'February 2027', phase: 'Job Search', title: 'Interview Acceleration + Domain Specialization', primary: 'Interview conversion: deep-dive the domain you interview best in, drill business cases.', secondary: ['Domain deep-dive (top-scoring track)', 'Case interviews 3/week', 'Follow-ups on every application'], targets: ['10+ interviews', 'Case confidence ≥ 4/5', 'Domain readiness ≥ 80% on top track'], mode: 'JOB_SEARCH' },
  { key: '2027-03', name: 'March 2027', phase: 'Job Search', title: 'Advanced Case Studies + Applications', primary: 'Advanced cases, managerial rounds, keep the top-of-funnel full.', secondary: ['Managerial + HR round prep', 'Salary negotiation prep', 'Campus drives'], targets: ['Managerial round confidence', '2+ final rounds'], mode: 'JOB_SEARCH' },
  { key: '2027-04', name: 'April 2027', phase: 'Job Search', title: 'Interview Conversion + Offer Pipeline', primary: 'Convert final rounds into offers; compare offers on role quality, not just CTC.', secondary: ['Offer evaluation framework', 'Backup pipeline stays warm'], targets: ['1+ offer in hand'], mode: 'JOB_SEARCH' },
  { key: '2027-05', name: 'May 2027', phase: 'Job Search', title: 'Full-Time Analytics Role Secured Before Graduation', primary: 'Close. Accept the best-fit role, negotiate joining, and prep for day 1.', secondary: ['Pre-joining upskilling', 'Notice + documentation'], targets: ['Offer accepted', 'Joining plan'], mode: 'JOB_SEARCH' },
]

// hours: weekly allocation per lane (sum ≈ 21)
export const WEEKS = [
  // ---------------- SEPTEMBER ----------------
  { n: 1, month: '2026-09', code: 'W1', title: 'SQL Fundamentals', primary: 'sql', goal: 'Read and write basic queries fluently: SELECT → LIMIT.',
    topics: ['SELECT & FROM', 'WHERE filtering', 'DISTINCT', 'ORDER BY', 'LIMIT / OFFSET', 'Column aliases', 'Comparison & logical operators', 'LIKE / IN / BETWEEN'],
    lanes: { sql: 8, excel: 4, aptitude: 5, statistics: 2, project: 0, interview: 1, python: 0, business: 1 },
    secondary: { excel: ['Cell references', 'IF / nested IF', 'SUMIF / COUNTIF'], aptitude: ['Percentages'], statistics: ['Mean / median / mode'], business: ['What analysts actually do: SQL → dashboard → decision'] },
    resource: { name: 'Mode SQL Tutorial — Basic', url: 'https://mode.com/sql-tutorial/' } },
  { n: 2, month: '2026-09', code: 'W2', title: 'SQL Aggregation + Business Queries', primary: 'sql', goal: 'Turn raw rows into KPIs with GROUP BY, CASE WHEN and date logic.',
    topics: ['GROUP BY', 'HAVING vs WHERE', 'COUNT / SUM / AVG / MIN / MAX', 'CASE WHEN', 'NULL handling (COALESCE, IS NULL)', 'Date functions (DATE_TRUNC, EXTRACT)', 'String functions', 'Conditional aggregation (pivot with CASE)'],
    lanes: { sql: 8, excel: 4, aptitude: 5, statistics: 2, project: 0, interview: 1, python: 0, business: 1 },
    secondary: { excel: ['VLOOKUP / XLOOKUP', 'INDEX / MATCH'], aptitude: ['Profit, Loss & Discount'], statistics: ['Variance & standard deviation'], business: ['Revenue, orders, AOV — computing KPIs in SQL'] },
    resource: { name: 'Mode SQL Tutorial — Intermediate', url: 'https://mode.com/sql-tutorial/intro-to-intermediate-sql/' } },
  { n: 3, month: '2026-09', code: 'W3', title: 'SQL Joins + Data Modeling', primary: 'sql', goal: 'Query across multiple tables and think relationally (PK/FK).',
    topics: ['INNER JOIN', 'LEFT / RIGHT JOIN', 'FULL OUTER JOIN', 'UNION / UNION ALL', 'Self-joins', 'Primary vs foreign keys', 'Multi-table querying', 'Join fan-out & duplicate traps'],
    lanes: { sql: 8, excel: 4, aptitude: 5, statistics: 2, project: 1, interview: 1, python: 0, business: 0 },
    secondary: { excel: ['Pivot Tables', 'Sorting / filtering'], aptitude: ['Ratio, Proportion & Averages'], statistics: ['Percentiles & quartiles'], project: ['Choose Project 1 dataset; write 3 business questions'] },
    resource: { name: 'DataLemur — SQL Joins', url: 'https://datalemur.com/sql-tutorial' } },
  { n: 4, month: '2026-09', code: 'W4', title: 'Advanced SQL — CTEs + Window Functions', primary: 'sql', goal: 'Cross the line from beginner to professional: window functions without Google.',
    topics: ['Subqueries', 'CTEs (WITH)', 'ROW_NUMBER', 'RANK / DENSE_RANK', 'LAG / LEAD', 'SUM OVER (cumulative)', 'Moving averages (ROWS BETWEEN)', 'Top-N per group'],
    lanes: { sql: 9, excel: 3, aptitude: 5, statistics: 2, project: 1, interview: 1, python: 0, business: 0 },
    secondary: { excel: ['Data cleaning workflow (TRIM, TEXT, dates)'], aptitude: ['Time & Work'], statistics: ['Distributions basics (normal, skew)'], project: ['Load Project 1 data into PostgreSQL/SQLite; explore schema'] },
    resource: { name: 'Mode — Window Functions', url: 'https://mode.com/sql-tutorial/sql-window-functions/' } },
  // ---------------- OCTOBER ----------------
  { n: 5, month: '2026-10', code: 'W5', title: 'Power Query — Cleaning Pipeline', primary: 'powerbi', goal: 'Clean any messy file before it enters the model.',
    topics: ['Importing data (CSV, Excel, SQL)', 'Data types', 'Removing duplicates', 'Null handling', 'Transformations (split, unpivot, fill)', 'Merge queries', 'Append queries', 'Query folding basics'],
    lanes: { sql: 3, powerbi: 7, excel: 3, aptitude: 4, python: 2, project: 1, interview: 1, statistics: 0, business: 0 },
    secondary: { sql: ['Maintenance: 3 DataLemur mediums'], excel: ['Power Query in Excel'], python: ['Python basics: variables, lists, loops'], aptitude: ['Time, Speed & Distance'], project: ['Project 1: clean events table in Power Query'] },
    resource: { name: 'Microsoft Learn — Power Query', url: 'https://learn.microsoft.com/en-us/training/paths/prepare-data-power-bi/' } },
  { n: 6, month: '2026-10', code: 'W6', title: 'Data Modeling — Star Schema', primary: 'powerbi', goal: 'Build a Kimball star schema: facts, dims, date table, correct cardinality.',
    topics: ['Fact vs dimension tables', 'Primary / foreign keys', 'Star schema', 'Relationships & cardinality', 'Filter direction', 'Date table (CALENDAR, mark as date)', 'Role-playing dimensions', 'Never connect two facts directly'],
    lanes: { sql: 3, powerbi: 7, excel: 3, aptitude: 4, python: 2, project: 1, interview: 1, statistics: 0, business: 0 },
    secondary: { sql: ['Maintenance: 3 window-function problems'], excel: ['Advanced Pivot Tables (slicers, calculated fields)'], python: ['Dictionaries, functions, files'], aptitude: ['Simple & Compound Interest'], project: ['Project 1: design Fact_Events + Dim_Users/Products/Date'] },
    resource: { name: 'Microsoft Learn — Model data in Power BI', url: 'https://learn.microsoft.com/en-us/training/paths/model-power-bi/' } },
  { n: 7, month: '2026-10', code: 'W7', title: 'DAX Fundamentals', primary: 'powerbi', goal: 'Measures vs calculated columns; write CALCULATE with confidence.',
    topics: ['Calculated columns vs measures', 'SUM / SUMX', 'COUNTROWS / DISTINCTCOUNT', 'DIVIDE', 'CALCULATE', 'FILTER', 'Row context vs filter context', 'Measure naming & folders'],
    lanes: { sql: 2, powerbi: 8, excel: 2, aptitude: 4, python: 2, project: 2, interview: 1, statistics: 0, business: 0 },
    secondary: { sql: ['Maintenance: 2 StrataScratch problems'], excel: ['Excel dashboard layout'], python: ['Pandas basics: read_csv, head, describe'], aptitude: ['Permutations, Combinations & Probability'], project: ['Project 1: core measures (Sessions, Conversions, CVR, AOV)'] },
    resource: { name: 'SQLBI — Introducing DAX', url: 'https://www.sqlbi.com/p/introducing-dax-video-course/' } },
  { n: 8, month: '2026-10', code: 'W8', title: 'Advanced DAX + Time Intelligence + Dashboard UX', primary: 'powerbi', goal: 'YoY / MoM / rolling metrics with correct context; executive dashboard polish.',
    topics: ['Context transition', 'ALL / ALLEXCEPT / KEEPFILTERS', 'SAMEPERIODLASTYEAR / DATEADD', 'DATESINPERIOD rolling', 'YoY & MoM measures', 'Drill-through & tooltips', 'Bookmarks & field parameters', 'KPI cards & dynamic titles'],
    lanes: { sql: 2, powerbi: 8, excel: 2, aptitude: 4, python: 2, project: 2, interview: 1, statistics: 0, business: 0 },
    secondary: { sql: ['Maintenance: 2 LeetCode SQL mediums'], excel: ['Scenario analysis / what-if'], python: ['Pandas filtering & selection'], aptitude: ['Data Interpretation — tables & charts'], project: ['Project 1: funnel visual + drill-through + Lost GMV measure'] },
    resource: { name: 'SQLBI — Time intelligence', url: 'https://www.sqlbi.com/articles/time-intelligence-in-power-bi-desktop/' } },
  // ---------------- NOVEMBER ----------------
  { n: 9, month: '2026-11', code: 'W9', title: 'Inferential Statistics + Pandas Cleaning', primary: 'statistics', goal: 'Interpret probability, CIs and hypothesis tests like an analyst, not a mathematician.',
    topics: ['Probability fundamentals', 'Distributions (normal, binomial)', 'Sampling & CLT', 'Confidence intervals', 'Hypothesis testing & p-value', 'Correlation vs covariance', 'A/B testing basics', 'Regression interpretation'],
    lanes: { sql: 2, powerbi: 2, excel: 1, aptitude: 3, python: 5, statistics: 4, project: 3, interview: 1, business: 0 },
    secondary: { python: ['NumPy basics', 'Pandas: missing values, duplicates'], project: ['Project 1: insights + recommendations + README'], aptitude: ['Blood Relations & Direction Sense'], sql: ['Maintenance: 3 interview problems'] },
    resource: { name: 'StatQuest — Statistics Fundamentals', url: 'https://www.youtube.com/playlist?list=PLblh5JKOoLUK0FLuzwntyYI10UQFUhsY9' } },
  { n: 10, month: '2026-11', code: 'W10', title: 'Retail / E-Commerce Analytics', primary: 'business', goal: 'Own the e-commerce metric stack and the funnel/cohort questions behind it.',
    topics: ['GMV, revenue, AOV, conversion rate', 'Cart abandonment & funnel analytics', 'CAC, LTV, ROAS', 'Return rate, discount impact, gross margin', 'Inventory turnover & stockouts', 'Repeat purchase rate & cohort retention', 'Customer segmentation (RFM)', 'Category / geo / delivery analytics'],
    lanes: { sql: 2, powerbi: 2, excel: 1, aptitude: 3, python: 4, statistics: 1, project: 4, interview: 1, business: 3 },
    secondary: { python: ['Pandas groupby & merge'], project: ['Project 1: SHIP (live dashboard + GitHub)', 'Project 2: dataset + business questions'], aptitude: ['Coding-Decoding & Number Series'], business: ['Cases: why is conversion declining? where is GMV leaking?'] },
    resource: { name: 'ChartMogul — SaaS & E-Com Metrics', url: 'https://chartmogul.com/resources/saas-metrics-cheat-sheet/' } },
  { n: 11, month: '2026-11', code: 'W11', title: 'BFSI / FinTech Analytics', primary: 'business', goal: 'Understand credit risk, delinquency, fraud and payment analytics vocabulary and math.',
    topics: ['Transaction & payment success/failure analytics', 'Customer churn', 'Fraud analytics & anomaly patterns', 'Credit risk: PD, LGD, EAD, Expected Loss', 'Delinquency: 30/60/90 DPD, NPA', 'Vintage analysis', 'Net interest margin, portfolio quality', 'Customer LTV & acquisition'],
    lanes: { sql: 2, powerbi: 2, excel: 1, aptitude: 3, python: 4, statistics: 1, project: 4, interview: 1, business: 3 },
    secondary: { python: ['Pandas datetime + EDA + Matplotlib'], project: ['Project 2: Python cleaning pipeline + SQL risk cohorts'], aptitude: ['Syllogisms & Seating Arrangement'], business: ['Cases: default rate rose — which vintage/segment is driving it?'] },
    resource: { name: 'Kaggle — Lending Club / Credit Risk datasets', url: 'https://www.kaggle.com/datasets?search=credit+risk' } },
  { n: 12, month: '2026-11', code: 'W12', title: 'Commercial / Revenue Analytics + Automation', primary: 'business', goal: 'Sales pipeline, MRR/ARR, margin and pricing analytics; automate the boring parts in Python.',
    topics: ['Sales pipeline & conversion', 'Revenue, gross margin, target vs actual', 'CAC, LTV, LTV:CAC, payback', 'MRR / ARR / churn / NRR / GRR', 'Pricing & discount analytics', 'Sales productivity & territory performance', 'Customer segmentation', 'YoY / MoM decomposition'],
    lanes: { sql: 2, powerbi: 2, excel: 1, aptitude: 3, python: 3, statistics: 1, project: 5, interview: 1, business: 3 },
    secondary: { python: ['Automation: CSV/Excel processing script'], project: ['Project 2: Power BI vintage matrix + insights', 'Project 3: dataset + model design'], aptitude: ['Full-length mock #1'], business: ['Cases: revenue dropped 15% — decompose price × volume × mix'] },
    resource: { name: 'ChartMogul — SaaS Metrics Guide', url: 'https://chartmogul.com/resources/' } },
  // ---------------- DECEMBER ----------------
  { n: 13, month: '2026-12', code: 'W13', title: 'Portfolio Sprint — Project 3 + README polish', primary: 'project', goal: 'Ship Project 2, build Project 3 pipeline, write executive READMEs.',
    topics: ['Project 3: SQL revenue model', 'Project 3: Python cleaning', 'Project 3: star schema + DAX', 'Executive README structure', 'Architecture diagram', 'Dashboard GIFs & screenshots', '1-page executive memo', 'Live hosting (Power BI Service / NovyPro)'],
    lanes: { sql: 3, powerbi: 3, excel: 1, aptitude: 3, python: 1, statistics: 0, project: 7, interview: 3, business: 0 },
    secondary: { interview: ['SQL mock: 10 questions', 'Project interview: 60-sec pitch'], aptitude: ['Full-length mock #2 + weak topic drill'], sql: ['Interview set: 10 hard window-function problems'] },
    resource: { name: 'NovyPro — host Power BI publicly', url: 'https://www.novypro.com/' } },
  { n: 14, month: '2026-12', code: 'W14', title: 'Interview Prep Sprint', primary: 'interview', goal: 'Mock every round: SQL, Power BI, Excel, stats, project, HR, business case.',
    topics: ['SQL mock (ranking, gaps, cohorts)', 'Power BI mock (star schema, context, YoY)', 'Excel mock (lookups, pivots, cleaning)', 'Stats mock (p-value, A/B, CI)', 'Project deep-dive mock', 'HR + behavioral (STAR)', 'Business case mock (E-Com + BFSI)', 'Aptitude benchmark test'],
    lanes: { sql: 3, powerbi: 2, excel: 1, aptitude: 3, python: 1, statistics: 1, project: 3, interview: 6, business: 1 },
    secondary: { project: ['Project 3: dashboard + insights + README'], aptitude: ['Benchmark ≥ 80% timed'] },
    resource: { name: 'DataLemur — SQL Interview Questions', url: 'https://datalemur.com/questions' } },
  { n: 15, month: '2026-12', code: 'W15', title: 'Resume + LinkedIn + GitHub Finish', primary: 'interview', goal: 'Zero-friction portfolio: live links, 3 resume versions, LinkedIn done, GitHub polished.',
    topics: ['Resume v1: Retail/E-Com', 'Resume v2: BFSI', 'Resume v3: Commercial', 'ATS keyword pass (PL-300, SQL, DAX, Star Schema)', 'LinkedIn headline / about / featured', 'GitHub READMEs + pinned repos', 'Target company list (50+)', 'Referral outreach templates'],
    lanes: { sql: 2, powerbi: 1, excel: 1, aptitude: 3, python: 0, statistics: 0, project: 4, interview: 5, business: 1, application: 4 },
    secondary: { application: ['Build target list', 'Set up trackers'], project: ['Project 3: SHIP'] },
    resource: { name: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs/' } },
  { n: 16, month: '2026-12', code: 'W16', title: 'Application Launch', primary: 'application', goal: 'First batch out: 5–10 quality applications/day + referral requests.',
    topics: ['Daily application batch (5–10)', 'Referral requests (3/day)', 'Company-specific resume tweaks', 'OA / aptitude practice', 'Follow-up cadence (day 5, day 10)', 'Interview scheduling discipline', 'Weekly SQL + case mock', 'December readiness checklist review'],
    lanes: { sql: 2, powerbi: 1, excel: 1, aptitude: 3, python: 0, statistics: 0, project: 1, interview: 5, business: 1, application: 7 },
    secondary: {},
    resource: { name: 'Naukri', url: 'https://www.naukri.com/' } },
]

// Post-December: repeating job-search week template (weeks 17+)
export const JOB_SEARCH_WEEK = (n, month) => ({
  n, month, code: `W${n}`, title: 'Job Search Sprint', primary: 'application',
  goal: 'Applications + interviews + patch gaps exposed by interviews.',
  topics: ['Application batch (5–10/day)', 'Referral outreach', 'OA practice', 'SQL interview drill', 'Business case drill', 'Project pitch rehearsal', 'Follow-ups', 'Gap-patching from interview feedback'],
  lanes: { sql: 3, powerbi: 1, excel: 1, aptitude: 3, python: 0, statistics: 0, project: 1, interview: 5, business: 2, application: 5 },
  secondary: {},
  resource: { name: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs/' },
})

export const DAY_TEMPLATES = [
  { day: 0, kind: 'Learning', label: 'Learn concept', verb: 'Learn' },
  { day: 1, kind: 'Practice', label: 'Guided exercises', verb: 'Practice' },
  { day: 2, kind: 'Practice', label: 'Business problems', verb: 'Solve business problems on' },
  { day: 3, kind: 'Interview', label: 'Interview questions', verb: 'Answer interview questions on' },
  { day: 4, kind: 'Practice', label: 'Timed practice', verb: 'Timed drill:' },
  { day: 5, kind: 'Project', label: 'Mini-project', verb: 'Mini-project applying' },
  { day: 6, kind: 'Revision', label: 'Revision + test', verb: 'Revise & self-test' },
]

export const READINESS_CHECKLIST = {
  TECHNICAL: ['SQL interview ready', 'Window Functions', 'CTEs', 'Complex joins', 'Power BI ready', 'DAX ready', 'Star Schema', 'Excel ready', 'Statistics ready', 'Python analytics ready'],
  DOMAIN: ['E-Commerce metrics', 'BFSI metrics', 'Commercial metrics', 'Business case analysis'],
  PORTFOLIO: ['3 major projects', 'GitHub polished', 'Live dashboards', 'READMEs', 'Case studies'],
  CAREER: ['Resume', 'LinkedIn', 'Job trackers', 'Target company list', 'Applications started'],
  INTERVIEW: ['SQL mock', 'Power BI mock', 'Excel mock', 'Project mock', 'HR mock', 'Business case mock', 'Aptitude benchmark'],
}
