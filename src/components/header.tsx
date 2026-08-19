import React from 'react';
import { StyleSheet, View, Text, useColorScheme, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

export function AppHeader() {
    const colorScheme = useColorScheme();
    const validColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[validColorScheme];
    const insets = useSafeAreaInsets();

    const brandColor = '#D2BBFF';

    return (
        <View style={[
            styles.container,
            {
                paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 8,
                backgroundColor: colors.background,
                borderBottomColor: colors.border,
                shadowColor: colors.shadow,
            }
        ]}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: brandColor }]}>MAVI</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 1,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            }
        })
    },
    content: {
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    title: {
        fontSize: 16,
        fontWeight: '400',
        letterSpacing: -0.8,
        // Font style rounded or sans if available
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
});
