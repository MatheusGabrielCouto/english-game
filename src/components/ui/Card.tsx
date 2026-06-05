/**
 * Card utilitário — configurações, formulários e painéis neutros.
 * Gameplay (missões, recompensas, cidade): use `GameCard` + `PressableScale`.
 * @see docs/DESIGN_SYSTEM.md
 */
import { View, type ViewProps } from 'react-native';

import { cn } from '@/utils';

type CardProps = ViewProps & {
  className?: string;
  elevated?: boolean;
  accent?: boolean;
};

export const Card = ({
  children,
  className,
  elevated = false,
  accent = false,
  style,
  ...props
}: CardProps) => (
  <View
    className={cn(
      'rounded-2xl border p-5',
      elevated ? 'border-border/80 bg-surface-elevated' : 'border-border bg-surface',
      accent && 'border-primary/30',
      className,
    )}
    style={[
      elevated && {
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 4,
      },
      style,
    ]}
    {...props}>
    {children}
  </View>
);
