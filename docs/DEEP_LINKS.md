# Deep Links — English Quest

## Esquemas suportados

| Tipo                 | Exemplo                             |
| -------------------- | ----------------------------------- |
| Custom scheme        | `englishquest://play`               |
| Universal Link (iOS) | `https://englishquest.app/play`     |
| App Link (Android)   | `https://englishquest.app/missions` |

Configuração nativa em `app.json`: `scheme`, `ios.associatedDomains`, `android.intentFilters`.

## Rotas públicas

| Path                                                                                 | Destino no app        |
| ------------------------------------------------------------------------------------ | --------------------- |
| `/`, `/home`, `/streak`                                                              | Home                  |
| `/play`, `/missions`                                                                 | Aba Jogar             |
| `/routines`                                                                          | Jogar → Rotinas       |
| `/vault`                                                                             | Knowledge Vault       |
| `/vault/entry/:id`                                                                   | Nota do diário        |
| `/city?poiKey=&tab=`                                                                 | Cidade + POI          |
| `/pet`, `/shop`, `/contracts`, `/loot`, `/flash`, `/duels`, `/prestige`, `/metagame` | Telas correspondentes |
| `/pet-farm/*`                                                                        | Fazenda de pets       |
| `/focus`                                                                             | Modo foco             |

## Notificações

Toda notificação agendada via `scheduleLocalNotification` inclui `data.url` com deep link da categoria.

Toque na notificação → `DeepLinkService` → `expo-router`.

## Servidor (produção)

Para universal/app links funcionarem fora do custom scheme, publique:

### iOS — `https://englishquest.app/.well-known/apple-app-site-association`

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.com.englishquest.app",
        "paths": ["*"]
      }
    ]
  }
}
```

### Android — `https://englishquest.app/.well-known/assetlinks.json`

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.englishquest.app",
      "sha256_cert_fingerprints": ["YOUR_RELEASE_SHA256"]
    }
  }
]
```

Substitua `TEAMID` e o fingerprint do certificado de release antes do deploy.

## Código

- `src/constants/deep-link-paths.ts` — builders e resolução URL → rota
- `src/services/deep-link-service.ts` — listeners (Linking + Notifications)
- `src/hooks/use-deep-linking.ts` — ativa após hidratação do app
