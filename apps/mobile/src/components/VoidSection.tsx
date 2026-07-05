import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { VOID_OPTIONS } from '@rc/core'
import type { VoidType } from '@rc/core'
import { useSettingsStore } from '../stores/settingsStore'
import { colors } from '../theme/colors'
import { useT } from '../i18n'

export default function VoidSection() {
  const { settings, save } = useSettingsStore()
  const voidType = settings.voidType
  const [selecting, setSelecting] = useState(false)
  const [pending, setPending] = useState<VoidType | null>(null)
  const [saving, setSaving] = useState(false)
  const t = useT()

  const activeT = voidType ? t.void[voidType] : null

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
          {selecting ? t.progress.voidChanging : t.progress.voidLabel}
        </Text>
        <Text style={styles.hint}>{t.progress.voidHint}</Text>
        <View style={styles.optionGrid}>
          {VOID_OPTIONS.map(o => {
            const ot = t.void[o.type]
            return (
              <TouchableOpacity
                key={o.type}
                onPress={() => setPending(o.type)}
                style={[styles.optionBtn, pending === o.type && styles.optionBtnActive]}
              >
                <Text style={styles.optionEmoji}>{ot.emoji}</Text>
                <Text style={[styles.optionLabel, pending === o.type && { color: colors.white }]}>
                  {ot.label}
                </Text>
                <Text style={styles.optionDesc}>{ot.description}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
        <View style={styles.saveRow}>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!pending || saving}
            style={[styles.saveBtn, (!pending || saving) && styles.saveBtnDisabled]}
          >
            <Text style={styles.saveBtnText}>
              {saving ? t.progress.voidSaving : t.progress.voidSave}
            </Text>
          </TouchableOpacity>
          {selecting && (
            <TouchableOpacity
              onPress={() => { setSelecting(false); setPending(null) }}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>{t.common.cancel}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.card}>
      <View style={styles.profileHeader}>
        <Text style={styles.fieldLabel}>{t.progress.voidWhenUrge}</Text>
        <TouchableOpacity
          onPress={() => setSelecting(true)}
          style={styles.changeBtn}
        >
          <Text style={styles.changeBtnText}>{t.progress.voidChange}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.activeProfile}>
        <Text style={styles.activeEmoji}>{activeT!.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.activeLabel}>{activeT!.label}</Text>
          <Text style={styles.activeDesc}>{activeT!.description}</Text>
        </View>
      </View>

      <View style={styles.reframeBox}>
        <Text style={styles.reframeText}>{activeT!.reframe}</Text>
      </View>

      <Text style={styles.altLabel}>{t.progress.voidTryInstead}</Text>
      {activeT!.alternatives.map(alt => (
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
