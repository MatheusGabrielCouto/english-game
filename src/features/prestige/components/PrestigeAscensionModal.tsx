import { useCallback, useEffect, useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { Button, FormSheetModal } from '@/components'
import { useContractsStore } from '@/features/contracts/store/contracts-store'
import { MetagameService } from '@/features/metagame/services/metagame-service'
import { useMetagameStore } from '@/features/metagame/store/metagame-store'
import { getNextPrestigeTier } from '@/features/prestige/constants/prestige-catalog'
import { PrestigeSacrificeType } from '@/types/prestige'
import { cn } from '@/utils'
import { haptics } from '@/utils/haptics'

import {
    PRESTIGE_ASCENSION_COPY,
    PRESTIGE_SACRIFICE_OPTIONS,
} from '../constants/prestige-ascension'
import { DEFAULT_SACRIFICE, usePrestigeScreenStore } from '../store/prestige-screen-store'

const HOLD_MS = 2200

type PrestigeAscensionModalProps = {
  preview: {
    playerLevel: number
    coins: number
    petLevel: number
    petName: string
    currentStreak: number
  } | null
}

export const PrestigeAscensionModal = ({ preview }: PrestigeAscensionModalProps) => {
  const open = usePrestigeScreenStore((s) => s.ascensionModalOpen)
  const step = usePrestigeScreenStore((s) => s.ascensionStep)
  const sacrifice = usePrestigeScreenStore((s) => s.selectedSacrifice)
  const isAscending = usePrestigeScreenStore((s) => s.isAscending)
  const closeAscension = usePrestigeScreenStore((s) => s.closeAscension)
  const setSacrifice = usePrestigeScreenStore((s) => s.setSacrifice)
  const goToReview = usePrestigeScreenStore((s) => s.goToReview)
  const backToChoose = usePrestigeScreenStore((s) => s.backToChoose)
  const setIsAscending = usePrestigeScreenStore((s) => s.setIsAscending)

  const metagameState = useMetagameStore((s) => s.state)
  const activeContract = useContractsStore((s) => s.activeContract)
  const nextTier = metagameState ? getNextPrestigeTier(metagameState.prestigeLevel) : null

  const [holdProgress, setHoldProgress] = useState(0)
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const holdStartRef = useRef<number | null>(null)

  const selectedSacrifice = sacrifice ?? DEFAULT_SACRIFICE

  const clearHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current)
      holdTimerRef.current = null
    }
    holdStartRef.current = null
    setHoldProgress(0)
  }, [])

  useEffect(() => {
    if (!open) clearHold()
  }, [clearHold, open])

  const handleAscend = async () => {
    if (!selectedSacrifice || isAscending) return

    setIsAscending(true)
    haptics.impact()

    const result = await MetagameService.claimPrestige(selectedSacrifice)

    setIsAscending(false)
    clearHold()

    if (result.success) {
      closeAscension()
      return
    }

    haptics.warning()
  }

  const startHold = () => {
    if (isAscending || activeContract) return
    holdStartRef.current = Date.now()
    holdTimerRef.current = setInterval(() => {
      if (!holdStartRef.current) return
      const elapsed = Date.now() - holdStartRef.current
      const progress = Math.min(100, Math.round((elapsed / HOLD_MS) * 100))
      setHoldProgress(progress)
      if (elapsed >= HOLD_MS) {
        clearHold()
        void handleAscend()
      }
    }, 50)
  }

  if (!open || !preview || !nextTier) return null

  const coinsAfter =
    selectedSacrifice === PrestigeSacrificeType.COINS ? 0 : preview.coins

  return (
    <FormSheetModal
      visible={open}
      onClose={closeAscension}
      sheetHeightRatio={0.92}
      sheetClassName="bg-surface px-5 pb-8"
      header={
        <View className="mb-4 flex-row items-center justify-between px-0">
          <Text className="text-lg font-black text-foreground">{PRESTIGE_ASCENSION_COPY.modalTitle}</Text>
          <Pressable onPress={closeAscension} accessibilityRole="button" accessibilityLabel="Fechar">
            <Text className="text-sm font-semibold text-muted">Fechar</Text>
          </Pressable>
        </View>
      }>
      {step === 'choose' ? (
        <View className="gap-4">
          <Text className="text-sm leading-6 text-foreground-secondary">
            {PRESTIGE_ASCENSION_COPY.chooseSacrificeHint}
          </Text>
          <Text className="text-xs font-semibold text-success">{PRESTIGE_ASCENSION_COPY.streakProtected}</Text>

          {PRESTIGE_SACRIFICE_OPTIONS.map((option) => {
            const selected = selectedSacrifice === option.key
            return (
              <Pressable
                key={option.key}
                onPress={() => setSacrifice(option.key)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                className={cn(
                  'rounded-2xl border px-4 py-4',
                  selected ? 'border-gold bg-gold/10' : 'border-border bg-surface-elevated',
                )}>
                <View className="flex-row items-center gap-3">
                  <Text className="text-3xl">{option.emoji}</Text>
                  <View className="flex-1">
                    <Text className=" font-bold text-foreground">{option.title}</Text>
                    <Text className="mt-1 text-xs text-foreground-secondary">{option.description}</Text>
                    <Text className="mt-2 text-xs font-bold text-warning">{option.impact}</Text>
                  </View>
                </View>
              </Pressable>
            )
          })}

          <Button label="Revisar ascensão" onPress={goToReview} />
        </View>
      ) : (
        <View className="gap-4">
          <Text className="text-sm font-bold text-foreground">{PRESTIGE_ASCENSION_COPY.reviewTitle}</Text>
          <Text className="text-xs text-warning">{PRESTIGE_ASCENSION_COPY.reviewWarning}</Text>

          <View className="rounded-xl border border-danger/30 bg-danger/10 p-3">
            <Text className="text-[10px] font-bold uppercase text-danger">Você perde</Text>
            <Text className="mt-2 text-sm text-foreground">• Nível {preview.playerLevel} → 1</Text>
            <Text className="text-sm text-foreground">• XP da run → 0</Text>
            {selectedSacrifice === PrestigeSacrificeType.COINS ? (
              <Text className="text-sm text-foreground">• {preview.coins.toLocaleString('pt-BR')} moedas → 0</Text>
            ) : (
              <Text className="text-sm text-foreground">
                • Pet {preview.petName} (nv. {preview.petLevel}) → bebê nv. 1
              </Text>
            )}
          </View>

          <View className="rounded-xl border border-success/30 bg-success/10 p-3">
            <Text className="text-[10px] font-bold uppercase text-success">Protegido</Text>
            <Text className="mt-2 text-sm text-foreground">
              • Streak {preview.currentStreak} dias (mantida)
            </Text>
            <Text className="text-sm text-foreground">• Conquistas, coleção e inventário</Text>
          </View>

          <View className="rounded-xl border border-gold/30 bg-gold/10 p-3">
            <Text className="text-[10px] font-bold uppercase text-gold">
              {PRESTIGE_ASCENSION_COPY.gainsTitle}
            </Text>
            <Text className="mt-2 text-sm text-foreground">
              • Prestígio {nextTier.roman} — {nextTier.name}
            </Text>
            {nextTier.permanentBonuses.map((bonus) => (
              <Text key={bonus.label} className="text-sm text-foreground">
                • {bonus.label} {bonus.value}
              </Text>
            ))}
            <Text className="mt-1 text-sm text-foreground">
              • Moedas após ascensão: {coinsAfter.toLocaleString('pt-BR')} + recompensa do tier
            </Text>
          </View>

          {activeContract ? (
            <Text className="text-sm text-danger">{PRESTIGE_ASCENSION_COPY.activeContractBlock}</Text>
          ) : (
            <View className="gap-2">
              <Pressable
                onPressIn={startHold}
                onPressOut={clearHold}
                disabled={isAscending}
                className={cn(
                  'rounded-xl border-2 border-gold bg-gold/20 py-4',
                  isAscending && 'opacity-60',
                )}
                accessibilityRole="button"
                accessibilityLabel={PRESTIGE_ASCENSION_COPY.holdToConfirm}>
                <Text className="text-center  font-black text-gold">
                  {isAscending ? PRESTIGE_ASCENSION_COPY.holding : PRESTIGE_ASCENSION_COPY.holdToConfirm}
                </Text>
                <View className="mx-8 mt-2 h-1.5 overflow-hidden rounded-full bg-surface-elevated">
                  <View className="h-full bg-gold" style={{ width: `${holdProgress}%` }} />
                </View>
              </Pressable>
              <Button label="Voltar" variant="secondary" onPress={backToChoose} />
            </View>
          )}
        </View>
      )}
    </FormSheetModal>
  )
}
