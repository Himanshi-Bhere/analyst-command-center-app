// Interview question bank. Confidence and answers are stored in state keyed by id.
const q = (id, tab, topic, difficulty, question, ideal) => ({ id, tab, topic, difficulty, question, ideal })

export const INTERVIEW_TABS = ['SQL', 'Power BI', 'Excel', 'Statistics', 'Python', 'Business Cases', 'Project', 'HR', 'Behavioral', 'BFSI Cases', 'E-Commerce Cases']

export const QUESTIONS = [
  // SQL
  q('sq1', 'SQL', 'Window Functions', 'Medium', 'Explain the difference between ROW_NUMBER, RANK and DENSE_RANK.', 'ROW_NUMBER gives unique sequential numbers even for ties. RANK gives the same rank to ties and skips the next ranks (1,2,2,4). DENSE_RANK gives the same rank to ties without gaps (1,2,2,3). Use ROW_NUMBER for deduplication, DENSE_RANK for "top-N distinct values".'),
  q('sq2', 'SQL', 'Window Functions', 'Medium', 'How would you compute a 7-day rolling average of daily revenue?', 'AVG(revenue) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW). Mention that missing dates must be filled with a calendar/date spine first, otherwise "7 rows" ≠ "7 days".'),
  q('sq3', 'SQL', 'Window Functions', 'Hard', 'Find the time between each user\'s first and second purchase.', 'Use ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY order_ts) to label purchases, then either self-join rn=1 to rn=2, or use LEAD(order_ts) OVER (PARTITION BY user_id ORDER BY order_ts) and filter rn = 1.'),
  q('sq4', 'SQL', 'Joins', 'Easy', 'What is the difference between WHERE and HAVING?', 'WHERE filters rows before aggregation; HAVING filters groups after GROUP BY. You cannot reference aggregates in WHERE.'),
  q('sq5', 'SQL', 'Joins', 'Medium', 'A LEFT JOIN returned more rows than the left table. Why?', 'Fan-out: the right table has multiple matches per key (one-to-many). Fix by pre-aggregating the right table in a CTE or deduplicating on the join key.'),
  q('sq6', 'SQL', 'CTEs', 'Medium', 'When would you use a CTE instead of a subquery?', 'For readability and modular multi-step logic, when the same intermediate result is referenced twice, and for recursion. Performance is usually equivalent; CTEs can be materialized in some engines.'),
  q('sq7', 'SQL', 'Business SQL', 'Medium', 'Find the second highest revenue-generating customer in each region.', 'CTE with DENSE_RANK() OVER (PARTITION BY region ORDER BY SUM(revenue) DESC) after grouping by region, customer; then filter rank = 2. Discuss ties: DENSE_RANK vs ROW_NUMBER.'),
  q('sq8', 'SQL', 'Business SQL', 'Hard', 'Compute month-over-month revenue growth % per product category.', 'Aggregate to category-month in a CTE, then LAG(revenue) OVER (PARTITION BY category ORDER BY month). Growth = (rev - prev) / NULLIF(prev,0). Note a date spine to handle months with zero sales.'),
  q('sq9', 'SQL', 'NULLs', 'Easy', 'How do NULLs behave in COUNT(*), COUNT(col), and AVG?', 'COUNT(*) counts all rows; COUNT(col) ignores NULLs; AVG ignores NULLs in both numerator and denominator. NULL = NULL is unknown; use IS NULL / COALESCE.'),
  q('sq10', 'SQL', 'Business SQL', 'Hard', 'Build a monthly cohort retention table from an orders table.', 'CTE 1: first order month per user (MIN). CTE 2: join orders back, compute months_since = month diff. Group by cohort_month, months_since → COUNT(DISTINCT user). Retention % = count / cohort size (window: FIRST_VALUE or join back to months_since = 0).'),
  q('sq11', 'SQL', 'Data Modeling', 'Easy', 'What is a primary key vs foreign key?', 'PK uniquely identifies a row in its table; FK references a PK in another table to enforce relationships. In analytics, FKs in fact tables point to dimension PKs (star schema).'),
  q('sq12', 'SQL', 'Window Functions', 'Medium', 'Deduplicate a table keeping the latest record per customer.', 'ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) AS rn in a CTE, then WHERE rn = 1.'),
  // Power BI
  q('pb1', 'Power BI', 'DAX', 'Medium', 'Explain filter context vs row context.', 'Row context = the current row when iterating (calculated columns, X-functions). Filter context = the set of filters applied from visuals/slicers/CALCULATE when evaluating a measure. CALCULATE performs context transition, turning row context into filter context.'),
  q('pb2', 'Power BI', 'Modeling', 'Medium', 'Why a star schema instead of one flat table?', 'Smaller model, faster VertiPaq compression, simpler DAX, correct many-to-one filter propagation, reusable dimensions (date, customer), and avoids ambiguity. Never connect two fact tables directly.'),
  q('pb3', 'Power BI', 'DAX', 'Medium', 'Calculated column vs measure — when do you use each?', 'Measures: aggregations evaluated at query time in filter context (Revenue, YoY). Calculated columns: row-level static values needed as slicers/axes (Age band). Prefer measures; columns cost memory.'),
  q('pb4', 'Power BI', 'Time Intelligence', 'Medium', 'Write a YoY growth % measure.', 'PY = CALCULATE([Revenue], SAMEPERIODLASTYEAR(\'Date\'[Date])). YoY% = DIVIDE([Revenue] - [PY], [PY]). Requires a marked date table with contiguous dates.'),
  q('pb5', 'Power BI', 'DAX', 'Hard', 'What does ALL() do inside CALCULATE and how is it different from ALLEXCEPT and KEEPFILTERS?', 'ALL removes filters from a table/column (for % of total). ALLEXCEPT removes all except specified columns. KEEPFILTERS adds a filter without overriding existing filters (intersection rather than replacement).'),
  q('pb6', 'Power BI', 'Modeling', 'Easy', 'What is cardinality and why does it matter?', 'One-to-many, many-to-one, one-to-one, many-to-many. Determines filter propagation direction and correctness. Many-to-many and bi-directional filters are performance and ambiguity risks.'),
  q('pb7', 'Power BI', 'Power Query', 'Easy', 'Merge vs Append in Power Query?', 'Merge = join tables horizontally on a key (like SQL JOIN). Append = stack tables vertically (like UNION ALL).'),
  q('pb8', 'Power BI', 'Time Intelligence', 'Hard', 'Rolling 3-month revenue measure?', 'CALCULATE([Revenue], DATESINPERIOD(\'Date\'[Date], MAX(\'Date\'[Date]), -3, MONTH)).'),
  q('pb9', 'Power BI', 'UX', 'Easy', 'What are drill-through and bookmarks used for?', 'Drill-through: right-click into a detail page filtered to the selected entity. Bookmarks: saved view states for storytelling/toggle navigation.'),
  // Excel
  q('xl1', 'Excel', 'Lookups', 'Easy', 'XLOOKUP vs VLOOKUP vs INDEX/MATCH?', 'XLOOKUP: any direction, exact match by default, if_not_found argument. VLOOKUP: left-to-right only, column index fragile. INDEX/MATCH: flexible, works in older Excel.'),
  q('xl2', 'Excel', 'Pivot Tables', 'Easy', 'How would you compute % of column total and running totals in a pivot?', 'Value Field Settings → Show Values As → % of Column Total / Running Total In. Also mention calculated fields and slicers.'),
  q('xl3', 'Excel', 'Cleaning', 'Medium', 'Steps to clean a messy customer export in Excel?', 'TRIM/CLEAN for whitespace, TEXT/DATEVALUE for dates, Remove Duplicates, Text-to-Columns, standardize casing (PROPER), flag blanks with COUNTBLANK, ideally do it in Power Query so it is repeatable.'),
  q('xl4', 'Excel', 'Formulas', 'Medium', 'SUMIFS with multiple criteria including a date range?', '=SUMIFS(rev, date, ">="&start, date, "<="&end, region, "West").'),
  // Statistics
  q('st1', 'Statistics', 'Hypothesis Testing', 'Medium', 'Explain p-value to a non-technical manager.', 'The probability of seeing a result at least this extreme if nothing had actually changed. A small p-value (< 0.05) means the result is unlikely to be noise. It is not the probability the hypothesis is true.'),
  q('st2', 'Statistics', 'A/B Testing', 'Medium', 'How would you design an A/B test for a new checkout page?', 'Define metric (checkout CVR), hypothesis, MDE, power (80%), significance (5%), sample size; randomize at user level; run full weeks; avoid peeking; check guardrail metrics (AOV, returns); segment for novelty effects.'),
  q('st3', 'Statistics', 'Descriptive', 'Easy', 'Mean vs median — when does it matter?', 'Skewed data (income, order value): median is robust to outliers. Report both plus distribution.'),
  q('st4', 'Statistics', 'Correlation', 'Easy', 'Correlation vs causation with a business example.', 'Ice-cream sales and drowning correlate due to summer. In e-com, discount and revenue correlate but may both be driven by festive season. Need experiments or controls.'),
  q('st5', 'Statistics', 'Regression', 'Medium', 'Interpret a regression coefficient of 0.8 for ad spend on revenue.', 'Holding other variables constant, each extra unit of spend is associated with 0.8 units more revenue. Check significance, R², multicollinearity, and that the relationship is linear in range.'),
  q('st6', 'Statistics', 'CI', 'Medium', 'What does a 95% confidence interval mean?', 'If we repeated the sampling many times, 95% of the intervals constructed this way would contain the true value. Wider CI = more uncertainty; narrows with more data.'),
  // Python
  q('py1', 'Python', 'Pandas', 'Easy', 'Difference between loc and iloc?', 'loc selects by label (index/column names, boolean masks); iloc selects by integer position.'),
  q('py2', 'Python', 'Pandas', 'Medium', 'How do you handle missing values in a transactions dataset?', 'Profile with isna().sum(); decide per column: drop if identifier missing, impute (median/mode/ffill) if numeric or categorical, or add a missing flag. Never impute target-like fields silently.'),
  q('py3', 'Python', 'Pandas', 'Medium', 'GroupBy + agg to get revenue, orders and AOV per month.', 'df.groupby(df.date.dt.to_period("M")).agg(revenue=("amount","sum"), orders=("order_id","nunique")); then aov = revenue/orders.'),
  q('py4', 'Python', 'Pandas', 'Medium', 'merge() join types and the validate argument.', 'how = inner/left/right/outer; validate="one_to_many" catches fan-out; indicator=True shows match source.'),
  // Project
  q('pr1', 'Project', 'Pitch', 'Medium', 'Explain your E-Commerce project in 60 seconds.', 'Problem → data → method (SQL sessions/funnel, star schema, DAX) → biggest insight with a ₹ number → recommendation → what you would do next. Under 60 seconds.'),
  q('pr2', 'Project', 'Pitch', 'Medium', 'What was the business problem?', 'State it in one sentence with a stakeholder and a metric.'),
  q('pr3', 'Project', 'Method', 'Medium', 'Why did you choose this metric?', 'Tie to the decision: e.g., Lost GMV converts abandonment into money leadership cares about.'),
  q('pr4', 'Project', 'Method', 'Medium', 'Why SQL instead of Excel?', 'Data volume, repeatability, joins across tables, window functions for sessionization; Excel for final reconciliation/scenarios.'),
  q('pr5', 'Project', 'Method', 'Easy', 'Why did you use Power BI?', 'Interactive executive consumption, star-schema modeling, DAX time intelligence, drill-through, shareable live link.'),
  q('pr6', 'Project', 'Insight', 'Hard', 'What was your biggest insight and how much revenue was affected?', 'One insight, one number, one segment. Show the calculation chain.'),
  q('pr7', 'Project', 'Recommendation', 'Hard', 'What would you recommend to management?', 'Three prioritized actions with expected impact and owner.'),
  q('pr8', 'Project', 'Validation', 'Hard', 'How would you validate your conclusion?', 'Reconcile totals, check segment consistency, look for confounders (seasonality, campaigns), propose an A/B test or before/after with control.'),
  // HR / Behavioral
  q('hr1', 'HR', 'Intro', 'Easy', 'Tell me about yourself.', '90-second arc: engineering background → why analytics → what you built (3 projects) → what you want (retail/BFSI/commercial analyst) → why this company.'),
  q('hr2', 'HR', 'Motivation', 'Easy', 'Why analytics, and why not software engineering?', 'Business impact + data curiosity; show evidence (projects) not just interest.'),
  q('hr3', 'HR', 'Company', 'Medium', 'Why this company / domain?', 'Specific product, metric or recent business event you analyzed; align with your project.'),
  q('hr4', 'HR', 'Salary', 'Medium', 'What are your salary expectations?', 'Range anchored to market for the role and city; emphasize role quality and learning; defer specifics until offer stage if possible.'),
  q('bh1', 'Behavioral', 'STAR', 'Medium', 'Tell me about a time you found an insight others missed.', 'STAR: Situation, Task, Action, Result with a number.'),
  q('bh2', 'Behavioral', 'STAR', 'Medium', 'Describe a time you had to explain something technical to a non-technical person.', 'STAR; emphasize simplification, visuals, checking understanding.'),
  q('bh3', 'Behavioral', 'STAR', 'Medium', 'Tell me about a mistake you made with data.', 'Own it, describe detection, fix, and the check you added afterwards.'),
  q('bh4', 'Behavioral', 'STAR', 'Medium', 'How do you prioritize when everything is urgent?', 'Impact × urgency, stakeholder alignment, communicate trade-offs early.'),
  // BFSI cases
  q('bc1', 'BFSI Cases', 'Credit Risk', 'Hard', 'Default rate increased from 3% to 5% in two quarters. How do you investigate?', 'DEFINE the metric window; SEGMENT by vintage, product, geo, credit band, channel; INVESTIGATE vintage curves (origination vs macro), roll rates; MEASURE EL impact; VISUALIZE vintage heat-map; EXPLAIN drivers; RECOMMEND cut-offs/collections actions.'),
  q('bc2', 'BFSI Cases', 'Payments', 'Medium', 'UPI payment failures spiked 40% last week. Approach?', 'Segment by PSP/bank/app version/hour/device; check technical vs business declines; correlate with releases; quantify lost GMV; recommend retry routing and alerts.'),
  q('bc3', 'BFSI Cases', 'Fraud', 'Hard', 'Fraud losses doubled. What data would you pull and what patterns would you look for?', 'Velocity (txns/hour), amount z-scores vs history, new-device/new-geo, merchant category concentration, time-of-day, first-txn-after-signup; build rule flags; measure precision/recall of rules; recommend step-up auth thresholds.'),
  q('bc4', 'BFSI Cases', 'Churn', 'Medium', 'Savings-account churn increased. How would you analyze it?', 'Define churn (dormancy 90d / closure), cohort by acquisition channel & tenure, leading indicators (balance decline, failed txns, complaints), segment value at risk, recommend retention triggers.'),
  q('bc5', 'BFSI Cases', 'Lending', 'Medium', 'Loan approval-to-disbursal conversion fell. Investigate.', 'Funnel: applied → approved → docs → disbursed; segment by product/branch/DSA/time-to-disburse; find step with drop; interview ops; quantify revenue; recommend SLA fixes.'),
  // E-Commerce cases
  q('ec1', 'E-Commerce Cases', 'Sales', 'Medium', 'Sales dropped 15% last month. How do you find out why?', 'DEFINE: GMV vs orders vs AOV; SEGMENT: category, geo, device, new vs repeat, channel; INVESTIGATE: traffic × CVR × AOV decomposition, competitor/seasonality/promo calendar, stockouts; MEASURE; VISUALIZE waterfall; EXPLAIN; RECOMMEND.'),
  q('ec2', 'E-Commerce Cases', 'Conversion', 'Medium', 'Conversion rate dropped from 3.2% to 2.6%. Approach?', 'Funnel step drop-off; segment by device/app version/traffic source; check page latency, payment failures, pricing changes; quantify lost orders; A/B a fix.'),
  q('ec3', 'E-Commerce Cases', 'Returns', 'Medium', 'Return rate increased 5 pts. Investigate.', 'Segment by category, seller, size/fit, geo, delivery time, discount level; return reasons; net revenue & logistics cost impact; recommend seller/SKU actions.'),
  q('ec4', 'E-Commerce Cases', 'Margin', 'Hard', 'Revenue is up but gross margin is down. Why?', 'Mix shift to low-margin categories, discount depth, logistics cost per order, returns; decompose margin change into mix/price/cost; recommend promo guardrails.'),
  q('ec5', 'E-Commerce Cases', 'Delivery', 'Medium', 'Delivery delays increased. What is the business impact and what do you do?', 'Measure SLA breach rate by hub/city/slot; link to cancellations, ratings, repeat rate; quantify GMV at risk; recommend capacity/slot changes.'),
  q('ec6', 'E-Commerce Cases', 'Retention', 'Hard', 'Customer retention declined for Q2 cohorts. Investigate.', 'Cohort curves by acquisition channel/first category/discount-led vs organic; M1/M3 retention; LTV impact; recommend acquisition quality & onboarding changes.'),
  q('ec7', 'E-Commerce Cases', 'Inventory', 'Medium', 'Frequent stockouts in top SKUs. Analyze.', 'Stockout rate × demand → lost sales; forecast vs actual by SKU/hub; lead times; recommend reorder points and safety stock.'),
  // Commercial (in Business Cases)
  q('cc1', 'Business Cases', 'Revenue', 'Medium', 'Revenue dropped 10% QoQ for a SaaS business. Approach?', 'MRR waterfall: new, expansion, contraction, churn; segment by plan/region/segment; pipeline health; pricing changes; recommend.'),
  q('cc2', 'Business Cases', 'CAC', 'Medium', 'CAC increased 30%. What do you look at?', 'Spend by channel vs conversions, funnel leaks, audience saturation, attribution; LTV:CAC by channel; reallocate budget.'),
  q('cc3', 'Business Cases', 'LTV', 'Medium', 'LTV decreased. Investigate.', 'Decompose LTV = ARPU × margin × lifetime; which term moved, by cohort/segment; churn hazard curves; recommend.'),
  q('cc4', 'Business Cases', 'Margin', 'Medium', 'Gross margin declined 4 pts. Investigate.', 'Price realization, discounting, COGS, mix; by product/region/rep; recommend discount guardrails.'),
  q('cc5', 'Business Cases', 'Pipeline', 'Medium', 'Pipeline conversion declined. Approach?', 'Stage-to-stage conversion and velocity by rep/segment/source; lead quality; recommend qualification criteria changes.'),
  q('cc6', 'Business Cases', 'Framework', 'Easy', 'Walk me through how you structure any business case.', 'DEFINE the metric precisely → SEGMENT → INVESTIGATE hypotheses → MEASURE impact → VISUALIZE → EXPLAIN drivers → RECOMMEND actions with owners and expected impact.'),
]

export const CASE_FRAMEWORK = ['DEFINE', 'SEGMENT', 'INVESTIGATE', 'MEASURE', 'VISUALIZE', 'EXPLAIN', 'RECOMMEND']

export const CASES = {
  'E-Commerce': ['Sales dropped 15%', 'Conversion dropped', 'Returns increased', 'Margins decreased', 'Delivery delays increased', 'Customer retention declined', 'Inventory shortage'],
  BFSI: ['Fraud increased', 'Payment failures increased', 'Default rate increased', 'Churn increased', 'Loan approval conversion fell'],
  Commercial: ['Revenue dropped', 'CAC increased', 'LTV decreased', 'Margin declined', 'Pipeline conversion declined'],
}

export const PROJECT_SIM_QUESTIONS = ['Explain your project in 60 seconds.', 'What was the business problem?', 'Why did you choose this metric?', 'Why SQL instead of Excel?', 'Why did you use Power BI?', 'What was your biggest insight?', 'How much revenue was affected?', 'What would you recommend to management?', 'How would you validate your conclusion?']
