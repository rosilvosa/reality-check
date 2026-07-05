import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { colors } from '../theme/colors'
import { useSettingsStore } from '../stores/settingsStore'
import { calcSweatHours, tpl } from '@rc/core'
import { useT } from '../i18n'

export default function SweatHoursScreen() {
  const [loss, setLoss] = useState('')
  const [result, setResult] = useState<{ hours: number; days: number; hourlyRate: number } | null>(null)
  const settings = useSettingsStore(s => s.settings)
  const t = useT()

  const noSettings = !settings.monthlyPay

  function calculate() {
    if (!loss || noSettings) return
    const r = calcSweatHours(parseFloat(loss), settings.monthlyPay, settings.hoursPerMonth)
    setResult(r)
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>GAMBLING RECOVERY TOOL</Text>
      <Text style={styles.title}>{t.sweat.title}</Text>
      <Text style={styles.sub}>{t.sweat.subtitle}</Text>

      {noSettings && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>{t.sweat.notConfigured}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>{t.sweat.labelLoss}</Text>
        <TextInput
          style={styles.input}
          value={loss}
          onChangeText={setLoss}
          keyboardType="numeric"
          placeholder={t.sweat.placeholder}
          placeholderTextColor={colors.muted}
        />
        <TouchableOpacity
          style={[styles.btn, (noSettings || !loss) && styles.btnDisabled]}
          onPress={calculate}
          disabled={noSettings || !loss}
        >
          <Text style={styles.btnText}>{t.sweat.btn}</Text>
        </TouchableOpacity>
      </View>

      {result && (
        <View style={styles.result}>
          <Text style={styles.resultBig}>
            {tpl(t.sweat.resultHours, { hours: result.hours.toFixed(1) })}
          </Text>
          <Text style={styles.resultBody}>
            {tpl(t.sweat.resultBody, {
              loss: parseFloat(loss).toLocaleString(),
              hours: result.hours.toFixed(1),
              days: result.days.toFixed(1),
              rate: result.hourlyRate.toFixed(2),
              ceilHours: String(Math.ceil(result.hours)),
            })}
          </Text>
        </View>
      )}

      {!noSettings && (
        <View style={styles.rateCard}>
          <Text style={styles.fieldLabel}>YOUR HOURLY RATE</Text>
          <Text style={styles.rateText}>
            {tpl(t.sweat.rateNote, {
              monthly: settings.monthlyPay.toLocaleString(),
              hoursPerMonth: String(settings.hoursPerMonth),
              rate: (settings.monthlyPay / settings.hoursPerMonth).toFixed(2),
            })}
          </Text>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: colors.muted, textTransform: 'uppercase', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', color: colors.white, marginBottom: 8 },
  sub: { fontSize: 14, color: colors.muted, lineHeight: 22, marginBottom: 20 },
  warning: { backgroundColor: colors.redDim, borderRadius: 8, padding: 14, marginBottom: 16 },
  warningText: { color: colors.red, fontSize: 14, fontWeight: '600' },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 18, marginBottom: 16 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.muted, textTransform: 'uppercase', marginBottom: 8 },
  input: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 14, fontSize: 16, color: colors.white, marginBottom: 14 },
  btn: { backgroundColor: colors.red, borderRadius: 8, padding: 14, alignItems: 'center' },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
  result: { backgroundColor: colors.surface, borderLeftWidth: 3, borderLeftColor: colors.red, borderRadius: 8, padding: 16, marginBottom: 16 },
  resultBig: { fontSize: 22, fontWeight: '800', color: colors.red, marginBottom: 10 },
  resultBody: { fontSize: 14, color: colors.text, lineHeight: 22 },
  rateCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 18 },
  rateText: { fontSize: 14, color: colors.muted },
})
