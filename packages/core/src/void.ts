import type { VoidType } from './types'

export interface VoidOption {
  type: VoidType
  label: string
  emoji: string
  description: string
  reframe: string
  alternatives: string[]
}

export const VOID_OPTIONS: VoidOption[] = [
  {
    type: 'excitement',
    label: 'Excitement',
    emoji: '⚡',
    description: 'The rush. The adrenaline. Something happening.',
    reframe: 'The rush is real. Gambling just borrowed it and charged you 5%.',
    alternatives: [
      'Watch live sport without a bet — just for the game',
      'Physical challenge: time yourself, push a personal limit',
      'Learn something with fast feedback: chess, martial arts, a new skill',
      'Channel it into your body — run, lift, sprint until it passes',
    ],
  },
  {
    type: 'escape',
    label: 'Escape',
    emoji: '🌫️',
    description: 'Going offline. Not thinking. Disappearing for a while.',
    reframe: 'Your brain wants to go quiet. You can do that without losing money.',
    alternatives: [
      'Box breathing for 10 minutes: inhale 4, hold 4, exhale 4, hold 4',
      '15-minute walk outside with your phone in your pocket',
      'Write one sentence in your journal — just name what you are escaping from',
      'Sleep. A real nap. The urge will be gone when you wake up.',
    ],
  },
  {
    type: 'social',
    label: 'Social',
    emoji: '🤝',
    description: 'Belonging. Something to be part of. A community.',
    reframe: 'Gambling gave you something to talk about. Talk to someone who actually knows you.',
    alternatives: [
      'Text one person right now — not about gambling, just to connect',
      'Call a family member just to hear their voice',
      'Find a recovery community — Gamblers Anonymous or an online group',
      'Watch sport with someone, not alone and in silence',
    ],
  },
  {
    type: 'stress',
    label: 'Stress Relief',
    emoji: '🔥',
    description: 'Numbing the pressure. Releasing tension. Coping.',
    reframe: 'Gambling numbs stress temporarily. The debt it creates creates more stress. Break the loop.',
    alternatives: [
      'Physical movement: 10 pushups, a walk, anything that uses your body',
      'Write down the specific thing stressing you — just name it exactly',
      'Cold water on your face — it physically resets your nervous system',
      'Box breathing for 5 minutes',
    ],
  },
]
