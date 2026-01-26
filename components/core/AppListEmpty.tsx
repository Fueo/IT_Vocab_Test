import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, View, ViewStyle } from 'react-native';
import theme from '../../theme';
import AppText from './AppText';

interface AppListEmptyProps {
    isLoading?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    title?: string;
    description?: string;
    containerStyle?: ViewStyle;
}

const AppListEmpty: React.FC<AppListEmptyProps> = ({
    isLoading = false,
    icon = 'search-outline',
    title = 'No data found',
    description = 'Try changing your filters or search keywords',
    containerStyle,
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <AppText style={styles.loadingText}>Đang tải dữ liệu...</AppText>
                </View>
            ) : (
                <View style={styles.center}>
                    <Ionicons name={icon} size={64} color={theme.colors.border} />
                    <AppText weight="bold" size="md" style={styles.title}>
                        {title}
                    </AppText>
                    <AppText size="sm" color={theme.colors.text.secondary} centered>
                        {description}
                    </AppText>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.huge, // Khoảng cách lớn để căn giữa màn hình
    },
    center: {
        alignItems: 'center',
    },
    loadingText: {
        marginTop: theme.spacing.md,
        color: theme.colors.text.secondary,
    },
    title: {
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.xs,
    },
});

export default AppListEmpty;