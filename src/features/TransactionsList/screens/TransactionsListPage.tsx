import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
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

    const { transactions, loading, deleteTransaction } = useTransactions();
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

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
            return true;
        });
    }, [transactions, selectedFilter, searchQuery]);

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
                                                : { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1 }
                                        ]}
                                    >
                                        <BadgeText
                                            style={[
                                                styles.badgeText,
                                                selectedFilter === option
                                                    ? { color: '#EDE0FF' }
                                                    : { color: '#CCC3D8' }
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
