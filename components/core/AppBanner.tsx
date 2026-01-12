import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import theme from '../../theme';
import AppText from './AppText';

type BannerVariant = 'info' | 'success' | 'warning' | 'error';

interface AppBannerProps {
    message: string;
    title?: string; // Ví dụ: "Tip:", "Success:", "Error:"
    variant?: BannerVariant;
    icon?: keyof typeof Ionicons.glyphMap; // Cho phép override icon mặc định
    containerStyle?: ViewStyle;
    visible?: boolean;
}

// Cấu hình màu sắc và icon cho từng loại
const BANNER_CONFIG = {
    info: {
        backgroundColor: '#EFF6FF', // Xanh dương nhạt
        borderColor: '#DBEAFE',
        textColor: '#1E40AF',
        defaultIcon: 'bulb' as const,
        iconColor: '#F59E0B', // Màu vàng cho bóng đèn
    },
    success: {
        backgroundColor: '#DCFCE7', // Xanh lá nhạt
        borderColor: '#BBF7D0',
        textColor: '#15803D',
        defaultIcon: 'checkmark-circle' as const,
        iconColor: '#15803D',
    },
    warning: {
        backgroundColor: '#FEF3C7', // Vàng nhạt
        borderColor: '#FDE68A',
        textColor: '#B45309',
        defaultIcon: 'alert-circle' as const,
        iconColor: '#B45309',
    },
    error: {
        backgroundColor: '#FEE2E2', // Đỏ nhạt
        borderColor: '#FECACA',
        textColor: '#B91C1C',
        defaultIcon: 'close-circle' as const,
        iconColor: '#B91C1C',
    }
};

const AppBanner: React.FC<AppBannerProps> = ({
    message,
    title,
    variant = 'info',
    icon,
    containerStyle,
    visible = true,
}) => {
    if (!visible) return null;

    const config = BANNER_CONFIG[variant];

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: config.backgroundColor,
                borderColor: config.borderColor,
            },
            containerStyle
        ]}>
            <Ionicons
                name={icon || config.defaultIcon}
                size={20}
                color={config.iconColor}
                style={styles.icon}
            />

            <AppText
                size="xs"
                color={config.textColor}
                style={{ flex: 1, lineHeight: 18 }}
            >
                {title && (
                    <AppText size="xs" weight="bold" color={config.textColor}>
                        {title}
                    </AppText>
                )}
                {message}
            </AppText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        alignItems: 'flex-start',
        width: '100%',
    },
    icon: {
        marginRight: theme.spacing.sm,
        marginTop: 1, // Căn chỉnh với dòng text đầu tiên
    }
});

export default AppBanner;