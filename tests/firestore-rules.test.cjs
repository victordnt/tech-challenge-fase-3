const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const rulesPath = path.resolve(__dirname, "..", "firestore.rules");
const rulesContent = fs.readFileSync(rulesPath, "utf8");

// Pure rule evaluator mimicking Firestore Rules logic in firestore.rules
function evaluateRules({ auth, resource, requestResource, operation }) {
  const isAuthenticated = auth !== null && auth !== undefined;
  const isOwner = (uid) => isAuthenticated && auth.uid === uid;

  const isValidReceipt = (receipt) => {
    if (receipt === null || receipt === undefined) return true;
    if (typeof receipt !== "object" || Array.isArray(receipt)) return false;

    const allowedReceiptKeys = [
      "id",
      "storagePath",
      "fileName",
      "contentType",
      "size",
      "uploadedAt",
    ];
    const receiptKeys = Object.keys(receipt);

    // hasOnly(['id', 'storagePath', 'fileName', 'contentType', 'size', 'uploadedAt'])
    if (!receiptKeys.every((k) => allowedReceiptKeys.includes(k))) return false;

    // hasAll(['id', 'storagePath', 'fileName', 'contentType'])
    const requiredKeys = ["id", "storagePath", "fileName", "contentType"];
    if (!requiredKeys.every((k) => receiptKeys.includes(k))) return false;

    if (typeof receipt.id !== "string" || receipt.id.length === 0) return false;
    if (
      typeof receipt.storagePath !== "string" ||
      !receipt.storagePath.startsWith(`receipts/${auth.uid}/`)
    )
      return false;
    if (typeof receipt.fileName !== "string" || receipt.fileName.length === 0)
      return false;
    if (
      typeof receipt.contentType !== "string" ||
      !receipt.contentType.startsWith("image/")
    )
      return false;
    if (
      "size" in receipt &&
      (typeof receipt.size !== "number" || receipt.size > 5 * 1024 * 1024)
    )
      return false;
    if ("uploadedAt" in receipt && typeof receipt.uploadedAt !== "string")
      return false;

    return true;
  };

  const isValidTransaction = (data) => {
    if (!data || typeof data !== "object") return false;

    const allowedKeys = [
      "userId",
      "type",
      "amount",
      "category",
      "description",
      "date",
      "receipt",
      "createdAt",
      "updatedAt",
    ];
    const keys = Object.keys(data);

    if (!keys.every((k) => allowedKeys.includes(k))) return false;

    const requiredKeys = [
      "userId",
      "type",
      "amount",
      "category",
      "description",
      "date",
    ];
    if (!requiredKeys.every((k) => keys.includes(k))) return false;

    if (data.userId !== auth.uid) return false;
    if (!["income", "expense"].includes(data.type)) return false;
    if (typeof data.amount !== "number" || data.amount <= 0) return false;
    if (
      typeof data.category !== "string" ||
      data.category.length < 1 ||
      data.category.length > 100
    )
      return false;
    if (typeof data.description !== "string" || data.description.length > 500)
      return false;
    if (
      typeof data.date !== "string" ||
      !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(data.date)
    )
      return false;
    if ("receipt" in data && !isValidReceipt(data.receipt)) return false;

    return true;
  };

  if (operation === "read" || operation === "delete") {
    return isOwner(resource?.userId);
  }

  if (operation === "create") {
    return (
      isOwner(requestResource?.userId) &&
      isValidTransaction(requestResource) &&
      requestResource?.createdAt !== undefined
    );
  }

  if (operation === "update") {
    return (
      isOwner(resource?.userId) &&
      isOwner(requestResource?.userId) &&
      isValidTransaction(requestResource)
    );
  }

  return false;
}

test("firestore.rules contains all security constraints", () => {
  assert.ok(rulesContent.includes("function isValidReceipt"));
  assert.ok(rulesContent.includes("function isValidTransaction"));
  assert.ok(rulesContent.includes("receipts/' + request.auth.uid"));
  assert.ok(rulesContent.includes("5 * 1024 * 1024"));
  assert.ok(
    rulesContent.includes("isOwner(request.resource.data.userId)") &&
      rulesContent.includes("data.userId == request.auth.uid"),
  );
});

test("Anonymous request is rejected for all operations", () => {
  assert.equal(
    evaluateRules({
      auth: null,
      resource: { userId: "user-1" },
      requestResource: null,
      operation: "read",
    }),
    false,
  );

  assert.equal(
    evaluateRules({
      auth: null,
      resource: null,
      requestResource: {
        userId: "user-1",
        type: "income",
        amount: 100,
        category: "Salário",
        description: "D",
        date: "2026-05-01",
        createdAt: {},
      },
      operation: "create",
    }),
    false,
  );
});

test("Owner can create valid transaction", () => {
  const result = evaluateRules({
    auth: { uid: "user-1" },
    resource: null,
    requestResource: {
      userId: "user-1",
      type: "income",
      amount: 1500,
      category: "Salário",
      description: "Salário mensal",
      date: "2026-05-01",
      createdAt: {},
    },
    operation: "create",
  });
  assert.equal(result, true);
});

test("Owner can create transaction with valid receipt metadata", () => {
  const result = evaluateRules({
    auth: { uid: "user-1" },
    resource: null,
    requestResource: {
      userId: "user-1",
      type: "expense",
      amount: 45.9,
      category: "Alimentação",
      description: "Almoço",
      date: "2026-05-01",
      createdAt: {},
      receipt: {
        id: "rcpt-1",
        storagePath: "receipts/user-1/rcpt-1/comprovante.jpg",
        fileName: "comprovante.jpg",
        contentType: "image/jpeg",
        size: 1024,
        uploadedAt: "2026-05-01T10:00:00Z",
      },
    },
    operation: "create",
  });
  assert.equal(result, true);
});

test("User cannot create transaction for another userId", () => {
  const result = evaluateRules({
    auth: { uid: "attacker" },
    resource: null,
    requestResource: {
      userId: "victim",
      type: "income",
      amount: 100,
      category: "Outros",
      description: "Teste",
      date: "2026-05-01",
      createdAt: {},
    },
    operation: "create",
  });
  assert.equal(result, false);
});

test("User cannot read or delete another user's transaction", () => {
  assert.equal(
    evaluateRules({
      auth: { uid: "attacker" },
      resource: { userId: "victim" },
      operation: "read",
    }),
    false,
  );
  assert.equal(
    evaluateRules({
      auth: { uid: "attacker" },
      resource: { userId: "victim" },
      operation: "delete",
    }),
    false,
  );
});

test("User cannot change userId on update", () => {
  const result = evaluateRules({
    auth: { uid: "user-1" },
    resource: { userId: "user-1" },
    requestResource: {
      userId: "user-2", // Changing owner!
      type: "income",
      amount: 100,
      category: "Salário",
      description: "D",
      date: "2026-05-01",
    },
    operation: "update",
  });
  assert.equal(result, false);
});

test("Transaction creation rejected if amount <= 0", () => {
  const zeroResult = evaluateRules({
    auth: { uid: "user-1" },
    resource: null,
    requestResource: {
      userId: "user-1",
      type: "income",
      amount: 0,
      category: "Salário",
      description: "D",
      date: "2026-05-01",
      createdAt: {},
    },
    operation: "create",
  });
  assert.equal(zeroResult, false);

  const negResult = evaluateRules({
    auth: { uid: "user-1" },
    resource: null,
    requestResource: {
      userId: "user-1",
      type: "income",
      amount: -10,
      category: "Salário",
      description: "D",
      date: "2026-05-01",
      createdAt: {},
    },
    operation: "create",
  });
  assert.equal(negResult, false);
});

test("Transaction creation rejected if extra unexpected fields are present", () => {
  const result = evaluateRules({
    auth: { uid: "user-1" },
    resource: null,
    requestResource: {
      userId: "user-1",
      type: "income",
      amount: 100,
      category: "Salário",
      description: "D",
      date: "2026-05-01",
      createdAt: {},
      maliciousField: "payload",
    },
    operation: "create",
  });
  assert.equal(result, false);
});

test("Transaction creation rejected if type is not income or expense", () => {
  const result = evaluateRules({
    auth: { uid: "user-1" },
    resource: null,
    requestResource: {
      userId: "user-1",
      type: "crypto",
      amount: 100,
      category: "Salário",
      description: "D",
      date: "2026-05-01",
      createdAt: {},
    },
    operation: "create",
  });
  assert.equal(result, false);
});

test("Transaction creation rejected if receipt contains dataUri or base64 fields", () => {
  const result = evaluateRules({
    auth: { uid: "user-1" },
    resource: null,
    requestResource: {
      userId: "user-1",
      type: "expense",
      amount: 50,
      category: "Alimentação",
      description: "D",
      date: "2026-05-01",
      createdAt: {},
      receipt: {
        id: "rcpt-1",
        storagePath: "receipts/user-1/rcpt-1/comprovante.jpg",
        fileName: "comprovante.jpg",
        contentType: "image/jpeg",
        dataUri: "data:image/jpeg;base64,12345", // Disallowed field!
      },
    },
    operation: "create",
  });
  assert.equal(result, false);
});

test("Transaction creation rejected if receipt storagePath does not match auth.uid", () => {
  const result = evaluateRules({
    auth: { uid: "user-1" },
    resource: null,
    requestResource: {
      userId: "user-1",
      type: "expense",
      amount: 50,
      category: "Alimentação",
      description: "D",
      date: "2026-05-01",
      createdAt: {},
      receipt: {
        id: "rcpt-1",
        storagePath: "receipts/user-OTHER/rcpt-1/comprovante.jpg", // Mismatched UID!
        fileName: "comprovante.jpg",
        contentType: "image/jpeg",
      },
    },
    operation: "create",
  });
  assert.equal(result, false);
});
