import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';

interface TransactionButtonProps {
    onPress: () => void;
}

export function TransactionButton({ onPress }: TransactionButtonProps) {
    const theme = useTheme();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const neonColor = isDark ? (theme.neon || '#A855F7') : (theme.lilac || '#C084FC');

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.fab,
                {
                    backgroundColor: neonColor,
                    shadowColor: neonColor,
                    shadowOpacity: isDark ? 0.8 : 0.4,
                    shadowRadius: isDark ? 20 : 10,
                    elevation: isDark ? 15 : 8,
                },
            ]}
            activeOpacity={0.8}
        >
            <ThemedText style={styles.plusIcon}>+</ThemedText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    plusIcon: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
    },
});
