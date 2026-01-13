import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';

import theme from '../../theme';
import AppButton from '../core/AppButton'; // Import AppButton
import AppHeader from '../core/AppDetailHeader';
import AppInput from '../core/AppInput';
import AppText from '../core/AppText';

const NewPasswordView = () => {
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // State lưu lỗi
    const [errors, setErrors] = useState({ newPass: '', confirmPass: '' });

    const handleUpdate = async () => {
        let newErrors = { newPass: '', confirmPass: '' };
        let hasError = false;

        // Validation
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
            await new Promise(resolve => setTimeout(resolve, 1500));

            Alert.alert(
                "Success",
                "Your password has been reset successfully!",
                [
                    // Dùng replace để không quay lại màn hình nhập OTP được nữa
                    { text: "Login Now", onPress: () => router.back() }
                ]
            );
        } catch (error) {
            Alert.alert("Error", "Failed to reset password.");
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

                    {/* 1. Illustration Area (Làm đẹp giao diện) */}
                    <View style={styles.illustrationContainer}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="shield-checkmark-outline" size={64} color={theme.colors.primary} />
                        </View>
                    </View>

                    {/* 2. Header Text */}
                    <View style={styles.headerText}>
                        <AppText size="lg" weight="bold" centered style={{ marginBottom: 8 }}>
                            Set new password
                        </AppText>
                        <AppText size="md" color={theme.colors.text.secondary} centered style={{ lineHeight: 22 }}>
                            Your new password must be different from previously used passwords.
                        </AppText>
                    </View>

                    {/* 3. Form Input */}
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

                    {/* 4. Action Button */}
                    <AppButton
                        title="Reset Password"
                        onPress={handleUpdate}
                        isLoading={isUpdating}
                        disabled={isUpdating}
                        variant="primary"
                        style={{ marginTop: theme.spacing.lg }} // Thêm khoảng cách với form
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
        paddingBottom: 40,
    },
    // Illustration Styles
    illustrationContainer: {
        alignItems: 'center',
        marginVertical: theme.spacing.xl, // Tạo khoảng trống lớn
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(91, 194, 54, 0.1)', // Màu xanh nhạt (Primary opacity)
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(91, 194, 54, 0.2)',
    },
    headerText: {
        marginBottom: theme.spacing.xl,
        paddingHorizontal: theme.spacing.md,
    },
    // Form Styles
    formContainer: {
        // Không cần background trắng ở đây nữa để giao diện thoáng hơn (hoặc giữ nếu muốn style card)
        marginBottom: theme.spacing.md,
    },
});

export default NewPasswordView;