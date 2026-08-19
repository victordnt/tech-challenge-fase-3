import React from 'react';
import { StyleSheet, ScrollView, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { SearchInput } from '@/components/search-input';
import { TransactionGroupCard, MockTransaction } from '@/components/transaction-group-card';

export default function TransactionsListPage() {
    const colorScheme = useColorScheme();
    const validColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[validColorScheme];

    const todayTransactions: MockTransaction[] = [
        { id: '1', description: 'Supermercado Pão de Açúcar', category: 'Alimentação', time: '14:30', amount: 'R$ 150,00', type: 'expense' },
        { id: '2', description: 'Assinatura Spotify Premium', category: 'Lazer', time: '09:15', amount: 'R$ 34,90', type: 'expense' },
        { id: '3', description: 'Salário MAVI', category: 'Salário', time: '08:00', amount: 'R$ 5.000,00', type: 'income' },
    ];

    const yesterdayTransactions: MockTransaction[] = [
        { id: '4', description: 'Almoço Executivo', category: 'Alimentação', time: '12:45', amount: 'R$ 45,00', type: 'expense' },
         { id: '5', description: 'Corrida Uber', category: 'Transporte', time: '18:20', amount: 'R$ 25,50', type: 'expense' },
        { id: '6', description: 'Conta de Energia Light', category: 'Serviços', time: '10:15', amount: 'R$ 180,00', type: 'expense' },
    ];

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background,  }]} edges={['left', 'right']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                   <SearchInput value="" onChangeText={() => {}} />
                </View>

                {/* Transações de Hoje */}
                <ThemedText type="subtitle" style={styles.sectionTitle}>Hoje</ThemedText>
                <TransactionGroupCard transactions={todayTransactions} />

                {/* Transações de Ontem */}
                <ThemedText type="subtitle" style={styles.sectionTitle}>Ontem</ThemedText>
                <TransactionGroupCard transactions={yesterdayTransactions} />
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
    sectionTitle: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 8,
        color: '#CCC3D8',
        opacity: 0.7,
        textTransform: 'uppercase',
    },
});
