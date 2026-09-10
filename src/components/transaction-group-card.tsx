import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';

export interface MockTransaction {
    id: string;
    description: string;
    category: string;
    time: string;
    amount: string;
    type: 'income' | 'expense';
}

interface TransactionGroupCardProps {
    transactions: MockTransaction[];
}

export function TransactionGroupCard({ transactions }: TransactionGroupCardProps) {
    const itemHeight = 72;
    const maxVisibleHeight = 3 * itemHeight;
    const accentColor = '#D2BBFF'; 

    return (
        <View style={[
            styles.cardContainer,
            {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
            }
        ]}>
            <ScrollView
                style={{ maxHeight: maxVisibleHeight }}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
            >
                {transactions.length === 0 ? (
                    <View style={[styles.emptyContainer, { height: itemHeight }]}>
                        <ThemedText type="default" themeColor="textSecondary">
                            Nenhuma transação registrada
                        </ThemedText>
                    </View>
                ) : (
                    transactions.map((item, index) => {
                        const isIncome = item.type === 'income';
                        const amountColor = isIncome ? accentColor : '#FFFFFF';
                        
                        return (
                            <View 
                                key={item.id} 
                                style={[
                                    styles.cardItem, 
                                    { 
                                        height: itemHeight,
                                        borderBottomWidth: index < transactions.length - 1 ? 1 : 0,
                                        borderBottomColor: '#2E2E33',
                                    }
                                ]}
                            >
                                <View style={styles.cardItemLeft}>
                                    <View>
                                        <ThemedText type="default" style={styles.itemTitle}>
                                            {item.description}
                                        </ThemedText>
                                        <ThemedText type="small" style={styles.itemSubtitle}>
                                            {item.time} • {item.category}
                                        </ThemedText>
                                    </View>
                                </View>
                                <ThemedText type="smallBold" style={[styles.amount, { color: amountColor }]}>
                                    {isIncome ? '+' : '-'} {item.amount}
                                </ThemedText>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        paddingVertical: 4,
    },
    cardItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        backgroundColor: 'transparent',
    },
    cardItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    itemTitle: {
        fontWeight: '500',
        fontSize: 15,
        color: '#E0E3E5',
    },
    itemSubtitle: {
        fontSize: 12,
        marginTop: 2,
        color: '#CCC3D8',
    },
    amount: {
        fontSize: 15,
        fontWeight: '600',
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
