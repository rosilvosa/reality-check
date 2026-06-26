import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { colors } from '../theme/colors'
import { useSettingsStore } from '../stores/settingsStore'
import { calcAssets } from '@rc/core'

export default function AssetRealityScreen() {
  const [loss, setLoss] = useState('')
  const [results, setResults] = useState<Array<{ name: string; cost: number; units: number }> | null>(null)
  const settings = useSettingsStore(s => s.settings)

  function calculate() {
    if (!loss) return
    setResults(calcAssets(parseFloat(loss), settings.assets))
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>GAMBLING RECOVERY TOOL</Text>
      <Text style={styles.title}>Asset Reality{'\n'}Converter</Text>
      <Text style={styles.sub}>Money on a screen feels unreal. Groceries, rent, and medicine do not.</Text>

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>LOSS AMOUNT (₱)</Text>
        <TextInput
          style={styles.input}
          value={loss}
          onChangeText={setLoss}
          keyboardType="numeric"
          placeholder="e.g. 5000"
          placeholderTextColor={colors.muted}
        />
        <TouchableOpacity
          style={[styles.btn, !loss && styles.btnDisabled]}
          onPress={calculate}
          disabled={!loss}
        >
          <Text style={styles.btnText}>SEE WHAT YOU BURNED</Text>
        </TouchableOpacity>
      </View>

      {results && results.length > 0 && (
        <View style={styles.resultCard}>
          <Text style={styles.resultBig}>You burned ₱{parseFloat(loss).toLocaleString()}</Text>
          {results.map((r, i) => (
            <View key={i} style={styles.assetRow}>
              <Text style={styles.assetName}>{r.name}</Text>
              <Text style={styles.assetValue}>
                {r.units >= 1
                  ? `${r.units.toFixed(2)}× — ${r.units.toFixed(1)} full payments`
                  : `${(r.units * 100).toFixed(0)}% of one payment`}
              </Text>
            </View>
          ))}
        </View>
      )}

      {results && results.length === 0 && (
        <View style={styles.noAssets}>
          <Text style={styles.noAssetsText}>No assets configured. Go to Settings and add your household costs.</Text>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: colors.muted, textTransform: 'uppercase', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', color: colors.white, marginBottom: 8 },
  sub: { fontSize: 14, color: colors.muted, lineHeight: 22, marginBottom: 20 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 18, marginBottom: 16 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.muted, textTransform: 'uppercase', marginBottom: 8 },
  input: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 14, fontSize: 16, color: colors.white, marginBottom: 14 },
  btn: { backgroundColor: colors.amber, borderRadius: 8, padding: 14, alignItems: 'center' },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
  resultCard: { backgroundColor: colors.surface, borderLeftWidth: 3, borderLeftColor: colors.amber, borderRadius: 8, padding: 16, marginBottom: 16 },
  resultBig: { fontSize: 20, fontWeight: '800', color: colors.amber, marginBottom: 14 },
  assetRow: { backgroundColor: colors.bg, borderRadius: 8, padding: 12, marginBottom: 8 },
  assetName: { fontSize: 14, fontWeight: '700', color: colors.white, marginBottom: 4 },
  assetValue: { fontSize: 14, color: colors.amber },
  noAssets: { backgroundColor: colors.surface, borderRadius: 8, padding: 16 },
  noAssetsText: { color: colors.muted, fontSize: 14 },
})
