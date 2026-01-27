import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import theme from "../../theme";
import { AppText, HomeHeader } from "../core";

import HomeLevelCard from "./core/HomeLevelCard";
import HomeStreakBadge from "./core/HomeStreakBadge";
import QuizCard from "./core/QuizCard";
import QuizTabs, { QuizTabKey } from "./core/QuizTabs";

import { useProfileStore } from "@/store/useProfileStore";
import { quizApi, TopicQuizItem } from "../../api/quiz";
import PaginationControl from "../core/PaginationControl";

// ✅ Import Component Dialog và Empty
import AppDialog, { DialogType } from "../core/AppDialog";
import AppListEmpty from "../core/AppListEmpty";

// ✅ Import API Feedback (Giả định đường dẫn file bạn đã tạo)
import { feedbackApi } from "../../api/feedback";

const { width } = Dimensions.get("window");
const PAGE_SIZE = 10;

// ==========================================
// HELPER COMPONENTS & FUNCTIONS
// ==========================================

const RandomBanner = ({ onPress }: { onPress: () => void }) => {
  return (
    <View style={styles.bannerContainer}>
      <LinearGradient
        colors={theme.colors.slides.step1 as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bannerGradient}
      >
        <View style={styles.circleDecoration1} />
        <View style={styles.circleDecoration2} />

        <View style={styles.bannerContent}>
          <View style={styles.bannerTextContainer}>
            <AppText size="lg" weight="bold" color="white" style={{ marginBottom: 4 }}>
              Thử thách ngẫu nhiên
            </AppText>
            <AppText size="sm" color="rgba(255,255,255,0.9)">
              Kiểm tra kiến thức với bộ câu hỏi trộn lẫn từ nhiều chủ đề khác nhau.
            </AppText>
          </View>

          <View style={styles.iconContainer}>
            <Ionicons name="shuffle" size={60} color="rgba(255,255,255,0.3)" />
          </View>
        </View>

        <TouchableOpacity style={styles.playButton} onPress={onPress} activeOpacity={0.9}>
          <LinearGradient colors={["#FFFFFF", "#F0F0F0"]} style={styles.playButtonGradient}>
            <Ionicons name="play" size={28} color={theme.colors.primary} style={{ marginLeft: 4 }} />
            <AppText size="md" weight="bold" color={theme.colors.primary}>
              BẮT ĐẦU NGAY
            </AppText>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const getGradientByLevel = (level: number): [string, string] => {
  switch (level) {
    case 2:
      return theme.colors.slides.step2 as [string, string];
    case 3:
      return theme.colors.slides.step3 as [string, string];
    default:
      return theme.colors.slides.step1 as [string, string];
  }
};

// ==========================================
// MAIN COMPONENT
// ==========================================

const QuizView = () => {
  const [selectedTab, setSelectedTab] = useState<QuizTabKey>("TOPIC");

  // ===== TOPIC (API) =====
  const [topicItems, setTopicItems] = useState<TopicQuizItem[]>([]);
  const [topicPage, setTopicPage] = useState(1);
  const [topicTotalPages, setTopicTotalPages] = useState(1);
  const [topicLoading, setTopicLoading] = useState(false);

  // ===== Refresh =====
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ===== Dialog State =====
  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    type: DialogType;
    title: string;
    message: string;
    confirmText?: string;
    closeText?: string;
    onConfirm?: () => void;
  }>({
    visible: false,
    type: "error",
    title: "",
    message: "",
  });

  // Cache flag: đã load TOPIC lần nào chưa
  const hasLoadedTopicRef = useRef(false);

  const profile = useProfileStore((s) => s.profile);

  const userName = profile?.name?.trim() || "Khách";
  const streakDays = profile?.currentStreak ?? 0;

  const handleCloseDialog = useCallback(() => {
    setDialogConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  // ===== LOGIC: Fetch Topics =====
  const fetchTopicPage = useCallback(async (page: number, opts?: { refreshing?: boolean }) => {
    const refreshing = !!opts?.refreshing;

    if (!refreshing) setTopicLoading(true);
    try {
      const res = await quizApi.quizzesByTopics({ page, pageSize: PAGE_SIZE });
      setTopicItems(res.items || []);
      setTopicPage(res.page || page);
      setTopicTotalPages(res.totalPages || 1);

      hasLoadedTopicRef.current = true;
    } catch (e: any) {
      setTopicItems([]);
      setTopicTotalPages(1);

      const errorMsg = e.userMessage || "Không tải được danh sách chủ đề.";
      setDialogConfig({
        visible: true,
        type: "error",
        title: "Rất tiếc!",
        message: errorMsg,
        confirmText: "Đóng",
        onConfirm: handleCloseDialog,
      });
    } finally {
      setTopicLoading(false);
      if (refreshing) setIsRefreshing(false);
    }
  }, [handleCloseDialog]);

  useEffect(() => {
    if (selectedTab !== "TOPIC") return;
    if (hasLoadedTopicRef.current && topicItems.length > 0) return;
    const pageToLoad = topicPage || 1;
    fetchTopicPage(pageToLoad);
  }, [selectedTab, fetchTopicPage, topicItems.length, topicPage]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchTopicPage(1, { refreshing: true });
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchTopicPage]);

  const listData = useMemo(() => {
    if (selectedTab === "TOPIC") return topicItems;
    return [{ id: "RANDOM_BANNER_ITEM" }];
  }, [selectedTab, topicItems]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (selectedTab === "TOPIC") {
        setTopicPage(page);
        fetchTopicPage(page);
      }
    },
    [selectedTab, fetchTopicPage]
  );

  const handlePressTopic = useCallback((topicId: string, level: number, title: string) => {
    router.push({
      pathname: `/course/[id]`,
      params: {
        id: `${topicId}:${level}`,
        title,
        fromTab: "TOPIC",
      },
    });
  }, []);

  const handlePressRandomPlay = useCallback(() => {
    const defaultQuestions = 10;
    router.push({
      pathname: `/course/[id]`,
      params: {
        id: `random:${defaultQuestions}`,
        title: `Chế độ ngẫu nhiên`,
        fromTab: "RANDOM",
        totalQuestions: String(defaultQuestions),
      },
    });
  }, []);

  // ===== LOGIC: Feedback Button Press =====
  const handlePressFeedback = useCallback(() => {
    setDialogConfig({
      visible: true,
      type: "info",
      title: "Khảo sát ý kiến",
      message: "Chúng tôi rất trân trọng đóng góp của bạn. Bạn có muốn mở biểu mẫu (Google Form) để gửi phản hồi không?",
      confirmText: "Mở ngay",
      closeText: "Để sau",
      onConfirm: async () => {
        try {
          // 1. Đóng dialog
          handleCloseDialog();

          // 2. Gọi API lấy link
          const res = await feedbackApi.getFeedbackFormLink();

          if (res && res.formLink && res.formLink !== "Chưa có link") {
            // 3. Mở trình duyệt
            const supported = await Linking.canOpenURL(res.formLink);
            if (supported) {
              await Linking.openURL(res.formLink);
            } else {
              alert("Không thể mở liên kết này: " + res.formLink);
            }
          } else {
            // Fallback
            alert("Hiện chưa có biểu mẫu nào được kích hoạt.");
          }
        } catch (e) {
          console.error("Lỗi mở link feedback", e);
        }
      },
    });
  }, [handleCloseDialog]);

  return (
    <View style={styles.container}>
      <FlatList
        key={selectedTab}
        data={listData as any[]}
        keyExtractor={(item: any) =>
          selectedTab === "TOPIC" ? `${item.topicId}:${item.level}` : item.id
        }
        numColumns={selectedTab === "TOPIC" ? 2 : 1}
        ListHeaderComponent={
          <>
            <HomeHeader
              title={`Chào, ${userName}!`}
              subtitle="Cố gắng tiếp tục nhé!"
              rightComponent={
                <HomeStreakBadge
                  streakDays={streakDays}
                  unclaimed={profile?.unclaimedRewardsCount ?? 0}
                />
              }
              bottomContent={
                <HomeLevelCard
                  currentXP={profile?.currentXP ?? 0}
                  currentRank={profile?.currentRank ?? null}
                  nextRank={profile?.nextRank ?? null}
                />
              }
              height={240}
              containerStyle={styles.headerContainer}
            />

            <View style={styles.tabsWrapper}>
              <QuizTabs value={selectedTab} onChange={setSelectedTab} />
            </View>
          </>
        }
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={selectedTab === "TOPIC" ? styles.columnWrapper : undefined}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          selectedTab === "TOPIC" ? (
            <AppListEmpty
              isLoading={topicLoading}
              icon="book-outline"
              title="Không tìm thấy chủ đề nào"
              description="Thử kéo xuống để làm mới hoặc quay lại sau."
              containerStyle={{ paddingVertical: theme.spacing.huge }}
            />
          ) : null
        }
        renderItem={({ item }: { item: any }) => {
          if (selectedTab === "TOPIC") {
            const dynamicColors = getGradientByLevel(item.level);
            const percent = typeof item.percentCorrect === "number" ? item.percentCorrect : 0;
            const xp = typeof item.xp === "number" ? item.xp : 0;

            return (
              <QuizCard
                title={item.title}
                icon={"book-outline" as any}
                percentage={percent}
                xp={xp}
                colors={dynamicColors}
                onPress={() => handlePressTopic(item.topicId, item.level, item.title)}
              />
            );
          }

          return <RandomBanner onPress={handlePressRandomPlay} />;
        }}
        ListFooterComponent={
          selectedTab === "TOPIC" ? (
            <PaginationControl
              currentPage={topicPage}
              totalPages={topicTotalPages}
              onPageChange={handlePageChange}
              isLoading={topicLoading}
            />
          ) : null
        }
      />

      {/* ✅ NÚT FAB GOOGLE FORM + BADGE */}
      <TouchableOpacity
        style={styles.fabContainer}
        activeOpacity={0.8}
        onPress={handlePressFeedback}
      >
        <LinearGradient
          // Màu tím đặc trưng Google Form (Deep Purple)
          colors={["#673AB7", "#512DA8"]}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Icon Tờ giấy văn bản */}
          <Ionicons name="document-text" size={28} color="white" />
        </LinearGradient>

        {/* Badge dấu chấm than màu đỏ */}
        <View style={styles.badge}>
          <AppText size="xs" weight="bold" color="white">!</AppText>
        </View>
      </TouchableOpacity>

      {/* Global Dialog */}
      <AppDialog
        visible={dialogConfig.visible}
        type={dialogConfig.type}
        title={dialogConfig.title}
        message={dialogConfig.message}
        onClose={handleCloseDialog}
        onConfirm={dialogConfig.onConfirm}
        confirmText={dialogConfig.confirmText || "Đóng"}
        closeText={dialogConfig.closeText}
      />
    </View>
  );
};

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerContainer: { marginBottom: theme.spacing.sm },
  tabsWrapper: { marginBottom: theme.spacing.lg, paddingHorizontal: theme.spacing.md },
  listContent: { paddingBottom: theme.spacing.xl },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },

  // Banner Styles
  bannerContainer: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    width: "100%",
  },
  bannerGradient: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    minHeight: 200,
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  bannerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  bannerTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  iconContainer: {
    opacity: 0.8,
  },
  playButton: {
    marginTop: theme.spacing.xl,
    alignSelf: "center",
    width: "100%",
  },
  playButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: theme.radius.circle,
    gap: 8,
  },
  circleDecoration1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  circleDecoration2: {
    position: "absolute",
    bottom: -40,
    left: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  // ✅ FAB STYLES
  fabContainer: {
    position: "absolute",
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    shadowColor: "#673AB7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 999,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: theme.colors.error || "#EF4444",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.background,
    zIndex: 1000,
  },
});

export default QuizView;