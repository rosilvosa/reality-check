import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Linking, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors } from '../theme/colors'

interface Contact {
  id: string
  name: string
  phone: string
}

export default function CallFriendScreen() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => { loadContacts() }, [])

  async function loadContacts() {
    const raw = await AsyncStorage.getItem('rc_contacts')
    if (raw) setContacts(JSON.parse(raw))
  }

  async function addContact() {
    if (!name.trim() || !phone.trim()) return
    const updated = [...contacts, { id: Date.now().toString(), name: name.trim(), phone: phone.trim() }]
    await AsyncStorage.setItem('rc_contacts', JSON.stringify(updated))
    setContacts(updated)
    setName('')
    setPhone('')
  }

  async function removeContact(id: string) {
    const updated = contacts.filter(c => c.id !== id)
    await AsyncStorage.setItem('rc_contacts', JSON.stringify(updated))
    setContacts(updated)
  }

  function callContact(phone: string, name: string) {
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert('Cannot make call', 'Please dial manually: ' + phone)
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Call a Friend</Text>
      <Text style={styles.header}>When the urge hits, call a human. It works.</Text>

      {contacts.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            Add someone you trust — a family member, friend, or recovery sponsor. One phone call has ended a thousand relapses.
          </Text>
        </View>
      )}

      {contacts.map(c => (
        <View key={c.id} style={styles.contactCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{c.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{c.name}</Text>
            <Text style={styles.contactPhone}>{c.phone}</Text>
          </View>
          <TouchableOpacity style={styles.callBtn} onPress={() => callContact(c.phone, c.name)}>
            <Text style={styles.callBtnText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeContact(c.id)} style={styles.removeBtn}>
            <Text style={styles.removeTxt}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.addCard}>
        <Text style={styles.fieldLabel}>ADD CONTACT</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Name"
          placeholderTextColor={colors.muted}
        />
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone number"
          placeholderTextColor={colors.muted}
          keyboardType="phone-pad"
        />
        <TouchableOpacity
          style={[styles.addBtn, (!name.trim() || !phone.trim()) && styles.addBtnDisabled]}
          onPress={addContact}
          disabled={!name.trim() || !phone.trim()}
        >
          <Text style={styles.addBtnText}>ADD</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 28, fontWeight: '800', color: colors.white, marginBottom: 8 },
  header: { fontSize: 15, color: colors.text, lineHeight: 22, marginBottom: 20, fontStyle: 'italic' },
  emptyCard: { backgroundColor: colors.surface, borderRadius: 10, padding: 20, marginBottom: 20 },
  emptyText: { fontSize: 14, color: colors.muted, lineHeight: 22 },
  contactCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.redDim, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: '700', color: colors.red },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 15, fontWeight: '700', color: colors.white },
  contactPhone: { fontSize: 13, color: colors.muted, marginTop: 2 },
  callBtn: { backgroundColor: colors.red, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
  callBtnText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  removeBtn: { padding: 6 },
  removeTxt: { color: colors.muted, fontSize: 16 },
  addCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 18, marginTop: 8 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.muted, textTransform: 'uppercase', marginBottom: 12 },
  input: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 14, fontSize: 15, color: colors.white, marginBottom: 12 },
  addBtn: { backgroundColor: colors.red, borderRadius: 8, padding: 14, alignItems: 'center' },
  addBtnDisabled: { opacity: 0.4 },
  addBtnText: { color: colors.white, fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
})
