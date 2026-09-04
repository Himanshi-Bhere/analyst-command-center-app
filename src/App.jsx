import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Today from './pages/Today'
import { WeeklyPlan, MonthlyPlan } from './pages/Plans'
import CalendarPage from './pages/Calendar'
import Roadmap, { DecemberChecklist } from './pages/Roadmap'
import SkillPage from './pages/Skills'
import { StatisticsPage, AptitudePage, DsaPage, BusinessPage, DomainPage } from './pages/Learning'
import { ProjectHub, ProjectDetail, Portfolio, GithubPage } from './pages/Projects'
import InterviewCenter from './pages/Interviews'
import { JobsPage, ApplicationsPage, ResumePage, LinkedInPage, NetworkingPage } from './pages/Career'
import { ProgressPage, DifferentiationPage, ResourcesPage, NotesPage, RevisionPage, CatchUpPage, SettingsPage } from './pages/System'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/today" element={<Today />} />
          <Route path="/weekly" element={<WeeklyPlan />} />
          <Route path="/monthly" element={<MonthlyPlan />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/checklist" element={<DecemberChecklist />} />
          <Route path="/skills/:id" element={<SkillPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/business" element={<BusinessPage />} />
          <Route path="/aptitude" element={<AptitudePage />} />
          <Route path="/dsa" element={<DsaPage />} />
          <Route path="/domain/:id" element={<DomainPage />} />
          <Route path="/projects" element={<ProjectHub />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/github" element={<GithubPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/interviews" element={<InterviewCenter />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/linkedin" element={<LinkedInPage />} />
          <Route path="/networking" element={<NetworkingPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/differentiation" element={<DifferentiationPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/revision" element={<RevisionPage />} />
          <Route path="/catch-up" element={<CatchUpPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
