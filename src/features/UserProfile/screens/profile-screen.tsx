import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/features/UserProfile/contexts/auth-context';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

export default function ProfileScreen() {
    const colorScheme = useColorScheme();
    const validColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[validColorScheme];
    const { user, signOut } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        Alert.alert(
            'Sair',
            'Tem certeza que deseja sair da sua conta?',
            [
                { text: 'Cancelar', style: 'cancel' },
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

    const getInitial = (email: string | null | undefined) => {
        return email ? email.charAt(0).toUpperCase() : 'U';
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

                {/* Profile Card */}
                <AnimatedView 
                    entering={FadeInDown.duration(400).delay(100)} 
                    style={[styles.profileCard, { backgroundColor: colors.backgroundElement }]}
                >
                    <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
                        <ThemedText style={[styles.avatarText, { color: colors.primary }]}>
                            {getInitial(user?.email)}
                        </ThemedText>
                    </View>
                    <View style={styles.profileInfo}>
                        <ThemedText type="default" style={styles.profileName}>
                            Usuário Mavi
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                            {user?.email || 'usuario@email.com'}
                        </ThemedText>
                    </View>
                    <TouchableOpacity style={styles.editButton}>
                        <SymbolView name={{ ios: 'pencil', android: 'edit', web: 'edit' }} size={20} tintColor={colors.primary} />
                    </TouchableOpacity>
                </AnimatedView>

                {/* Settings Group */}
                <AnimatedView entering={FadeInDown.duration(400).delay(200)} style={styles.settingsGroup}>
                    <ThemedText type="small" style={styles.groupTitle}>Preferências</ThemedText>
                    
                    <TouchableOpacity style={[styles.optionItem, { backgroundColor: colors.backgroundElement }]}>
                        <View style={styles.optionLeft}>
                            <View style={[styles.optionIconContainer, { backgroundColor: colors.primary + '15' }]}>
                                <SymbolView name={{ ios: 'moon.fill', android: 'dark_mode', web: 'dark_mode' }} size={18} tintColor={colors.primary} />
                            </View>
                            <ThemedText type="default" style={styles.optionText}>Tema do Aplicativo</ThemedText>
                        </View>
                        <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={14} tintColor={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.optionItem, { backgroundColor: colors.backgroundElement, marginTop: 8 }]}>
                        <View style={styles.optionLeft}>
                            <View style={[styles.optionIconContainer, { backgroundColor: colors.primary + '15' }]}>
                                <SymbolView name={{ ios: 'bell.fill', android: 'notifications', web: 'notifications' }} size={18} tintColor={colors.primary} />
                            </View>
                            <ThemedText type="default" style={styles.optionText}>Notificações</ThemedText>
                        </View>
                        <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={14} tintColor={colors.textSecondary} />
                    </TouchableOpacity>
                </AnimatedView>

                <AnimatedView entering={FadeInDown.duration(400).delay(300)} style={styles.settingsGroup}>
                    <ThemedText type="small" style={styles.groupTitle}>Segurança</ThemedText>
                    
                    <TouchableOpacity style={[styles.optionItem, { backgroundColor: colors.backgroundElement }]}>
                        <View style={styles.optionLeft}>
                            <View style={[styles.optionIconContainer, { backgroundColor: colors.primary + '15' }]}>
                                <SymbolView name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }} size={18} tintColor={colors.primary} />
                            </View>
                            <ThemedText type="default" style={styles.optionText}>Privacidade e Segurança</ThemedText>
                        </View>
                        <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={14} tintColor={colors.textSecondary} />
                    </TouchableOpacity>
                </AnimatedView>

                {/* Sair da Conta */}
                <AnimatedTouchableOpacity 
                    entering={FadeInDown.duration(400).delay(400)}
                    onPress={handleLogout}
                    style={[styles.optionItem, { backgroundColor: colors.backgroundElement, marginTop: 12 }]}
                >
                    <View style={styles.optionLeft}>
                        <View style={[styles.optionIconContainer, { backgroundColor: colors.danger + '20' }]}>
                            <SymbolView name={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }} size={18} tintColor={colors.danger} />
                        </View>
                        <ThemedText type="default" style={{ color: colors.danger, fontWeight: '600' }}>Sair da Conta</ThemedText>
                    </View>
                </AnimatedTouchableOpacity>
        
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
        gap: 24,
    },
    header: {
        gap: 4,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        gap: 16,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
    },
    profileInfo: {
        flex: 1,
        gap: 4,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '700',
    },
    editButton: {
        padding: 8,
    },
    settingsGroup: {
        gap: 8,
    },
    groupTitle: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
        paddingLeft: 4,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
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
    optionText: {
        fontWeight: '500',
    },
});
