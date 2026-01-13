import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Image,
    StyleProp, // Import thêm StyleProp
    StyleSheet,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewStyle
} from 'react-native';
import theme from '../../theme';
import AppText from './AppText';

interface AppButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'google' | 'link' | 'outline';
    isLoading?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    iconRight?: boolean;
    // SỬA LỖI Ở ĐÂY: Cho phép nhận mảng style (StyleProp) thay vì chỉ ViewStyle đơn lẻ
    style?: StyleProp<ViewStyle>;
}

const AppButton: React.FC<AppButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    isLoading = false,
    icon,
    iconRight = false,
    disabled,
    style,
    ...props
}) => {
    const isDisabled = disabled || isLoading;

    const getBackgroundColor = () => {
        if (isDisabled && variant !== 'link') return theme.colors.cardBackground;
        if (variant === 'primary') return theme.colors.primary;
        if (variant === 'google' || variant === 'outline') return theme.colors.text.white;
        return 'transparent';
    };

    const getTextColor = () => {
        if (isDisabled) return theme.colors.text.secondary;
        if (variant === 'google' || variant === 'outline') return theme.colors.text.black;
        if (variant === 'link') return theme.colors.primary;
        return theme.colors.text.white;
    };

    const renderIcon = (position: 'left' | 'right') => {
        if (variant === 'google' && position === 'left') {
            return (
                <Image
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }}
                    style={[styles.googleIcon, styles.absoluteIconLeft]}
                />
            );
        }

        if (icon && variant !== 'google') {
            const isPositionMatch = (position === 'left' && !iconRight) || (position === 'right' && iconRight);

            if (isPositionMatch) {
                return (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={getTextColor()}
                        style={[
                            styles.icon,
                            position === 'left' ? styles.absoluteIconLeft : styles.absoluteIconRight
                        ]}
                    />
                );
            }
        }
        return null;
    };

    const renderContent = () => {
        if (isLoading) {
            return <ActivityIndicator size="small" color={getTextColor()} />;
        }
        return (
            <View style={styles.contentWrapper}>
                {renderIcon('left')}

                <AppText
                    weight="bold"
                    size="sm"
                    color={getTextColor()}
                    style={variant !== 'link' ? { textAlign: 'center' } : undefined}
                >
                    {title}
                </AppText>

                {renderIcon('right')}
            </View>
        );
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.7}
            style={[
                styles.container,
                {
                    backgroundColor: getBackgroundColor(),
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: variant === 'link' ? 0 : theme.spacing.md,
                    borderRadius: 30,
                    borderColor: (variant === 'google' || variant === 'outline') ? theme.colors.border : 'transparent',
                    borderWidth: (variant === 'google' || variant === 'outline') ? 1 : 0,
                },
                variant === 'link' && styles.linkContainer,
                style, // Style truyền từ ngoài sẽ được ưu tiên ghi đè ở đây
            ]}
            {...props}
        >
            {renderContent()}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
    },
    contentWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        position: 'relative',
    },
    linkContainer: {
        width: 'auto',
        marginBottom: 0,
        marginTop: theme.spacing.sm,
        paddingHorizontal: 0,
    },
    absoluteIconLeft: {
        position: 'absolute',
        left: 0,
    },
    absoluteIconRight: {
        position: 'absolute',
        right: 0,
    },
    icon: {},
    googleIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
});

export default AppButton;