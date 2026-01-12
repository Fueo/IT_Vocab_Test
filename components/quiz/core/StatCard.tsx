import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import theme from '../../../theme';
import { AppText } from '../../core';

interface StatCardProps {
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, iconColor }) => {
    return (
        <View style={styles.container}>
            <Ionicons name={icon} size={24} color={iconColor} style={{ marginBottom: 8 }} />
            <AppText size="xl" weight="bold" color={theme.colors.text.primary} style={{ marginBottom: 4 }}>
                {value}
            </AppText>
            <AppText size="xs" color={theme.colors.text.secondary}>
                {label}
            </AppText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, // Để chia đều 2 cột
        backgroundColor: 'white',
        borderRadius: 16,
        padding: theme.spacing.md,
        alignItems: 'center',
        marginHorizontal: theme.spacing.xs,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    }
});

export default StatCard;