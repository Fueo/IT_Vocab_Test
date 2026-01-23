// RewardsView.tsx
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import theme from "../../theme";
import { AppText, HomeHeader } from "../core";

import RewardCard from "./core/RewardCard";

// ✅ Pagination + Empty
import AppListEmpty from "../core/AppListEmpty";
import PaginationControl from "../core/PaginationControl";

// ✅ API
import { rewardApi, RoadmapMilestoneDto } from "@/api/reward";

// ✅ Types local (UI)
import { Reward, RewardSectionKey, RewardState } from "./core/rewards.data";

// ✅ NEW: profile store để giảm badge count
import { useProfileStore } from "@/store/useProfileStore";

// ✅ Dialog
import AppDialog, { DialogType } from "../core/AppDialog";

const FILTERS: { key: RewardSectionKey; label: string }[] = [
  { key: "level", label: "Level" },
  { key: "streak", label: "Streak" },
];

const SECTION_META: Record<RewardSectionKey, { title: string; subtitle: string }> = {
  level: {
    title: "Level Rewards",
    subtitle: "Unlock rewards when you reach a level milestone.",
  },
  streak: {
    title: "Streak Rewards",
    subtitle: "Keep your streak going to earn streak rewards.",
  },
} as any;

function mapStateToRewardState(state: "LOCKED" | "CLAIMABLE" | "CLAIMED"): RewardState {
  if (state === "CLAIMABLE") return "claimable";
  if (state === "CLAIMED") return "claimed";
  return "locked";
}

function isFrameItem(it: any) {
  const t = String(it?.itemType || "").toLowerCase();
  return t.includes("skin");
}

function pickPrimaryItem(items?: any[]) {
  const arr = Array.isArray(items) ? items : [];
  if (arr.length === 0) return { primary: null, restCount: 0, reordered: [] as any[] };

  const frame = arr.find(isFrameItem);
  const primary = frame || arr[0];

  const reordered = [primary, ...arr.filter((x) => x !== primary)];
  const restCount = Math.max(0, reordered.length - 1);

  return { primary, restCount, reordered };
}

function pickTitleFromItems(items?: any[]) {
  const { primary, restCount } = pickPrimaryItem(items);
  if (!primary?.itemName) return null;
  return restCount > 0 ? `${primary.itemName} + ${restCount} Item khác` : primary.itemName;
}

function mapMilestoneToReward(m: RoadmapMilestoneDto): Reward {
  const rawItems = m.rewards ?? [];
  const { reordered } = pickPrimaryItem(rawItems);

  const titleFromItem = pickTitleFromItems(rawItems);

  const common = {
    id: m._id,
    state: mapStateToRewardState(m.state),
    claimInboxId: m.claim?.inboxId ?? null,
    items: reordered,
  };

  if (m.type === "RANK") {
    return {
      ...common,
      title: titleFromItem || m.name,
      description: `Reach Level ${m.level} to unlock this reward.`,
      requirementText: `Reach Level ${m.level}`,
      type: "consumable",
      icon: "trophy-outline",
    };
  }

  return {
    ...common,
    title: titleFromItem || (m as any).title,
    description: `Maintain ${(m as any).dayNumber}-day streak to unlock this reward.`,
    requirementText: `Maintain ${(m as any).dayNumber}-day streak`,
    type: "badge",
    icon: "flame-outline",
  };
}

type RoadmapPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// ✅ cache theo type để quay lại tab không gọi API nữa
type CacheEntry = {
  milestones: RoadmapMilestoneDto[];
  pagination: RoadmapPagination;
  page: number;
};
type CacheMap = Record<"RANK" | "STREAK", CacheEntry | null>;

const RewardsView = () => {
  const [activeFilter, setActiveFilter] = useState<RewardSectionKey>("level");

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [milestones, setMilestones] = useState<RoadmapMilestoneDto[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ✅ Pagination state
  const [page, setPage] = useState(1);
  const limit = 10;
  const [pagination, setPagination] = useState<RoadmapPagination>({
    page: 1,
    limit,
    total: 0,
    totalPages: 1,
  });

  // ✅ Dialog giống InventoryView
  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    type: DialogType;
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
  }>({
    visible: false,
    type: "error",
    title: "",
    message: "",
  });

  const handleCloseDialog = () => {
    setDialogConfig((prev) => ({ ...prev, visible: false, onConfirm: undefined }));
  };

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

  const apiType = useMemo(() => {
    if (activeFilter === "level") return "RANK" as const;
    return "STREAK" as const;
  }, [activeFilter]);

  // ✅ cache + guard
  const cacheRef = useRef<CacheMap>({ RANK: null, STREAK: null });
  const hasFetchedRef = useRef<{ RANK: boolean; STREAK: boolean }>({ RANK: false, STREAK: false });

  async function fetchRoadmap(opts?: { isRefresh?: boolean; nextPage?: number }) {
    const nextPage = opts?.nextPage ?? page;
    const isRefresh = opts?.isRefresh ?? false;

    // ✅ nếu không refresh và đã fetch rồi -> ưu tiên cache
    if (!isRefresh && hasFetchedRef.current[apiType]) {
      const cached = cacheRef.current[apiType];
      if (cached) {
        setMilestones(cached.milestones);
        setPagination(cached.pagination);
        setPage(cached.page);
      }
      return;
    }

    try {
      setErrorMsg(null);
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data: any = await rewardApi.getRoadmap({
        type: apiType,
        status: "ALL",
        page: nextPage,
        limit,
      });

      const nextMilestones = data.milestones || [];

      let nextPagination: RoadmapPagination;
      if (data.pagination) {
        nextPagination = {
          page: data.pagination.page ?? nextPage,
          limit: data.pagination.limit ?? limit,
          total: data.pagination.total ?? 0,
          totalPages: data.pagination.totalPages ?? 1,
        };
      } else {
        nextPagination = {
          page: nextPage,
          limit,
          total: nextMilestones.length,
          totalPages: 1,
        };
      }

      setMilestones(nextMilestones);
      setPagination(nextPagination);
      setPage(nextPage);

      // ✅ save cache + mark fetched
      cacheRef.current[apiType] = {
        milestones: nextMilestones,
        pagination: nextPagination,
        page: nextPage,
      };
      hasFetchedRef.current[apiType] = true;
    } catch (e: any) {
      // ✅ giống InventoryView: show dialog lỗi
      const msg = e?.userMessage || e?.response?.data?.message || "Failed to load rewards.";

      setErrorMsg(msg);
      setMilestones([]);
      const fallback = { page: nextPage, limit, total: 0, totalPages: 1 };
      setPagination(fallback);
      setPage(nextPage);

      // cache empty (tuỳ bạn có muốn hay không)
      cacheRef.current[apiType] = { milestones: [], pagination: fallback, page: nextPage };
      hasFetchedRef.current[apiType] = true;

      setDialogConfig({
        visible: true,
        type: "error",
        title: "Rất tiếc!",
        message: msg,
        confirmText: "Thử lại",
        onConfirm: () => {
          // ✅ retry chủ động
          setDialogConfig((prev) => ({ ...prev, visible: false, onConfirm: undefined }));
          hasFetchedRef.current[apiType] = false; // cho phép gọi lại
          fetchRoadmap({ isRefresh: false, nextPage: 1 });
        },
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // ✅ chỉ gọi API lần đầu cho từng type, còn lại ưu tiên cache
  useEffect(() => {
    // reset UI page khi đổi filter
    setPage(1);
    setPagination({ page: 1, limit, total: 0, totalPages: 1 });

    const cached = cacheRef.current[apiType];
    if (cached && hasFetchedRef.current[apiType]) {
      setMilestones(cached.milestones);
      setPagination(cached.pagination);
      setPage(cached.page);
      return;
    }

    fetchRoadmap({ isRefresh: false, nextPage: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiType]);

  const rewards: Reward[] = useMemo(() => milestones.map(mapMilestoneToReward), [milestones]);

  const handleClaim = async (reward: Reward) => {
    if (reward.state !== "claimable") return;

    const inboxId = reward.claimInboxId;
    if (!inboxId) return;

    try {
      setRefreshing(true);

      await rewardApi.claim(inboxId);

      // ✅ giảm badge count ngay lập tức (optimistic)
      const { profile, patchProfile } = useProfileStore.getState();
      const prev = Math.max(0, Number(profile?.unclaimedRewardsCount ?? 0));
      patchProfile({ unclaimedRewardsCount: Math.max(0, prev - 1) });

      // ✅ claim xong refetch lại đúng trang hiện tại
      await fetchRoadmap({ isRefresh: true, nextPage: page });
    } catch (e: any) {
      const msg = e?.userMessage || "Claim failed.";
      setDialogConfig({
        visible: true,
        type: "error",
        title: "Rất tiếc!",
        message: msg,
        confirmText: "Đóng",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleCardPress = (reward: Reward) => {
    if (reward.state !== "claimed") return;

    const primaryItemId = reward.items?.[0]?.itemId;

    router.replace({
      pathname: "/tabs/inventory",
      params: primaryItemId ? { itemId: String(primaryItemId) } : {},
    });
  };

  const handlePageChange = (next: number) => {
    fetchRoadmap({ isRefresh: true, nextPage: next });
  };

  const onPullRefresh = async () => {
    setPage(1);
    await fetchRoadmap({ isRefresh: true, nextPage: 1 });
  };

  const renderFilters = () => (
    <View style={styles.filterWrap}>
      {FILTERS.map((f) => {
        const active = f.key === activeFilter;

        return (
          <TouchableOpacity
            key={f.key}
            activeOpacity={0.85}
            onPress={() => setActiveFilter(f.key)}
            style={[styles.filterBtn, active && styles.filterBtnActive]}
          >
            <AppText
              size="sm"
              weight={active ? "bold" : "regular"}
              color={active ? theme.colors.text.primary : "rgba(255,255,255,0.9)"}
            >
              {f.label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const sectionTitle = SECTION_META[activeFilter]?.title ?? "Rewards";
  const sectionSubtitle =
    SECTION_META[activeFilter]?.subtitle ?? "Unlock rewards by leveling up and keeping streaks.";

  const showEmpty = !loading && rewards.length === 0;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onPullRefresh} />}
      >
        <HomeHeader
          title="Rewards"
          subtitle="Unlock rewards by leveling up, keeping streaks, and ranking high."
          rightIcon="gift-outline"
          height={250}
          bottomContent={renderFilters()}
          showRightIconBackground={true}
        />

        <View style={styles.content}>
          <AppText
            size="lg"
            weight="bold"
            color={theme.colors.text.primary}
            style={{ marginBottom: theme.spacing.xs }}
          >
            {sectionTitle}
          </AppText>

          <AppText
            size="sm"
            color={theme.colors.text.secondary}
            style={{ marginBottom: theme.spacing.md }}
          >
            {sectionSubtitle}
          </AppText>

          {loading ? (
            <View style={{ paddingVertical: theme.spacing.lg }}>
              <ActivityIndicator />
            </View>
          ) : showEmpty ? (
            <AppListEmpty
              icon="gift-outline"
              title={errorMsg ? "Cannot load rewards" : "No rewards found"}
              description={errorMsg ? "Pull to refresh or tap Retry." : "Try another category or come back later."}
            />
          ) : (
            <>
              {rewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  onPress={handleCardPress}
                  onClaim={handleClaim}
                />
              ))}

              <PaginationControl
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                isLoading={loading || refreshing}
              />
            </>
          )}
        </View>
      </ScrollView>

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

      {/* ✅ Dialog lỗi fetch API giống InventoryView */}
      <AppDialog
        visible={dialogConfig.visible}
        type={dialogConfig.type}
        title={dialogConfig.title}
        message={dialogConfig.message}
        onClose={handleCloseDialog}
        onConfirm={dialogConfig.onConfirm}
        confirmText={dialogConfig.confirmText || "Đóng"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.cardBackground },
  scroll: { paddingBottom: theme.spacing.lg * 4 },
  content: { padding: theme.spacing.md },

  filterWrap: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: theme.radius.xl,
    padding: 4,
    marginTop: theme.spacing.md,
    width: "90%",
    alignSelf: "center",
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: theme.radius.xl,
  },
  filterBtnActive: {
    backgroundColor: "white",
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

export default RewardsView;
