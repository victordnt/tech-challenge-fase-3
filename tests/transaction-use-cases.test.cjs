const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const test = require("node:test");
const ts = require("typescript");

function load(file, modules = {}, globals = {}) {
  const output = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(
    output,
    {
      exports,
      require: (name) => {
        if (name in modules) return modules[name];
        // Handle relative module resolution for tests
        if (name.startsWith("./") || name.startsWith("../")) {
          const path = require("node:path");
          const resolved = path.resolve(path.dirname(file), name);
          const fullPath = resolved.endsWith(".ts") ? resolved : `${resolved}.ts`;
          if (fs.existsSync(fullPath)) {
            return load(fullPath, modules, globals);
          }
        }
        assert.ok(name in modules, `Unexpected import: ${name}`);
        return modules[name];
      },
      ...globals,
    },
    { filename: file },
  );
  return exports;
}

function createFakeRepository(overrides = {}) {
  const calls = [];
  let unobserved = false;

  const repo = {
    calls,
    getUnobserved: () => unobserved,
    create: async (userId, data) => {
      calls.push(["create", userId, data]);
      return { id: "tx-1", userId, ...data };
    },
    update: async (userId, id, updates) => {
      calls.push(["update", userId, id, updates]);
    },
    delete: async (userId, id) => {
      calls.push(["delete", userId, id]);
    },
    observe: (userId, pageSize, callback, onError) => {
      calls.push(["observe", userId, pageSize]);
      callback([
        {
          id: "tx-1",
          userId,
          type: "income",
          amount: 1500,
          category: "Salário",
          description: "Salário mensal",
          date: "2026-05-01",
        },
      ]);
      return () => {
        unobserved = true;
        calls.push(["unsubscribe", userId]);
      };
    },
    ...overrides,
  };

  return repo;
}

test("CreateTransactionUseCase creates transaction and validates userId", async () => {
  const { CreateTransactionUseCase } = load(
    "src/features/TransactionsList/domain/use-cases/create-transaction.ts",
  );
  const repo = createFakeRepository();
  const useCase = new CreateTransactionUseCase(repo);

  await assert.rejects(
    useCase.execute("", {
      type: "expense",
      amount: 50,
      category: "Alimentação",
      description: "Almoço",
      date: "2026-05-02",
    }),
    /Usuário não autenticado/,
  );

  const created = await useCase.execute("user-123", {
    type: "expense",
    amount: 50,
    category: "Alimentação",
    description: "Almoço",
    date: "2026-05-02",
  });

  assert.equal(created.id, "tx-1");
  assert.equal(created.userId, "user-123");
  assert.equal(created.amount, 50);
  assert.equal(repo.calls[0][0], "create");
  assert.equal(repo.calls[0][1], "user-123");
});

test("CreateTransactionUseCase propagates repository errors", async () => {
  const { CreateTransactionUseCase } = load(
    "src/features/TransactionsList/domain/use-cases/create-transaction.ts",
  );
  const repo = createFakeRepository({
    create: async () => {
      throw new Error("Erro de conexão no banco.");
    },
  });
  const useCase = new CreateTransactionUseCase(repo);

  await assert.rejects(
    useCase.execute("user-123", {
      type: "income",
      amount: 100,
      category: "Outros",
      description: "Venda",
      date: "2026-05-02",
    }),
    /Erro de conexão no banco/,
  );
});

test("UpdateTransactionUseCase validates params and delegates to repository", async () => {
  const { UpdateTransactionUseCase } = load(
    "src/features/TransactionsList/domain/use-cases/update-transaction.ts",
  );
  const repo = createFakeRepository();
  const useCase = new UpdateTransactionUseCase(repo);

  await assert.rejects(
    useCase.execute("", "tx-1", { amount: 200 }),
    /Usuário não autenticado/,
  );
  await assert.rejects(
    useCase.execute("user-123", "", { amount: 200 }),
    /ID da transação não fornecido/,
  );

  await useCase.execute("user-123", "tx-1", { amount: 200 });
  assert.equal(repo.calls[0][0], "update");
  assert.equal(repo.calls[0][1], "user-123");
  assert.equal(repo.calls[0][2], "tx-1");
  assert.deepEqual(repo.calls[0][3], { amount: 200 });
});

test("DeleteTransactionUseCase validates params and delegates to repository", async () => {
  const { DeleteTransactionUseCase } = load(
    "src/features/TransactionsList/domain/use-cases/delete-transaction.ts",
  );
  const repo = createFakeRepository();
  const useCase = new DeleteTransactionUseCase(repo);

  await assert.rejects(
    useCase.execute("", "tx-1"),
    /Usuário não autenticado/,
  );
  await assert.rejects(
    useCase.execute("user-123", ""),
    /ID da transação não fornecido/,
  );

  await useCase.execute("user-123", "tx-1");
  assert.equal(repo.calls[0][0], "delete");
  assert.equal(repo.calls[0][1], "user-123");
  assert.equal(repo.calls[0][2], "tx-1");
});

test("ObserveTransactionsUseCase observes realtime data and propagates unsubscribe", () => {
  const { ObserveTransactionsUseCase } = load(
    "src/features/TransactionsList/domain/use-cases/observe-transactions.ts",
  );
  const repo = createFakeRepository();
  const useCase = new ObserveTransactionsUseCase(repo);

  let received = [];
  const unsubscribe = useCase.execute(
    "user-123",
    20,
    (items) => {
      received = items;
    },
  );

  assert.equal(received.length, 1);
  assert.equal(received[0].amount, 1500);
  assert.equal(repo.calls[0][0], "observe");
  assert.equal(repo.calls[0][1], "user-123");
  assert.equal(repo.getUnobserved(), false);

  unsubscribe();
  assert.equal(repo.getUnobserved(), true);
  assert.equal(repo.calls.at(-1)[0], "unsubscribe");
});

test("ObserveTransactionsUseCase handles empty userId and error callbacks", () => {
  const { ObserveTransactionsUseCase } = load(
    "src/features/TransactionsList/domain/use-cases/observe-transactions.ts",
  );
  let capturedError = null;
  const repo = createFakeRepository({
    observe: (_userId, _limit, _cb, onError) => {
      onError?.(new Error("Falha no listener"));
      return () => {};
    },
  });
  const useCase = new ObserveTransactionsUseCase(repo);

  let received = null;
  const unsubEmpty = useCase.execute("", 20, (items) => {
    received = items;
  });
  assert.equal(Array.isArray(received), true);
  assert.equal(received.length, 0);
  assert.equal(typeof unsubEmpty, "function");

  useCase.execute(
    "user-123",
    20,
    () => {},
    (err) => {
      capturedError = err;
    },
  );
  assert.equal(capturedError?.message, "Falha no listener");
});

test("Domain pure functions calculate dashboard summary correctly", () => {
  const { calculateDashboardSummary } = load(
    "src/features/TransactionsList/domain/entities/transaction.ts",
  );

  const transactions = [
    { id: "1", userId: "u", type: "income", amount: 3000, category: "Salário", description: "Empresa", date: "2026-05-01" },
    { id: "2", userId: "u", type: "income", amount: 500, category: "Freelance", description: "Design", date: "2026-05-02" },
    { id: "3", userId: "u", type: "expense", amount: 1200, category: "Moradia", description: "Aluguel", date: "2026-05-03" },
    { id: "4", userId: "u", type: "expense", amount: 300, category: "Alimentação", description: "Supermercado", date: "2026-05-04" },
    { id: "5", userId: "u", type: "expense", amount: 100, category: "Alimentação", description: "Restaurante", date: "2026-05-05" },
  ];

  const summary = calculateDashboardSummary(transactions);
  assert.equal(summary.totalIncome, 3500);
  assert.equal(summary.totalExpense, 1600);
  assert.equal(summary.balance, 1900);
  assert.equal(summary.categories.length, 4);

  const foodCategory = summary.categories.find((c) => c.category === "Alimentação");
  assert.equal(foodCategory?.total, 400);
});

test("Domain pure functions filter transactions correctly", () => {
  const { filterTransactions } = load(
    "src/features/TransactionsList/domain/entities/transaction.ts",
  );

  const transactions = [
    { id: "1", userId: "u", type: "income", amount: 3000, category: "Salário", description: "Empresa A", date: "2026-05-01" },
    { id: "2", userId: "u", type: "expense", amount: 100, category: "Alimentação", description: "Mercado Central", date: "2026-05-05" },
    { id: "3", userId: "u", type: "expense", amount: 50, category: "Transporte", description: "Metrô", date: "2026-05-15" },
  ];

  assert.equal(filterTransactions(transactions, { type: "expense" }).length, 2);
  assert.equal(filterTransactions(transactions, { category: "Transporte" }).length, 1);
  assert.equal(filterTransactions(transactions, { search: "mercado" }).length, 1);
  assert.equal(filterTransactions(transactions, { startDate: "2026-05-04", endDate: "2026-05-10" }).length, 1);
});
