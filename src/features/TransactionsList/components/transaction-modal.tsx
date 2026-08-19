import { useAuth } from '@/features/UserProfile/contexts/auth-context';
import { useTransactions } from '@/features/TransactionsList/contexts/transactions-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import type { Transaction } from '@/features/TransactionsList/types/finance';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
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

interface TransactionModalProps {
    visible: boolean;
    onClose: () => void;
    editingTransaction?: Transaction | null;
}

export function TransactionModal({ visible, onClose, editingTransaction }: TransactionModalProps) {
    const theme = useTheme();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { addTransaction, updateTransaction, transactions } = useTransactions();
    const { user } = useAuth();

    const [type, setType] = useState<'income' | 'expense'>('income');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [photo, setPhoto] = useState<string | null>(null);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const neonColor = isDark ? (theme.neon || '#A855F7') : (theme.lilac || '#C084FC');

    const resetForm = () => {
        setType('income');
        setAmount('');
        setCategory('');
        setDescription('');
        setPhoto(null);
    };

    // Inicializar campos ao abrir ou ao editar uma transação
    useEffect(() => {
        if (editingTransaction) {
            const timer = setTimeout(() => {
                setType(editingTransaction.type as 'income' | 'expense');
                setAmount(editingTransaction.amount.toString());
                setCategory(editingTransaction.category);
                setDescription(editingTransaction.description);
                setPhoto(editingTransaction.receipt?.url || null);
            }, 0);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => {
                resetForm();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [editingTransaction, visible]);

    // Extrair categorias únicas existentes
    const existingCategories = Array.from(new Set(transactions.map((t) => t.category)))
        .filter((cat) => cat.toLowerCase() !== category.toLowerCase());

    const handleSubmit = async () => {
        if (!user) {
            Alert.alert('Erro', 'Usuário não autenticado');
            return;
        }

        if (!amount || isNaN(parseFloat(amount))) {
            Alert.alert('Erro', 'Por favor, insira um valor válido');
            return;
        }

        if (!category.trim()) {
            Alert.alert('Erro', 'Por favor, insira uma categoria');
            return;
        }

        if (!description.trim()) {
            Alert.alert('Erro', 'A descrição é obrigatória');
            return;
        }

        try {
            setIsSaving(true);
            const timestamp = `${Date.now()}`;
            const randomPart = Math.random().toString(36).substr(2, 9);
            const receiptId = `receipt-${timestamp}-${randomPart}`;
            const isoDate = new Date().toISOString();
            const dateStr = isoDate.split('T')[0];

            const transactionData = {
                type,
                amount: parseFloat(amount),
                category: category.trim(),
                description: description.trim(),
                date: editingTransaction?.date || dateStr,
                receipt: photo
                    ? {
                        id: editingTransaction?.receipt?.id || receiptId,
                        url: photo,
                        fileName: 'transaction-photo',
                        uploadedAt: editingTransaction?.receipt?.uploadedAt || isoDate,
                    }
                    : null,
            };

            if (editingTransaction) {
                // Modo edição
                await updateTransaction(editingTransaction.id, transactionData);
                Alert.alert('Sucesso', 'Transação atualizada com sucesso!');
            } else {
                // Modo adição
                await addTransaction(transactionData);
                Alert.alert('Sucesso', 'Transação adicionada com sucesso!');
            }

            resetForm();
            onClose();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar transação';
            Alert.alert('Erro', errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    if (!visible) return null;

    return (
        <>
            <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
                <TouchableOpacity
                    style={[styles.overlay]}
                    activeOpacity={1}
                    onPress={onClose}
                >
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                        <TouchableOpacity activeOpacity={1} onPress={() => { }}>
                            <ScrollView
                                style={styles.scrollView}
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                            >
                                <ThemedView style={[styles.modalContent, { backgroundColor: theme.backgroundElement }]}>
                                    {/* Header com X */}
                                    <View style={styles.header}>
                                        <ThemedText type="title" style={styles.title}>
                                            Nova Transação
                                        </ThemedText>
                                        <TouchableOpacity onPress={onClose} style={styles.closeButton} disabled={isSaving}>
                                            <ThemedText style={{ fontSize: 28, fontWeight: 'bold', opacity: isSaving ? 0.5 : 1 }}>
                                                ×
                                            </ThemedText>
                                        </TouchableOpacity>
                                    </View>

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
                                                    borderColor: neonColor,
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

                                    {/* Categoria */}
                                    <View style={styles.section}>
                                        <ThemedText type="small" style={styles.sectionLabel}>Categoria</ThemedText>
                                        <TouchableOpacity
                                            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                            disabled={isSaving}
                                            style={[
                                                styles.dropdownButton,
                                                {
                                                    backgroundColor: theme.backgroundSelected,
                                                    borderColor: neonColor,
                                                    opacity: isSaving ? 0.5 : 1,
                                                },
                                            ]}
                                        >
                                            <ThemedText>{category || 'Selecionar ou digitar categoria...'}</ThemedText>
                                        </TouchableOpacity>
                                        {showCategoryDropdown && existingCategories.length > 0 && (
                                            <View
                                                style={[
                                                    styles.dropdown,
                                                    { backgroundColor: theme.backgroundElement, borderColor: neonColor },
                                                ]}
                                            >
                                                <FlatList
                                                    data={existingCategories}
                                                    scrollEnabled={false}
                                                    renderItem={({ item: cat }) => (
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                setCategory(cat);
                                                                setShowCategoryDropdown(false);
                                                            }}
                                                            style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                                                        >
                                                            <ThemedText>{cat}</ThemedText>
                                                        </TouchableOpacity>
                                                    )}
                                                    keyExtractor={(item) => item}
                                                />
                                            </View>
                                        )}
                                        <TextInput
                                            style={[
                                                styles.input,
                                                {
                                                    backgroundColor: theme.backgroundSelected,
                                                    color: theme.text,
                                                    borderColor: neonColor,
                                                    opacity: isSaving ? 0.5 : 1,
                                                },
                                            ]}
                                            placeholder="Digite uma categoria"
                                            placeholderTextColor={theme.textSecondary}
                                            value={category}
                                            onChangeText={(text) => {
                                                setCategory(text);
                                                setShowCategoryDropdown(text.length > 0 && existingCategories.length > 0);
                                            }}
                                            editable={!isSaving}
                                        />
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
                            </ScrollView>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </TouchableOpacity>
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    scrollView: {
        maxHeight: 600,
        width: '100%',
    },
    scrollContent: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    modalContent: {
        width: '90%',
        maxWidth: 500,
        borderRadius: 16,
        padding: 24,
        gap: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
    },
    section: {
        gap: 8,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    input: {
        borderWidth: 2,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
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
        borderWidth: 2,
        alignItems: 'center',
    },
    dropdownButton: {
        borderWidth: 2,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    dropdown: {
        borderWidth: 2,
        borderRadius: 8,
        marginBottom: 8,
        overflow: 'hidden',
        maxHeight: 120,
    },
    dropdownItem: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
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
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButton: {},
});
