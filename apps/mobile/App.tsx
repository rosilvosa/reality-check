import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors } from './src/theme/colors'
import { useAuthStore } from './src/stores/authStore'
import AppNavigator from './src/navigation/AppNavigator'
import OnboardingScreen from './src/screens/Onboarding/OnboardingScreen'
import { useSettingsStore } from './src/stores/settingsStore'
import { useStreakStore } from './src/stores/streakStore'
import { useJournalStore } from './src/stores/journalStore'

export default function App() {
  const [onboarded, setOnboarded] = useState<boolean | null>(null)
  const initAuth = useAuthStore(s => s.init)
  const loadSettings = useSettingsStore(s => s.load)
  const loadStreak = useStreakStore(s => s.load)
  const loadJournal = useJournalStore(s => s.load)

  useEffect(() => {
    initAuth()
    loadSettings()
    loadStreak()
    loadJournal()
    AsyncStorage.getItem('rc_onboarded').then(v => setOnboarded(v === '1'))
  }, [])

  if (onboarded === null) return null

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {onboarded ? (
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        ) : (
          <OnboardingScreen onComplete={() => setOnboarded(true)} />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
