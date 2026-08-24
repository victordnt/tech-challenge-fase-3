import React from 'react';
import { StyleSheet, View, ScrollView, Platform } from 'react-native';
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
    const accentColor = '#8A56FF'; // Purple accent color matching the mockup

    return (
        <View style={[
            styles.cardContainer,
            {
                backgroundColor: '#1E1E20',
                borderColor: '#2E2E33',
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
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
            }
        })
    },
    cardItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    cardItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    itemTitle: {
        fontWeight: '500',
        fontSize: 15,
        color: '#FFFFFF',
    },
    itemSubtitle: {
        fontSize: 12,
        marginTop: 2,
        color: '#94A3B8',
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
