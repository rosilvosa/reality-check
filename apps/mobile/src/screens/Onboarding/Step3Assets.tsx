import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { colors } from '../../theme/colors'
import type { Asset } from '@rc/core'

interface Props {
  onComplete: (assets: Asset[]) => void
}

const DEFAULTS: Asset[] = [
  { name: '1 Week of Groceries', cost: 1500 },
  { name: '1 Month of Rent', cost: 8000 },
  { name: '1 Month of Utilities', cost: 2000 },
  { name: '1 Month of Medicine', cost: 1200 },
]

export default function Step3Assets({ onComplete }: Props) {
  const [assets, setAssets] = useState<Asset[]>(DEFAULTS)

  function update(i: number, field: 'name' | 'cost', value: string) {
    setAssets(prev => prev.map((a, idx) =>
      idx === i ? { ...a, [field]: field === 'cost' ? parseFloat(value) || 0 : value } : a
    ))
  }

  function add() {
    setAssets(prev => [...prev, { name: '', cost: 0 }])
  }

  function remove(i: number) {
    setAssets(prev => prev.filter((_, idx) => idx !== i))
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Real-Life Costs</Text>
      <Text style={styles.sub}>
        These are the things your money actually pays for. Every loss will be converted into these real items.
      </Text>
      {assets.map((a, i) => (
        <View key={i} style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 2 }]}
            value={a.name}
            onChangeText={v => update(i, 'name', v)}
            placeholder="Asset name"
            placeholderTextColor={colors.muted}
          />
          <TextInput
            style={[styles.input, { flex: 1, marginLeft: 8 }]}
            value={a.cost > 0 ? String(a.cost) : ''}
            onChangeText={v => update(i, 'cost', v)}
            keyboardType="numeric"
            placeholder="₱"
            placeholderTextColor={colors.muted}
          />
          <TouchableOpacity onPress={() => remove(i)} style={styles.removeBtn}>
            <Text style={styles.removeTxt}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={styles.addBtn} onPress={add}>
        <Text style={styles.addTxt}>+ Add Asset</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => onComplete(assets.filter(a => a.name && a.cost > 0))}
      >
        <Text style={styles.btnText}>START RECOVERY</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 28, paddingBottom: 60 },
  title: { fontSize: 28, fontWeight: '800', color: colors.white, marginBottom: 8 },
  sub: { fontSize: 14, color: colors.muted, lineHeight: 22, marginBottom: 28 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  input: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, fontSize: 14, color: colors.white },
  removeBtn: { padding: 10, marginLeft: 6 },
  removeTxt: { color: colors.muted, fontSize: 16 },
  addBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 20 },
  addTxt: { color: colors.text, fontSize: 14 },
  btn: { backgroundColor: colors.red, borderRadius: 8, padding: 16, alignItems: 'center' },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },
})
