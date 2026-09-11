import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { useTheme } from "@/hooks/use-theme";
import { useAppContext } from "@/contexts/app-context";
import { useAuth } from "@/features/UserProfile/contexts/auth-context";
import {
  changePassword,
  editProfile,
  verifyEmail,
} from "@/features/UserProfile/services/auth-service";
import {
  notificationsEnabled,
  setNotificationsEnabled,
} from "@/services/notifications";

type Panel = "edit" | "security" | null;
function friendlyError(error: unknown) {
  const code = (error as { code?: string })?.code;
  if (code === "auth/invalid-credential" || code === "auth/wrong-password")
    return "Senha atual incorreta. Confira e tente novamente.";
  if (code === "auth/email-already-in-use")
    return "Este e-mail já está em uso por outra conta.";
  if (code === "auth/invalid-email") return "Informe um e-mail válido.";
  if (code === "auth/weak-password")
    return "Escolha uma senha com pelo menos 6 caracteres.";
  if (code === "auth/requires-recent-login")
    return "Entre novamente na sua conta para realizar esta alteração.";
  if (code === "auth/too-many-requests")
    return "Muitas tentativas. Aguarde um pouco e tente novamente.";
  if (code === "auth/network-request-failed")
    return "Sem conexão. Confira sua internet e tente novamente.";
  return error instanceof Error
    ? error.message
    : "Não foi possível concluir. Tente novamente.";
}

export default function ProfileScreen() {
  const colors = useTheme();
  const { theme, setTheme } = useAppContext();
  const { user, signOut, refreshProfile } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [panel, setPanel] = useState<Panel>(null);
  const [logout, setLogout] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [notifications, setNotifications] = useState(false);
  const [preferencesReady, setPreferencesReady] = useState(false);

  useEffect(() => {
    let active = true;
    const sync = () => {
      if (user)
        notificationsEnabled(user.uid)
          .then((value) => {
            if (active) {
              setNotifications(value);
              setPreferencesReady(true);
            }
          })
          .catch(() => {
            if (active) setPreferencesReady(true);
          });
    };
    sync();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") sync();
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, [user?.uid, user]);

  function open(next: Panel) {
    setName(user?.displayName || "");
    setEmail(user?.email || "");
    setPassword("");
    setNextPassword("");
    setConfirmation("");
    setError("");
    setNotice("");
    setPanel(next);
  }
  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }
  const card = [
    styles.card,
    { backgroundColor: colors.backgroundElement, borderColor: colors.border },
  ];
  const input = [
    styles.input,
    {
      backgroundColor: colors.backgroundSelected,
      color: colors.text,
      borderColor: colors.border,
    },
  ];
  const messages = (
    <>
      {error ? (
        <ThemedText accessibilityRole="alert" style={{ color: colors.danger }}>
          {error}
        </ThemedText>
      ) : null}
      {notice ? (
        <ThemedText
          accessibilityLiveRegion="polite"
          style={{ color: colors.success }}
        >
          {notice}
        </ThemedText>
      ) : null}
    </>
  );
  const button = (label: string, onPress: () => void, secondary = false) => (
    <TouchableOpacity
      accessibilityRole="button"
      disabled={busy}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: secondary
            ? colors.backgroundSelected
            : colors.primary,
          opacity: busy ? 0.6 : 1,
        },
      ]}
    >
      <ThemedText
        style={{
          color: secondary ? colors.text : "#FFFFFF",
          fontWeight: "700",
          textAlign: "center",
        }}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView contentContainerStyle={styles.page}>
        <View style={{ gap: 6 }}>
          <ThemedText
            type="small"
            style={{ color: colors.primary, letterSpacing: 2 }}
          >
            SUA CONTA
          </ThemedText>
          <ThemedText type="title">Perfil e preferências</ThemedText>
          <ThemedText themeColor="textSecondary">
            Seu Mavi, do seu jeito.
          </ThemedText>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Editar perfil"
          onPress={() => open("edit")}
          style={[...card, styles.profile]}
        >
          <View
            style={[styles.avatar, { backgroundColor: colors.primary + "22" }]}
          >
            <ThemedText style={{ color: colors.primary, fontSize: 24 }}>
              {(user?.displayName || user?.email || "M")
                .charAt(0)
                .toUpperCase()}
            </ThemedText>
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
            <ThemedText style={{ fontWeight: "700" }}>
              {user?.displayName || "Complete seu perfil"}
            </ThemedText>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              numberOfLines={2}
            >
              {user?.email}
            </ThemedText>
            <ThemedText type="small" style={{ color: colors.primary }}>
              Editar dados →
            </ThemedText>
          </View>
        </TouchableOpacity>
        {!panel ? messages : null}
        <ThemedText type="smallBold" themeColor="textSecondary">
          PREFERÊNCIAS
        </ThemedText>
        <View style={card}>
          <ThemedText style={styles.label}>Aparência</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Escolha o tema do aplicativo.
          </ThemedText>
          <View style={styles.row}>
            {(["light", "dark"] as const).map((value) => (
              <TouchableOpacity
                key={value}
                accessibilityRole="radio"
                accessibilityState={{ checked: theme === value }}
                disabled={busy}
                onPress={() =>
                  run(async () => {
                    await setTheme(value);
                  })
                }
                style={[
                  styles.themeOption,
                  {
                    backgroundColor:
                      theme === value
                        ? colors.primary
                        : colors.backgroundSelected,
                    borderColor:
                      theme === value ? colors.primary : colors.border,
                  },
                ]}
              >
                <ThemedText
                  style={{ color: theme === value ? "#FFFFFF" : colors.text }}
                >
                  {value === "light" ? "☀ Claro" : "☾ Escuro"}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.label}>Notificações</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {Platform.OS === "web"
                  ? "Avisos ao salvar transações com o site aberto."
                  : "Lembrete diário às 20h para registrar seus gastos."}
              </ThemedText>
            </View>
            <Switch
              accessibilityLabel="Ativar notificações"
              value={notifications}
              disabled={busy || !preferencesReady}
              trackColor={{ true: colors.primary }}
              onValueChange={(enabled) =>
                run(async () => {
                  if (!user) return;
                  await setNotificationsEnabled(user.uid, enabled);
                  setNotifications(enabled);
                  setNotice(
                    enabled
                      ? "Notificações ativadas neste dispositivo."
                      : "Notificações desativadas.",
                  );
                })
              }
            />
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            Os avisos não incluem valores ou dados da sua conta.
          </ThemedText>
        </View>
        <ThemedText type="smallBold" themeColor="textSecondary">
          SEGURANÇA
        </ThemedText>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => open("security")}
          style={card}
        >
          <ThemedText style={styles.label}>
            Privacidade e segurança →
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Senha, verificação de e-mail e seus dados.
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          disabled={busy}
          onPress={() => {
            setError("");
            setNotice("");
            setLogout(true);
          }}
          style={[...card, { alignItems: "center" }]}
        >
          <ThemedText style={{ color: colors.danger, fontWeight: "700" }}>
            Sair da conta
          </ThemedText>
        </TouchableOpacity>
        <ThemedText
          type="small"
          themeColor="textSecondary"
          style={{ textAlign: "center" }}
        >
          MAVI FINANCE · Suas finanças com clareza
        </ThemedText>
      </ScrollView>
      <Modal
        visible={panel !== null}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!busy) setPanel(null);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={[
            styles.overlay,
            {
              paddingTop: Math.max(insets.top, 16),
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          <View
            style={[
              styles.sheet,
              { backgroundColor: colors.backgroundElement },
            ]}
          >
            <View style={styles.sheetHeader}>
              <ThemedText style={{ fontSize: 22, fontWeight: "700", flex: 1 }}>
                {panel === "edit" ? "Editar perfil" : "Privacidade e segurança"}
              </ThemedText>
              <TouchableOpacity
                accessibilityLabel="Fechar"
                accessibilityRole="button"
                disabled={busy}
                onPress={() => setPanel(null)}
                style={styles.close}
              >
                <ThemedText style={{ fontSize: 26 }}>×</ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.form}
            >
              {messages}
              {panel === "edit" ? (
                <>
                  <ThemedText>Nome</ThemedText>
                  <TextInput
                    accessibilityLabel="Nome"
                    style={input}
                    value={name}
                    onChangeText={setName}
                    maxLength={80}
                    editable={!busy}
                    autoComplete="name"
                  />
                  <ThemedText>E-mail</ThemedText>
                  <TextInput
                    accessibilityLabel="E-mail"
                    style={input}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    editable={!busy}
                  />
                  {email.trim().toLowerCase() !== user?.email?.toLowerCase() ? (
                    <>
                      <ThemedText>Senha atual</ThemedText>
                      <TextInput
                        accessibilityLabel="Senha atual"
                        style={input}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoComplete="current-password"
                        editable={!busy}
                      />
                      <ThemedText type="small" themeColor="textSecondary">
                        O novo e-mail só será aplicado após a confirmação pelo
                        link enviado a ele.
                      </ThemedText>
                    </>
                  ) : null}
                  {button("Salvar alterações", () =>
                    run(async () => {
                      const pending = await editProfile(name, email, password);
                      refreshProfile();
                      setPassword("");
                      setNotice(
                        pending
                          ? "Nome salvo. Confirme o link enviado ao novo e-mail para concluir a alteração."
                          : "Perfil atualizado.",
                      );
                    }),
                  )}
                </>
              ) : (
                <>
                  <ThemedText style={styles.label}>Seu e-mail</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {user?.email} ·{" "}
                    {user?.emailVerified
                      ? "Verificado"
                      : "Ainda não verificado"}
                  </ThemedText>
                  {!user?.emailVerified
                    ? button(
                        "Enviar e-mail de verificação",
                        () =>
                          run(async () => {
                            await verifyEmail();
                            setNotice(
                              "Link de verificação enviado ao seu e-mail.",
                            );
                          }),
                        true,
                      )
                    : null}
                  {button(
                    "Atualizar verificação",
                    () =>
                      run(async () => {
                        await user?.reload();
                        refreshProfile();
                        setNotice(
                          user?.emailVerified
                            ? "E-mail verificado."
                            : "A verificação ainda não foi concluída.",
                        );
                      }),
                    true,
                  )}
                  <ThemedText style={styles.label}>Alterar senha</ThemedText>
                  <TextInput
                    accessibilityLabel="Senha atual"
                    placeholder="Senha atual"
                    placeholderTextColor={colors.textSecondary}
                    style={input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="current-password"
                    editable={!busy}
                  />
                  <TextInput
                    accessibilityLabel="Nova senha"
                    placeholder="Nova senha (mínimo 6 caracteres)"
                    placeholderTextColor={colors.textSecondary}
                    style={input}
                    value={nextPassword}
                    onChangeText={setNextPassword}
                    secureTextEntry
                    autoComplete="new-password"
                    editable={!busy}
                  />
                  <TextInput
                    accessibilityLabel="Confirmar nova senha"
                    placeholder="Confirme a nova senha"
                    placeholderTextColor={colors.textSecondary}
                    style={input}
                    value={confirmation}
                    onChangeText={setConfirmation}
                    secureTextEntry
                    autoComplete="new-password"
                    editable={!busy}
                  />
                  {button("Atualizar senha", () =>
                    run(async () => {
                      if (!password) throw new Error("Informe a senha atual.");
                      if (nextPassword.length < 6)
                        throw new Error(
                          "A nova senha precisa ter pelo menos 6 caracteres.",
                        );
                      if (nextPassword !== confirmation)
                        throw new Error(
                          "A confirmação não corresponde à nova senha.",
                        );
                      await changePassword(password, nextPassword);
                      setPassword("");
                      setNextPassword("");
                      setConfirmation("");
                      setNotice("Senha atualizada com sucesso.");
                    }),
                  )}
                  <ThemedText style={styles.label}>
                    Como seus dados são usados
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Seu nome e e-mail são usados para identificar sua conta no
                    Firebase Authentication. As transações ficam no Firestore e
                    os recibos no Firebase Storage, associados à sua conta. As
                    preferências de tema e notificações ficam neste dispositivo.
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Sua sessão permanece conectada para facilitar o acesso. Em
                    aparelhos compartilhados, use “Sair da conta” ao terminar. A
                    saída também desativa os lembretes deste dispositivo.
                  </ThemedText>
                </>
              )}
              {busy ? <ActivityIndicator color={colors.primary} /> : null}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <ConfirmationModal
        visible={logout}
        title="Sair da conta?"
        message="Você precisará entrar novamente para acessar suas transações."
        confirmText="Sair"
        isDangerous
        isLoading={busy}
        onCancel={() => {
          if (!busy) setLogout(false);
        }}
        onConfirm={() =>
          run(async () => {
            await signOut();
            setLogout(false);
            router.replace("/login");
          }).then(() => setLogout(false))
        }
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  page: {
    padding: 20,
    paddingBottom: 32,
    gap: 16,
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
  },
  card: { borderRadius: 18, borderWidth: 1, padding: 18, gap: 10 },
  profile: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  themeOption: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    padding: 12,
    minHeight: 48,
  },
  button: {
    padding: 14,
    borderRadius: 12,
    minHeight: 48,
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  sheet: {
    width: "100%",
    maxWidth: 540,
    maxHeight: "100%",
    borderRadius: 22,
    overflow: "hidden",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 8,
  },
  close: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  form: { padding: 20, paddingTop: 0, gap: 14 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 50,
    padding: 14,
    fontSize: 16,
  },
});
