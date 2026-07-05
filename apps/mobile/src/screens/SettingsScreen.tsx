import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { colors } from '../theme/colors'
import { useSettingsStore } from '../stores/settingsStore'
import { useAuthStore } from '../stores/authStore'
import type { Settings, Asset } from '@rc/core'
import { useT, useLang } from '../i18n'
import { tpl } from '@rc/core'

const KOFI_URL = 'https://ko-fi.com/rosilvosa'

export default function SettingsScreen() {
  const navigation = useNavigation<any>()
  const { settings, load, save } = useSettingsStore()
  const { user, isPro } = useAuthStore()
  const t = useT()
  const { lang, setLang, languages } = useLang()
  const [monthly, setMonthly] = useState('')
  const [hours, setHours] = useState('176')
  const [assets, setAssets] = useState<Asset[]>([])

  useEffect(() => {
    load().then(() => {
      setMonthly(settings.monthlyPay > 0 ? String(settings.monthlyPay) : '')
      setHours(String(settings.hoursPerMonth))
      setAssets(settings.assets)
    })
  }, [])

  function updateAsset(i: number, field: 'name' | 'cost', value: string) {
    setAssets(prev => prev.map((a, idx) =>
      idx === i ? { ...a, [field]: field === 'cost' ? parseFloat(value) || 0 : value } : a
    ))
  }

  async function handleSave() {
    const updated: Settings = {
      monthlyPay: parseFloat(monthly) || 0,
      hoursPerMonth: parseFloat(hours) || 176,
      assets: assets.filter(a => a.name && a.cost > 0),
    }
    await save(updated)
    Alert.alert(t.common.saved, '')
  }

  const rate = monthly && hours
    ? (parseFloat(monthly) / parseFloat(hours)).toFixed(2)
    : null

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t.settings.title}</Text>

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>{t.settings.accountSection}</Text>
        {user && !user.isAnonymous ? (
          <>
            <Text style={styles.accountEmail}>{user.email}</Text>
            {isPro ? (
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>{t.settings.proActive}</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.upgradeBtn}>
                <Text style={styles.upgradeBtnText}>{t.settings.upgradeBtn}</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            <Text style={styles.syncHint}>{t.settings.signInHint}</Text>
            <TouchableOpacity style={styles.ghostBtn}>
              <Text style={styles.ghostBtnText}>{t.settings.signInBtn}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>{t.settings.incomeSection}</Text>
        <Text style={styles.inputLabel}>{t.settings.labelMonthly}</Text>
        <TextInput
          style={styles.input}
          value={monthly}
          onChangeText={setMonthly}
          keyboardType="numeric"
          placeholder="e.g. 25000"
          placeholderTextColor={colors.muted}
        />
        <Text style={styles.inputLabel}>{t.settings.labelHours}</Text>
        <TextInput
          style={styles.input}
          value={hours}
          onChangeText={setHours}
          keyboardType="numeric"
          placeholder="176"
          placeholderTextColor={colors.muted}
        />
        {rate && <Text style={styles.derived}>{tpl(t.settings.hourlyRate, { rate })}</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>{t.settings.assetsSection}</Text>
        {assets.map((a, i) => (
          <View key={i} style={styles.assetRow}>
            <TextInput
              style={[styles.input, { flex: 2, marginBottom: 0 }]}
              value={a.name}
              onChangeText={v => updateAsset(i, 'name', v)}
              placeholder={t.settings.assetNamePlaceholder}
              placeholderTextColor={colors.muted}
            />
            <TextInput
              style={[styles.input, { flex: 1, marginLeft: 8, marginBottom: 0 }]}
              value={a.cost > 0 ? String(a.cost) : ''}
              onChangeText={v => updateAsset(i, 'cost', v)}
              keyboardType="numeric"
              placeholder="₱"
              placeholderTextColor={colors.muted}
            />
            <TouchableOpacity onPress={() => setAssets(prev => prev.filter((_, idx) => idx !== i))} style={styles.removeBtn}>
              <Text style={styles.removeTxt}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          style={[styles.ghostBtn, { marginTop: 10 }]}
          onPress={() => setAssets(prev => [...prev, { name: '', cost: 0 }])}
        >
          <Text style={styles.ghostBtnText}>{t.settings.addAsset}</Text>
        </TouchableOpacity>
      </View>

      {/* Language Selector */}
      <View style={styles.card}>
        <Text style={styles.fieldLabel}>{t.settings.langSection}</Text>
        <View style={styles.langRow}>
          {languages.map(l => (
            <TouchableOpacity
              key={l.code}
              style={[styles.langBtn, lang === l.code && styles.langBtnActive]}
              onPress={() => setLang(l.code)}
            >
              <Text style={[styles.langBtnText, lang === l.code && styles.langBtnTextActive]}>
                {l.native}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>{t.settings.saveBtn}</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>{t.settings.recoveryTools}</Text>
        <TouchableOpacity
          style={styles.toolRow}
          onPress={() => navigation.navigate('Barriers')}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.toolTitle}>{t.settings.barriersTitle}</Text>
            <Text style={styles.toolDesc}>{t.settings.barriersDesc}</Text>
          </View>
          <Text style={styles.toolArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>{t.settings.supportSection}</Text>
        <Text style={[styles.syncHint, { marginBottom: 12 }]}>{t.settings.supportHint}</Text>
        <TouchableOpacity
          style={styles.kofiBtn}
          onPress={() => Linking.openURL(KOFI_URL)}
        >
          <Text style={styles.kofiBtnText}>{t.settings.kofiBtn}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 28, fontWeight: '800', color: colors.white, marginBottom: 20 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 18, marginBottom: 16 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.muted, textTransform: 'uppercase', marginBottom: 12 },
  inputLabel: { fontSize: 13, color: colors.muted, marginBottom: 6 },
  input: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, fontSize: 15, color: colors.white, marginBottom: 12 },
  derived: { fontSize: 13, color: colors.muted },
  assetRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  removeBtn: { padding: 10, marginLeft: 6 },
  removeTxt: { color: colors.muted, fontSize: 16 },
  accountEmail: { fontSize: 15, color: colors.white, marginBottom: 12 },
  proBadge: { backgroundColor: '#1a3a1a', borderRadius: 8, padding: 12, alignItems: 'center' },
  proBadgeText: { color: '#86efac', fontWeight: '700', fontSize: 14 },
  upgradeBtn: { backgroundColor: colors.red, borderRadius: 8, padding: 14, alignItems: 'center' },
  upgradeBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  syncHint: { fontSize: 13, color: colors.muted, marginBottom: 12, lineHeight: 20 },
  ghostBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, alignItems: 'center' },
  ghostBtnText: { color: colors.text, fontSize: 14 },
  saveBtn: { backgroundColor: colors.teal, borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 16 },
  saveBtnText: { color: colors.white, fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },
  toolRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  toolTitle: { fontSize: 15, fontWeight: '700', color: colors.white, marginBottom: 2 },
  toolDesc: { fontSize: 12, color: colors.muted },
  toolArrow: { fontSize: 16, color: colors.muted, marginLeft: 10 },
  kofiBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 14, alignItems: 'center' },
  kofiBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  langBtnActive: { backgroundColor: colors.red, borderColor: colors.red },
  langBtnText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  langBtnTextActive: { color: colors.white },
})
