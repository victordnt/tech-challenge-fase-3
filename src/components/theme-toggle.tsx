import { useAppContext } from '@/contexts/app-context';
import { useTheme } from '@/hooks/use-theme';
import { StyleSheet, Switch, View } from 'react-native';
import { ThemedText } from './themed-text';

export function ThemeToggle() {
    const { theme, setTheme } = useAppContext();
    const themeObj = useTheme();
    const isDark = theme === 'dark';

    const handleToggle = async (value: boolean) => {
        await setTheme(value ? 'dark' : 'light');
    };

    return (
        <View style={[styles.container, { backgroundColor: themeObj.backgroundElement, borderColor: themeObj.border }]}>
            <ThemedText style={{ fontSize: 16 }}>🌙</ThemedText>
            <Switch
                trackColor={{ false: themeObj.textSecondary, true: themeObj.neon || themeObj.lilac || '#A855F7' }}
                thumbColor={isDark ? themeObj.neon || '#A855F7' : themeObj.lilac || '#C084FC'}
                ios_backgroundColor={themeObj.backgroundSelected}
                value={isDark}
                onValueChange={handleToggle}
            />
            <ThemedText style={{ fontSize: 16 }}>☀️</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
});
