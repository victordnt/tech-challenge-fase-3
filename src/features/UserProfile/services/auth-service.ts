import { auth } from "@/services/firebase/config";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
  updateProfile,
  verifyBeforeUpdateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendEmailVerification,
} from "firebase/auth";

export function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signOutUser() {
  return signOut(auth);
}

export function observeAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

function currentUser() {
  if (!auth.currentUser) throw new Error("Entre novamente para continuar.");
  return auth.currentUser;
}

export async function editProfile(
  name: string,
  email: string,
  password: string,
) {
  const user = currentUser();
  if (!name.trim()) throw new Error("Informe seu nome.");
  const emailChanged = email.trim().toLowerCase() !== user.email?.toLowerCase();
  if (emailChanged) {
    if (!password)
      throw new Error("Informe a senha atual para alterar o e-mail.");
    await reauthenticateWithCredential(
      user,
      EmailAuthProvider.credential(user.email!, password),
    );
    await verifyBeforeUpdateEmail(user, email.trim());
  }
  await updateProfile(user, { displayName: name.trim() });
  return emailChanged;
}

export async function changePassword(
  currentPassword: string,
  nextPassword: string,
) {
  const user = currentUser();
  await reauthenticateWithCredential(
    user,
    EmailAuthProvider.credential(user.email!, currentPassword),
  );
  await updatePassword(user, nextPassword);
}

export function verifyEmail() {
  return sendEmailVerification(currentUser());
}
