// Resources, job platforms, target companies, metrics vault, stats concepts, daily challenges

export const RESOURCES = [
  { id: 'r1', name: 'Mode SQL Tutorial', skill: 'sql', type: 'Course', difficulty: 'Beginner→Advanced', url: 'https://mode.com/sql-tutorial/', why: 'Analyst-first SQL with window functions and live editor' },
  { id: 'r2', name: 'DataLemur', skill: 'sql', type: 'Practice', difficulty: 'Easy→Hard', url: 'https://datalemur.com/questions', why: 'Real SQL interview questions from tech companies' },
  { id: 'r3', name: 'StrataScratch', skill: 'sql', type: 'Practice', difficulty: 'Medium', url: 'https://platform.stratascratch.com/coding', why: 'Multi-table analytics problems closest to real job' },
  { id: 'r4', name: 'LeetCode SQL 50', skill: 'sql', type: 'Practice', difficulty: 'Easy→Medium', url: 'https://leetcode.com/studyplan/top-sql-50/', why: 'Timed syntax drilling' },
  { id: 'r5', name: 'techTFQ (YouTube)', skill: 'sql', type: 'Video', difficulty: 'Intermediate', url: 'https://www.youtube.com/@techTFQ', why: 'Whiteboard breakdowns of complex SQL interview questions' },
  { id: 'r6', name: 'Luke Barousse — SQL for Data Analytics', skill: 'sql', type: 'Video', difficulty: 'Beginner', url: 'https://www.youtube.com/watch?v=7mz73uXD9DA', why: '4-hour project-based SQL walkthrough' },
  { id: 'r7', name: 'Alex The Analyst', skill: 'project', type: 'Video', difficulty: 'Beginner→Intermediate', url: 'https://www.youtube.com/@AlexTheAnalyst', why: 'End-to-end project walkthroughs SQL → Power BI' },
  { id: 'r8', name: 'SQLBI — Introducing DAX', skill: 'powerbi', type: 'Course', difficulty: 'Intermediate', url: 'https://www.sqlbi.com/p/introducing-dax-video-course/', why: 'The global authority on DAX' },
  { id: 'r9', name: 'SQLBI — DAX Patterns', skill: 'powerbi', type: 'Reference', difficulty: 'Advanced', url: 'https://www.daxpatterns.com/', why: 'Time intelligence, ABC, cohorts, ready patterns' },
  { id: 'r10', name: 'Microsoft Learn — PL-300 path', skill: 'powerbi', type: 'Course', difficulty: 'Intermediate', url: 'https://learn.microsoft.com/en-us/credentials/certifications/power-bi-data-analyst-associate/', why: 'Official Power BI Data Analyst certification path' },
  { id: 'r11', name: 'ExcelIsFun (YouTube)', skill: 'excel', type: 'Video', difficulty: 'All', url: 'https://www.youtube.com/@excelisfun', why: 'Data Analysis playlists: Power Query & Pivots' },
  { id: 'r12', name: 'Microsoft Learn — Excel', skill: 'excel', type: 'Course', difficulty: 'Beginner', url: 'https://support.microsoft.com/en-us/excel', why: 'Official function references' },
  { id: 'r13', name: 'IndiaBix', skill: 'aptitude', type: 'Practice', difficulty: 'All', url: 'https://www.indiabix.com/', why: 'Standard Indian placement question bank' },
  { id: 'r14', name: 'PrepInsta', skill: 'aptitude', type: 'Practice', difficulty: 'All', url: 'https://prepinsta.com/', why: 'Company-specific aptitude papers' },
  { id: 'r15', name: 'CareerRide (YouTube)', skill: 'aptitude', type: 'Video', difficulty: 'All', url: 'https://www.youtube.com/@CareerRideOfficial', why: 'Concept + shortcut tutorials' },
  { id: 'r16', name: 'ChartMogul — SaaS Metrics', skill: 'business', type: 'Reference', difficulty: 'Intermediate', url: 'https://chartmogul.com/resources/', why: 'Every revenue and churn metric explained' },
  { id: 'r17', name: 'StatQuest (YouTube)', skill: 'statistics', type: 'Video', difficulty: 'Beginner→Intermediate', url: 'https://www.youtube.com/@statquest', why: 'Intuitive statistics' },
  { id: 'r18', name: 'Khan Academy — Statistics', skill: 'statistics', type: 'Course', difficulty: 'Beginner', url: 'https://www.khanacademy.org/math/statistics-probability', why: 'Practice problems with feedback' },
  { id: 'r19', name: 'Kaggle — Learn Pandas', skill: 'python', type: 'Course', difficulty: 'Beginner', url: 'https://www.kaggle.com/learn/pandas', why: 'Hands-on Pandas in browser' },
  { id: 'r20', name: 'Pandas docs — 10 minutes', skill: 'python', type: 'Reference', difficulty: 'Beginner', url: 'https://pandas.pydata.org/docs/user_guide/10min.html', why: 'Official quick reference' },
  { id: 'r21', name: 'Kaggle Datasets', skill: 'project', type: 'Data', difficulty: 'All', url: 'https://www.kaggle.com/datasets', why: 'Realistic project datasets' },
  { id: 'r22', name: 'data.gov.in', skill: 'project', type: 'Data', difficulty: 'All', url: 'https://data.gov.in/', why: 'Indian public datasets' },
  { id: 'r23', name: 'Awesome Public Datasets (GitHub)', skill: 'project', type: 'Data', difficulty: 'All', url: 'https://github.com/awesomedata/awesome-public-datasets', why: 'Curated dataset index' },
  { id: 'r24', name: 'NovyPro', skill: 'project', type: 'Tool', difficulty: 'All', url: 'https://www.novypro.com/', why: 'Host Power BI dashboards publicly' },
  { id: 'r25', name: 'HackerRank SQL', skill: 'sql', type: 'Practice', difficulty: 'Easy→Hard', url: 'https://www.hackerrank.com/domains/sql', why: 'OA-style SQL practice' },
  { id: 'r26', name: 'NeetCode — Arrays & Hashing', skill: 'dsa', type: 'Practice', difficulty: 'Easy', url: 'https://neetcode.io/roadmap', why: 'Only the Arrays/Hashing/Two-pointer sections' },
]

export const JOB_PLATFORMS = [
  { name: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs/search/?keywords=data%20analyst&location=India', note: 'Filter: Entry level, Past week' },
  { name: 'Naukri', url: 'https://www.naukri.com/data-analyst-jobs', note: 'Fresher filters + recruiter DMs' },
  { name: 'Indeed', url: 'https://in.indeed.com/jobs?q=data+analyst+fresher', note: '' },
  { name: 'Wellfound', url: 'https://wellfound.com/role/l/data-analyst/india', note: 'Startups' },
  { name: 'Internshala', url: 'https://internshala.com/internships/data-analytics-internship/', note: 'Internships + fresher jobs' },
  { name: 'Unstop', url: 'https://unstop.com/jobs', note: 'Campus drives, hackathons' },
  { name: 'Foundit', url: 'https://www.foundit.in/srp/results?query=data%20analyst', note: '' },
  { name: 'Cutshort', url: 'https://cutshort.io/jobs/data-analyst-jobs', note: 'Startups' },
  { name: 'Glassdoor', url: 'https://www.glassdoor.co.in/Job/india-data-analyst-jobs-SRCH_IL.0,5_IN115_KO6,18.htm', note: 'Salary + interview reviews' },
  { name: 'Instahyre', url: 'https://www.instahyre.com/', note: 'Product companies' },
]

export const JOB_CATEGORIES = ['E-Commerce', 'Retail', 'Quick Commerce', 'BFSI', 'FinTech', 'GCC', 'Consulting', 'Analytics Firms', 'SaaS', 'Startups']

// Target companies: real companies with real career pages. No fake vacancies — these are discovery links.
const c = (id, name, category, roles, career, linkedin, priority = 'MEDIUM') => ({ id, name, category, roles, career, linkedin, priority })
export const COMPANIES = [
  c('c1', 'Flipkart', 'Retail / E-Commerce', ['Business Analyst', 'Data Analyst'], 'https://www.flipkartcareers.com/', 'https://www.linkedin.com/company/flipkart/jobs/', 'HIGH'),
  c('c2', 'Amazon India', 'Retail / E-Commerce', ['Business Analyst', 'BIE'], 'https://www.amazon.jobs/en/search?base_query=business+analyst&loc_query=India', 'https://www.linkedin.com/company/amazon/jobs/', 'HIGH'),
  c('c3', 'Meesho', 'Retail / E-Commerce', ['Business Analyst', 'Category Analyst'], 'https://www.meesho.io/jobs', 'https://www.linkedin.com/company/meesho/jobs/', 'HIGH'),
  c('c4', 'Myntra', 'Retail / E-Commerce', ['Business Analyst'], 'https://careers.myntra.com/', 'https://www.linkedin.com/company/myntra/jobs/', 'MEDIUM'),
  c('c5', 'Nykaa', 'Retail / E-Commerce', ['Data Analyst', 'Category Analyst'], 'https://www.nykaa.com/careers', 'https://www.linkedin.com/company/nykaa/jobs/', 'MEDIUM'),
  c('c6', 'Zepto', 'Retail / E-Commerce', ['Business Analyst', 'Ops Analyst'], 'https://www.zeptonow.com/careers', 'https://www.linkedin.com/company/zeptonow/jobs/', 'HIGH'),
  c('c7', 'Blinkit', 'Retail / E-Commerce', ['Business Analyst'], 'https://blinkit.com/careers', 'https://www.linkedin.com/company/blinkit/jobs/', 'MEDIUM'),
  c('c8', 'Swiggy', 'Retail / E-Commerce', ['Business Analyst', 'Data Analyst'], 'https://careers.swiggy.com/', 'https://www.linkedin.com/company/swiggy-in/jobs/', 'HIGH'),
  c('c9', 'Reliance Retail / Ajio', 'Retail / E-Commerce', ['Business Analyst'], 'https://careers.ril.com/', 'https://www.linkedin.com/company/reliance-retail/jobs/', 'MEDIUM'),
  c('c10', 'Tata Digital / BigBasket', 'Retail / E-Commerce', ['Data Analyst'], 'https://www.bigbasket.com/careers/', 'https://www.linkedin.com/company/bigbasket/jobs/', 'MEDIUM'),
  c('c11', 'PhonePe', 'BFSI / FinTech', ['Business Analyst', 'Risk Analyst'], 'https://www.phonepe.com/careers/', 'https://www.linkedin.com/company/phonepe/jobs/', 'HIGH'),
  c('c12', 'Razorpay', 'BFSI / FinTech', ['Business Analyst', 'Risk Analyst'], 'https://razorpay.com/jobs/', 'https://www.linkedin.com/company/razorpay/jobs/', 'HIGH'),
  c('c13', 'Paytm', 'BFSI / FinTech', ['Data Analyst'], 'https://paytm.com/careers', 'https://www.linkedin.com/company/paytm/jobs/', 'MEDIUM'),
  c('c14', 'CRED', 'BFSI / FinTech', ['Business Analyst'], 'https://careers.cred.club/', 'https://www.linkedin.com/company/cred-club/jobs/', 'MEDIUM'),
  c('c15', 'Navi', 'BFSI / FinTech', ['Credit Risk Analyst', 'Business Analyst'], 'https://navi.com/careers', 'https://www.linkedin.com/company/navi-technologies/jobs/', 'MEDIUM'),
  c('c16', 'HDFC Bank', 'BFSI / FinTech', ['Analyst — Analytics', 'Credit Risk'], 'https://www.hdfcbank.com/personal/about-us/careers', 'https://www.linkedin.com/company/hdfc-bank/jobs/', 'HIGH'),
  c('c17', 'ICICI Bank', 'BFSI / FinTech', ['Analyst — Business Intelligence'], 'https://www.icicicareers.com/', 'https://www.linkedin.com/company/icici-bank/jobs/', 'HIGH'),
  c('c18', 'Axis Bank', 'BFSI / FinTech', ['Analyst — Analytics'], 'https://www.axisbank.com/careers', 'https://www.linkedin.com/company/axis-bank/jobs/', 'MEDIUM'),
  c('c19', 'Kotak Mahindra Bank', 'BFSI / FinTech', ['Business Analyst'], 'https://www.kotak.com/en/careers.html', 'https://www.linkedin.com/company/kotak-mahindra-bank/jobs/', 'MEDIUM'),
  c('c20', 'Bajaj Finserv', 'BFSI / FinTech', ['Data Analyst', 'Risk Analyst'], 'https://www.bajajfinserv.in/careers', 'https://www.linkedin.com/company/bajaj-finserv/jobs/', 'HIGH'),
  c('c21', 'American Express (GCC)', 'GCC', ['Analyst — Risk / Marketing Analytics'], 'https://www.americanexpress.com/en-in/careers/', 'https://www.linkedin.com/company/american-express/jobs/', 'HIGH'),
  c('c22', 'JPMorgan Chase (GCC)', 'GCC', ['Analyst — Data & Analytics'], 'https://careers.jpmorgan.com/in/en/students/programs', 'https://www.linkedin.com/company/jpmorganchase/jobs/', 'HIGH'),
  c('c23', 'Wells Fargo India', 'GCC', ['Analytics Consultant'], 'https://www.wellsfargojobs.com/en/jobs/?search=analytics&location=India', 'https://www.linkedin.com/company/wellsfargo/jobs/', 'MEDIUM'),
  c('c24', 'Walmart Global Tech', 'GCC', ['Data Analyst'], 'https://careers.walmart.com/', 'https://www.linkedin.com/company/walmartglobaltech/jobs/', 'MEDIUM'),
  c('c25', 'Target India', 'GCC', ['Analyst — Merchandising / Supply Chain'], 'https://india.target.com/', 'https://www.linkedin.com/company/target/jobs/', 'MEDIUM'),
  c('c26', 'Lowe\'s India', 'GCC', ['Analyst — Retail Analytics'], 'https://careers.lowes.com/', 'https://www.linkedin.com/company/lowes-india/jobs/', 'MEDIUM'),
  c('c27', 'Tesco Bengaluru', 'GCC', ['Analyst — Commercial'], 'https://www.tesco-careers.com/', 'https://www.linkedin.com/company/tesco-bengaluru/jobs/', 'MEDIUM'),
  c('c28', 'Deloitte', 'Consulting', ['Analyst — Analytics & Cognitive'], 'https://www2.deloitte.com/in/en/careers.html', 'https://www.linkedin.com/company/deloitte/jobs/', 'MEDIUM'),
  c('c29', 'EY GDS', 'Consulting', ['Analyst — Data & Analytics'], 'https://careers.ey.com/ey/', 'https://www.linkedin.com/company/ernstandyoung/jobs/', 'MEDIUM'),
  c('c30', 'KPMG India', 'Consulting', ['Analyst — Lighthouse'], 'https://kpmg.com/in/en/home/careers.html', 'https://www.linkedin.com/company/kpmg-india/jobs/', 'LOW'),
  c('c31', 'ZS Associates', 'Consulting', ['Business Analyst'], 'https://www.zs.com/careers', 'https://www.linkedin.com/company/zs-associates/jobs/', 'MEDIUM'),
  c('c32', 'Fractal Analytics', 'Analytics Companies', ['Analyst / Data Analyst'], 'https://fractal.ai/careers/', 'https://www.linkedin.com/company/fractal-analytics/jobs/', 'HIGH'),
  c('c33', 'Mu Sigma', 'Analytics Companies', ['Trainee Decision Scientist'], 'https://www.mu-sigma.com/careers', 'https://www.linkedin.com/company/mu-sigma-inc/jobs/', 'MEDIUM'),
  c('c34', 'LatentView Analytics', 'Analytics Companies', ['Analyst'], 'https://www.latentview.com/careers/', 'https://www.linkedin.com/company/latentview-analytics/jobs/', 'HIGH'),
  c('c35', 'Tiger Analytics', 'Analytics Companies', ['Analyst'], 'https://www.tigeranalytics.com/careers/', 'https://www.linkedin.com/company/tiger-analytics/jobs/', 'HIGH'),
  c('c36', 'Tredence', 'Analytics Companies', ['Analyst'], 'https://www.tredence.com/careers', 'https://www.linkedin.com/company/tredence/jobs/', 'MEDIUM'),
  c('c37', 'EXL Service', 'Analytics Companies', ['Analytics Consultant'], 'https://www.exlservice.com/careers', 'https://www.linkedin.com/company/exl-service/jobs/', 'MEDIUM'),
  c('c38', 'Genpact', 'Analytics Companies', ['Business Analyst'], 'https://www.genpact.com/careers', 'https://www.linkedin.com/company/genpact/jobs/', 'LOW'),
  c('c39', 'Freshworks', 'SaaS', ['Revenue Analyst', 'Business Analyst'], 'https://www.freshworks.com/company/careers/', 'https://www.linkedin.com/company/freshworks-inc/jobs/', 'MEDIUM'),
  c('c40', 'Zoho', 'SaaS', ['Business Analyst'], 'https://www.zoho.com/careers/', 'https://www.linkedin.com/company/zoho/jobs/', 'MEDIUM'),
  c('c41', 'Chargebee', 'SaaS', ['Revenue Operations Analyst'], 'https://www.chargebee.com/careers/', 'https://www.linkedin.com/company/chargebee/jobs/', 'MEDIUM'),
  c('c42', 'Postman', 'SaaS', ['Data Analyst'], 'https://www.postman.com/company/careers/', 'https://www.linkedin.com/company/postman-platform/jobs/', 'LOW'),
]

export const COMPANY_CATEGORIES = ['Retail / E-Commerce', 'BFSI / FinTech', 'GCC', 'Consulting', 'Analytics Companies', 'SaaS']

// Metrics vault — seed notes (user can add/edit)
const m = (id, template, title, formula, domain, interp, iq) => ({ id, template, title, formula, domain, interp, iq, tags: [domain], createdAt: '2026-08-31', seeded: true })
export const SEED_NOTES = [
  m('n1', 'E-Commerce Metric', 'Average Order Value (AOV)', 'Revenue / Orders', 'E-Commerce', 'How much a customer spends per transaction. Rising AOV with flat orders = upsell/bundling working; falling AOV with discounting = margin risk.', 'If AOV rose 12% but revenue fell, what happened?'),
  m('n2', 'E-Commerce Metric', 'Conversion Rate (CVR)', 'Orders / Sessions', 'E-Commerce', 'Share of visits that buy. Segment by device, source, new vs repeat before reacting to a drop.', 'CVR dropped 0.6 pts — what do you check first?'),
  m('n3', 'E-Commerce Metric', 'Cart Abandonment Rate', '1 − (Orders / Carts Created)', 'E-Commerce', 'Friction at checkout: shipping cost surprise, payment failures, login walls. Multiply abandoned carts × AOV = lost GMV.', 'How would you quantify the revenue impact of abandonment?'),
  m('n4', 'E-Commerce Metric', 'GMV vs Revenue', 'GMV = Σ order value before returns/discounts; Revenue = net after cancellations, returns, discounts (or take-rate for marketplaces)', 'E-Commerce', 'GMV is vanity if returns and discounts eat it. Leadership tracks net revenue and contribution margin.', 'Why can GMV grow while revenue shrinks?'),
  m('n5', 'E-Commerce Metric', 'Customer Acquisition Cost (CAC)', 'Marketing spend / New customers acquired', 'E-Commerce', 'Compare with LTV; LTV:CAC ≥ 3 is a healthy heuristic. Segment by channel.', 'CAC rose 30% — which channels would you cut?'),
  m('n6', 'E-Commerce Metric', 'Customer Lifetime Value (LTV)', 'AOV × Purchase frequency × Gross margin × Customer lifespan', 'E-Commerce', 'What a customer is worth over their relationship; drives how much you can pay to acquire.', 'How would you estimate LTV with 6 months of data?'),
  m('n7', 'E-Commerce Metric', 'ROAS', 'Revenue attributed to ads / Ad spend', 'E-Commerce', 'Channel efficiency; beware attribution windows and incrementality.', 'ROAS is 5× but profit is falling. Why?'),
  m('n8', 'E-Commerce Metric', 'Repeat Purchase Rate', 'Customers with ≥2 orders / Total customers', 'E-Commerce', 'Retention proxy; combine with cohort curves.', 'Difference between repeat rate and cohort retention?'),
  m('n9', 'E-Commerce Metric', 'Inventory Turnover', 'COGS / Average inventory', 'E-Commerce', 'How fast stock sells; low turnover = cash locked; high with stockouts = lost sales.', 'How do stockouts hide in a turnover metric?'),
  m('n10', 'BFSI Metric', 'Days Past Due (DPD) buckets', 'Current / 1–29 / 30+ / 60+ / 90+ (NPA at 90+ in India)', 'BFSI', 'Delinquency staging; roll rates between buckets show portfolio deterioration early.', 'What is a roll rate and why track 30→60?'),
  m('n11', 'BFSI Metric', 'Expected Loss (EL)', 'EL = PD × LGD × EAD', 'BFSI', 'PD: probability of default; LGD: share lost given default; EAD: exposure at default. Used for provisioning and pricing risk.', 'Explain EL to a non-finance stakeholder.'),
  m('n12', 'BFSI Metric', 'Gross & Net NPA', 'Gross NPA = NPA loans / Total advances; Net NPA = (NPA − provisions) / (Advances − provisions)', 'BFSI', 'Asset quality; rising GNPA in a vintage points to origination quality.', 'Why can Net NPA fall while Gross NPA rises?'),
  m('n13', 'BFSI Metric', 'Net Interest Margin (NIM)', '(Interest income − Interest expense) / Average earning assets', 'BFSI', 'Core profitability of lending; trade-off with risk appetite.', 'How does tightening credit affect NIM?'),
  m('n14', 'BFSI Metric', 'Payment Success Rate', 'Successful txns / Attempted txns', 'BFSI', 'Split technical declines vs business declines; segment by PSP, bank, hour, app version.', 'Success rate fell 3 pts overnight — approach?'),
  m('n15', 'BFSI Metric', 'Vintage Analysis', 'Cumulative default % by origination cohort × months on book', 'BFSI', 'Separates origination quality from macro shocks: if only new vintages deteriorate, underwriting is the problem.', 'What would macro-driven vs origination-driven default look like?'),
  m('n16', 'Business Metric', 'MRR / ARR', 'MRR = Σ active monthly subscription value; ARR = MRR × 12', 'Commercial', 'Decompose into New, Expansion, Contraction, Churned MRR every month.', 'Net new MRR is positive but ARR growth is slowing. Why?'),
  m('n17', 'Business Metric', 'Net Revenue Retention (NRR)', '(Start MRR + Expansion − Contraction − Churn) / Start MRR', 'Commercial', '> 100% means existing customers grow without new sales. GRR excludes expansion.', 'NRR 110% but GRR 80% — interpret.'),
  m('n18', 'Business Metric', 'Gross Margin', '(Revenue − COGS) / Revenue', 'Commercial', 'Decompose changes into price, mix and cost.', 'Revenue up, GM% down — likely causes?'),
  m('n19', 'Business Metric', 'Pipeline Conversion & Velocity', 'Stage-to-stage win %; Velocity = (Opps × Win rate × Deal size) / Cycle length', 'Commercial', 'Forecasting and rep productivity.', 'Pipeline grew 40% but bookings flat — why?'),
  m('n20', 'Business Metric', 'CAC Payback Period', 'CAC / (ARPU × Gross margin)', 'Commercial', 'Months to recover acquisition cost; < 12 months healthy for SMB SaaS.', 'How does churn interact with payback?'),
  m('n21', 'SQL Concept', 'Window frame ROWS BETWEEN', 'AGG(col) OVER (PARTITION BY p ORDER BY o ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)', 'SQL', 'Defines which rows the window aggregates; ROWS = physical rows, RANGE = value range. Needs a date spine for true 7-day windows.', 'Difference between ROWS and RANGE?'),
  m('n22', 'DAX Concept', 'CALCULATE & context transition', 'CALCULATE(<expr>, <filters…>)', 'Power BI', 'CALCULATE modifies filter context; inside a row context it converts the row into an equivalent filter (context transition).', 'Why does SUMX(Sales, [Measure]) behave differently from SUMX(Sales, Sales[Amount])?'),
  m('n23', 'Statistics Concept', 'p-value', 'P(data at least this extreme | H0 true)', 'Statistics', 'Small p → data unlikely under "no effect". Not the probability H0 is true; always pair with effect size and CI.', 'Explain p-value to a manager in two sentences.'),
]

export const NOTE_TEMPLATES = ['SQL Concept', 'DAX Concept', 'Excel Formula', 'Business Metric', 'E-Commerce Metric', 'BFSI Metric', 'Statistics Concept', 'Interview Question', 'Business Case']

export const STATS_CONCEPTS = [
  { id: 'mean', name: 'Mean / Median / Mode', means: 'Central tendency: average, middle value, most frequent value.', formula: 'Mean = Σx / n', when: 'Summarizing order value, delivery times, ticket sizes.', example: 'Median order value ₹640 vs mean ₹910 → a few large orders skew the average; report median for typical customer.', iq: 'When do you prefer median over mean?' },
  { id: 'sd', name: 'Variance & Standard Deviation', means: 'How spread out values are around the mean.', formula: 'σ = √(Σ(x−μ)² / n)', when: 'Volatility of daily sales, consistency of delivery SLA, anomaly thresholds (z-score).', example: 'Daily GMV σ = ₹2L; a day 3σ below mean flags an outage.', iq: 'What is a z-score and how would you use it for fraud flags?' },
  { id: 'pct', name: 'Percentiles', means: 'Value below which a % of observations fall.', formula: 'P90 = value at 90th rank position', when: 'SLA reporting (P95 delivery time), customer segmentation (top 10% spenders).', example: 'P95 checkout latency 6.2s explains abandonment better than the 1.8s mean.', iq: 'Why report P95 latency instead of average?' },
  { id: 'dist', name: 'Distributions (Normal, Binomial, Skew)', means: 'Shape of how values occur.', formula: 'Normal: 68/95/99.7 rule', when: 'Choosing tests, setting control limits, understanding long-tailed revenue.', example: 'Customer LTV is right-skewed: top 5% drive 40% of revenue.', iq: 'What does right-skewed revenue imply for averages?' },
  { id: 'prob', name: 'Probability basics', means: 'Likelihood of events; conditional probability.', formula: 'P(A|B) = P(A∩B) / P(B)', when: 'Default probability, churn likelihood, fraud base rates.', example: 'P(default | score<650) = 9% vs 2% overall.', iq: 'Fraud is 0.1% of txns; a flag with 99% accuracy — why are most flags false?' },
  { id: 'sampling', name: 'Sampling & Central Limit Theorem', means: 'Sample means approach normal as n grows.', formula: 'SE = σ / √n', when: 'Surveys, A/B tests, sizing experiments.', example: 'Need ~4k users per arm to detect a 0.5-pt CVR lift.', iq: 'Why does CLT matter for A/B testing?' },
  { id: 'ci', name: 'Confidence Intervals', means: 'Range that likely contains the true value.', formula: 'x̄ ± z × SE', when: 'Reporting uncertainty in conversion, NPS, default rates.', example: 'CVR 3.1% ± 0.3% (95% CI).', iq: 'What does 95% confidence actually mean?' },
  { id: 'hyp', name: 'Hypothesis Testing & p-value', means: 'Decide if an observed difference is beyond chance.', formula: 'p = P(data ≥ observed | H0)', when: 'A/B tests, before/after campaign checks.', example: 'New checkout: CVR 3.4% vs 3.1%, p = 0.02 → ship.', iq: 'Explain p-value to a manager.' },
  { id: 'corr', name: 'Correlation & Covariance', means: 'Strength/direction of linear relationship.', formula: 'r = cov(x,y) / (σx σy)', when: 'Finding drivers: discount depth vs return rate.', example: 'r = 0.62 between delivery delay and cancellation.', iq: 'Correlation vs causation with a business example.' },
  { id: 'ab', name: 'A/B Testing', means: 'Controlled experiment comparing variants.', formula: 'Sample size ∝ σ² / MDE²', when: 'Any product/pricing/UI decision.', example: 'Free-shipping threshold test lifted AOV 8%, CVR flat.', iq: 'How do you avoid peeking bias?' },
  { id: 'reg', name: 'Regression (interpretation)', means: 'Model outcome as function of drivers.', formula: 'y = β0 + β1x1 + … + ε', when: 'Driver analysis: what moves revenue/default.', example: 'β for delivery time = −0.4 pts CVR per extra day.', iq: 'Interpret a coefficient and its p-value.' },
]

export const SQL_CHALLENGES = [
  { q: 'Find the second highest revenue-generating customer in each region.', hint: 'DENSE_RANK over region partition.' },
  { q: 'Compute 7-day rolling average of daily orders.', hint: 'AVG OVER ROWS BETWEEN 6 PRECEDING AND CURRENT ROW; date spine.' },
  { q: 'Find users whose second purchase happened within 7 days of their first.', hint: 'ROW_NUMBER + LEAD.' },
  { q: 'Month-over-month revenue growth % per category.', hint: 'Aggregate then LAG.' },
  { q: 'Cart abandonment rate by device for last 30 days.', hint: 'Conditional aggregation on event type.' },
  { q: 'Top 3 products per category by revenue with ties.', hint: 'DENSE_RANK ≤ 3.' },
  { q: 'Customers who bought in Jan but not in Feb (churned).', hint: 'LEFT JOIN … IS NULL or EXCEPT.' },
  { q: 'Cumulative revenue by day and % of monthly total.', hint: 'SUM OVER ORDER BY + SUM OVER PARTITION BY month.' },
  { q: 'Loans that rolled from 30 DPD to 60 DPD next month.', hint: 'LAG on dpd_bucket partition by loan.' },
  { q: 'Sessionize events with 30-min inactivity gap.', hint: 'LAG(ts) diff > 30 min → new session flag → SUM OVER.' },
  { q: 'Median order value per city.', hint: 'PERCENTILE_CONT(0.5) WITHIN GROUP.' },
  { q: 'First and last purchase category per customer.', hint: 'FIRST_VALUE / LAST_VALUE with frame.' },
  { q: 'Payment success rate by hour of day and bank.', hint: 'AVG(CASE WHEN status=\'success\' THEN 1 ELSE 0 END).' },
  { q: 'Consecutive-day active users (streaks).', hint: 'date − ROW_NUMBER trick.' },
]

export const DAX_CHALLENGES = [
  { q: 'Write a YoY Revenue Growth % measure.', hint: 'SAMEPERIODLASTYEAR + DIVIDE.' },
  { q: 'Revenue % of total by category ignoring slicers on category.', hint: 'CALCULATE([Revenue], ALL(Product[Category])).' },
  { q: 'Rolling 3-month revenue.', hint: 'DATESINPERIOD(…, MAX(Date[Date]), -3, MONTH).' },
  { q: 'Distinct customers who ordered more than once.', hint: 'COUNTROWS(FILTER(VALUES(Customer[Id]), [Orders] > 1)).' },
  { q: 'MoM change with a missing-month-safe denominator.', hint: 'DATEADD(-1, MONTH) + DIVIDE with blank handling.' },
  { q: 'Lost GMV = abandoned carts × AOV.', hint: 'Separate measures; AOV = DIVIDE([Revenue],[Orders]).' },
  { q: 'Rank categories by revenue within a region.', hint: 'RANKX(ALL(Product[Category]), [Revenue]).' },
  { q: 'Cumulative revenue YTD.', hint: 'TOTALYTD([Revenue], Date[Date]).' },
  { q: 'Default rate where DPD ≥ 90 by vintage.', hint: 'DIVIDE(CALCULATE(COUNTROWS(Loans), Loans[DPD] >= 90), COUNTROWS(Loans)).' },
  { q: 'Same measure but keep an existing slicer on Region.', hint: 'KEEPFILTERS.' },
]

export const EXCEL_CHALLENGES = [
  'Build a SUMIFS revenue table by region × month from a raw orders sheet.',
  'XLOOKUP product cost into orders and compute margin %.',
  'Clean a messy customer export: TRIM, PROPER, dates as dates, remove duplicates.',
  'Pivot: orders by category with % of column total and running total.',
  'Power Query: append 3 monthly files and unpivot months to rows.',
  'Scenario sheet: revenue at +1/+2/+3 pts conversion using data tables.',
  'Conditional formatting heat map of target vs actual by rep.',
  'INDEX/MATCH two-way lookup for price by product × tier.',
]

export const LINKEDIN_WEEKLY = ['Connect with 10 analysts / alumni', 'Message 3 alumni for referrals or advice', 'Follow 5 target companies', 'Comment thoughtfully on 5 analytics posts', 'Publish 1 project insight post']
export const LINKEDIN_CHECKLIST = ['Headline: "Analytics Candidate (2027) | SQL • Power BI • Excel | Retail / BFSI / Commercial"', 'About: problem → skills → projects with numbers → what you\'re looking for', 'Featured: 3 project links (live dashboards)', 'GitHub link in contact info', 'Power BI portfolio link', 'Skills section: SQL, Power BI, DAX, Excel, Python, Statistics', 'Custom URL', 'Open to work (recruiters only)', 'Banner image with project visual']
export const ATS_CHECKLIST = ['One page, single column, no tables/graphics', 'Keywords: SQL, Power BI, DAX, Star Schema, Excel, Power Query, Python, Pandas, Statistics', 'Live dashboard links at the top of each project', 'Every bullet has a metric (₹, %, rows)', 'Verbs: analyzed, built, quantified, recommended', 'No "responsible for" / soft filler', 'Contact: LinkedIn + GitHub + portfolio', 'PDF named Firstname_Lastname_Analytics_Resume.pdf', 'CGPA stated', 'Domain keywords for the version (GMV/AOV vs NPA/DPD vs MRR/NRR)']
export const IMPACT_STATEMENTS = ['Analyzed 2.1M clickstream events with SQL window functions to reconstruct sessions and identify a 32% drop-off at payment, quantifying ₹X lakh/month lost GMV.', 'Built a star-schema Power BI model with 25+ DAX measures (YoY, rolling, Lost GMV) and a what-if simulator used to prioritize checkout fixes.', 'Engineered a Pandas cleaning pipeline over 500k loan records and vintage-cohort SQL to isolate origination quarters driving 90-DPD defaults.', 'Decomposed net ARR stagnation into New/Expansion/Contraction/Churned MRR and recommended a retention play for the plan with highest churn hazard.']
