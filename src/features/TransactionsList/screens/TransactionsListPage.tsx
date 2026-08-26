import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, useColorScheme, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, BadgeText } from '@gluestack-ui/themed';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { SearchInput } from '@/components/search-input';
import { TransactionGroupCard } from '@/components/transaction-group-card';
import { todayTransactions, yesterdayTransactions } from '@/features/TransactionsList/schemas/MockTransactions';

export default function TransactionsListPage() {
    const colorScheme = useColorScheme();
    const validColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[validColorScheme];

    const [selectedFilter, setSelectedFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const filterOptions = ['All', 'Income', 'Expense', 'Groceries', 'Food & Drink', 'Salary', 'Transport', 'Entertainment'];

    const allTransactions = [...todayTransactions, ...yesterdayTransactions];
    const filtered = allTransactions.filter(item => {
      
        if (selectedFilter === 'Income' && item.type !== 'income') return false;
        if (selectedFilter === 'Expense' && item.type !== 'expense') return false;
        if (selectedFilter !== 'All' && selectedFilter !== 'Income' && selectedFilter !== 'Expense' && item.category !== selectedFilter) return false;
        
        // Filtro de pesquisa
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            return item.description.toLowerCase().includes(query) || item.category.toLowerCase().includes(query);
        }
        return true;
    });

    const filteredToday = filtered.filter(item => todayTransactions.some(t => t.id === item.id));
    const filteredYesterday = filtered.filter(item => yesterdayTransactions.some(t => t.id === item.id));

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['left', 'right']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                   <SearchInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Search transactions..." />
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
                                        {option === 'All' ? 'All' : option}
                                    </BadgeText>
                                </Badge>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Transações diárias */}
                {filteredToday.length > 0 && (
                    <View style={styles.sectionContainer}>
                        <ThemedText style={styles.sectionTitle}>Today</ThemedText>
                        <TransactionGroupCard transactions={filteredToday} />
                    </View>
                )}

                {/* Transações dia anterior */}
                {filteredYesterday.length > 0 && (
                    <View style={styles.sectionContainer}>
                        <ThemedText style={styles.sectionTitle}>Yesterday</ThemedText>
                        <TransactionGroupCard transactions={filteredYesterday} />
                    </View>
                )}

                {filtered.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <ThemedText style={{ color: '#94A3B8' }}>No transactions found</ThemedText>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
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
    sectionContainer: {
        gap: 8,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(204, 195, 216, 0.7)',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
});
