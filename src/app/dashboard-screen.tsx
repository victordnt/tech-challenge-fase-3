import { useColorScheme } from '@/hooks/use-color-scheme';

import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, BadgeText } from '@gluestack-ui/themed';

import { PaginationFooter } from '@/features/TransactionsList/components/pagination-footer';
import { SummaryCards } from '@/features/TransactionsList/components/summary-cards';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SearchInput } from '@/components/search-input';
import { TransactionList } from '@/features/TransactionsList/components/transaction-list';
import { TransactionModal } from '@/features/TransactionsList/components/transaction-modal';
import { Colors } from '@/constants/theme';

import { useTransactions } from '@/features/TransactionsList/contexts/transactions-context';
import { calculateDashboardSummary, filterTransactions } from '@/features/TransactionsList/services/finance';
import type { Transaction } from '@/features/TransactionsList/types/finance';
import CashFlowGraph from '@/features/FinancialAnalytics/components/CashFlowGraph';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function DashboardScreen() {
    const colorScheme = useColorScheme();
    const validColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[validColorScheme];
    const { transactions, filters, setFilters, currentPage, setCurrentPage, itemsPerPage, loading: transactionsLoading, error, hasMore, loadMore, retry } = useTransactions();


    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const { deleteTransaction } = useTransactions();

    const filteredTransactions = useMemo(() => filterTransactions(transactions, filters), [transactions, filters]);
    const summary = useMemo(() => calculateDashboardSummary(filteredTransactions), [filteredTransactions]);

    // Paginação
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

    // Filtros de badges dinâmicos
    const categories = useMemo(() => {
        return Array.from(new Set(transactions.map((t) => t.category))).filter(Boolean);
    }, [transactions]);

    const activeFilter = useMemo(() => {
        if (filters.type === 'income') return 'Income';
        if (filters.type === 'expense') return 'Expense';
        if (filters.category) return filters.category;
        return 'All';
    }, [filters]);

    const filterOptions = useMemo(() => {
        return ['All', 'Income', 'Expense', ...categories];
    }, [categories]);

    const handleSelectFilter = (filter: string) => {
        setCurrentPage(1);
        if (filter === 'All') {
            setFilters((prev) => {
                const { type, category, ...rest } = prev;
                return rest;
            });
        } else if (filter === 'Income') {
            setFilters((prev) => {
                const { category, ...rest } = prev;
                return { ...rest, type: 'income' };
            });
        } else if (filter === 'Expense') {
            setFilters((prev) => {
                const { category, ...rest } = prev;
                return { ...rest, type: 'expense' };
            });
        } else {
            setFilters((prev) => {
                const { type, ...rest } = prev;
                return { ...rest, category: filter };
            });
        }
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
                            onPress={() => {
                                setEditingTransaction(null);
                                setIsModalVisible(true);
                            }}
                            style={[styles.newTransactionButton, { flex: 1 }]}
                            activeOpacity={0.8}
                        >
                            <ThemedText style={styles.newTransactionButtonText}>+ Nova Transação</ThemedText>
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
                        {error ? <View style={{ gap: 8 }}><ThemedText accessibilityRole="alert" style={{ color: colors.danger }}>{error}</ThemedText><TouchableOpacity accessibilityRole="button" onPress={retry} style={{ paddingVertical: 12 }}><ThemedText style={{ color: colors.primary }}>Tentar novamente</ThemedText></TouchableOpacity></View> : null}
                        {/* Search Bar */}
                        <SearchInput
                            value={filters.search || ''}
                            onChangeText={(text) => {
                                setFilters((prev) => ({ ...prev, search: text }));
                                setCurrentPage(1);
                            }}
                            style={styles.searchBar}
                        />

                        {/* Badge Filter List */}
                        <View style={styles.filterWrapper}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                                {filterOptions.map((option) => (
                                    <TouchableOpacity key={option} onPress={() => handleSelectFilter(option)} activeOpacity={0.8}>
                                        <Badge
                                            style={[
                                                styles.badge,
                                                activeFilter === option
                                                    ? { backgroundColor: '#8A56FF', borderColor: 'transparent' }
                                                    : { backgroundColor: colors.backgroundElement, borderColor: colors.border, borderWidth: 1 }
                                            ]}
                                        >
                                            <BadgeText
                                                style={[
                                                    styles.badgeText,
                                                    activeFilter === option
                                                        ? { color: '#FFFFFF' }
                                                        : { color: '#94A3B8' }
                                                ]}
                                            >
                                                {option === 'All' ? 'Tudo' : option === 'Income' ? 'Entradas' : option === 'Expense' ? 'Saídas' : option}
                                            </BadgeText>
                                        </Badge>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Summary Cards */}
                        <SummaryCards
                            totalIncome={summary.totalIncome}
                            totalExpense={summary.totalExpense}
                            balance={summary.balance}
                        />

                        <Animated.View entering={FadeInUp.duration(450)}>
                            <CashFlowGraph transactions={filteredTransactions} />
                        </Animated.View>

                        {/* Transactions List */}
                        <ThemedText type="title" style={styles.listTitle}>Transações</ThemedText>
                        <TransactionList
                            transactions={paginatedTransactions}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />

                        {hasMore ? <TouchableOpacity onPress={loadMore} style={[styles.newTransactionButton, { marginTop: 12 }]}><ThemedText style={{ color: '#FFFFFF' }}>Carregar mais transações</ThemedText></TouchableOpacity> : null}
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
        width: '100%',
        maxWidth: 1000,
        alignSelf: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 12,
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'space-between',
    },
    headerLeft: {
        gap: 4,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        lineHeight: 34,
        fontWeight: '700',
    },
    newTransactionButton: {
        backgroundColor: '#7C3AED',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    newTransactionButtonText: {
        color: '#FFFFFF',
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
        paddingTop: 12,
        paddingBottom: 32,
        width: '100%',
        maxWidth: 1000,
        alignSelf: 'center',
        gap: 24,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 12,
    },
    searchBar: {
        marginBottom: 4,
    },
    filterWrapper: {
        marginBottom: 4,
    },
    filterContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingBottom: 4,
    },
    badge: {
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        height: 38,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '500',
        textTransform: 'none',
    },
});
