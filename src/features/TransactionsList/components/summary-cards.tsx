import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface SummaryCardsProps {
    totalIncome: number;
    totalExpense: number;
    balance: number;
}

export function SummaryCards({ totalIncome, totalExpense, balance }: SummaryCardsProps) {
    const theme = useTheme();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const neonColor = isDark ? (theme.neon || '#A855F7') : (theme.lilac || '#C084FC');

    return (
        <View style={styles.container}>
            {/* Card Entradas */}
            <ThemedView
                style={[
                    styles.card,
                    styles.incomeCard,
                    {
                        backgroundColor: isDark ? theme.backgroundElement : '#E0D5F5',
                        borderColor: theme.success,
                    },
                ]}
            >
                <ThemedText type="small" style={styles.label}>Entradas</ThemedText>
                <ThemedText type="title" style={[styles.amount, { color: theme.success }]}>
                    R$ {totalIncome.toFixed(2)}
                </ThemedText>
            </ThemedView>

            {/* Card Saldo (Destaque) */}
            <ThemedView
                style={[
                    styles.balanceCard,
                    {
                        backgroundColor: neonColor,
                        shadowColor: neonColor,
                        shadowOpacity: isDark ? 0.8 : 0.4,
                        shadowRadius: isDark ? 20 : 12,
                        elevation: isDark ? 15 : 10,
                    },
                ]}
            >
                <ThemedText type="small" style={[styles.balanceLabel, { color: isDark ? '#FFF' : '#1A1A2E' }]}>
                    Saldo
                </ThemedText>
                <ThemedText type="title" style={[styles.balanceAmount, { color: isDark ? '#FFF' : '#1A1A2E' }]}>
                    R$ {Math.abs(balance).toFixed(2)}
                </ThemedText>
                <ThemedText type="small" style={[styles.balanceStatus, { color: isDark ? '#FFF' : '#1A1A2E', opacity: 0.9 }]}>
                    {balance >= 0 ? '✓ Positivo' : '✗ Negativo'}
                </ThemedText>
            </ThemedView>

            {/* Card Saídas */}
            <ThemedView
                style={[
                    styles.card,
                    styles.expenseCard,
                    {
                        backgroundColor: isDark ? theme.backgroundElement : '#F8E0F9',
                        borderColor: theme.danger,
                    },
                ]}
            >
                <ThemedText type="small" style={styles.label}>Saídas</ThemedText>
                <ThemedText type="title" style={[styles.amount, { color: theme.danger }]}>
                    R$ {totalExpense.toFixed(2)}
                </ThemedText>
            </ThemedView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 24,
    },
    card: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
    },
    incomeCard: {},
    expenseCard: {},
    balanceCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        opacity: 0.7,
    },
    amount: {
        fontSize: 16,
        fontWeight: '700',
    },
    balanceLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        opacity: 0.9,
    },
    balanceAmount: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    balanceStatus: {
        fontSize: 11,
        fontWeight: '500',
    },
});
