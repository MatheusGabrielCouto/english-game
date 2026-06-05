# Microcopy — English Quest

Guia de tom de voz para toda a UI (P-36).  
**Objetivo:** soar como **jogo de evolução**, não como app de produtividade corporativa (Notion, dashboards BI, “second brain”).

**Fontes de verdade no código:** `src/features/*/constants/*-ui.ts`, `src/constants/*-ui.ts`.

---

## Persona

Você é o **mentor dentro do jogo** — anima, orienta e celebra. Nunca é o gerente de projeto nem o analista de dados.

| Somos | Não somos |
| ----- | --------- |
| Encorajadores, diretos, calorosos | Frios, burocráticos, distantes |
| “Faça agora”, “Boa!”, “Ainda dá tempo” | “Execute”, “Otimize”, “Visão geral” |
| Jogador em uma jornada | Usuário em um workspace |
| Português do Brasil, **você** | “O usuário”, voz passiva longa, inglês desnecessário na UI |

---

## Dois modos (mesmo tom)

Todo o app usa o **mesmo mentor**; só muda o quanto de “game feel” aparece na superfície.

| Modo | Superfícies | Tom |
| ---- | ----------- | --- |
| **Gameplay** | Home, Jogar, Pet, Cidade, Loot, Duelos | Metáforas de jogo, recompensas, urgência leve |
| **Utilitário** | Vault, formulários, perfil, configurações | Claro e prático — mas ainda humano; evitar jargão de PM |

Regra: utilitário **≠** corporativo. Vault organiza notas; Statistics sugere próximo passo — os dois falam com o jogador, não com o “knowledge worker”.

---

## Vocabulário

### Prefira

- **Missão**, **recompensa**, **evoluir**, **guardar**, **revisar**, **próximo passo**
- **Hoje**, **agora**, **ainda dá tempo**, **boa!**, **continue**
- Verbos no imperativo suave: *Abra*, *Registre*, *Volte*, *Explore*

### Evite

| Evitar | Por quê | Alternativa |
| ------ | ------- | ----------- |
| Visão geral, dashboard, métricas, KPI | Soa BI | Resumo, radar, números (só em Detalhes) |
| Acionável, leverage, workflow | Corporativo | Dica de hoje, próximo passo |
| Second brain, workspace, knowledge base | Notion | Vault, biblioteca, caderno de inglês |
| Domínio estimado, utilize, organize (sozinho) | Frio / manual | Quanto você já domina, use, agrupe |
| O usuário deve… | Distância | Você pode… / Toque para… |
| Falha na operação | Sistema | Algo deu errado — tente de novo |

### Inglês na UI

- **Nomes de produto** fixos: `English Quest`, `Knowledge Vault`, `Focus Mode` — ok em títulos.
- **Corpo e CTAs:** português sempre que possível.
- Termos de jogador já estabelecidos: streak, XP, tier, loot — ok se o jogador já vê no app.

---

## Padrões por elemento

### Título de tela

- Curto + emoji opcional no header (`ScreenHeader`).
- Subtítulo = **1 linha** de contexto emocional ou de ação.

```text
✅ Insights — Uma dica por dia; métricas ficam em Detalhes.
❌ Insights — Uma dica acionável por dia baseada em métricas agregadas.
```

### Seções (label / hint)

- **Label:** 2–4 palavras, substantivo concreto (`Revisar agora`, `Faça agora`).
- **Hint:** 1 frase — *por que* importa, não *o que é o componente*.

```text
✅ hint: O app lembra de revisar para você não esquecer.
❌ hint: Funcionalidade de revisão espaçada baseada em algoritmo.
```

### CTAs

- Verbo + objeto: `Registrar primeira nota`, `Ir para missões`, `Abrir caixas`.
- Evite `OK`, `Confirmar` genérico quando houver ação específica.
- Botão destrutivo: nomear o que some (`Excluir nota`, não só `Excluir` em contexto ambíguo).

### Empty states

Estrutura fixa em três partes:

1. **Título** — convite ou estado neutro (`Comece seu caderno de inglês`).
2. **Corpo** — 1–2 frases: benefício + primeiro passo.
3. **CTA** — verbo claro (`Registrar primeira nota`).

Nunca culpe o usuário (`Você não tem notas`). Use convite (`Ainda não há notas — a primeira é rápida`).

### Insights (Statistics)

Uma dica por dia (P-24). Tom de **coach**, não relatório.

- Fale do **estado do jogo agora** (`Falta só uma missão diária…`).
- CTA leva à tela certa (`Ir para missões`).
- Sem porcentagens no insight principal, salvo quando motivam (`Missões da semana em 60%`).

Referência: `src/features/statistics/utils/insights.ts`.

### Erros e toasts

- Erro: o que aconteceu + o que fazer (`Não foi possível salvar a lista — tente de novo`).
- Sucesso: celebre curto (`Boa! Revisão registrada.`).
- Use `showGameToast()` — mensagens alinhadas a este guia.

### Confirmações destrutivas

- Diga o que **não** acontece quando aplicável (`As notas não são apagadas — só saem da lista`).

---

## Vault (Knowledge)

O Vault é **caderno de inglês dentro do jogo**, não Notion.

| Área | Tom |
| ---- | --- |
| Início / biblioteca | Caderno vivo — registrar, buscar, revisar |
| Áreas e listas | Metáforas leves (cômodo, playlist) — sem manual de produto |
| Mapa | Rede visual — explorar, não “grafo de conhecimento” |
| Resumo (dashboard) | Progresso do jogador no vault — não painel analítico |

### Checklist Vault

- [ ] Título da aba Resumo não usa “dashboard” nem “visão geral”.
- [ ] Hints explicam benefício para o estudo, não feature list.
- [ ] Busca: “Buscar em tudo”, não “Busca global”.
- [ ] Empty states convidam a **registrar**, não a “criar conteúdo”.
- [ ] Formulário: passos curtos (`Conteúdo` → `Organizar` → `Detalhes`).

**Arquivo:** `src/features/english-journal/constants/vault-ui.ts`

---

## Statistics (Insights)

Statistics é **coach diário**, não BI.

| Prioridade | Conteúdo |
| ---------- | -------- |
| 1 | `StatisticsInsightsFeed` — 1 insight + CTA |
| 2 | Seções colapsáveis em **Detalhes** — números completos |

### Checklist Statistics

- [ ] Subtítulo da tela não usa “acionável” nem “métricas agregadas”.
- [ ] Hero não é só “Seus números” sem contexto de jogo.
- [ ] Seções usam subtítulo humano (`Chama acesa e ritmo`), não lista de features.
- [ ] Insights em `insights.ts` seguem voz de coach (referência boa).

**Arquivos:** `statistics-ui.ts`, `insights.ts`

---

## Onde colocar strings novas

1. Criar ou estender `*-ui.ts` no domínio — **nunca** string solta em componente, salvo protótipo temporário.
2. Agrupar por tela: `screenTitle`, `sections`, `empty*`, `cta*`.
3. Funções para plural: `(n: number) => n === 1 ? '1 nota' : \`${n} notas\``.
4. Testes de UI em `src/constants/__tests__/` quando regras forem críticas (opcional).

---

## Revisão antes de merge

1. Ler em voz alta — parece NPC do jogo ou e-mail corporativo?
2. Subtítulo cabe em **uma linha** no celular?
3. CTA deixa claro **para onde** o jogador vai?
4. Empty state tem convite, não julgamento?
5. Vault/Statistics passaram nos checklists acima?

---

## Antes → depois (referência)

| Contexto | ❌ Notion / corporativo | ✅ English Quest |
| -------- | ---------------------- | ---------------- |
| Vault Resumo | Visão geral do que você já guardou. Use os números para ver ritmo… | O que você já conquistou no inglês — e o que vale revisar hoje. |
| Vault stats | Números da biblioteca | O que você já guardou |
| Vault busca | Busca global — Todas as notas, áreas e tags | Buscar em tudo — notas, áreas e tags do vault |
| Statistics tela | Uma dica acionável por dia | Uma dica por dia — métricas ficam em Detalhes |
| Statistics hero | Seus números | Seu radar no jogo |
| Insight | Complete suas tarefas pendentes para otimizar produtividade | Falta só uma missão diária para fechar o dia com chave de ouro. |

---

## Relacionados

- `docs/DESIGN_SYSTEM.md` — tokens, componentes, `GameDisplayText`
- `docs/UX_UI_AUDIT.md` — P-24 (insights feed), P-36 (este guia)
- `src/constants/error-boundary-features.ts` — tom em falhas (P-33)
