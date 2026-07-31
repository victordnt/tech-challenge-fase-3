# Tech Challenge Fase 3

Aplicação mobile de gerenciamento financeiro pessoal em React Native com Expo Router.

## Como iniciar

1. Instale as dependências:
```bash
npm install
```

2. Inicie o projeto com a opção desejada:

   **Navegador web (padrão):**
   ```bash
   npx expo start --web
   ```

   **Android emulator:**
   ```bash
   npx expo start --android
   ```

   **iOS simulator (macOS):**
   ```bash
   npx expo start --ios
   ```

   **Expo Go (mobile):**
   ```bash
   npx expo start
   ```
   E escaneie o QR code com o app Expo Go

## Estrutura de arquivos

```
src/
├── app/              # Rotas e telas principais
├── components/       # Componentes reutilizáveis
├── constants/        # Constantes da aplicação
├── contexts/         # Context API (app, auth, transactions)
├── hooks/            # Hooks customizados
├── services/         # Serviços (auth, finance, firebase)
├── types/            # Tipos TypeScript
└── global.css        # Estilos globais
```

