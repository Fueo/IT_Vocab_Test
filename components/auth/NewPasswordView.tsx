import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';

import theme from '../../theme';
import AppButton from '../core/AppButton';
import AppHeader from '../core/AppDetailHeader';
import AppDialog from '../core/AppDialog'; // ✅ Import AppDialog
import AppInput from '../core/AppInput';
import AppText from '../core/AppText';

// Import API
import { authApi } from '../../api/auth';

// Định nghĩa kiểu cho state dialog để dễ quản lý hành động sau khi đóng
type DialogState = {
    visible: boolean;
    type: "success" | "error" | "info" | "warning";
    title: string;
    message: string;
    closeText?: string;
    onCloseAction?: () => void; // Hàm callback khi đóng dialog
};

const NewPasswordView = () => {
    // 1. Lấy resetToken
    const params = useLocalSearchParams();
    const resetToken = String(params.resetToken || "");

    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [errors, setErrors] = useState({ newPass: '', confirmPass: '' });

    // ✅ State quản lý Dialog
    const [dialog, setDialog] = useState<DialogState>({
        visible: false,
        type: "info",
        title: "",
        message: "",
    });

    // Helper đóng dialog
    const closeDialog = () => {
        setDialog((prev) => ({ ...prev, visible: false }));
        // Nếu có hành động (như navigate) thì thực hiện sau khi đóng
        if (dialog.onCloseAction) {
            dialog.onCloseAction();
        }
    };

    const handleUpdate = async () => {
        let newErrors = { newPass: '', confirmPass: '' };
        let hasError = false;

        // Validation
        if (!resetToken) {
            setDialog({
                visible: true,
                type: "error",
                title: "Lỗi",
                message: "Thiếu mã token đặt lại. Vui lòng thử lại từ đầu.",
                closeText: "Quay lại",
                onCloseAction: () => router.back(),
            });
            return;
        }
        if (newPass.length < 6) {
            newErrors.newPass = "Mật khẩu phải có ít nhất 6 ký tự.";
            hasError = true;
        }
        if (newPass !== confirmPass) {
            newErrors.confirmPass = "Mật khẩu không khớp.";
            hasError = true;
        }

        setErrors(newErrors);
        if (hasError) return;

        setIsUpdating(true);
        try {
            // 2. REAL API CALL
            await authApi.newPassword({
                resetToken: resetToken,
                newPassword: newPass
            });

            // 3. ✅ Success -> Mở Dialog Success
            setDialog({
                visible: true,
                type: "success",
                title: "Đặt Lại Mật Khẩu!",
                message: "Mật khẩu của bạn đã được thay đổi thành công. Vui lòng đăng nhập bằng mật khẩu mới.",
                closeText: "Đăng Nhập Ngay",
                onCloseAction: () => router.replace("/auth/login" as any), // Hành động khi bấm nút đóng
            });

        } catch (error: any) {
            const msg = error?.response?.data?.message || error.message || "Đặt lại mật khẩu thất bại.";
            // ❌ Error -> Mở Dialog Error
            setDialog({
                visible: true,
                type: "error",
                title: "Đặt Lại Thất Bại",
                message: msg,
                closeText: "Thử Lại",
                onCloseAction: undefined, // Không làm gì, chỉ đóng dialog
            });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <View style={styles.container}>
            <AppHeader title="Đặt Lại Mật Khẩu" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Illustration Area */}
                    <View style={styles.illustrationContainer}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="shield-checkmark-outline" size={64} color={theme.colors.primary} />
                        </View>
                    </View>

                    {/* Header Text */}
                    <View style={styles.headerText}>
                        <AppText size="lg" weight="bold" centered style={{ marginBottom: 8 }}>
                            Đặt mật khẩu mới
                        </AppText>
                        <AppText size="md" color={theme.colors.text.secondary} centered style={{ lineHeight: 22 }}>
                            Mật khẩu mới của bạn phải có độ dài ít nhất 6 ký tự.
                        </AppText>
                    </View>

                    {/* Form Input */}
                    <View style={styles.formContainer}>
                        <AppInput
                            label="MẬT KHẨU MỚI"
                            value={newPass}
                            onChangeText={(val) => { setNewPass(val); setErrors(p => ({ ...p, newPass: '' })) }}
                            placeholder="Nhập mật khẩu mới"
                            icon="lock-closed-outline"
                            isPassword={true}
                            error={errors.newPass}
                        />

                        <AppInput
                            label="XÁC NHẬN MẬT KHẨU"
                            value={confirmPass}
                            onChangeText={(val) => { setConfirmPass(val); setErrors(p => ({ ...p, confirmPass: '' })) }}
                            placeholder="Nhập lại mật khẩu mới"
                            icon="lock-closed-outline"
                            isPassword={true}
                            error={errors.confirmPass}
                        />
                    </View>

                    {/* Action Button */}
                    <AppButton
                        title="Đặt Lại Mật Khẩu"
                        onPress={handleUpdate}
                        isLoading={isUpdating}
                        disabled={isUpdating}
                        variant="primary"
                        style={{ marginTop: theme.spacing.lg }}
                    />

                </ScrollView>
            </KeyboardAvoidingView>

            {/* ✅ AppDialog Component */}
            <AppDialog
                visible={dialog.visible}
                type={dialog.type}
                title={dialog.title}
                message={dialog.message}
                closeText={dialog.closeText || "Đồng ý"}
                onClose={closeDialog}
            />
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
        paddingBottom: 40,
    },
    illustrationContainer: {
        alignItems: 'center',
        marginVertical: theme.spacing.xl,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(91, 194, 54, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(91, 194, 54, 0.2)',
    },
    headerText: {
        marginBottom: theme.spacing.xl,
        paddingHorizontal: theme.spacing.md,
    },
    formContainer: {
        marginBottom: theme.spacing.md,
    },
});

export default NewPasswordView;