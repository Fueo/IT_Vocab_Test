import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router'; // ✅ Thêm useLocalSearchParams
import React, { useEffect, useState } from 'react';
import {
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
import {
    AppBanner,
    AppButton,
    AppDetailHeader,
    AppDialog,
    AppInput,
    AppText,
} from '../core';

import { feedbackApi, FeedbackStatus } from '../../api/feedback';
import { requireAuth } from '../../utils/authUtils';

// Định nghĩa các loại Reason khớp với DB
type FeedbackReason = 'bug' | 'suggestion' | 'general';

const FeedbackFormView = () => {
    const router = useRouter();
    // ✅ LOGIC MỚI: Lấy ID để biết đang sửa hay tạo mới
    const { id } = useLocalSearchParams<{ id: string }>();
    const isEditMode = !!id;

    // --- State Dữ liệu ---
    const [reason, setReason] = useState<FeedbackReason>('general');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<FeedbackStatus>('open'); // ✅ Thêm status để check quyền sửa

    // --- State Lỗi & Loading ---
    const [errors, setErrors] = useState({
        title: '',
        content: ''
    });
    const [isSending, setIsSending] = useState(false);

    // --- State Dialog ---
    const [dialogConfig, setDialogConfig] = useState<{
        visible: boolean;
        type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
        title: string;
        message: string;
        onConfirm?: () => void;
        confirmText?: string;
        isDestructive?: boolean;
    }>({
        visible: false,
        type: 'info',
        title: '',
        message: '',
    });

    // ✅ LOGIC MỚI: Chỉ cho phép sửa khi: (Là tạo mới) HOẶC (Đang sửa và status là 'open')
    const isEditable = !isEditMode || status === 'open';

    const FEEDBACK_OPTIONS: { id: FeedbackReason; label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bgColor: string }[] = [
        { id: 'bug', label: 'Report Bug', icon: 'alert-circle', color: '#DC2626', bgColor: '#FEE2E2' },
        { id: 'suggestion', label: 'Suggestion', icon: 'chatbubble-ellipses', color: '#2563EB', bgColor: '#EFF6FF' },
        { id: 'general', label: 'General', icon: 'paper-plane', color: '#16A34A', bgColor: '#DCFCE7' }
    ];

    // --- 1. Load Data (Nếu có ID) ---
    useEffect(() => {
        requireAuth(
            router,
            setDialogConfig,
            async () => {
                if (isEditMode) {
                    try {
                        // Tạm thời gọi list và filter (do BE chưa có API getDetail)
                        const res = await feedbackApi.getMyFeedback({ page: 1, pageSize: 100 });
                        const found = res.items.find(item => item.id === id);
                        
                        if (found) {
                            setTitle(found.title);
                            setContent(found.content);
                            setReason((found.reason as FeedbackReason) || 'general');
                            setStatus(found.status);
                        } else {
                            // Không tìm thấy -> Báo lỗi
                            setDialogConfig({
                                visible: true, type: 'error', title: 'Error', message: 'Feedback not found.',
                                onConfirm: () => { setDialogConfig(p => ({...p, visible: false})); router.back(); }
                            });
                        }
                    } catch (error) { console.error(error); }
                }
            },
            { title: 'Yêu cầu đăng nhập', message: 'Vui lòng đăng nhập để tiếp tục.' }
        );
    }, [id]);

    const handleChange = (field: 'title' | 'content', value: string) => {
        if (field === 'title') setTitle(value);
        if (field === 'content') setContent(value);
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    // --- Handler: Save (Xử lý cả Create và Update) ---
    const handleSend = async () => {
        let newErrors = { title: '', content: '' };
        let hasError = false;

        if (!title.trim()) { newErrors.title = "Please enter a title."; hasError = true; }
        if (!content.trim()) { newErrors.content = "Please enter content."; hasError = true; }
        setErrors(newErrors);
        if (hasError) return;

        requireAuth(router, setDialogConfig, async () => {
            setIsSending(true);
            try {
                if (isEditMode) {
                    // 👉 LOGIC UPDATE
                    await feedbackApi.updateFeedback(id!, { title: title.trim(), reason, content: content.trim() });
                    setDialogConfig({
                        visible: true, type: 'success', title: 'Updated', message: 'Your feedback has been updated successfully.',
                        confirmText: 'OK', onConfirm: () => { setDialogConfig(p => ({...p, visible: false})); router.back(); }
                    });
                } else {
                    // 👉 LOGIC CREATE
                    await feedbackApi.createFeedback({ title: title.trim(), reason, content: content.trim() });
                    setDialogConfig({
                        visible: true, type: 'success', title: 'Thank You', message: 'We have received your feedback!',
                        confirmText: 'OK', onConfirm: () => { setDialogConfig(p => ({...p, visible: false})); router.back(); }
                    });
                }
            } catch (error: any) {
                setDialogConfig({
                    visible: true, type: 'error', title: 'Error', message: error?.response?.data?.message || "Error occurred.",
                    onConfirm: () => setDialogConfig(prev => ({ ...prev, visible: false }))
                });
            } finally {
                setIsSending(false);
            }
        });
    };

    return (
        <View style={styles.container}>
            {/* ✅ Header đổi tiêu đề linh hoạt */}
            <AppDetailHeader title={isEditMode ? "Feedback Details" : "Send Feedback"} />

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
                                                backgroundColor: 'white', // Giữ nguyên màu, không đổi style disabled để giữ UI y chang
                                                borderColor: '#E5E7EB',
                                                borderWidth: 1,
                                                opacity: isEditable ? 1 : 0.6 // ✅ Chỉ thêm opacity nhẹ để báo hiệu disabled
                                            }
                                        ]}
                                        disabled={!isEditable} // ✅ Chặn bấm nếu không được sửa
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
                                error={errors.title}
                                editable={isEditable} // ✅ Chặn nhập liệu nếu không được sửa
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
                                error={errors.content}
                                editable={isEditable} // ✅ Chặn nhập liệu nếu không được sửa
                            />
                        </View>

                        {/* --- 4. Send Button --- */}
                        <AppButton
                            // ✅ Đổi text nút dựa trên chế độ (Send / Update)
                            title={!isEditable ? "Read Only" : (isEditMode ? "Update Feedback" : "Send Feedback")}
                            onPress={handleSend}
                            isLoading={isSending}
                            // ✅ Disable nút nếu đang gửi hoặc không được phép sửa
                            disabled={isSending || !isEditable}
                            iconRight={true}
                            variant="primary"
                            icon={isEditMode ? "save-outline" : "send"} // ✅ Đổi icon tương ứng
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

            <AppDialog
                visible={dialogConfig.visible}
                type={dialogConfig.type}
                title={dialogConfig.title}
                message={dialogConfig.message}
                confirmText={dialogConfig.confirmText}
                isDestructive={dialogConfig.isDestructive}
                onConfirm={dialogConfig.onConfirm}
                onClose={() => setDialogConfig(prev => ({ ...prev, visible: false }))}
            />
        </View>
    );
};

// ... Styles giữ nguyên 100% như cũ ...
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

export default FeedbackFormView;