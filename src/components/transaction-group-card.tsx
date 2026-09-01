import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

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
    const theme = useTheme();
    const itemHeight = 72;
    const maxVisibleHeight = 3 * itemHeight;

    return (
        <View style={[
            styles.cardContainer,
            {
                backgroundColor: theme.cardBg,
                borderColor: theme.cardBorder,
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
                        const amountColor = isIncome ? theme.income : theme.text;
                        
                        return (
                            <View 
                                key={item.id} 
                                style={[
                                    styles.cardItem, 
                                    { 
                                        height: itemHeight,
                                        borderBottomWidth: index < transactions.length - 1 ? 1 : 0,
                                        borderBottomColor: theme.cardSeparator,
                                    }
                                ]}
                            >
                                <View style={styles.cardItemLeft}>
                                    <View>
                                        <ThemedText type="default" style={[styles.itemTitle, { color: theme.text }]}>
                                            {item.description}
                                        </ThemedText>
                                        <ThemedText type="small" style={[styles.itemSubtitle, { color: theme.textSecondary }]}>
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
    },
    itemSubtitle: {
        fontSize: 12,
        marginTop: 2,
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
