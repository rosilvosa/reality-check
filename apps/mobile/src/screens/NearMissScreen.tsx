import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { colors } from '../theme/colors'
import { getNearMissReframe } from '@rc/core'

export default function NearMissScreen() {
  const [input, setInput] = useState('')
  const [reframe, setReframe] = useState('')

  function handleReframe() {
    if (!input.trim()) return
    setReframe(getNearMissReframe(input.trim()))
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>GAMBLING RECOVERY TOOL</Text>
      <Text style={styles.title}>Near-Miss{'\n'}Reframe</Text>

      <View style={[styles.card, { borderColor: colors.redDim }]}>
        <Text style={styles.tag}>PSYCHOLOGICAL FACT</Text>
        <Text style={styles.body}>
          Near-misses are programmed outcomes. Slot machines and betting algorithms are specifically calibrated to produce near-misses at a rate far above statistical chance. They trigger the same dopamine release as a real win. You are not unlucky.{' '}
          <Text style={styles.bold}>You are being chemically manipulated.</Text>
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>WHAT HAPPENED?</Text>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder='e.g. "I missed the over by 1 point"'
          placeholderTextColor={colors.muted}
        />
        <TouchableOpacity
          style={[styles.btn, !input.trim() && styles.btnDisabled]}
          onPress={handleReframe}
          disabled={!input.trim()}
        >
          <Text style={styles.btnText}>REFRAME THIS NOW</Text>
        </TouchableOpacity>
      </View>

      {reframe !== '' && (
        <View style={styles.reframeCard}>
          <Text style={styles.reframeLabel}>⛔ SYSTEM OVERRIDE</Text>
          <Text style={styles.reframeText}>{reframe}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>THE ONLY TRUE STATEMENT</Text>
        <Text style={styles.bold2}>
          There is no such thing as "almost winning." You either won or you lost. You lost. A near-miss is a 100% financial loss dressed up to keep you playing. The casino did not almost give you money — it took your money and showed you a consolation animation.
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: colors.muted, textTransform: 'uppercase', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', color: colors.white, marginBottom: 20 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 18, marginBottom: 16 },
  tag: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.red, textTransform: 'uppercase', marginBottom: 10, backgroundColor: colors.redDim, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  body: { fontSize: 14, color: colors.text, lineHeight: 22 },
  bold: { fontWeight: '700', color: colors.white },
  bold2: { fontSize: 15, fontWeight: '700', color: colors.white, lineHeight: 24 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.muted, textTransform: 'uppercase', marginBottom: 8 },
  input: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 14, fontSize: 15, color: colors.white, marginBottom: 14 },
  btn: { backgroundColor: colors.red, borderRadius: 8, padding: 14, alignItems: 'center' },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
  reframeCard: { backgroundColor: '#0f0a0a', borderWidth: 2, borderColor: colors.red, borderRadius: 8, padding: 18, marginBottom: 16 },
  reframeLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: colors.red, textTransform: 'uppercase', marginBottom: 12 },
  reframeText: { fontSize: 14, fontWeight: '700', color: colors.white, lineHeight: 22 },
})
