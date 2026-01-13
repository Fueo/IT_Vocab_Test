import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

import theme from '../../theme';
// Import các component core, bao gồm AppButton mới
import { AppButton, AppDetailHeader, AppInput, AppText } from '../core';
import UserAvatar from './core/UserAvatar';

const EditProfileView = () => {
    // --- State dữ liệu ---
    const [name, setName] = useState('Guest User');
    const [email, setEmail] = useState('guest@itvocabmaster.com');
    const [phone, setPhone] = useState('0914852199');
    const [avatarUrl, setAvatarUrl] = useState("https://cdn-icons-png.freepik.com/512/6858/6858504.png");

    // --- State UI ---
    const [isSaving, setIsSaving] = useState(false);

    // State lưu lỗi
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phone: ''
    });

    // --- Validation Helpers ---
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPhone = (phone: string) => /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(phone);

    // --- Helper: Xóa lỗi khi người dùng nhập liệu ---
    const handleChange = (field: keyof typeof errors, value: string) => {
        if (field === 'name') setName(value);
        if (field === 'email') setEmail(value);
        if (field === 'phone') setPhone(value);

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // --- Handlers ---
    const handleSave = async () => {
        let newErrors = { name: '', email: '', phone: '' };
        let hasError = false;

        if (!name.trim()) {
            newErrors.name = "Full name cannot be empty.";
            hasError = true;
        }

        if (!isValidEmail(email)) {
            newErrors.email = "Please enter a valid email address.";
            hasError = true;
        }

        if (!isValidPhone(phone)) {
            newErrors.phone = "Please enter a valid phone number.";
            hasError = true;
        }

        setErrors(newErrors);
        if (hasError) return;

        setIsSaving(true);
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            Alert.alert("Success", "Profile updated successfully!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert("Error", "Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePickImage = () => {
        Alert.alert("Upload Photo", "Open gallery/camera logic here");
    };

    return (
        <View style={styles.container}>
            {/* Sử dụng AppDetailHeader thay vì AppHeader để đồng bộ */}
            <AppDetailHeader title="Edit Profile" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* AVATAR SECTION */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarWrapper}>
                            <UserAvatar
                                initials={name.charAt(0) || 'U'}
                                size={120}
                                imageUrl={avatarUrl}
                            />
                            <TouchableOpacity
                                style={styles.cameraButton}
                                onPress={handlePickImage}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="camera" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                        <AppText size="sm" color={theme.colors.text.secondary} style={{ marginTop: 12 }}>
                            Change Profile Picture
                        </AppText>
                    </View>

                    {/* FORM FIELDS */}
                    <View style={styles.formContainer}>
                        <AppInput
                            label="FULL NAME"
                            value={name}
                            onChangeText={(val) => handleChange('name', val)}
                            placeholder="Enter your name"
                            icon="person-outline"
                            error={errors.name}
                        />

                        <AppInput
                            label="EMAIL"
                            value={email}
                            onChangeText={(val) => handleChange('email', val)}
                            placeholder="Enter your email"
                            icon="mail-outline"
                            keyboardType="email-address"
                            error={errors.email}
                        />

                        <AppInput
                            label="PHONE NUMBER"
                            value={phone}
                            onChangeText={(val) => handleChange('phone', val)}
                            placeholder="Enter phone number"
                            icon="call-outline"
                            keyboardType="phone-pad"
                            error={errors.phone}
                        />
                    </View>

                    {/* REPLACED HARDCODED BUTTON WITH APP BUTTON */}
                    <AppButton
                        title="Save Changes"
                        onPress={handleSave}
                        isLoading={isSaving}
                        disabled={isSaving}
                        variant="primary"
                        style={{ marginTop: theme.spacing.sm }}
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
    avatarSection: {
        alignItems: 'center',
        marginVertical: theme.spacing.lg,
    },
    avatarWrapper: {
        position: 'relative',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#F9FAFB',
    },
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
    // Đã xóa styles.saveButton và styles.saveButtonDisabled
});

export default EditProfileView;