import { StyleSheet } from 'react-native'
import { colors } from './colors'

export const typography = StyleSheet.create({
  h1: { fontSize: 28, fontWeight: '800', color: colors.white },
  h2: { fontSize: 22, fontWeight: '700', color: colors.white },
  h3: { fontSize: 18, fontWeight: '700', color: colors.white },
  body: { fontSize: 15, color: colors.text, lineHeight: 22 },
  small: { fontSize: 13, color: colors.muted },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: colors.muted },
  red: { color: colors.red },
  amber: { color: colors.amber },
  muted: { color: colors.muted },
  white: { color: colors.white },
})
