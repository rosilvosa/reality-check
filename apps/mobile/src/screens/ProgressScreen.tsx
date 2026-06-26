import React, { useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import { colors } from '../theme/colors'
import { useStreakStore } from '../stores/streakStore'
import { useJournalStore } from '../stores/journalStore'
import { useSettingsStore } from '../stores/settingsStore'
import { MILESTONES, MILESTONE_EMOJI, calcAssets } from '@rc/core'
import MilestoneModal from '../components/MilestoneModal'

export default function ProgressScreen() {
  const { streak, loading, load, checkIn, showMilestoneModal } = useStreakStore()
  const entries = useJournalStore(s => s.entries)
  const loadJournal = useJournalStore(s => s.load)
  const settings = useSettingsStore(s => s.settings)

  useFocusEffect(
    useCallback(() => {
      load()
      loadJournal()
    }, [])
  )

  const today = new Date().toISOString().split('T')[0]
  const checkedInToday = streak.lastCheckInDate === today

  const totalSaved = entries.reduce((sum, e) => sum + (e.amount || 0), 0)
  const assetResults = calcAssets(totalSaved, settings.assets)

  async function handleCheckIn() {
    if (checkedInToday) return
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    await checkIn()
  }

  if (loading) return <View style={styles.container} />

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.label}>GAMBLING RECOVERY TOOL</Text>
        <Text style={styles.title}>Progress</Text>

        <View style={styles.streakCard}>
          {streak.currentStreak > 0 ? (
            <>
              <Text style={styles.streakNum}>{streak.currentStreak}</Text>
              <Text style={styles.streakSub}>days clean</Text>
              <Text style={styles.streakBest}>Personal best: {streak.longestStreak} days</Text>
              {streak.lastCheckInDate && (
                <Text style={styles.streakLast}>
                  Last check-in: {new Date(streak.lastCheckInDate + 'T00:00:00').toLocaleDateString('en-PH', { dateStyle: 'medium' })}
                </Text>
              )}
            </>
          ) : (
            <>
              <Text style={styles.streakEmoji}>📅</Text>
              <Text style={styles.streakEmpty}>Start your streak today.</Text>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>DAILY CHECK-IN</Text>
          <TouchableOpacity
            style={[styles.checkInBtn, checkedInToday && styles.checkInBtnDone]}
            onPress={handleCheckIn}
            disabled={checkedInToday}
          >
            <Text style={styles.checkInBtnText}>
              {checkedInToday ? '✓ Checked in today' : 'I AM CLEAN TODAY'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.checkInHint}>Tap once per day. Miss a day and it resets.</Text>
        </View>

        {totalSaved > 0 && (
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>WHAT YOU HAVE PROTECTED</Text>
            <Text style={styles.savedTotal}>₱{totalSaved.toLocaleString()}</Text>
            {assetResults.map((r, i) => (
              <Text key={i} style={styles.assetLine}>
                {r.units >= 1
                  ? `${r.units.toFixed(1)}× ${r.name}`
                  : `${(r.units * 100).toFixed(0)}% of ${r.name}`}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>MILESTONES</Text>
          <View style={styles.milestoneGrid}>
            {MILESTONES.map(m => {
              const unlocked = streak.currentStreak >= m
              const isNext = MILESTONES.find(x => x > streak.currentStreak) === m
              return (
                <View
                  key={m}
                  style={[
                    styles.milestoneBadge,
                    unlocked && styles.milestoneBadgeUnlocked,
                    isNext && styles.milestoneBadgeNext,
                  ]}
                >
                  <Text style={[styles.milestoneEmoji, !unlocked && styles.locked]}>
                    {unlocked ? MILESTONE_EMOJI[m] : '🔒'}
                  </Text>
                  <Text style={[styles.milestoneDay, !unlocked && styles.milestoneDayLocked]}>
                    {m}d
                  </Text>
                  {isNext && <Text style={styles.nextLabel}>next</Text>}
                </View>
              )
            })}
          </View>
        </View>

        {streak.currentStreak === 0 && streak.startDate && (
          <View style={styles.resetCard}>
            <Text style={styles.resetText}>
              Your streak reset. That is not failure — that is data. Start again.
            </Text>
          </View>
        )}
      </ScrollView>

      {showMilestoneModal && <MilestoneModal />}
    </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: colors.muted, textTransform: 'uppercase', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', color: colors.white, marginBottom: 20 },
  streakCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 24, alignItems: 'center', marginBottom: 16 },
  streakNum: { fontSize: 72, fontWeight: '900', color: colors.white, lineHeight: 80 },
  streakSub: { fontSize: 18, color: colors.muted, marginBottom: 8 },
  streakBest: { fontSize: 13, color: colors.muted },
  streakLast: { fontSize: 13, color: colors.muted, marginTop: 4 },
  streakEmoji: { fontSize: 48, marginBottom: 12 },
  streakEmpty: { fontSize: 18, fontWeight: '700', color: colors.muted },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 18, marginBottom: 16 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.muted, textTransform: 'uppercase', marginBottom: 12 },
  checkInBtn: { backgroundColor: colors.red, borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 10 },
  checkInBtnDone: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border },
  checkInBtnText: { color: colors.white, fontWeight: '700', fontSize: 14, letterSpacing: 0.5 },
  checkInHint: { fontSize: 12, color: colors.muted, textAlign: 'center' },
  savedTotal: { fontSize: 32, fontWeight: '800', color: colors.white, marginBottom: 12 },
  assetLine: { fontSize: 14, color: colors.amber, marginBottom: 6 },
  milestoneGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  milestoneBadge: { width: '21%', alignItems: 'center', backgroundColor: colors.surface2, borderRadius: 8, padding: 10, borderWidth: 1, borderColor: colors.border, opacity: 0.4 },
  milestoneBadgeUnlocked: { opacity: 1 },
  milestoneBadgeNext: { borderColor: colors.red, opacity: 1 },
  milestoneEmoji: { fontSize: 24, marginBottom: 4 },
  locked: { opacity: 0.5 },
  milestoneDay: { fontSize: 12, fontWeight: '700', color: colors.white },
  milestoneDayLocked: { color: colors.muted },
  nextLabel: { fontSize: 10, color: colors.red, fontWeight: '700', marginTop: 2 },
  resetCard: { borderWidth: 2, borderColor: colors.red, borderRadius: 10, padding: 16 },
  resetText: { fontSize: 14, color: colors.text, lineHeight: 22 },
})
