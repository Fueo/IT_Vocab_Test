import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';
import theme from '../../theme';

interface AppIconButtonProps extends TouchableOpacityProps {
    onPress?: () => void;
    icon?: keyof typeof Ionicons.glyphMap; // Tên icon
    size?: number;      // Kích thước nút (mặc định 30)
    backgroundColor?: string;
    iconColor?: string;
    iconSize?: number;  // Kích thước icon bên trong
    style?: ViewStyle;
}

const AppIconButton: React.FC<AppIconButtonProps> = ({
    onPress,
    icon = 'add', // Mặc định là dấu cộng
    size = 30,    // Mặc định kích thước như cũ
    backgroundColor = theme.colors.primary, // Mặc định màu cam
    iconColor = theme.colors.text.white,
    iconSize,
    style,
    ...props
}) => {
    // Tính toán icon size nếu không truyền vào (thường bằng 60% nút)
    const computedIconSize = iconSize || size * 0.6;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={[
                styles.container,
                {
                    width: size,
                    height: size,
                    backgroundColor: backgroundColor,
                    borderRadius: theme.radius.md, // Bo góc khoảng 8-10px
                },
                style,
            ]}
            {...props}
        >
            <Ionicons
                name={icon}
                size={computedIconSize}
                color={iconColor}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default AppIconButton;