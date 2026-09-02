import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Animated, { FadeInDown } from 'react-native-reanimated';

const AnimatedThemedView = Animated.createAnimatedComponent(ThemedView);

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
        <View style={styles.wrapper}>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.container}
            >
                {/* Card Entradas */}
                <AnimatedThemedView
                    entering={FadeInDown.duration(500).delay(100)}
                    style={[
                        styles.card,
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
                </AnimatedThemedView>

                {/* Card Saldo (Destaque) */}
                <AnimatedThemedView
                    entering={FadeInDown.duration(500).delay(200)}
                    style={[
                        styles.card,
                        styles.balanceCard,
                        {
                            backgroundColor: isDark ? theme.backgroundElement : theme.primary + '15',
                            borderColor: theme.primary,
                        },
                    ]}
                >
                    <ThemedText type="small" style={[styles.balanceLabel, { color: isDark ? '#FFF' : theme.primary }]}>
                        Saldo
                    </ThemedText>
                    <ThemedText type="title" style={[styles.balanceAmount, { color: isDark ? '#FFF' : theme.primary }]}>
                        R$ {Math.abs(balance).toFixed(2)}
                    </ThemedText>
                    <ThemedText type="small" style={[styles.balanceStatus, { color: isDark ? '#A0A0A0' : theme.textSecondary }]}>
                        {balance >= 0 ? '✓ Positivo' : '✗ Negativo'}
                    </ThemedText>
                </AnimatedThemedView>

                {/* Card Saídas */}
                <AnimatedThemedView
                    entering={FadeInDown.duration(500).delay(300)}
                    style={[
                        styles.card,
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
                </AnimatedThemedView>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 24,
    },
    container: {
        flexDirection: 'row',
        gap: 16,
        paddingHorizontal: 2, // Para evitar que a sombra (se houver) corte na borda
    },
    card: {
        width: 150,
        padding: 16,
        borderRadius: 12,
        alignItems: 'flex-start',
        borderWidth: 1,
        minHeight: 110,
        justifyContent: 'center',
    },
    balanceCard: {
        width: 160,
        borderWidth: 2,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        opacity: 0.8,
    },
    amount: {
        fontSize: 16,
        fontWeight: '700',
    },
    balanceLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
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
