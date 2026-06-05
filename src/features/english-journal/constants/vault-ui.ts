export const VAULT_UI = {
  vaultName: 'English Knowledge Vault',
  vaultTagline: 'Seu cérebro de inglês',
  vaultSubtitle:
    'Guarde tudo que aprende — palavras, regras, áudios e correções — num só lugar, organizado e fácil de revisar.',

  hubLibrary: 'Início',
  hubLibraryHint: 'Ver e buscar notas',
  hubSpaces: 'Áreas',
  hubSpacesHint: 'Grammar, Vocabulário…',
  hubCollections: 'Listas',
  hubCollectionsHint: 'Temas que você monta',
  hubMap: 'Mapa',
  hubMapHint: 'Rede visual do vault',
  hubDashboard: 'Resumo',
  hubDashboardHint: 'Números e progresso',

  howItWorksTitle: 'Como funciona?',
  howItWorksBody:
    '1) Registre algo que aprendeu · 2) Escolha a área (ex.: Grammar) · 3) O app lembra de revisar depois. Quanto mais você guarda, mais sua biblioteca e a cidade evoluem.',

  quickActionsTitle: 'O que você quer registrar?',
  actionTextNote: 'Nota de texto',
  actionTextNoteHint: 'Explicação, regra ou resumo',
  actionVoiceNote: 'Nota de voz',
  actionVoiceNoteHint: 'Grave em inglês no momento',
  actionQuickNote: 'Nota rápida',
  actionQuickNoteHint: 'Uma frase ou dica curta',
  actionGrammar: 'Regra de gramática',
  actionGrammarHint: 'Past perfect, although…',

  searchLabel: 'Buscar na biblioteca',
  searchHint: 'Título, texto ou tags (#grammar)',
  searchPlaceholder: 'Ex.: past perfect, although, entrevista…',

  statsNotes: (n: number) => `${n} notas`,
  statsVoice: (n: number) => `${n} áudios`,
  statsReviewsDue: (n: number) => (n === 1 ? '1 revisão hoje' : `${n} revisões pendentes`),
  knowledgeLevel: (level: number) => `Nível ${level}`,
  knowledgePoints: (kp: number) => `${kp} pontos de conhecimento`,
  knowledgeMastery: (pct: number) => `${pct}% domínio estimado`,
  libraryTier: (tier: number) => `Biblioteca nível ${tier}`,
  libraryBuilding: 'Centro de Conhecimento na cidade',

  sectionReviews: 'Revisar agora',
  sectionReviewsHint: 'O app sugere rever para não esquecer',
  sectionPinned: 'Fixadas no topo',
  sectionPinnedHint: 'Conteúdos mais importantes para você',
  sectionFavorites: 'Favoritas',
  sectionRecent: 'Recentes',
  sectionImportant: 'Alta prioridade',

  pinnedKnowledge: 'Fixada',
  relatedKnowledge: 'Conhecimento relacionado',
  relatedKnowledgeHint: 'Notas ligadas ajudam a revisar em contexto',
  addLink: 'Vincular outra nota',
  relatedFormHint: 'Toque para adicionar ou remover. Aparecem como linhas tracejadas no mapa.',
  relatedFormEmpty: 'Nenhuma nota vinculada ainda.',
  relatedFormSearch: 'Buscar nota por título ou tag…',
  relatedFormNoResults: 'Nenhuma nota encontrada. Salve a nota e tente de novo.',
  noRelated: 'Nenhuma nota vinculada. Edite a nota para conectar tópicos relacionados.',

  spaceLabel: 'Área de conhecimento',
  spaceHint: 'Onde isso mora na sua biblioteca — ex.: Grammar, Vocabulário',
  folderLabel: 'Pasta',
  folderHint: 'Subpasta dentro da área — ex.: Verb Tenses',
  folderNone: 'Sem pasta',
  organizeSpaceContextLabel: 'Área selecionada',
  organizeFolderContextLabel: 'Pasta selecionada',
  organizeFolderNoneLabel: 'Sem pasta',
  organizeNoFolderDescription: (spaceLabel: string) =>
    `A nota fica direto em ${spaceLabel}, sem subpasta. Use quando o tema ainda não tem um lugar fixo ou é pontual.`,
  organizeCustomFolderDescription: (folderName: string, spaceLabel: string) =>
    `Notas sobre "${folderName}" dentro de ${spaceLabel}. Você criou esta pasta — use para o que fizer sentido no seu estudo.`,
  organizeContextA11y: (spaceLabel: string, folderName: string | null) =>
    folderName
      ? `Área ${spaceLabel}, pasta ${folderName}`
      : `Área ${spaceLabel}, sem pasta`,
  collectionLabel: 'Listas (opcional)',
  collectionHint: 'Como playlists: IELTS, Entrevista, Curso…',
  pinLabel: 'Fixar no topo',
  pinHint: 'Aparece sempre no início da biblioteca',
  pinNote: 'Fixar no topo',
  unpinNote: 'Desafixar',
  unpinLabel: 'Desafixar',

  spacePicker: 'Área de conhecimento',
  folderPicker: 'Pasta (opcional)',
  collectionPicker: 'Listas de estudo',

  statsCollections: (n: number) => (n === 1 ? '1 lista' : `${n} listas`),
  statsConnections: (n: number) => (n === 1 ? '1 vínculo' : `${n} vínculos`),

  formTypeMore: 'Mais tipos de nota',
  formTypeMoreHint: 'Entrevista, programação, feedback…',

  formTitleNew: 'Nova nota',
  formTitleEdit: 'Editar nota',
  formStepContent: 'Conteúdo',
  formStepContentHint: 'O que você aprendeu ou quer lembrar',
  formStepOrganize: 'Organizar',
  formStepOrganizeHint: 'Área, pasta e listas — para achar depois',
  formStepExtras: 'Detalhes',
  formStepExtrasHint: 'Prioridade, tags e fixar',

  dashboardTitle: 'Resumo do conhecimento',
  dashboardIntro:
    'Visão geral do que você já guardou. Use os números para ver ritmo de estudo e o que precisa de revisão.',
  mapTitle: 'Mapa de conhecimento',
  mapIntro:
    'Visualize sua rede de inglês: áreas, pastas, notas e vínculos. Toque nos nós para explorar.',
  mapEmpty: 'Ainda não há notas. Crie a primeira na aba Início.',
  mapLegendTap: 'Toque na nota para abrir',
  mapSpaceNotes: (n: number) => (n === 1 ? '1 nota nesta área' : `${n} notas nesta área`),
  mapSpaceEmpty: 'Nenhuma pasta com notas ainda.',

  dashboardProgressTitle: 'Seu progresso',
  dashboardMasteryLabel: 'Domínio do conhecimento',
  dashboardStatsTitle: 'Números da biblioteca',
  dashboardTagsTitle: 'Tags mais usadas',
  dashboardTagsHint: 'O que você mais registra — útil para ver foco de estudo',
  dashboardNoTags: 'Use tags nas notas para ver aqui o que você mais estuda.',
  dashboardReviewHint: 'Revisar hoje evita esquecer o que você guardou.',
  dashboardReviewCta: 'Ir revisar no Início',
  dashboardActiveSpaces: (n: number) => (n === 1 ? '1 área com notas' : `${n} áreas com notas`),
  dashboardPinned: (n: number) => (n === 1 ? '1 fixada' : `${n} fixadas`),

  spaceNotesCount: (n: number) => (n === 1 ? '1 nota nesta área' : `${n} notas nesta área`),
  spaceAddNote: 'Nova nota nesta área',
  spaceEmptyTitle: (name: string) => `Nada em ${name} ainda`,
  spaceEmptyBody: 'Crie a primeira nota aqui — ela já fica na área certa.',
  spaceNotesSection: 'Notas desta área',
  spaceFoldersSection: 'Pastas',
  spaceFoldersHint: 'Organize suas notas — pastas vazias aparecem até você registrar algo nelas',
  spaceFolderNotes: (n: number) => (n === 1 ? '1 nota' : `${n} notas`),
  spaceFolderEmpty: 'Nenhuma nota nesta pasta ainda',
  spaceUnfiledSection: 'Sem pasta',
  spaceUnfiledHint: 'Notas que ainda não foram colocadas numa pasta',
  spaceBrowseHint: 'Abrir notas desta área',
  collectionsTitle: 'Listas de estudo',
  collectionsIntro:
    'Agrupe notas por tema (como playlists). Uma mesma nota pode estar em várias listas — útil para IELTS, entrevista ou curso.',
  spacesTitle: 'Áreas de conhecimento',
  spacesIntro:
    'Cada área é um “cômodo” da sua biblioteca. Ao criar uma nota, escolha a área certa — as pastas já vêm sugeridas.',
  spacesFolderCount: (n: number) => (n === 1 ? '1 pasta' : `${n} pastas`),

  newCollection: 'Nova lista',
  editCollection: 'Editar lista',
  saveCollection: 'Salvar lista',
  deleteCollection: 'Excluir lista',
  deleteCollectionConfirm: 'Excluir esta lista? As notas não são apagadas — só saem da lista.',
  deleteCollectionConfirmAction: 'Excluir',
  cancel: 'Cancelar',
  collectionNameLabel: 'Nome da lista',
  collectionNamePlaceholder: 'Ex.: IELTS, Entrevista, Curso…',
  collectionDescriptionLabel: 'Descrição (opcional)',
  collectionDescriptionPlaceholder: 'Para que serve esta lista?',
  collectionEmojiLabel: 'Ícone',
  collectionTemplatesTitle: 'Modelos rápidos',
  collectionTemplatesHint: 'Toque para preencher o formulário',
  collectionManageHint: 'Edite ou exclua listas que você criou',
  collectionNotes: (n: number) =>
    n === 1 ? '1 nota nesta lista' : `${n} notas nesta lista`,
  collectionFormError: 'Corrija os campos destacados',
  collectionSaveError: 'Não foi possível salvar a lista',

  emptyLibraryTitle: 'Sua biblioteca está vazia',
  emptyLibraryBody:
    'Registre a primeira coisa que aprendeu hoje — uma palavra, correção do professor ou áudio. Em segundos você monta seu histórico de inglês.',
  emptyLibraryCta: 'Criar primeira nota',

  emptyCollectionsTitle: 'Nenhuma lista ainda',
  emptyCollectionsBody:
    'Listas servem para juntar notas de um mesmo objetivo — entrevista, curso, IELTS. Crie uma lista e associe notas ao salvar.',

  reviewBanner: (count: number) =>
    count === 1
      ? '1 nota pronta para revisão — reforce agora'
      : `${count} notas prontas para revisão`,
  reviewCta: 'Marcar como revisada',
  reviewSuccessTitle: 'Revisão registrada',
  reviewSuccessBody: (next: string) => `Boa! ${next}.`,
  reviewDoneHint: 'Esta nota saiu da fila de revisão de hoje.',
  reviewMessageHint: 'Mensagem de revisão espaçada',

  filterSpace: (name: string) => `Filtrando: ${name}`,
  clearFilter: 'Ver tudo',

  openNote: 'Abrir nota',
  editNote: 'Editar',
  deleteNote: 'Excluir nota',
  deleteNoteConfirm: 'Esta nota será apagada permanentemente, incluindo o áudio gravado.',
  deleteNoteAction: 'Excluir',
  listenAgain: 'Ouvir',
  listenStop: 'Parar',

  xpOnSave: (xp: number) => `+${xp} XP ao salvar`,
} as const;

export type VaultHubKey = 'library' | 'spaces' | 'collections' | 'map' | 'dashboard';
