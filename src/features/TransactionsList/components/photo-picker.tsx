import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface PhotoPickerProps {
    photo: string | null;
    onPhotoSelected: (photo: string) => void;
    onPhotoRemoved: () => void;
    onPhotoPreview?: (photo: string) => void;
}

export function PhotoPicker({ photo, onPhotoSelected, onPhotoRemoved, onPhotoPreview }: PhotoPickerProps) {
    const theme = useTheme();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [loading, setLoading] = useState(false);

    const neonColor = isDark ? (theme.neon || '#A855F7') : (theme.lilac || '#C084FC');

    const pickImage = async () => {
        try {
            setLoading(true);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0].uri) {
                if ((result.assets[0].fileSize || 0) > 5 * 1024 * 1024) {
                    Alert.alert('Arquivo muito grande', 'Selecione uma imagem de até 5 MB.');
                    return;
                }
                onPhotoSelected(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível selecionar a imagem');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const takePhoto = async () => {
        try {
            setLoading(true);
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permissão necessária', 'Autorize o uso da câmera para fotografar o recibo.');
                return;
            }
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0].uri) {
                if ((result.assets[0].fileSize || 0) > 5 * 1024 * 1024) {
                    Alert.alert('Arquivo muito grande', 'Use uma imagem de até 5 MB.');
                    return;
                }
                onPhotoSelected(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível tirar a foto');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.backgroundSelected, borderColor: neonColor }]}>
                <ActivityIndicator size="large" color={neonColor} />
            </View>
        );
    }

    if (photo) {
        return (
            <View style={styles.previewContainer}>
                <TouchableOpacity
                    style={[styles.previewImage, { backgroundColor: theme.backgroundSelected }]}
                    onPress={() => onPhotoPreview?.(photo)}
                >
                    <Image
                        source={{ uri: photo }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onPhotoRemoved}
                    style={[styles.removeButton, { backgroundColor: theme.danger }]}
                >
                    <ThemedText style={{ color: '#FFF', fontWeight: '600' }}>Remover</ThemedText>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.buttonContainer}>
            <TouchableOpacity
                onPress={pickImage}
                style={[
                    styles.photoButton,
                    {
                        backgroundColor: theme.backgroundSelected,
                        borderColor: neonColor,
                    },
                ]}
            >
                <ThemedText style={{ fontSize: 24 }}>📷</ThemedText>
                <ThemedText type="small">Galeria</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={takePhoto}
                style={[
                    styles.photoButton,
                    {
                        backgroundColor: theme.backgroundSelected,
                        borderColor: neonColor,
                    },
                ]}
            >
                <ThemedText style={{ fontSize: 24 }}>📸</ThemedText>
                <ThemedText type="small">Câmera</ThemedText>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    photoButton: {
        flex: 1,
        borderWidth: 2,
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        gap: 8,
    },
    container: {
        borderWidth: 2,
        borderRadius: 8,
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewContainer: {
        gap: 12,
    },
    previewImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    removeButton: {
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
});
