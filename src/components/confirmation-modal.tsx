import { Colors } from '@/constants/theme';
import {
    Modal,
    Platform,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface ConfirmationModalProps {
    visible: boolean;
    title: string;
    message: string;
    cancelText?: string;
    confirmText?: string;
    onCancel: () => void;
    onConfirm: () => void;
    isDangerous?: boolean;
    isLoading?: boolean;
}

export function ConfirmationModal({
    visible,
    title,
    message,
    cancelText = 'Cancelar',
    confirmText = 'Confirmar',
    onCancel,
    onConfirm,
    isDangerous = false,
    isLoading = false,
}: ConfirmationModalProps) {
    const colorScheme = useColorScheme();
    const validColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[validColorScheme];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <ThemedView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <ThemedText type="title" style={styles.modalTitle}>
                        {title}
                    </ThemedText>
                    <ThemedText type="default" style={styles.modalMessage} themeColor="textSecondary">
                        {message}
                    </ThemedText>

                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.cancelButton,
                                { borderColor: colors.border },
                            ]}
                            onPress={onCancel}
                            disabled={isLoading}
                            activeOpacity={0.7}
                        >
                            <ThemedText type="default" style={styles.cancelButtonText}>
                                {cancelText}
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.confirmButton,
                                {
                                    backgroundColor: isDangerous ? colors.danger : colors.primary,
                                },
                            ]}
                            onPress={onConfirm}
                            disabled={isLoading}
                            activeOpacity={0.7}
                        >
                            <ThemedText
                                type="default"
                                style={[
                                    styles.confirmButtonText,
                                    { color: '#FFFFFF' },
                                ]}
                            >
                                {isLoading ? 'Carregando...' : confirmText}
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    modalContainer: {
        borderRadius: 12,
        padding: 24,
        width: '100%',
        maxWidth: 320,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    modalTitle: {
        marginBottom: 12,
        textAlign: 'center',
    },
    modalMessage: {
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 20,
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
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
    },
});
