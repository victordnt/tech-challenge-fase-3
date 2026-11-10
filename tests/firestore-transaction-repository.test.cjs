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

function firestoreHarness(overrides = {}) {
  const calls = [];
  const fakeDb = { name: "fake-firestore-db" };

  const firestoreMock = {
    addDoc: async (colRef, data) => {
      calls.push(["addDoc", colRef, data]);
      return { id: "doc-auto-id-123" };
    },
    updateDoc: async (docRef, data) => {
      calls.push(["updateDoc", docRef, data]);
    },
    deleteDoc: async (docRef) => {
      calls.push(["deleteDoc", docRef]);
    },
    collection: (dbInstance, name) => {
      calls.push(["collection", name]);
      return { db: dbInstance, collectionName: name };
    },
    doc: (dbInstance, name, id) => {
      calls.push(["doc", name, id]);
      return { db: dbInstance, collectionName: name, docId: id };
    },
    where: (field, op, val) => ({ type: "where", field, op, val }),
    orderBy: (field, direction) => ({ type: "orderBy", field, direction }),
    limit: (n) => ({ type: "limit", limit: n }),
    query: (colRef, ...clauses) => {
      calls.push(["query", colRef, clauses]);
      return { colRef, clauses };
    },
    Timestamp: {
      now: () => ({ seconds: 123456789, nanoseconds: 0 }),
    },
    onSnapshot: (q, onNext, onError) => {
      calls.push(["onSnapshot", q]);
      const fakeSnapshot = {
        forEach: (fn) => {
          fn({
            id: "tx-doc-1",
            data: () => ({
              userId: "user-abc",
              type: "expense",
              amount: 85.5,
              category: "Alimentação",
              description: "Jantar",
              date: "2026-05-10",
              receipt: null,
            }),
          });
        },
      };
      onNext(fakeSnapshot);
      return () => calls.push(["unsubscribe"]);
    },
    ...overrides,
  };

  const { FirestoreTransactionRepository } = load(
    "src/features/TransactionsList/data/repositories/firestore-transaction-repository.ts",
    {
      "firebase/firestore": firestoreMock,
      "@/services/firebase/config": { db: fakeDb },
    },
  );

  const repository = new FirestoreTransactionRepository(fakeDb);
  return { repository, calls, fakeDb };
}

test("FirestoreTransactionRepository creates transaction with userId and Timestamp", async () => {
  const { repository, calls } = firestoreHarness();

  const created = await repository.create("user-abc", {
    type: "income",
    amount: 2500,
    category: "Salário",
    description: "Mensal",
    date: "2026-05-01",
    receipt: null,
  });

  assert.equal(created.id, "doc-auto-id-123");
  assert.equal(created.userId, "user-abc");
  assert.equal(created.amount, 2500);

  const addDocCall = calls.find((c) => c[0] === "addDoc");
  assert.ok(addDocCall);
  assert.equal(addDocCall[2].userId, "user-abc");
  assert.equal(addDocCall[2].amount, 2500);
  assert.deepEqual(addDocCall[2].createdAt, { seconds: 123456789, nanoseconds: 0 });
});

test("FirestoreTransactionRepository updates transaction by id", async () => {
  const { repository, calls } = firestoreHarness();

  await repository.update("user-abc", "tx-doc-1", {
    amount: 99.9,
    description: "Jantar com amigos",
  });

  const updateDocCall = calls.find((c) => c[0] === "updateDoc");
  assert.ok(updateDocCall);
  assert.equal(updateDocCall[1].docId, "tx-doc-1");
  assert.equal(updateDocCall[2].amount, 99.9);
  assert.equal(updateDocCall[2].description, "Jantar com amigos");
  assert.ok(updateDocCall[2].updatedAt);
});

test("FirestoreTransactionRepository deletes transaction by id", async () => {
  const { repository, calls } = firestoreHarness();

  await repository.delete("user-abc", "tx-doc-1");

  const deleteDocCall = calls.find((c) => c[0] === "deleteDoc");
  assert.ok(deleteDocCall);
  assert.equal(deleteDocCall[1].docId, "tx-doc-1");
});

test("FirestoreTransactionRepository observes query by userId and limit, returning unsubscribe", () => {
  const { repository, calls } = firestoreHarness();

  let received = [];
  const unsubscribe = repository.observe("user-abc", 15, (items) => {
    received = items;
  });

  assert.equal(received.length, 1);
  assert.equal(received[0].id, "tx-doc-1");
  assert.equal(received[0].amount, 85.5);
  assert.equal(received[0].userId, "user-abc");

  // Verify query clauses
  const queryCall = calls.find((c) => c[0] === "query");
  assert.ok(queryCall);
  const clauses = queryCall[2];
  assert.ok(clauses.some((cl) => cl.type === "where" && cl.field === "userId" && cl.val === "user-abc"));
  assert.ok(clauses.some((cl) => cl.type === "orderBy" && cl.field === "date" && cl.direction === "desc"));
  assert.ok(clauses.some((cl) => cl.type === "limit" && cl.limit === 15));

  unsubscribe();
  assert.ok(calls.some((c) => c[0] === "unsubscribe"));
});

test("FirestoreTransactionRepository propagates query errors to onError", () => {
  let capturedError = null;
  const { repository } = firestoreHarness({
    onSnapshot: (_q, _onNext, onError) => {
      onError(new Error("Index missing"));
      return () => {};
    },
  });

  repository.observe(
    "user-abc",
    20,
    () => {},
    (err) => {
      capturedError = err;
    },
  );

  assert.equal(capturedError?.message, "Index missing");
});

test("TransactionsContainer creates use cases wired to repository", async () => {
  const { calls } = firestoreHarness();
  const fakeRepo = {
    create: async (userId, data) => {
      calls.push(["custom-create", userId]);
      return { id: "custom-id", userId, ...data };
    },
    update: async () => {},
    delete: async () => {},
    observe: () => () => {},
  };

  const { createTransactionsContainer } = load(
    "src/features/TransactionsList/di/transactions-container.ts",
    {
      "../data/repositories/firestore-transaction-repository": {
        FirestoreTransactionRepository: class {},
      },
    },
  );

  const container = createTransactionsContainer(fakeRepo);
  assert.ok(container.createTransaction);
  assert.ok(container.updateTransaction);
  assert.ok(container.deleteTransaction);
  assert.ok(container.observeTransactions);

  const created = await container.createTransaction.execute("user-custom", {
    type: "income",
    amount: 10,
    category: "C",
    description: "D",
    date: "2026-05-01",
  });
  assert.equal(created.id, "custom-id");
  assert.equal(calls.at(-1)[0], "custom-create");
});
