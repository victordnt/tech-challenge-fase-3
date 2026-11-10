import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SymbolView } from "expo-symbols";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface LoginModalProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
}

export function LoginModal({ onSignIn, onSignUp }: LoginModalProps) {
  const colorScheme = (useColorScheme() || "light") as "light" | "dark";
  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme];

  const primaryPurple = theme.primary;
  const lightPurple = isDark ? "#D2BBFF" : "#6D28D9";
  const neonGlow = theme.neonGlow;

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Shared values para animações contínuas de Ambient Glow
  const glowScale1 = useSharedValue(1);
  const glowScale2 = useSharedValue(1);
  const logoFloat = useSharedValue(0);

  useEffect(() => {
    glowScale1.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );

    glowScale2.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.9, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );

    logoFloat.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [glowScale1, glowScale2, logoFloat]);

  const animatedGlow1Style = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale1.value }],
  }));

  const animatedGlow2Style = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale2.value }],
  }));

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: logoFloat.value }],
  }));

  const validateEmail = (emailStr: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  const handleAuth = async () => {
    setError("");

    if (!email.trim()) {
      setError("Por favor, insira seu e-mail.");
      return;
    }

    if (!validateEmail(email.trim())) {
      setError("Insira um e-mail válido.");
      return;
    }

    if (!password.trim()) {
      setError("Por favor, insira sua senha.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);
      if (isSignUp) {
        await onSignUp(email.trim(), password);
      } else {
        await onSignIn(email.trim(), password);
      }
    } catch (err: any) {
      let errorMessage = "Erro ao autenticar. Tente novamente.";

      if (
        err?.code === "auth/user-not-found" ||
        err?.code === "auth/invalid-credential"
      ) {
        errorMessage = "E-mail ou senha incorretos.";
      } else if (err?.code === "auth/wrong-password") {
        errorMessage = "Senha incorreta.";
      } else if (err?.code === "auth/email-already-in-use") {
        errorMessage = "Este e-mail já está cadastrado.";
      } else if (err?.code === "auth/weak-password") {
        errorMessage = "Senha muito fraca. Escolha uma senha mais segura.";
      } else if (err?.code === "auth/invalid-email") {
        errorMessage = "Formato de e-mail inválido.";
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = (signUpMode: boolean) => {
    setIsSignUp(signUpMode);
    setError("");
  };

  return (
    <View style={styles.container}>
      {/* Background Animated Purple Ambient Glow Orbs */}
      <Animated.View
        style={[
          styles.glowOrb,
          styles.glowTopLeft,
          {
            backgroundColor: isDark ? "#7C3AED" : "#DDD6FE",
            opacity: isDark ? 0.32 : 0.55,
          },
          animatedGlow1Style,
        ]}
      />
      <Animated.View
        style={[
          styles.glowOrb,
          styles.glowBottomRight,
          {
            backgroundColor: isDark ? "#EC4899" : "#F3E8FF",
            opacity: isDark ? 0.24 : 0.6,
          },
          animatedGlow2Style,
        ]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Brand com Animação Flutuante */}
          <Animated.View
            entering={FadeInDown.duration(600).springify()}
            style={[styles.headerContainer, animatedLogoStyle]}
          >
            <View
              style={[
                styles.logoBadge,
                {
                  shadowColor: primaryPurple,
                  backgroundColor: isDark ? "#171424" : "#F5F3FF",
                  borderColor: isDark ? primaryPurple : "#DDD6FE",
                },
              ]}
            >
              <SymbolView
                name={{
                  ios: "creditcard.and.123",
                  android: "account_balance_wallet",
                  web: "account_balance_wallet",
                }}
                size={28}
                tintColor={primaryPurple}
              />
            </View>
            <Text style={[styles.brandTitle, { color: theme.text }]}>MAVI</Text>
            <Text style={[styles.brandSubtitle, { color: theme.textSecondary }]}>
              Controle de entradas e saídas
            </Text>
          </Animated.View>

          {/* Segmented Mode Switcher (Entrar / Cadastrar) */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            style={[
              styles.segmentedContainer,
              {
                backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#F1EDFA",
                borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E4DCF5",
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => handleToggleMode(false)}
              activeOpacity={0.8}
              style={[
                styles.segmentButton,
                !isSignUp && [
                  styles.activeSegment,
                  {
                    backgroundColor: primaryPurple,
                    shadowColor: primaryPurple,
                  },
                ],
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: !isSignUp ? "#FFFFFF" : theme.textSecondary },
                ]}
              >
                Entrar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleToggleMode(true)}
              activeOpacity={0.8}
              style={[
                styles.segmentButton,
                isSignUp && [
                  styles.activeSegment,
                  {
                    backgroundColor: primaryPurple,
                    shadowColor: primaryPurple,
                  },
                ],
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: isSignUp ? "#FFFFFF" : theme.textSecondary },
                ]}
              >
                Cadastrar
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Main Glassmorphism Card */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(700).springify()}
            style={[
              styles.card,
              {
                backgroundColor: isDark
                  ? "rgba(23, 20, 36, 0.85)"
                  : "rgba(255, 255, 255, 0.96)",
                borderColor: isDark
                  ? "rgba(168, 85, 247, 0.28)"
                  : "#E9E3F5",
                shadowColor: isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(124, 58, 237, 0.12)",
              },
            ]}
          >
            {/* Mensagem de Erro com Animação */}
            {error ? (
              <Animated.View
                entering={FadeInDown.duration(300)}
                style={[
                  styles.errorBox,
                  {
                    backgroundColor: theme.danger + "18",
                    borderLeftColor: theme.danger,
                  },
                ]}
              >
                <SymbolView
                  name={{
                    ios: "exclamationmark.circle.fill",
                    android: "error",
                    web: "error",
                  }}
                  size={18}
                  tintColor={theme.danger}
                />
                <Text style={[styles.errorText, { color: theme.danger }]}>
                  {error}
                </Text>
              </Animated.View>
            ) : null}

            {/* Campo E-mail */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: lightPurple }]}>
                E-mail
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDark ? "#101415" : "#FAF9FD",
                    borderColor:
                      focusedInput === "email"
                        ? primaryPurple
                        : isDark
                          ? "rgba(255, 255, 255, 0.12)"
                          : "#E4DCF5",
                    shadowColor:
                      focusedInput === "email" ? primaryPurple : "transparent",
                    shadowOpacity: focusedInput === "email" ? 0.35 : 0,
                    ...Platform.select({
                      web: {
                        boxShadow:
                          focusedInput === "email"
                            ? `0 0 0 3px ${neonGlow}`
                            : "none",
                      } as any,
                    }),
                  },
                ]}
              >
                <View style={styles.inputIcon}>
                  <SymbolView
                    name={{ ios: "envelope.fill", android: "mail", web: "mail" }}
                    size={18}
                    tintColor={
                      focusedInput === "email" ? primaryPurple : theme.textSecondary
                    }
                  />
                </View>
                <TextInput
                  placeholder="seu@email.com"
                  placeholderTextColor={theme.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  underlineColorAndroid="transparent"
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => setFocusedInput(null)}
                  style={[styles.textInput, { color: theme.text }]}
                />
              </View>
            </View>

            {/* Campo Senha */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: lightPurple }]}>
                Senha
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDark ? "#101415" : "#FAF9FD",
                    borderColor:
                      focusedInput === "password"
                        ? primaryPurple
                        : isDark
                          ? "rgba(255, 255, 255, 0.12)"
                          : "#E4DCF5",
                    shadowColor:
                      focusedInput === "password" ? primaryPurple : "transparent",
                    shadowOpacity: focusedInput === "password" ? 0.35 : 0,
                    ...Platform.select({
                      web: {
                        boxShadow:
                          focusedInput === "password"
                            ? `0 0 0 3px ${neonGlow}`
                            : "none",
                      } as any,
                    }),
                  },
                ]}
              >
                <View style={styles.inputIcon}>
                  <SymbolView
                    name={{ ios: "lock.fill", android: "lock", web: "lock" }}
                    size={18}
                    tintColor={
                      focusedInput === "password" ? primaryPurple : theme.textSecondary
                    }
                  />
                </View>
                <TextInput
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={theme.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  underlineColorAndroid="transparent"
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput(null)}
                  style={[styles.textInput, { color: theme.text }]}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                  accessibilityLabel={showPassword ? "Ocultar senha" : "Exibir senha"}
                >
                  <SymbolView
                    name={{
                      ios: showPassword ? "eye.slash.fill" : "eye.fill",
                      android: showPassword ? "visibility_off" : "visibility",
                      web: showPassword ? "visibility_off" : "visibility",
                    }}
                    size={18}
                    tintColor={theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Campo Confirmar Senha (apenas no modo Cadastro) */}
            {isSignUp ? (
              <Animated.View
                entering={FadeInDown.duration(350)}
                style={styles.inputGroup}
              >
                <Text style={[styles.inputLabel, { color: lightPurple }]}>
                  Confirmar Senha
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: isDark ? "#101415" : "#FAF9FD",
                      borderColor:
                        focusedInput === "confirmPassword"
                          ? primaryPurple
                          : isDark
                            ? "rgba(255, 255, 255, 0.12)"
                            : "#E4DCF5",
                      shadowColor:
                        focusedInput === "confirmPassword"
                          ? primaryPurple
                          : "transparent",
                      shadowOpacity:
                        focusedInput === "confirmPassword" ? 0.35 : 0,
                      ...Platform.select({
                        web: {
                          boxShadow:
                            focusedInput === "confirmPassword"
                              ? `0 0 0 3px ${neonGlow}`
                              : "none",
                        } as any,
                      }),
                    },
                  ]}
                >
                  <View style={styles.inputIcon}>
                    <SymbolView
                      name={{
                        ios: "checkmark.shield.fill",
                        android: "verified_user",
                        web: "verified_user",
                      }}
                      size={18}
                      tintColor={
                        focusedInput === "confirmPassword"
                          ? primaryPurple
                          : theme.textSecondary
                      }
                    />
                  </View>
                  <TextInput
                    placeholder="Repita a senha"
                    placeholderTextColor={theme.textSecondary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    editable={!loading}
                    underlineColorAndroid="transparent"
                    onFocus={() => setFocusedInput("confirmPassword")}
                    onBlur={() => setFocusedInput(null)}
                    style={[styles.textInput, { color: theme.text }]}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                    activeOpacity={0.7}
                    accessibilityLabel={
                      showConfirmPassword ? "Ocultar senha" : "Exibir senha"
                    }
                  >
                    <SymbolView
                      name={{
                        ios: showConfirmPassword ? "eye.slash.fill" : "eye.fill",
                        android: showConfirmPassword ? "visibility_off" : "visibility",
                        web: showConfirmPassword ? "visibility_off" : "visibility",
                      }}
                      size={18}
                      tintColor={theme.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ) : null}

            {/* Botão de Submissão Roxo Neon */}
            <TouchableOpacity
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.85}
              style={[
                styles.submitButton,
                {
                  backgroundColor: primaryPurple,
                  shadowColor: primaryPurple,
                },
                loading && { opacity: 0.8 },
              ]}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.submitButtonText}>Processando...</Text>
                </View>
              ) : (
                <View style={styles.submitRow}>
                  <Text style={styles.submitButtonText}>
                    {isSignUp ? "Criar Minha Conta" : "Entrar na Minha Conta"}
                  </Text>
                  <SymbolView
                    name={{
                      ios: "arrow.right",
                      android: "arrow_forward",
                      web: "arrow_forward",
                    }}
                    size={16}
                    tintColor="#FFFFFF"
                  />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Rodapé Alternador de Modo */}
          <Pressable
            onPress={() => handleToggleMode(!isSignUp)}
            style={styles.footerPressable}
          >
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              {isSignUp ? "Já possui uma conta cadastrada? " : "Ainda não possui uma conta? "}
            </Text>
            <Text style={[styles.footerHighlight, { color: primaryPurple }]}>
              {isSignUp ? "Entre agora" : "Cadastre-se"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  keyboardContainer: {
    width: "100%",
    maxWidth: 420,
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: "center",
  },
  glowOrb: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    ...Platform.select({
      ios: {
        filter: "blur(60px)",
      },
      web: {
        filter: "blur(60px)",
      },
      android: {
        elevation: 10,
      },
    }),
  },
  glowTopLeft: {
    top: -60,
    left: -70,
  },
  glowBottomRight: {
    bottom: -60,
    right: -70,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: "0 4px 18px rgba(168, 85, 247, 0.4)",
      },
    }),
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 4,
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: "500",
  },
  segmentedContainer: {
    width: "100%",
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    marginBottom: 16,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  activeSegment: {
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0 2px 10px rgba(124, 58, 237, 0.4)",
      },
    }),
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  card: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 16,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: "0 12px 36px rgba(124, 58, 237, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
        backdropFilter: "blur(20px)",
      },
    }),
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    minHeight: 48,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 6,
      },
      web: {
        transition: "all 0.2s ease",
      },
    }),
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
    borderWidth: 0,
    backgroundColor: "transparent",
    ...Platform.select({
      web: {
        outlineStyle: "none",
        outlineWidth: 0,
        boxShadow: "none",
      } as any,
    }),
  },
  eyeButton: {
    padding: 6,
    marginLeft: 4,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: "0 4px 20px rgba(124, 58, 237, 0.45)",
      },
    }),
  },
  submitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  footerPressable: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 20,
    paddingVertical: 8,
  },
  footerText: {
    fontSize: 13,
    fontWeight: "400",
  },
  footerHighlight: {
    fontSize: 13,
    fontWeight: "700",
  },
});
