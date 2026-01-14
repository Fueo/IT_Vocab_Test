// RewardsView.tsx
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import theme from '../../theme';
import { AppText, HomeHeader } from '../core';

import RewardCard from './core/RewardCard';
import { REWARD_SECTIONS, RewardSectionKey } from './core/rewards.data';

const FILTERS: { key: RewardSectionKey; label: string }[] = [
    { key: 'level', label: 'Level' },
    { key: 'streak', label: 'Streak' },
    { key: 'leaderboard', label: 'Leaderboard' },
];

// Chỉ cho phép 2 loại quà: x2 XP và Frame (skin)
const isAllowedReward = (reward: any) => {
    if (reward?.type === 'frame') return true;

    const title = (reward?.title ?? '').toLowerCase();
    const desc = (reward?.description ?? '').toLowerCase();
    return title.includes('xp') || desc.includes('xp');
};

const RewardsView = () => {
    const [activeFilter, setActiveFilter] = useState<RewardSectionKey>('level');

    // ✅ tương lai: thay bằng progress từ API
    const mockProgress = {
        level: 12,
        streak: 9,
        leaderboardRank: 8, // top 10
    };

    const statusBarHeight = Constants.statusBarHeight;

    // ---- Back button scale animation ----
    const backScale = useMemo(() => new Animated.Value(1), []);
    const animateBack = (to: number) => {
        Animated.spring(backScale, {
            toValue: to,
            useNativeDriver: true,
            speed: 30,
            bounciness: 8,
        }).start();
    };

    const filteredSections = useMemo(() => {
        return REWARD_SECTIONS.filter((s) => s.key === activeFilter);
    }, [activeFilter]);

    // ✅ Demo unlocked logic (tương lai: server trả về isUnlocked/isClaimed)
    const isUnlocked = (req: string) => {
        if (req.includes('Level 5')) return mockProgress.level >= 5;
        if (req.includes('Level 10')) return mockProgress.level >= 10;
        if (req.includes('Level 20')) return mockProgress.level >= 20;

        if (req.includes('7-day')) return mockProgress.streak >= 7;
        if (req.includes('30-day')) return mockProgress.streak >= 30;
        if (req.includes('60-day')) return mockProgress.streak >= 60;

        if (req.includes('Top 10')) return mockProgress.leaderboardRank <= 10;
        if (req.includes('Top 3')) return mockProgress.leaderboardRank <= 3;
        if (req.includes('#1')) return mockProgress.leaderboardRank === 1;

        return false;
    };

    // ✅ Đã nhận (demo: unlocked) => bấm chuyển qua Inventory
    // Sau này đổi thành reward.isClaimed === true
    const handleRewardPress = (reward: any) => {
        const unlocked = isUnlocked(reward.requirementText);
        if (unlocked) router.push('/tabs/inventory');
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
                            weight={active ? 'bold' : 'regular'}
                            color={active ? theme.colors.text.primary : 'rgba(255,255,255,0.9)'}
                        >
                            {f.label}
                        </AppText>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <HomeHeader
                    title="Rewards"
                    subtitle="Unlock rewards by leveling up, keeping streaks, and ranking high."
                    rightIcon="gift-outline"
                    height={250}
                    bottomContent={renderFilters()}
                    showRightIconBackground={true}
                />

                <View style={styles.content}>
                    {filteredSections.map((section) => {
                        const allowedRewards = section.rewards.filter(isAllowedReward);
                        if (allowedRewards.length === 0) return null;

                        return (
                            <View key={section.key} style={{ marginBottom: theme.spacing.lg }}>
                                <AppText
                                    size="lg"
                                    weight="bold"
                                    color={theme.colors.text.primary}
                                    style={{ marginBottom: theme.spacing.xs }}
                                >
                                    {section.title}
                                </AppText>

                                <AppText
                                    size="sm"
                                    color={theme.colors.text.secondary}
                                    style={{ marginBottom: theme.spacing.md }}
                                >
                                    {section.subtitle}
                                </AppText>

                                {allowedRewards.map((reward) => (
                                    <RewardCard
                                        key={reward.id}
                                        reward={reward}
                                        isUnlocked={isUnlocked(reward.requirementText)}
                                        onPress={() => handleRewardPress(reward)}
                                    />
                                ))}
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            {/* 🔙 BACK BUTTON OVERLAY (có scale animation) */}
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.cardBackground },
    scroll: { paddingBottom: theme.spacing.lg * 4 },
    content: { padding: theme.spacing.md },

    filterWrap: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: theme.radius.xl,
        padding: 4,
        marginTop: theme.spacing.md,
        width: '90%',
        alignSelf: 'center',
    },
    filterBtn: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: theme.radius.xl,
    },
    filterBtnActive: {
        backgroundColor: 'white',
    },

    // Back button overlay
    backButtonWrap: {
        position: 'absolute',
        left: theme.spacing.md,
        zIndex: 50,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
});

export default RewardsView;
