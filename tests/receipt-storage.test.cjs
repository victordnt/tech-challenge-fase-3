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

function createStorageHarness(overrides = {}) {
  const calls = [];
  const fakeStorage = { app: { name: "test-app" } };

  const storageMock = {
    ref: (_storage, path) => ({ fullPath: path }),
    uploadBytes: async (ref, blob, metadata) => {
      calls.push(["uploadBytes", ref.fullPath, blob.size, metadata]);
    },
    getDownloadURL: async (ref) => {
      calls.push(["getDownloadURL", ref.fullPath]);
      return `https://firebasestorage.googleapis.com/v0/b/bucket/o/${encodeURIComponent(ref.fullPath)}?alt=media&token=dummy`;
    },
    deleteObject: async (ref) => {
      calls.push(["deleteObject", ref.fullPath]);
      if (overrides.deleteError) {
        throw overrides.deleteError;
      }
    },
    ...overrides.storageMock,
  };

  const fakeFetch = async (uri) => {
    calls.push(["fetch", uri]);
    if (overrides.fetchError) throw overrides.fetchError;

    const size = overrides.blobSize ?? 1024;
    const type = overrides.blobType ?? "image/jpeg";

    return {
      blob: async () => ({
        size,
        type,
      }),
    };
  };

  const { FirebaseReceiptStorage } = load(
    "src/features/TransactionsList/data/repositories/firebase-receipt-storage.ts",
    {
      "firebase/storage": storageMock,
      "@/services/firebase/config": { storage: fakeStorage },
    },
    {
      fetch: fakeFetch,
    },
  );

  const storageService = new FirebaseReceiptStorage(fakeStorage);
  return { storageService, calls, fakeStorage };
}

test("uploadReceipt uploads image to receipts/{userId}/{receiptId}/{fileName} without base64", async () => {
  const { storageService, calls } = createStorageHarness();

  const receipt = await storageService.uploadReceipt(
    "user-100",
    "receipt-abc",
    "file:///data/user/0/cache/photo.jpg",
    { fileName: "comprovante.jpg", contentType: "image/jpeg", size: 2048 },
  );

  assert.equal(receipt.id, "receipt-abc");
  assert.equal(receipt.storagePath, "receipts/user-100/receipt-abc/comprovante.jpg");
  assert.equal(receipt.fileName, "comprovante.jpg");
  assert.equal(receipt.contentType, "image/jpeg");
  assert.equal(receipt.url, "");
  assert.equal(receipt.dataUri, undefined);

  const uploadCall = calls.find((c) => c[0] === "uploadBytes");
  assert.ok(uploadCall);
  assert.equal(uploadCall[1], "receipts/user-100/receipt-abc/comprovante.jpg");
});

test("uploadReceipt validates image type and rejects non-image files", async () => {
  const { storageService } = createStorageHarness({
    blobType: "application/pdf",
  });

  await assert.rejects(
    storageService.uploadReceipt(
      "user-100",
      "receipt-abc",
      "file:///docs/invoice.pdf",
      { fileName: "invoice.pdf", contentType: "application/pdf" },
    ),
    /O anexo precisa ser uma imagem válida/,
  );
});

test("uploadReceipt rejects files exceeding 5 MB", async () => {
  const { storageService } = createStorageHarness({
    blobSize: 6 * 1024 * 1024, // 6 MB
  });

  await assert.rejects(
    storageService.uploadReceipt(
      "user-100",
      "receipt-abc",
      "file:///photos/large.png",
      { fileName: "large.png", contentType: "image/png" },
    ),
    /A imagem é grande demais/,
  );
});

test("getReceiptUrl resolves URL on demand", async () => {
  const { storageService, calls } = createStorageHarness();

  const url = await storageService.getReceiptUrl("receipts/user-100/receipt-abc/comprovante.jpg");
  assert.ok(url.startsWith("https://firebasestorage.googleapis.com"));
  assert.ok(calls.some((c) => c[0] === "getDownloadURL"));
});

test("deleteReceipt removes object and ignores storage/object-not-found", async () => {
  const notFoundError = new Error("Object does not exist");
  notFoundError.code = "storage/object-not-found";

  const { storageService: serviceNotFound, calls: callsNotFound } = createStorageHarness({
    deleteError: notFoundError,
  });

  // Should not throw on object-not-found
  await serviceNotFound.deleteReceipt("receipts/user-100/receipt-abc/old.jpg");
  assert.ok(callsNotFound.some((c) => c[0] === "deleteObject"));

  // Real error should throw
  const permissionError = new Error("Permission denied");
  permissionError.code = "storage/unauthorized";
  const { storageService: servicePermError } = createStorageHarness({
    deleteError: permissionError,
  });

  await assert.rejects(
    servicePermError.deleteReceipt("receipts/user-100/receipt-abc/old.jpg"),
    /Permission denied/,
  );
});

test("Compensation workflow cleans up uploaded receipt when transaction creation fails", async () => {
  const { storageService, calls } = createStorageHarness();

  let uploadedReceipt = null;
  try {
    uploadedReceipt = await storageService.uploadReceipt(
      "user-1",
      "rcpt-1",
      "file:///tmp/recibo.jpg",
      { fileName: "recibo.jpg", contentType: "image/jpeg" },
    );

    // Simulate Firestore error
    throw new Error("Firestore write error");
  } catch (_err) {
    if (uploadedReceipt?.storagePath) {
      await storageService.deleteReceipt(uploadedReceipt.storagePath);
    }
  }

  const deleteCall = calls.find((c) => c[0] === "deleteObject");
  assert.ok(deleteCall, "Compensation should delete uploaded object");
  assert.equal(deleteCall[1], "receipts/user-1/rcpt-1/recibo.jpg");
});
