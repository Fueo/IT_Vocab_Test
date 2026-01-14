import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '../../../theme';
import { AppText } from '../../core';
import { TabKey } from './leaderboard.data';

type Props = {
    selectedTab: TabKey;
};

const StickyRankBar: React.FC<Props> = ({ selectedTab }) => {
    return (
        <View style={styles.floatingRankWrapper}>
            <LinearGradient
                colors={theme.colors.slides.step1 as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.floatingRankContainer}
            >
                <View style={[styles.rankCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <AppText weight="bold" color="white">
                        8
                    </AppText>
                </View>

                <View style={styles.itemContent}>
                    <AppText weight="bold" color="white" size="md">
                        Your Position
                    </AppText>
                    <AppText size="xs" color="rgba(255,255,255,0.8)">
                        Guest User
                    </AppText>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                    <AppText weight="bold" color="white" size="lg">
                        {selectedTab === 'XP' ? '8,500' : '5'}
                    </AppText>
                    <AppText size="xs" color="rgba(255,255,255,0.8)">
                        {selectedTab === 'XP' ? 'XP' : 'Days'}
                    </AppText>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    floatingRankWrapper: {
        position: 'absolute',
        bottom: 20,
        left: theme.spacing.md,
        right: theme.spacing.md,
        elevation: 8,
    },
    floatingRankContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
        borderRadius: theme.radius.xl,
    },
    rankCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    itemContent: {
        flex: 1,
        marginHorizontal: theme.spacing.sm,
    },
});

export default StickyRankBar;
