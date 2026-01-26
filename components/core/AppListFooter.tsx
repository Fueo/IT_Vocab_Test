import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import theme from '../../theme';
import AppText from './AppText';

interface AppListFooterProps {
    isLoadingMore?: boolean;
    hasMore?: boolean;
    dataLength?: number;
}

const AppListFooter: React.FC<AppListFooterProps> = ({
    isLoadingMore = false,
    hasMore = true,
    dataLength = 0,
}) => {
    // Nếu không có dữ liệu thì không hiện footer
    if (dataLength === 0) return null;

    return (
        <View style={styles.container}>
            {isLoadingMore ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
                !hasMore && (
                    <AppText size="xs" color={theme.colors.text.secondary} style={styles.endText}>
                        — Hết danh sách —
                    </AppText>
                )
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: theme.spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 60,
    },
    endText: {
        opacity: 0.6,
        letterSpacing: 1,
    },
});

export default AppListFooter;