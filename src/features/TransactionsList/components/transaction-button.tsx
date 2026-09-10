import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface TransactionButtonProps {
    onPress: () => void;
}

export function TransactionButton({ onPress }: TransactionButtonProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.fab,
                {
                    backgroundColor: '#7C3AED',
                    shadowColor: '#7C3AED',
                    shadowOpacity: isDark ? 0.8 : 0.4,
                    shadowRadius: isDark ? 20 : 10,
                    elevation: isDark ? 15 : 8,
                },
            ]}
            activeOpacity={0.8}
        >
            <ThemedText style={styles.plusIcon}>+ Nova Transação</ThemedText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        height: 48,
        paddingHorizontal: 20,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    plusIcon: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
    },
});
