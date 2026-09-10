import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Input, InputField, InputSlot, InputIcon, SearchIcon } from '@gluestack-ui/themed';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SearchInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    style?: any;
}

export function SearchInput({ value, onChangeText, placeholder = "Buscar transações...", style }: SearchInputProps) {
    const colors = useTheme();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const inputBgColor = isDark ? '#272A2C' : '#E8EBF5';
    const textAndIconColor = isDark ? '#CCC3D8' : '#6B7280';
    const borderOutlineColor = isDark ? '#6B7280' : '#D1D5DB';

    return (
        <Input
            style={[
                styles.inputWrapper,
                {
                    backgroundColor: inputBgColor,
                    borderColor: borderOutlineColor,
                },
                style
            ]}
            size="md"
        >
            <InputSlot style={styles.iconSlot}>
                <InputIcon 
                    as={SearchIcon} 
                    style={{ color: textAndIconColor }} 
                />
            </InputSlot>
            <InputField
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={textAndIconColor}
                style={[
                    styles.inputField,
                    {
                        color: colors.text,
                    }
                ]}
            />
        </Input>
    );
}

const styles = StyleSheet.create({
    inputWrapper: {
        borderRadius: 12,
        height: 48,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',

    },
    iconSlot: {
        paddingLeft: 14,
        paddingRight: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputField: {
        flex: 1,
        fontSize: 15,
        height: '100%',
        paddingVertical: 0,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
});
