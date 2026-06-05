import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Button, FormSheetModal } from '@/components';
import {
    JournalCategory,
    JournalEntryType,
    JournalImportance,
    type JournalCategoryValue,
    type JournalEntryRecord,
    type JournalEntryTypeValue,
    type JournalImportanceValue,
} from '@/types/journal';
import { VaultSpaceKey, type VaultSpaceKey as VaultSpaceKeyType } from '@/types/knowledge-vault';

import { VAULT_SPACES } from '../catalogs/vault-spaces-catalog';
import { resolveCreateXp } from '../constants/journal-rewards';
import { transcriptionModeHint } from '../constants/journal-transcription-mode';
import {
    JOURNAL_CATEGORY_LABELS,
    JOURNAL_ENTRY_TYPE_LABELS,
    JOURNAL_UI,
} from '../constants/journal-ui';
import { VAULT_UI } from '../constants/vault-ui';
import { useJournalAudioTranscription } from '../hooks/use-journal-audio-transcription';
import { KnowledgeVaultService } from '../services/knowledge-vault-service';
import { useEnglishJournalStore } from '../store/english-journal-store';
import { entryTypeRequiresAudio, resolveAudioUpdatePayload } from '../utils/journal-form';
import { resolveVaultOrganizeContext } from '../utils/vault-organize-context';
import { JournalEntryImageAttachments } from './JournalEntryImageAttachments';
import { JournalEntryOptionalAudio } from './JournalEntryOptionalAudio';
import { JournalVoiceRecorder } from './JournalVoiceRecorder';
import { VaultChoiceChip } from './vault/VaultChoiceChip';
import { VaultField } from './vault/VaultField';
import { VaultFormSection } from './vault/VaultFormSection';
import { VaultImportancePicker } from './vault/VaultImportancePicker';
import { VaultOrganizeContextCard } from './vault/VaultOrganizeContextCard';
import { VaultRelatedNotesPicker } from './vault/VaultRelatedNotesPicker';

const PRIMARY_ENTRY_TYPES: JournalEntryTypeValue[] = [
  JournalEntryType.TEXT_NOTE,
  JournalEntryType.VOICE_NOTE,
  JournalEntryType.QUICK_NOTE,
  JournalEntryType.GRAMMAR_ENTRY,
  JournalEntryType.VOCABULARY_ENTRY,
  JournalEntryType.LESSON_SUMMARY,
];

const MORE_ENTRY_TYPES: JournalEntryTypeValue[] = [
  JournalEntryType.TEACHER_FEEDBACK,
  JournalEntryType.INTERVIEW_NOTE,
  JournalEntryType.INTERVIEW_NOTES,
  JournalEntryType.PROGRAMMING_ENGLISH,
  JournalEntryType.PROGRAMMING_CONCEPT,
];

const CATEGORIES = Object.values(JournalCategory);

type JournalEntryFormModalProps = {
  visible: boolean;
  editing: JournalEntryRecord | null;
  initialType?: JournalEntryTypeValue;
  defaultSpaceKey?: VaultSpaceKeyType;
  defaultFolderId?: string | null;
  onClose: () => void;
  onSaved: () => void;
};

export const JournalEntryFormModal = ({
  visible,
  editing,
  initialType = JournalEntryType.TEXT_NOTE,
  defaultSpaceKey: defaultSpaceKeyProp = VaultSpaceKey.PERSONAL_NOTES,
  defaultFolderId: defaultFolderIdProp = null,
  onClose,
  onSaved,
}: JournalEntryFormModalProps) => {
  const defaultSpaceKey = defaultSpaceKeyProp ?? VaultSpaceKey.PERSONAL_NOTES;
  const defaultFolderId = defaultFolderIdProp ?? null;
  const folders = useEnglishJournalStore((s) => s.folders);
  const collections = useEnglishJournalStore((s) => s.collections);
  const [entryType, setEntryType] = useState<JournalEntryTypeValue>(initialType);
  const [showMoreTypes, setShowMoreTypes] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<JournalCategoryValue>(JournalCategory.VOCABULARY);
  const [importance, setImportance] = useState<JournalImportanceValue>(JournalImportance.MEDIUM);
  const [tagsInput, setTagsInput] = useState('');
  const [spaceKey, setSpaceKey] = useState<VaultSpaceKeyType>(defaultSpaceKey);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [relatedEntryIds, setRelatedEntryIds] = useState<string[]>([]);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioDurationMs, setAudioDurationMs] = useState(0);
  const [persistedAudioUri, setPersistedAudioUri] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bodyRef = useRef(body);
  bodyRef.current = body;

  const {
    transcriptionMode,
    setTranscriptionMode,
    isTranscribing,
    processingLabel,
    transcriptionError,
    handleRecordingComplete,
    resetTranscriptionState,
  } = useJournalAudioTranscription({
    onBodyUpdate: setBody,
    getBody: () => bodyRef.current,
  });

  useEffect(() => {
    if (!visible) return;
    if (editing) {
      setEntryType(editing.entryType);
      setTitle(editing.title);
      setBody(editing.body ?? '');
      setCategory(editing.category);
      setImportance(editing.importance);
      setTagsInput(editing.tags.join(' '));
      setSpaceKey(editing.spaceKey as VaultSpaceKeyType);
      setFolderId(editing.folderId);
      setIsPinned(editing.isPinned);
      setAudioUri(editing.audioUri);
      setAudioDurationMs(editing.audioDurationMs ?? 0);
      setPersistedAudioUri(editing.audioUri);
      setImages(editing.images ?? []);
      setShowMoreTypes(MORE_ENTRY_TYPES.includes(editing.entryType));
      void KnowledgeVaultService.getEntry(editing.id).then((e) => {
        if (e?.collectionIds) setSelectedCollectionIds(e.collectionIds);
        if (e?.relatedIds) setRelatedEntryIds(e.relatedIds);
      });
    } else {
      setEntryType(initialType);
      setTitle('');
      setBody('');
      setCategory(JournalCategory.VOCABULARY);
      setImportance(JournalImportance.MEDIUM);
      setTagsInput('');
      setSpaceKey(defaultSpaceKey);
      setFolderId(defaultFolderId);
      setIsPinned(false);
      setSelectedCollectionIds([]);
      setRelatedEntryIds([]);
      setAudioUri(null);
      setAudioDurationMs(0);
      setPersistedAudioUri(null);
      setImages([]);
      setShowMoreTypes(MORE_ENTRY_TYPES.includes(initialType));
    }
    setError(null);
    resetTranscriptionState();
  }, [visible, editing, initialType, defaultSpaceKey, defaultFolderId, resetTranscriptionState]);

  const xpPreview = resolveCreateXp(entryType);
  const needsVoice = entryTypeRequiresAudio(entryType);
  const spaceFolders = folders.filter((f) => f.spaceKey === spaceKey);
  const organizeContext = useMemo(
    () => resolveVaultOrganizeContext(spaceKey, folderId, folders),
    [spaceKey, folderId, folders],
  );

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const audioPatch = editing
        ? resolveAudioUpdatePayload(audioUri, audioDurationMs, persistedAudioUri)
        : { audioTempUri: audioUri ?? undefined, audioDurationMs: audioDurationMs || null };

      if (editing) {
        await KnowledgeVaultService.update(editing.id, {
          entryType,
          title,
          body,
          category,
          importance,
          spaceKey,
          folderId,
          tagsInput,
          isPinned,
          collectionIds: selectedCollectionIds,
          relatedEntryIds,
          imageUris: images,
          ...audioPatch,
        });
      } else {
        await KnowledgeVaultService.create({
          entryType,
          title,
          body,
          category,
          importance,
          spaceKey,
          folderId,
          tagsInput,
          isPinned,
          collectionIds: selectedCollectionIds,
          relatedEntryIds,
          audioTempUri: audioUri,
          audioDurationMs: audioDurationMs || null,
          imageUris: images,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar');
    } finally {
      setSaving(false);
    }
  };

  const renderTypeChip = (type: JournalEntryTypeValue) => (
    <VaultChoiceChip
      key={type}
      label={JOURNAL_ENTRY_TYPE_LABELS[type]}
      selected={entryType === type}
      compact
      onPress={() => setEntryType(type)}
    />
  );

  return (
    <FormSheetModal
      visible={visible}
      onClose={onClose}
      sheetHeightRatio={0.9}
      sheetClassName="border-0"
      closeAccessibilityLabel={JOURNAL_UI.cancel}
      header={
        <View className="border-b border-border px-5 py-4">
          <Text className="text-lg font-black text-foreground">
            {editing ? VAULT_UI.formTitleEdit : VAULT_UI.formTitleNew}
          </Text>
          <Text className="mt-1 text-xs text-foreground-secondary">
            {VAULT_UI.xpOnSave(xpPreview)}
          </Text>
        </View>
      }
      footer={
        <View className="gap-2 border-t border-border px-5 py-4">
          <Button
            label={JOURNAL_UI.save}
            onPress={() => void handleSave()}
            loading={saving}
            disabled={saving || isTranscribing}
          />
          <Button label={JOURNAL_UI.cancel} variant="secondary" onPress={onClose} />
        </View>
      }>
      <View className="gap-4 px-5 py-4">
              <VaultFormSection
                emoji="✍️"
                title={VAULT_UI.formStepContent}
                hint={VAULT_UI.formStepContentHint}>
                <VaultField label={JOURNAL_UI.typeLabel}>
                  <View className="flex-row flex-wrap gap-2">
                    {PRIMARY_ENTRY_TYPES.map(renderTypeChip)}
                  </View>
                  <Pressable
                    onPress={() => setShowMoreTypes((v) => !v)}
                    className="mt-2"
                    accessibilityRole="button">
                    <Text className="text-xs font-semibold text-primary">
                      {showMoreTypes ? 'Ocultar tipos extras' : VAULT_UI.formTypeMore}
                    </Text>
                    {!showMoreTypes ? (
                      <Text className="text-[10px] text-muted">{VAULT_UI.formTypeMoreHint}</Text>
                    ) : null}
                  </Pressable>
                  {showMoreTypes ? (
                    <View className="mt-2 flex-row flex-wrap gap-2">
                      {MORE_ENTRY_TYPES.map(renderTypeChip)}
                    </View>
                  ) : null}
                </VaultField>

                <VaultField
                  label={JOURNAL_UI.transcriptionModeLabel}
                  hint={transcriptionModeHint(transcriptionMode)}>
                  <View className="flex-row flex-wrap gap-2">
                    <VaultChoiceChip
                      label={JOURNAL_UI.transcriptionModePortuguese}
                      selected={transcriptionMode === 'portuguese_to_english'}
                      onPress={() => setTranscriptionMode('portuguese_to_english')}
                    />
                    <VaultChoiceChip
                      label={JOURNAL_UI.transcriptionModePortugueseOnly}
                      selected={transcriptionMode === 'portuguese'}
                      onPress={() => setTranscriptionMode('portuguese')}
                    />
                    <VaultChoiceChip
                      label={JOURNAL_UI.transcriptionModeEnglish}
                      selected={transcriptionMode === 'english'}
                      onPress={() => setTranscriptionMode('english')}
                    />
                  </View>
                </VaultField>

                <VaultField label={JOURNAL_UI.titleLabel} hint={JOURNAL_UI.titleHint}>
                  <TextInput
                    className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
                    value={title}
                    onChangeText={setTitle}
                    placeholder={JOURNAL_UI.titlePlaceholder}
                    placeholderTextColor="#71717a"
                  />
                </VaultField>

                {needsVoice ? (
                  <JournalVoiceRecorder
                    recordingUri={audioUri}
                    durationMs={audioDurationMs}
                    isTranscribing={isTranscribing}
                    processingLabel={processingLabel}
                    onRecordingChange={(uri, ms) => {
                      setAudioUri(uri);
                      setAudioDurationMs(ms);
                    }}
                    onRecordingComplete={handleRecordingComplete}
                  />
                ) : null}

                <VaultField
                  label={JOURNAL_UI.bodyLabel}
                  hint={needsVoice ? JOURNAL_UI.transcriptionHint : JOURNAL_UI.bodyHint}>
                  <TextInput
                    className="min-h-[100px] rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
                    value={body}
                    onChangeText={setBody}
                    placeholder={JOURNAL_UI.bodyPlaceholder}
                    placeholderTextColor="#71717a"
                    multiline
                    textAlignVertical="top"
                    editable={!isTranscribing}
                  />
                  {isTranscribing ? (
                    <Text className="mt-2 text-xs font-semibold text-primary">{processingLabel}</Text>
                  ) : null}
                  {transcriptionError ? (
                    <Text className="mt-2 text-xs text-warning">{transcriptionError}</Text>
                  ) : null}
                </VaultField>

                <JournalEntryImageAttachments
                  images={images}
                  onChange={setImages}
                  disabled={saving || isTranscribing}
                />

                {!needsVoice ? (
                  <JournalEntryOptionalAudio
                    key={`optional-audio-${editing?.id ?? 'new'}`}
                    entryId={editing?.id ?? 'new-entry'}
                    recordingUri={audioUri}
                    durationMs={audioDurationMs}
                    persistedUri={persistedAudioUri}
                    persistedDurationMs={editing?.audioDurationMs ?? 0}
                    isTranscribing={isTranscribing}
                    processingLabel={processingLabel}
                    onRecordingChange={(uri, ms) => {
                      setAudioUri(uri);
                      setAudioDurationMs(ms);
                    }}
                    onRecordingComplete={handleRecordingComplete}
                  />
                ) : null}
              </VaultFormSection>

              <VaultFormSection
                emoji="🗂️"
                title={VAULT_UI.formStepOrganize}
                hint={VAULT_UI.formStepOrganizeHint}
                className="bg-background">
                <VaultField label={VAULT_UI.spaceLabel} hint={VAULT_UI.spaceHint}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2 py-0.5">
                      {VAULT_SPACES.map((space) => (
                        <VaultChoiceChip
                          key={space.key}
                          emoji={space.emoji}
                          label={space.label}
                          selected={spaceKey === space.key}
                          onPress={() => {
                            setSpaceKey(space.key);
                            setFolderId(null);
                          }}
                        />
                      ))}
                    </View>
                  </ScrollView>
                </VaultField>

                <VaultField label={VAULT_UI.folderLabel} hint={VAULT_UI.folderHint}>
                  <View className="flex-row flex-wrap gap-2">
                    <VaultChoiceChip
                      label={VAULT_UI.folderNone}
                      selected={!folderId}
                      compact
                      onPress={() => setFolderId(null)}
                    />
                    {spaceFolders.map((folder) => (
                      <VaultChoiceChip
                        key={folder.id}
                        label={folder.name}
                        selected={folderId === folder.id}
                        compact
                        onPress={() => setFolderId(folder.id)}
                      />
                    ))}
                  </View>
                </VaultField>

                <VaultOrganizeContextCard context={organizeContext} />

                {collections.length > 0 ? (
                  <VaultField label={VAULT_UI.collectionLabel} hint={VAULT_UI.collectionHint}>
                    <View className="flex-row flex-wrap gap-2">
                      {collections.map((col) => {
                        const selected = selectedCollectionIds.includes(col.id);
                        return (
                          <VaultChoiceChip
                            key={col.id}
                            emoji={col.emoji}
                            label={col.name}
                            selected={selected}
                            compact
                            onPress={() =>
                              setSelectedCollectionIds((prev) =>
                                selected ? prev.filter((id) => id !== col.id) : [...prev, col.id],
                              )
                            }
                          />
                        );
                      })}
                    </View>
                  </VaultField>
                ) : null}

                <VaultRelatedNotesPicker
                  excludeEntryId={editing?.id ?? null}
                  selectedIds={relatedEntryIds}
                  onChange={setRelatedEntryIds}
                />
              </VaultFormSection>

              <VaultFormSection
                emoji="⚙️"
                title={VAULT_UI.formStepExtras}
                hint={VAULT_UI.formStepExtrasHint}>
                <VaultField label={JOURNAL_UI.importanceLabel}>
                  <VaultImportancePicker value={importance} onChange={setImportance} />
                </VaultField>

                <VaultField label={JOURNAL_UI.categoryLabel}>
                  <View className="flex-row flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <VaultChoiceChip
                        key={cat}
                        label={JOURNAL_CATEGORY_LABELS[cat]}
                        selected={category === cat}
                        compact
                        onPress={() => setCategory(cat)}
                      />
                    ))}
                  </View>
                </VaultField>

                <Pressable
                  onPress={() => setIsPinned((p) => !p)}
                  className="flex-row items-center gap-2 rounded-xl border border-border bg-surface px-3 py-3"
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isPinned }}>
                  <Text className="text-lg">{isPinned ? '📌' : '📍'}</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">
                      {isPinned ? VAULT_UI.unpinLabel : VAULT_UI.pinLabel}
                    </Text>
                    <Text className="text-xs text-muted">{VAULT_UI.pinHint}</Text>
                  </View>
                </Pressable>

                <VaultField label={JOURNAL_UI.tagsLabel} hint={JOURNAL_UI.tagsHint}>
                  <TextInput
                    className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
                    value={tagsInput}
                    onChangeText={setTagsInput}
                    placeholder={JOURNAL_UI.tagsPlaceholder}
                    placeholderTextColor="#71717a"
                    autoCapitalize="none"
                  />
                </VaultField>
              </VaultFormSection>

        {error ? <Text className="text-sm text-danger">{error}</Text> : null}
      </View>
    </FormSheetModal>
  );
};
