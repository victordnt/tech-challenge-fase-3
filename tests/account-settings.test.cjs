const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');

function load(file, modules, globals = {}) {
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(output, { exports, require: name => { assert.ok(name in modules, `Unexpected import: ${name}`); return modules[name]; }, ...globals }, { filename: file });
  return exports;
}
function authHarness(overrides = {}) {
  const calls = [];
  const user = { email: 'old@example.com', uid: 'test-user' };
  const api = {
    EmailAuthProvider: { credential: (email, password) => ({ email, password }) },
    updateProfile: async (_, data) => calls.push(['profile', data]),
    reauthenticateWithCredential: async (_, credential) => calls.push(['reauth', credential]),
    verifyBeforeUpdateEmail: async (_, email) => calls.push(['verify-new-email', email]),
    updatePassword: async (_, password) => calls.push(['password', password]),
    ...overrides,
  };
  return { calls, service: load('src/features/UserProfile/services/auth-service.ts', { '@/services/firebase/config': { auth: { currentUser: user } }, 'firebase/auth': api }) };
}
test('Name-only edit does not request reauthentication or email verification', async () => {
  const { calls, service } = authHarness();
  assert.equal(await service.editProfile(' Maria ', 'old@example.com', ''), false);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][1].displayName, 'Maria');
});
test('Email change requires current password and verifies before changing the address', async () => {
  const { calls, service } = authHarness();
  await assert.rejects(service.editProfile('Maria', 'new@example.com', ''), /senha atual/);
  assert.equal(calls.length, 0);
  assert.equal(await service.editProfile('Maria', 'new@example.com', 'current'), true);
  assert.deepEqual(calls.map(c => c[0]), ['reauth', 'verify-new-email', 'profile']);
});
test('Wrong credentials do not mutate profile, email or password', async () => {
  const { calls, service } = authHarness({ reauthenticateWithCredential: async () => { throw new Error('invalid-credential'); } });
  await assert.rejects(service.editProfile('Maria', 'new@example.com', 'wrong'), /invalid-credential/);
  await assert.rejects(service.changePassword('wrong', 'new-password'), /invalid-credential/);
  assert.equal(calls.length, 0);
});
test('Password update happens only after reauthentication', async () => {
  const { calls, service } = authHarness();
  await service.changePassword('current', 'next-password');
  assert.deepEqual(calls.map(c => c[0]), ['reauth', 'password']);
});
function webHarness(permission = 'granted') {
  const saved = new Map(); const notices = [];
  class Notification {
    static permission = permission;
    static async requestPermission() { return permission; }
    constructor(title, options) { notices.push({ title, ...options }); }
  }
  const service = load('src/services/notifications.web.ts', {
    '@react-native-async-storage/async-storage': { __esModule: true, default: { getItem: async k => saved.get(k), setItem: async (k, v) => saved.set(k, v) } },
  }, { Notification, isSecureContext: true });
  return { service, saved, notices };
}
test('Denied notifications never persist an enabled preference', async () => {
  const { service, saved, notices } = webHarness('denied');
  await assert.rejects(service.setNotificationsEnabled('one', true), /Permissão negada/);
  assert.equal(saved.size, 0); assert.equal(notices.length, 0);
});
test('Web notification opt-in is isolated per user and disabled on logout', async () => {
  const { service, notices } = webHarness();
  await service.setNotificationsEnabled('one', true);
  assert.equal(await service.notificationsEnabled('one'), true);
  assert.equal(await service.notificationsEnabled('two'), false);
  await service.notifyTransactionSaved('two');
  assert.equal(notices.length, 1);
  await service.notifyTransactionSaved('one');
  assert.equal(notices.length, 2);
  await service.clearAccountNotifications('one');
  assert.equal(await service.notificationsEnabled('one'), false);
  await service.notifyTransactionSaved('one');
  assert.equal(notices.length, 2);
});
test('Native opt-in schedules one daily reminder; disabling cancels it', async () => {
  const calls = [];
  const saved = new Map();
  const service = load('src/services/notifications.ts', {
    '@react-native-async-storage/async-storage': { __esModule: true, default: { getItem: async k => saved.get(k), setItem: async (k,v) => saved.set(k,v) } },
    'react-native': { Platform: { OS: 'android' } },
    'expo-notifications': {
      setNotificationHandler: () => {}, AndroidImportance: { DEFAULT: 3 }, SchedulableTriggerInputTypes: { DAILY: 'daily' },
      getPermissionsAsync: async () => ({ granted: true }), requestPermissionsAsync: async () => ({ granted: true }),
      setNotificationChannelAsync: async () => calls.push('channel'),
      cancelScheduledNotificationAsync: async id => calls.push(['cancel',id]),
      scheduleNotificationAsync: async data => calls.push(['schedule',data]),
    },
  });
  await service.setNotificationsEnabled('one', true);
  const schedule = calls.find(c => c[0] === 'schedule')[1];
  assert.equal(schedule.trigger.hour, 20); assert.equal(schedule.trigger.type, 'daily');
  assert.equal(schedule.identifier, 'mavi-reminder-one');
  assert.equal(await service.notificationsEnabled('one'), true);
  await service.clearAccountNotifications('one');
  assert.equal(calls.at(-1)[0], 'cancel');
  assert.equal(await service.notificationsEnabled('one'), false);
});
