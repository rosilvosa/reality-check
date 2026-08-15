import { useEffect } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { LangProvider } from './i18n'
import Layout from './components/Layout'
import Home from './pages/Home'
import Lost from './pages/Lost'
import Journal from './pages/Journal'
import Trap from './pages/Trap'
import TrapWhy from './pages/TrapWhy'
import Barriers from './pages/Barriers'
import Settings from './pages/Settings'
import Progress from './pages/Progress'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Community from './pages/Community'
import FindHelp from './pages/FindHelp'
import Mission from './pages/Mission'
import MilestoneModal from './components/MilestoneModal'
import Onboarding from './components/Onboarding'
import { useAuthStore } from './stores/authStore'
import { useStreakStore } from './stores/streakStore'
import { useSettingsStore } from './stores/settingsStore'
import { useJournalStore } from './stores/journalStore'
import { migrateToFirestore } from './lib/storage'

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
    </LangProvider>
  )
}
