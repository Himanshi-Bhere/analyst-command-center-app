import { DEFAULT_PROGRAM_START, setProgramStart } from '../data/roadmap'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { toISO, addDays } from '../lib/dates'
import { uid } from '../lib/utils'
import { SEED_NOTES } from '../data/library'

const REVISION_STEPS = [1, 3, 7, 14, 30]

const initial = {
  settings: {
    name: 'Himanshi', title: '2027 Analytics Candidate', weeklyHours: 21, dailyCatchUpCap: 60,
    laneOverrides: {}, // { weekN: { sql: 8, ... } }
    todayOverride: '', // for testing / travelling — blank = real date
    startedOn: DEFAULT_PROGRAM_START, // tasks before this date are never 'overdue'
    links: { github: 'https://github.com/', linkedin: 'https://www.linkedin.com/in/', portfolio: '' },
    theme: 'midnight',
  },
  taskState: {}, // id → { status, completedOn, startedAt, estMin }
  taskOverrides: {}, // id → { date, origDate }
  customTasks: [], // { id, title, skill, topic, type, difficulty, estMin, resource, date, why }
  topics: {}, // topicId → true
  evidence: {}, // skill → { problems, business, interview, project, timed, explain }
  sqlLog: [], // { date, platform, easy, medium, hard, correct, minutes }
  aptitude: { solved: 0, correct: 0, minutes: 0, log: [] }, // log: {date, category, solved, correct, minutes}
  hoursLog: {}, // date → minutes (manual extra)
  projects: {}, // pid → { stages: {stage: true}, links: {}, notes, deadline, insights, recs }
  repos: {}, // repoId → { url, checklist: {} }
  interview: {}, // qid → { confidence, myAnswer, needsRevision, strong }
  caseNotes: {}, // caseKey → { DEFINE: '', ... }
  simScores: {}, // pid → { qIndex: confidence }
  applications: [], // ATS rows
  companies: {}, // cid → { applied, referral, notes, priority }
  customCompanies: [],
  resources: {}, // rid → status
  notes: SEED_NOTES,
  scratch: [], // random notes: { id, text, tags, pinned, createdAt, updatedAt }
  revision: [], // { id, title, category, detail, step, nextReview, createdAt, history: [] }
  weeklyReviews: {}, // weekStart → { achieved, hardest, moveNext, improved, weak, mistake, priority }
  monthlyReviews: {},
  checklist: {}, // December readiness: item → true
  resume: { score: 0, ats: {}, versions: { retail: '', bfsi: '', commercial: '' }, impact: [] },
  linkedin: { checklist: {}, weekly: {}, strength: 0 },
  dsa: {}, // topicId → { questions, confidence }
  statsQuiz: {}, // conceptId → { understood, quizScore }
  activityLog: [], // { ts, type, text }
}

export const useStore = create(persist((set, get) => ({
  ...initial,
  today: () => get().settings.todayOverride || toISO(new Date()),
  log: (type, text) => set((s) => ({ activityLog: [{ ts: Date.now(), type, text }, ...s.activityLog].slice(0, 300) })),

  // ---- tasks ----
  setTaskStatus: (task, status) => set((s) => {
    const today = get().today()
    const prev = s.taskState[task.id] || {}
    const next = { ...prev, status, estMin: task.estMin }
    if (status === 'done') next.completedOn = today
    if (status === 'active') next.startedAt = Date.now()
    if (status === 'open') { delete next.completedOn }
    return { taskState: { ...s.taskState, [task.id]: next } }
  }),
  moveTask: (task, date) => set((s) => ({ taskOverrides: { ...s.taskOverrides, [task.id]: { date, origDate: task.origDate || task.date } } })),
  dropTask: (task) => set((s) => ({ taskState: { ...s.taskState, [task.id]: { ...(s.taskState[task.id] || {}), status: 'dropped' } } })),
  addCustomTask: (t) => set((s) => ({ customTasks: [...s.customTasks, { id: 'c-' + uid(), type: 'Practice', difficulty: 'Intermediate', estMin: 30, skill: 'sql', ...t }] })),
  removeCustomTask: (id) => set((s) => ({ customTasks: s.customTasks.filter((t) => t.id !== id) })),
  logHours: (date, minutes) => set((s) => ({ hoursLog: { ...s.hoursLog, [date]: (s.hoursLog[date] || 0) + minutes } })),

  // ---- skills ----
  toggleTopic: (id) => set((s) => ({ topics: { ...s.topics, [id]: !s.topics[id] } })),
  addEvidence: (skill, key, delta) => set((s) => { const e = { ...(s.evidence[skill] || {}) }; e[key] = typeof delta === 'boolean' ? delta : Math.max(0, (e[key] || 0) + delta); return { evidence: { ...s.evidence, [skill]: e } } }),
  logSql: (entry) => set((s) => {
    const n = (entry.easy || 0) + (entry.medium || 0) + (entry.hard || 0)
    const e = { ...(s.evidence.sql || {}) }; e.problems = (e.problems || 0) + n; if (entry.business) e.business = (e.business || 0) + entry.business; if (entry.interview) e.interview = (e.interview || 0) + entry.interview
    return { sqlLog: [{ id: uid(), ...entry }, ...s.sqlLog], evidence: { ...s.evidence, sql: e } }
  }),
  logAptitude: (entry) => set((s) => ({ aptitude: { solved: s.aptitude.solved + entry.solved, correct: s.aptitude.correct + entry.correct, minutes: s.aptitude.minutes + (entry.minutes || 0), log: [{ id: uid(), ...entry }, ...s.aptitude.log] } })),
  setDsa: (id, patch) => set((s) => ({ dsa: { ...s.dsa, [id]: { ...(s.dsa[id] || {}), ...patch } } })),
  setStatsQuiz: (id, patch) => set((s) => ({ statsQuiz: { ...s.statsQuiz, [id]: { ...(s.statsQuiz[id] || {}), ...patch } } })),

  // ---- projects ----
  toggleStage: (pid, stage) => set((s) => { const p = s.projects[pid] || { stages: {} }; const stages = { ...p.stages, [stage]: !p.stages?.[stage] }; return { projects: { ...s.projects, [pid]: { ...p, stages } } } }),
  setProject: (pid, patch) => set((s) => ({ projects: { ...s.projects, [pid]: { ...(s.projects[pid] || { stages: {} }), ...patch } } })),
  setRepo: (rid, patch) => set((s) => ({ repos: { ...s.repos, [rid]: { ...(s.repos[rid] || { checklist: {} }), ...patch } } })),
  toggleRepoItem: (rid, item) => set((s) => { const r = s.repos[rid] || { checklist: {} }; return { repos: { ...s.repos, [rid]: { ...r, checklist: { ...r.checklist, [item]: !r.checklist?.[item] } } } } }),

  // ---- interview ----
  setInterview: (qid, patch) => set((s) => ({ interview: { ...s.interview, [qid]: { ...(s.interview[qid] || {}), ...patch } } })),
  setCaseNote: (key, patch) => set((s) => ({ caseNotes: { ...s.caseNotes, [key]: { ...(s.caseNotes[key] || {}), ...patch } } })),
  setSim: (pid, idx, val) => set((s) => ({ simScores: { ...s.simScores, [pid]: { ...(s.simScores[pid] || {}), [idx]: val } } })),

  // ---- applications ----
  addApplication: (a) => set((s) => ({ applications: [{ id: uid(), createdAt: get().today(), status: 'Wishlist', ...a }, ...s.applications] })),
  updateApplication: (id, patch) => set((s) => ({ applications: s.applications.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
  removeApplication: (id) => set((s) => ({ applications: s.applications.filter((a) => a.id !== id) })),
  setCompany: (cid, patch) => set((s) => ({ companies: { ...s.companies, [cid]: { ...(s.companies[cid] || {}), ...patch } } })),
  addCompany: (c) => set((s) => ({ customCompanies: [...s.customCompanies, { id: 'cc-' + uid(), priority: 'MEDIUM', roles: [], ...c }] })),
  removeCompany: (id) => set((s) => ({ customCompanies: s.customCompanies.filter((c) => c.id !== id) })),
  setResource: (rid, status) => set((s) => ({ resources: { ...s.resources, [rid]: status } })),

  // ---- notes ----
  addNote: (n) => set((s) => ({ notes: [{ id: 'n-' + uid(), createdAt: get().today(), tags: [], ...n }, ...s.notes] })),
  updateNote: (id, patch) => set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)) })),
  removeNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
  addScratch: (n) => { const id = 's-' + uid(); set((s) => ({ scratch: [{ id, text: '', tags: [], pinned: false, createdAt: get().today(), updatedAt: Date.now(), ...n }, ...(s.scratch || [])] })); return id },
  updateScratch: (id, patch) => set((s) => ({ scratch: (s.scratch || []).map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)) })),
  removeScratch: (id) => set((s) => ({ scratch: (s.scratch || []).filter((n) => n.id !== id) })),

  // ---- revision (spaced repetition) ----
  addRevision: (r) => set((s) => { const today = get().today(); return { revision: [{ id: 'rv-' + uid(), step: 0, createdAt: today, nextReview: addDays(today, 1), history: [], ...r }, ...s.revision] } }),
  reviewRevision: (id, ok) => set((s) => { const today = get().today(); return { revision: s.revision.map((r) => { if (r.id !== id) return r; const step = ok ? Math.min(r.step + 1, REVISION_STEPS.length) : 0; const retired = step >= REVISION_STEPS.length; return { ...r, step, retired, nextReview: retired ? null : addDays(today, REVISION_STEPS[step]), history: [...r.history, { date: today, ok }] } }) } }),
  removeRevision: (id) => set((s) => ({ revision: s.revision.filter((r) => r.id !== id) })),

  // ---- reviews / checklists ----
  saveWeeklyReview: (weekStart, data) => set((s) => ({ weeklyReviews: { ...s.weeklyReviews, [weekStart]: data } })),
  saveMonthlyReview: (key, data) => set((s) => ({ monthlyReviews: { ...s.monthlyReviews, [key]: data } })),
  toggleChecklist: (item) => set((s) => ({ checklist: { ...s.checklist, [item]: !s.checklist[item] } })),
  setResume: (patch) => set((s) => ({ resume: { ...s.resume, ...patch } })),
  setLinkedin: (patch) => set((s) => ({ linkedin: { ...s.linkedin, ...patch } })),
  setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
  setLaneOverride: (weekN, lanes) => set((s) => ({ settings: { ...s.settings, laneOverrides: { ...s.settings.laneOverrides, [weekN]: lanes } } })),

  exportState: () => JSON.stringify(get(), (k, v) => (typeof v === 'function' ? undefined : v), 2),
  importState: (json) => { const data = JSON.parse(json); set({ ...initial, ...data }) },
  resetAll: () => set({ ...initial }),
}), {
  name: 'acc-state-v1',
  version: 4,
  migrate: (persisted) => {
    if (persisted?.settings?.name === 'Vedant') persisted.settings.name = 'Himanshi'
    if (persisted?.settings && (!persisted.settings.startedOn || persisted.settings.startedOn < DEFAULT_PROGRAM_START)) persisted.settings.startedOn = DEFAULT_PROGRAM_START
    if (persisted && !Array.isArray(persisted.scratch)) persisted.scratch = []
    if (persisted?.settings && !persisted.settings.theme) persisted.settings.theme = 'midnight'
    return persisted
  },
  storage: createJSONStorage(() => localStorage),
  partialize: (s) => Object.fromEntries(Object.entries(s).filter(([, v]) => typeof v !== 'function')),
}))

export const REVISION_INTERVALS = REVISION_STEPS

// Keep the roadmap anchor in sync with the user's start date (Week 1, Day 1)
setProgramStart(useStore.getState().settings?.startedOn)
useStore.subscribe((s, prev) => { if (s.settings?.startedOn !== prev.settings?.startedOn) setProgramStart(s.settings?.startedOn) })

import { applyTheme } from '../lib/theme'
applyTheme(useStore.getState().settings?.theme)
useStore.subscribe((s, prev) => { if (s.settings?.theme !== prev.settings?.theme) applyTheme(s.settings?.theme) })
