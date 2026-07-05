import { createContext, useContext, useState, type ReactNode } from 'react'
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

function detectLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null
    if (stored && stored in translations) return stored
  } catch {}
  const browser = navigator.language.split('-')[0]
  if (browser === 'fil' || browser === 'tl') return 'fil'
  if (browser === 'ceb') return 'ceb'
  if (browser === 'hil') return 'hil'
  if (browser === 'ilo') return 'ilo'
  return 'en'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang)

  function setLang(l: Lang) {
    setLangState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch {}
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
