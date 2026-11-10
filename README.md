# Tech Challenge Fase 3

Aplicação mobile de gerenciamento financeiro pessoal em React Native, Expo Router e Firebase. Inclui autenticação, dashboard, análises, filtros, paginação e recibos no Firebase Storage.

## Pré-requisitos

- Node.js 22.13 ou superior
- npm
- Um projeto no Firebase
- Expo Go ou emulador Android/iOS para os testes mobile

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

## Como logar no sistema

A autenticação é realizada com **Firebase Authentication** (método E-mail e Senha).

1. **Abrir a tela de autenticação**:
   Ao iniciar o aplicativo, se nenhuma sessão estiver ativa, a aplicação redireciona automaticamente para a tela de login (`/login`).
2. **Entrar com conta existente**:
   - Digite o seu **E-mail** cadastrado.
   - Digite a sua **Senha** (mínimo de 6 caracteres).
   - Clique no botão **Entrar**.
   - O aplicativo validará as credenciais e direcionará você para a tela inicial do dashboard (`/(app)`).
3. **Criar uma nova conta (Primeiro acesso)**:
   - Na tela de login, clique no link **"Não tem uma conta? Cadastre-se"**.
   - Preencha o seu **E-mail**, defina uma **Senha** e confirme a senha.
   - Clique em **Cadastrar**.
   - A conta será criada no Firebase Authentication e o login será efetuado automaticamente.
4. **Persistência segura da sessão**:
   - No **navegador web**, a sessão permanece ativa via `browserLocalPersistence`.
   - No **Android e iOS**, a sessão é armazenada de forma criptografada usando **Expo SecureStore** (Keystore / Keychain). Ao fechar e reabrir o app, sua sessão continuará ativa sem precisar digitar a senha novamente.
5. **Encerrar a sessão (Logout)**:
   - Acesse a aba **Perfil** no menu inferior.
   - Role até o final da tela e clique em **Sair da conta**.
   - Confirme a ação no diálogo de confirmação. A sessão, as notificações e o cache de dados em memória serão limpos com segurança.

## Variáveis de ambiente

O app precisa da configuração do Firebase para funcionar. Para obtê-la:

1. Acesse o [Firebase Console](https://console.firebase.google.com/) e selecione o seu projeto.
2. Abra **Configurações do projeto** pelo ícone de engrenagem.
3. Na aba **Geral**, em **Seus apps**, localize ou crie um app **Web** (`</>`).
4. Em **Configuração do SDK**, copie os valores do objeto `firebaseConfig` para um arquivo `.env` na raiz (use `.env.example` como modelo):

| Variável no `.env`                         | Campo do `firebaseConfig` |
| ------------------------------------------ | ------------------------- |
| `EXPO_PUBLIC_FIREBASE_API_KEY`             | `apiKey`                  |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`         | `authDomain`              |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID`          | `projectId`               |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`      | `storageBucket`           |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId`       |
| `EXPO_PUBLIC_FIREBASE_APP_ID`              | `appId`                   |

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

## Configurar Firestore e Storage

O app salva as transações no **Cloud Firestore**:

1. No [Firebase Console](https://console.firebase.google.com/), selecione o projeto.
2. Acesse **Firestore Database** e clique em **Criar banco de dados**.
3. Escolha uma região próxima dos usuários e confirme a criação.
4. Acesse **Storage**, clique em **Começar** e use uma região compatível com o banco.
5. Em **Authentication > Método de login**, ative **E-mail/senha**.

A coleção `transactions` será criada automaticamente quando a primeira transação for salva. Os recibos ficam em `receipts/{userId}/{receiptId}/{fileName}` no Storage.

Instale a CLI do Firebase, autentique e vincule o projeto:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
```

Implante regras e índices versionados:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

Os arquivos implantados são `firestore.rules`, `firestore.indexes.json` e `storage.rules`. As regras isolam dados por usuário e limitam os anexos a imagens de até 5 MB.

## Verificações antes da entrega

```bash
npm run validate
```

Depois valide em um dispositivo físico pelo menos: cadastro, login, criação/edição/exclusão, filtros de data, paginação, câmera, galeria, visualização do recibo e isolamento entre duas contas.

## Permissões mobile

O plugin `expo-image-picker` está configurado no `app.json` com mensagens de câmera e galeria. A câmera não existe no simulador iOS; para esse fluxo, use um aparelho físico.

## Estrutura dos dados

Uma transação possui `userId`, tipo, valor, categoria, descrição, data e, opcionalmente, metadados do recibo (`id`, `storagePath`, `fileName`, `contentType`, `size`, `uploadedAt`). O documento guarda apenas metadados e o caminho do Storage (`storagePath`) — a imagem não é armazenada como Base64 no Firestore e o download é resolvido sob demanda no Firebase Storage.

## Solução de problemas

- Após alterar `.env`, dependências ou configuração nativa, execute `npx expo start -c`.
- Se a consulta solicitar um índice, implante `firestore.indexes.json`.
- Se um upload falhar, confirme se o Storage foi criado e se `storage.rules` foi implantado.
- Se houver `permission-denied`, confirme a sessão do usuário e implante as regras do repositório.

## Observações importantes

- No web, a autenticação usa a persistência do navegador (`browserLocalPersistence`). No Android e iOS, usa armazenamento seguro protegido via `expo-secure-store` (`secureAuthStorage`); a seleção ocorre em `src/services/firebase/config.ts`.
- Ao instalar dependências novas ou alterar a configuração de plataforma, reinicie o Expo limpando o cache:

  ```bash
  npx expo start -c
  ```

## Resumo das atualizações realizadas (Histórias 1 a 7)

Esta versão inclui a refatoração e modernização da arquitetura da aplicação para aderir aos princípios de **Clean Architecture**, **Repository Pattern**, **Gerenciamento de Estado Reativo** e **Desenvolvimento Seguro**, distribuídas em 7 histórias de engenharia:

1. **História 1 – Isolar o domínio financeiro e seus casos de uso**
   - Criação da camada de domínio pura (`src/features/TransactionsList/domain/`), completamente independente de frameworks (React, Expo ou Firebase).
   - Definição da entidade `Transaction`, tipos associados e do contrato `TransactionRepository` com `userId` explícito.
   - Implementação dos quatro casos de uso essenciais: `ObserveTransactionsUseCase`, `CreateTransactionUseCase`, `UpdateTransactionUseCase` e `DeleteTransactionUseCase`.
   - Migração das funções puras de cálculo (`calculateDashboardSummary`) e filtros (`filterTransactions`) para o domínio.
   - Preservação de compatibilidade através de fachadas em `types/finance.ts` e `services/finance.ts`.

2. **História 2 – Implementar o repositório Firestore e a composição de dependências**
   - Criação do `FirestoreTransactionRepository` (`data/repositories/`) implementando o contrato do domínio e utilizando a instância centralizada `db` exportada em `src/services/firebase/config.ts`.
   - Criação do container de injeção de dependências `transactions-container.ts` (`di/`), permitindo compor e substituir o repositório facilmente em testes.
   - Migração de `services/firestore.ts` para atuar como fachada delegando chamadas aos casos de uso.

3. **História 3 – Separar estado reativo e comandos da feature**
   - Criação de `transactions-reducer.ts` para transições de estado atômicas e previsíveis (carga inicial, chegada de snapshot, mutações otimistas, sucesso, rollback e limpeza de sessão).
   - Separação do contexto em dois provedores e hooks dedicados:
     - `useTransactionsState()`: consome dados, filtros, paginação, loading e erros (usado por telas que só leem dados, como análises e dashboard).
     - `useTransactionsActions()`: consome comandos de escrita como `addTransaction`, `updateTransaction` e `deleteTransaction` (usado por modais e botões de ação).
   - Manutenção de `useTransactions()` como fachada combinada de compatibilidade.

4. **História 4 – Pré-carregar e manter cache efêmero por usuário**
   - Criação do `InMemoryTransactionCache` (`data/cache/`), isolado por `userId`, hidratando a tela antes do primeiro snapshot para eliminar *flashes* de loading durante a navegação autenticada.
   - Manutenção da regra de segurança e minimização de dados: nenhum dado financeiro é salvo no `AsyncStorage`.
   - Limpeza automática do cache da conta ao realizar logout.
   - Configuração de `lazy: true` para a aba de estatísticas no tab navigator (`src/app/(app)/_layout.tsx`).

5. **História 5 – Armazenar recibos no Firebase Storage**
   - Remoção de codificação Base64 e do salvamento de imagens no Firestore.
   - O seletor `photo-picker.tsx` fornece apenas URI local, validando o tipo MIME (imagem) e limite de tamanho de 5 MB.
   - Criação do `FirebaseReceiptStorage` (`data/repositories/`) gerenciando uploads, downloads sob demanda (`getDownloadURL`) e exclusão em `receipts/{userId}/{receiptId}/{fileName}`.
   - O documento no Firestore persiste unicamente metadados estruturados (`id`, `storagePath`, `fileName`, `contentType`, `size`, `uploadedAt`).
   - Implementação de fluxos de compensação automática caso uma operação no Firestore ou Storage falhe.

6. **História 6 – Validar esquema e autorização das regras Firestore**
   - Atualização de `firestore.rules` com validação de esquema estrita (allowlist de campos, tipos, limites de tamanho e valores monetários positivos).
   - Proibição de propriedades inesperadas e bloqueio contra campos Base64/dataUri no recibo.
   - Garantia de imutabilidade do `userId` em atualizações e isolamento por `request.auth.uid`.
   - Configuração do emulador Firestore em `firebase.json` e criação da suíte de testes de regras (`tests/firestore-rules.test.cjs`).

7. **História 7 – Proteger a persistência nativa da sessão Firebase**
   - Instalação e integração do `expo-secure-store` (~57.0.3).
   - Implementação de `secure-auth-persistence.ts`, que provê ao `getReactNativePersistence` operações apoiadas no Keychain (iOS) e Keystore/EncryptedSharedPreferences (Android).
   - Suporte a segmentação (*chunking*) para tokens e credenciais maiores sem risco de rejeição nativa e sem fallback inseguro para `AsyncStorage`.
   - Preservação de `browserLocalPersistence` na web.

## Estrutura de arquivos

```
src/
├── app/                          # Rotas e navegação da aplicação (Expo Router)
│   ├── (app)/                    # Grupo de rotas autenticadas (Tabs com lazy loading)
│   ├── dashboard-screen.tsx      # Tela de Meu Patrimônio (Dashboard)
│   └── login.tsx                 # Rota pública de login/cadastro
├── components/                   # Componentes reutilizáveis (Header, Search, Temas, etc.)
├── constants/                    # Tema de cores e configurações
├── contexts/                     # Contextos globais (App)
├── features/                     # Recursos organizados por contexto de negócio:
│   ├── FinancialAnalytics/       # Análises financeiras, cards e gráficos
│   ├── TransactionsList/         # Módulo de transações (Clean Architecture)
│   │   ├── domain/               # Camada de Domínio: entidades, use-cases e contratos
│   │   ├── data/                 # Repositórios concretos Firestore, Storage e Cache
│   │   ├── di/                   # Composição e injeção de dependências (Container)
│   │   ├── contexts/             # Reducer, estado reativo e hooks segregados
│   │   ├── components/           # Componentes visuais (listagem, modal, seletor de fotos)
│   │   └── screens/              # Telas da lista de transações
│   └── UserProfile/              # Perfil do usuário, autenticação e login
├── hooks/                        # Custom hooks
├── services/                     # Configurações do Firebase, autenticação segura e notificações
├── types/                        # Tipos e fachadas de tipos TypeScript
└── global.css                    # Estilos globais
```

## Testes e validações automatizadas

A aplicação conta com suítes de testes unitários executadas pelo test runner nativo do Node.js:

```bash
# Executa todos os 50 testes automatizados
npm test

# Executa testes específicos
node --test tests/transaction-use-cases.test.cjs
node --test tests/auth-persistence.test.cjs
node --test tests/firestore-transaction-repository.test.cjs
node --test tests/transactions-reducer.test.cjs
node --test tests/transaction-memory-cache.test.cjs
node --test tests/receipt-storage.test.cjs
node --test tests/firestore-rules.test.cjs
npm run test:settings

# Validação completa de qualidade (lint + typecheck + export web)
npm run validate
```

## Perfil, tema e notificações

Na aba Perfil, é possível editar nome e e-mail, escolher tema claro ou escuro e acessar Privacidade e segurança. A mudança de e-mail exige a senha atual e só é aplicada após confirmar o link enviado ao novo endereço. A mudança de senha exige reautenticação. O botão Sair usa uma confirmação que funciona na web e no celular.

O tema é salvo neste dispositivo. No Android/iOS, as notificações são lembretes locais diários às 20h; no navegador compatível, são avisos ao salvar uma transação com o site aberto (HTTPS ou localhost). A permissão é solicitada ao ativar. Não há push remoto nem avisos web com o site fechado. A saída da conta desativa as preferências de avisos e tenta cancelar o lembrete local.

Depois de instalar dependências, reinicie o Expo. Em builds nativos próprios, gere um novo build para incluir o módulo expo-notifications. Valide permissões e recebimento em aparelho físico.

Testes isolados dos serviços de conta e notificações:

```bash
npm run test:settings
```

### Erro de índice do Firestore

O índice em firestore.indexes.json combina userId crescente com date decrescente. O arquivo local precisa ser publicado usando uma conta com acesso ao projeto:

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:indexes --project techchallengefase3-mavi
```

Alternativamente, abra o link fornecido pelo erro no Firebase Console e confirme a criação. Aguarde o índice ficar ativo e tente carregar as transações novamente. Um erro 403 de serviceusage.services.use indica que a conta da CLI não tem permissão no projeto; use uma conta autorizada ou peça o acesso ao administrador.
