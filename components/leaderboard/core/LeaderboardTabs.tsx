import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import theme from '../../../theme';
import { AppText } from '../../core';
import { RANK_COLORS, TabKey } from './leaderboard.data';

const TABS: { key: TabKey; label: string }[] = [
    { key: 'XP', label: 'XP Rank' },
    { key: 'Streak', label: 'Streak' },
];

type Props = {
    value: TabKey;
    onChange: (key: TabKey) => void;
};

const LeaderboardTabs: React.FC<Props> = ({ value, onChange }) => {
    return (
        <View style={styles.tabContainer}>
            {TABS.map((t) => {
                const isActive = value === t.key;
                return (
                    <TouchableOpacity
                        key={t.key}
                        style={[styles.tabButton, isActive && styles.tabButtonActive]}
                        onPress={() => onChange(t.key)}
                        activeOpacity={0.8}
                    >
                        <AppText
                            size="sm"
                            weight={isActive ? 'bold' : 'regular'}
                            color={isActive ? RANK_COLORS.gold.gradient[1] : theme.colors.text.white}
                        >
                            {t.label}
                        </AppText>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: theme.radius.xl,
        padding: 4,
        marginTop: theme.spacing.md,
        width: '80%',
        alignSelf: 'center',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: theme.radius.xl,
    },
    tabButtonActive: {
        backgroundColor: 'white',
    },
});

export default LeaderboardTabs;
