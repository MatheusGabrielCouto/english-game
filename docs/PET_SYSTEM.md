# Pet System — English Quest

Documento de design e implementação do sistema de companheiro virtual.

---

## Visão geral

O pet é o **companheiro emocional** da jornada de aprendizado. Ele evolui com o jogador, reage ao humor/streak, possui vitals (energia, fome, felicidade, motivação), afinidade (0–1000), interações diárias, memórias e coleção estilo Pokédex.

### Implementado nesta fase

| Módulo | Status |
|--------|--------|
| 104 animações (idle/happy/sad/excited) | ✅ Catálogo |
| Tela dedicada do pet | ✅ `/pet` |
| Nome customizável | ✅ |
| 8 interações | ✅ |
| Afinidade 0→1000 + tiers | ✅ |
| 50 alimentos | ✅ Catálogo |
| 12 brinquedos | ✅ Catálogo |
| 40 cosméticos | ✅ Catálogo |
| Diálogos offline contextuais | ✅ |
| Rotina (manhã/tarde/noite/dormindo) | ✅ |
| Álbum de memórias | ✅ |
| Petédex (29 espécies) | ✅ |
| Avaliação IA | 📋 Roadmap (abaixo) |

---

## Arquitetura

```
src/features/pet/
├── catalogs/          # Animações, comidas, brinquedos, cosméticos, diálogos
├── components/        # UI da tela dedicada
├── services/
│   ├── pet-service.ts              # XP, humor, rotina, vitals decay
│   ├── pet-interaction-service.ts  # Carinho, alimentar, brincar...
│   ├── pet-memory-service.ts       # Milestones emocionais
│   └── pet-collection-service.ts   # Petédex
└── utils/             # Afinidade, rotina, XP
```

**Persistência:** SQLite (`pets`, `pet_memories`, `pet_collection`).

---

## Tarefa 13 — Avaliação final

### 1. Como aumentar apego emocional?

- **Nome + presença constante:** O pet tem nome visível na Home e na tela dedicada.
- **Reações imediatas:** Animações excited ao ganhar XP, evoluir ou completar missões.
- **Interações gratuitas:** Carinho, conversa e foto não exigem moedas — reduzem barreira emocional.
- **Memórias compartilhadas:** Álbum registra marcos (primeiro dia, streak 7, evolução, contrato, nível 50).
- **Afinidade progressiva:** Tiers desbloqueiam diálogos mais íntimos e bônus — sensação de relacionamento real.
- **Próximo passo:** Push notifications com mensagem do pet pelo nome; cutscenes curtas na evolução.

### 2. Como aumentar retenção?

- **Vitals decay:** Energia/fome caem com o tempo → motivo para abrir o app e interagir.
- **Rotina visível:** Pet “dorme” à noite e acorda de manhã — reforça hábito diário.
- **Streak ↔ humor:** Pet triste quando streak cai; feliz quando mantém — espelho emocional do progresso.
- **Coleção:** 29 espécies + evoluções = meta de longo prazo.
- **Cosméticos:** Loop de desejo por chapéus, skins, etc. (integrar com shop/loot futuramente).

### 3. Como transformar o pet em protagonista?

- **Home:** Preview card com nome, afinidade e humor — não só XP do jogador.
- **Missões:** Pet celebra conclusão (animação + diálogo).
- **Contratos:** Memória “Primeiro Contrato” — pet como testemunha do compromisso.
- **Carreira internacional:** Pet comenta sonhos de remote work / entrevistas (diálogos `english_practice`).
- **Futuro:** Pet na tab bar; avatar do pet no perfil; pet “coach” nas lições.

### 4. Como integrar o pet ao aprendizado de inglês?

| Mecanismo | Implementação |
|-----------|---------------|
| Diálogos em inglês | Frases offline em `pet-dialogues-catalog` |
| Treinar | Interação dá +5 pet XP + diálogo de missão |
| Conversar | Contexto `english_practice` com frases para repetir |
| Recompensa por estudo | Pet XP via dailies, weeklies, contratos, 15% do player XP |
| Passivos por espécie | Code Owl +5% XP, Debug Duck +5% coins, etc. |
| Futuro | Quest “Fale 3 frases com seu pet”; correção via IA |

### 5. Vale a pena adicionar IA?

**Sim, em fase 2** — não no MVP emocional.

| Critério | Offline (atual) | IA (LLM) |
|----------|-----------------|----------|
| Custo | Zero | ~$0.001–0.01/interação |
| Latência | Instantâneo | 1–3s |
| Personalização | Limitada | Alta |
| Speaking practice | Frases fixas | Conversa + correção |
| Offline-first | ✅ | Requer API |

**Benefícios IA:** conversa natural, correção gramatical, role-play de entrevista, motivação contextual.

**Riscos:** custo em escala, moderação, alucinações, dependência de rede.

### 6. Em qual momento do roadmap a IA deve entrar?

**Fase 2 — após validação emocional (8–12 semanas pós-launch):**

Pré-requisitos:
1. Retenção D7/D30 com pet offline comprovada
2. ≥30% dos usuários interagem 3+ vezes/semana
3. Infra de API keys + rate limit + cache de respostas comuns

Arquitetura ideal:
```
App → Edge Function (rate limit, prompt template)
    → OpenAI / Anthropic (gpt-4o-mini ou claude-haiku)
    → Resposta + metadata (correções, sugestões)
```

Prompt inclui: nome do pet, nível, streak, humor, última missão, objetivo de carreira.

Fallback: diálogos offline se API falhar.

### 7. Conforme o pet evolui, o que acontece?

| Estágio | Nível | Mudanças |
|---------|-------|----------|
| Egg 🥚 | 1 | Incubação visual; poucas interações |
| Baby 🐣 | 5 | Desbloqueia animações happy; memória “Primeira Evolução”; +100 coins |
| Teen 🐥 | 10 | Cosméticos baby+; diálogos de missão; +250 coins |
| Adult 🐦 | 20 | Cosméticos teen+; passivo da espécie mais perceptível; +500 coins |
| Legendary 🦅 | 50 | Animações exclusivas (minAffinity 200+); memória lendária; +1000 coins; visual premium |

**Gameplay adicional por evolução:**
- Cap de vitals sobe implicitamente (decay mais lento em estágios altos — futuro)
- Novas linhas de diálogo (`evolution`, `affinity`)
- Entrada na Petédex com linha evolutiva completa
- Afinidade 850+ → tier “Alma Gêmea” com bônus narrativo

---

## Catálogos

- **Animações:** 104 entradas (`pet-animations-catalog.ts`)
- **Comidas:** 50 (`pet-foods-catalog.ts`)
- **Brinquedos:** 12 (`pet-toys-catalog.ts`)
- **Cosméticos:** 40 (`pet-cosmetics-catalog.ts`)
- **Diálogos:** 40+ frases contextuais (`pet-dialogues-catalog.ts`)

---

## Afinidade

| Tier | Min | Bônus |
|------|-----|-------|
| Conhecido | 0 | Diálogos básicos |
| Amigo | 100 | +2% XP do pet |
| Melhor Amigo | 300 | Animações especiais |
| Parceiro | 600 | +5% moedas em dailies |
| Alma Gêmea | 850 | Evolução especial (narrativa) |

Ganho por interação: 4–15 pontos (+ bônus de comida/brinquedo).

---

## Migration

`0022_pet_expansion.sql` + reconcile em `reconcile-game-design-schema.ts` para colunas adicionais e tabela `pet_memories`.

---

## Próximos passos sugeridos

1. Integrar comidas/brinquedos ao inventário/shop
2. Animações Lottie/Rive substituindo emoji
3. Cooldown visual por interação (evitar spam)
4. Tab dedicada “Pet” na bottom bar
5. IA conversacional (Fase 2)
6. Multi-pet / troca de espécie ativa
