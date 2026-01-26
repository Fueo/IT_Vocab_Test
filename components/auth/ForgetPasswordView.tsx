import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';

import theme from '../../theme';
import AppButton from '../core/AppButton';
import AppHeader from '../core/AppDetailHeader';
import AppInput from '../core/AppInput';
import AppText from '../core/AppText';

// ✅ Import API
import { authApi } from '../../api/auth'; // Hãy sửa đường dẫn nếu file api của bạn nằm chỗ khác

const ForgetPasswordView = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSendCode = async () => {
        // 1. Validate
        const mailToUse = email.trim();

        if (!mailToUse) {
            setError("Vui lòng nhập địa chỉ email.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(mailToUse)) {
            setError("Định dạng email không hợp lệ.");
            return;
        }

        setError('');
        setIsSending(true);

        try {
            // 2. ✅ REAL API CALL
            // Gọi API gửi mã với purpose là reset_password
            await authApi.sendCode({
                email: mailToUse,
                purpose: "reset_password"
            });

            // 3. Navigate to Verify Code
            // Truyền email và purpose qua màn hình tiếp theo để verify
            router.replace({
                pathname: "/auth/verify-code",
                params: {
                    email: mailToUse,
                    purpose: "reset_password" // Có thể truyền thêm để màn hình sau biết context
                }
            } as any);

        } catch (err: any) {
            // ✅ Xử lý lỗi từ Backend hiển thị lên UI
            const msg = err?.response?.data?.message || err.message || "Gửi mã thất bại. Vui lòng thử lại.";
            setError(msg);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <View style={styles.container}>
            <AppHeader title="Quên Mật Khẩu" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Illustration / Icon */}
                    <View style={styles.iconWrapper}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="lock-open-outline" size={48} color={theme.colors.primary} />
                        </View>
                    </View>

                    {/* Instruction Text */}
                    <View style={styles.textWrapper}>
                        <AppText size="lg" weight="bold" centered style={{ marginBottom: 8 }}>
                            Đặt lại mật khẩu
                        </AppText>
                        <AppText size="md" color={theme.colors.text.secondary} centered>
                            Nhập địa chỉ email liên kết với tài khoản của bạn, chúng tôi sẽ gửi mã để đặt lại mật khẩu.
                        </AppText>
                    </View>

                    {/* Input Form */}
                    <View style={styles.formContainer}>
                        <AppInput
                            label="ĐỊA CHỈ EMAIL"
                            value={email}
                            onChangeText={(val) => {
                                setEmail(val);
                                setError('');
                            }}
                            placeholder="Nhập email của bạn"
                            icon="mail-outline"
                            keyboardType="email-address"
                            error={error}
                            autoCapitalize="none" // Nên thêm để tránh viết hoa chữ cái đầu của email
                        />
                    </View>

                    {/* Submit Button */}
                    <AppButton
                        title="Gửi Mã"
                        onPress={handleSendCode}
                        isLoading={isSending}
                        disabled={isSending}
                        variant="primary"
                    />

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContent: {
        padding: theme.spacing.md,
    },
    iconWrapper: {
        alignItems: 'center',
        marginVertical: theme.spacing.xl,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(91, 194, 54, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textWrapper: {
        marginBottom: theme.spacing.xl,
        paddingHorizontal: theme.spacing.md,
    },
    formContainer: {
        marginBottom: theme.spacing.lg,
    },
});

export default ForgetPasswordView;