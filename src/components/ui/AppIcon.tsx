import {
    ArrowLeft,
    Briefcase,
    Calendar,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Pencil,
    Clock,
    Coins,
    Flame,
    Gift,
    Home,
    Inbox,
    Map,
    Package,
    PawPrint,
    Shield,
    ShoppingCart,
    Star,
    User,
    Zap,
    type LucideIcon,
} from 'lucide-react-native';
import { View } from 'react-native';

export const APP_ICONS = {
  'arrow-back': ArrowLeft,
  'briefcase': Briefcase,
  'briefcase-outline': Briefcase,
  'calendar-outline': Calendar,
  'cart-outline': ShoppingCart,
  'checkmark': Check,
  'checkmark-circle': CheckCircle2,
  'chevron-back': ChevronLeft,
  'chevron-down': ChevronDown,
  'chevron-forward': ChevronRight,
  'chevron-up': ChevronUp,
  'create-outline': Pencil,
  'pencil': Pencil,
  'cube-outline': Package,
  'file-tray-outline': Inbox,
  'flame': Flame,
  'flash': Zap,
  'gift-outline': Gift,
  'home': Home,
  'home-outline': Home,
  'logo-bitcoin': Coins,
  'map': Map,
  'map-outline': Map,
  'paw-outline': PawPrint,
  'person': User,
  'person-outline': User,
  'shield-checkmark': Shield,
  'shield-outline': Shield,
  'star-outline': Star,
  'time-outline': Clock,
} as const satisfies Record<string, LucideIcon>;

export type AppIconName = keyof typeof APP_ICONS;

type AppIconProps = {
  name: AppIconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export const AppIcon = ({
  name,
  size = 24,
  color = '#fafafa',
  strokeWidth = 2,
}: AppIconProps) => {
  const IconComponent = APP_ICONS[name];

  return (
    <View pointerEvents="none">
      <IconComponent size={size} color={color} strokeWidth={strokeWidth} />
    </View>
  );
};
