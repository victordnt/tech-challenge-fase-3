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

## Variáveis de ambiente

O app precisa da configuração do Firebase para funcionar. Para obtê-la:

1. Acesse o [Firebase Console](https://console.firebase.google.com/) e selecione o seu projeto.
2. Abra **Configurações do projeto** pelo ícone de engrenagem.
3. Na aba **Geral**, em **Seus apps**, localize ou crie um app **Web** (`</>`).
4. Em **Configuração do SDK**, copie os valores do objeto `firebaseConfig` para um arquivo `.env` na raiz (use `.env.example` como modelo):

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

## Configurar Firestore e Storage

O app salva as transações no **Cloud Firestore**:

1. No [Firebase Console](https://console.firebase.google.com/), selecione o projeto.
2. Acesse **Firestore Database** e clique em **Criar banco de dados**.
3. Escolha uma região próxima dos usuários e confirme a criação.
4. Acesse **Storage**, clique em **Começar** e use uma região compatível com o banco.
5. Em **Authentication > Método de login**, ative **E-mail/senha**.

A coleção `transactions` será criada automaticamente quando a primeira transação for salva. Os recibos ficam em `receipts/{userId}/{receiptId}` no Storage.

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

Uma transação possui `userId`, tipo, valor, categoria, descrição, data e, opcionalmente, metadados do recibo. O documento guarda apenas a URL do download e o caminho do Storage — a imagem não é armazenada como Base64 no Firestore.

## Solução de problemas

- Após alterar `.env`, dependências ou configuração nativa, execute `npx expo start -c`.
- Se a consulta solicitar um índice, implante `firestore.indexes.json`.
- Se um upload falhar, confirme se o Storage foi criado e se `storage.rules` foi implantado.
- Se houver `permission-denied`, confirme a sessão do usuário e implante as regras do repositório.

## Observações importantes

- No web, a autenticação usa a persistência do navegador. No Android e iOS, usa `AsyncStorage`; a seleção ocorre em `src/services/firebase/config.ts`.
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
├── services/         # Configuração e serviços do Firebase
├── types/            # Tipos TypeScript
└── global.css        # Estilos globais
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
