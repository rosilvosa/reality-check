import React, { useState } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors } from '../../theme/colors'
import Step1Welcome from './Step1Welcome'
import Step2Income from './Step2Income'
import Step3Assets from './Step3Assets'
import { useSettingsStore } from '../../stores/settingsStore'
import type { Settings } from '@rc/core'

const { width } = Dimensions.get('window')

interface Props {
  onComplete: () => void
}

export default function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [income, setIncome] = useState({ monthlyPay: 0, hoursPerMonth: 176 })
  const save = useSettingsStore(s => s.save)

  async function handleComplete(assets: Settings['assets']) {
    const settings: Settings = { ...income, assets }
    await save(settings)
    await AsyncStorage.setItem('rc_onboarded', '1')
    onComplete()
  }

  return (
    <View style={styles.container}>
      {step === 0 && <Step1Welcome onNext={() => setStep(1)} />}
      {step === 1 && (
        <Step2Income
          onNext={data => { setIncome(data); setStep(2) }}
        />
      )}
      {step === 2 && <Step3Assets onComplete={handleComplete} />}
      <View style={styles.dots}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  dots: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 40, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.red, width: 24 },
})
