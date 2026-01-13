import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import theme from '../../../theme';
import AppText from '../../core/AppText';

export type RankType = 'bronze' | 'silver' | 'gold';

interface RankBadgeProps {
    rank: RankType;
}

const rankConfig = {
    bronze: {
        color: '#D97706',
        label: 'Bronze',
        icon: 'trophy',
    },
    silver: {
        color: '#9CA3AF',
        label: 'Silver',
        icon: 'medal',
    },
    gold: {
        color: '#F59E0B',
        label: 'Gold',
        icon: 'trophy',
    },
};

const RankBadge: React.FC<RankBadgeProps> = ({ rank }) => {
    const config = rankConfig[rank];

    return (
        <View style={[styles.container, { backgroundColor: config.color }]}>
            <Ionicons
                name={config.icon as any}
                size={theme.iconSizes.smd} // 12
                color="white"
                style={styles.icon}
            />
            <AppText size="xs" weight="bold" color="white">
                {config.label}
            </AppText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.smd, // 12
        paddingVertical: 4,
        borderRadius: theme.radius.md, // 12
        borderWidth: 2,
        borderColor: theme.colors.background,

        // --- QUAN TRỌNG: Đã xóa position absolute ở đây ---
        // Component này giờ chỉ là một cái "hộp" bình thường,
        // việc đặt nó ở đâu là do thằng cha (UserAvatar) quyết định.
    },
    icon: {
        marginRight: theme.spacing.xs,
    },
});

export default RankBadge;