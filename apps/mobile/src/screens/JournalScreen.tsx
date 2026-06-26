import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { colors } from '../theme/colors'
import { useJournalStore } from '../stores/journalStore'

export default function JournalScreen() {
  const { entries, loading, load, addEntry } = useJournalStore()
  const [acknowledged, setAcknowledged] = useState(false)
  const [amount, setAmount] = useState('')
  const [text, setText] = useState('')
  const [saved, setSaved] = useState(false)

  useFocusEffect(
    React.useCallback(() => {
      load()
      setAcknowledged(false)
      setSaved(false)
    }, [])
  )

  async function handleSave() {
    if (!text.trim()) return
    await addEntry(parseFloat(amount) || 0, text.trim())
    setAmount('')
    setText('')
    setSaved(true)
    setAcknowledged(true)
  }

  const lastEntry = entries[0]
  const showIntercept = entries.length > 0 && !acknowledged

  if (loading) return <View style={styles.container} />

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.label}>GAMBLING RECOVERY TOOL</Text>
        <Text style={styles.title}>Loss Journal</Text>

        {showIntercept && lastEntry && (
          <View style={styles.intercept}>
            <Text style={styles.interceptTitle}>⛔ Stop. Read This First.</Text>
            <Text style={styles.interceptSub}>
              You wrote this after your last loss. You must read it now before continuing.
            </Text>
            <View style={styles.entry}>
              <Text style={styles.entryMeta}>
                {lastEntry.createdAt instanceof Date
                  ? lastEntry.createdAt.toLocaleDateString('en-PH', { dateStyle: 'medium' })
                  : String(lastEntry.createdAt)}
                {lastEntry.amount > 0 ? ` · ₱${lastEntry.amount.toLocaleString()} lost` : ''}
              </Text>
              <Text style={styles.entryText}>{lastEntry.text}</Text>
            </View>
            <TouchableOpacity style={styles.acknowledgeBtn} onPress={() => setAcknowledged(true)}>
              <Text style={styles.acknowledgeBtnText}>I have read and acknowledged my past pain.</Text>
            </TouchableOpacity>
          </View>
        )}

        {(!showIntercept) && (
          <View style={styles.writeCard}>
            <Text style={styles.fieldLabel}>AMOUNT LOST (₱)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="e.g. 2000"
              placeholderTextColor={colors.muted}
            />
            <Text style={styles.fieldLabel}>HOW YOU FEEL RIGHT NOW</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={text}
              onChangeText={setText}
              placeholder="Write the raw truth. The fear, the regret, the physical pain. Future-you needs to read this."
              placeholderTextColor={colors.muted}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.btn, !text.trim() && styles.btnDisabled]}
              onPress={handleSave}
              disabled={!text.trim()}
            >
              <Text style={styles.btnText}>RECORD THIS MOMENT</Text>
            </TouchableOpacity>
            {saved && (
              <Text style={styles.savedMsg}>Entry recorded.</Text>
            )}
          </View>
        )}

        {entries.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.fieldLabel}>PAST ENTRIES ({entries.length})</Text>
            {entries.map(e => (
              <View key={e.id} style={styles.entry}>
                <Text style={styles.entryMeta}>
                  {e.createdAt instanceof Date
                    ? e.createdAt.toLocaleDateString('en-PH', { dateStyle: 'medium' })
                    : String(e.createdAt)}
                  {e.amount > 0 ? ` · ₱${e.amount.toLocaleString()} lost` : ''}
                </Text>
                <Text style={styles.entryText}>{e.text}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: colors.muted, textTransform: 'uppercase', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', color: colors.white, marginBottom: 20 },
  intercept: { borderWidth: 2, borderColor: colors.red, borderRadius: 10, padding: 20, marginBottom: 20 },
  interceptTitle: { fontSize: 16, fontWeight: '800', color: colors.red, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  interceptSub: { fontSize: 13, color: colors.muted, marginBottom: 16 },
  acknowledgeBtn: { backgroundColor: colors.red, borderRadius: 8, padding: 14, alignItems: 'center' },
  acknowledgeBtnText: { color: colors.white, fontWeight: '700', fontSize: 13, textAlign: 'center' },
  writeCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 18, marginBottom: 20 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.muted, textTransform: 'uppercase', marginBottom: 8 },
  input: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 14, fontSize: 15, color: colors.white, marginBottom: 16 },
  textarea: { height: 120, textAlignVertical: 'top' },
  btn: { backgroundColor: colors.red, borderRadius: 8, padding: 14, alignItems: 'center' },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
  savedMsg: { color: colors.teal ?? '#0891b2', fontSize: 13, textAlign: 'center', marginTop: 10 },
  historySection: { marginTop: 8 },
  entry: { backgroundColor: colors.surface2, borderLeftWidth: 3, borderLeftColor: colors.redDim, borderRadius: 8, padding: 14, marginBottom: 10 },
  entryMeta: { fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  entryText: { fontSize: 14, color: colors.text, lineHeight: 22 },
})
