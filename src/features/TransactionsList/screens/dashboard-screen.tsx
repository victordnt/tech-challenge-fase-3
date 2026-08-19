import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PaginationFooter } from '@/features/TransactionsList/components/pagination-footer';
import { SummaryCards } from '@/features/TransactionsList/components/summary-cards';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SearchInput } from '@/components/search-input';
import { TransactionButton } from '@/features/TransactionsList/components/transaction-button';
import { TransactionList } from '@/features/TransactionsList/components/transaction-list';
import { TransactionModal } from '@/features/TransactionsList/components/transaction-modal';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/features/UserProfile/contexts/auth-context';
import { useTransactions } from '@/features/TransactionsList/contexts/transactions-context';
import { calculateDashboardSummary, filterTransactions } from '@/features/TransactionsList/services/finance';
import { auth } from '@/services/firebase/config';
import type { Transaction } from '@/features/TransactionsList/types/finance';

export default function DashboardScreen() {
    const colorScheme = useColorScheme();
    const validColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[validColorScheme];
    const { transactions, filters, setFilters, currentPage, setCurrentPage, itemsPerPage, loading: transactionsLoading } = useTransactions();
    const { signOut } = useAuth();
    const router = useRouter();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const { deleteTransaction } = useTransactions();

    const filteredTransactions = useMemo(() => filterTransactions(transactions, filters), [transactions, filters]);
    const summary = useMemo(() => calculateDashboardSummary(filteredTransactions), [filteredTransactions]);

    // Paginação
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        console.log("Firebase project:", auth.app.options.projectId);
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
                            const errorMessage = error instanceof Error ? error.message : 'Erro ao sair da conta';
                            Alert.alert('Erro', errorMessage);
                        }
                    },
                    style: 'destructive',
                },
            ],
        );
    };

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsModalVisible(true);
    };

    const handleDelete = async (transactionId: string) => {
        try {
            await deleteTransaction(transactionId);
            Alert.alert('Sucesso', 'Transação excluída com sucesso!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir transação';
            Alert.alert('Erro', errorMessage);
        }
    };

    const neonColor = colorScheme === 'dark' ? (colors.neon || '#A855F7') : (colors.lilac || '#C084FC');

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['left', 'right']}>
            <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Header */}
                <ThemedView style={[styles.header, { backgroundColor: 'transparent' }]}>
                    <ThemedView style={[styles.headerLeft, { backgroundColor: 'transparent' }]}>
                        <ThemedText type="title" style={styles.headerTitle}>Meu Patrimônio</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                            {transactionsLoading ? 'Carregando transações...' : 'Controle de entradas e saídas'}
                        </ThemedText>
                    </ThemedView>
                    <ThemedView style={[styles.headerRight, { backgroundColor: 'transparent' }]}>
                        <TouchableOpacity
                            onPress={handleLogout}
                            style={[styles.logoutButton, { borderColor: colors.danger }]}
                        >
                            <ThemedText style={[styles.logoutButtonText, { color: colors.danger }]}>Sair</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </ThemedView>

                {transactionsLoading ? (
                    <View style={[styles.loadingContainer, { backgroundColor: 'transparent' }]}>
                        <ActivityIndicator size="large" color={neonColor} />
                        <ThemedText type="small" style={{ marginTop: 12 }}>Carregando suas transações...</ThemedText>
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Search Bar */}
                        <SearchInput
                            value={filters.search || ''}
                            onChangeText={(text) => {
                                setFilters((prev) => ({ ...prev, search: text }));
                                setCurrentPage(1);
                            }}
                            style={styles.searchBar}
                        />

                        {/* Summary Cards */}
                        <SummaryCards
                            totalIncome={summary.totalIncome}
                            totalExpense={summary.totalExpense}
                            balance={summary.balance}
                        />

                        {/* Transactions List */}
                        <ThemedText type="title" style={styles.listTitle}>Transações</ThemedText>
                        <TransactionList
                            transactions={paginatedTransactions}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <PaginationFooter
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </ScrollView>
                )}

                {/* FAB Button */}
                <TransactionButton onPress={() => setIsModalVisible(true)} />

                {/* Transaction Modal */}
                <TransactionModal
                    visible={isModalVisible}
                    editingTransaction={editingTransaction}
                    onClose={() => {
                        setIsModalVisible(false);
                        setEditingTransaction(null);
                    }}
                />
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
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    headerLeft: {
        flex: 1,
        gap: 4,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
    },
    logoutButton: {
        marginHorizontal: 20,
        borderWidth: 1.5,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    logoutButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 120,
        gap: 20,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 12,
    },
    searchBar: {
        marginBottom: 4,
    },
});