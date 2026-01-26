import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

import theme from "../../theme";
import {
    AppBanner,
    AppButton,
    AppDetailHeader,
    AppDialog,
    AppInput,
    AppText,
} from "../core";

import { feedbackApi, FeedbackStatus } from "../../api/feedback";
import { requireAuth } from "../../utils/authUtils";

// Định nghĩa các loại Reason khớp với DB
type FeedbackReason = "bug" | "suggestion" | "general";

const FeedbackFormView = () => {
    const router = useRouter();

    // ✅ LOGIC MỚI: Lấy ID để biết đang sửa hay tạo mới
    const { id } = useLocalSearchParams<{ id: string }>();
    const isEditMode = !!id;

    // --- State Dữ liệu ---
    const [reason, setReason] = useState<FeedbackReason>("general");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [status, setStatus] = useState<FeedbackStatus>("open");

    // --- State Lỗi & Loading ---
    const [errors, setErrors] = useState({
        title: "",
        content: "",
    });
    const [isSending, setIsSending] = useState(false);

    // --- State Dialog ---
    const [dialogConfig, setDialogConfig] = useState<{
        visible: boolean;
        type: "success" | "error" | "warning" | "info" | "confirm";
        title: string;
        message: string;
        onConfirm?: () => void;
        confirmText?: string;
        closeText?: string;
        isDestructive?: boolean;
    }>({
        visible: false,
        type: "info",
        title: "",
        message: "",
    });

    const getErrorMessage = (e: any) => {
        if (e?.userMessage) return e.userMessage;
        const serverMsg = e?.response?.data?.message;
        if (typeof serverMsg === "string" && serverMsg.trim()) return serverMsg;
        if (typeof e?.message === "string" && e.message.trim()) return e.message;
        return "Không thể kết nối máy chủ. Vui lòng thử lại.";
    };

    // ✅ chỉ cho phép sửa khi: (Là tạo mới) HOẶC (Đang sửa và status là 'open')
    const isEditable = !isEditMode || status === "open";

    const FEEDBACK_OPTIONS: {
        id: FeedbackReason;
        label: string;
        icon: keyof typeof Ionicons.glyphMap;
        color: string;
        bgColor: string;
    }[] = [
            { id: "bug", label: "Báo lỗi", icon: "alert-circle", color: "#DC2626", bgColor: "#FEE2E2" },
            { id: "suggestion", label: "Góp ý", icon: "chatbubble-ellipses", color: "#2563EB", bgColor: "#EFF6FF" },
            { id: "general", label: "Chung", icon: "paper-plane", color: "#16A34A", bgColor: "#DCFCE7" },
        ];

    // --- 1. Load Data (Nếu có ID) ---
    useEffect(() => {
        requireAuth(
            router,
            setDialogConfig,
            async () => {
                if (!isEditMode) return;

                try {
                    // Tạm thời gọi list và filter (do BE chưa có API getDetail)
                    const res = await feedbackApi.getMyFeedback({ page: 1, pageSize: 100 });
                    const found = res.items.find((item) => item.id === id);

                    if (found) {
                        setTitle(found.title);
                        setContent(found.content);
                        setReason((found.reason as FeedbackReason) || "general");
                        setStatus(found.status);
                    } else {
                        // Không tìm thấy -> Báo lỗi (Dialog) + Back
                        setDialogConfig({
                            visible: true,
                            type: "error",
                            title: "Lỗi",
                            message: "Không tìm thấy phản hồi.",
                            confirmText: "Quay lại",
                            onConfirm: () => {
                                setDialogConfig((p) => ({ ...p, visible: false, onConfirm: undefined }));
                                router.back();
                            },
                        });
                    }
                } catch (error: any) {
                    // ✅ Fetch lỗi -> show dialog + Retry
                    const msg = getErrorMessage(error);
                    setDialogConfig({
                        visible: true,
                        type: "error",
                        title: "Lỗi tải dữ liệu",
                        message: msg,
                        confirmText: "Thử lại",
                        onConfirm: () => {
                            setDialogConfig((p) => ({ ...p, visible: false, onConfirm: undefined }));
                            // retry by re-running effect logic
                            // (gọi lại chính flow load detail)
                            requireAuth(
                                router,
                                setDialogConfig,
                                async () => {
                                    try {
                                        const res = await feedbackApi.getMyFeedback({ page: 1, pageSize: 100 });
                                        const found = res.items.find((item) => item.id === id);

                                        if (found) {
                                            setTitle(found.title);
                                            setContent(found.content);
                                            setReason((found.reason as FeedbackReason) || "general");
                                            setStatus(found.status);
                                        } else {
                                            setDialogConfig({
                                                visible: true,
                                                type: "error",
                                                title: "Lỗi",
                                                message: "Không tìm thấy phản hồi.",
                                                confirmText: "Quay lại",
                                                onConfirm: () => {
                                                    setDialogConfig((p) => ({ ...p, visible: false, onConfirm: undefined }));
                                                    router.back();
                                                },
                                            });
                                        }
                                    } catch (e2: any) {
                                        setDialogConfig({
                                            visible: true,
                                            type: "error",
                                            title: "Lỗi tải dữ liệu",
                                            message: getErrorMessage(e2),
                                            confirmText: "Đóng",
                                        });
                                    }
                                },
                                { title: "Yêu cầu đăng nhập", message: "Vui lòng đăng nhập để tiếp tục." }
                            );
                        },
                    });
                }
            },
            { title: "Yêu cầu đăng nhập", message: "Vui lòng đăng nhập để tiếp tục." }
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleChange = (field: "title" | "content", value: string) => {
        if (field === "title") setTitle(value);
        if (field === "content") setContent(value);
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    // --- Handler: Save (Create/Update) ---
    const handleSend = async () => {
        let newErrors = { title: "", content: "" };
        let hasError = false;

        if (!title.trim()) {
            newErrors.title = "Vui lòng nhập tiêu đề.";
            hasError = true;
        }
        if (!content.trim()) {
            newErrors.content = "Vui lòng nhập nội dung.";
            hasError = true;
        }

        setErrors(newErrors);
        if (hasError) return;

        requireAuth(
            router,
            setDialogConfig,
            async () => {
                setIsSending(true);
                try {
                    if (isEditMode) {
                        await feedbackApi.updateFeedback(id!, {
                            title: title.trim(),
                            reason,
                            content: content.trim(),
                        });

                        setDialogConfig({
                            visible: true,
                            type: "success",
                            title: "Đã cập nhật",
                            message: "Phản hồi của bạn đã được cập nhật thành công.",
                            confirmText: "Đồng ý",
                            onConfirm: () => {
                                setDialogConfig((p) => ({ ...p, visible: false, onConfirm: undefined }));
                                router.back();
                            },
                        });
                    } else {
                        await feedbackApi.createFeedback({
                            title: title.trim(),
                            reason,
                            content: content.trim(),
                        });

                        setDialogConfig({
                            visible: true,
                            type: "success",
                            title: "Cảm ơn",
                            message: "Chúng tôi đã nhận được phản hồi của bạn!",
                            confirmText: "Đồng ý",
                            onConfirm: () => {
                                setDialogConfig((p) => ({ ...p, visible: false, onConfirm: undefined }));
                                router.back();
                            },
                        });
                    }
                } catch (error: any) {
                    // ✅ API lỗi -> Dialog
                    const msg = getErrorMessage(error);
                    setDialogConfig({
                        visible: true,
                        type: "error",
                        title: "Lỗi",
                        message: msg,
                        confirmText: "Đóng",
                        onConfirm: () => setDialogConfig((prev) => ({ ...prev, visible: false, onConfirm: undefined })),
                    });
                } finally {
                    setIsSending(false);
                }
            },
            { title: "Yêu cầu đăng nhập", message: "Vui lòng đăng nhập để tiếp tục." }
        );
    };

    return (
        <View style={styles.container}>
            <AppDetailHeader title={isEditMode ? "Chi Tiết Phản Hồi" : "Gửi Phản Hồi"} />

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {/* --- 1. REASON --- */}
                        <AppText size="md" weight="bold" style={styles.sectionTitle}>
                            Lý do
                        </AppText>
                        <View style={styles.typeContainer}>
                            {FEEDBACK_OPTIONS.map((option) => {
                                const isSelected = reason === option.id;
                                return (
                                    <TouchableOpacity
                                        key={option.id}
                                        style={[
                                            styles.typeCard,
                                            isSelected
                                                ? {
                                                    backgroundColor: option.bgColor,
                                                    borderColor: option.color,
                                                    borderWidth: 2,
                                                    shadowColor: option.color,
                                                    shadowOpacity: 0.2,
                                                    shadowRadius: 4,
                                                    elevation: 4,
                                                    transform: [{ scale: 1.02 }],
                                                }
                                                : {
                                                    backgroundColor: "white",
                                                    borderColor: "#E5E7EB",
                                                    borderWidth: 1,
                                                    opacity: isEditable ? 1 : 0.6,
                                                },
                                        ]}
                                        disabled={!isEditable}
                                        onPress={() => setReason(option.id)}
                                        activeOpacity={0.9}
                                    >
                                        <View style={[styles.iconCircle, { backgroundColor: isSelected ? "white" : option.color }]}>
                                            <Ionicons name={option.icon} size={22} color={isSelected ? option.color : "white"} />
                                        </View>
                                        <AppText
                                            size="xs"
                                            weight={isSelected ? "bold" : "medium"}
                                            style={{
                                                marginTop: 8,
                                                color: isSelected ? option.color : theme.colors.text.primary,
                                            }}
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
                                Tiêu đề
                            </AppText>
                            <AppInput
                                value={title}
                                onChangeText={(val) => handleChange("title", val)}
                                placeholder="Tóm tắt ngắn gọn phản hồi của bạn..."
                                icon="text-outline"
                                error={errors.title}
                                editable={isEditable}
                            />
                        </View>

                        {/* --- 3. CONTENT --- */}
                        <View style={styles.inputSection}>
                            <AppText size="md" weight="bold" style={styles.sectionTitle}>
                                Nội dung
                            </AppText>
                            <AppInput
                                value={content}
                                onChangeText={(val) => handleChange("content", val)}
                                placeholder="Chia sẻ ý kiến của bạn với chúng tôi..."
                                multiline={true}
                                numberOfLines={6}
                                style={{ maxHeight: 150 }}
                                error={errors.content}
                                editable={isEditable}
                            />
                        </View>

                        {/* --- 4. Send Button --- */}
                        <AppButton
                            title={!isEditable ? "Chỉ Xem" : isEditMode ? "Cập Nhật Phản Hồi" : "Gửi Phản Hồi"}
                            onPress={handleSend}
                            isLoading={isSending}
                            disabled={isSending || !isEditable}
                            iconRight={true}
                            variant="primary"
                            icon={isEditMode ? "save-outline" : "send"}
                            style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.lg }}
                        />

                        {/* --- 5. Note --- */}
                        <AppBanner
                            variant="warning"
                            title="Lưu ý: "
                            message="Đối với các vấn đề khẩn cấp, vui lòng liên hệ chúng tôi qua support@itvocabmaster.com"
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
                closeText={dialogConfig.closeText}
                isDestructive={dialogConfig.isDestructive}
                onConfirm={dialogConfig.onConfirm}
                onClose={() => setDialogConfig((prev) => ({ ...prev, visible: false, onConfirm: undefined }))}
            />
        </View>
    );
};

// ... Styles giữ nguyên 100% như cũ ...
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
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
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: theme.spacing.lg,
    },
    typeCard: {
        width: "31%",
        aspectRatio: 1,
        borderRadius: theme.radius.lg,
        justifyContent: "center",
        alignItems: "center",
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
        justifyContent: "center",
        alignItems: "center",
    },
    inputSection: {
        marginBottom: theme.spacing.md,
    },
});

export default FeedbackFormView;