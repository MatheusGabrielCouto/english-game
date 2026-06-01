/**
 * Generates placeholder WAV files for Audio MVP (sine tones + envelopes).
 * Replace with final assets from sound design later.
 *
 * Run: pnpm exec tsx scripts/generate-mvp-audio.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const SAMPLE_RATE = 44100
const ROOT = join(process.cwd(), 'assets', 'audio')

type ToneSpec = {
  path: string
  frequencies: number[]
  durationMs: number
  volume?: number
}

const writeWav = (filePath: string, frequencies: number[], durationMs: number, volume = 0.28) => {
  const numSamples = Math.floor((SAMPLE_RATE * durationMs) / 1000)
  const dataSize = numSamples * 2
  const buffer = Buffer.alloc(44 + dataSize)

  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(SAMPLE_RATE, 24)
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)

  const attack = Math.floor(SAMPLE_RATE * 0.008)
  const release = Math.floor(SAMPLE_RATE * 0.06)

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE
    let sample = 0
    for (const freq of frequencies) {
      sample += Math.sin(2 * Math.PI * freq * t)
    }
    sample /= frequencies.length

    const envIn = Math.min(1, i / attack)
    const envOut = Math.min(1, (numSamples - i) / release)
    const envelope = envIn * envOut
    const value = Math.max(-1, Math.min(1, sample * envelope * volume))
    buffer.writeInt16LE(Math.round(value * 32767), 44 + i * 2)
  }

  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, buffer)
}

const specs: ToneSpec[] = [
  { path: 'ui/ui_tap_soft_a.wav', frequencies: [880], durationMs: 45 },
  { path: 'ui/ui_tap_soft_b.wav', frequencies: [940], durationMs: 42 },
  { path: 'ui/ui_tab_switch.wav', frequencies: [660, 990], durationMs: 70, volume: 0.22 },

  { path: 'gameplay/xp_tick.wav', frequencies: [1318], durationMs: 55 },
  { path: 'gameplay/xp_chime.wav', frequencies: [1046, 1318], durationMs: 120, volume: 0.32 },
  { path: 'gameplay/xp_surge.wav', frequencies: [784, 988, 1318], durationMs: 180, volume: 0.34 },
  { path: 'gameplay/coin_pickup_a.wav', frequencies: [1760, 2217], durationMs: 90, volume: 0.26 },
  { path: 'gameplay/coin_pickup_b.wav', frequencies: [1661, 2093], durationMs: 85, volume: 0.26 },
  { path: 'gameplay/mission_complete.wav', frequencies: [523, 659, 784], durationMs: 200, volume: 0.3 },
  { path: 'gameplay/mission_daily_all.wav', frequencies: [392, 523, 659, 784], durationMs: 320, volume: 0.32 },
  { path: 'gameplay/study_day_stamp.wav', frequencies: [440, 554, 659], durationMs: 240, volume: 0.3 },
  { path: 'gameplay/streak_flame.wav', frequencies: [587, 740, 880], durationMs: 260, volume: 0.31 },
  { path: 'gameplay/streak_break_wind.wav', frequencies: [220, 277], durationMs: 400, volume: 0.2 },
  { path: 'gameplay/level_up.wav', frequencies: [523, 659, 784, 988, 1175], durationMs: 520, volume: 0.35 },

  { path: 'loot/loot_shake.wav', frequencies: [180, 240], durationMs: 140, volume: 0.24 },
  { path: 'loot/loot_reveal_common.wav', frequencies: [698], durationMs: 150, volume: 0.26 },
  { path: 'loot/loot_reveal_uncommon.wav', frequencies: [784, 988], durationMs: 180, volume: 0.28 },
  { path: 'loot/loot_reveal_rare.wav', frequencies: [880, 1108], durationMs: 200, volume: 0.29 },
  { path: 'loot/loot_reveal_epic.wav', frequencies: [988, 1318], durationMs: 240, volume: 0.3 },
  { path: 'loot/loot_reveal_legendary.wav', frequencies: [1175, 1568], durationMs: 300, volume: 0.32 },
  { path: 'loot/loot_reveal_mythic.wav', frequencies: [1318, 1760], durationMs: 340, volume: 0.33 },
  { path: 'loot/loot_reveal_ancient.wav', frequencies: [1568, 2093], durationMs: 380, volume: 0.34 },
]

for (const spec of specs) {
  writeWav(join(ROOT, spec.path), spec.frequencies, spec.durationMs, spec.volume)
}

console.log(`Generated ${specs.length} WAV files in ${ROOT}`)
