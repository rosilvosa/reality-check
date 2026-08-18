export type Lang = 'en' | 'fil' | 'ceb' | 'hil' | 'ilo'

export interface Translation {
  meta: { languageName: string }

  nav: {
    home: string
    sweat: string; assets: string; journal: string
    nearmiss: string; trap: string; progress: string; settings: string
    community: string; help: string
    lost: string
    barriers: string
    watch: string
    more: string
  }

  common: {
    save: string; cancel: string; back: string; next: string; skip: string
    change: string; close: string; calculate: string; saved: string
    themeLight: string; themeDark: string
  }

  home: {
    tag: string
    subtitle: string
    checkInNow: string
    checkedIn: string
    lostToday: string
    daysLabel: string
    startHint: string
    lostBtn: string
    lostHint: string
    whyBtn: string
    whyHint: string
    writeBtn: string
    writeHint: string
    lastEntry: string
    seeProgress: string
    helpBtn: string
    helpHint: string
    communityBtn: string
    communityHint: string
    installTitle: string
    installBody: string
    installBtn: string
    installIos: string
    installDismiss: string
    openBrowserTitle: string
    openBrowserBody: string
    openBrowserBtn: string
    openBrowserHow: string
    togetherToday: string
    togetherWeek: string
    togetherHint: string
  }

  lost: {
    title: string
    subtitle: string
    almostQ: string
    almostYes: string
    almostNo: string
    writeNext: string
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
    title: string; subtitle: string; interceptTitle: string; interceptSub: string; acknowledge: string
    chasingTitle: string; chasingBody1: string; chasingBody2: string; chasingBody3: string; chasingBtn: string
    labelAmount: string; labelFeeling: string; placeholderAmount: string; placeholderFeeling: string
    recordBtn: string; recorded: string; saveFailed: string
    recordedHint: string; streakReset: string
    nudgeBody: string; nudgeAction: string; nudgeDismiss: string
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
    calcTab: string
    whyLink: string
    whyTitle: string
    // labels for the 3 house edge options (just the name, edge pct appended in code)
    houseEdgeLabels: [string, string, string]
  }

  watch: {
    title: string; subtitle: string; langNote: string
    psychology: string; recovery: string
    openOnYouTube: string; playNote: string
    suggestBtn: string; suggestHint: string
    // params: {n}
    minutes: string
  }

  barriers: {
    title: string; subtitle: string; progressLabel: string; allDone: string
    // params: {n}
    remaining: string
    whyTitle: string; whyP1: string; whyP2: string
    items: [
      { title: string; description: string; actionLabel: string },
      { title: string; description: string },
      { title: string; description: string; actionLabel: string },
      { title: string; description: string },
      { title: string; description: string },
      { title: string; description: string; actionLabel: string },
      { title: string; description: string; actionLabel: string }
    ]
  }

  progress: {
    title: string; daysClean: string; personalBest: string
    // params: {date}
    lastCheckIn: string
    startStreak: string; dailyCheckIn: string; checkInBtn: string; checkedInBtn: string
    checkInHint: string; protectedLabel: string; milestonesLabel: string; nextLabel: string
    costHint: string; assetsEmpty: string
    backupLink: string
    // params: {n} {d}
    nextGoal: string
    // params: {d}
    nextGoalOne: string
    resetMsg: string; voidLabel: string; voidChanging: string; voidHint: string
    voidSave: string; voidSaving: string; voidWhenUrge: string; voidChange: string; voidTryInstead: string
  }

  settings: {
    title: string; subtitle: string; accountSection: string; signInHint: string
    signInBtn: string; upgradeBtn: string; freeHint: string; proActive: string; signOut: string
    signOutTitle: string; signOutBody: string
    dangerSection: string; deleteWhat: string; deleteSaveFirst: string
    deleteContinue: string; deleteFinalTitle: string; deleteFinalBody: string; deleteFinalBtn: string
    incomeSection: string; labelMonthly: string; labelHours: string
    // params: {rate}
    hourlyRate: string
    assetsSection: string; assetsHint: string; assetNamePlaceholder: string
    assetCostPlaceholder: string
    addAsset: string; saveBtn: string; savedBtn: string
    currencySection: string; currencyHint: string
    helpRegionSection: string; helpRegionHint: string
    langSection: string
    langUnreviewed: string
    recoveryTools: string; barriersTitle: string; barriersDesc: string
    findHelpTitle: string; findHelpDesc: string
    communityTitle: string; communityDesc: string
    syncActive: string
    syncNowBtn: string; syncNowHint: string; syncingBtn: string; syncDoneBtn: string; syncFail: string; saveFailed: string
    deleteAccount: string; deleteConfirm: string
    privacyLink: string; termsLink: string
    sourceCode: string; sourceHint: string
    missionLink: string
    updatesLink: string
    contactLink: string
  }

  onboarding: {
    tag: string; title: string; tagline: string; body1: string; body2: string; getStarted: string
    step2Title: string; step2Sub: string; step2LabelPay: string; step2LabelHours: string
    // params: {rate}
    step2HourlyRate: string
    step2Next: string; step3Title: string; step3Sub: string; step3AssetPh: string
    step3Add: string; step3Finish: string
    laterBtn: string
    toolsTitle: string; toolsSub: string
    toolLost: string; toolJournal: string; toolTrap: string
    toolBarriers: string; toolHelp: string; toolProgress: string
    finishCta: string
  }

  mission: {
    title: string
    tag: string
    body1: string
    body2: string
    belief1Title: string
    belief1Body: string
    belief2Title: string
    belief2Body: string
    howTitle: string
    how1Title: string
    how1Body: string
    how2Title: string
    how2Body: string
    ctaSite: string
    ctaAbout: string
    ctaSoon: string
  }

  community: {
    title: string
    subtitle: string
    hero: string
    filterAll: string
    filterTips: string
    filterUrge: string
    filterQuestions: string
    filterVent: string
    countryLabel: string
    countryAll: string
    composeHint: string
    typeTip: string
    typeUrge: string
    typeQuestion: string
    typeVent: string
    postedAs: string
    postBtn: string
    empty: string
    rules: string
    deletePost: string
    reportBtn: string; reported: string
    removeBtn: string; removeConfirm: string
    // params: {n}
    reportsLabel: string
    // params: {n}
    filterReported: string
    posting: string
    failed: string
    loadFailed: string
    retry: string
  }

  textSize: {
    section: string; hint: string
    normal: string; large: string
  }

  backup: {
    section: string; hint: string
    exportBtn: string; importBtn: string
    privacyNote: string; restoreNote: string
    // params: {n}
    done: string; doneNone: string
    exported: string; failed: string
  }

  contact: {
    title: string
    subtitle: string
    typeLabel: string
    typeBug: string
    typeQuestion: string
    typePrivacy: string
    typeVideo: string
    typeOther: string
    nameLabel: string
    nameOptional: string
    emailLabel: string
    emailOptional: string
    messageLabel: string
    send: string
    sending: string
    sentTitle: string
    sentBody: string
    fail: string
    namePh: string
    emailPh: string
    messagePh: string
  }

  updates: {
    title: string
    subtitle: string
    bugs: string
    features: string
    empty: string
    loading: string
    fail: string
    openGithub: string
    seeList: string
  }

  findHelp: {
    title: string
    subtitle: string
    regionHint: string
    tabCrisis: string
    tabExclusion: string
    tabMeetings: string
    tabGuides: string
    empty: string
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

  auth: {
    title: string; subtitle: string
    signIn: string; createAccount: string
    google: string; or: string
    emailPh: string; passwordPh: string; wait: string
    errMissingFields: string; errAccountExists: string
    errWrongCredentials: string; errWeakPassword: string; errGeneric: string
  }

  milestone: {
    // params: {n}
    titleOne: string; titleMany: string
    costBefore: string; acknowledge: string
  }

  milestoneMessages: Record<string, string>

  void: {
    excitement: { label: string; emoji: string; description: string; reframe: string; alternatives: [string, string, string, string] }
    escape: { label: string; emoji: string; description: string; reframe: string; alternatives: [string, string, string, string] }
    social: { label: string; emoji: string; description: string; reframe: string; alternatives: [string, string, string, string] }
    stress: { label: string; emoji: string; description: string; reframe: string; alternatives: [string, string, string, string] }
  }
}

/**
 * `needsNativeReview` marks a pack written without a native speaker. The
 * Cebuano file is Tagalog-leaning with Cebuano words mixed in, and Hiligaynon
 * and Ilocano were produced the same way, so presenting them as finished
 * translations overstates what they are. Clear the flag per language once a
 * native speaker has actually read the file.
 */
export const LANGUAGES: { code: Lang; label: string; native: string; needsNativeReview?: boolean }[] = [
  { code: 'en',  label: 'English',     native: 'English'   },
  { code: 'fil', label: 'Filipino',    native: 'Filipino'  },
  { code: 'ceb', label: 'Cebuano',     native: 'Bisaya'   , needsNativeReview: true },
  { code: 'hil', label: 'Hiligaynon', native: 'Ilonggo'  , needsNativeReview: true },
  { code: 'ilo', label: 'Ilocano',     native: 'Ilocano'  , needsNativeReview: true },
]

/** Replace {key} placeholders. tpl('Hello {name}', {name:'Ana'}) → 'Hello Ana' */
export function tpl(str: string, vars: Record<string, string | number>): string {
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))
}
