import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors } from '../theme/colors'

const AS_KEY = 'rc_barriers'

const BARRIERS = [
  {
    id: 'self_exclusion',
    title: 'Register for Self-Exclusion',
    description:
      'PAGCOR runs a self-exclusion program that bans you from all licensed casinos in the Philippines. Contact them directly to register.',
    action: { label: 'pagcor.gov.ph', url: 'https://www.pagcor.gov.ph' },
  },
  {
    id: 'delete_apps',
    title: 'Delete All Betting Apps',
    description:
      'Remove every gambling app from your phone right now. Not archive — delete. Including the ones you "only use sometimes." All of them.',
    action: null,
  },
  {
    id: 'block_sites',
    title: 'Block Betting Websites',
    description:
      'Install a site blocker (BlockSite on Android, 1Blocker on iOS) and add every site you use. Set a password you will not remember. Make the path back require effort.',
    action: null,
  },
  {
    id: 'payment_methods',
    title: 'Remove Saved Payment Methods',
    description:
      'Log into every betting account and delete your saved GCash, Maya, or card details. Friction stops impulsive deposits. Every extra step is money you keep.',
    action: null,
  },
  {
    id: 'tell_someone',
    title: 'Tell One Trusted Person',
    description:
      'Tell one person — a family member, a friend, anyone you trust. You do not have to explain everything. Just: "I am trying to stop gambling and I need you to know."',
    action: null,
  },
  {
    id: 'helpline',
    title: 'Save the NCMH Helpline',
    description:
      'NCMH Crisis Line: 1553. Free, 24/7, covers addiction. Save the number now — not when you need it, because when you need it you will not look it up.',
    action: { label: 'Call 1553', url: 'tel:1553' },
  },
]

export default function BarriersScreen() {
  const [done, setDone] = useState<Set<string>>(new Set())

  useEffect(() => {
    AsyncStorage.getItem(AS_KEY).then(raw => {
      if (raw) setDone(new Set(JSON.parse(raw)))
    })
  }, [])

  function toggle(id: string) {
    setDone(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      AsyncStorage.setItem(AS_KEY, JSON.stringify([...next]))
      return next
    })
  }

  const count = done.size
  const total = BARRIERS.length
  const allDone = count === total
  const pct = (count / total) * 100

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Build Your Barriers</Text>
      <Text style={styles.subtitle}>
        The trap only works when access is easy. Every barrier you add makes gambling harder. Harder means fewer relapses.
      </Text>

      {/* Progress */}
      <View style={styles.card}>
        <View style={styles.progressHeader}>
          <Text style={styles.fieldLabel}>Barriers in Place</Text>
          <Text style={[styles.progressCount, allDone && styles.progressCountDone]}>
            {count} / {total}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${pct}%` as any },
              allDone && styles.progressFillDone,
            ]}
          />
        </View>
        {allDone && (
          <Text style={styles.allDoneText}>
            Every barrier is in place. You have done the hard work. Keep going.
          </Text>
        )}
        {!allDone && count > 0 && (
          <Text style={styles.remainText}>
            {total - count} barrier{total - count !== 1 ? 's' : ''} remaining. Each one makes relapse harder.
          </Text>
        )}
      </View>

      {/* Checklist */}
      {BARRIERS.map(b => {
        const checked = done.has(b.id)
        return (
          <View key={b.id} style={[styles.barrierCard, checked && styles.barrierCardDone]}>
            <View style={styles.barrierRow}>
              <TouchableOpacity
                onPress={() => toggle(b.id)}
                style={[styles.checkbox, checked && styles.checkboxDone]}
              >
                {checked && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <View style={styles.barrierContent}>
                <Text style={[styles.barrierTitle, checked && styles.barrierTitleDone]}>
                  {b.title}
                </Text>
                <Text style={[styles.barrierDesc, checked && styles.barrierDescDone]}>
                  {b.description}
                </Text>
                {b.action && !checked && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(b.action!.url)}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionBtnText}>{b.action.label} →</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )
      })}

      {/* Footer */}
      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Why This Works</Text>
        <Text style={styles.body}>
          The betting app on your phone was designed to make access instant and withdrawal slow. Every barrier you create reverses that asymmetry.
        </Text>
        <Text style={[styles.body, { marginTop: 12 }]}>
          You do not need willpower if gambling requires 10 steps instead of one tap. Barriers are not about trust. They are about giving your rational brain time to catch up to the urge.
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: colors.white, marginBottom: 6 },
  subtitle: { fontSize: 13, color: colors.muted, marginBottom: 20, lineHeight: 20 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 18, marginBottom: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.muted, textTransform: 'uppercase' },
  progressCount: { fontSize: 16, fontWeight: '800', color: colors.white },
  progressCountDone: { color: '#4ade80' },
  progressTrack: { height: 8, backgroundColor: colors.surface2, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: colors.teal, borderRadius: 4 },
  progressFillDone: { backgroundColor: '#22c55e' },
  allDoneText: { fontSize: 13, color: '#4ade80', fontWeight: '700', marginTop: 10 },
  remainText: { fontSize: 12, color: colors.muted, marginTop: 8 },
  barrierCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 18, marginBottom: 12 },
  barrierCardDone: { backgroundColor: '#0a180a', borderColor: '#1a4a1a' },
  barrierRow: { flexDirection: 'row' },
  checkbox: { width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', marginTop: 2, marginRight: 14, flexShrink: 0 },
  checkboxDone: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  checkmark: { color: colors.white, fontSize: 13, fontWeight: '700' },
  barrierContent: { flex: 1 },
  barrierTitle: { fontSize: 15, fontWeight: '700', color: colors.white, marginBottom: 6 },
  barrierTitleDone: { color: colors.muted, textDecorationLine: 'line-through' },
  barrierDesc: { fontSize: 13, color: colors.muted, lineHeight: 20 },
  barrierDescDone: { opacity: 0.5 },
  actionBtn: { marginTop: 10, alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.teal, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
  actionBtnText: { fontSize: 12, fontWeight: '700', color: colors.teal },
  body: { fontSize: 14, color: colors.text, lineHeight: 22 },
})
