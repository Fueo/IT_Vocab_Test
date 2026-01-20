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
                title: "Error",
                message: "Missing reset token. Please try again from the start.",
                closeText: "Go Back",
                onCloseAction: () => router.back(),
            });
            return;
        }
        if (newPass.length < 6) {
            newErrors.newPass = "Password must be at least 6 characters.";
            hasError = true;
        }
        if (newPass !== confirmPass) {
            newErrors.confirmPass = "Passwords do not match.";
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
                title: "Password Reset!",
                message: "Your password has been changed successfully. Please login with your new password.",
                closeText: "Login Now",
                onCloseAction: () => router.replace("/auth/login" as any), // Hành động khi bấm nút đóng
            });

        } catch (error: any) {
            const msg = error?.response?.data?.message || error.message || "Failed to reset password.";
            // ❌ Error -> Mở Dialog Error
            setDialog({
                visible: true,
                type: "error",
                title: "Reset Failed",
                message: msg,
                closeText: "Try Again",
                onCloseAction: undefined, // Không làm gì, chỉ đóng dialog
            });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <View style={styles.container}>
            <AppHeader title="Reset Password" />

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
                            Set new password
                        </AppText>
                        <AppText size="md" color={theme.colors.text.secondary} centered style={{ lineHeight: 22 }}>
                            Your new password length must be at least 6 characters.
                        </AppText>
                    </View>

                    {/* Form Input */}
                    <View style={styles.formContainer}>
                        <AppInput
                            label="NEW PASSWORD"
                            value={newPass}
                            onChangeText={(val) => { setNewPass(val); setErrors(p => ({ ...p, newPass: '' })) }}
                            placeholder="Enter new password"
                            icon="lock-closed-outline"
                            isPassword={true}
                            error={errors.newPass}
                        />

                        <AppInput
                            label="CONFIRM PASSWORD"
                            value={confirmPass}
                            onChangeText={(val) => { setConfirmPass(val); setErrors(p => ({ ...p, confirmPass: '' })) }}
                            placeholder="Re-enter new password"
                            icon="lock-closed-outline"
                            isPassword={true}
                            error={errors.confirmPass}
                        />
                    </View>

                    {/* Action Button */}
                    <AppButton
                        title="Reset Password"
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
                closeText={dialog.closeText || "OK"}
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