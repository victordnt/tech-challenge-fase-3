import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Alert, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAppContext } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';
import { useTransactions } from '@/contexts/transactions-context';
import { calculateDashboardSummary, filterTransactions } from '@/services/finance';
import { auth } from '@/services/firebase/config';

export default function DashboardScreen() {
    const colorScheme = useColorScheme();
    const validColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[validColorScheme];
    const { isLoading } = useAppContext();
    const { transactions, filters } = useTransactions();
    const { signOut } = useAuth();
    const router = useRouter();

    const filteredTransactions = useMemo(() => filterTransactions(transactions, filters), [transactions, filters]);
    const summary = useMemo(() => calculateDashboardSummary(filteredTransactions), [filteredTransactions]);

    useEffect(() => {
        console.log("Firebase project:", auth.app.options.projectId);
        console.log("Firebase auth domain:", auth.app.options.authDomain);
    }, []);

    const handleLogout = () => {
        Alert.alert(
            'Sair',
            'Tem certeza que deseja sair da sua conta?',
            [
                {
                    text: 'Cancelar',
                    onPress: () => { },
                    style: 'cancel',
                },
                {
                    text: 'Sair',
                    onPress: async () => {
                        try {
                            await signOut();
                            router.replace('/login');
                        } catch (error) {
                            Alert.alert('Erro', 'Erro ao sair da conta');
                        }
                    },
                    style: 'destructive',
                },
            ],
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ThemedView style={styles.container}>
                <ThemedView style={styles.header}>
                    <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                        <ThemedText type="title" style={styles.headerTitle}>Meu Patrimônio</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                            {isLoading ? 'Carregando...' : 'Visão geral de receitas e despesas'}
                        </ThemedText>
                    </ThemedView>
                    <TouchableOpacity
                        onPress={handleLogout}
                        style={[styles.logoutButton, { borderColor: colors.danger }]}
                    >
                        <ThemedText style={[styles.logoutButtonText, { color: colors.danger }]}>Sair</ThemedText>
                    </TouchableOpacity>
                </ThemedView>

                <ThemedView style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
                    <ThemedText type="small" style={{ color: '#FFFFFF', opacity: 0.9 }}>Saldo Total</ThemedText>
                    <ThemedText type="title" style={[styles.balanceAmount, { color: '#FFFFFF' }]}>
                        R$ {Math.abs(summary.balance).toFixed(2)}
                    </ThemedText>
                    <ThemedText type="small" style={[{ color: '#FFFFFF', opacity: 0.8 }, summary.balance < 0 && { color: '#FCA5A5' }]}>
                        {summary.balance >= 0 ? '✓ Positivo' : '✗ Negativo'}
                    </ThemedText>
                </ThemedView>

                <ThemedView style={styles.cardsGrid}>
                    <ThemedView style={[styles.card, { borderLeftColor: colors.success, borderLeftWidth: 4 }]}>
                        <ThemedView style={styles.cardHeader}>
                            <ThemedText type="small" themeColor="textSecondary" style={styles.cardLabel}>Receitas</ThemedText>
                            <ThemedText style={[styles.cardAmount, { color: colors.success }]}>+</ThemedText>
                        </ThemedView>
                        <ThemedText type="title" style={styles.cardValue}>
                            R$ {summary.totalIncome.toFixed(2)}
                        </ThemedText>
                    </ThemedView>

                    <ThemedView style={[styles.card, { borderLeftColor: colors.danger, borderLeftWidth: 4 }]}>
                        <ThemedView style={styles.cardHeader}>
                            <ThemedText type="small" themeColor="textSecondary" style={styles.cardLabel}>Despesas</ThemedText>
                            <ThemedText style={[styles.cardAmount, { color: colors.danger }]}>−</ThemedText>
                        </ThemedView>
                        <ThemedText type="title" style={styles.cardValue}>
                            R$ {summary.totalExpense.toFixed(2)}
                        </ThemedText>
                    </ThemedView>
                </ThemedView>
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 20,
        gap: 24,
    },
    header: {
        backgroundColor: 'transparent',
        gap: 8,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '700',
    },
    logoutButton: {
        borderWidth: 1.5,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    logoutButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    balanceCard: {
        padding: 24,
        borderRadius: 16,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    balanceAmount: {
        fontSize: 36,
        fontWeight: '700',
    },
    cardsGrid: {
        gap: 12,
        backgroundColor: 'transparent',
    },
    card: {
        padding: 20,
        borderRadius: 14,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    cardLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
    cardAmount: {
        fontSize: 20,
        fontWeight: '600',
    },
    cardValue: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: 4,
    },
});
