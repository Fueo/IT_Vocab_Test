import { AntDesign, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import theme from '../../../theme';
import { AppText } from '../../core';
import UserAvatar from '../../profile/core/UserAvatar';
import { LeaderboardItem, RANK_COLORS, TabKey } from './leaderboard.data';

const { width } = Dimensions.get('window');

type Props = {
    topThree: LeaderboardItem[];
    selectedTab: TabKey;
};

const LeaderboardPodium: React.FC<Props> = ({ topThree, selectedTab }) => {
    const renderItem = (item: LeaderboardItem) => {
        let rankColor = '';
        let rankSize = 0;
        let heightBlock = 0;

        if (item.rank === 1) {
            rankColor = RANK_COLORS.gold.main;
            rankSize = 100;
            heightBlock = 140;
        } else if (item.rank === 2) {
            rankColor = RANK_COLORS.silver.main;
            rankSize = 80;
            heightBlock = 100;
        } else {
            rankColor = '#B87333';
            rankSize = 80;
            heightBlock = 80;
        }

        const displayValue =
            selectedTab === 'XP' ? `${item.xp.toLocaleString()} XP` : `${item.streak} Days`;

        const gradient =
            item.rank === 1
                ? RANK_COLORS.gold.gradient
                : item.rank === 2
                    ? RANK_COLORS.silver.gradient
                    : RANK_COLORS.bronze.gradient;

        return (
            <View key={item.id} style={[styles.podiumItem, { zIndex: item.rank === 1 ? 10 : 1 }]}>
                {item.rank === 1 && (
                    <AntDesign name="crown" size={32} color={theme.colors.primary} style={styles.crownIcon} />
                )}

                <View style={styles.avatarWrapper}>
                    <UserAvatar
                        initials={item.initials}
                        size={rankSize}
                        frameId={item.rank === 1 ? (item.equippedFrame as any) : undefined}
                    />
                    <View style={[styles.rankBadge, { backgroundColor: rankColor }]}>
                        <AppText size="xs" weight="bold" color="white">
                            {item.rank}
                        </AppText>
                    </View>
                </View>

                <View style={styles.podiumInfo}>
                    <AppText
                        size="sm"
                        weight="bold"
                        style={{ textAlign: 'center' }}
                        numberOfLines={1}
                        color={theme.colors.text.primary}
                    >
                        {item.name}
                    </AppText>
                    <AppText size="xs" weight="bold" color={theme.colors.success}>
                        {displayValue}
                    </AppText>
                </View>

                <LinearGradient colors={gradient} style={[styles.podiumBlock, { height: heightBlock }]}>
                    <Ionicons
                        name={selectedTab === 'XP' ? 'trophy-outline' : 'flame-outline'}
                        size={24}
                        color="rgba(255,255,255,0.5)"
                    />
                </LinearGradient>
            </View>
        );
    };

    // ✅ vẫn giữ thứ tự: [2,1,3] để podium đẹp
    const second = topThree[1];
    const first = topThree[0];
    const third = topThree[2];

    return (
        <View style={styles.podiumContainer}>
            {second && renderItem(second)}
            {first && renderItem(first)}
            {third && renderItem(third)}
        </View>
    );
};

const styles = StyleSheet.create({
    podiumContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginBottom: theme.spacing.xl,
        marginTop: 30,
        paddingHorizontal: theme.spacing.md,
        zIndex: 1,
    },
    podiumItem: {
        alignItems: 'center',
        marginHorizontal: 4,
        width: width * 0.28,
        justifyContent: 'flex-end',
    },
    crownIcon: {
        marginBottom: -10,
        zIndex: 20,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: theme.spacing.xs,
    },
    rankBadge: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    podiumInfo: {
        alignItems: 'center',
        marginBottom: theme.spacing.smd,
        width: '100%',
    },
    podiumBlock: {
        width: '100%',
        borderTopLeftRadius: theme.radius.lg,
        borderTopRightRadius: theme.radius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
});

export default LeaderboardPodium;
