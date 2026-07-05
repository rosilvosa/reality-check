import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { colors } from '../theme/colors'
import { tpl } from '@rc/core'
import { useT } from '../i18n'

export default function NearMissScreen() {
  const [input, setInput] = useState('')
  const [reframe, setReframe] = useState('')
  const t = useT()

  function handleReframe() {
    if (!input.trim()) return
    setReframe(input.trim())
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>GAMBLING RECOVERY TOOL</Text>
      <Text style={styles.title}>{t.nearmiss.title}</Text>

      <View style={[styles.card, { borderColor: colors.redDim }]}>
        <Text style={styles.tag}>{t.nearmiss.factTag}</Text>
        <Text style={styles.body}>{t.nearmiss.factBody}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>{t.nearmiss.labelWhat}</Text>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={v => { setInput(v); setReframe('') }}
          placeholder={t.nearmiss.placeholder}
          placeholderTextColor={colors.muted}
        />
        <TouchableOpacity
          style={[styles.btn, !input.trim() && styles.btnDisabled]}
          onPress={handleReframe}
          disabled={!input.trim()}
        >
          <Text style={styles.btnText}>{t.nearmiss.btn}</Text>
        </TouchableOpacity>
      </View>

      {reframe !== '' && (
        <View style={styles.reframeCard}>
          <Text style={styles.reframeLabel}>{t.nearmiss.overrideTag}</Text>
          <Text style={styles.reframeText}>
            {tpl(t.nearmiss.overrideBody, { input: reframe })}
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>{t.nearmiss.truthTag}</Text>
        <Text style={styles.bold2}>{t.nearmiss.truthBody}</Text>
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
