# 🎯 Guia de Uso: Sistema de Entradas/Saídas

## Como Usar o App

### 1️⃣ Acessar o Dashboard
Após fazer login, você será levado ao dashboard com:
- **Resumo Visual:** Entradas | Saldo | Saídas (lado a lado)
- **Lista de Transações:** Últimas 10 transações
- **Botão + (FAB):** Canto inferior direito para adicionar nova transação

---

## 2️⃣ Criar Nova Transação

### Passo 1: Abrir Modal
- Clique no botão **+** (FAB) no canto inferior direito
- Modal abre com formulário em branco

### Passo 2: Selecionar Tipo
```
┌─────────────────────┐
│ Entrada  |  Saída   │  ← Clique para escolher
└─────────────────────┘
```
- **Entrada:** Dinheiro que recebe (salário, bônus, etc)
- **Saída:** Dinheiro que gasta (compras, contas, etc)

### Passo 3: Inserir Valor
```
┌──────────────────┐
│ Valor: R$ [____] │  ← Somente números
└──────────────────┘
```
- Use . (ponto) para casas decimais
- Exemplo: 1234.50
- **Obrigatório**

### Passo 4: Escolher Categoria
```
┌─────────────────────────────┐
│ Categoria: [Alimentação ▼]  │  ← Campo editável
└─────────────────────────────┘
┌─────────────────────────────┐
│ Alimentação                 │  ← Categorias anteriores
│ Transporte                  │     aparecem como sugestão
│ Saúde                       │
│ + Adicionar Nova...         │
└─────────────────────────────┘
```
- Digite para criar **nova** categoria
- Clique nas sugestões para usar categoria **existente**
- **Obrigatório**

### Passo 5: Adicionar Descrição
```
┌─────────────────────────────┐
│ Descrição:                  │
│ [Descrição detalhada...]    │  ← Campo multilinhas
│                             │
└─────────────────────────────┘
```
- O que é? Por quê? Detalhes importantes
- Máximo de caracteres: sem limite
- **Obrigatório**

### Passo 6: Adicionar Foto (Opcional)
```
┌──────────────────────────────────┐
│ Foto:                            │
│ ┌────────────┬────────────┐     │
│ │ 📷 Galeria │ 📸 Câmera  │     │
│ └────────────┴────────────┘     │
└──────────────────────────────────┘
```

#### Opção A: Galeria
1. Clique "📷 Galeria"
2. Escolha uma foto do celular
3. Foto aparecerá como thumbnail

#### Opção B: Câmera
1. Clique "📸 Câmera"
2. Tire uma foto
3. Foto aparecerá como thumbnail

#### Visualizar Foto em Tela Cheia
1. Clique no thumbnail da foto
2. Modal abre com foto grande
3. Clique X ou fora para fechar

#### Remover Foto
1. Clique "Remover" embaixo do thumbnail
2. Foto é deletada

### Passo 7: Salvar
```
┌──────────────┐
│ ✔ Salvar     │  ← Verde/Neon
└──────────────┘
```
- Clique "Salvar"
- Aparece loading...
- Alert "Sucesso! Transação adicionada!"
- Modal fecha
- Transação aparece na lista imediatamente

---

## 3️⃣ Editar Transação

### Como Acessar
Na lista de transações, encontre a que quer editar e clique em **✏️ Editar**

```
┌─────────────────────────────────┐
│ 📥 Alimentação                  │
│    Almoço no restaurante        │  ← Transação
│                  R$ 45.50  15/7 │
│ ┌──────────────┬──────────────┐ │
│ │ ✏️ Editar    │ 🗑️ Excluir   │ │  ← Botões
│ └──────────────┴──────────────┘ │
└─────────────────────────────────┘
```

### Editar
1. Clique em **✏️ Editar**
2. Modal abre com os dados **preenchidos**
3. Modifique o que quiser
4. Clique "Salvar"
5. Transação atualiza instantaneamente

---

## 4️⃣ Deletar Transação

### Como Acessar
Na lista de transações, encontre a que quer deletar e clique em **🗑️ Excluir**

### Confirmar Exclusão
```
┌──────────────────────────────────┐
│ Confirmar exclusão              │
│ Tem certeza que deseja excluir   │
│ a transação "Alimentação"?       │
│ ┌─────────┬───────────────────┐  │
│ │Cancelar │ Excluir [Delete]  │  │
│ └─────────┴───────────────────┘  │
└──────────────────────────────────┘
```

1. Alert pede confirmação
2. Clique "Cancelar" para desistir
3. Clique "Excluir" para confirmar (vermelho)
4. Transação é removida da lista imediatamente

---

## 5️⃣ Visualizar Resumo

### Cards de Resumo
```
┌─────────────────────────────────┐
│ 📥 Entradas  │  💰 Saldo  │  📤 Saídas │
│ R$ 5.000,00  │ R$ 2.350,00│ R$ 2.650,00│
└─────────────────────────────────┘
```

- **Entradas:** Total de tudo que recebeu
- **Saldo:** Entradas - Saídas (destaque principal)
- **Saídas:** Total de tudo que gastou

**Cores:**
- Entradas: Verde 🟢
- Saldo: Neon/Lilás ✨ (destaque principal)
- Saídas: Vermelho 🔴

---

## 6️⃣ Navegar por Transações

### Paginação
Se tiver **mais de 10 transações**, aparece navegação:

```
┌────────────────────────────────┐
│ < [1] [2] [3] [4] [5] ... >   │  ← Clique para ir à página
└────────────────────────────────┘
```

- Botão **<** volta uma página
- Clique no número para ir direto
- Botão **>** próxima página
- Página atual em **destaque**

---

## 🌙 Alternar Tema (Dark/Light)

No topo do dashboard:
```
┌─────┐
│ 🌙  │  ← Indicador de tema atual (read-only no Expo)
└─────┘
```

No iOS/Android: Use as configurações do sistema operacional para mudar entre Dark Mode e Light Mode

**Dark Mode:**
- Cores neon roxo (#A855F7)
- Fundo escuro
- Sombras mais intensas

**Light Mode:**
- Cores lilás (#C084FC)
- Fundo claro
- Sombras mais suaves

---

## 🧾 Estrutura da Transação

Cada transação armazena:

| Campo | Exemplo | Tipo |
|-------|---------|------|
| **ID** | abc123xyz | Auto-gerado |
| **Tipo** | income/expense | Entrada/Saída |
| **Valor** | 1234.50 | Número |
| **Categoria** | Alimentação | Texto |
| **Descrição** | Almoço no restaurante X | Texto |
| **Data** | 2026-07-31 | YYYY-MM-DD |
| **Foto** | base64... | Imagem (opcional) |
| **Criado em** | 2026-07-31T14:30:00Z | Timestamp |

---

## ⚙️ Configurações & Sincronização

### Sincronização Automática
- ✅ Cada transação sincroniza com **Firebase Firestore**
- ✅ Múltiplos dispositivos veem mudanças em **tempo real**
- ✅ Offline: Funciona em memória, sincroniza ao conectar

### Dados Privados
- ✅ Cada usuário vê **somente suas transações**
- ✅ Armazenadas em `users/{seu-id}/transactions/`
- ✅ Protegidas por autenticação Firebase

### Exportar/Backup
- Dados são salvos automaticamente em Firestore
- Sem necessidade de ação manual
- Recuperação automática ao fazer login

---

## 🔐 Segurança

### Autenticação
- Você precisa estar **logado** para acessar
- Clique "Sair" para fazer logout
- Próximo login mostrará suas transações novamente

### Privacidade
- Ninguém mais pode ver suas transações
- Firebase autentica e valida acessos
- Dados criptografados em trânsito (HTTPS)

---

## 🆘 Solução de Problemas

### Problema: Foto não salva
- ✅ Verifique permissão de câmera/galeria
- ✅ Tente nova foto
- ✅ Verifique conexão internet

### Problema: Categoria não aparece
- ✅ Digite o nome correto
- ✅ Cria nova categoria se não existir
- ✅ Categorias aparecem de transações anteriores

### Problema: Transação não atualiza na lista
- ✅ Aguarde sincronização (2-3 segundos)
- ✅ Verifique conexão internet
- ✅ Tente fazer logout/login

### Problema: App fecha ou travado
- ✅ Reinicie o app
- ✅ Limpe cache
- ✅ Atualize para versão mais recente

---

## 💡 Dicas de Uso

1. **Categorias:** Use nomes simples e consistentes (ex: "Alimentação", não "Comida/Restaurante")
2. **Descrição:** Seja específico (ex: "Padaria João - Pão francês", não "Compra")
3. **Fotos:** Tire fotos claras de recibos/notas fiscais
4. **Regularidade:** Registre gastos diariamente para melhor controle
5. **Revisão:** Verifique transações no fim do mês

---

## 📞 Suporte

Dúvidas? Problemas?
- Verifique este guia primeiro
- Reinicie o app
- Verifique conexão internet
- Contacte suporte do projeto

---

**Versão:** 1.0 | **Data:** 31/07/2026
**Status:** ✅ Pronto para Produção
