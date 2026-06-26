import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { colors } from '../../theme/colors'

interface Props {
  onNext: (data: { monthlyPay: number; hoursPerMonth: number }) => void
}

export default function Step2Income({ onNext }: Props) {
  const [monthly, setMonthly] = useState('')
  const [hours, setHours] = useState('176')

  const rate = monthly && hours
    ? (parseFloat(monthly) / parseFloat(hours)).toFixed(2)
    : null

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Your Income</Text>
      <Text style={styles.sub}>
        This is what makes the calculator honest. Every loss will be converted into real hours of your life.
      </Text>
      <Text style={styles.label}>MONTHLY TAKE-HOME PAY (₱)</Text>
      <TextInput
        style={styles.input}
        value={monthly}
        onChangeText={setMonthly}
        keyboardType="numeric"
        placeholder="e.g. 25000"
        placeholderTextColor={colors.muted}
      />
      <Text style={styles.label}>WORKING HOURS PER MONTH</Text>
      <TextInput
        style={styles.input}
        value={hours}
        onChangeText={setHours}
        keyboardType="numeric"
        placeholder="176"
        placeholderTextColor={colors.muted}
      />
      {rate && (
        <Text style={styles.derived}>→ Your hourly rate: ₱{rate}/hr</Text>
      )}
      <TouchableOpacity
        style={[styles.btn, !monthly && styles.btnDisabled]}
        onPress={() => {
          if (!monthly) return
          onNext({ monthlyPay: parseFloat(monthly), hoursPerMonth: parseFloat(hours) || 176 })
        }}
      >
        <Text style={styles.btnText}>NEXT</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 28, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: colors.white, marginBottom: 8 },
  sub: { fontSize: 14, color: colors.muted, lineHeight: 22, marginBottom: 32 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.muted, textTransform: 'uppercase', marginBottom: 8 },
  input: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 14, fontSize: 16, color: colors.white, marginBottom: 20 },
  derived: { fontSize: 13, color: colors.muted, marginBottom: 16 },
  btn: { backgroundColor: colors.red, borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },
})
