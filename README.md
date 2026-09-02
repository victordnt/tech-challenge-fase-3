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

   **Expo Go usando túnel:**
   ```bash
   npm run tunnel
   ```
   Use essa opção quando o celular não conseguir acessar o computador pela rede local, por exemplo, quando os dispositivos estiverem em redes Wi-Fi diferentes, houver firewall ou a rede bloquear a comunicação entre dispositivos. O Expo cria uma conexão intermediária para entregar o bundle ao celular.

   O modo túnel costuma ser mais lento que a conexão local e pode depender de uma conexão estável com a internet. Quando o celular e o computador estão na mesma rede e o QR code funciona normalmente, prefira `npx expo start`.

## Variáveis de ambiente

O app precisa da configuração do Firebase para funcionar. Para obtê-la:

1. Acesse o [Firebase Console](https://console.firebase.google.com/) e selecione o seu projeto.
2. Abra **Configurações do projeto** pelo ícone de engrenagem.
3. Na aba **Geral**, em **Seus apps**, localize ou crie um app **Web** (`</>`).
4. Em **Configuração do SDK**, copie os valores do objeto `firebaseConfig` para um arquivo `.env` na raiz:

| Variável no `.env` | Campo do `firebaseConfig` |
| --- | --- |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | `apiKey` |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | `appId` |

O arquivo deve ficar assim:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

No Firebase Authentication, ative o método de login usado pela aplicação, como **E-mail/senha**, em **Authentication > Método de login**. Depois de criar ou alterar o `.env`, reinicie o Expo com `npx expo start -c`.

Os valores acima identificam o app e não são senhas. Mesmo assim, nunca coloque no `.env` chaves privadas ou credenciais administrativas e não versione esse arquivo no Git.

## Criar o banco de dados

O app salva as transações no **Cloud Firestore**:

1. No [Firebase Console](https://console.firebase.google.com/), selecione o projeto.
2. Acesse **Firestore Database** e clique em **Criar banco de dados**.
3. Escolha uma região próxima dos usuários e confirme a criação.
4. Em **Authentication > Método de login**, ative **E-mail/senha**.

A coleção `transactions` será criada automaticamente quando a primeira transação for salva. Se o app não conseguir gravar ou ler dados, verifique também as regras do Firestore e se o usuário está logado.

No arquivo `src/app/_layout.tsx`, o trecho abaixo imprime o projeto conectado no terminal:

```ts
console.log("projectId:", auth.app.options.projectId);
```

Use esse log apenas para confirmar se o `.env` aponta para o projeto correto. Ele não cria o banco e não salva transações. Após alterar o `.env` ou as configurações do Firebase, reinicie com `npx expo start -c`.

## REGRAS FIRESTORE:
``` javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{transactionId} {
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;

      allow read: if request.auth != null
        && resource.data.userId == request.auth.uid;

      allow update: if request.auth != null
        && resource.data.userId == request.auth.uid
        && request.resource.data.userId == request.auth.uid;

      allow delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
    }
  }
```
## Observações importantes

- A autenticação do Firebase possui configurações separadas para cada plataforma. No web, o projeto usa a persistência padrão do navegador. No Android e no iOS, usa `AsyncStorage` para manter a sessão do usuário. Os arquivos `config.web.ts` e `config.native.ts` são selecionados automaticamente pelo Expo.
- A criação de IDs das transações usa UUID v4. O pacote `react-native-get-random-values` fornece `crypto.getRandomValues` no React Native, que é necessário para o `uuid` funcionar no Android e no iOS.
- Ao instalar dependências novas ou alterar a configuração de plataforma, reinicie o Expo limpando o cache:

   ```bash
   npx expo start -c
   ```

## Estrutura de arquivos

```
src/
├── app/              # Rotas e telas principais
├── components/       # Componentes reutilizáveis
├── constants/        # Constantes da aplicação
├── contexts/         # Context API (app, auth, transactions)
├── hooks/            # Hooks customizados
├── services/         # Serviços (auth, finance, firebase)
│   ├── auth/         # Operações de autenticação
│   └── firebase/     # Configuração do Firebase por plataforma
├── types/            # Tipos TypeScript
└── global.css        # Estilos globais
```

