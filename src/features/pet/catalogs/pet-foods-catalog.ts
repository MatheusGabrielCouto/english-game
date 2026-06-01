import type { PetFoodDefinition } from '@/types/pet-expansion';

const FOOD_NAMES = [
  'Apple', 'Cookie', 'Pizza', 'Energy Drink', 'Developer Coffee', 'Banana', 'Sandwich',
  'Protein Bar', 'Green Smoothie', 'Avocado Toast', 'Sushi Roll', 'Ramen Bowl', 'Tacos',
  'Burrito', 'Salad Bowl', 'Granola', 'Yogurt', 'Muffin', 'Donut', 'Ice Cream',
  'Hot Chocolate', 'Tea Cup', 'Orange Juice', 'Water Bottle', 'Blueberry Pancakes',
  'Eggs Benedict', 'Chicken Wrap', 'Veggie Burger', 'Fish Tacos', 'Pasta Carbonara',
  'Caesar Salad', 'Tomato Soup', 'Grilled Cheese', 'Steak Bites', 'Shrimp Skewer',
  'Fruit Bowl', 'Acai Bowl', 'Chia Pudding', 'Honey Toast', 'Matcha Latte',
  'Cold Brew', 'Espresso Shot', 'Midnight Snack', 'Study Fuel Shake', 'Brain Boost Bar',
  'Focus Gummies', 'Vitamin Pack', 'Hydration Pack', 'Legendary Feast', 'Golden Apple',
];

const FOOD_ICONS = ['🍎', '🍪', '🍕', '🥤', '☕', '🍌', '🥪', '🍫', '🥤', '🥑', '🍣', '🍜', '🌮', '🌯', '🥗'];

const rarityForIndex = (index: number): PetFoodDefinition['rarity'] => {
  if (index >= 47) return 'legendary';
  if (index >= 38) return 'epic';
  if (index >= 25) return 'rare';
  return 'common';
};

export const PET_FOODS_CATALOG: PetFoodDefinition[] = FOOD_NAMES.map((name, index) => ({
  key: `food_${index + 1}`,
  name,
  icon: FOOD_ICONS[index % FOOD_ICONS.length],
  rarity: rarityForIndex(index),
  hungerRestore: 8 + (index % 12),
  energyRestore: 4 + (index % 8),
  happinessBoost: 3 + (index % 10),
  affinityGain: 2 + (index % 6),
  effectLabel:
    index >= 47
      ? 'Grande boost de energia e afinidade'
      : index >= 38
        ? 'Motivação elevada por 1h'
        : 'Restaura fome e humor',
}));

export const PET_FOODS_BY_KEY = Object.fromEntries(
  PET_FOODS_CATALOG.map((food) => [food.key, food]),
) as Record<string, PetFoodDefinition>;

export const DEFAULT_FOOD_KEY = 'food_1';
