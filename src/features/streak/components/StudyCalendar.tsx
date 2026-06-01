import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Card, ProgressBar } from '@/components';
import { AppIcon } from '@/components/ui/AppIcon';
import { StreakFlame } from '@/components/ui/game';
import { theme } from '@/constants';
import { usePlayerStore } from '@/features/player';
import { getTodayKey } from '@/features/quests/utils/date';
import { cn } from '@/utils';

import {
  formatMonthLabel,
  getCalendarGridDays,
  isToday,
} from '../utils/date';

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

type StudyCalendarProps = {
  studiedDays: Set<string>;
  onMonthChange?: (year: number, month: number) => void;
};

const chunkWeeks = (days: (string | null)[]): (string | null)[][] => {
  const weeks: (string | null)[][] = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }
  return weeks;
};

export const StudyCalendar = ({ studiedDays, onMonthChange }: StudyCalendarProps) => {
  const today = getTodayKey();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const currentStreak = usePlayerStore((state) => state.currentStreak);
  const bestStreak = usePlayerStore((state) => state.bestStreak);
  const totalStudyDays = usePlayerStore((state) => state.totalStudyDays);

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);

  const gridDays = getCalendarGridDays(year, month);
  const weeks = useMemo(() => chunkWeeks(gridDays), [gridDays]);

  const studiedThisMonth = useMemo(
    () => gridDays.filter((dateKey) => dateKey && studiedDays.has(dateKey)).length,
    [gridDays, studiedDays],
  );

  const daysInMonth = gridDays.filter(Boolean).length;
  const monthProgress = daysInMonth > 0 ? Math.round((studiedThisMonth / daysInMonth) * 100) : 0;

  const isCurrentMonth = year === currentYear && month === currentMonth;
  const canGoNext = !isCurrentMonth;

  const handlePreviousMonth = () => {
    const nextMonth = month === 1 ? 12 : month - 1;
    const nextYear = month === 1 ? year - 1 : year;
    setMonth(nextMonth);
    setYear(nextYear);
    onMonthChange?.(nextYear, nextMonth);
  };

  const handleNextMonth = () => {
    if (!canGoNext) return;

    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;

    if (nextYear > currentYear || (nextYear === currentYear && nextMonth > currentMonth)) {
      return;
    }

    setMonth(nextMonth);
    setYear(nextYear);
    onMonthChange?.(nextYear, nextMonth);
  };

  return (
    <Card elevated accent className="border-warning/25">
      <View className="mb-4 flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-xs font-bold uppercase tracking-widest text-warning">🔥 Consistência</Text>
          <View className="mt-2 flex-row items-center gap-2">
            <StreakFlame streak={currentStreak} size={22} showLabel />
          </View>
          <Text className="mt-1 text-xs text-muted">
            Recorde {bestStreak} · {totalStudyDays} dias totais
          </Text>
        </View>
        <View className="rounded-xl bg-surface px-3 py-2">
          <Text className="text-[10px] uppercase text-muted">Este mês</Text>
          <Text className="text-lg font-black text-foreground">
            {studiedThisMonth}/{daysInMonth}
          </Text>
        </View>
      </View>

      <View className="mb-4">
        <ProgressBar value={monthProgress} variant="streak" height="sm" label="Dias estudados no mês" showLabel />
      </View>

      <View className="mb-3 flex-row items-center justify-between">
        <Pressable
          onPress={handlePreviousMonth}
          accessibilityRole="button"
          accessibilityLabel="Mês anterior"
          className="rounded-xl border border-border bg-surface p-2.5 active:opacity-80">
          <AppIcon name="chevron-back" size={18} color={theme.colors.foreground} />
        </Pressable>

        <Text className="flex-1 text-center text-base font-bold capitalize text-foreground">
          {formatMonthLabel(year, month)}
        </Text>

        <Pressable
          onPress={handleNextMonth}
          disabled={!canGoNext}
          accessibilityRole="button"
          accessibilityLabel="Próximo mês"
          className={cn(
            'rounded-xl border border-border bg-surface p-2.5',
            !canGoNext && 'opacity-30',
          )}>
          <AppIcon name="chevron-forward" size={18} color={theme.colors.foreground} />
        </Pressable>
      </View>

      <View className="mb-1 flex-row">
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} className="flex-1 items-center py-1">
            <Text className="text-[11px] font-semibold text-muted">{label}</Text>
          </View>
        ))}
      </View>

      <View className="gap-1">
        {weeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} className="flex-row">
            {week.map((dateKey, dayIndex) => {
              if (!dateKey) {
                return <View key={`empty-${weekIndex}-${dayIndex}`} className="flex-1 aspect-square" />;
              }

              const dayNumber = Number(dateKey.split('-')[2]);
              const studied = studiedDays.has(dateKey);
              const todayCell = isToday(dateKey, today);

              return (
                <View
                  key={dateKey}
                  className="flex-1 items-center justify-center aspect-square p-0.5">
                  <View
                    className={cn(
                      'h-9 w-9 items-center justify-center rounded-full',
                      studied && 'bg-primary',
                      todayCell && !studied && 'border-2 border-accent bg-accent/10',
                      todayCell && studied && 'border-2 border-accent',
                    )}
                    accessibilityLabel={
                      studied ? `Dia ${dayNumber}, estudou` : `Dia ${dayNumber}, não estudou`
                    }>
                    <Text
                      className={cn(
                        'text-xs font-semibold',
                        studied ? 'text-white' : todayCell ? 'text-accent' : 'text-foreground-secondary',
                      )}>
                      {dayNumber}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View className="mt-4 flex-row flex-wrap gap-4 border-t border-border pt-3">
        <View className="flex-row items-center gap-2">
          <View className="h-3 w-3 rounded-full bg-primary" />
          <Text className="text-xs text-muted">Estudou</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="h-3 w-3 rounded-full border-2 border-accent bg-accent/10" />
          <Text className="text-xs text-muted">Hoje</Text>
        </View>
      </View>
    </Card>
  );
};
