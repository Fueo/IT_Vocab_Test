// src/screens/leaderboard/core/LeaderboardRow.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '../../../theme';
import { AppText } from '../../core';
import UserAvatar from '../../profile/core/UserAvatar';
import { LeaderboardItem, TabKey } from './leaderboard.types';

type Props = {
    item: LeaderboardItem;
    selectedTab: TabKey;
};

// ✅ Helper lấy chữ cái đầu (copy từ Podium qua hoặc tách ra utils dùng chung)
function getInitials(name?: string | null) {
    const n = (name ?? "").trim();
    if (!n) return "U";
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const LeaderboardRow: React.FC<Props> = ({ item, selectedTab }) => {
    // ✅ Logic hiển thị: Nếu là XP thì format số, nếu Streak thì hiện số thường
    const displayValue = selectedTab === 'XP'
        ? item.xp.toLocaleString()
        : item.streak;

    const displayLabel = selectedTab === 'XP' ? 'XP' : 'Ngày'; // Sửa 'Streak' thành 'Ngày' cho tiếng Việt nếu muốn

    return (
        <View style={styles.listItem}>
            <View style={styles.rankCircle}>
                <AppText weight="bold" color={theme.colors.text.secondary}>
                    {item.rank}
                </AppText>
            </View>

            {/* ✅ SỬA 1: Dùng getInitials(item.name) thay vì item.initials */}
            <UserAvatar
                initials={getInitials(item.name)}
                imageUrl={item.avatarURL ?? undefined}
                size={48}
            />

            <View style={styles.itemContent}>
                <AppText weight="bold" size="md" color={theme.colors.text.primary}>
                    {item.name}
                </AppText>
                {/* ✅ SỬA 2: Dùng item.rankLevel thay vì item.level */}
                <AppText size="xs" color={theme.colors.text.secondary}>
                    Level {item.rankLevel ?? 1}
                </AppText>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
                <AppText weight="bold" color={theme.colors.success} size="md">
                    {displayValue}
                </AppText>
                <AppText size="xs" color={theme.colors.text.secondary}>
                    {displayLabel}
                </AppText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        marginHorizontal: theme.spacing.md,
        elevation: 1,
    },
    rankCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    itemContent: {
        flex: 1,
        marginHorizontal: theme.spacing.sm,
    },
});

export default LeaderboardRow;