import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';

import { authApi } from '../../api/auth';
import { tokenStore } from '../../storage/token';
import theme from '../../theme';
import { AppBanner, AppButton, AppDetailHeader, AppInput } from '../core';
import AppDialog, { DialogType } from '../core/AppDialog';

const ChangePasswordView = () => {
    // --- State Dữ liệu ---
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    // --- State Lỗi ---
    const [errors, setErrors] = useState({
        currentPass: '',
        newPass: '',
        confirmPass: ''
    });

    // Loading State
    const [isUpdating, setIsUpdating] = useState(false);

    // --- Dialog State ---
    const [dialog, setDialog] = useState<{
        visible: boolean;
        type: DialogType;
        title: string;
        message?: string;
        requireRelogin?: boolean; // Flag để xử lý logout
    }>({
        visible: false,
        type: 'info',
        title: '',
        message: '',
        requireRelogin: false,
    });

    const closeDialog = () => {
        setDialog((p) => ({ ...p, visible: false }));
        // Nếu requireRelogin = true thì đóng dialog xong cũng logout luôn
        if (dialog.requireRelogin) {
            doRelogin();
        }
    };

    // --- Helper: Xóa lỗi khi nhập ---
    const handleChange = (field: keyof typeof errors, value: string) => {
        if (field === 'currentPass') setCurrentPass(value);
        if (field === 'newPass') setNewPass(value);
        if (field === 'confirmPass') setConfirmPass(value);

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const doRelogin = async () => {
        // 1. Xóa token cũ
        await tokenStore.clearTokens();

        if (router.canDismiss()) {
            router.dismissAll();
        }

        // 2. Đá về login
        router.replace('/auth/login' as any);
    };

    // --- Handlers ---
    const handleUpdate = async () => {
        let newErrors = { currentPass: '', newPass: '', confirmPass: '' };
        let hasError = false;

        // 1. Check Current Password
        if (!currentPass) {
            newErrors.currentPass = "Please enter your current password.";
            hasError = true;
        }

        // 2. Check New Password
        if (!newPass) {
            newErrors.newPass = "Please enter a new password.";
            hasError = true;
        } else if (newPass.length <= 6) { 
            // ✅ Validate độ dài > 6 (min 6 ký tự)
            newErrors.newPass = "Password must be at least 6 characters.";
            hasError = true;
        } else if (newPass === currentPass) {
            // ✅ Mật khẩu mới không được trùng cũ
            newErrors.newPass = "New password must be different from current password.";
            hasError = true;
        }

        // 3. Check Confirm Password
        if (!confirmPass) {
            newErrors.confirmPass = "Please confirm your new password.";
            hasError = true;
        } else if (newPass !== confirmPass) {
            newErrors.confirmPass = "Passwords do not match.";
            hasError = true;
        }

        setErrors(newErrors);
        if (hasError) return;

        setIsUpdating(true);
        try {
            const res = await authApi.changePassword({
                oldPassword: currentPass,
                newPassword: newPass,
            });

            // ✅ Thành công -> Hiện dialog Success (dùng type success thay vì confirm)
            setDialog({
                visible: true,
                type: 'success', // Icon tick xanh
                title: 'Password Updated',
                message: res?.message || 'Your password has been changed. Please log in again.',
                requireRelogin: true, // Bật cờ này để bắt buộc logout
            });
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || "Failed to update password.";
            setDialog({
                visible: true,
                type: 'error',
                title: 'Update Failed',
                message: msg,
                requireRelogin: false,
            });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <View style={styles.container}>
            <AppDetailHeader title="Change Password" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <AppBanner
                        variant="warning"
                        message="Make sure your new password is strong and secure."
                        containerStyle={{ marginBottom: theme.spacing.lg }}
                    />

                    <View style={styles.formContainer}>
                        <AppInput
                            label="CURRENT PASSWORD"
                            value={currentPass}
                            onChangeText={(val) => handleChange('currentPass', val)}
                            placeholder="Enter current password"
                            icon="lock-closed-outline"
                            isPassword={true}
                            error={errors.currentPass}
                        />

                        <View style={styles.divider} />

                        <AppInput
                            label="NEW PASSWORD"
                            value={newPass}
                            onChangeText={(val) => handleChange('newPass', val)}
                            placeholder="Enter new password (min 6 chars)"
                            icon="lock-closed-outline"
                            isPassword={true}
                            error={errors.newPass}
                        />

                        <AppInput
                            label="CONFIRM PASSWORD"
                            value={confirmPass}
                            onChangeText={(val) => handleChange('confirmPass', val)}
                            placeholder="Re-enter new password"
                            icon="lock-closed-outline"
                            isPassword={true}
                            error={errors.confirmPass}
                        />
                    </View>

                    <AppButton
                        title="Update Password"
                        onPress={handleUpdate}
                        isLoading={isUpdating}
                        disabled={isUpdating}
                        variant="primary"
                        style={{ marginTop: theme.spacing.md }}
                    />

                    <AppButton
                        title="Forgot Password?"
                        variant="link"
                        onPress={() => router.push('/auth/forgetpassword' as any)}
                    />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* ✅ AppDialog Logic */}
            <AppDialog
                visible={dialog.visible}
                type={dialog.type}
                title={dialog.title}
                message={dialog.message}
                // Nếu thành công (requireRelogin) -> Ẩn nút đóng thường, chỉ hiện nút xác nhận
                closeText={dialog.requireRelogin ? undefined : "Close"} 
                confirmText={dialog.requireRelogin ? "Log in again" : undefined}
                
                onClose={closeDialog} // Bấm ra ngoài hoặc nút Close đều chạy hàm này
                onConfirm={dialog.requireRelogin ? doRelogin : undefined}
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
    },
    formContainer: {
        backgroundColor: 'white',
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        // Shadow nhẹ cho form
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        marginBottom: theme.spacing.lg,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: theme.spacing.md,
    },
});

export default ChangePasswordView;