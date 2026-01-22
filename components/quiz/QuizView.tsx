import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

import theme from "../../theme";
import { AppText, HomeHeader } from "../core";

import HomeLevelCard from "./core/HomeLevelCard";
import HomeStreakBadge from "./core/HomeStreakBadge";
import QuizCard from "./core/QuizCard";
import QuizTabs, { QuizTabKey } from "./core/QuizTabs";

import { useProfileStore } from "@/store/useProfileStore";
import { quizApi, TopicQuizItem } from "../../api/quiz";
import { fetchProfile } from "../../store/profileActions";
import PaginationControl from "../core/PaginationControl";

const { width } = Dimensions.get("window");
const PAGE_SIZE = 10;

// ✅ Component Banner Random
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

        <TouchableOpacity
          style={styles.playButton}
          onPress={onPress}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#FFFFFF", "#F0F0F0"]}
            style={styles.playButtonGradient}
          >
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

// ✅ Helper lấy màu
const getGradientByLevel = (level: number): [string, string] => {
  switch (level) {
    case 2:
      return theme.colors.slides.step2 as [string, string]; // Màu Cam
    case 3:
      return theme.colors.slides.step3 as [string, string]; // Màu Tím
    default:
      return theme.colors.slides.step1 as [string, string]; // Màu Xanh
  }
};

const QuizView = () => {
  const [selectedTab, setSelectedTab] = useState<QuizTabKey>("TOPIC");

  // ===== TOPIC (API) =====
  const [topicItems, setTopicItems] = useState<TopicQuizItem[]>([]);
  const [topicPage, setTopicPage] = useState(1);
  const [topicTotalPages, setTopicTotalPages] = useState(1);
  const [topicLoading, setTopicLoading] = useState(false);

  // ===== refresh =====
  const [isRefreshing, setIsRefreshing] = useState(false);

const profile = useProfileStore((s) => s.profile);
const isLoadingProfile = useProfileStore((s) => s.isLoading);
const profileError = useProfileStore((s) => s.error);

const userName = profile?.name?.trim() || "Guest";
const streakDays = profile?.currentStreak ?? 0;

  const fetchTopicPage = async (page: number, opts?: { refreshing?: boolean }) => {
    const refreshing = !!opts?.refreshing;

    if (!refreshing) setTopicLoading(true);
    try {
      const res = await quizApi.quizzesByTopics({ page, pageSize: PAGE_SIZE });
      setTopicItems(res.items || []);
      setTopicPage(res.page || page);
      setTopicTotalPages(res.totalPages || 1);
    } catch (e) {
      setTopicItems([]);
      setTopicTotalPages(1);
    } finally {
      setTopicLoading(false);
      if (refreshing) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTopicPage(1);
  }, []);

  useEffect(() => {
    if (selectedTab === "TOPIC") {
      setTopicPage(1);
      fetchTopicPage(1);
    }
  }, [selectedTab]);

const onRefresh = async () => {
  setIsRefreshing(true);
  try {
    await Promise.all([
      fetchProfile({ silent: true }), // refresh profile
      fetchTopicPage(1, { refreshing: true }), // refresh quiz list
    ]);
  } finally {
    setIsRefreshing(false);
  }
};

  const listData = useMemo(() => {
    if (selectedTab === "TOPIC") return topicItems;
    return [{ id: "RANDOM_BANNER_ITEM" }];
  }, [selectedTab, topicItems]);

  const handlePageChange = (page: number) => {
    if (selectedTab === "TOPIC") {
      setTopicPage(page);
      fetchTopicPage(page);
    }
  };

  const handlePressTopic = (topicId: string, level: number, title: string) => {
    router.push({
      pathname: `/course/[id]`,
      params: {
        id: `${topicId}:${level}`,
        title,
        fromTab: "TOPIC",
      },
    });
  };

  const handlePressRandomPlay = () => {
    const defaultQuestions = 10;
    router.push({
      pathname: `/course/[id]`,
      params: {
        id: `random:${defaultQuestions}`,
        title: `Random Mode`,
        fromTab: "RANDOM",
        totalQuestions: String(defaultQuestions),
      },
    });
  };

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
              title={`Hi, ${userName}!`}
              subtitle="Keep up the great work!"
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
          <View style={styles.emptyContainer}>
            <AppText color={theme.colors.text.secondary}>
              {selectedTab === "TOPIC"
                ? topicLoading ? "Loading quizzes..." : "No topic quizzes found"
                : ""}
            </AppText>
          </View>
        }
        
        renderItem={({ item }: { item: any }) => {
          // 🎨 RENDER TOPIC CARD VỚI MÀU DYNAMIC
          if (selectedTab === "TOPIC") {
            const dynamicColors = getGradientByLevel(item.level); // <--- LẤY MÀU Ở ĐÂY

            return (
              <QuizCard
                title={item.title}
                icon={"book-outline" as any}
                percentage={0}
                xp={0}
                colors={dynamicColors} // <--- TRUYỀN MÀU VÀO CARD
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
    </View>
  );
};

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
  emptyContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  
  // ===== STYLES CHO RANDOM BANNER =====
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
    borderRadius: theme.radius.circle, // Sửa thành full cho tròn đẹp
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
});

export default QuizView;