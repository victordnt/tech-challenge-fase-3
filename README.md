# Tech Challenge Fase 3

Este projeto é uma aplicação mobile em React Native com Expo Router para o Tech Challenge Fase 3, com foco em gerenciamento financeiro pessoal.

## Objetivo do projeto
O app deve permitir:
- autenticação de usuários;
- cadastro e edição de transações;
- listagem com filtros;
- dashboard com resumo financeiro;
- upload de recibos;
- integração com Firebase;
- testes automatizados.

## Tecnologias principais
- Expo Router
- React Native
- TypeScript
- Context API
- Firebase Authentication
- Firestore
- Firebase Storage
- Reanimated / Animated
- Jest + React Native Testing Library

## Estrutura inicial do projeto
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

## Como rodar localmente
1. Instale as dependências:

```bash
npm install
```

2. Inicie o projeto:

```bash
npx expo start
```

3. Escolha uma opção de execução:
- Android emulator
- iOS simulator
- Expo Go
- navegador web

## Arquitetura inicial implementada
Até o momento, a base do projeto já inclui:
- modelos de domínio para transações, usuários, recibos e resumo financeiro;
- contextos globais para app e transações;
- serviço de cálculo e filtro de transações;
- tela inicial de dashboard com estrutura preparada para evolução.

## Próximos passos sugeridos
1. Implementar autenticação com Firebase.
2. Criar telas públicas de login e cadastro.
3. Proteger rotas privadas.
4. Persistir transações no Firestore.
5. Integrar upload de recibos no Firebase Storage.
6. Adicionar testes automatizados.

## Documentação complementar
- Guia técnico: [GUIDE_TECNICO_DESENVOLVIMENTO.md](GUIDE_TECNICO_DESENVOLVIMENTO.md)
- Plano do desafio: [PLANO_TECH_CHALLENGE_FASE3.md](PLANO_TECH_CHALLENGE_FASE3.md)

## Observações importantes
- Não trocar as tecnologias base do desafio sem necessidade.
- Seguir o desenvolvimento por fases.
- Manter organização por domínio para facilitar a evolução do projeto.
