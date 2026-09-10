import { useAuth } from '@/features/UserProfile/contexts/auth-context';
import { useTransactions } from '@/features/TransactionsList/contexts/transactions-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import type { Receipt, Transaction } from '@/features/TransactionsList/types/finance';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { PhotoPicker } from '@/features/TransactionsList/components/photo-picker';
import { PhotoPreviewModal } from '@/features/TransactionsList/components/photo-preview-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import { FIXED_CATEGORIES } from '@/features/TransactionsList/constants/categories';
import { SymbolView } from 'expo-symbols';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { deleteReceipt, uploadReceipt } from '@/services/firebase/storage-service';

interface TransactionModalProps {
    visible: boolean;
    onClose: () => void;
    editingTransaction?: Transaction | null;
}

export function TransactionModal({ visible, onClose, editingTransaction }: TransactionModalProps) {
    const theme = useTheme();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { addTransaction, updateTransaction } = useTransactions();
    const { user } = useAuth();

    const [type, setType] = useState<'income' | 'expense'>('income');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<string>(FIXED_CATEGORIES[0]);
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [photo, setPhoto] = useState<string | null>(null);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const neonColor = isDark ? (theme.neon || '#A855F7') : (theme.lilac || '#C084FC');

    const resetForm = () => {
        setFormError(null);
        setType('income');
        setAmount('');
        setCategory(FIXED_CATEGORIES[0]);
        setDescription('');
        setDate(new Date().toISOString().slice(0, 10));
        setPhoto(null);
        setShowCategoryDropdown(false);
    };

    // Inicializar campos ao abrir ou ao editar uma transação
    useEffect(() => {
        if (editingTransaction) {
            const timer = setTimeout(() => {
                setType(editingTransaction.type as 'income' | 'expense');
                setAmount(editingTransaction.amount.toString());
                setCategory(editingTransaction.category || FIXED_CATEGORIES[0]);
                setDescription(editingTransaction.description);
                setDate(editingTransaction.date.slice(0, 10));
                setPhoto(editingTransaction.receipt?.url || null);
                setShowCategoryDropdown(false);
            }, 0);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => {
                resetForm();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [editingTransaction, visible]);

    const handleSubmit = async () => {
        if (!user) {
            setFormError('Usuário não autenticado');
            return;
        }

        if (!amount || isNaN(parseFloat(amount))) {
            setFormError('Por favor, insira um valor válido');
            return;
        }

        const parsedAmount = Number(amount.replace(',', '.'));
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            setFormError('O valor deve ser maior que zero');
            return;
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(`${date}T12:00:00`).getTime())) {
            setFormError('Informe uma data válida no formato AAAA-MM-DD');
            return;
        }

        if (!category.trim()) {
            setFormError('Por favor, selecione uma categoria');
            return;
        }

        try {
            setFormError(null);
            setIsSaving(true);
            const timestamp = `${Date.now()}`;
            const randomPart = Math.random().toString(36).substr(2, 9);
            const receiptId = `receipt-${timestamp}-${randomPart}`;
            const finalDescription = description.trim() || category.trim();
            const existingReceipt = editingTransaction?.receipt || null;
            const photoChanged = Boolean(photo && photo !== existingReceipt?.url);
            let nextReceipt: Receipt | null = existingReceipt;

            if (photoChanged && photo) {
                nextReceipt = await uploadReceipt(user.uid, photo, receiptId);
            } else if (!photo) {
                nextReceipt = null;
            }

            const transactionData = {
                type,
                amount: parsedAmount,
                category: category.trim(),
                description: finalDescription,
                date,
                receipt: nextReceipt,
            };

            try {
                if (editingTransaction) {
                    await updateTransaction(editingTransaction.id, transactionData);
                    if (existingReceipt?.storagePath && existingReceipt.storagePath !== nextReceipt?.storagePath) {
                        await deleteReceipt(existingReceipt.storagePath).catch(() => undefined);
                    }
                } else {
                    await addTransaction(transactionData);
                }
            } catch (saveError) {
                if (photoChanged && nextReceipt?.storagePath) await deleteReceipt(nextReceipt.storagePath).catch(() => undefined);
                throw saveError;
            }

            resetForm();
            onClose();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar transação';
            setFormError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    if (!visible) return null;

    return (
        <>
            <Modal visible={visible} animationType="fade" transparent onRequestClose={() => { if (!isSaving) onClose(); }}>
                <View style={styles.overlay}>
                    <Pressable accessibilityLabel="Fechar transação" style={StyleSheet.absoluteFill} onPress={() => { if (!isSaving) onClose(); }} />
                    <KeyboardAvoidingView style={styles.sheet} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                        <View style={{ width: '100%', flexShrink: 1 }}>
                            <ScrollView
                                keyboardShouldPersistTaps="handled" style={styles.scrollView}
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                            >
                                <Animated.View style={{ width: '100%' }} entering={SlideInDown.duration(400).springify()} exiting={SlideOutDown.duration(300)}>
                                    <ThemedView style={[styles.modalContent, { backgroundColor: theme.backgroundElement }]}>
                                        {/* Header com X */}
                                    <View style={styles.header}>
                                        <ThemedText type="title" style={styles.title}>
                                            {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
                                        </ThemedText>
                                        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Fechar" onPress={onClose} style={styles.closeButton} disabled={isSaving}>
                                            <ThemedText style={{ fontSize: 28, fontWeight: 'bold', opacity: isSaving ? 0.5 : 1 }}>
                                                ×
                                            </ThemedText>
                                        </TouchableOpacity>
                                    </View>

                                    {formError ? <ThemedText accessibilityRole="alert" style={{ color: theme.danger }}>{formError}</ThemedText> : null}
                                    {/* Tipo de Transação */}
                                    <View style={styles.section}>
                                        <ThemedText type="small" style={styles.sectionLabel}>Tipo</ThemedText>
                                        <View style={[styles.typeButtons, { gap: 12 }]}>
                                            <TouchableOpacity
                                                onPress={() => setType('income')}
                                                disabled={isSaving}
                                                style={[
                                                    styles.typeButton,
                                                    {
                                                        backgroundColor: type === 'income' ? theme.success : theme.backgroundSelected,
                                                        borderColor: theme.success,
                                                        opacity: isSaving ? 0.5 : 1,
                                                    },
                                                ]}
                                            >
                                                <ThemedText style={{ color: type === 'income' ? '#FFF' : theme.text, fontWeight: '600' }}>
                                                    📥 Entrada
                                                </ThemedText>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => setType('expense')}
                                                disabled={isSaving}
                                                style={[
                                                    styles.typeButton,
                                                    {
                                                        backgroundColor: type === 'expense' ? theme.danger : theme.backgroundSelected,
                                                        borderColor: theme.danger,
                                                        opacity: isSaving ? 0.5 : 1,
                                                    },
                                                ]}
                                            >
                                                <ThemedText style={{ color: type === 'expense' ? '#FFF' : theme.text, fontWeight: '600' }}>
                                                    📤 Saída
                                                </ThemedText>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Valor */}
                                    <View style={styles.section}>
                                        <ThemedText type="small" style={styles.sectionLabel}>Valor (R$)</ThemedText>
                                        <TextInput
                                            style={[
                                                styles.input,
                                                {
                                                    backgroundColor: theme.backgroundSelected,
                                                    color: theme.text,
                                                    borderColor: theme.border,
                                                    opacity: isSaving ? 0.5 : 1,
                                                },
                                            ]}
                                            placeholder="0.00"
                                            placeholderTextColor={theme.textSecondary}
                                            value={amount}
                                            onChangeText={setAmount}
                                            keyboardType="decimal-pad"
                                            editable={!isSaving}
                                        />
                                    </View>

                                    <View style={styles.section}>
                                        <ThemedText type="small" style={styles.sectionLabel}>Data</ThemedText>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: theme.backgroundSelected, color: theme.text, borderColor: neonColor }]}
                                            placeholder="AAAA-MM-DD"
                                            placeholderTextColor={theme.textSecondary}
                                            value={date}
                                            onChangeText={setDate}
                                            maxLength={10}
                                            editable={!isSaving}
                                        />
                                    </View>

                                    {/* Categoria (Select com Opções Fixas) */}
                                    <View style={styles.section}>
                                        <ThemedText type="small" style={styles.sectionLabel}>Categoria</ThemedText>
                                        <TouchableOpacity
                                            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                            disabled={isSaving}
                                            activeOpacity={0.8}
                                            style={[
                                                styles.selectButton,
                                                {
                                                    backgroundColor: theme.backgroundSelected,
                                                    borderColor: showCategoryDropdown ? neonColor : neonColor,
                                                    opacity: isSaving ? 0.5 : 1,
                                                },
                                            ]}
                                        >
                                            <ThemedText style={{ color: category ? theme.text : theme.textSecondary, fontWeight: '500' }}>
                                                {category || 'Selecione uma categoria'}
                                            </ThemedText>
                                            <SymbolView
                                                name={{ ios: 'chevron.down', android: 'arrow_drop_down', web: 'arrow_drop_down' }}
                                                size={18}
                                                tintColor={theme.textSecondary}
                                            />
                                        </TouchableOpacity>

                                        {showCategoryDropdown && (
                                            <View
                                                style={[
                                                    styles.dropdownContainer,
                                                    { backgroundColor: theme.backgroundElement, borderColor: neonColor },
                                                ]}
                                            >
                                                <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled showsVerticalScrollIndicator>
                                                    {FIXED_CATEGORIES.map((cat, idx) => {
                                                        const isSelected = category === cat;
                                                        return (
                                                            <TouchableOpacity
                                                                key={cat}
                                                                onPress={() => {
                                                                    setCategory(cat);
                                                                    setShowCategoryDropdown(false);
                                                                }}
                                                                activeOpacity={0.7}
                                                                style={[
                                                                    styles.dropdownOption,
                                                                    {
                                                                        backgroundColor: isSelected ? 'rgba(138, 86, 255, 0.15)' : 'transparent',
                                                                        borderBottomWidth: idx < FIXED_CATEGORIES.length - 1 ? 1 : 0,
                                                                        borderBottomColor: theme.border,
                                                                    },
                                                                ]}
                                                            >
                                                                <ThemedText style={{ color: isSelected ? neonColor : theme.text, fontWeight: isSelected ? '600' : '400' }}>
                                                                    {cat}
                                                                </ThemedText>
                                                                {isSelected && (
                                                                    <ThemedText style={{ color: neonColor, fontWeight: 'bold' }}>✓</ThemedText>
                                                                )}
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </ScrollView>
                                            </View>
                                        )}
                                    </View>

                                    {/* Descrição */}
                                    <View style={styles.section}>
                                        <ThemedText type="small" style={styles.sectionLabel}>Descrição (opcional)</ThemedText>
                                        <TextInput
                                            style={[
                                                styles.input,
                                                styles.descriptionInput,
                                                {
                                                    backgroundColor: theme.backgroundSelected,
                                                    color: theme.text,
                                                    borderColor: neonColor,
                                                    opacity: isSaving ? 0.5 : 1,
                                                },
                                            ]}
                                            placeholder="Adicione detalhes..."
                                            placeholderTextColor={theme.textSecondary}
                                            value={description}
                                            onChangeText={setDescription}
                                            multiline
                                            numberOfLines={3}
                                            editable={!isSaving}
                                        />
                                    </View>

                                    {/* Foto */}
                                    <View style={styles.section}>
                                        <ThemedText type="small" style={styles.sectionLabel}>Foto (opcional)</ThemedText>
                                        {isSaving ? (
                                            <View style={[styles.photoLoading, { backgroundColor: theme.backgroundSelected }]}>
                                                <ActivityIndicator size="small" color={neonColor} />
                                                <ThemedText type="small">Salvando...</ThemedText>
                                            </View>
                                        ) : (
                                            <PhotoPicker
                                                photo={photo}
                                                onPhotoSelected={setPhoto}
                                                onPhotoRemoved={() => setPhoto(null)}
                                                onPhotoPreview={setPreviewPhoto}
                                            />
                                        )}
                                    </View>

                                    {/* Botões de ação */}
                                    <View style={[styles.actionButtons, { gap: 12 }]}>
                                        <TouchableOpacity
                                            onPress={onClose}
                                            disabled={isSaving}
                                            style={[
                                                styles.button,
                                                { backgroundColor: theme.backgroundSelected, opacity: isSaving ? 0.5 : 1 },
                                            ]}
                                        >
                                            <ThemedText style={{ fontWeight: '600' }}>Cancelar</ThemedText>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={handleSubmit}
                                            disabled={isSaving}
                                            style={[
                                                styles.button,
                                                styles.submitButton,
                                                {
                                                    backgroundColor: neonColor,
                                                    shadowColor: neonColor,
                                                    shadowOpacity: 0.6,
                                                    shadowRadius: 10,
                                                    elevation: 8,
                                                    opacity: isSaving ? 0.7 : 1,
                                                },
                                            ]}
                                        >
                                            {isSaving ? (
                                                <ActivityIndicator size="small" color="#FFF" />
                                            ) : (
                                                <ThemedText style={{ color: '#FFF', fontWeight: '600' }}>Confirmar</ThemedText>
                                            )}
                                        </TouchableOpacity>
                                        </View>
                                    </ThemedView>
                                </Animated.View>
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
            <PhotoPreviewModal
                visible={!!previewPhoto}
                photoUri={previewPhoto}
                onClose={() => setPreviewPhoto(null)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        paddingHorizontal: 12,
        paddingVertical: 24,
    },
    sheet: { width: '100%', maxWidth: 540, maxHeight: '100%', flex: 1, justifyContent: 'center' },
    scrollView: {
        maxHeight: '100%',
        width: '100%',
    },
    scrollContent: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 0,
    },
    modalContent: {
        width: '100%',
        maxWidth: 540,
        borderRadius: 20,
        padding: 20,
        gap: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 20,
        lineHeight: 28,
        flexShrink: 1,
        fontWeight: '700',
    },
    closeButton: {
        padding: 8,
        minWidth: 44,
        minHeight: 44,
        alignItems: 'center',
    },
    section: {
        gap: 8,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
    },
    descriptionInput: {
        paddingVertical: 12,
        textAlignVertical: 'top',
    },
    typeButtons: {
        flexDirection: 'row',
    },
    typeButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    selectButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        minHeight: 52,
    },
    dropdownContainer: {
        borderWidth: 2,
        borderRadius: 8,
        marginTop: 4,
        overflow: 'hidden',
    },
    dropdownOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    photoLoading: {
        borderRadius: 8,
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButton: {},
});
