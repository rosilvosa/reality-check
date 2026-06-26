import React, { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors } from '../theme/colors'
import { URGE_MESSAGES } from '@rc/core'
import { useNavigation } from '@react-navigation/native'

const DURATIONS = [5, 10, 15, 30]

export default function UrgeTimerScreen() {
  const navigation = useNavigation()
  const [selectedDuration, setSelectedDuration] = useState(15)
  const [running, setRunning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(15 * 60)
  const [msgIndex, setMsgIndex] = useState(0)
  const [resisted, setResisted] = useState(false)
  const interval = useRef<ReturnType<typeof setInterval> | null>(null)
  const msgInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  function start() {
    setSecondsLeft(selectedDuration * 60)
    setRunning(true)
    setResisted(false)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    interval.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(interval.current!)
          clearInterval(msgInterval.current!)
          setRunning(false)
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          return 0
        }
        return s - 1
      })
    }, 1000)

    msgInterval.current = setInterval(() => {
      setMsgIndex(i => (i + 1) % URGE_MESSAGES.length)
    }, 30000)
  }

  function cancel() {
    clearInterval(interval.current!)
    clearInterval(msgInterval.current!)
    setRunning(false)
    navigation.goBack()
  }

  function handleResisted() {
    clearInterval(interval.current!)
    clearInterval(msgInterval.current!)
    setRunning(false)
    setResisted(true)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }

  useEffect(() => () => {
    clearInterval(interval.current!)
    clearInterval(msgInterval.current!)
  }, [])

  const mins = Math.floor(secondsLeft / 60).toString().padStart(2, '0')
  const secs = (secondsLeft % 60).toString().padStart(2, '0')

  if (resisted) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.resistedEmoji}>🛡️</Text>
        <Text style={styles.resistedTitle}>You resisted.</Text>
        <Text style={styles.resistedBody}>
          That was not easy. The urge was real. You chose differently. Every time you do this, the urge gets weaker.
        </Text>
        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.doneBtnText}>BACK</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Urge Timer</Text>
      <Text style={styles.sub}>Wait out the urge. It will pass. Your money will not.</Text>

      {!running && (
        <>
          <Text style={styles.fieldLabel}>HOW LONG?</Text>
          <View style={styles.durationRow}>
            {DURATIONS.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.durationBtn, selectedDuration === d && styles.durationBtnActive]}
                onPress={() => setSelectedDuration(d)}
              >
                <Text style={[styles.durationTxt, selectedDuration === d && styles.durationTxtActive]}>
                  {d}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.startBtn} onPress={start}>
            <Text style={styles.startBtnText}>START TIMER</Text>
          </TouchableOpacity>
        </>
      )}

      {running && (
        <>
          <View style={styles.timerDisplay}>
            <Text style={styles.timerText}>{mins}:{secs}</Text>
            <Text style={styles.timerSub}>remaining</Text>
          </View>

          <View style={styles.msgCard}>
            <Text style={styles.msgText}>{URGE_MESSAGES[msgIndex]}</Text>
          </View>

          <TouchableOpacity style={styles.resistedBtn} onPress={handleResisted}>
            <Text style={styles.resistedBtnText}>I RESISTED</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={cancel}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </>
      )}

      {secondsLeft === 0 && !running && !resisted && (
        <View style={styles.doneCard}>
          <Text style={styles.doneTitle}>Time is up.</Text>
          <Text style={styles.doneBody}>The urge has passed. Do not gamble. You just proved you can wait.</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>BACK</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, paddingBottom: 60 },
  centeredContainer: { flex: 1, backgroundColor: colors.bg, padding: 32, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: colors.white, marginBottom: 8 },
  sub: { fontSize: 14, color: colors.muted, marginBottom: 28, lineHeight: 22 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.muted, textTransform: 'uppercase', marginBottom: 12 },
  durationRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  durationBtn: { flex: 1, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 14, alignItems: 'center' },
  durationBtnActive: { borderColor: colors.red, backgroundColor: colors.redDim },
  durationTxt: { fontSize: 16, fontWeight: '700', color: colors.muted },
  durationTxtActive: { color: colors.red },
  startBtn: { backgroundColor: colors.red, borderRadius: 8, padding: 16, alignItems: 'center' },
  startBtnText: { color: colors.white, fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },
  timerDisplay: { alignItems: 'center', marginBottom: 32 },
  timerText: { fontSize: 80, fontWeight: '900', color: colors.white, letterSpacing: -2 },
  timerSub: { fontSize: 16, color: colors.muted },
  msgCard: { backgroundColor: colors.surface, borderLeftWidth: 3, borderLeftColor: colors.red, borderRadius: 8, padding: 16, marginBottom: 24 },
  msgText: { fontSize: 16, fontWeight: '700', color: colors.white, lineHeight: 24 },
  resistedBtn: { backgroundColor: colors.red, borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 12 },
  resistedBtnText: { color: colors.white, fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },
  cancelBtn: { alignItems: 'center', padding: 12 },
  cancelBtnText: { color: colors.muted, fontSize: 14 },
  doneCard: { backgroundColor: colors.surface, borderRadius: 10, padding: 20 },
  doneTitle: { fontSize: 22, fontWeight: '800', color: colors.white, marginBottom: 8 },
  doneBody: { fontSize: 14, color: colors.text, lineHeight: 22, marginBottom: 20 },
  doneBtn: { backgroundColor: colors.red, borderRadius: 8, padding: 14, alignItems: 'center' },
  doneBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  resistedEmoji: { fontSize: 64, marginBottom: 20 },
  resistedTitle: { fontSize: 28, fontWeight: '800', color: colors.white, marginBottom: 12 },
  resistedBody: { fontSize: 15, color: colors.text, lineHeight: 24, textAlign: 'center', marginBottom: 32 },
})
