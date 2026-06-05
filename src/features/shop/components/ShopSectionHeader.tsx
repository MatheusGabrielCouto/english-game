import { Text, View } from 'react-native';

import { SHOP_TEXT } from '../constants/shop-ui';

type ShopSectionHeaderProps = {
  kicker?: string;
  kickerClassName?: string;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
};

export const ShopSectionHeader = ({
  kicker,
  kickerClassName = SHOP_TEXT.kickerNeutral,
  title,
  subtitle,
  trailing,
}: ShopSectionHeaderProps) => (
  <View className="flex-row items-start justify-between gap-3 px-0.5">
    <View className="flex-1 gap-1">
      {kicker ? <Text className={kickerClassName}>{kicker}</Text> : null}
      <Text className={SHOP_TEXT.heading}>{title}</Text>
      {subtitle ? <Text className={SHOP_TEXT.body}>{subtitle}</Text> : null}
    </View>
    {trailing ?? null}
  </View>
);
