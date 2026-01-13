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
import AppButton from '../core/AppButton'; // Import AppButton
import AppHeader from '../core/AppDetailHeader';
import AppInput from '../core/AppInput';
import AppText from '../core/AppText';

const ForgetPasswordView = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSendCode = async () => {
        // 1. Validate
        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Invalid email format.");
            return;
        }

        setError('');
        setIsSending(true);

        try {
            // 2. Fake API Call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 3. Navigate to Verify Code
            router.replace({
                pathname: "/auth/verify-code",
                params: { email: email }
            } as any);

        } catch (err) {
            // Nếu dùng AppButton thì không cần Alert ở đây cũng được, 
            // hoặc giữ Alert nếu muốn thông báo global
            console.error(err);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <View style={styles.container}>
            <AppHeader title="Forgot Password" />

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
                            Reset your password
                        </AppText>
                        <AppText size="md" color={theme.colors.text.secondary} centered>
                            Enter the email address associated with your account and we'll send you a code to reset your password.
                        </AppText>
                    </View>

                    {/* Input Form */}
                    <View style={styles.formContainer}>
                        <AppInput
                            label="EMAIL ADDRESS"
                            value={email}
                            onChangeText={(val) => {
                                setEmail(val);
                                setError('');
                            }}
                            placeholder="Enter your email"
                            icon="mail-outline"
                            keyboardType="email-address"
                            error={error}
                        />
                    </View>

                    {/* Submit Button (Thay thế TouchableOpacity bằng AppButton) */}
                    <AppButton
                        title="Send Code"
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
    // Đã xóa styles.sendButton và styles.buttonDisabled vì AppButton tự xử lý
});

export default ForgetPasswordView;