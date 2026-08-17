import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';

import { AddTransactionModal } from '@/components/add-transaction-modal';
import { ConfirmationModal } from '@/components/confirmation-modal';
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
    const { transactions, filters, loadUserTransactions } = useTransactions();
    const { signOut } = useAuth();
    const router = useRouter();
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [addTransactionModalVisible, setAddTransactionModalVisible] = useState(false);
    const [addTransactionLoading, setAddTransactionLoading] = useState(false);
    const { addTransaction } = useTransactions();
    const { user } = useAuth();

    const filteredTransactions = useMemo(() => filterTransactions(transactions, filters), [transactions, filters]);
    const summary = useMemo(() => calculateDashboardSummary(filteredTransactions), [filteredTransactions]);

    useEffect(() => {
        console.log("Firebase project:", auth.app.options.projectId);
        console.log("Firebase auth domain:", auth.app.options.authDomain);
    }, []);

    // Carregar transações quando o usuário fizer login
    useEffect(() => {
        if (user?.uid) {
            loadUserTransactions(user.uid);
        }
    }, [user?.uid, loadUserTransactions]);

    const handleLogoutPress = () => {
        setLogoutModalVisible(true);
    };

    const handleLogoutConfirm = async () => {
        setLogoutLoading(true);
        try {
            await signOut();
            setLogoutModalVisible(false);
            router.replace('/login');
        } catch (error) {
            console.error('Erro ao sair:', error);
            setLogoutLoading(false);
            Alert.alert('Erro', 'Erro ao sair da conta');
        }
    };

    const handleLogoutCancel = () => {
        setLogoutModalVisible(false);
    };

    const handleAddTransaction = async (data: { type: 'income' | 'expense'; amount: number; date: string; title: string }) => {
        setAddTransactionLoading(true);
        try {
            const newTransaction = {
                id: uuidv4(),
                userId: user?.uid || 'user-1',
                type: data.type,
                amount: data.amount,
                category: 'Other' as const,
                description: data.title,
                date: data.date,
            };
            await addTransaction(newTransaction);
            setAddTransactionModalVisible(false);
        } catch (error) {
            console.error('Erro ao adicionar transação:', error);
            Alert.alert('Erro', 'Erro ao adicionar transação');
        } finally {
            setAddTransactionLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <ThemedView style={styles.container}>
                    <ThemedView style={styles.header}>
                        <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                            <ThemedText type="title" style={styles.headerTitle}>Meu Patrimônio</ThemedText>
                            <ThemedText type="small" themeColor="textSecondary">
                                {isLoading ? 'Carregando...' : 'Visão geral de receitas e despesas'}
                            </ThemedText>
                        </ThemedView>
                        <View style={styles.headerButtons}>
                            <TouchableOpacity
                                onPress={handleLogoutPress}
                                style={[styles.logoutButton, { borderColor: colors.danger }]}
                            >
                                <ThemedText style={[styles.logoutButtonText, { color: colors.danger }]}>Sair</ThemedText>
                            </TouchableOpacity>
                        </View>
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
                                <ThemedText type="small" themeColor="textSecondary" style={styles.cardLabel}>Entradas</ThemedText>
                                <ThemedText style={[styles.cardAmount, { color: colors.success }]}>↑</ThemedText>
                            </ThemedView>
                            <ThemedText type="title" style={styles.cardValue}>
                                R$ {summary.totalIncome.toFixed(2)}
                            </ThemedText>
                        </ThemedView>

                        <ThemedView style={[styles.card, { borderLeftColor: colors.danger, borderLeftWidth: 4 }]}>
                            <ThemedView style={styles.cardHeader}>
                                <ThemedText type="small" themeColor="textSecondary" style={styles.cardLabel}>Saídas</ThemedText>
                                <ThemedText style={[styles.cardAmount, { color: colors.danger }]}>↓</ThemedText>
                            </ThemedView>
                            <ThemedText type="title" style={styles.cardValue}>
                                R$ {summary.totalExpense.toFixed(2)}
                            </ThemedText>
                        </ThemedView>
                    </ThemedView>

                    {/* Botão Nova Transação */}
                    <TouchableOpacity
                        onPress={() => setAddTransactionModalVisible(true)}
                        style={[styles.newTransactionButton, { backgroundColor: colors.primary }]}
                    >
                        <ThemedText style={styles.newTransactionButtonText}>+ Nova Transação</ThemedText>
                    </TouchableOpacity>

                    <View style={styles.transactionsSection}>
                        {transactions.length === 0 ? (
                            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyMessage}>
                                Nenhuma transação registrada
                            </ThemedText>
                        ) : (
                            <View style={styles.transactionsList}>
                                {transactions.map((transaction) => (
                                    <View
                                        key={transaction.id}
                                        style={[
                                            styles.transactionItem,
                                            {
                                                borderLeftColor: transaction.type === 'income' ? colors.success : colors.danger,
                                                backgroundColor: colors.backgroundElement,
                                            },
                                        ]}
                                    >
                                        <View style={styles.transactionInfo}>
                                            <ThemedText type="small" style={styles.transactionTitle}>
                                                {transaction.description}
                                            </ThemedText>
                                            <ThemedText type="small" themeColor="textSecondary" style={[styles.transactionDate, { color: colors.textSecondary }]}>
                                                {new Date(transaction.date).toLocaleDateString('pt-BR')}
                                            </ThemedText>
                                        </View>
                                        <ThemedText
                                            type="default"
                                            style={[
                                                styles.transactionAmount,
                                                {
                                                    color: transaction.type === 'income' ? colors.success : colors.danger,
                                                },
                                            ]}
                                        >
                                            {transaction.type === 'income' ? '+' : '−'} R$ {transaction.amount.toFixed(2)}
                                        </ThemedText>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </ThemedView>
            </ScrollView>

            <ConfirmationModal
                visible={logoutModalVisible}
                title="Sair"
                message="Tem certeza que deseja sair da sua conta?"
                cancelText="Cancelar"
                confirmText="Sair"
                onCancel={handleLogoutCancel}
                onConfirm={handleLogoutConfirm}
                isDangerous={true}
                isLoading={logoutLoading}
            />

            <AddTransactionModal
                visible={addTransactionModalVisible}
                onClose={() => setAddTransactionModalVisible(false)}
                onAdd={handleAddTransaction}
                isLoading={addTransactionLoading}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
    },
    container: {
        padding: 20,
        gap: 24,
        paddingBottom: 40,
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
    headerButtons: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    addButton: {
        borderWidth: 1.5,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        minWidth: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: 20,
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
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    card: {
        flex: 1,
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
    newTransactionButton: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    newTransactionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    transactionsSection: {
        gap: 12,
    },
    transactionsTitle: {
        fontWeight: '600',
        fontSize: 16,
    },
    transactionsList: {
        gap: 8,
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        gap: 12,
    },
    transactionInfo: {
        flex: 1,
        gap: 4,
    },
    transactionDate: {
        fontSize: 11,
        opacity: 0.7,
    },
    transactionTitle: {
        fontSize: 13,
        fontWeight: '500',
    },
    transactionAmount: {
        fontWeight: '600',
        fontSize: 14,
    },
    emptyMessage: {
        textAlign: 'center',
        paddingVertical: 20,
    },
});
