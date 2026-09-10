import { Colors } from '@/constants/theme';
import { useAppContext } from '@/contexts/app-context';
import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface LoginModalProps {
    onSignIn: (email: string, password: string) => Promise<void>;
    onSignUp: (email: string, password: string) => Promise<void>;
}

export function LoginModal({ onSignIn, onSignUp }: LoginModalProps) {
    const { theme: appTheme } = useAppContext();
    const theme = Colors[appTheme];

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = (emailStr: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(emailStr);
    };

    const handleAuth = async () => {
        setError('');

        if (!email.trim()) {
            setError('Por favor, insira seu email');
            return;
        }

        if (!validateEmail(email.trim())) {
            setError('Email inválido');
            return;
        }

        if (!password.trim()) {
            setError('Por favor, insira sua senha');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        if (isSignUp && password !== confirmPassword) {
            setError('As senhas não correspondem');
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
            let errorMessage = 'Erro ao autenticar';

            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                errorMessage = 'Usuário ou senha incorretos';
            } else if (err.code === 'auth/wrong-password') {
                errorMessage = 'Senha incorreta';
            } else if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'Email já cadastrado';
            } else if (err.code === 'auth/weak-password') {
                errorMessage = 'Senha muito fraca';
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = 'Email inválido';
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleMode = () => {
        setIsSignUp(!isSignUp);
        setError('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 16,
            }}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ width: '100%', maxWidth: 400 }}
            >
                <View style={{ marginBottom: 24, alignItems: 'center' }}>
                <Text
                style={{
                    fontSize: 16,
                    fontWeight: '400',
                    color: '#D2BBFF',
                
                }}
                >Mavi Finance</Text>
                <Text
                style={{
                    fontSize: 16,
                    fontWeight: '400',
                    color: '#CCC3D8',
                }}
                >Welcome back to your digital wallet</Text>
                </View>
                <View
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 16,
                        padding: 24,
                        shadowColor: theme.shadow,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 10,
                    }}
                >

                    {error ? (
                        <View
                            style={{
                                backgroundColor: Colors[appTheme].danger + '20',
                                borderLeftWidth: 4,
                                borderLeftColor: Colors[appTheme].danger,
                                borderRadius: 8,
                                padding: 12,
                                marginBottom: 16,
                            }}
                        >
                            <Text
                                style={{
                                    color: Colors[appTheme].danger,
                                    fontSize: 14,
                                    fontWeight: '500',
                                }}
                            >
                                {error}
                            </Text>
                        </View>
                    ) : null}

                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: '#E0E3E5',
                            marginBottom: 8,
                        }}
                    >
                       Email
                    </Text>

                    <TextInput
                        placeholder="seu@email.com"
                        placeholderTextColor={theme.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!loading}
                        style={{
                            borderWidth: 1,
                            borderColor: theme.border,
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 12,
                            fontSize: 16,
                            color: theme.text,
                            marginBottom: 16,
                            backgroundColor: theme.background,
                        }}
                    />

                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: '#E0E3E5',
                            marginBottom: 8,
                        }}
                    >
                        Senha
                    </Text>

                    <TextInput
                        placeholder="••••••••"
                        placeholderTextColor={theme.textSecondary}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        editable={!loading}
                        style={{
                            borderWidth: 1,
                            borderColor: theme.border,
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 12,
                            fontSize: 16,
                            color: theme.text,
                            marginBottom: 16,
                            backgroundColor: theme.background,
                        }}
                    />

                    {isSignUp ? (
                        <>
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: theme.text,
                                    marginBottom: 8,
                                }}
                            >
                                Confirmar Senha
                            </Text>

                            <TextInput
                                placeholder="Confirme sua senha"
                                placeholderTextColor={theme.textSecondary}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                editable={!loading}
                                style={{
                                    borderWidth: 1,
                                    borderColor: theme.border,
                                    borderRadius: 8,
                                    paddingHorizontal: 12,
                                    paddingVertical: 12,
                                    fontSize: 16,
                                    color: theme.text,
                                    marginBottom: 20,
                                    backgroundColor: theme.background,
                                }}
                            />
                        </>
                    ) : null}

                    <TouchableOpacity
                        onPress={handleAuth}
                        disabled={loading}
                        style={{
                            backgroundColor: '#732EE4',
                            borderRadius: 8,
                            paddingVertical: 14,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 16,
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <Text
                                style={{
                                    color: '#EDE0FF',
                                    fontSize: 16,
                                    fontWeight: '600',
                                }}
                            >
                                {isSignUp ? 'Criar conta' : 'Entrar'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
                 <Pressable onPress={handleToggleMode}>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                marginTop: 16,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: '#CCC3D8',
                                    textAlign: 'center',
                                }}
                            >
                                {isSignUp ? 'Já tem uma conta? ' : 'Não tem uma conta? '}
                            </Text>

                            <Text
                                style={{
                                    fontSize: 14,
                                    color: '#D2BBFF',
                                    fontWeight: '600',
                                }}
                            >
                                {isSignUp ? 'Entre aqui' : 'Crie uma'}
                            </Text>
                        </View>
                    </Pressable>
            </KeyboardAvoidingView>
        </View>
    );
}
