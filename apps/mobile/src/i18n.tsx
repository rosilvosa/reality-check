import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { translations, LANGUAGES } from '@rc/core'
import type { Lang, Translation } from '@rc/core'

const STORAGE_KEY = 'rc_lang'

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: Translation
}

const Ctx = createContext<LangCtx>({
  lang: 'en',
  setLang: () => {},
  t: translations.en,
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(stored => {
      if (stored && stored in translations) setLangState(stored as Lang)
    })
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    AsyncStorage.setItem(STORAGE_KEY, l)
  }

  return (
    <Ctx.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </Ctx.Provider>
  )
}

export function useT(): Translation { return useContext(Ctx).t }
export function useLang(): { lang: Lang; setLang: (l: Lang) => void; languages: typeof LANGUAGES } {
  const { lang, setLang } = useContext(Ctx)
  return { lang, setLang, languages: LANGUAGES }
}
