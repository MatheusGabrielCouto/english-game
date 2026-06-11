import type { ReactNode, RefObject } from 'react';
import { ScrollView, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cn } from '@/utils';

type ScreenContainerProps = {
  children: ReactNode;
  scrollable?: boolean;
  className?: string;
  contentClassName?: string;
  backgroundColor?: string;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
  scrollViewProps?: Omit<ScrollViewProps, 'children' | 'className'>;
  scrollRef?: RefObject<ScrollView | null>;
  contentRef?: RefObject<View | null>;
};

export const ScreenContainer = ({
  children,
  scrollable = false,
  className,
  contentClassName,
  backgroundColor,
  edges = ['top', 'left', 'right'],
  scrollViewProps,
  scrollRef,
  contentRef,
}: ScreenContainerProps) => {
  const content = (
    <View ref={contentRef} className={cn('px-5 pb-8', contentClassName)}>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      edges={edges}
      className={cn('flex-1 bg-background', className)}
      style={backgroundColor ? { backgroundColor } : undefined}>
      {scrollable ? (
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={backgroundColor ? { backgroundColor } : undefined}
          contentContainerStyle={{ paddingBottom: 8 }}
          {...scrollViewProps}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
};
