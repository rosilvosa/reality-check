export type HelpRegion = 'PH' | 'US' | 'UK' | 'AU' | 'SG' | 'INTL'

export const HELP_REGIONS: { code: HelpRegion; label: string }[] = [
  { code: 'PH', label: 'Philippines' },
  { code: 'US', label: 'United States' },
  { code: 'UK', label: 'United Kingdom' },
  { code: 'AU', label: 'Australia' },
  { code: 'SG', label: 'Singapore' },
  { code: 'INTL', label: 'Other / International' },
]

export interface RegionHelp {
  exclusionTitle: string
  exclusionBody: string
  exclusionAction: string
  exclusionUrl: string | null
  helplineTitle: string
  helplineBody: string
  helplineAction: string
  helplineUrl: string | null
  paymentsBody: string
}

export const REGION_HELP: Record<HelpRegion, RegionHelp> = {
  PH: {
    exclusionTitle: 'Register for PAGCOR self-exclusion',
    exclusionBody:
      'PAGCOR can ban you from licensed casinos and gaming sites for 6 months, 1 year, or 5 years. Fill out the self-exclusion form on their site. This is the Philippine program — not a foreign hotline.',
    exclusionAction: 'PAGCOR exclusion form',
    exclusionUrl: 'https://www.pagcor.ph/regulatory/exclusion.php',
    helplineTitle: 'Save the PAGCOR gambling helpline',
    helplineBody:
      'PAGCOR National Problem Gambling Helpline: (02) 8248-9568. 24/7, counselors trained for gambling. Save it now. If you are in immediate danger, also call emergency services. NCMH 1553 is a mental-health crisis line, not a gambling service.',
    helplineAction: 'Call (02) 8248-9568',
    helplineUrl: 'tel:+63282489568',
    paymentsBody:
      'Log into every betting account and delete saved GCash, Maya, GrabPay, and cards. Friction stops impulsive deposits.',
  },
  US: {
    exclusionTitle: 'Enroll in state self-exclusion',
    exclusionBody:
      'Most US states have a self-exclusion list for casinos and sportsbooks. Search “[your state] gambling self-exclusion.” Also turn on exclusion inside DraftKings, FanDuel, and every site you use.',
    exclusionAction: 'NCPG self-exclusion guide',
    exclusionUrl: 'https://www.ncpgambling.org/help-treatment/self-exclusion/',
    helplineTitle: 'Save 1-800-GAMBLER',
    helplineBody:
      '1-800-GAMBLER (1-800-426-2537) is the US problem-gambling helpline. Free, 24/7. Save it now — not when the urge hits.',
    helplineAction: 'Call 1-800-GAMBLER',
    helplineUrl: 'tel:18004262537',
    paymentsBody:
      'Remove saved cards, bank accounts, PayPal, Venmo, and one-tap pay from every betting app.',
  },
  UK: {
    exclusionTitle: 'Register with GamStop',
    exclusionBody:
      'GamStop blocks you from all UK-licensed online gambling for 6 months, 1 year, or 5 years. You cannot reverse it early. Also ask your bank to block gambling payments.',
    exclusionAction: 'Open GamStop',
    exclusionUrl: 'https://www.gamstop.co.uk/',
    helplineTitle: 'Save the National Gambling Helpline',
    helplineBody:
      'National Gambling Helpline (GamCare): 0808 8020 133. Free, 24/7, UK. Save it now.',
    helplineAction: 'Call 0808 8020 133',
    helplineUrl: 'tel:08088020133',
    paymentsBody:
      'Delete saved cards and wallets. Ask your bank for a gambling block (most UK banks have one).',
  },
  AU: {
    exclusionTitle: 'Register with BetStop',
    exclusionBody:
      'BetStop is Australia’s national self-exclusion register for online wagering. You can exclude for 3 months up to permanently.',
    exclusionAction: 'Open BetStop',
    exclusionUrl: 'https://www.betstop.gov.au/',
    helplineTitle: 'Save Gambling Help Online',
    helplineBody:
      'Gambling Help Online: 1800 858 858. 24/7 in Australia. Save it now.',
    helplineAction: 'Call 1800 858 858',
    helplineUrl: 'tel:1800858858',
    paymentsBody:
      'Remove saved cards and PayID. Ask your bank about a gambling transaction block.',
  },
  SG: {
    exclusionTitle: 'Apply for NCPG exclusion',
    exclusionBody:
      'Singapore’s National Council on Problem Gambling can exclude you from casinos and some remote gambling. Family members can also apply.',
    exclusionAction: 'NCPG exclusion',
    exclusionUrl: 'https://www.ncpg.org.sg/',
    helplineTitle: 'Save the NCPG helpline',
    helplineBody:
      'NCPG Helpline: 1800-6-668-668. Free in Singapore. Save it now.',
    helplineAction: 'Call 1800-6-668-668',
    helplineUrl: 'tel:18006668668',
    paymentsBody:
      'Delete saved cards and PayNow from betting accounts. Turn off one-tap payments.',
  },
  INTL: {
    exclusionTitle: 'Find your local self-exclusion program',
    exclusionBody:
      'Most countries have a regulator that can ban you from licensed venues and sites. Search “[your country] gambling self-exclusion.” Also delete every app today.',
    exclusionAction: 'Find a helpline',
    exclusionUrl: 'https://findahelpline.com/',
    helplineTitle: 'Save a local helpline',
    helplineBody:
      'There is no single world number. Use findahelpline.com for a crisis line in your country, and search for a problem-gambling service near you. Save the number before you need it.',
    helplineAction: 'Find a helpline',
    helplineUrl: 'https://findahelpline.com/',
    paymentsBody:
      'Delete saved cards, e-wallets, and one-tap pay from every betting account.',
  },
}

export function resolveHelpRegion(saved?: string): HelpRegion {
  if (saved && saved in REGION_HELP) return saved as HelpRegion
  return 'PH'
}
