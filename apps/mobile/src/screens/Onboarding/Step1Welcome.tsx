import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { colors } from '../../theme/colors'

interface Props { onNext: () => void }

export default function Step1Welcome({ onNext }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>GAMBLING RECOVERY TOOL</Text>
      </View>
      <Text style={styles.title}>Reality{'\n'}Check</Text>
      <Text style={styles.tagline}>Break the digital money illusion.</Text>
      <Text style={styles.body}>
        Gambling turns money into abstract numbers. This app forces you to confront what every loss actually costs — in hours of your life, weeks of groceries, and months of rent.
      </Text>
      <Text style={styles.body}>
        The psychology is simple: when losses become real things you can picture, the urge to gamble weakens. Every feature in this app is built around that principle.
      </Text>
      <TouchableOpacity style={styles.btn} onPress={onNext}>
        <Text style={styles.btnText}>GET STARTED</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 28, justifyContent: 'center' },
  badge: { marginBottom: 16 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: colors.muted, textTransform: 'uppercase' },
  title: { fontSize: 52, fontWeight: '900', color: colors.white, lineHeight: 56, marginBottom: 16 },
  tagline: { fontSize: 20, fontWeight: '700', color: colors.red, marginBottom: 24 },
  body: { fontSize: 15, color: colors.text, lineHeight: 24, marginBottom: 16 },
  btn: { backgroundColor: colors.red, borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 24 },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },
})
