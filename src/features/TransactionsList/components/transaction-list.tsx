import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Transaction } from '@/features/TransactionsList/types/finance';
import { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { PhotoPreviewModal } from '@/features/TransactionsList/components/photo-preview-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface TransactionListProps {
    transactions: Transaction[];
    onEdit?: (transaction: Transaction) => void;
    onDelete?: (transactionId: string) => void;
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
    const theme = useTheme();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    const handleDelete = (transaction: Transaction) => {
        Alert.alert(
            'Confirmar exclusão',
            `Tem certeza que deseja excluir a transação "${transaction.category}"?`,
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

    const renderTransaction = ({ item }: { item: Transaction }) => {
        const isIncome = item.type === 'income';
        const color = isIncome ? theme.success : theme.danger;
        const icon = isIncome ? '📥' : '📤';

        return (
            <ThemedView
                style={[
                    styles.transactionCard,
                    {
                        backgroundColor: theme.backgroundElement,
                        borderColor: color,
                    },
                ]}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.leftContent}>
                        <ThemedText style={{ fontSize: 20 }}>{icon}</ThemedText>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="small" style={{ fontWeight: '600' }}>
                                {item.category}
                            </ThemedText>
                            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                                {item.description || 'Sem descrição'}
                            </ThemedText>
                        </View>
                    </View>
                    <View style={styles.rightContent}>
                        <ThemedText style={[styles.amount, { color }]}>
                            {isIncome ? '+' : '-'} R$ {Math.abs(item.amount).toFixed(2)}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                            {new Date(item.date).toLocaleDateString('pt-BR')}
                        </ThemedText>
                    </View>
                </View>
                {item.receipt?.url && (
                    <TouchableOpacity
                        onPress={() => setSelectedPhoto(item.receipt!.url)}
                        style={[
                            styles.photoThumbnail,
                            { backgroundColor: theme.backgroundSelected },
                        ]}
                    >
                        <Image
                            source={{ uri: item.receipt.url }}
                            style={styles.photoImage}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                )}
                {(onEdit || onDelete) && (
                    <View style={styles.actionButtons}>
                        {onEdit && (
                            <TouchableOpacity
                                onPress={() => onEdit(item)}
                                style={[
                                    styles.actionButton,
                                    { backgroundColor: isDark ? '#6B21A8' : '#D8B4FE' },
                                ]}
                            >
                                <ThemedText style={{ fontSize: 14 }}>✏️ Editar</ThemedText>
                            </TouchableOpacity>
                        )}
                        {onDelete && (
                            <TouchableOpacity
                                onPress={() => handleDelete(item)}
                                style={[
                                    styles.actionButton,
                                    { backgroundColor: isDark ? '#7F1D1D' : '#FCA5A5' },
                                ]}
                            >
                                <ThemedText style={{ fontSize: 14 }}>🗑️ Excluir</ThemedText>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </ThemedView>
        );
    };

    return (
        <>
            <FlatList
                data={transactions}
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <ThemedText themeColor="textSecondary">Nenhuma transação ainda</ThemedText>
                    </View>
                }
            />
            <PhotoPreviewModal
                visible={!!selectedPhoto}
                photoUri={selectedPhoto}
                onClose={() => setSelectedPhoto(null)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    list: {
        gap: 12,
    },
    transactionCard: {
        borderWidth: 2,
        borderRadius: 12,
        padding: 12,
        gap: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftContent: {
        flex: 1,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    rightContent: {
        alignItems: 'flex-end',
        gap: 4,
    },
    amount: {
        fontWeight: '700',
        fontSize: 14,
    },
    photoThumbnail: {
        width: '100%',
        height: 100,
        borderRadius: 8,
        overflow: 'hidden',
    },
    photoImage: {
        width: '100%',
        height: '100%',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 32,
    },
});
