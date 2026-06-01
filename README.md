# English Quest

Aplicativo gamificado para aprendizado de inglês, construído com Expo.

## Stack

- Expo Router
- TypeScript
- NativeWind (Tailwind CSS)
- Zustand + SQLite (expo-sqlite + Drizzle ORM)
- React Hook Form + Zod

## Pré-requisitos

- [pnpm](https://pnpm.io/installation) (gerenciador de pacotes do projeto)

## Estrutura

```
src/
├── app/              # Rotas (Expo Router)
├── components/       # UI reutilizável
├── features/         # Módulos por domínio
├── hooks/
├── services/
├── storage/          # Drizzle ORM + SQLite repositories
├── constants/
├── utils/
└── types/
```

## Começar

```bash
pnpm install
pnpm exec expo start -c
```

## Banco de dados (Drizzle)

| Comando            | Uso                                                     |
| ------------------ | ------------------------------------------------------- |
| `pnpm db:generate` | Gera migrations para o app (Expo) após alterar o schema |
| `pnpm db:push`     | Aplica o schema no SQLite local `.data/` (dev)          |
| `pnpm db:studio`   | Abre o Drizzle Studio no navegador (banco local)        |

- **App (simulador/dispositivo):** `drizzle.config.ts` com `driver: 'expo'` + migrations em `drizzle/`
- **Studio no Mac:** `drizzle.studio.config.ts` com `dbCredentials` → arquivo `.data/english-quest-dev.db`

O `drizzle-kit studio` padrão **não** lê o banco do celular/emulador. Para inspecionar os dados reais do app, use o plugin [expo-drizzle-studio-plugin](https://github.com/drizzle-team/drizzle-studio-expo) (`Shift + M` no terminal do Expo).

Schema: `src/storage/database/schema.ts`

## Scripts

- `pnpm start` — servidor de desenvolvimento
- `pnpm ios` — iOS
- `pnpm android` — Android (dev client + Metro)
- `pnpm web` — Web
- `pnpm android:apk:release` — gera APK release local (Gradle)
- `pnpm android:build:preview` — gera APK na nuvem (EAS, perfil `preview`)

## Build nativo (iOS / Android)

O projeto usa **dev client** (`expo-dev-client`). Depois de adicionar módulos nativos (ex.: `expo-audio`), recompile:

```bash
pnpm android   # ou pnpm ios
```

### iOS: `React-Core-prebuilt` / `pod install` falha

Se o caminho do projeto tiver **espaços** (ex.: `Estudos/React Native/app-foco`), o download dos tarballs pré-compilados do React Native pode quebrar. O repositório já força build from source em `ios/Podfile.properties.json`:

- `ios.buildReactNativeFromSource`: `true`
- `EXPO_USE_PRECOMPILED_MODULES`: `false`

Se ainda falhar, limpe e reinstale os pods:

```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
pnpm ios
```

**Recomendação:** clonar o repo em um caminho **sem espaços** (ex.: `~/Estudos/app-foco`) para builds iOS mais rápidos.

### Áudio (`expo-audio`)

Só funciona no binário nativo recompilado após instalar `expo-audio`. No simulador/dispositivo, ajuste sons em **Perfil → Sistema → Áudio do jogo**.

## Gerar APK para teste

### Opção 1 — Local (mais rápido se já fez prebuild)

```bash
pnpm android:apk:release
```

APK gerado em:

`android/app/build/outputs/apk/release/app-release.apk`

Instale no celular via USB (`adb install`) ou copie o arquivo.

> O release local usa a keystore de debug — serve para testes, não para publicar na Play Store.

### Opção 2 — EAS Build (nuvem, bom para compartilhar)

```bash
pnpm android:build:preview
```

O perfil `preview` em `eas.json` gera um **APK** com o bundle JS embutido (não precisa do Metro). Na primeira execução, o EAS pode pedir para vincular o projeto Expo.

## Instalar pacotes

```bash
pnpm add <pacote>
pnpm add -D <pacote>          # devDependency
pnpm exec expo install <pacote>  # versão alinhada ao Expo SDK
```
