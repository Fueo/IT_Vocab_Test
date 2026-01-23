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

const LeaderboardRow: React.FC<Props> = ({ item, selectedTab }) => {
    return (
        <View style={styles.listItem}>
            <View style={styles.rankCircle}>
                <AppText weight="bold" color={theme.colors.text.secondary}>
                    {item.rank}
                </AppText>
            </View>

            <UserAvatar initials={item.initials} size={48} />

            <View style={styles.itemContent}>
                <AppText weight="bold" size="md" color={theme.colors.text.primary}>
                    {item.name}
                </AppText>
                <AppText size="xs" color={theme.colors.text.secondary}>
                    Level {item.level}
                </AppText>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
                <AppText weight="bold" color={theme.colors.success} size="md">
                    {selectedTab === 'XP' ? item.xp.toLocaleString() : item.streak}
                </AppText>
                <AppText size="xs" color={theme.colors.text.secondary}>
                    {selectedTab === 'XP' ? 'XP' : 'Streak'}
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
