import React from 'react';
import { StyleSheet, ScrollView, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

export default function StatsScreen() {
    const colorScheme = useColorScheme();
    const validColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[validColorScheme];

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['left', 'right']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText type="title">Análises financeiras</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                        Seu panorama financeiro
                    </ThemedText>
                </View>
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
});
