import { router } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import { authApi } from "../../api/auth";
import { tokenStore } from "../../storage/token";
import theme from "../../theme";
import { AppBanner, AppButton, AppDetailHeader, AppInput } from "../core";
import AppDialog, { DialogType } from "../core/AppDialog";

// ✅ clear zustand profile
import { useProfileStore } from "../../store/useProfileStore";

const ChangePasswordView = () => {
    // --- State Dữ liệu ---
    const [currentPass, setCurrentPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");

    // --- State Lỗi ---
    const [errors, setErrors] = useState({
        currentPass: "",
        newPass: "",
        confirmPass: "",
    });

    // Loading State
    const [isUpdating, setIsUpdating] = useState(false);

    // --- Dialog State ---
    const [dialog, setDialog] = useState<{
        visible: boolean;
        type: DialogType;
        title: string;
        message?: string;
        requireRelogin?: boolean;
    }>({
        visible: false,
        type: "info",
        title: "",
        message: "",
        requireRelogin: false,
    });

    const getErrorMessage = (e: any) => {
        if (e?.userMessage) return e.userMessage;
        const serverMsg = e?.response?.data?.message;
        if (typeof serverMsg === "string" && serverMsg.trim()) return serverMsg;
        if (typeof e?.message === "string" && e.message.trim()) return e.message;
        return "Cập nhật mật khẩu thất bại.";
    };

    const doRelogin = async () => {
        // 1) clear token
        await tokenStore.clearTokens();

        // 2) clear zustand profile
        try {
            useProfileStore.getState().clear();
        } catch {
            // ignore
        }

        // 3) reset navigation stack (expo-router)
        if (router.canDismiss()) {
            router.dismissAll();
        }

        // 4) go login
        router.replace("/auth/login" as any);
    };

    const closeDialog = () => {
        setDialog((prev) => ({ ...prev, visible: false }));
        // Nếu requireRelogin = true thì đóng dialog xong cũng logout luôn
        if (dialog.requireRelogin) {
            doRelogin();
        }
    };

    // --- Helper: Xóa lỗi khi nhập ---
    const handleChange = (field: keyof typeof errors, value: string) => {
        if (field === "currentPass") setCurrentPass(value);
        if (field === "newPass") setNewPass(value);
        if (field === "confirmPass") setConfirmPass(value);

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    // --- Handlers ---
    const handleUpdate = async () => {
        let newErrors = { currentPass: "", newPass: "", confirmPass: "" };
        let hasError = false;

        // 1. Check Current Password
        if (!currentPass) {
            newErrors.currentPass = "Vui lòng nhập mật khẩu hiện tại.";
            hasError = true;
        }

        // 2. Check New Password
        if (!newPass) {
            newErrors.newPass = "Vui lòng nhập mật khẩu mới.";
            hasError = true;
        } else if (newPass.length < 6) {
            // ✅ min 6
            newErrors.newPass = "Mật khẩu phải có ít nhất 6 ký tự.";
            hasError = true;
        } else if (newPass === currentPass) {
            newErrors.newPass = "Mật khẩu mới phải khác mật khẩu hiện tại.";
            hasError = true;
        }

        // 3. Check Confirm Password
        if (!confirmPass) {
            newErrors.confirmPass = "Vui lòng xác nhận mật khẩu mới.";
            hasError = true;
        } else if (newPass !== confirmPass) {
            newErrors.confirmPass = "Mật khẩu không khớp.";
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

            setDialog({
                visible: true,
                type: "success",
                title: "Đã Cập Nhật Mật Khẩu",
                message: res?.message || "Mật khẩu của bạn đã được thay đổi. Vui lòng đăng nhập lại.",
                requireRelogin: true,
            });
        } catch (error: any) {
            const msg = getErrorMessage(error);

            setDialog({
                visible: true,
                type: "error",
                title: "Cập Nhật Thất Bại",
                message: msg,
                requireRelogin: false,
            });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <View style={styles.container}>
            <AppDetailHeader title="Đổi Mật Khẩu" />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <AppBanner
                        variant="warning"
                        message="Hãy chắc chắn rằng mật khẩu mới của bạn đủ mạnh và an toàn."
                        containerStyle={{ marginBottom: theme.spacing.lg }}
                    />

                    <View style={styles.formContainer}>
                        <AppInput
                            label="MẬT KHẨU HIỆN TẠI"
                            value={currentPass}
                            onChangeText={(val) => handleChange("currentPass", val)}
                            placeholder="Nhập mật khẩu hiện tại"
                            icon="lock-closed-outline"
                            isPassword={true}
                            error={errors.currentPass}
                        />

                        <View style={styles.divider} />

                        <AppInput
                            label="MẬT KHẨU MỚI"
                            value={newPass}
                            onChangeText={(val) => handleChange("newPass", val)}
                            placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                            icon="lock-closed-outline"
                            isPassword={true}
                            error={errors.newPass}
                        />

                        <AppInput
                            label="XÁC NHẬN MẬT KHẨU"
                            value={confirmPass}
                            onChangeText={(val) => handleChange("confirmPass", val)}
                            placeholder="Nhập lại mật khẩu mới"
                            icon="lock-closed-outline"
                            isPassword={true}
                            error={errors.confirmPass}
                        />
                    </View>

                    <AppButton
                        title="Cập Nhật Mật Khẩu"
                        onPress={handleUpdate}
                        isLoading={isUpdating}
                        disabled={isUpdating}
                        variant="primary"
                        style={{ marginTop: theme.spacing.md }}
                    />

                    <AppButton
                        title="Quên Mật Khẩu?"
                        variant="link"
                        onPress={() => router.push("/auth/forgetpassword" as any)}
                    />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* ✅ AppDialog */}
            <AppDialog
                visible={dialog.visible}
                type={dialog.type}
                title={dialog.title}
                message={dialog.message}
                closeText={dialog.requireRelogin ? "Hủy" : "Đóng"}
                confirmText={dialog.requireRelogin ? "Đăng nhập lại" : undefined}
                onClose={closeDialog}
                onConfirm={dialog.requireRelogin ? doRelogin : undefined}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    scrollContent: {
        padding: theme.spacing.md,
    },
    formContainer: {
        backgroundColor: "white",
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        marginBottom: theme.spacing.lg,
    },
    divider: {
        height: 1,
        backgroundColor: "#F3F4F6",
        marginVertical: theme.spacing.md,
    },
});

export default ChangePasswordView;