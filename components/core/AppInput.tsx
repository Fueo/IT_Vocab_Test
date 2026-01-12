import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import theme from '../../theme'; // Đường dẫn trỏ về file index.ts của theme

interface AppInputProps extends TextInputProps {
    label?: string;              // Nhãn phía trên input (VD: Email)
    icon?: keyof typeof Ionicons.glyphMap; // Tên icon bên trái (VD: mail-outline)
    error?: string;              // Thông báo lỗi
    isPassword?: boolean;        // Chế độ mật khẩu
    containerStyle?: ViewStyle;  // Style tùy chỉnh cho container ngoài cùng
}

const AppInput: React.FC<AppInputProps> = ({
    label,
    icon,
    error,
    isPassword = false,
    containerStyle,
    style, // Style của TextInput nếu muốn override
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isSecure, setIsSecure] = useState(isPassword);

    // Xử lý màu viền: Lỗi (Đỏ) -> Focus (Xanh) -> Mặc định (Trong suốt hoặc cùng màu nền)
    const getBorderColor = () => {
        if (error) return theme.colors.error;
        if (isFocused) return theme.colors.primary;
        return 'transparent'; // Mặc định không hiện viền
    };

    // Màu nền input: Dựa vào ảnh, nền là màu xám rất nhạt
    const backgroundColor = '#F3F4F6';

    return (
        <View style={[styles.wrapper, containerStyle]}>
            {/* 1. Label phía trên */}
            {label && (
                <Text style={styles.label}>
                    {label}
                </Text>
            )}

            {/* 2. Input Container (Chứa Icon + Input + Eye) */}
            <View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: backgroundColor,
                        borderColor: getBorderColor(),
                    },
                ]}
            >
                {/* Icon bên trái */}
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20} // Kích thước icon chuẩn
                        color={theme.colors.text.secondary} // Màu xám (#6B7280)
                        style={styles.iconLeft}
                    />
                )}

                {/* Text Input chính */}
                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor={theme.colors.text.secondary}
                    secureTextEntry={isPassword ? isSecure : false}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoCapitalize="none"
                    {...props}
                />

                {/* Icon mắt (Ẩn/Hiện pass) bên phải */}
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setIsSecure(!isSecure)}
                        style={styles.iconRight}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={isSecure ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={theme.colors.text.secondary}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* 3. Thông báo lỗi bên dưới */}
            {error && (
                <Text style={styles.errorText}>
                    {error}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: theme.spacing.md, // Khoảng cách giữa các input (16px)
    },
    label: {
        fontFamily: theme.fonts.medium, // Poppins-Medium
        fontSize: theme.fontSizes.sm,   // 14px
        color: theme.colors.text.primary, // Màu đen (#1F2937)
        marginBottom: theme.spacing.xs, // Khoảng cách nhỏ với input (4px)
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 52, // Chiều cao chuẩn cho input cảm ứng (khoảng 48-56px)
        borderRadius: theme.radius.md, // Bo góc 12px theo radius.ts
        borderWidth: 1, // Viền mỏng 1px (chỉ hiện màu khi focus/error)
        paddingHorizontal: theme.spacing.md, // Padding 2 bên (16px)
    },
    input: {
        flex: 1, // Chiếm hết không gian còn lại
        fontFamily: theme.fonts.regular, // Poppins-Regular
        fontSize: theme.fontSizes.sm,    // 14px
        color: theme.colors.text.primary, // Màu chữ khi nhập
        height: '100%',
    },
    iconLeft: {
        marginRight: theme.spacing.sm, // Cách text input 8px
    },
    iconRight: {
        marginLeft: theme.spacing.sm, // Cách text input 8px
    },
    errorText: {
        fontFamily: theme.fonts.regular,
        fontSize: theme.fontSizes.xs, // 12px
        color: theme.colors.error,    // Màu đỏ (#FB7181)
        marginTop: theme.spacing.xxs, // 2px
    }
});

export default AppInput;