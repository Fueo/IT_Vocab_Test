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
import { AppBanner, AppButton, AppDetailHeader, AppInput } from '../core';

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

    // --- Helper: Xóa lỗi khi nhập ---
    const handleChange = (field: keyof typeof errors, value: string) => {
        if (field === 'currentPass') setCurrentPass(value);
        if (field === 'newPass') setNewPass(value);
        if (field === 'confirmPass') setConfirmPass(value);

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // --- Handlers ---
    const handleUpdate = async () => {
        let newErrors = { currentPass: '', newPass: '', confirmPass: '' };
        let hasError = false;

        if (!currentPass) {
            newErrors.currentPass = "Please enter your current password.";
            hasError = true;
        }

        if (!newPass) {
            newErrors.newPass = "Please enter a new password.";
            hasError = true;
        } else if (newPass.length < 6) {
            newErrors.newPass = "Password must be at least 6 characters.";
            hasError = true;
        }

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
            await new Promise(resolve => setTimeout(resolve, 1500));

            Alert.alert(
                "Success",
                "Password updated successfully!",
                [
                    { text: "OK", onPress: () => router.back() }
                ]
            );
        } catch (error) {
            Alert.alert("Error", "Failed to update password. Please try again.");
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
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* --- REPLACED HARDCODED BOX WITH APP BANNER --- */}
                    <AppBanner
                        variant="warning"
                        message="Your new password must be different from previously used passwords."
                        containerStyle={{ marginBottom: theme.spacing.lg }}
                    />

                    {/* Form Container */}
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
                            placeholder="Enter new password"
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

                    {/* 2. SỬ DỤNG APP BUTTON (Primary) */}
                    <AppButton
                        title="Update Password"
                        onPress={handleUpdate}
                        isLoading={isUpdating}
                        disabled={isUpdating}
                        variant="primary"
                        style={{ marginTop: theme.spacing.md }}
                    />

                    {/* 3. SỬ DỤNG APP BUTTON (Link) */}
                    <AppButton
                        title="Forgot Password?"
                        variant="link"
                        onPress={() => console.log('Navigate to Forgot Password')}
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
    // Đã xóa style infoBox
    formContainer: {
        backgroundColor: 'white',
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
        backgroundColor: '#F3F4F6',
        marginBottom: theme.spacing.md,
    },
});

export default ChangePasswordView;