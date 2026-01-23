// src/screens/leaderboard/LeaderboardView.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";

import theme from "../../theme";
import { HomeHeader } from "../core";

import LeaderboardPodium from "./core/LeaderboardPodium";
import LeaderboardRow from "./core/LeaderboardRow";
import LeaderboardTabs from "./core/LeaderboardTabs";
import StickyRankBar from "./core/StickyRankBar";

import { LeaderboardItem, RANK_COLORS, TabKey } from "./core/leaderboard.types";

import { leaderboardApi, LeaderboardTab, LeaderboardUser } from "@/api/leaderboard";
import { useProfileStore } from "@/store/useProfileStore";

import AppListEmpty from "../core/AppListEmpty";
// ✅ Import AppDialog
import AppDialog, { DialogType } from "../core/AppDialog";

function tabKeyToApiTab(tab: TabKey): LeaderboardTab {
    return tab === "XP" ? "xp" : "streak";
}

function mapUserToItem(u: LeaderboardUser, apiTab: LeaderboardTab): LeaderboardItem {
    return {
        id: String(u.userID),
        rank: u.rank,
        name: u.name ?? "User",
        avatarURL: u.avatarURL ?? null,

        xp: apiTab === "xp" ? u.value : 0,
        streak: apiTab === "streak" ? u.value : 0,

        rankLevel: u.rankLevel ?? null,
        itemImageURL: u.itemImageURL ?? null,
    };
}

type CacheEntry = {
    list: LeaderboardItem[];
    position: number | null;
    myValue: number | null;
};

type CacheMap = Record<LeaderboardTab, CacheEntry | null>;

const LeaderboardView = () => {
    const [selectedTab, setSelectedTab] = useState<TabKey>("XP");

    const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([]);
    const [myPosition, setMyPosition] = useState<number | null>(null);
    const [myValue, setMyValue] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState(false); // chỉ ảnh hưởng phần content
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ✅ Dialog State
    const [dialogConfig, setDialogConfig] = useState<{
        visible: boolean;
        type: DialogType;
        title: string;
        message: string;
    }>({
        visible: false,
        type: "error",
        title: "",
        message: "",
    });

    const apiTab: LeaderboardTab = useMemo(() => tabKeyToApiTab(selectedTab), [selectedTab]);

    // profile -> name + fallback value
    const myName = useProfileStore((s) => s.profile?.name) ?? null;
    const myProfileValue = useProfileStore((s) =>
        selectedTab === "XP" ? s.profile?.currentXP : s.profile?.currentStreak
    );

    // ✅ cache giống RewardsView
    const cacheRef = useRef<CacheMap>({ xp: null, streak: null });
    const hasFetchedRef = useRef<Record<LeaderboardTab, boolean>>({ xp: false, streak: false });

    // ✅ guard race khi đổi tab nhanh
    const requestSeqRef = useRef(0);

    // ✅ Helper đóng dialog
    const handleCloseDialog = () => {
        setDialogConfig((prev) => ({ ...prev, visible: false }));
    };

    const fetchLeaderboard = useCallback(
        async (opts?: { isRefresh?: boolean }) => {
            const isRefresh = opts?.isRefresh ?? false;
            const seq = ++requestSeqRef.current;

            // ✅ Nếu đã fetch và không refresh => dùng cache, không gọi API
            if (!isRefresh && hasFetchedRef.current[apiTab]) {
                const cached = cacheRef.current[apiTab];
                if (cached) {
                    setLeaderboardData(cached.list);
                    setMyPosition(cached.position);
                    setMyValue(cached.myValue);
                    setError(null);
                }
                return;
            }

            try {
                setError(null);
                if (isRefresh) setIsRefreshing(true);
                else setIsLoading(true);

                const res = await leaderboardApi.get(apiTab);

                // nếu request cũ -> bỏ
                if (seq !== requestSeqRef.current) return;

                const items = (res.userList ?? []).map((u) => mapUserToItem(u, apiTab));
                items.sort((a, b) => a.rank - b.rank);

                const position = res.position ?? null;

                // myValue: ưu tiên top10, fallback profile
                let v: number | null = null;
                if (position != null) {
                    const meInTop10 = res.userList.find((x) => x.rank === position);
                    v = meInTop10?.value ?? null;
                }
                if (v == null) v = myProfileValue ?? null;

                setLeaderboardData(items);
                setMyPosition(position);
                setMyValue(v);

                // ✅ update cache + mark fetched
                cacheRef.current[apiTab] = { list: items, position, myValue: v };
                hasFetchedRef.current[apiTab] = true;
            } catch (e: any) {
                if (seq !== requestSeqRef.current) return;

                // ✅ Lấy message lỗi thân thiện
                const msg = e?.userMessage || e?.message || "Không thể tải bảng xếp hạng.";

                setError(msg); // Để hiển thị icon lỗi ở background
                setLeaderboardData([]);
                setMyPosition(null);
                setMyValue(myProfileValue ?? null);

                // ✅ Hiển thị Dialog lỗi
                setDialogConfig({
                    visible: true,
                    type: "error",
                    title: "Rất tiếc!",
                    message: msg,
                });

                // ✅ vẫn cache empty để khỏi spam API (giống rewardview)
                cacheRef.current[apiTab] = { list: [], position: null, myValue: myProfileValue ?? null };
                hasFetchedRef.current[apiTab] = true;
            } finally {
                if (seq === requestSeqRef.current) {
                    setIsLoading(false);
                    setIsRefreshing(false);
                }
            }
        },
        [apiTab, myProfileValue]
    );

    // ✅ Khi đổi tab: nếu có cache -> set ngay, không fetch; nếu chưa -> fetch 1 lần
    useEffect(() => {
        const cached = cacheRef.current[apiTab];
        if (cached && hasFetchedRef.current[apiTab]) {
            setLeaderboardData(cached.list);
            setMyPosition(cached.position);
            setMyValue(cached.myValue);
            setError(null);
            setIsLoading(false);
            setIsRefreshing(false);
            return;
        }

        // chưa có cache -> gọi 1 lần
        fetchLeaderboard({ isRefresh: false });
    }, [apiTab, fetchLeaderboard]);

    const topThree = useMemo(() => leaderboardData.slice(0, 3), [leaderboardData]);
    const restList = useMemo(() => leaderboardData.slice(3), [leaderboardData]);

    const onRefresh = useCallback(() => {
        // refresh => luôn gọi API, update cache
        fetchLeaderboard({ isRefresh: true });
    }, [fetchLeaderboard]);

    const renderHeader = () => (
        <>
            <View style={styles.headerWrapper}>
                <HomeHeader
                    title="Leaderboard"
                    subtitle={selectedTab === "XP" ? "Top Students by XP" : "Top Study Streaks"}
                    rightIcon="trophy"
                    gradientColors={RANK_COLORS.gold.gradient}
                    containerStyle={{ paddingBottom: theme.spacing.lgx }}
                    height={260}
                    bottomContent={<LeaderboardTabs value={selectedTab} onChange={setSelectedTab} />}
                />
            </View>

            <LeaderboardPodium topThree={topThree} selectedTab={selectedTab} />
        </>
    );

    const emptyTitle = error ? "Failed to load leaderboard" : "No data yet";
    const emptyDesc = error ? "Pull to refresh to try again." : "Pull to refresh.";
    const emptyIcon = error ? "alert-circle-outline" : "trophy-outline";

    return (
        <View style={styles.container}>
            <FlatList
                data={restList}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <LeaderboardRow item={item} selectedTab={selectedTab} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={<View style={{ height: theme.spacing.lg * 4 }} />}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <AppListEmpty
                        isLoading={isLoading}
                        icon={emptyIcon as any}
                        title={emptyTitle}
                        description={emptyDesc}
                        containerStyle={{ paddingVertical: theme.spacing.huge }}
                    />
                }
            />

            <StickyRankBar
                selectedTab={selectedTab}
                position={myPosition}
                meValue={myValue}
                displayName={myName ?? "Guest User"}
            />

            {/* ✅ Dialog Component */}
            <AppDialog
                visible={dialogConfig.visible}
                type={dialogConfig.type}
                title={dialogConfig.title}
                message={dialogConfig.message}
                onClose={handleCloseDialog}
                confirmText="Đóng"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB" },
    headerWrapper: { marginBottom: -30, zIndex: 0 },
    listContent: { paddingBottom: theme.spacing.md },
});

export default LeaderboardView;