export type { Lang, Translation } from './types'
export { LANGUAGES, tpl } from './types'
export { en } from './en'
export { fil } from './fil'
export { ceb } from './ceb'
export { hil } from './hil'
export { ilo } from './ilo'

import type { Lang, Translation } from './types'
import { en } from './en'
import { fil } from './fil'
import { ceb } from './ceb'
import { hil } from './hil'
import { ilo } from './ilo'

export const translations: Record<Lang, Translation> = { en, fil, ceb, hil, ilo }
