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
        assert.ok(name in modules, `Unexpected import: ${name}`);
        return modules[name];
      },
      ...globals,
    },
    { filename: file },
  );
  return exports;
}

const { transactionsReducer, initialTransactionsState } = load(
  "src/features/TransactionsList/contexts/transactions-reducer.ts",
);

test("transactionsReducer hydrates instantly with cache on INIT_USER", () => {
  const cached = [
    { id: "tx-cache", userId: "u1", type: "income", amount: 100, category: "C", description: "D", date: "2026-05-01" },
  ];

  const stateWithCache = transactionsReducer(initialTransactionsState, {
    type: "INIT_USER",
    userId: "u1",
    cachedTransactions: cached,
  });

  assert.equal(stateWithCache.loading, false);
  assert.equal(stateWithCache.transactions.length, 1);
  assert.equal(stateWithCache.activeUserId, "u1");

  const stateNoCache = transactionsReducer(initialTransactionsState, {
    type: "INIT_USER",
    userId: "u1",
    cachedTransactions: null,
  });

  assert.equal(stateNoCache.loading, true);
  assert.equal(stateNoCache.transactions.length, 0);
});

test("transactionsReducer ignores snapshot from stale user session", () => {
  let state = transactionsReducer(initialTransactionsState, {
    type: "INIT_USER",
    userId: "user-current",
    cachedTransactions: null,
  });

  // Stale snapshot from previous user
  state = transactionsReducer(state, {
    type: "SNAPSHOT_RECEIVED",
    userId: "user-stale",
    transactions: [{ id: "tx-old", userId: "user-stale", type: "income", amount: 999, category: "C", description: "D", date: "2026-05-01" }],
    queryLimit: 20,
  });

  assert.equal(state.transactions.length, 0);
  assert.equal(state.loading, true);

  // Authoritative snapshot from current user
  state = transactionsReducer(state, {
    type: "SNAPSHOT_RECEIVED",
    userId: "user-current",
    transactions: [{ id: "tx-new", userId: "user-current", type: "income", amount: 50, category: "C", description: "D", date: "2026-05-01" }],
    queryLimit: 20,
  });

  assert.equal(state.transactions.length, 1);
  assert.equal(state.loading, false);
});

test("transactionsReducer supports optimistic mutations and rollback without losing initial backup", () => {
  let state = transactionsReducer(initialTransactionsState, {
    type: "INIT_USER",
    userId: "u1",
    cachedTransactions: [
      { id: "1", userId: "u1", type: "income", amount: 100, category: "C", description: "Orig 1", date: "2026-05-01" },
      { id: "2", userId: "u1", type: "expense", amount: 50, category: "C", description: "Orig 2", date: "2026-05-02" },
    ],
  });

  // Optimistic update
  state = transactionsReducer(state, {
    type: "OPTIMISTIC_UPDATE",
    id: "1",
    updates: { amount: 150 },
  });
  assert.equal(state.transactions[0].amount, 150);
  assert.equal(state.backupTransactions.length, 2);
  assert.equal(state.backupTransactions[0].amount, 100);

  // Optimistic delete while backup is active
  state = transactionsReducer(state, {
    type: "OPTIMISTIC_DELETE",
    id: "2",
  });
  assert.equal(state.transactions.length, 1);
  // Backup must still hold the original state before both mutations
  assert.equal(state.backupTransactions.length, 2);
  assert.equal(state.backupTransactions[0].amount, 100);

  // Rollback on failure
  state = transactionsReducer(state, {
    type: "MUTATION_ROLLBACK",
    error: "Erro de rede no Firestore",
  });

  assert.equal(state.transactions.length, 2);
  assert.equal(state.transactions[0].amount, 100);
  assert.equal(state.transactions[1].amount, 50);
  assert.equal(state.backupTransactions, null);
  assert.equal(state.error, "Erro de rede no Firestore");
});

test("transactionsReducer cleans session completely on RESET_SESSION", () => {
  let state = transactionsReducer(initialTransactionsState, {
    type: "INIT_USER",
    userId: "u1",
    cachedTransactions: [{ id: "1", userId: "u1", type: "income", amount: 100, category: "C", description: "D", date: "2026-05-01" }],
  });

  state = transactionsReducer(state, {
    type: "SET_FILTERS",
    filters: { search: "test" },
  });

  state = transactionsReducer(state, {
    type: "RESET_SESSION",
  });

  assert.equal(state.activeUserId, null);
  assert.equal(state.transactions.length, 0);
  assert.equal(Object.keys(state.filters).length, 0);
  assert.equal(state.loading, false);
});
