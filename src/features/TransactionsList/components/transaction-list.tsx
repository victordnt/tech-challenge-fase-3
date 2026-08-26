import { Transaction } from '@/features/TransactionsList/types/finance';
import { useState } from 'react';
import {
    Alert,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { PhotoPreviewModal } from '@/features/TransactionsList/components/photo-preview-modal';
import { ThemedText } from '@/components/themed-text';

interface TransactionListProps {
    transactions: Transaction[];
    onEdit?: (transaction: Transaction) => void;
    onDelete?: (transactionId: string) => void;
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    const accentColor = '#8A56FF'; // Purple accent color

    const formatTime = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            let hours = d.getHours();
            const minutes = d.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const minStr = minutes < 10 ? '0' + minutes : minutes;
            const hrStr = hours < 10 ? '0' + hours : hours;
            return `${hrStr}:${minStr} ${ampm}`;
        } catch {
            return '12:00 PM';
        }
    };

    const handleDeleteConfirm = (transaction: Transaction) => {
        Alert.alert(
            'Confirmar exclusão',
            `Tem certeza que deseja excluir a transação "${transaction.description}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            onDelete?.(transaction.id);
                        } catch {
                            Alert.alert('Erro', 'Erro ao excluir transação');
                        }
                    },
                },
            ]
        );
    };

    const handleRowPress = (item: Transaction) => {
        const options = ['Editar'];
        if (item.receipt?.url) {
            options.push('Ver Recibo');
        }
        options.push('Excluir', 'Cancelar');

        Alert.alert(
            'Opções da Transação',
            item.description,
            [
                {
                    text: 'Editar',
                    onPress: () => onEdit?.(item),
                },
                ...(item.receipt?.url ? [{
                    text: 'Ver Recibo',
                    onPress: () => setSelectedPhoto(item.receipt!.url),
                }] : []),
                {
                    text: 'Excluir',
                    style: 'destructive' as const,
                    onPress: () => handleDeleteConfirm(item),
                },
                {
                    text: 'Cancelar',
                    style: 'cancel' as const,
                }
            ]
        );
    };

    // Grouping transactions by date
    const groups: { [key: string]: Transaction[] } = {};
    transactions.forEach((tx) => {
        const txDate = new Date(tx.date);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        let dateKey = '';
        if (txDate.toDateString() === today.toDateString()) {
            dateKey = 'TODAY';
        } else if (txDate.toDateString() === yesterday.toDateString()) {
            dateKey = 'YESTERDAY';
        } else {
            const day = txDate.getDate();
            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            dateKey = `${day} ${months[txDate.getMonth()]}`;
        }

        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(tx);
    });

    const groupKeys = Object.keys(groups);

    if (transactions.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <ThemedText themeColor="textSecondary">Nenhuma transação ainda</ThemedText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {groupKeys.map((dateKey) => {
                const groupTransactions = groups[dateKey];
                return (
                    <View key={dateKey} style={styles.groupContainer}>
                        <ThemedText style={styles.sectionTitle}>{dateKey}</ThemedText>
                        <View style={styles.cardContainer}>
                            {groupTransactions.map((item, index) => {
                                const isIncome = item.type === 'income';
                                const amountColor = isIncome ? accentColor : '#FFFFFF';
                                const formattedTime = formatTime(item.date);

                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        onPress={() => handleRowPress(item)}
                                        activeOpacity={0.7}
                                        style={[
                                            styles.row,
                                            {
                                                borderBottomWidth: index < groupTransactions.length - 1 ? 1 : 0,
                                                borderBottomColor: '#2E2E33',
                                            }
                                        ]}
                                    >
                                        <View style={styles.rowLeft}>
                                            <ThemedText style={styles.itemTitle}>
                                                {item.description}
                                            </ThemedText>
                                            <ThemedText style={styles.itemSubtitle}>
                                                {formattedTime} • {item.category} {item.receipt?.url ? '📎' : ''}
                                            </ThemedText>
                                        </View>
                                        <ThemedText style={[styles.amount, { color: amountColor }]}>
                                            {isIncome ? '+' : '-'} R$ {Math.abs(item.amount).toFixed(2)}
                                        </ThemedText>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                );
            })}

            <PhotoPreviewModal
                visible={!!selectedPhoto}
                photoUri={selectedPhoto}
                onClose={() => setSelectedPhoto(null)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 20,
    },
    groupContainer: {
        gap: 8,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94A3B8',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    cardContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        minHeight: 70,
        backgroundColor: 'transparent',
    },
    rowLeft: {
        flex: 1,
        gap: 4,
        paddingRight: 12,
    },
    itemTitle: {
        fontWeight: '500',
        fontSize: 15,
        color: '#FFFFFF',
    },
    itemSubtitle: {
        fontSize: 12,
        color: '#94A3B8',
    },
    amount: {
        fontSize: 15,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 32,
    },
});
