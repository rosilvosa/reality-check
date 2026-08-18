import { lazy, useEffect } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { LangProvider } from './i18n'
import Layout from './components/Layout'
import Home from './pages/Home'
import MilestoneModal from './components/MilestoneModal'
import Onboarding from './components/Onboarding'
import OpenInBrowser from './components/OpenInBrowser'
import { useAuthStore } from './stores/authStore'
import { useStreakStore } from './stores/streakStore'
import { useSettingsStore } from './stores/settingsStore'
import { useJournalStore } from './stores/journalStore'
import { migrateToFirestore } from './lib/storage'

// Home stays eager: it is the landing route and lazy-loading it would only add
// a round trip to the first paint. Everything else is a tap away, and the
// audience is often on prepaid mobile data. Layout wraps Outlet in Suspense.
const Lost = lazy(() => import('./pages/Lost'))
const Journal = lazy(() => import('./pages/Journal'))
const Trap = lazy(() => import('./pages/Trap'))
const TrapWhy = lazy(() => import('./pages/TrapWhy'))
const Barriers = lazy(() => import('./pages/Barriers'))
const Settings = lazy(() => import('./pages/Settings'))
const Progress = lazy(() => import('./pages/Progress'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const Community = lazy(() => import('./pages/Community'))
const FindHelp = lazy(() => import('./pages/FindHelp'))
const Mission = lazy(() => import('./pages/Mission'))
const Updates = lazy(() => import('./pages/Updates'))
const Watch = lazy(() => import('./pages/Watch'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'lost', element: <Lost /> },
      { path: 'sweat', element: <Navigate to="/lost" replace /> },
      { path: 'assets', element: <Navigate to="/lost" replace /> },
      { path: 'nearmiss', element: <Navigate to="/lost" replace /> },
      { path: 'journal', element: <Journal /> },
      { path: 'trap', element: <Trap /> },
      { path: 'trap/why', element: <TrapWhy /> },
      { path: 'barriers', element: <Barriers /> },
      { path: 'progress', element: <Progress /> },
      { path: 'settings', element: <Settings /> },
      { path: 'privacy', element: <Privacy /> },
      { path: 'terms', element: <Terms /> },
      { path: 'community', element: <Community /> },
      { path: 'help', element: <FindHelp /> },
      { path: 'mission', element: <Mission /> },
      { path: 'updates', element: <Updates /> },
      { path: 'watch', element: <Watch /> },
    ],
  },
])

export default function App() {
  const init = useAuthStore((s) => s.init)
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const loadStreak = useStreakStore((s) => s.loadStreak)
  const loadSettings = useSettingsStore((s) => s.loadSettings)
  const loadJournal = useJournalStore((s) => s.loadJournal)

  useEffect(() => {
    return init()
  }, [init])

  useEffect(() => {
    if (loading) return
    let cancelled = false
    ;(async () => {
      if (user && !user.isAnonymous) {
        await migrateToFirestore(user.uid).catch(console.error)
      }
      if (cancelled) return
      await Promise.all([loadSettings(), loadJournal(), loadStreak()])
    })()
    return () => { cancelled = true }
  }, [loading, user?.uid, loadSettings, loadJournal, loadStreak])

  return (
    <LangProvider>
      <RouterProvider router={router} />
      <MilestoneModal />
      <Onboarding />
      <OpenInBrowser />
    </LangProvider>
  )
}
