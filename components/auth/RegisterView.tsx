import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

// Import Core Components & Theme
import theme from '../../theme';
import { AppButton, AppInput, AppText } from '../core';

const { height } = Dimensions.get('window');

const RegisterView = () => {
    // 1. Quản lý State
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isAgreed, setIsAgreed] = useState(false);

    // State lỗi
    const [errors, setErrors] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // 2. Logic Validate
    const validateInputs = () => {
        let isValid = true;
        let newErrors = { fullName: '', email: '', password: '', confirmPassword: '' };

        if (!fullName.trim()) {
            newErrors.fullName = 'Full Name is required';
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Invalid email address';
            isValid = false;
        }

        if (!password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
            isValid = false;
        } else if (confirmPassword !== password) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        if (!isAgreed) {
            Alert.alert("Agreement Required", "Please agree to the Terms & Conditions to continue.");
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // 3. Handlers
    const handleRegister = () => {
        if (validateInputs()) {
            console.log("Register Success:", { fullName, email, password });
            // API call here
        }
    };

    const handleClearError = (field: keyof typeof errors) => {
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleLoginPress = () => {
        if (router.canGoBack()) router.back();
        else router.replace('/auth/login');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                <StatusBar style="light" />

                {/* HEADER SECTION */}
                <LinearGradient
                    colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                    style={styles.headerContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.logoCircle}>
                            <Ionicons name="code-slash" size={40} color={theme.colors.gradientStart} />
                        </View>
                        <AppText size="title" weight="bold" color="white" style={styles.headerTitle}>
                            Create Account
                        </AppText>
                        <AppText
                            size="sm"
                            color="rgba(255,255,255,0.9)"
                            centered
                            style={{ paddingHorizontal: theme.spacing.xxl }}
                        >
                            Join thousands of FPT Poly students learning IT English
                        </AppText>
                    </View>
                </LinearGradient>

                {/* FORM SECTION */}
                <View style={styles.formContainer}>
                    <AppInput
                        label="Full Name"
                        placeholder="Nguyen Van A"
                        icon="person-outline"
                        value={fullName}
                        onChangeText={(text) => { setFullName(text); handleClearError('fullName'); }}
                        error={errors.fullName}
                        style={styles.inputStyle}
                    />

                    <AppInput
                        label="Email"
                        placeholder="your.email@fpt.edu.vn"
                        icon="mail-outline"
                        value={email}
                        onChangeText={(text) => { setEmail(text); handleClearError('email'); }}
                        error={errors.email}
                        style={styles.inputStyle}
                    />

                    <AppInput
                        label="Password"
                        placeholder="At least 6 characters"
                        icon="lock-closed-outline"
                        isPassword={true}
                        value={password}
                        onChangeText={(text) => { setPassword(text); handleClearError('password'); }}
                        error={errors.password}
                        style={styles.inputStyle}
                    />

                    <AppInput
                        label="Confirm Password"
                        placeholder="Re-enter your password"
                        icon="lock-closed-outline"
                        isPassword={true}
                        value={confirmPassword}
                        onChangeText={(text) => { setConfirmPassword(text); handleClearError('confirmPassword'); }}
                        error={errors.confirmPassword}
                        style={styles.inputStyle}
                    />

                    {/* Terms & Conditions Checkbox */}
                    <View style={styles.checkboxContainer}>
                        <TouchableOpacity onPress={() => setIsAgreed(!isAgreed)} style={styles.checkboxRow}>
                            <Ionicons
                                name={isAgreed ? "checkbox" : "square-outline"}
                                size={24}
                                color={isAgreed ? theme.colors.primary : theme.colors.text.secondary}
                            />
                        </TouchableOpacity>

                        <View style={styles.policyTextContainer}>
                            <AppText size="xs" color={theme.colors.text.secondary}>I agree to the </AppText>
                            <TouchableOpacity onPress={() => console.log("Terms")}>
                                <AppText size="xs" color={theme.colors.secondary} weight="bold">Terms & Conditions</AppText>
                            </TouchableOpacity>
                            <AppText size="xs" color={theme.colors.text.secondary}> and </AppText>
                            <TouchableOpacity onPress={() => console.log("Privacy")}>
                                <AppText size="xs" color={theme.colors.secondary} weight="bold">Privacy Policy</AppText>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <AppButton
                        title="Sign Up"
                        onPress={handleRegister}
                        variant="primary"
                        disabled={!isAgreed}
                        style={StyleSheet.flatten([
                            styles.registerBtn,
                            !isAgreed && { opacity: 0.6 }
                        ])}
                    />

                    <View style={styles.dividerContainer}>
                        <View style={styles.line} />
                        <AppText size="sm" color={theme.colors.text.secondary} style={styles.orText}>OR</AppText>
                        <View style={styles.line} />
                    </View>

                    <AppButton
                        title="Continue with Google"
                        variant="google"
                        onPress={() => { }}
                        style={styles.socialBtn}
                    />

                    <AppButton
                        title="Continue with Facebook"
                        variant="outline"
                        icon="logo-facebook"
                        onPress={() => { }}
                        style={styles.socialBtn}
                    />

                    <View style={styles.footerRow}>
                        <AppText size="sm" color={theme.colors.text.secondary}>Already have an account?</AppText>
                        <TouchableOpacity onPress={handleLoginPress}>
                            <AppText
                                size="sm"
                                color={theme.colors.secondary}
                                weight="bold"
                                style={{ marginLeft: theme.spacing.xs }}
                            >
                                Log In
                            </AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: 'white'
    },
    headerContainer: {
        height: height * 0.4,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: theme.spacing.xxl,
    },
    headerContent: {
        alignItems: 'center',
        marginTop: theme.spacing.md,
        width: '100%',
    },
    logoCircle: {
        width: 80,
        height: 80,
        backgroundColor: 'white',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    headerTitle: {
        marginBottom: theme.spacing.sm,
    },
    formContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -theme.spacing.xl,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.xl,
        paddingBottom: theme.spacing.xxl,
        minHeight: height * 0.8,
    },
    inputStyle: {
        backgroundColor: '#F3F4F6',
        borderWidth: 0,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        marginTop: theme.spacing.xs,
    },
    checkboxRow: {
        marginRight: theme.spacing.smd,
    },
    policyTextContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    registerBtn: {
        borderRadius: 30,
        height: 50,
        marginBottom: theme.spacing.lg,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.border,
    },
    orText: {
        marginHorizontal: theme.spacing.smd,
    },
    socialBtn: {
        marginBottom: theme.spacing.md,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: theme.spacing.smd,
        marginBottom: theme.spacing.lg,
    },
});

export default RegisterView;