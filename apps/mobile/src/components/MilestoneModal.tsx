import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors } from '../theme/colors'
import { useStreakStore } from '../stores/streakStore'
import { useJournalStore } from '../stores/journalStore'
import { useSettingsStore } from '../stores/settingsStore'
import { MILESTONE_EMOJI, MILESTONE_MESSAGES, calcAssets } from '@rc/core'

export default function MilestoneModal() {
  const { showMilestoneModal, newMilestone, dismissMilestone } = useStreakStore()
  const entries = useJournalStore(s => s.entries)
  const settings = useSettingsStore(s => s.settings)

  if (!showMilestoneModal || !newMilestone) return null

  const totalSaved = entries.reduce((sum, e) => sum + (e.amount || 0), 0)
  const assets = calcAssets(totalSaved, settings.assets)
  const emoji = MILESTONE_EMOJI[newMilestone] ?? '🏆'
  const message = MILESTONE_MESSAGES[newMilestone] ?? ''

  async function handleDismiss() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    await dismissMilestone()
  }

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.days}>
            {newMilestone} {newMilestone === 1 ? 'Day' : 'Days'} Clean.
          </Text>
          <Text style={styles.message}>{message}</Text>

          {totalSaved > 0 && (
            <View style={styles.savings}>
              <Text style={styles.savingsTitle}>You have protected ₱{totalSaved.toLocaleString()}.</Text>
              {assets.slice(0, 2).map((a, i) => (
                <Text key={i} style={styles.savingsLine}>
                  {a.units >= 1
                    ? `${a.units.toFixed(1)}× ${a.name}`
                    : `${(a.units * 100).toFixed(0)}% of ${a.name}`}
                </Text>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.btn} onPress={handleDismiss}>
            <Text style={styles.btnText}>ACKNOWLEDGE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.red, borderRadius: 16, padding: 28, width: '100%', alignItems: 'center' },
  emoji: { fontSize: 64, marginBottom: 16 },
  days: { fontSize: 28, fontWeight: '900', color: colors.white, marginBottom: 12, textAlign: 'center' },
  message: { fontSize: 15, color: colors.text, textAlign: 'center', lineHeight: 24, marginBottom: 20 },
  savings: { backgroundColor: colors.surface2, borderRadius: 8, padding: 14, width: '100%', marginBottom: 20 },
  savingsTitle: { fontSize: 14, fontWeight: '700', color: colors.white, marginBottom: 8 },
  savingsLine: { fontSize: 13, color: colors.amber, marginBottom: 4 },
  btn: { backgroundColor: colors.red, borderRadius: 8, padding: 16, alignItems: 'center', width: '100%' },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 14, letterSpacing: 0.5 },
})
