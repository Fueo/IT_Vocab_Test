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
import theme from '../../theme';

interface AppInputProps extends TextInputProps {
    label?: string;              // Nhãn (VD: Email)
    icon?: keyof typeof Ionicons.glyphMap; // Icon trái
    error?: string;              // Thông báo lỗi
    isPassword?: boolean;        // Chế độ mật khẩu
    containerStyle?: ViewStyle;  // Style container ngoài cùng
    // Note: Prop 'multiline' và 'numberOfLines' đã có sẵn trong TextInputProps
}

const AppInput: React.FC<AppInputProps> = ({
    label,
    icon,
    error,
    isPassword = false,
    containerStyle,
    style,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isSecure, setIsSecure] = useState(isPassword);

    // Kiểm tra xem có đang dùng chế độ nhiều dòng không
    const isMultiline = props.multiline;

    // Xử lý màu viền
    const getBorderColor = () => {
        if (error) return theme.colors.error;
        if (isFocused) return theme.colors.primary;
        return 'transparent';
    };

    return (
        <View style={[styles.wrapper, containerStyle]}>
            {/* 1. Label */}
            {label && (
                <Text style={styles.label}>
                    {label}
                </Text>
            )}

            {/* 2. Input Container */}
            <View
                style={[
                    styles.inputContainer,
                    // Style động dựa trên chế độ multiline
                    isMultiline ? styles.inputContainerMultiline : styles.inputContainerSingle,
                    {
                        borderColor: getBorderColor(),
                        backgroundColor: '#F3F4F6',
                    },
                ]}
            >
                {/* Icon bên trái */}
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={theme.colors.text.secondary}
                        style={[
                            styles.iconLeft,
                            // Nếu nhiều dòng, đẩy icon xuống xíu để khớp dòng đầu tiên
                            isMultiline && { marginTop: 2 }
                        ]}
                    />
                )}

                {/* Text Input */}
                <TextInput
                    style={[
                        styles.input,
                        // Style riêng cho nội dung bên trong
                        isMultiline && styles.inputMultiline,
                        style
                    ]}
                    placeholderTextColor={theme.colors.text.secondary}
                    secureTextEntry={isPassword ? isSecure : false}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoCapitalize="none"
                    textAlignVertical={isMultiline ? 'top' : 'center'} // Quan trọng cho Android
                    {...props}
                />

                {/* Icon mắt (Chỉ hiện khi không phải multiline và là password) */}
                {isPassword && !isMultiline && (
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

            {/* 3. Lỗi */}
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
        marginBottom: theme.spacing.md,
    },
    label: {
        fontFamily: theme.fonts.medium,
        fontSize: theme.fontSizes.sm,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
    },
    // --- Base Container Style ---
    inputContainer: {
        flexDirection: 'row',
        borderRadius: theme.radius.md,
        borderWidth: 1,
        paddingHorizontal: theme.spacing.md,
    },
    // --- Single Line Styles ---
    inputContainerSingle: {
        height: 52, // Chiều cao cố định
        alignItems: 'center', // Căn giữa theo chiều dọc
    },
    // --- Multi Line Styles ---
    inputContainerMultiline: {
        minHeight: 120, // Chiều cao tối thiểu lớn hơn
        alignItems: 'flex-start', // Căn lên trên cùng
        paddingVertical: theme.spacing.md, // Thêm padding trên dưới
    },
    // --- Input Styles ---
    input: {
        flex: 1,
        fontFamily: theme.fonts.regular,
        fontSize: theme.fontSizes.sm,
        color: theme.colors.text.primary,
        height: '100%', // Chiếm hết chiều cao container
        padding: 0, // Reset padding mặc định của Android
    },
    inputMultiline: {
        marginTop: -2, // Tinh chỉnh nhỏ để khớp với dòng text đầu tiên
    },
    iconLeft: {
        marginRight: theme.spacing.sm,
    },
    iconRight: {
        marginLeft: theme.spacing.sm,
    },
    errorText: {
        fontFamily: theme.fonts.regular,
        fontSize: theme.fontSizes.xs,
        color: theme.colors.error,
        marginTop: theme.spacing.xxs,
    }
});

export default AppInput;