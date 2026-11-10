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

const { InMemoryTransactionCache } = load(
  "src/features/TransactionsList/data/cache/transaction-memory-cache.ts",
);

test("InMemoryTransactionCache stores and retrieves transactions per userId", () => {
  const cache = new InMemoryTransactionCache();

  assert.equal(cache.get("user-1"), null);

  const txsUser1 = [
    { id: "1", userId: "user-1", type: "income", amount: 100, category: "Salário", description: "D", date: "2026-05-01" },
  ];
  cache.set("user-1", txsUser1);

  const retrieved = cache.get("user-1");
  assert.equal(retrieved.length, 1);
  assert.equal(retrieved[0].id, "1");

  // Isolated per user
  assert.equal(cache.get("user-2"), null);
});

test("InMemoryTransactionCache returns defensive copies", () => {
  const cache = new InMemoryTransactionCache();
  const txs = [
    { id: "1", userId: "u", type: "income", amount: 10, category: "C", description: "D", date: "2026-05-01" },
  ];
  cache.set("u", txs);

  const copy = cache.get("u");
  copy.push({ id: "2", userId: "u", type: "expense", amount: 5, category: "C", description: "D", date: "2026-05-02" });

  assert.equal(cache.get("u").length, 1);
});

test("InMemoryTransactionCache removes user on logout and clears all", () => {
  const cache = new InMemoryTransactionCache();
  cache.set("user-1", [{ id: "1", userId: "user-1", type: "income", amount: 10, category: "C", description: "D", date: "2026-05-01" }]);
  cache.set("user-2", [{ id: "2", userId: "user-2", type: "expense", amount: 20, category: "C", description: "D", date: "2026-05-02" }]);

  cache.remove("user-1");
  assert.equal(cache.get("user-1"), null);
  assert.equal(cache.get("user-2").length, 1);

  cache.clear();
  assert.equal(cache.get("user-2"), null);
});
