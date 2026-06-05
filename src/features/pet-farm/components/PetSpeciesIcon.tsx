import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Bird, Cat, Dog, Fish, Rabbit, Turtle, type LucideIcon } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { getSpeciesIcon } from '../catalogs/pet-species-icons';
import { getSpeciesDefinition } from '../catalogs/pet-species-resolver';

const LUCIDE_BY_NAME: Record<string, LucideIcon> = {
  Bird,
  Cat,
  Dog,
  Fish,
  Rabbit,
  Turtle,
};

type PetSpeciesIconProps = {
  speciesKey: string;
  size?: number;
  color?: string;
};

const VectorSpeciesIcon = ({
  speciesKey,
  size,
  color,
}: {
  speciesKey: string;
  size: number;
  color: string;
}) => {
  const icon = getSpeciesIcon(speciesKey);

  if (icon.library === 'Lucide') {
    const LucideComponent = LUCIDE_BY_NAME[icon.name] ?? Bird;
    return <LucideComponent size={size} color={color} />;
  }

  return (
    <MaterialCommunityIcons
      name={icon.name as keyof typeof MaterialCommunityIcons.glyphMap}
      size={size}
      color={color}
    />
  );
};

/** Avatar da espécie: emoji do catálogo (visual original); vetor só se não houver emoji. */
export const PetSpeciesIcon = ({
  speciesKey,
  size = 32,
  color = '#fafafa',
}: PetSpeciesIconProps) => {
  const species = getSpeciesDefinition(speciesKey);
  const label = species.name;

  if (species.emoji) {
    const fontSize = Math.max(12, Math.round(size * 0.9));
    return (
      <View
        accessibilityLabel={label}
        style={{
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{ fontSize, lineHeight: fontSize * 1.08 }}>{species.emoji}</Text>
      </View>
    );
  }

  return (
    <View accessibilityLabel={label}>
      <VectorSpeciesIcon speciesKey={speciesKey} size={size} color={color} />
    </View>
  );
};
