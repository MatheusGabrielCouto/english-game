import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { PressableScale } from '@/components/ui/game';

import { PET_GEN_UI } from '../constants/pet-gen-ui';
import { PetLineageService, type LineageTreeNode } from '../services/pet-lineage-service';
import { PetGenBadge } from './PetGenBadge';
import { PetGenderBadge } from './PetGenderBadge';
import { PetSpeciesIcon } from './PetSpeciesIcon';

type PetLineageTreeScreenContentProps = {
  instanceId: number;
};

export const PetLineageTreeScreenContent = ({ instanceId }: PetLineageTreeScreenContentProps) => {
  const router = useRouter();
  const [root, setRoot] = useState<LineageTreeNode | null>(null);
  const [expanded, setExpanded] = useState(true);

  const load = useCallback(async () => {
    const tree = await PetLineageService.buildTree(instanceId, expanded ? 4 : 2);
    setRoot(tree);
  }, [expanded, instanceId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!root) {
    return (
      <View className="py-12">
        <Text className="text-center text-muted">Carregando árvore…</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="pb-8">
      <View className="min-w-full items-center gap-4 px-2">
        <TreeLevel nodes={[root.mother, root.father].filter(Boolean) as LineageTreeNode[]} onNavigate={router.push} />
        <TreeNodeCard node={root} highlight onNavigate={router.push} />
        <PressableScale
          onPress={() => setExpanded((v) => !v)}
          className="rounded-full border border-border px-4 py-2"
          accessibilityRole="button">
          <Text className="text-xs font-bold text-foreground">
            {expanded ? 'Recolher bisavós+' : 'Expandir bisavós+'}
          </Text>
        </PressableScale>
      </View>
    </ScrollView>
  );
};

const TreeLevel = ({
  nodes,
  onNavigate,
}: {
  nodes: LineageTreeNode[];
  onNavigate: (href: Href) => void;
}) => {
  if (nodes.length === 0) return null;

  return (
    <View className="flex-row flex-wrap justify-center gap-3">
      {nodes.map((node) => (
        <View key={node.instance.id} className="items-center gap-2">
          <TreeLevel
            nodes={[node.mother, node.father].filter(Boolean) as LineageTreeNode[]}
            onNavigate={onNavigate}
          />
          <TreeNodeCard node={node} onNavigate={onNavigate} />
        </View>
      ))}
    </View>
  );
};

const TreeNodeCard = ({
  node,
  highlight,
  onNavigate,
}: {
  node: LineageTreeNode;
  highlight?: boolean;
  onNavigate: (href: Href) => void;
}) => (
  <PressableScale
    onPress={() => onNavigate(`${'/pet-farm/instance'}/${node.instance.id}` as Href)}
    className={`min-w-[120px] items-center rounded-2xl border p-3 ${
      highlight ? 'border-primary/50 bg-primary/10' : 'border-border bg-surface-elevated'
    }`}
    accessibilityRole="button"
    accessibilityLabel={node.instance.nickname}>
    <View className="flex-row items-center gap-1">
      <PetSpeciesIcon speciesKey={node.instance.speciesKey} size={32} />
      <PetGenderBadge gender={node.instance.gender} />
    </View>
    <Text className="mt-1 text-center text-xs font-bold text-foreground" numberOfLines={1}>
      {node.instance.nickname}
    </Text>
    <View className="mt-1">
      <PetGenBadge generation={node.instance.generation} size="sm" />
    </View>
    {highlight ? (
      <Text className="mt-1 text-[9px] font-bold uppercase text-primary">{PET_GEN_UI.treeTitle}</Text>
    ) : null}
  </PressableScale>
);
