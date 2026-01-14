// core/RewardCard.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '../../../theme';
import AppText from '../../core/AppText';
import UserAvatar from '../../profile/core/UserAvatar';
import { Reward } from './rewards.data';

type Props = {
    reward: Reward;
    onPress?: (reward: Reward) => void;

    // tương lai bạn fetch API về có trạng thái locked/unlocked
    isUnlocked?: boolean;
};

const RewardCard: React.FC<Props> = ({ reward, onPress, isUnlocked = false }) => {
    const renderLeft = () => {
        if (reward.type === 'frame' && reward.frameId) {
            return (
                <View style={styles.preview}>
                    <UserAvatar size={52} initials="" frameId={reward.frameId} avatarScale={0.82} />
                </View>
            );
        }

        return (
            <View style={styles.iconBox}>
                <Ionicons
                    name={(reward.icon as any) || 'gift'}
                    size={24}
                    color={theme.colors.text.primary}
                />
            </View>
        );
    };

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onPress?.(reward)}
            style={[
                styles.card,
                isUnlocked && styles.cardUnlocked,
            ]}
        >
            {renderLeft()}

            <View style={styles.content}>
                <View style={styles.topRow}>
                    <AppText weight="bold" size="md" color={theme.colors.text.primary}>
                        {reward.title}
                    </AppText>

                    <View style={[styles.pill, isUnlocked ? styles.pillUnlocked : styles.pillLocked]}>
                        <AppText size="xs" weight="bold" color={isUnlocked ? 'white' : theme.colors.text.secondary}>
                            {isUnlocked ? 'Unlocked' : 'Locked'}
                        </AppText>
                    </View>
                </View>

                <AppText size="xs" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xxs }}>
                    {reward.description}
                </AppText>

                <View style={styles.reqRow}>
                    <Ionicons name="flag-outline" size={14} color={theme.colors.text.secondary} />
                    <AppText size="xs" color={theme.colors.text.secondary} style={{ marginLeft: theme.spacing.xs }}>
                        {reward.requirementText}
                    </AppText>
                </View>
            </View>

            <Ionicons name="chevron-forward" size={18} color={theme.colors.text.secondary} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.sm,
    },
    cardUnlocked: {
        borderColor: theme.colors.success,
    },
    preview: {
        width: 56,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    iconBox: {
        width: 52,
        height: 52,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.cardBackground,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginRight: theme.spacing.md,
    },
    content: {
        flex: 1,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
    },
    pillLocked: {
        borderColor: theme.colors.border,
        backgroundColor: 'transparent',
    },
    pillUnlocked: {
        borderColor: theme.colors.success,
        backgroundColor: theme.colors.success,
    },
    reqRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.sm,
    },
});

export default RewardCard;
