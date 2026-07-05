import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { VOID_OPTIONS } from '@rc/core'
import type { VoidType } from '@rc/core'
import { useSettingsStore } from '../stores/settingsStore'
import { colors } from '../theme/colors'

export default function VoidSection() {
  const { settings, save } = useSettingsStore()
  const voidType = settings.voidType
  const [selecting, setSelecting] = useState(false)
  const [pending, setPending] = useState<VoidType | null>(null)
  const [saving, setSaving] = useState(false)

  const active = VOID_OPTIONS.find(o => o.type === voidType)

  async function handleSave() {
    if (!pending) return
    setSaving(true)
    await save({ ...settings, voidType: pending })
    setSaving(false)
    setSelecting(false)
    setPending(null)
  }

  if (!voidType || selecting) {
    return (
      <View style={styles.card}>
        <Text style={styles.fieldLabel}>
          {selecting ? 'Change Recovery Profile' : 'Understanding Your Urge'}
        </Text>
        <Text style={styles.hint}>
          Gambling fills a specific need. Knowing which one is the key to replacing it. Pick the one that fits you best.
        </Text>
        <View style={styles.optionGrid}>
          {VOID_OPTIONS.map(o => (
            <TouchableOpacity
              key={o.type}
              onPress={() => setPending(o.type)}
              style={[styles.optionBtn, pending === o.type && styles.optionBtnActive]}
            >
              <Text style={styles.optionEmoji}>{o.emoji}</Text>
              <Text style={[styles.optionLabel, pending === o.type && { color: colors.white }]}>
                {o.label}
              </Text>
              <Text style={styles.optionDesc}>{o.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.saveRow}>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!pending || saving}
            style={[styles.saveBtn, (!pending || saving) && styles.saveBtnDisabled]}
          >
            <Text style={styles.saveBtnText}>
              {saving ? 'SAVING...' : 'SAVE & SEE YOUR ALTERNATIVES'}
            </Text>
          </TouchableOpacity>
          {selecting && (
            <TouchableOpacity
              onPress={() => { setSelecting(false); setPending(null) }}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.card}>
      <View style={styles.profileHeader}>
        <Text style={styles.fieldLabel}>When the Urge Hits</Text>
        <TouchableOpacity
          onPress={() => setSelecting(true)}
          style={styles.changeBtn}
        >
          <Text style={styles.changeBtnText}>Change</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.activeProfile}>
        <Text style={styles.activeEmoji}>{active!.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.activeLabel}>{active!.label}</Text>
          <Text style={styles.activeDesc}>{active!.description}</Text>
        </View>
      </View>

      <View style={styles.reframeBox}>
        <Text style={styles.reframeText}>{active!.reframe}</Text>
      </View>

      <Text style={styles.altLabel}>Try Instead</Text>
      {active!.alternatives.map(alt => (
        <View key={alt} style={styles.altRow}>
          <Text style={styles.altArrow}>→</Text>
          <Text style={styles.altText}>{alt}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 18, marginBottom: 16 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.muted, textTransform: 'uppercase', marginBottom: 8 },
  hint: { fontSize: 13, color: colors.muted, lineHeight: 20, marginBottom: 16 },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  optionBtn: { width: '47%', backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 14 },
  optionBtnActive: { borderColor: colors.teal, backgroundColor: '#0a2030' },
  optionEmoji: { fontSize: 24, marginBottom: 8 },
  optionLabel: { fontSize: 14, fontWeight: '700', color: colors.muted, marginBottom: 4 },
  optionDesc: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  saveRow: { flexDirection: 'row', gap: 10 },
  saveBtn: { flex: 1, backgroundColor: colors.teal, borderRadius: 8, padding: 14, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: colors.white, fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
  cancelBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  profileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  changeBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  changeBtnText: { fontSize: 11, color: colors.muted },
  activeProfile: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  activeEmoji: { fontSize: 32 },
  activeLabel: { fontSize: 16, fontWeight: '800', color: colors.white, marginBottom: 2 },
  activeDesc: { fontSize: 12, color: colors.muted },
  reframeBox: { backgroundColor: colors.bg, borderLeftWidth: 3, borderLeftColor: colors.teal, borderRadius: 4, padding: 12, marginBottom: 16 },
  reframeText: { fontSize: 13, fontWeight: '700', color: colors.teal, lineHeight: 20 },
  altLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.muted, textTransform: 'uppercase', marginBottom: 10 },
  altRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  altArrow: { fontSize: 14, color: colors.teal, marginTop: 2 },
  altText: { flex: 1, fontSize: 14, color: colors.white, lineHeight: 22 },
})
