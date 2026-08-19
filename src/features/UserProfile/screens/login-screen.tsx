import { LoginModal } from '@/features/UserProfile/components/login-modal';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/features/UserProfile/contexts/auth-context';
import { useColorScheme, View } from 'react-native';

export default function LoginScreen() {
    const colorScheme = (useColorScheme() || 'light') as 'light' | 'dark';
    const theme = Colors[colorScheme];
    const { sign } = useAuth();

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: theme.background,
            }}
        >
            <LoginModal onSignIn={sign("in")("/(app)")} onSignUp={sign("up")("/(app)")} />
        </View>
    );
}
