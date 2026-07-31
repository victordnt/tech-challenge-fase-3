# Guia Técnico de Desenvolvimento - Tech Challenge Fase 3

## 1. Objetivo deste guia
Este documento tem como objetivo servir como referência técnica detalhada para o desenvolvimento do projeto. Ele consolida os passos de instalação, configuração, uso das bibliotecas e boas práticas de implementação durante todas as fases do desafio.

O foco é orientar o aluno a desenvolver o app de forma organizada, com integração real com Firebase, navegação com Expo Router, estado global via Context API, animações e testes automatizados.

---

## 2. Ambiente de desenvolvimento

### 2.1 Ferramentas obrigatórias
Antes de iniciar, certifique-se de ter instalado:
- Node.js LTS
- npm ou pnpm
- Expo CLI
- Git
- Android Studio ou Xcode para emuladores
- VS Code

### 2.2 Verificar versões
Execute os comandos abaixo no terminal:

```bash
node -v
npm -v
npx expo --version
```

Se algum comando falhar, instale ou atualize a ferramenta correspondente antes de continuar.

### 2.3 Estrutura esperada do projeto
O projeto já começa com uma estrutura baseada em Expo Router e componentes reutilizáveis. A organização recomendada é:

```text
src/
  app/
  components/
  constants/
  contexts/
  hooks/
  services/
  types/
  utils/
```

---

## 3. Instalação e configuração inicial do projeto

### 3.1 Instalar dependências do projeto
Na raiz do projeto, execute:

```bash
npm install
```

Se o projeto usar Expo com gerenciamento de dependências mais moderno, também pode ser necessário:

```bash
npx expo install
```

### 3.2 Rodar o projeto localmente
Para iniciar o app em modo de desenvolvimento:

```bash
npx expo start
```

Opcionalmente, para rodar no Android:

```bash
npx expo run:android
```

Para iOS:

```bash
npx expo run:ios
```

### 3.3 Limpeza de ambiente quando algo quebrar
Se houver inconsistência de dependências, execute:

```bash
rm -rf node_modules
npm install
```

---

## 4. Bibliotecas principais e como utilizá-las

## 4.1 Expo Router
### O que é
Expo Router é a biblioteca de navegação recomendada para apps Expo, baseada em arquivos e rotas definidas pela estrutura da pasta app.

### Como instalar
```bash
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants
```

### Como usar no projeto
- Crie telas dentro da pasta src/app.
- O nome do arquivo vira a rota.
- Exemplo:
  - src/app/index.tsx -> rota /
  - src/app/login.tsx -> rota /login
  - src/app/(tabs)/index.tsx -> grupo de rotas

### Exemplo de uso
```tsx
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <Link href="/login">Ir para login</Link>
  );
}
```

### Boas práticas
- Mantenha as telas simples e delegue lógica para hooks e contextos.
- Use layouts compartilhados para navegação comum.
- Separe rotas públicas e privadas com guardas de autenticação.

---

## 4.2 Context API
### O que é
A Context API é usada para compartilhar estado global entre componentes sem passar props manualmente.

### Como instalar
Não exige instalação adicional, pois faz parte do React.

### Estrutura recomendada
Crie contextos separados por domínio:
- AuthContext
- TransactionsContext
- UIContext

### Exemplo de criação
```tsx
import React, { createContext, useContext, useState } from 'react';

type AuthContextType = {
  user: any;
  signIn: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);

  const signIn = () => setUser({ name: 'Aluno' });
  const signOut = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### Boas práticas
- Evite colocar lógica de negócio pesada dentro do contexto.
- Use um contexto por responsabilidade.
- Mantenha o provider no topo da árvore de navegação.

---

## 4.3 Firebase Authentication
### O que é
Biblioteca para autenticação de usuários no Firebase.

### Como instalar
```bash
npx expo install firebase
```

### Configuração inicial
Crie um arquivo como:

```ts
// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### Como usar
```ts
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}
```

### Boas práticas
- Nunca exponha chaves sensíveis no código.
- Use variáveis de ambiente com prefixo EXPO_PUBLIC_.
- Sempre trate erros de autenticação com mensagens amigáveis.

---

## 4.4 Firestore
### O que é
Banco NoSQL do Firebase para armazenar documentos e coleções.

### Como instalar
O Firestore já é disponibilizado pela biblioteca firebase.

### Configuração inicial
```ts
import { getFirestore } from 'firebase/firestore';
import { app } from './firebase';

export const db = getFirestore(app);
```

### Exemplo de criação de documento
```ts
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

export async function createTransaction(data: any) {
  return addDoc(collection(db, 'transactions'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}
```

### Exemplo de leitura
```ts
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';

export async function getTransactionsByUser(userId: string) {
  const q = query(collection(db, 'transactions'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
```

### Boas práticas
- Use coleções nomeadas de forma consistente.
- Sempre associe documentos ao usuário autenticado.
- Evite consultas muito amplas sem paginação.

---

## 4.5 Firebase Storage
### O que é
Serviço do Firebase para armazenar arquivos como imagens e recibos.

### Como instalar
O Storage já vem com firebase.

### Configuração inicial
```ts
import { getStorage } from 'firebase/storage';
import { app } from './firebase';

export const storage = getStorage(app);
```

### Exemplo de upload
```ts
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';

export async function uploadReceipt(file: Blob, fileName: string) {
  const storageRef = ref(storage, `receipts/${fileName}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
```

### Boas práticas
- Gere nomes únicos para os arquivos.
- Defina limites de tamanho e tipo de arquivo.
- Sempre associe o upload à transação correta.

---

## 4.6 Reanimated e Animated
### O que é
Bibliotecas para criar animações performáticas e fluidas em React Native.

### Como instalar
```bash
npx expo install react-native-reanimated
```

Para Animated, normalmente já vem com o ambiente Expo.

### Configuração básica do Reanimated
No arquivo de entrada do projeto, normalmente app/_layout.tsx ou App.tsx, adicione:

```ts
import 'react-native-reanimated';
```

### Exemplo básico
```tsx
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function Card() {
  return (
    <Animated.View entering={FadeIn} exiting={FadeOut}>
      <Text>Card animado</Text>
    </Animated.View>
  );
}
```

### Boas práticas
- Use animações para melhorar UX, não para enfeitar demais.
- Evite animações pesadas em listas grandes.
- Prefira transições simples e suaves.

---

## 4.7 Expo Image Picker ou Image Picker compatível
### O que é
Biblioteca usada para selecionar imagens na galeria ou câmera.

### Como instalar
```bash
npx expo install expo-image-picker
```

### Exemplo de uso
```ts
import * as ImagePicker from 'expo-image-picker';

export async function pickImage() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.7,
  });

  if (!result.canceled) {
    return result.assets[0];
  }

  return null;
}
```

### Boas práticas
- Solicite permissão antes de abrir a galeria.
- Valide o tipo e tamanho do arquivo.
- Não faça upload diretamente sem confirmar o arquivo selecionado.

---

## 4.8 Expo Secure Store ou biometria local
### O que é
Bibliotecas para armazenar dados sensíveis com maior segurança.

### Como instalar
```bash
npx expo install expo-secure-store
```

### Exemplo de uso
```ts
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('token', 'valor-seguro');
const token = await SecureStore.getItemAsync('token');
```

### Boas práticas
- Use para dados sensíveis locais.
- Evite armazenar secrets em AsyncStorage quando houver alternativa mais segura.

---

## 4.9 Jest e React Native Testing Library
### O que é
Ferramentas usadas para testes unitários e de componentes.

### Como instalar
```bash
npm install --save-dev jest jest-expo @testing-library/react-native @testing-library/jest-native
```

### Configuração básica
Crie um arquivo de configuração:

```js
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};
```

### Exemplo de teste
```tsx
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

test('renderiza texto corretamente', () => {
  render(<Text>Olá</Text>);
  expect(screen.getByText('Olá')).toBeTruthy();
});
```

### Boas práticas
- Teste comportamento do componente e não detalhes internos.
- Cubra regras de negócio com testes unitários.
- Faça testes de fluxo importante, como login e cadastro, sem depender de E2E completo.

---

## 5. Fluxo de desenvolvimento recomendado

### Fase 0 - Planejamento
- Leia o enunciado com atenção.
- Defina escopo e requisitos.
- Monte checklist inicial.

### Fase 1 - Arquitetura
- Organize pastas.
- Defina tipos e interfaces.
- Estruture contextos.

### Fase 2 - Autenticação
- Configure Firebase Auth.
- Crie AuthContext.
- Proteger rotas.

### Fase 3 - Segurança
- Defina regras Firestore/Storage.
- Use biometria local se aplicável.
- Evite vazamento de dados sensíveis.

### Fase 4 - Transações
- Crie formulário.
- Implemente validações.
- Salve no Firestore.

### Fase 5 - Listagem e filtros
- Mostre transações no app.
- Adicione filtros e paginação.

### Fase 6 - Dashboard
- Calcule indicadores financeiros.
- Exiba dados com animações.

### Fase 7 - Upload de recibos
- Selecione e envie arquivos.
- Salve a URL na transação.

### Fase 8 - Testes
- Teste regras de negócio.
- Teste componentes e contextos.

### Fase 9 - Entrega
- Atualize README.
- Faça revisão final.
- Prepare apresentação.

---

## 6. Padrões de código recomendados

### 6.1 Nomear arquivos de forma consistente
Exemplos:
- auth-context.tsx
- transactions-service.ts
- transaction-form.tsx
- use-auth.ts

### 6.2 Separar responsabilidades
- telas: responsabilidade de UI
- services: integração com Firebase
- contexts: estado global
- hooks: lógica reutilizável
- utils: funções auxiliares

### 6.3 Tratar erros de forma centralizada
Use funções auxiliares para mostrar mensagens claras e evitar repetição.

### 6.4 Não misturar regras de negócio com UI
Mantenha lógica como validação de transação e cálculos em funções separadas.

---

## 7. Checklist de implementação técnica
Antes de considerar uma feature pronta, confirme:
- a funcionalidade roda localmente;
- a integração com Firebase está funcionando;
- há tratamento de error/loading/success;
- a lógica está separada por responsabilidade;
- há teste ou validação mínima da regra implementada.

---

## 8. Comandos úteis durante o desenvolvimento

### Instalar dependência
```bash
npm install nome-da-biblioteca
```

### Instalar dependência compatível com Expo
```bash
npx expo install nome-da-biblioteca
```

### Rodar o projeto
```bash
npx expo start
```

### Rodar testes
```bash
npx jest
```

### Verificar erros de tipos
```bash
npx tsc --noEmit
```

---

## 9. Erros comuns e como resolver

### 9.1 Erro de dependência incompatível
Causa: biblioteca instalada com npm em vez de expo.
Solução: use npx expo install para bibliotecas compatíveis com Expo.

### 9.2 Erro de configuração do Firebase
Causa: variáveis de ambiente ausentes ou incorretas.
Solução: revisar o arquivo de configuração e os valores do projeto Firebase.

### 9.3 Rotas não funcionando
Causa: arquivo colocado em lugar errado ou estrutura de pasta incorreta.
Solução: verificar a organização das rotas no Expo Router.

### 9.4 Animação não aparece
Causa: falta de import ou configuração da biblioteca.
Solução: verificar se a importação foi feita e se a biblioteca foi configurada corretamente.

---

## 10. Recomendação final
A melhor forma de desenvolver este projeto é seguir as fases na ordem proposta, implementando uma funcionalidade de cada vez, testando cada parte e mantendo o código organizado. O segredo é não tentar construir tudo ao mesmo tempo, mas evoluir de forma incremental e técnica.
