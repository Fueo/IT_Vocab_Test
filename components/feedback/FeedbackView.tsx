// FeedbackView.tsx
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    Animated,
    FlatList,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

import theme from "../../theme";
import { AppDialog, AppListEmpty, AppListFooter, AppText, HomeHeader } from "../core";
import FeedbackCard from "./core/FeedbackCard";

import { feedbackApi, FeedbackItemDto } from "../../api/feedback";
import { requireAuth } from "../../utils/authUtils";

const ITEMS_PER_PAGE = 10;

const FeedbackView = () => {
    const router = useRouter();

    // --- State ---
    const [feedbacks, setFeedbacks] = useState<FeedbackItemDto[]>([]);
    const [total, setTotal] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Dialog State
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

    const isLoadingRef = useRef(false);

    // ✅ focus guard: lần đầu vào màn (mount) gọi init, những lần focus sau gọi refresh
    const hasFocusedOnceRef = useRef(false);

    // ✅ Animation nút Back
    const statusBarHeight = Constants.statusBarHeight;
    const backScale = useMemo(() => new Animated.Value(1), []);
    const animateBack = (to: number) => {
        Animated.spring(backScale, {
            toValue: to,
            useNativeDriver: true,
            speed: 30,
            bounciness: 8,
        }).start();
    };

    // ✅ Helper lấy lỗi chuẩn
    const getErrorMessage = (e: any) => {
        if (e?.userMessage) return e.userMessage;
        const serverMsg = e?.response?.data?.message;
        if (typeof serverMsg === "string" && serverMsg.trim()) return serverMsg;
        if (typeof e?.message === "string" && e.message.trim()) return e.message;
        return "Không thể kết nối máy chủ. Vui lòng thử lại.";
    };

    // --- Logic Load Data ---
    const loadData = useCallback(
        async (page: number, type: "init" | "refresh" | "loadMore" = "init") => {
            if (isLoadingRef.current && type === "loadMore") return;

            isLoadingRef.current = true;
            if (type === "init") setIsLoading(true);
            if (type === "loadMore") setIsLoadingMore(true);

            try {
                const res = await feedbackApi.getMyFeedback({
                    page,
                    pageSize: ITEMS_PER_PAGE,
                });

                if (type === "loadMore") {
                    setFeedbacks((prev) => [...prev, ...(res.items || [])]);
                } else {
                    setFeedbacks(res.items || []);
                }

                setTotal(res.total || 0);
                setHasMore(page < (res.totalPages || 1));
            } catch (error: any) {
                const msg = getErrorMessage(error);

                // ✅ show dialog lỗi + nút thử lại
                setDialogConfig({
                    visible: true,
                    type: "error",
                    title: "Lỗi tải dữ liệu",
                    message: msg,
                    confirmText: "Thử lại",
                    closeText: "Đóng",
                    onConfirm: () => {
                        setDialogConfig((prev) => ({ ...prev, visible: false, onConfirm: undefined }));
                        setCurrentPage(1);
                        loadData(1, "init");
                    },
                });

                // fallback UI khi lỗi
                if (type !== "loadMore") {
                    setFeedbacks([]);
                    setTotal(0);
                    setHasMore(false);
                    setCurrentPage(1);
                }
            } finally {
                isLoadingRef.current = false;
                setIsLoading(false);
                setIsLoadingMore(false);
                setIsRefreshing(false);
            }
        },
        []
    );

    // ✅ Auto call API khi focus lại màn hình (khi router.back() từ FeedbackFormView)
    useFocusEffect(
        useCallback(() => {
            requireAuth(
                router,
                setDialogConfig,
                () => {
                    // Lần đầu: init, những lần sau: refresh
                    const isFirstFocus = !hasFocusedOnceRef.current;
                    hasFocusedOnceRef.current = true;

                    const nextType: "init" | "refresh" = isFirstFocus ? "init" : "refresh";
                    setCurrentPage(1);
                    loadData(1, nextType);
                },
                { message: "Vui lòng đăng nhập để xem lịch sử feedback." }
            );

            return () => { };
        }, [router, loadData])
    );

    // --- Handlers ---
    const handleRefresh = useCallback(() => {
        if (isLoadingRef.current) return;
        setIsRefreshing(true);
        setCurrentPage(1);
        loadData(1, "refresh");
    }, [loadData]);

    const handleLoadMore = useCallback(() => {
        if (feedbacks.length === 0) return;
        if (!hasMore || isLoadingRef.current || isRefreshing) return;

        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        loadData(nextPage, "loadMore");
    }, [hasMore, isRefreshing, currentPage, loadData, feedbacks.length]);

    const handleCreatePress = () => {
        router.push("/feedback/form");
    };

    const handleItemPress = (item: FeedbackItemDto) => {
        router.push({
            pathname: "/feedback/form",
            params: { id: item.id },
        });
    };

    const handleDeletePress = (item: FeedbackItemDto) => {
        setDialogConfig({
            visible: true,
            type: "confirm",
            title: "Xoá Phản Hồi",
            message: "Bạn có chắc chắn muốn xoá phản hồi này không? Hành động này không thể hoàn tác.",
            confirmText: "Xoá",
            closeText: "Huỷ",
            isDestructive: true,
            onConfirm: async () => {
                try {
                    setDialogConfig((prev) => ({ ...prev, visible: false, onConfirm: undefined }));
                    await feedbackApi.deleteFeedback(item.id);

                    setFeedbacks((prev) => prev.filter((f) => f.id !== item.id));
                    setTotal((prev) => Math.max(0, prev - 1));
                } catch (error: any) {
                    const msg = getErrorMessage(error);
                    setTimeout(() => {
                        setDialogConfig({
                            visible: true,
                            type: "error",
                            title: "Lỗi",
                            message: msg || "Không thể xoá phản hồi.",
                            confirmText: "Đóng",
                            closeText: undefined,
                            isDestructive: false,
                        });
                    }, 200);
                }
            },
        });
    };

    // --- Components ---
    const renderRightComponent = () => (
        <TouchableOpacity style={styles.headerCreateBtn} onPress={handleCreatePress} activeOpacity={0.7}>
            <Ionicons name="add" size={20} color={theme.colors.text.white} />
            <AppText size="sm" weight="bold" color={theme.colors.text.white} style={{ marginLeft: 4 }}>
                Gửi mới
            </AppText>
        </TouchableOpacity>
    );

    // --- Render ---
    return (
        <View style={styles.container}>
            <HomeHeader title="Lịch sử Phản Hồi" subtitle={`${total} phản hồi đã gửi`} rightComponent={renderRightComponent()} />

            <FlatList
                data={feedbacks}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
                }
                renderItem={({ item }) => (
                    <View style={styles.itemWrapper}>
                        <FeedbackCard item={item} onPress={() => handleItemPress(item)} onDelete={() => handleDeletePress(item)} />
                    </View>
                )}
                ListEmptyComponent={
                    <AppListEmpty
                        isLoading={isLoading}
                        title="Chưa có phản hồi nào"
                        description="Hãy gửi đóng góp ý kiến của bạn cho chúng tôi nhé."
                    />
                }
                ListFooterComponent={<AppListFooter isLoadingMore={isLoadingMore} hasMore={hasMore} dataLength={feedbacks.length} />}
            />

            {/* 🔙 BACK BUTTON OVERLAY */}
            <Animated.View
                style={[
                    styles.backButtonWrap,
                    {
                        top: statusBarHeight + theme.spacing.sm,
                        transform: [{ scale: backScale }],
                    },
                ]}
            >
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => router.back()}
                    onPressIn={() => animateBack(0.92)}
                    onPressOut={() => animateBack(1)}
                    style={styles.backButton}
                >
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
            </Animated.View>

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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    listContent: { paddingBottom: theme.spacing.xl, paddingTop: theme.spacing.md },
    itemWrapper: { paddingHorizontal: theme.spacing.md },
    headerCreateBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: theme.radius.circle,
        backgroundColor: "rgba(255,255,255,0.2)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
    },
    backButtonWrap: {
        position: "absolute",
        left: theme.spacing.md,
        zIndex: 50,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.35)",
    },
});

export default FeedbackView;