import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

import theme from '../../theme';
import { AppBanner, AppButton, AppDetailHeader, AppInput, AppText } from '../core';

// Định nghĩa các loại Reason khớp với DB
type FeedbackReason = 'bug' | 'suggestion' | 'general';

const SendFeedbackView = () => {
    // --- State Dữ liệu ---
    const [reason, setReason] = useState<FeedbackReason>('general');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    // --- State Lỗi & Loading ---
    const [errors, setErrors] = useState({
        title: '',
        content: ''
    });
    const [isSending, setIsSending] = useState(false);

    // --- Config UI cho Reason ---
    const FEEDBACK_OPTIONS: { id: FeedbackReason; label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bgColor: string }[] = [
        { id: 'bug', label: 'Report Bug', icon: 'alert-circle', color: '#DC2626', bgColor: '#FEE2E2' },
        { id: 'suggestion', label: 'Suggestion', icon: 'chatbubble-ellipses', color: '#2563EB', bgColor: '#EFF6FF' },
        { id: 'general', label: 'General', icon: 'paper-plane', color: '#16A34A', bgColor: '#DCFCE7' }
    ];

    // --- Helper: Xóa lỗi khi nhập ---
    const handleChange = (field: 'title' | 'content', value: string) => {
        if (field === 'title') setTitle(value);
        if (field === 'content') setContent(value);

        // Nếu đang có lỗi ở trường này thì xóa đi
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // --- Handler ---
    const handleSend = async () => {
        // 1. Reset & Validate
        let newErrors = { title: '', content: '' };
        let hasError = false;

        if (!title.trim()) {
            newErrors.title = "Please enter a title for your feedback.";
            hasError = true;
        }

        if (!content.trim()) {
            newErrors.content = "Please enter the content of your feedback.";
            hasError = true;
        }

        setErrors(newErrors);

        // Nếu có lỗi thì dừng, không hiện Alert
        if (hasError) return;

        // 2. Gửi dữ liệu
        setIsSending(true);
        try {
            const payload = {
                Title: title,
                Reason: reason,
                Content: content,
            };
            console.log("Sending Feedback to DB:", payload);

            // Mock API Call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Success Alert (Vẫn giữ Alert cho thông báo thành công)
            Alert.alert("Thank You", "We have received your feedback!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert("Error", "Could not send feedback. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <View style={styles.container}>
            <AppDetailHeader title="Send Feedback" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                        {/* --- 1. REASON --- */}
                        <AppText size="md" weight="bold" style={styles.sectionTitle}>
                            Reason
                        </AppText>
                        <View style={styles.typeContainer}>
                            {FEEDBACK_OPTIONS.map((option) => {
                                const isSelected = reason === option.id;
                                return (
                                    <TouchableOpacity
                                        key={option.id}
                                        style={[
                                            styles.typeCard,
                                            isSelected ? {
                                                backgroundColor: option.bgColor,
                                                borderColor: option.color,
                                                borderWidth: 2,
                                                shadowColor: option.color,
                                                shadowOpacity: 0.2,
                                                shadowRadius: 4,
                                                elevation: 4,
                                                transform: [{ scale: 1.02 }]
                                            } : {
                                                backgroundColor: 'white',
                                                borderColor: '#E5E7EB',
                                                borderWidth: 1,
                                            }
                                        ]}
                                        onPress={() => setReason(option.id)}
                                        activeOpacity={0.9}
                                    >
                                        <View style={[styles.iconCircle, { backgroundColor: isSelected ? 'white' : option.color }]}>
                                            <Ionicons name={option.icon} size={22} color={isSelected ? option.color : 'white'} />
                                        </View>
                                        <AppText
                                            size="xs"
                                            weight={isSelected ? 'bold' : 'medium'}
                                            style={{ marginTop: 8, color: isSelected ? option.color : theme.colors.text.primary }}
                                        >
                                            {option.label}
                                        </AppText>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* --- 2. TITLE --- */}
                        <View style={styles.inputSection}>
                            <AppText size="md" weight="bold" style={styles.sectionTitle}>
                                Title
                            </AppText>
                            <AppInput
                                value={title}
                                onChangeText={(val) => handleChange('title', val)}
                                placeholder="Briefly summarize your feedback..."
                                icon="text-outline"
                                error={errors.title} // Truyền lỗi vào đây
                            />
                        </View>

                        {/* --- 3. CONTENT --- */}
                        <View style={styles.inputSection}>
                            <AppText size="md" weight="bold" style={styles.sectionTitle}>
                                Content
                            </AppText>
                            <AppInput
                                value={content}
                                onChangeText={(val) => handleChange('content', val)}
                                placeholder="Tell us what's on your mind..."
                                multiline={true}
                                numberOfLines={6}
                                style={{ maxHeight: 150 }}
                                error={errors.content} // Truyền lỗi vào đây
                            />
                        </View>

                        {/* --- 4. Send Button --- */}
                        <AppButton
                            title="Send Feedback"
                            onPress={handleSend}
                            isLoading={isSending}
                            disabled={isSending}
                            iconRight={true}
                            variant="primary"
                            icon="send"
                            style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.lg }}
                        />

                        {/* --- 5. Note --- */}
                        <AppBanner
                            variant="warning"
                            title="Note: "
                            message="For urgent issues, please contact us at support@itvocabmaster.com"
                            icon="bulb"
                        />

                    </ScrollView>
                </TouchableWithoutFeedback>
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
        paddingBottom: theme.spacing.xl,
    },
    sectionTitle: {
        marginBottom: 8,
        color: theme.colors.text.primary,
        marginLeft: 4,
    },
    typeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.lg,
    },
    typeCard: {
        width: '31%',
        aspectRatio: 1,
        borderRadius: theme.radius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputSection: {
        marginBottom: theme.spacing.md,
    }
});

export default SendFeedbackView;