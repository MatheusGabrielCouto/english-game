import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
    ANDROID_TRANSCRIPTION_AUDIO_PROFILES,
    androidTranscriptionProfilesForUri,
} from '../journal-android-audio-source'

describe('androidTranscriptionProfilesForUri', () => {
  it('tries journal then legacy profile for m4a', () => {
    const profiles = androidTranscriptionProfilesForUri('file:///cache/recording.m4a')
    assert.equal(profiles.length, ANDROID_TRANSCRIPTION_AUDIO_PROFILES.length)
    assert.equal(profiles[0]?.sampleRate, 16_000)
    assert.equal(profiles[1]?.sampleRate, 44_100)
  })

  it('uses single 16k profile for mp3', () => {
    const profiles = androidTranscriptionProfilesForUri('/data/audio/note.mp3')
    assert.equal(profiles.length, 1)
    assert.equal(profiles[0]?.audioChannels, 1)
  })
})
