import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, BadgeText } from '@gluestack-ui/themed';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { SearchInput } from '@/components/search-input';
import { TransactionList } from '@/features/TransactionsList/components/transaction-list';
import { TransactionModal } from '@/features/TransactionsList/components/transaction-modal';
import { TransactionButton } from '@/features/TransactionsList/components/transaction-button';
import { useTransactions } from '@/features/TransactionsList/contexts/transactions-context';
import type { Transaction } from '@/features/TransactionsList/types/finance';

export default function TransactionsListPage() {
    const colorScheme = useColorScheme();
    const validColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[validColorScheme];

    const { transactions, loading, error, deleteTransaction, hasMore, loadMore, retry } = useTransactions();
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Extrair categorias únicas existentes
    const categories = useMemo(() => {
        return Array.from(new Set(transactions.map((t) => t.category))).filter(Boolean);
    }, [transactions]);

    const filterOptions = useMemo(() => {
        return ['All', 'Income', 'Expense', ...categories];
    }, [categories]);

    // Filtrar transações por busca, tipo e categoria
    const filteredTransactions = useMemo(() => {
        return transactions.filter(item => {
            if (selectedFilter === 'Income' && item.type !== 'income') return false;
            if (selectedFilter === 'Expense' && item.type !== 'expense') return false;
            if (selectedFilter !== 'All' && selectedFilter !== 'Income' && selectedFilter !== 'Expense' && item.category !== selectedFilter) return false;

            if (searchQuery.trim() !== '') {
                const query = searchQuery.toLowerCase();
                return item.description.toLowerCase().includes(query) || item.category.toLowerCase().includes(query);
            }
            const day = item.date.slice(0, 10);
            if (startDate && day < startDate) return false;
            if (endDate && day > endDate) return false;
            return true;
        });
    }, [transactions, selectedFilter, searchQuery, startDate, endDate]);

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

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['left', 'right']}>
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <SearchInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Buscar transações..." />
                    </View>

                    <View style={styles.dateFilters}>
                        <TextInput
                            value={startDate}
                            onChangeText={setStartDate}
                            placeholder="De: AAAA-MM-DD"
                            placeholderTextColor={colors.textSecondary}
                            style={[styles.dateInput, { color: colors.text, borderColor: colors.border }]}
                            maxLength={10}
                        />
                        <TextInput
                            value={endDate}
                            onChangeText={setEndDate}
                            placeholder="Até: AAAA-MM-DD"
                            placeholderTextColor={colors.textSecondary}
                            style={[styles.dateInput, { color: colors.text, borderColor: colors.border }]}
                            maxLength={10}
                        />
                        {startDate || endDate ? (
                            <TouchableOpacity onPress={() => { setStartDate(''); setEndDate(''); }}>
                                <ThemedText>Limpar datas</ThemedText>
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    {/* Badge Filter List */}
                    <View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                            {filterOptions.map((option) => (
                                <TouchableOpacity key={option} onPress={() => setSelectedFilter(option)} activeOpacity={0.8}>
                                    <Badge
                                        style={[
                                            styles.badge,
                                            selectedFilter === option
                                                ? { backgroundColor: '#7C3AED', borderColor: 'transparent' }
                                                : { backgroundColor: colors.backgroundElement, borderColor: colors.border, borderWidth: 1 }
                                        ]}
                                    >
                                        <BadgeText
                                            style={[
                                                styles.badgeText,
                                                selectedFilter === option
                                                    ? { color: '#EDE0FF' }
                                                    : { color: colors.textSecondary }
                                            ]}
                                        >
                                            {option === 'All' ? 'Tudo' : option === 'Income' ? 'Entradas' : option === 'Expense' ? 'Saídas' : option}
                                        </BadgeText>
                                    </Badge>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Conteúdo com Indicator de Loading ou Lista */}
                    {error ? <View style={{ gap: 8 }}><ThemedText style={{ color: colors.danger }}>{error}</ThemedText><TouchableOpacity accessibilityRole="button" onPress={retry} style={{ paddingVertical: 12 }}><ThemedText style={{ color: colors.primary }}>Tentar novamente</ThemedText></TouchableOpacity></View> : null}
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#8A56FF" />
                            <ThemedText type="small" style={{ color: '#94A3B8', marginTop: 12 }}>
                                Carregando transações do Firebase...
                            </ThemedText>
                        </View>
                    ) : (
                        <TransactionList
                            transactions={filteredTransactions}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}
                    {!loading && hasMore ? (
                        <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
                            <ThemedText style={styles.loadMoreText}>Carregar mais</ThemedText>
                        </TouchableOpacity>
                    ) : null}
                </ScrollView>

                {/* FAB Button para Nova Transação */}
                <TransactionButton onPress={() => setIsModalVisible(true)} />

                {/* Modal de Transação */}
                <TransactionModal
                    visible={isModalVisible}
                    editingTransaction={editingTransaction}
                    onClose={() => {
                        setIsModalVisible(false);
                        setEditingTransaction(null);
                    }}
                />
            </View>
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
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 120,
        gap: 20,
    },
    header: {
        gap: 4,
    },
    filterContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingBottom: 4,
    },
    dateFilters: { gap: 10 },
    dateInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
    loadMoreButton: { alignSelf: 'center', backgroundColor: '#7C3AED', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 12 },
    loadMoreText: { color: '#FFFFFF', fontWeight: '600' },
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
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
});
