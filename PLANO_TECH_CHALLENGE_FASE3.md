# Plano Educativo - Tech Challenge Fase 3

## 1. Contexto do plano
Este documento orienta os alunos a construir o projeto do Tech Challenge Fase 3 em etapas, sem pular fundamentos, com foco em aprendizado guiado e entrega completa.

Este plano foi desenhado para ser seguido com as tecnologias trabalhadas nas aulas:
- Expo Router (navegacao)
- Context API (estado global)
- Animated e Reanimated (animacoes)
- Firebase Authentication, Firestore e Storage (backend e dados)
- Boas praticas de seguranca mobile e autenticacao biometrica
- Jest e React Native Testing Library (testes unitarios e integracao)

Importante:
- Nao trocar tecnologias para evitar desalinhamento com as aulas.
- Nao implementar tudo de uma vez. Executar por fases.
- Cada fase tem criterios de aceite para validar progresso.

---

## 2. Objetivo final do projeto
Construir um app de gerenciamento financeiro mobile que entregue:
1. Login e autenticacao.
2. Dashboard com analises e animacoes.
3. Listagem de transacoes com filtros e paginacao/infinite scroll.
4. Cadastro e edicao de transacao com validacao.
5. Upload de recibos para Firebase Storage.
6. Integracao segura com Firebase.
7. Testes essenciais de regras de negocio e interface.

---

## 3. Premissas obrigatorias (alinhamento com as aulas)
1. Navegacao: usar Expo Router.
2. Estado global: usar Context API.
3. Animacoes: usar Animated e/ou Reanimated.
4. Seguranca e autenticacao: usar Firebase Authentication e praticas de seguranca ensinadas.
5. Dados e consultas: usar Cloud Firestore.
6. Upload de anexos: usar Firebase Storage.
7. Testes: usar Jest com React Native Testing Library.

---

## 4. Estrategia de execucao por fases

### Fase 0 - Planejamento funcional e tecnico
Objetivo:
- Definir claramente o escopo funcional antes de codificar.

Passo a passo tecnico:
1. Ler o enunciado completo e extrair todos os requisitos obrigatorios, opcionais e nao funcionais.
2. Criar uma matriz de requisitos separando cada item por modulo: Auth, Dashboard, Transacoes, Upload, Seguranca e Testes.
3. Definir o fluxo principal do usuario em ordem operacional:
   - cadastro e login
   - entrada no app
   - visualizacao do dashboard
   - criacao e edicao de transacoes
   - aplicacao de filtros e busca
   - upload de recibo
4. Escrever historias de usuario curtas e objetivas, cada uma com comportamento esperado e criterio de aceite.
5. Identificar dependencias entre funcionalidades para evitar retrabalho, por exemplo: upload depende de cadastro de transacao; dashboard depende de persistencia de transacoes.
6. Definir o escopo minimo viavel da entrega e registrar o que sera implementado, o que sera posposto e o que nao entra no desafio.
7. Consolidar tudo em um documento ou checklist compartilhado com prioridade, responsavel e dependencia.

Criterio de aceite:
- Existe um mapa de requisitos com dono, prioridade e dependencia.

---

### Fase 1 - Arquitetura base do app
Objetivo:
- Criar estrutura de pastas e responsabilidades por dominio.

Passo a passo tecnico:
1. Organizar o projeto por dominio funcional, por exemplo: auth, transactions, dashboard, receipts, shared e ui.
2. Criar uma estrutura inicial de pastas com separacao clara entre telas, componentes, hooks, contextos, servicos, tipos e utilitarios.
3. Definir os modelos principais do dominio com tipagem forte:
   - Usuario
   - Transacao
   - Categoria
   - Resumo de dashboard
   - Recibo
4. Criar interfaces ou tipos TypeScript para cada entidade, incluindo campos obrigatorios, opcionais e formatos esperados.
5. Definir o contrato minimo de cada contexto global:
   - AuthContext para estado de autenticacao
   - TransactionsContext para dados e operacoes de transacoes
   - AppContext ou UIContext para loading global, erro e mensagem de sistema, se necessario
6. Padronizar o tratamento de estados de loading, erro, vazio e sucesso em toda a aplicacao.
7. Estabelecer um padrao para nomes de arquivos e funcoes para manter consistencia ao longo do desenvolvimento.
8. Documentar a arquitetura em um README tecnico ou em um arquivo de referencia interna para a equipe.

Criterio de aceite:
- Estrutura esta definida e toda equipe entende onde cada parte do codigo deve ficar.

---

### Fase 2 - Autenticacao e protecao de rotas
Objetivo:
- Garantir que apenas usuario autenticado acesse area privada.

Passo a passo tecnico:
1. Configurar o projeto Firebase no app e habilitar Authentication com email/senha.
2. Criar um servico de autenticacao isolado para encapsular chamadas ao Firebase Authentication.
3. Implementar AuthContext com metodos basicos:
   - signUp
   - signIn
   - signOut
   - restoreSession
4. Armazenar o estado de autenticacao globalmente e expor dados como usuario, loading, erro e status de sessao.
5. Criar telas de login e cadastro com validacao de formulario no frontend antes de chamar o backend.
6. Integrar o fluxo de login/cadastro com o AuthContext e tratar feedback visual de erro e sucesso.
7. Definir grupos de rotas no Expo Router: uma area publica para login/cadastro e uma area privada para o app principal.
8. Implementar guardas de rota para redirecionar usuarios nao autenticados para tela de login e usuarios autenticados para o fluxo principal.
9. Garantir que o redirecionamento aconteca automaticamente apos inicializacao, login e logout.

Criterio de aceite:
- Usuario deslogado nao acessa telas privadas.
- Usuario logado nao fica preso em tela publica.

---

### Fase 3 - Seguranca aplicada
Objetivo:
- Aplicar controles de seguranca alinhados ao conteudo das aulas.

Passo a passo tecnico:
1. Revisar onde dados sensiveis estao sendo armazenados, exibidos ou enviados, como tokens, credenciais e configuracoes de ambiente.
2. Extrair configuracoes sensiveis para variaveis de ambiente e garantir que nao fiquem hardcoded no codigo.
3. Definir regras de seguranca no Firestore para que cada documento seja acessado apenas pelo usuario dono do recurso.
4. Definir regras de seguranca no Storage para restringir acesso a arquivos privados do usuario autenticado.
5. Implementar uma camada local adicional com biometria, quando disponivel, para reentrada ou confirmacao sensivel.
6. Revisar fluxos criticos como logout, invalidacao de sessao, erro de autenticacao e mensagens de excecao para evitar vazamento de detalhes internos.
7. Validar cenarios de acesso negado e garantir que o app trate esses erros com feedback amigavel e seguro.
8. Documentar as praticas de seguranca adotadas para futuras manutencoes e para a avaliacao tecnica.

Criterio de aceite:
- Regras de dados impedem leitura/escrita indevida.
- Biometria funciona como camada adicional de conveniencia e seguranca local.

---

### Fase 4 - Cadastro e edicao de transacoes
Objetivo:
- Entregar CRUD de transacoes com validacoes de negocio.

Passo a passo tecnico:
1. Definir o schema minimo de uma transacao com campos obrigatorios e opcionais:
   - tipo (receita ou despesa)
   - valor
   - categoria
   - data
   - descricao
   - usuarioId
   - reciboUrl opcional
2. Criar um formulario de cadastro e edicao com inputs apropriados para cada campo, incluindo select, date picker e campo de valor.
3. Implementar validacoes no frontend antes do envio:
   - valor deve ser maior que zero
   - tipo deve ser informado
   - categoria deve ser selecionada
   - data deve estar em formato valido
   - descricao pode ser opcional, mas deve ser tratada com limite de caracteres, se aplicavel
4. Criar um servico de transacoes para encapsular operacoes de create, read, update e delete no Firestore.
5. Associar cada transacao ao usuario autenticado, normalmente por meio de um campo como userId ou do id do documento do usuario.
6. Implementar feedback visual de carregamento, sucesso e erro para cada operacao.
7. Garantir que o fluxo de edicao recarregue os dados existentes corretamente e preserve os valores antes de salvar alteracoes.
8. Adicionar tratamento para erros de rede e para conflitos de dados, se houver.

Criterio de aceite:
- Nao salva transacao invalida.
- Usuario consegue criar e editar com feedback claro de sucesso/erro.

---

### Fase 5 - Listagem com filtros e paginacao
Objetivo:
- Permitir consulta eficiente de grande volume de dados.

Passo a passo tecnico:
1. Implementar uma tela de listagem que consuma as transacoes do usuario autenticado.
2. Criar uma consulta inicial ordenada por data ou timestamp para manter a lista consistente.
3. Implementar filtros combinados por periodo, categoria e tipo, com a possibilidade de limpar filtros rapidamente.
4. Adicionar busca textual, quando o modelo permitir, para localizar transacoes por descricao ou categoria.
5. Definir uma estrategia de paginacao ou infinite scroll com Firestore para evitar carregamento excessivo de dados.
6. Implementar carregamento sob demanda e evitar duplicacao de itens ao navegar pelas paginas.
7. Tratar estados de UX para carregamento, lista vazia, erro de consulta e ausencia de resultados para filtros aplicados.
8. Garantir que a interface continue responsiva mesmo quando houver um volume maior de dados.

Criterio de aceite:
- Lista suporta crescimento sem travar UX.
- Filtros retornam resultados corretos.

---

### Fase 6 - Dashboard com analises e animacoes
Objetivo:
- Exibir saude financeira com indicadores visuais e transicoes fluidas.

Passo a passo tecnico:
1. Definir as metricas do dashboard com base nas transacoes do usuario:
   - total de receitas
   - total de despesas
   - saldo
   - distribuicao por categoria
2. Criar funcoes de calculo isoladas em utilitarios ou services para evitar duplicacao de regra de negocio.
3. Construir cards de resumo financeiro com layout claro e valores formatados corretamente.
4. Criar visualizacoes simples de analise, como barras, indicadores ou listas resumidas, utilizando componentes uteis do React Native ou bibliotecas compatíveis.
5. Aplicar animacoes com Animated ou Reanimated para entrada de cards, transicao entre estados e feedback de carregamento.
6. Validar que as animacoes nao prejudicam a performance, principalmente em dispositivos mais simples.
7. Garantir que o dashboard seja carregado com base em dados reais do usuario autenticado e nao com dados mockados.

Criterio de aceite:
- Dashboard reflete dados reais do usuario autenticado.
- Existe transicao visual suave entre estados e secoes.

---

### Fase 7 - Upload de recibos com Firebase Storage
Objetivo:
- Permitir anexar comprovante as transacoes.

Passo a passo tecnico:
1. Definir o fluxo completo de anexo: selecionar imagem ou arquivo, enviar ao Firebase Storage e salvar a URL resultante na transacao.
2. Integrar a selecao de arquivo ao formulario de transacao, preferindo uma biblioteca nativa ou compatível com Expo.
3. Criar um nome de arquivo unico para evitar sobrescrita e para facilitar a identificacao do recurso no Storage.
4. Implementar estados de upload para indicar progresso, sucesso e erro.
5. Salvar no documento da transacao o link de acesso, metadados relevantes e status do processo, quando aplicavel.
6. Garantir que o upload seja associado corretamente a transacao correspondente e que a URL seja recuperada apos o envio.
7. Tratar falhas de upload, cancelamento e limites de tamanho de arquivo de forma elegante.

Criterio de aceite:
- Recibo sobe com sucesso e fica associado ao registro correto.

---

### Fase 8 - Qualidade e testes
Objetivo:
- Garantir confiabilidade com testes alinhados a aula 06.

Passo a passo tecnico:
1. Configurar Jest e React Native Testing Library no projeto.
2. Criar testes unitarios para regras de negocio isoladas, como validacao de transacao e calculos de resumo financeiro.
3. Criar testes de contextos para verificar comportamento de AuthContext e TransactionsContext.
4. Criar testes de componentes criticos, como formulario de transacao, listagem filtrada e estados de erro/loading.
5. Criar testes de fluxo essencial para validar cenarios importantes: login, criacao de transacao e edicao de transacao.
6. Garantir que os testes sejam executados de forma automatizada e que falhas sejam investigadas com prioridade.
7. Adicionar mocks ou fixtures apenas quando forem realmente necessarios para isolar a unidade testada.

Criterio de aceite:
- Suite de testes cobre partes criticas e passa de forma consistente.

---

### Fase 9 - Preparacao da entrega final
Objetivo:
- Consolidar o projeto para avaliacao tecnica e apresentacao.

Passo a passo tecnico:
1. Revisar cada requisito do enunciado e confirmar se foi implementado de forma funcional e visivel.
2. Executar uma verificacao completa do fluxo principal do app: cadastro, login, transacoes, filtros, dashboard, upload e testes.
3. Atualizar o README com instrucoes de setup local, variaveis de ambiente, configuracao Firebase e comandos para rodar o projeto.
4. Organizar o repositorio para facilitar a leitura: remover codigo temporario, ajustar nomes e revisar estrutura de arquivos.
5. Preparar um roteiro curto de apresentacao, com foco em arquitetura, seguranca, fluxo de dados e principais entregas.
6. Gravar ou organizar o video demonstrativo com tempo maximo de 5 minutos, destacando o fluxo principal sem excesso de detalhes.
7. Rodar uma ultima checagem de conformidade para garantir que todos os criterios do desafio foram atendidos.

Criterio de aceite:
- Repositorio reproduzivel e demonstracao objetiva cobrindo todos os requisitos.

---

## 5. Checklist de conformidade do desafio
1. Autenticacao implementada e funcional.
2. Dashboard com analise financeira e animacoes.
3. Listagem com filtros e paginacao/infinite scroll.
4. Cadastro e edicao com validacao avancada.
5. Upload de recibos no Firebase Storage.
6. Integracao real com Firebase (Auth, Firestore, Storage).
7. Praticas de seguranca aplicadas.
8. Testes automatizados essenciais implementados.
9. README e video prontos para entrega.

---

## 6. Riscos comuns e como prevenir
1. Risco: comecar pela interface sem modelo de dados.
Prevencao: fechar Fase 1 e Fase 2 antes de acelerar UI final.

2. Risco: misturar estado local e global sem criterio.
Prevencao: responsabilidade clara para Context API desde inicio.

3. Risco: criar filtros sem pensar em paginacao.
Prevencao: definir consultas Firestore com estrategia de cursor antes.

4. Risco: upload sem vinculo confiavel com transacao.
Prevencao: padrao de metadado obrigatorio e fluxo transacional claro.

5. Risco: teste so no fim.
Prevencao: criar testes por fase, principalmente nos modulos criticos.

---

## 7. Sequencia recomendada para os alunos
1. Planejar e alinhar escopo (Fase 0).
2. Estruturar arquitetura e contextos (Fase 1).
3. Garantir autenticacao e seguranca (Fase 2 e 3).
4. Construir transacoes e consultas (Fase 4 e 5).
5. Construir dashboard e animacoes (Fase 6).
6. Integrar upload de recibos (Fase 7).
7. Fechar testes e qualidade (Fase 8).
8. Finalizar documentacao e apresentacao (Fase 9).

Esse fluxo reduz retrabalho e melhora aprendizagem progressiva.
