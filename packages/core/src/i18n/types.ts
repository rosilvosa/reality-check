export type Lang = 'en' | 'fil' | 'ceb' | 'hil' | 'ilo'

export interface Translation {
  meta: { languageName: string }

  nav: {
    sweat: string; assets: string; journal: string
    nearmiss: string; trap: string; progress: string; settings: string
  }

  common: {
    save: string; cancel: string; back: string; next: string; skip: string
    change: string; close: string; calculate: string; saved: string
  }

  sweat: {
    title: string; subtitle: string; labelLoss: string
    placeholder: string; btn: string; notConfigured: string
    // params: {hours} {loss} {rate} {days} {ceilHours}
    resultHours: string; resultBody: string
    // params: {monthly} {hoursPerMonth} {rate}
    rateNote: string
  }

  assets: {
    title: string; subtitle: string; labelLoss: string
    placeholder: string; btn: string
    // params: {amount}
    resultTitle: string; resultBurned: string
    noAssets: string
    // params: {units} {name}
    unitsGe1: string
    // params: {pct} {name}
    unitsLt1: string
  }

  journal: {
    title: string; interceptTitle: string; interceptSub: string; acknowledge: string
    chasingTitle: string; chasingBody1: string; chasingBody2: string; chasingBody3: string; chasingBtn: string
    labelAmount: string; labelFeeling: string; placeholderAmount: string; placeholderFeeling: string
    recordBtn: string; recorded: string
    // params: {n}
    pastEntries: string
  }

  nearmiss: {
    title: string; subtitle: string; factTag: string; factBody: string
    labelWhat: string; placeholder: string; btn: string
    overrideTag: string
    // params: {input}
    overrideBody: string
    truthTag: string; truthBody: string
  }

  trap: {
    title: string; subtitle: string
    skinnerTag: string; skinnerP1: string; skinnerP2: string; skinnerP3: string
    skinnerCallout: string; skinnerPigeon: string
    nearmissTag: string; nearmissP1: string; nearmissP2: string; nearmissP3: string; nearmissCallout: string
    calcTag: string; calcSub: string; calcLabelBet: string; calcLabelType: string; calcBtn: string
    calcResultTag: string
    // params: {amount}
    calcResultYear: string
    // params: {bet} {type} {amount}
    calcResultBody: string
    // params: {amount}
    calc5year: string
    calcFooter: string
    darkTag: string
    dark: [
      { label: string; detail: string },
      { label: string; detail: string },
      { label: string; detail: string },
      { label: string; detail: string }
    ]
    truthTag: string; truthP1: string; truthP2: string; truthP3: string
    ctaBarriers: string
    // labels for the 3 house edge options (just the name, edge pct appended in code)
    houseEdgeLabels: [string, string, string]
  }

  barriers: {
    title: string; subtitle: string; progressLabel: string; allDone: string
    // params: {n}
    remaining: string
    whyTitle: string; whyP1: string; whyP2: string
    items: [
      { title: string; description: string; actionLabel: string },
      { title: string; description: string },
      { title: string; description: string },
      { title: string; description: string },
      { title: string; description: string },
      { title: string; description: string; actionLabel: string }
    ]
  }

  progress: {
    title: string; daysClean: string; personalBest: string
    // params: {date}
    lastCheckIn: string
    startStreak: string; dailyCheckIn: string; checkInBtn: string; checkedInBtn: string
    checkInHint: string; protectedLabel: string; milestonesLabel: string; nextLabel: string
    resetMsg: string; voidLabel: string; voidChanging: string; voidHint: string
    voidSave: string; voidSaving: string; voidWhenUrge: string; voidChange: string; voidTryInstead: string
  }

  settings: {
    title: string; subtitle: string; accountSection: string; signInHint: string
    signInBtn: string; upgradeBtn: string; freeHint: string; proActive: string; signOut: string
    incomeSection: string; labelMonthly: string; labelHours: string
    // params: {rate}
    hourlyRate: string
    assetsSection: string; assetsHint: string; assetNamePlaceholder: string
    addAsset: string; saveBtn: string; savedBtn: string
    langSection: string; supportSection: string; supportHint: string; kofiBtn: string
    recoveryTools: string; barriersTitle: string; barriersDesc: string
  }

  onboarding: {
    tag: string; title: string; tagline: string; body1: string; body2: string; getStarted: string
    step2Title: string; step2Sub: string; step2LabelPay: string; step2LabelHours: string
    // params: {rate}
    step2HourlyRate: string
    step2Next: string; step3Title: string; step3Sub: string; step3AssetPh: string
    step3Add: string; step3Finish: string
  }

  urge: {
    title: string; sub: string; howLong: string; startBtn: string; remaining: string
    resistedBtn: string; cancelBtn: string; doneTitle: string; doneBody: string; backBtn: string
    resistedTitle: string; resistedBody: string
    messages: [
      string, string, string, string, string, string, string, string, string,
      string, string, string, string, string, string, string, string
    ]
  }

  milestoneMessages: Record<string, string>

  void: {
    excitement: { label: string; emoji: string; description: string; reframe: string; alternatives: [string, string, string, string] }
    escape: { label: string; emoji: string; description: string; reframe: string; alternatives: [string, string, string, string] }
    social: { label: string; emoji: string; description: string; reframe: string; alternatives: [string, string, string, string] }
    stress: { label: string; emoji: string; description: string; reframe: string; alternatives: [string, string, string, string] }
  }
}

export const LANGUAGES: { code: Lang; label: string; native: string }[] = [
  { code: 'en',  label: 'English',     native: 'English'   },
  { code: 'fil', label: 'Filipino',    native: 'Filipino'  },
  { code: 'ceb', label: 'Cebuano',     native: 'Bisaya'    },
  { code: 'hil', label: 'Hiligaynon', native: 'Ilonggo'   },
  { code: 'ilo', label: 'Ilocano',     native: 'Ilocano'   },
]

/** Replace {key} placeholders. tpl('Hello {name}', {name:'Ron'}) → 'Hello Ron' */
export function tpl(str: string, vars: Record<string, string | number>): string {
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))
}
