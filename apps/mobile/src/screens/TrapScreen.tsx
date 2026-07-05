import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { colors } from '../theme/colors'

const HOUSE_EDGES = [
  { label: 'Sports Betting', detail: '4.55% edge', edge: 0.0455 },
  { label: 'Slot Machines', detail: '8% edge', edge: 0.08 },
  { label: 'Online Casino / E-Sabong', detail: '10% edge', edge: 0.10 },
]

export default function TrapScreen() {
  const navigation = useNavigation<any>()
  const [weeklyBet, setWeeklyBet] = useState('')
  const [edgeIndex, setEdgeIndex] = useState(0)
  const [result, setResult] = useState<number | null>(null)

  function calculate() {
    const bet = parseFloat(weeklyBet)
    if (!bet || bet <= 0) return
    setResult(bet * 52 * HOUSE_EDGES[edgeIndex].edge)
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>GAMBLING RECOVERY TOOL</Text>
      <Text style={styles.title}>The Trap</Text>
      <Text style={styles.subtitle}>
        The system was engineered by psychologists and mathematicians. This is what it actually does to your brain — and your money.
      </Text>

      {/* Section 1: Skinner Box */}
      <View style={[styles.card, { borderColor: colors.teal }]}>
        <View style={styles.tagTeal}>
          <Text style={styles.tagTealText}>Why You Can't Stop</Text>
        </View>
        <Text style={styles.body}>
          In the 1950s, B.F. Skinner put pigeons in boxes with levers. Sometimes pressing the lever gave food. Sometimes it didn't. The rewards were random.
        </Text>
        <Text style={[styles.body, { marginTop: 12 }]}>
          The pigeons pressed the lever <Text style={styles.bold}>thousands of times</Text> — far more than if food came every time. They kept pressing even after the food stopped completely.
        </Text>
        <Text style={[styles.body, { marginTop: 12 }]}>
          This is called <Text style={styles.bold}>variable ratio reinforcement</Text>. It is the single most addictive behavioral pattern ever discovered.
        </Text>
        <View style={styles.callout}>
          <Text style={styles.calloutBody}>
            Every slot machine. Every roulette wheel. Every sports bet. Is a Skinner box designed for humans. Random rewards. Unpredictable outcomes. Maximum compulsion.
          </Text>
          <Text style={[styles.calloutBody, { color: colors.teal, marginTop: 8 }]}>
            You are not playing a game. You are a pigeon pressing a lever.
          </Text>
        </View>
      </View>

      {/* Section 2: Near-Miss Science */}
      <View style={styles.card}>
        <View style={styles.tagGray}>
          <Text style={styles.tagGrayText}>The Near-Miss Is Not Luck</Text>
        </View>
        <Text style={styles.body}>
          A study published in <Text style={{ fontStyle: 'italic' }}>Nature Neuroscience</Text> found that near-misses activate the brain's reward system{' '}
          <Text style={styles.bold}>almost identically to actual wins</Text>.
        </Text>
        <Text style={[styles.body, { marginTop: 12 }]}>
          Your brain literally cannot tell the difference between almost winning and winning. So you keep playing.
        </Text>
        <Text style={[styles.body, { marginTop: 12 }]}>
          Slot machines are programmed to show near-misses up to <Text style={styles.bold}>30% of the time</Text> — far above statistical chance. The outcome was determined the millisecond you pressed the button. The spinning reels are theater.
        </Text>
        <View style={[styles.callout, { borderLeftColor: colors.teal, marginTop: 12 }]}>
          <Text style={[styles.calloutBody, { color: colors.teal }]}>
            Every "almost" you have ever experienced was carefully engineered. It was not luck. It was a trap.
          </Text>
        </View>
      </View>

      {/* Section 3: Calculator */}
      <View style={styles.card}>
        <View style={styles.tagGray}>
          <Text style={styles.tagGrayText}>Mathematical Certainty Calculator</Text>
        </View>
        <Text style={styles.hint}>
          The house edge means you will lose. Not might lose.{' '}
          <Text style={{ color: colors.white }}>Will lose.</Text>{' '}
          Enter your weekly bet to see the mathematics.
        </Text>

        <Text style={styles.inputLabel}>Weekly Bet Amount (₱)</Text>
        <TextInput
          style={styles.input}
          value={weeklyBet}
          onChangeText={v => { setWeeklyBet(v); setResult(null) }}
          keyboardType="numeric"
          placeholder="e.g. 500"
          placeholderTextColor={colors.muted}
        />

        <Text style={styles.inputLabel}>Type of Gambling</Text>
        <View style={{ marginBottom: 16 }}>
          {HOUSE_EDGES.map((h, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => { setEdgeIndex(i); setResult(null) }}
              style={[styles.edgeBtn, edgeIndex === i && styles.edgeBtnActive, i > 0 && { marginTop: 8 }]}
            >
              <Text style={[styles.edgeBtnLabel, edgeIndex === i && { color: colors.white }]}>
                {h.label}
              </Text>
              <Text style={[styles.edgeBtnDetail, edgeIndex === i && { color: colors.teal }]}>
                {h.detail}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.calcBtn, (!weeklyBet || parseFloat(weeklyBet) <= 0) && styles.calcBtnDisabled]}
          onPress={calculate}
          disabled={!weeklyBet || parseFloat(weeklyBet) <= 0}
        >
          <Text style={styles.calcBtnText}>SHOW ME THE MATH</Text>
        </TouchableOpacity>

        {result !== null && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Mathematical Outcome</Text>
            <Text style={styles.resultAmount}>₱{Math.round(result).toLocaleString()} / year</Text>
            <Text style={styles.body}>
              Betting ₱{parseFloat(weeklyBet).toLocaleString()} per week on {HOUSE_EDGES[edgeIndex].label},
              you will lose approximately <Text style={styles.bold}>₱{Math.round(result).toLocaleString()}</Text> every year.
            </Text>
            <Text style={[styles.body, { marginTop: 12 }]}>
              Over 5 years:{' '}
              <Text style={[styles.bold, { color: colors.teal }]}>₱{Math.round(result * 5).toLocaleString()}</Text>
            </Text>
            <Text style={[styles.hint, { marginTop: 12, marginBottom: 0 }]}>
              This is not a prediction. This is probability mathematics. The only variable is how long it takes.
            </Text>
          </View>
        )}
      </View>

      {/* Section 4: Dark Patterns */}
      <View style={styles.card}>
        <View style={styles.tagGray}>
          <Text style={styles.tagGrayText}>How Betting Apps Trap You</Text>
        </View>
        {[
          {
            label: 'Deposit: instant. Withdrawal: 3–5 business days.',
            detail: 'Every hour your money stays in the app is another hour you might bet it. The friction is intentional.',
          },
          {
            label: 'Free bet offers = first hit free.',
            detail: 'Same psychology as drug dealers giving the first hit free. Get you hooked. Then extract everything.',
          },
          {
            label: 'Push notifications after you win.',
            detail: 'Timed to bring you back during the dopamine high — the exact moment you are most likely to bet again and lose it all.',
          },
          {
            label: 'Streak bonuses and achievements.',
            detail: 'Gamification that makes gambling feel like a game you are progressing in. You are progressing toward bankruptcy.',
          },
        ].map((item, i) => (
          <View key={i} style={[styles.darkPattern, i > 0 && { marginTop: 10 }]}>
            <Text style={styles.darkPatternLabel}>{item.label}</Text>
            <Text style={styles.darkPatternDetail}>{item.detail}</Text>
          </View>
        ))}
      </View>

      {/* Section 5: Truth */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>The Truth</Text>
        <Text style={[styles.bold, { lineHeight: 24 }]}>
          When you can't stop betting, that is not a character flaw. When you chase losses even though you know you shouldn't, that is not weakness.
        </Text>
        <Text style={[styles.body, { marginTop: 12 }]}>
          That is a normal brain responding normally to a system designed to be inescapable. The trap was built by experts. It has captured millions.
        </Text>
        <Text style={[styles.body, { marginTop: 12, color: colors.teal, fontWeight: '700' }]}>
          You are not broken. You are targeted. And now you know exactly how it works.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.ctaBtn}
        onPress={() => navigation.navigate('Barriers')}
      >
        <Text style={styles.ctaBtnText}>BUILD YOUR BARRIERS →</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: colors.muted, textTransform: 'uppercase', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', color: colors.white, marginBottom: 6 },
  subtitle: { fontSize: 13, color: colors.muted, marginBottom: 20, lineHeight: 20 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 18, marginBottom: 16 },
  tagTeal: { alignSelf: 'flex-start', backgroundColor: '#0e2a38', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 12 },
  tagTealText: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.teal, textTransform: 'uppercase' },
  tagGray: { alignSelf: 'flex-start', backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 12 },
  tagGrayText: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.muted, textTransform: 'uppercase' },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.muted, textTransform: 'uppercase', marginBottom: 10 },
  body: { fontSize: 14, color: colors.text, lineHeight: 22 },
  bold: { fontWeight: '700', color: colors.white, fontSize: 14 },
  callout: { backgroundColor: colors.bg, borderLeftWidth: 3, borderLeftColor: colors.teal, borderRadius: 4, padding: 14, marginTop: 12 },
  calloutBody: { fontSize: 14, fontWeight: '700', color: colors.white, lineHeight: 22 },
  hint: { fontSize: 13, color: colors.muted, marginBottom: 16, lineHeight: 20 },
  inputLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.muted, textTransform: 'uppercase', marginBottom: 8 },
  input: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, fontSize: 15, color: colors.white, marginBottom: 16 },
  edgeBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, backgroundColor: colors.surface2 },
  edgeBtnActive: { borderColor: colors.teal, backgroundColor: '#0a2030' },
  edgeBtnLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 2 },
  edgeBtnDetail: { fontSize: 12, color: colors.muted },
  calcBtn: { backgroundColor: colors.teal, borderRadius: 8, padding: 14, alignItems: 'center' },
  calcBtnDisabled: { opacity: 0.4 },
  calcBtnText: { color: colors.white, fontWeight: '700', fontSize: 14, letterSpacing: 0.5 },
  resultCard: { marginTop: 16, backgroundColor: '#0a0a14', borderWidth: 2, borderColor: colors.teal, borderRadius: 10, padding: 18 },
  resultLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.teal, textTransform: 'uppercase', marginBottom: 8 },
  resultAmount: { fontSize: 30, fontWeight: '800', color: colors.teal, marginBottom: 12 },
  darkPattern: { backgroundColor: colors.bg, borderLeftWidth: 3, borderLeftColor: colors.redDim, borderRadius: 4, padding: 12 },
  darkPatternLabel: { fontSize: 13, fontWeight: '700', color: colors.white, marginBottom: 4 },
  darkPatternDetail: { fontSize: 13, color: colors.muted, lineHeight: 20 },
  ctaBtn: { backgroundColor: colors.teal, borderRadius: 10, padding: 18, alignItems: 'center', marginTop: 4 },
  ctaBtnText: { color: colors.white, fontWeight: '900', fontSize: 14, letterSpacing: 1 },
})
