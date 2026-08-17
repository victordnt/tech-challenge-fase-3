import { Colors } from '@/constants/theme';
import { useState } from 'react';
import {
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface AddTransactionModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (data: { type: 'income' | 'expense'; amount: number; date: string; title: string }) => void;
    isLoading?: boolean;
}

export function AddTransactionModal({
    visible,
    onClose,
    onAdd,
    isLoading = false,
}: AddTransactionModalProps) {
    const colorScheme = useColorScheme();
    const validColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[validColorScheme];

    const [isIncome, setIsIncome] = useState(true);
    const [amount, setAmount] = useState('');
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Converte YYYY-MM-DD para dd/mm/AAAA
    const formatDateDisplay = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    // Converte dd/mm/AAAA para YYYY-MM-DD
    const parseDateDisplay = (dateStr: string) => {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}`;
    };

    const handleDateChange = (days: number) => {
        const currentDate = new Date(date);
        currentDate.setDate(currentDate.getDate() + days);
        setDate(currentDate.toISOString().split('T')[0]);
    };

    const formatAmount = (value: string) => {
        // Remove tudo que não é número
        const digitsOnly = value.replace(/\D/g, '');

        // Se vazio, retorna vazio
        if (!digitsOnly) return '';

        // Formata com 2 casas decimais, removendo zeros à esquerda da parte inteira
        if (digitsOnly.length === 1) {
            return `0,0${digitsOnly}`;
        } else if (digitsOnly.length === 2) {
            return `0,${digitsOnly}`;
        } else {
            // Remove zeros à esquerda usando parseInt
            const integerPart = parseInt(digitsOnly.slice(0, -2), 10).toString();
            const decimalPart = digitsOnly.slice(-2);
            return `${integerPart},${decimalPart}`;
        }
    };

    const handleAmountChange = (value: string) => {
        setAmount(formatAmount(value));
    };

    const handleAddTransaction = () => {
        if (!amount || parseFloat(amount.replace(',', '.')) === 0) {
            alert('Por favor, insira um valor válido');
            return;
        }

        if (!title.trim()) {
            alert('Por favor, insira um título');
            return;
        }

        const numericAmount = parseFloat(amount.replace(',', '.'));

        onAdd({
            type: isIncome ? 'income' : 'expense',
            amount: numericAmount,
            date,
            title: title.trim(),
        });

        // Reset form
        setAmount('');
        setTitle('');
        setDate(new Date().toISOString().split('T')[0]);
        setIsIncome(true);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
                <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
                    <View style={styles.header}>
                        <ThemedText type="default" style={styles.headerTitle}>Transação</ThemedText>
                        <TouchableOpacity onPress={onClose} disabled={isLoading}>
                            <ThemedText style={styles.closeButton}>✕</ThemedText>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Valor com Switch - Layout Horizontal */}
                        <View style={styles.amountSection}>
                            <View style={styles.amountWithSwitchContainer}>
                                {/* Switch Compacto */}
                                <View style={styles.compactSwitchContainer}>
                                    <ThemedText type="small" style={[styles.switchLabel, { color: isIncome ? colors.success : colors.danger }]}>
                                        {isIncome ? '+' : '−'}
                                    </ThemedText>
                                    <Switch
                                        value={isIncome}
                                        onValueChange={setIsIncome}
                                        disabled={isLoading}
                                        trackColor={{ false: colors.danger, true: colors.success }}
                                        thumbColor={isIncome ? colors.success : colors.danger}
                                        style={styles.compactSwitch}
                                    />
                                </View>

                                {/* Valor Grande */}
                                <View
                                    style={[
                                        styles.amountInputContainer,
                                        {
                                            borderColor: colors.border,
                                            backgroundColor: colors.backgroundElement,
                                        },
                                    ]}
                                >
                                    <ThemedText type="default" style={styles.currencySymbol}>
                                        R$
                                    </ThemedText>
                                    <TextInput
                                        style={[
                                            styles.largeAmountInput,
                                            {
                                                color: isIncome ? colors.success : colors.danger,
                                            },
                                        ]}
                                        value={amount}
                                        onChangeText={handleAmountChange}
                                        placeholder="0,00"
                                        placeholderTextColor={colors.textSecondary}
                                        keyboardType="decimal-pad"
                                        editable={!isLoading}
                                        maxLength={15}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Título */}
                        <View style={styles.section}>
                            <ThemedText type="default" style={styles.label}>
                                Título
                            </ThemedText>
                            <TextInput
                                style={[
                                    styles.titleInput,
                                    {
                                        color: colors.text,
                                        borderColor: colors.border,
                                        backgroundColor: colors.backgroundElement,
                                    },
                                ]}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Ex: Salário, Supermercado..."
                                placeholderTextColor={colors.textSecondary}
                                editable={!isLoading}
                                maxLength={50}
                            />
                        </View>

                        {/* Data */}
                        <View style={styles.section}>
                            <ThemedText type="default" style={styles.label}>
                                Data
                            </ThemedText>
                            <View style={styles.dateContainer}>
                                <TouchableOpacity
                                    style={[styles.dateButton, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}
                                    onPress={() => handleDateChange(-1)}
                                    disabled={isLoading}
                                >
                                    <ThemedText style={styles.dateButtonText}>−</ThemedText>
                                </TouchableOpacity>
                                <TextInput
                                    style={[
                                        styles.dateInput,
                                        {
                                            color: colors.text,
                                            borderColor: colors.border,
                                            backgroundColor: colors.backgroundElement,
                                        },
                                    ]}
                                    value={formatDateDisplay(date)}
                                    onChangeText={(text) => {
                                        if (text.length === 10) {
                                            const parsed = parseDateDisplay(text);
                                            if (!isNaN(new Date(parsed).getTime())) {
                                                setDate(parsed);
                                            }
                                        }
                                    }}
                                    placeholder="dd/mm/AAAA"
                                    editable={!isLoading}
                                    maxLength={10}
                                />
                                <TouchableOpacity
                                    style={[styles.dateButton, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}
                                    onPress={() => handleDateChange(1)}
                                    disabled={isLoading}
                                >
                                    <ThemedText style={styles.dateButtonText}>+</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.cancelButton,
                                { borderColor: colors.border },
                            ]}
                            onPress={onClose}
                            disabled={isLoading}
                        >
                            <ThemedText type="default" style={styles.cancelButtonText}>
                                Cancelar
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.confirmButton,
                                {
                                    backgroundColor: isIncome ? colors.success : colors.danger,
                                },
                            ]}
                            onPress={handleAddTransaction}
                            disabled={isLoading || !amount}
                        >
                            <ThemedText type="default" style={styles.confirmButtonText}>
                                {isLoading ? 'Adicionando...' : 'Adicionar'}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </ThemedView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 16,
        maxHeight: '90%',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    closeButton: {
        fontSize: 24,
        fontWeight: '600',
    },
    content: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    amountSection: {
        marginBottom: 32,
    },
    amountWithSwitchContainer: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    compactSwitchContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        flexDirection: 'column',
    },
    compactSwitch: {
        transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    },
    switchLabel: {
        fontWeight: '800',
        fontSize: 28,
    },
    amountLabel: {
        marginBottom: 12,
        fontWeight: '600',
    },
    amountInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        overflow: 'hidden',
    },
    currencySymbol: {
        marginRight: 8,
        fontWeight: '600',
    },
    largeAmountInput: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 32,
        fontWeight: '700',
        maxWidth: '100%',
    },
    titleInput: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        fontSize: 16,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        marginBottom: 8,
        fontWeight: '600',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    dateContainer: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    dateButton: {
        width: 44,
        height: 44,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateButtonText: {
        fontSize: 20,
        fontWeight: '600',
    },
    dateInput: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        fontSize: 16,
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        borderWidth: 1,
    },
    confirmButton: {
        paddingVertical: 12,
    },
    cancelButtonText: {
        fontWeight: '600',
    },
    confirmButtonText: {
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
