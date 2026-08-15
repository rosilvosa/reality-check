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

export type HelpCategory = 'crisis' | 'exclusion' | 'meetings' | 'guides'

export interface HelpResource {
  id: string
  region: HelpRegion | 'ALL'
  category: HelpCategory
  title: string
  body: string
  action: string
  url: string | null
}

export const HELP_RESOURCES: HelpResource[] = [
  {
    id: 'ph-pagcor-line',
    region: 'PH',
    category: 'crisis',
    title: 'PAGCOR National Problem Gambling Helpline',
    body: '(02) 8248-9568. 24/7. Counselors trained for gambling. This is the Philippine gambling helpline.',
    action: 'Call (02) 8248-9568',
    url: 'tel:+63282489568',
  },
  {
    id: 'ph-ncmh',
    region: 'PH',
    category: 'crisis',
    title: 'NCMH crisis line (mental health)',
    body: '1553. Free, 24/7. Mental-health crisis — not a gambling service. Use this if you are in psychological crisis. For gambling, call PAGCOR first.',
    action: 'Call 1553',
    url: 'tel:1553',
  },
  {
    id: 'ph-911',
    region: 'PH',
    category: 'crisis',
    title: 'Emergency services',
    body: 'If you are in immediate danger, call 911.',
    action: 'Call 911',
    url: 'tel:911',
  },
  {
    id: 'ph-exclusion',
    region: 'PH',
    category: 'exclusion',
    title: 'PAGCOR self-exclusion',
    body: 'PAGCOR can ban you from licensed casinos and gaming sites for 6 months, 1 year, or 5 years.',
    action: 'Open the form',
    url: 'https://www.pagcor.ph/regulatory/exclusion.php',
  },
  {
    id: 'ph-ga',
    region: 'PH',
    category: 'meetings',
    title: 'Gamblers Anonymous Philippines',
    body: 'In-person and online meetings. Open to anyone who wants to stop gambling. No dues.',
    action: 'Find a meeting',
    url: 'https://gamblersanonymous.ph/',
  },
  {
    id: 'ph-ga-alt',
    region: 'PH',
    category: 'meetings',
    title: 'GA Philippines (gaphilippines.com)',
    body: 'Another PH meeting list. Hotline +63 915 938 2808.',
    action: 'Open site',
    url: 'https://gaphilippines.com/',
  },
  {
    id: 'us-ncpg',
    region: 'US',
    category: 'crisis',
    title: '1-800-GAMBLER',
    body: 'US problem-gambling helpline. Free, 24/7.',
    action: 'Call 1-800-GAMBLER',
    url: 'tel:18004262537',
  },
  {
    id: 'us-exclusion',
    region: 'US',
    category: 'exclusion',
    title: 'State self-exclusion',
    body: 'Most states have a casino and sportsbook exclusion list. NCPG keeps a national guide.',
    action: 'NCPG guide',
    url: 'https://www.ncpgambling.org/help-treatment/self-exclusion/',
  },
  {
    id: 'us-ga',
    region: 'US',
    category: 'meetings',
    title: 'Gamblers Anonymous (US)',
    body: 'In-person, virtual, and phone meetings. National hotline 855-222-5542.',
    action: 'Find a meeting',
    url: 'https://gamblersanonymous.org/find-a-meeting/',
  },
  {
    id: 'uk-gamcare',
    region: 'UK',
    category: 'crisis',
    title: 'National Gambling Helpline',
    body: 'GamCare: 0808 8020 133. Free, 24/7, UK.',
    action: 'Call 0808 8020 133',
    url: 'tel:08088020133',
  },
  {
    id: 'uk-gamstop',
    region: 'UK',
    category: 'exclusion',
    title: 'GamStop',
    body: 'Blocks you from all UK-licensed online gambling for 6 months, 1 year, or 5 years. You cannot reverse it early.',
    action: 'Open GamStop',
    url: 'https://www.gamstop.co.uk/',
  },
  {
    id: 'uk-ga',
    region: 'UK',
    category: 'meetings',
    title: 'Gamblers Anonymous (UK)',
    body: 'Meetings across the UK. Also ask your bank for a gambling payment block.',
    action: 'Find a meeting',
    url: 'https://www.gamblersanonymous.org.uk/',
  },
  {
    id: 'au-gho',
    region: 'AU',
    category: 'crisis',
    title: 'Gambling Help Online',
    body: '1800 858 858. 24/7 in Australia.',
    action: 'Call 1800 858 858',
    url: 'tel:1800858858',
  },
  {
    id: 'au-betstop',
    region: 'AU',
    category: 'exclusion',
    title: 'BetStop',
    body: 'National self-exclusion register for online wagering. 3 months up to permanent.',
    action: 'Open BetStop',
    url: 'https://www.betstop.gov.au/',
  },
  {
    id: 'au-ga',
    region: 'AU',
    category: 'meetings',
    title: 'Gamblers Anonymous Australia',
    body: 'Face-to-face and online meetings.',
    action: 'Find a meeting',
    url: 'https://gaaustralia.org.au/',
  },
  {
    id: 'sg-ncpg',
    region: 'SG',
    category: 'crisis',
    title: 'NCPG Helpline',
    body: '1800-6-668-668. Free in Singapore.',
    action: 'Call 1800-6-668-668',
    url: 'tel:18006668668',
  },
  {
    id: 'sg-exclusion',
    region: 'SG',
    category: 'exclusion',
    title: 'NCPG casino exclusion',
    body: 'Singapore’s National Council on Problem Gambling can exclude you from casinos. Family members can also apply.',
    action: 'NCPG site',
    url: 'https://www.ncpg.org.sg/',
  },
  {
    id: 'intl-helpline',
    region: 'INTL',
    category: 'crisis',
    title: 'Find a local helpline',
    body: 'There is no single world number. findahelpline.com lists crisis lines by country.',
    action: 'Find a helpline',
    url: 'https://findahelpline.com/',
  },
  {
    id: 'intl-exclusion',
    region: 'INTL',
    category: 'exclusion',
    title: 'Local self-exclusion',
    body: 'Search “[your country] gambling self-exclusion.” Most regulators can ban you from licensed venues and sites.',
    action: 'Find a helpline',
    url: 'https://findahelpline.com/',
  },
  {
    id: 'all-ga',
    region: 'ALL',
    category: 'meetings',
    title: 'Gamblers Anonymous International',
    body: 'Meetings in many countries. No dues. If you cannot find one locally, call the ISO at +1 909-931-9056.',
    action: 'International meetings',
    url: 'https://gamblersanonymous.org/international-meetings/',
  },
  {
    id: 'all-smart',
    region: 'ALL',
    category: 'meetings',
    title: 'SMART Recovery',
    body: 'Free science-based meetings, online and in person. Not 12-step. Useful if GA is not a fit.',
    action: 'Find a meeting',
    url: 'https://meetings.smartrecovery.org/',
  },
  {
    id: 'all-guide-barriers',
    region: 'ALL',
    category: 'guides',
    title: 'Build barriers first',
    body: 'Delete apps, block sites, remove saved payments, tell one person. The checklist is in this app.',
    action: 'Open Barriers',
    url: '/barriers',
  },
  {
    id: 'all-guide-urge',
    region: 'ALL',
    category: 'guides',
    title: 'When the urge hits',
    body: 'Do not open a betting app to “check.” Write it in the journal, wait 15 minutes, or call a helpline. The urge peaks and falls.',
    action: 'Open Journal',
    url: '/journal',
  },
  {
    id: 'all-guide-meeting',
    region: 'ALL',
    category: 'guides',
    title: 'How a first meeting works',
    body: 'You can sit and listen. You do not have to speak. No one will make you pay. Show up once, even if you leave early.',
    action: 'GA newcomer notes',
    url: 'https://gamblersanonymous.org/recovery-program/',
  },
]

export function helpResourcesFor(region: HelpRegion): HelpResource[] {
  return HELP_RESOURCES.filter((r) => r.region === region || r.region === 'ALL')
}
