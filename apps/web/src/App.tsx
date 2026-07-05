import { useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout'
import SweatHours from './pages/SweatHours'
import AssetReality from './pages/AssetReality'
import Journal from './pages/Journal'
import NearMiss from './pages/NearMiss'
import Trap from './pages/Trap'
import Barriers from './pages/Barriers'
import Settings from './pages/Settings'
import Progress from './pages/Progress'
import MilestoneModal from './components/MilestoneModal'
import Onboarding from './components/Onboarding'
import { useAuthStore } from './stores/authStore'
import { useStreakStore } from './stores/streakStore'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <SweatHours /> },
      { path: 'assets', element: <AssetReality /> },
      { path: 'journal', element: <Journal /> },
      { path: 'nearmiss', element: <NearMiss /> },
      { path: 'trap', element: <Trap /> },
      { path: 'barriers', element: <Barriers /> },
      { path: 'progress', element: <Progress /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
])

export default function App() {
  const init = useAuthStore((s) => s.init)
  const loadStreak = useStreakStore((s) => s.loadStreak)

  useEffect(() => {
    const unsub = init()
    loadStreak()
    return unsub
  }, [init, loadStreak])

  return (
    <>
      <RouterProvider router={router} />
      <MilestoneModal />
      <Onboarding />
    </>
  )
}
