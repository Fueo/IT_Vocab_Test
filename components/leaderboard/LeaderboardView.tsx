import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import theme from '../../theme';
import { AppText, HomeHeader } from '../core';

import LeaderboardPodium from './core/LeaderboardPodium';
import LeaderboardRow from './core/LeaderboardRow';
import LeaderboardTabs from './core/LeaderboardTabs';
import StickyRankBar from './core/StickyRankBar';

import { LEADERBOARD_DATA, RANK_COLORS, TabKey } from './core/leaderboard.data';

type LeaderboardItem = (typeof LEADERBOARD_DATA)[number];
type LeaderboardItemWithRank = LeaderboardItem & { rank: number };

const LeaderboardView = () => {
    const [selectedTab, setSelectedTab] = useState<TabKey>('XP');

    const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>(LEADERBOARD_DATA);

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLeaderboard = useCallback(async () => {
        try {
            setError(null);
            if (!isRefreshing) setIsLoading(true);

            // ---- MOCK: giả lập call API ----
            await new Promise((r) => setTimeout(r, 500));
            const dataFromServer = LEADERBOARD_DATA;
            // ------------------------------

            setLeaderboardData(dataFromServer);
        } catch (e: any) {
            setError(e?.message ?? 'Failed to load leaderboard');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [isRefreshing]);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    const sortedData: LeaderboardItemWithRank[] = useMemo(() => {
        const data = [...leaderboardData];
        data.sort((a, b) => {
            if (selectedTab === 'Streak') return (b.streak || 0) - (a.streak || 0);
            return (b.xp || 0) - (a.xp || 0);
        });
        return data.map((item, index) => ({ ...item, rank: index + 1 }));
    }, [leaderboardData, selectedTab]);

    const topThree = sortedData.slice(0, 3);
    const restList = sortedData.slice(3);

    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    const renderHeader = () => (
        <>
            <View style={styles.headerWrapper}>
                <HomeHeader
                    title="Leaderboard"
                    subtitle={selectedTab === 'XP' ? 'Top Students by XP' : 'Top Study Streaks'}
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

    const renderEmpty = () => {
        if (isLoading) return null;

        if (error) {
            return (
                <View style={styles.center}>
                    <AppText weight="bold" color={theme.colors.error}>
                        {error}
                    </AppText>
                    <AppText size="sm" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xs }}>
                        Pull to refresh to try again.
                    </AppText>
                </View>
            );
        }

        return (
            <View style={styles.center}>
                <AppText weight="bold" color={theme.colors.text.primary}>
                    No data yet
                </AppText>
                <AppText size="sm" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xs }}>
                    Pull to refresh.
                </AppText>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {isLoading ? (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={restList}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <LeaderboardRow item={item} selectedTab={selectedTab} />}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={renderHeader}
                    ListFooterComponent={<View style={{ height: theme.spacing.lg * 4 }} />}
                    ListEmptyComponent={renderEmpty}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                        />
                    }
                />
            )}

            <StickyRankBar selectedTab={selectedTab} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },

    headerWrapper: { marginBottom: -30, zIndex: 0 },
    listContent: { paddingBottom: theme.spacing.md },

    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    center: {
        padding: theme.spacing.lg,
        alignItems: 'center',
    },
});

export default LeaderboardView;
