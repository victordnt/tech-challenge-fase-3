import React from 'react';
import { StyleSheet, View, ScrollView, useColorScheme, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

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
    const colorScheme = useColorScheme();
    const validColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[validColorScheme];

    const itemHeight = 72;
    const maxVisibleHeight = 3 * itemHeight;

    return (
        <View style={[
            styles.cardContainer,
            {
                backgroundColor: '#FFFFFF1A',
                borderColor: '#FFFFFF1A',
            }
        ]}>
            <ScrollView
                style={{ maxHeight: maxVisibleHeight }}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
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
                        const amountColor = isIncome ? colors.success : colors.danger;
                        
                        return (
                            <View 
                                key={item.id} 
                                style={[
                                    styles.cardItem, 
                                    { 
                                        height: itemHeight,
                                        borderBottomWidth: index < transactions.length - 1 ? 1 : 0,
                                        borderBottomColor: '#FFFFFF1A',
                                    }
                                ]}
                            >
                                <View style={styles.cardItemLeft}>
                                    <View>
                                        <ThemedText type="default" style={styles.itemTitle}>
                                            {item.description}
                                        </ThemedText>
                                        <ThemedText type="small" themeColor="textSecondary" style={styles.itemSubtitle}>
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
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
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
        fontWeight: '600',
        fontSize: 15,
    },
    itemSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    amount: {
        fontSize: 14,
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
