import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/features/UserProfile/contexts/auth-context';

export default function ProfileScreen() {
    const colorScheme = useColorScheme();
    const validColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[validColorScheme];
    const { signOut } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        Alert.alert(
            'Sair',
            'Tem certeza que deseja sair da sua conta?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Sair',
                    onPress: async () => {
                        try {
                            await signOut();
                            router.replace('/login');
                        } catch (error) {
                            const errorMessage = error instanceof Error ? error.message : 'Erro ao sair';
                            Alert.alert('Erro', errorMessage);
                        }
                    },
                    style: 'destructive',
                },
            ],
        );
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['left', 'right']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText type="title">Perfil & Configurações</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                       Gerencie as preferências da sua conta Mavi Finance
                    </ThemedText>
                </View>

                    {/* Sair da Conta */}
                    <TouchableOpacity 
                        onPress={handleLogout}
                        style={[styles.optionItem, { backgroundColor: colors.backgroundElement }]}
                    >
                        <View style={styles.optionLeft}>
                            <View style={[styles.optionIconContainer, { backgroundColor: colors.danger + '20' }]}>
                                <SymbolView name={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }} size={18} tintColor={colors.danger} />
                            </View>
                            <ThemedText type="default" style={{ color: colors.danger, fontWeight: '600' }}>Sair da Conta</ThemedText>
                        </View>
                        <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={14} tintColor={colors.textSecondary} />
                    </TouchableOpacity>
        
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 120,
        gap: 20,
    },
    header: {
        gap: 4,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    optionIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
