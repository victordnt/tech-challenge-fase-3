const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const test = require("node:test");
const ts = require("typescript");

function load(file, modules, globals = {}) {
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
        assert.ok(name in modules, `Unexpected import: ${name}`);
        return modules[name];
      },
      console,
      ...globals,
    },
    { filename: file },
  );
  return exports;
}

function createSecureStoreHarness(platform = "android", overrides = {}) {
  const store = new Map();
  const calls = [];

  const secureStoreMock = {
    getItemAsync: async (key) => {
      calls.push(["getItem", key]);
      return store.has(key) ? store.get(key) : null;
    },
    setItemAsync: async (key, value) => {
      calls.push(["setItem", key, value.length]);
      store.set(key, value);
    },
    deleteItemAsync: async (key) => {
      calls.push(["deleteItem", key]);
      store.delete(key);
    },
    ...overrides,
  };

  const { secureAuthStorage } = load(
    "src/services/firebase/secure-auth-persistence.ts",
    {
      "expo-secure-store": secureStoreMock,
      "react-native": { Platform: { OS: platform } },
    },
  );

  return { secureAuthStorage, store, calls };
}

test("SecureAuthStorage writes, reads and deletes normal auth payload on native", async () => {
  const { secureAuthStorage, store } = createSecureStoreHarness("android");
  const authPayload = JSON.stringify({
    uid: "test-user-123",
    email: "user@example.com",
    stsTokenManager: {
      accessToken: "access-token-abc",
      refreshToken: "refresh-token-xyz",
      expirationTime: 1770000000000,
    },
  });

  await secureAuthStorage.setItem("firebase:authUser:key:[DEFAULT]", authPayload);
  assert.equal(store.has("firebase:authUser:key:[DEFAULT]"), true);
  assert.equal(store.get("firebase:authUser:key:[DEFAULT]"), authPayload);

  const restored = await secureAuthStorage.getItem("firebase:authUser:key:[DEFAULT]");
  assert.equal(restored, authPayload);

  await secureAuthStorage.removeItem("firebase:authUser:key:[DEFAULT]");
  assert.equal(store.has("firebase:authUser:key:[DEFAULT]"), false);

  const afterDelete = await secureAuthStorage.getItem("firebase:authUser:key:[DEFAULT]");
  assert.equal(afterDelete, null);
});

test("SecureAuthStorage handles large serialized payloads via chunking", async () => {
  const { secureAuthStorage, store } = createSecureStoreHarness("ios");

  // Representative large auth payload with long tokens (e.g. 4000+ characters)
  const longToken = "A".repeat(3500);
  const largeAuthPayload = JSON.stringify({
    uid: "long-token-user",
    email: "long@example.com",
    stsTokenManager: {
      accessToken: longToken,
      refreshToken: longToken,
    },
  });

  assert.ok(largeAuthPayload.length > 2000, "Payload is larger than chunk limit");

  await secureAuthStorage.setItem("firebase:authUser:large:[DEFAULT]", largeAuthPayload);

  // Chunks should exist
  assert.equal(store.has("firebase:authUser:large:[DEFAULT]_chunks"), true);
  const chunksCount = parseInt(store.get("firebase:authUser:large:[DEFAULT]_chunks"), 10);
  assert.ok(chunksCount >= 2);

  // Reading reassembles entire original payload exactly
  const reassembled = await secureAuthStorage.getItem("firebase:authUser:large:[DEFAULT]");
  assert.equal(reassembled, largeAuthPayload);

  // Removing deletes all chunks
  await secureAuthStorage.removeItem("firebase:authUser:large:[DEFAULT]");
  assert.equal(store.has("firebase:authUser:large:[DEFAULT]_chunks"), false);
  assert.equal(store.has("firebase:authUser:large:[DEFAULT]_chunk_0"), false);
  assert.equal(store.has("firebase:authUser:large:[DEFAULT]_chunk_1"), false);
});

test("SecureAuthStorage does not log secrets or fall back to AsyncStorage on failure", async () => {
  let loggedSecret = false;
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const text = args.join(" ");
    if (text.includes("secret-token-12345")) {
      loggedSecret = true;
    }
  };

  try {
    const { secureAuthStorage } = createSecureStoreHarness("android", {
      setItemAsync: async () => {
        throw new Error("Keystore unavailable");
      },
      getItemAsync: async () => {
        throw new Error("Decryption error");
      },
    });

    await assert.rejects(
      secureAuthStorage.setItem("key", "secret-token-12345"),
      /Não foi possível salvar a sessão no armazenamento seguro/,
    );
    assert.equal(loggedSecret, false);

    const result = await secureAuthStorage.getItem("key");
    assert.equal(result, null);
    assert.equal(loggedSecret, false);
  } finally {
    console.warn = originalWarn;
  }
});

test("SecureAuthStorage returns null on web without invoking native storage", async () => {
  const { secureAuthStorage, calls } = createSecureStoreHarness("web");

  const result = await secureAuthStorage.getItem("some-key");
  assert.equal(result, null);

  await secureAuthStorage.setItem("some-key", "some-value");
  await secureAuthStorage.removeItem("some-key");

  assert.equal(calls.length, 0);
});
