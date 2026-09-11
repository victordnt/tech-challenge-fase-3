const fs = require("node:fs");
const path = require("node:path");
const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const {
  collection,
  doc,
  getFirestore,
  Timestamp,
  writeBatch,
} = require("firebase/firestore");

function loadEnv() {
  const envPath = path.resolve(__dirname, "..", ".env");
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && process.env[match[1]] === undefined)
      process.env[match[1]] = match[2];
  }
}

loadEnv();

const amounts = [
  20.99, 40.78, 99.99, 38.4, 9.9, 120.0, 1.99, 500.31, 29.1, 66.66,
];
const categories = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Serviços & Assinaturas",
  "Outros",
];
const simulationLabel = "SIMULAÇÃO 1 ANO";
const batchSize = 450;

function parseDate(value) {
  const date = new Date(`${value}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(date.getTime())) {
    throw new Error(`Data inválida: ${value}. Use AAAA-MM-DD.`);
  }
  return date;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function buildTransactions(startDate) {
  const random = seededRandom(20260910);
  const transactions = [];
  const endDate = addDays(startDate, 365);

  for (
    let date = new Date(startDate);
    date <= endDate;
    date = addDays(date, 1)
  ) {
    const dateValue = formatDate(date);
    const dayOfMonth = date.getUTCDate();

    if (dayOfMonth === 1) {
      transactions.push({
        type: "income",
        amount: 5000,
        category: "Salário & Rendimentos",
        description: `${simulationLabel} - Entrada mensal`,
        date: dateValue,
        receipt: null,
      });
    }

    const dailyCount = 1 + Math.floor(random() * 5);
    for (let index = 0; index < dailyCount; index += 1) {
      const amount = amounts[Math.floor(random() * amounts.length)];
      const category = categories[Math.floor(random() * categories.length)];
      transactions.push({
        type: "expense",
        amount,
        category,
        description: `${simulationLabel} - ${category} ${index + 1}`,
        date: dateValue,
        receipt: null,
      });
    }
  }

  return transactions;
}

async function main() {
  const email = process.env.SIMULATION_EMAIL;
  const password = process.env.SIMULATION_PASSWORD;
  const startDate = parseDate(
    process.argv[2] || process.env.SIMULATION_START || "2025-09-10",
  );

  if (!email || !password) {
    throw new Error(
      "Defina SIMULATION_EMAIL e SIMULATION_PASSWORD antes de executar.",
    );
  }

  const app = initializeApp({
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  });
  const auth = getAuth(app);
  const db = getFirestore(app);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const transactions = buildTransactions(startDate);

  console.log(`Usuário autenticado: ${credential.user.uid}`);
  console.log(
    `Período: ${formatDate(startDate)} até ${formatDate(addDays(startDate, 365))}`,
  );
  console.log(`Transações a criar: ${transactions.length}`);

  for (let offset = 0; offset < transactions.length; offset += batchSize) {
    const batch = writeBatch(db);
    const slice = transactions.slice(offset, offset + batchSize);

    for (const transaction of slice) {
      const reference = doc(collection(db, "transactions"));
      batch.set(reference, {
        ...transaction,
        userId: credential.user.uid,
        createdAt: Timestamp.now(),
      });
    }

    await batch.commit();
    console.log(
      `Gravadas ${Math.min(offset + slice.length, transactions.length)}/${transactions.length}`,
    );
  }

  console.log("Simulação concluída.");
}

main().catch((error) => {
  console.error("Falha na simulação:", error.message || error);
  process.exitCode = 1;
});
