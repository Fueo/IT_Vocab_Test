import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import theme from '../../theme';
import {
    AppButton,
    AppDetailHeader,
    AppInput,
    AppText,
    AvatarPickerSheet,
} from '../core';
import UserAvatar from './core/UserAvatar';

const EditProfileView = () => {
    // --- State dữ liệu ---
    const [name, setName] = useState('Guest User');
    const [email, setEmail] = useState('guest@itvocabmaster.com');
    const [phone, setPhone] = useState('0914852199');
    const [avatarUrl, setAvatarUrl] = useState(
        'https://cdn-icons-png.freepik.com/512/6858/6858504.png'
    );

    // --- State UI ---
    const [isSaving, setIsSaving] = useState(false);
    const [showImagePicker, setShowImagePicker] = useState(false);

    // --- State lỗi ---
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phone: '',
    });

    // --- Validation ---
    const isValidEmail = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const isValidPhone = (phone: string) =>
        /^[0-9]{9,11}$/.test(phone);

    // --- Xử lý input ---
    const handleChange = (
        field: keyof typeof errors,
        value: string
    ) => {
        if (field === 'name') setName(value);
        if (field === 'email') setEmail(value);
        if (field === 'phone') setPhone(value);

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // --- Save ---
    const handleSave = async () => {
        let newErrors = { name: '', email: '', phone: '' };
        let hasError = false;

        if (!name.trim()) {
            newErrors.name = 'Full name cannot be empty.';
            hasError = true;
        }

        if (!isValidEmail(email)) {
            newErrors.email = 'Please enter a valid email address.';
            hasError = true;
        }

        if (!isValidPhone(phone)) {
            newErrors.phone = 'Please enter a valid phone number.';
            hasError = true;
        }

        setErrors(newErrors);
        if (hasError) return;

        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1200));
            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch {
            Alert.alert('Error', 'Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    // ✅ Xin quyền + mở picker
    const handleEditAvatar = async () => {
        try {
            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission required',
                    'Please allow photo access to change avatar.'
                );
                return;
            }

            setShowImagePicker(true);
        } catch (e) {
            console.warn('Permission error:', e);
        }
    };

    // Nhận ảnh từ AvatarPickerSheet
    const handleImageSelected = (uri: string) => {
        setAvatarUrl(uri);
        setShowImagePicker(false);
        // TODO: upload avatar lên server
    };

    return (
        <View style={styles.container}>
            <AppDetailHeader title="Edit Profile" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* AVATAR */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarWrapper}>
                            <UserAvatar
                                initials={name.charAt(0) || 'U'}
                                size={120}
                                imageUrl={avatarUrl}
                            />

                            <TouchableOpacity
                                style={styles.editIconBtn}
                                onPress={handleEditAvatar}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="pencil" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <AppText
                            size="sm"
                            color={theme.colors.text.secondary}
                            style={{ marginTop: 12 }}
                        >
                            Change Profile Picture
                        </AppText>
                    </View>

                    {/* FORM */}
                    <View style={styles.formContainer}>
                        <AppInput
                            label="FULL NAME"
                            value={name}
                            onChangeText={val => handleChange('name', val)}
                            placeholder="Enter your name"
                            icon="person-outline"
                            error={errors.name}
                        />

                        <AppInput
                            label="EMAIL"
                            value={email}
                            onChangeText={val => handleChange('email', val)}
                            placeholder="Enter your email"
                            icon="mail-outline"
                            keyboardType="email-address"
                            error={errors.email}
                        />

                        <AppInput
                            label="PHONE NUMBER"
                            value={phone}
                            onChangeText={val => handleChange('phone', val)}
                            placeholder="Enter phone number"
                            icon="call-outline"
                            keyboardType="phone-pad"
                            error={errors.phone}
                        />
                    </View>

                    <AppButton
                        title="Save Changes"
                        onPress={handleSave}
                        isLoading={isSaving}
                        disabled={isSaving}
                        variant="primary"
                    />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* AVATAR PICKER */}
            <AvatarPickerSheet
                visible={showImagePicker}
                onClose={() => setShowImagePicker(false)}
                onImageSelected={handleImageSelected}
            />
        </View>
    );
};

export default EditProfileView;

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
    editIconBtn: {
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
        elevation: 2,
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        elevation: 1,
        marginBottom: theme.spacing.lg,
    },
});
