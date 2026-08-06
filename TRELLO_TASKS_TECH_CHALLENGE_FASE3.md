# Trello - Tasks do Tech Challenge Fase 3

## 1. Como usar este arquivo no Trello
1. Criar as listas sugeridas abaixo no quadro.
2. Copiar cada card deste arquivo para a lista correspondente.
3. Manter criterios de aceite no card para validar o pronto.
4. Nao alterar tecnologia base do plano para manter alinhamento com as aulas.

---

## 2. Listas sugeridas no quadro
1. Backlog
2. To Do
3. Doing
4. Review
5. Done

---

## 3. Cards por epico

## EPICO A - Planejamento e Arquitetura

### Card A1 - Mapear requisitos do enunciado
- Lista: Backlog
- Prioridade: Alta
- Estimativa: 2h
- Checklist:
1. Listar requisitos obrigatorios por funcionalidade.
2. Definir requisitos nao funcionais (seguranca, testes, desempenho).
3. Mapear dependencias entre requisitos.
- Criterio de aceite:
- Documento de requisitos pronto e revisado pela equipe.

### Card A2 - Definir arquitetura por dominio
- Lista: Backlog
- Prioridade: Alta
- Estimativa: 3h
- Checklist:
1. Definir dominios: auth, dashboard, transactions, receipts.
2. Definir estrutura de pastas e responsabilidades.
3. Definir padrao de estados: loading, erro, vazio.
- Criterio de aceite:
- Arquitetura aprovada com responsabilidades claras.

### Card A3 - Definir modelos de dados
- Lista: Backlog
- Prioridade: Alta
- Estimativa: 3h
- Checklist:
1. Modelar User, Transaction, Category, Receipt.
2. Definir campos obrigatorios e opcionais.
3. Definir validacoes de negocio.
- Criterio de aceite:
- Modelos e contratos documentados e sem ambiguidade.

---

## EPICO B - Autenticacao e Seguranca

### Card B1 - Configurar Firebase Authentication
- Lista: Backlog
- Prioridade: Alta
- Estimativa: 4h
- Dependencia: A2
- Checklist:
1. Configurar projeto Firebase no app.
2. Habilitar autenticacao por email/senha.
3. Validar conexao entre app e Firebase.
- Criterio de aceite:
- App autentica com Firebase sem mock local.

### Card B2 - Implementar AuthContext
- Lista: Backlog
- Prioridade: Alta
- Estimativa: 5h
- Dependencia: B1
- Checklist:
1. Criar funcoes signUp, signIn, signOut.
2. Implementar restauracao de sessao.
3. Expor estado autenticado globalmente via Context API.
- Criterio de aceite:
- Qualquer tela consegue consultar estado de autenticacao.

### Card B3 - Proteger rotas com Expo Router
- Lista: Backlog
- Prioridade: Alta
- Estimativa: 4h
- Dependencia: B2
- Checklist:
1. Definir area publica e area privada.
2. Redirecionar deslogado para login.
3. Bloquear acesso indevido por URL/rota direta.
- Criterio de aceite:
- Navegacao respeita estado de autenticacao em 100 por cento dos fluxos principais.

### Card B4 - Implementar biometria para reentrada
- Lista: Backlog
- Prioridade: Media
- Estimativa: 3h
- Dependencia: B2
- Checklist:
1. Integrar autenticacao biometrica.
2. Definir quando solicitar biometria.
3. Tratar fallback quando biometria nao estiver disponivel.
- Criterio de aceite:
- Reentrada local com biometria funciona em dispositivo compativel.

### Card B5 - Definir regras de seguranca Firestore
- Lista: Backlog
- Prioridade: Alta
- Estimativa: 3h
- Dependencia: B1
- Checklist:
1. Permitir acesso apenas para usuario autenticado.
2. Permitir leitura/escrita apenas do dono dos dados.
3. Testar cenarios de acesso negado.
- Criterio de aceite:
- Tentativas indevidas sao bloqueadas por regra.

---

## EPICO C - Transacoes e Dados

### Card C1 - Implementar persistencia de transacoes
- Lista: Backlog
- Prioridade: Alta
- Estimativa: 6h
- Dependencia: A3, B2, B5
- Checklist:
1. Criar operacoes de criar/ler/editar no Firestore.
2. Associar transacao ao usuario autenticado.
3. Tratar erros de rede e retorno de operacao.
- Criterio de aceite:
- Transacao criada e editada persiste corretamente no Firestore.

### Card C2 - Formulario de adicionar/editar transacao
- Lista: Backlog
- Prioridade: Alta
- Estimativa: 6h
- Dependencia: C1
- Checklist:
1. Criar formulario com campos obrigatorios.
2. Aplicar validacao de valor, categoria, tipo e data.
3. Exibir mensagens de erro e sucesso.
- Criterio de aceite:
- Formulario impede envio invalido e salva envio valido.

### Card C3 - Listagem de transacoes
- Lista: Backlog
- Prioridade: Alta
- Estimativa: 5h
- Dependencia: C1
- Checklist:
1. Exibir lista de transacoes do usuario.
2. Tratar estado vazio, loading e erro.
3. Garantir ordem consistente dos itens.
- Criterio de aceite:
- Lista representa dados reais do usuario logado.

### Card C4 - Filtros avancados de transacoes
- Lista: Backlog
- Prioridade: Alta
- Estimativa: 5h
- Dependencia: C3
- Checklist:
1. Filtrar por periodo.
2. Filtrar por categoria.
3. Filtrar por tipo (receita/despesa).
4. Combinar filtros sem quebrar consulta.
- Criterio de aceite:
- Resultado da lista respeita todos os filtros ativos.

### Card C5 - Paginacao ou infinite scroll
- Lista: Backlog
- Prioridade: Alta
- Estimativa: 4h
- Dependencia: C3
- Checklist:
1. Definir estrategia de paginação para Firestore.
2. Carregar proximos itens sob demanda.
3. Evitar duplicacao de itens ao paginar.
- Criterio de aceite:
- Lista escala sem travamento com volume maior de dados.

---

## EPICO D - Dashboard e Animacoes

### Card D1 - Calcular indicadores financeiros
- Lista: Backlog
- Prioridade: Alta
- Estimativa: 4h
- Dependencia: C1
- Checklist:
1. Calcular total receitas.
2. Calcular total despesas.
3. Calcular saldo.
4. Calcular distribuicao por categoria.
- Criterio de aceite:
- Indicadores conferem com dados das transacoes.

### Card D2 - Construir tela Dashboard
- Lista: Backlog
- Prioridade: Alta
- Estimativa: 6h
- Dependencia: D1
- Checklist:
1. Exibir cards de resumo.
2. Exibir analise visual de dados.
3. Definir estado sem dados.
- Criterio de aceite:
- Dashboard legivel, coerente e conectado aos dados reais.

### Card D3 - Aplicar animacoes com Animated/Reanimated
- Lista: Backlog
- Prioridade: Media
- Estimativa: 5h
- Dependencia: D2
- Checklist:
1. Aplicar animacao de entrada em cards/secoes.
2. Aplicar transicoes suaves entre estados.
3. Validar fluidez sem queda perceptivel de experiencia.
- Criterio de aceite:
- Animacoes agregam UX sem prejudicar usabilidade.

---

## EPICO E - Recibos e Storage

### Card E1 - Integrar upload com Firebase Storage
- Lista: Backlog
- Prioridade: Alta
- Estimativa: 5h
- Dependencia: B1
- Checklist:
1. Definir fluxo de selecao e envio de arquivo.
2. Enviar arquivo para Storage.
3. Recuperar URL de acesso.
- Criterio de aceite:
- Upload finaliza com URL valida no Firebase Storage.

### Card E2 - Vincular recibo a transacao
- Lista: Backlog
- Prioridade: Alta
- Estimativa: 3h
- Dependencia: E1, C2
- Checklist:
1. Salvar metadados do recibo na transacao.
2. Exibir status de upload no formulario.
3. Tratar erro de vinculacao.
- Criterio de aceite:
- Recibo fica associado ao registro correto da transacao.

---

## EPICO F - Testes e Qualidade

### Card F1 - Configurar Jest e RN Testing Library
- Lista: Backlog
- Prioridade: Alta
- Estimativa: 3h
- Dependencia: A2
- Checklist:
1. Configurar ambiente de testes.
2. Definir scripts e padrao de arquivos de teste.
3. Criar teste basico de smoke para validar setup.
- Criterio de aceite:
- Execucao de testes funciona localmente sem erro estrutural.

### Card F2 - Testar regras de negocio
- Lista: Backlog
- Prioridade: Alta
- Estimativa: 4h
- Dependencia: F1, C2, D1
- Checklist:
1. Testar validacao de transacao.
2. Testar calculos de resumo financeiro.
3. Cobrir cenarios invalidos e limites.
- Criterio de aceite:
- Regras centrais cobertas por testes unitarios.

### Card F3 - Testar contextos globais
- Lista: Backlog
- Prioridade: Alta
- Estimativa: 4h
- Dependencia: F1, B2, C1
- Checklist:
1. Testar AuthContext (login, logout, sessao).
2. Testar TransactionsContext (carregar, criar, editar).
3. Testar estados de loading e erro.
- Criterio de aceite:
- Contextos criticos com testes de comportamento confiaveis.

### Card F4 - Testar componentes criticos
- Lista: Backlog
- Prioridade: Media
- Estimativa: 5h
- Dependencia: F1, C2, C3
- Checklist:
1. Testar formulario de transacao.
2. Testar listagem com filtros.
3. Testar estados de erro e vazio.
- Criterio de aceite:
- Interface critica validada sob interacoes reais simuladas.

---

## EPICO G - Entrega e Apresentacao

### Card G1 - Revisao final de requisitos
- Lista: Backlog
- Prioridade: Alta
- Estimativa: 2h
- Dependencia: Todos os epicos anteriores
- Checklist:
1. Validar requisito por requisito do enunciado.
2. Marcar o que esta completo e o que precisa ajuste.
3. Corrigir lacunas finais.
- Criterio de aceite:
- Todos os requisitos obrigatorios atendidos.

### Card G2 - Atualizar README para execucao local
- Lista: Backlog
- Prioridade: Alta
- Estimativa: 2h
- Dependencia: G1
- Checklist:
1. Incluir setup do projeto.
2. Incluir setup Firebase.
3. Incluir comandos de execucao e testes.
- Criterio de aceite:
- Qualquer aluno consegue subir o projeto com o README.

### Card G3 - Roteiro do video de demonstracao
- Lista: Backlog
- Prioridade: Media
- Estimativa: 2h
- Dependencia: G1
- Checklist:
1. Definir sequencia de demonstracao em ate 5 minutos.
2. Garantir exibicao de login, CRUD, filtros, upload e Firebase.
3. Ensaiar roteiro para objetividade.
- Criterio de aceite:
- Roteiro cobre todos os pontos avaliados.

---

## 4. Labels sugeridas no Trello
1. Alta prioridade
2. Media prioridade
3. Bloqueado
4. Seguranca
5. Firebase
6. Navegacao
7. Context API
8. Animacoes
9. Testes
10. Documentacao

---

## 5. Definicao de pronto (DoD) para qualquer card
1. Requisito funcional do card concluido.
2. Erros principais tratados (loading/erro/vazio quando aplicavel).
3. Sem quebrar fluxo existente.
4. Revisado por pelo menos um colega.
5. Critério de aceite do card validado.

---

## 6. Ordem recomendada de movimentacao no quadro
1. Comecar por A1, A2 e A3.
2. Avancar para autenticacao e seguranca (B).
3. Desenvolver dados e transacoes (C).
4. Evoluir dashboard e animacoes (D).
5. Integrar upload (E).
6. Consolidar testes (F).
7. Fechar entrega (G).

Essa ordem minimiza retrabalho e mantem o projeto alinhado ao que foi ensinado nas aulas.
