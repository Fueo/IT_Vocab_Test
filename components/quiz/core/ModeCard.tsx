import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '../../../theme';
import { AppText } from '../../core';

interface ModeCardProps {
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    colors: [string, string, ...string[]]; // Màu gradient cho icon box
    onPress: () => void;
}

const ModeCard: React.FC<ModeCardProps> = ({
    title,
    description,
    icon,
    colors,
    onPress
}) => {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* Icon Box with Gradient */}
            <LinearGradient
                colors={colors}
                style={styles.iconBox}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Ionicons name={icon} size={24} color={theme.colors.text.white} />
            </LinearGradient>

            {/* Text Content */}
            <View style={styles.content}>
                <AppText
                    size="md"
                    weight="bold"
                    color={theme.colors.text.primary}
                    style={styles.titleText}
                >
                    {title}
                </AppText>
                <AppText
                    size="xs"
                    color={theme.colors.text.secondary}
                    style={styles.descriptionText}
                >
                    {description}
                </AppText>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: 20, // Giữ nguyên nếu theme.radius.lg là 20
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        // Shadow
        shadowColor: theme.colors.text.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    content: {
        flex: 1,
    },
    titleText: {
        marginBottom: theme.spacing.xs, // Thay 4px bằng theme.spacing.xs
    },
    descriptionText: {
        lineHeight: 18,
    }
});

export default ModeCard;