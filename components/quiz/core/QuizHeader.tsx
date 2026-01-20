import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import theme from '../../../theme';
import { AppText } from '../../core';

interface QuizHeaderProps {
    current: number;
    total: number;
    onClose: () => void;
    endless?: boolean;
}

const QuizHeader: React.FC<QuizHeaderProps> = ({
    current,
    total,
    onClose,
    endless = false,
}) => {
    const safeTotal = Math.max(1, total || 1);
    const progressPercent = ((current + 1) / safeTotal) * 100;

    return (
        <View style={styles.container}>
            {/* Close Button */}
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
                <Ionicons name="close" size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>

            {/* Middle: Progress OR Spacer */}
            {endless ? (
                <View style={styles.spacer} />
            ) : (
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
                </View>
            )}

            {/* Counter (luôn sát phải) */}
            <View style={styles.counterWrap}>
                <AppText size="sm" color={theme.colors.text.secondary} weight="bold">
                    {endless ? `${current + 1}/∞` : `${current + 1}/${safeTotal}`}
                </AppText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.background,
    },
    iconBtn: { padding: 4 },

    // ✅ spacer để giữ counter luôn dính phải khi endless
    spacer: {
        flex: 1,
        marginHorizontal: theme.spacing.md,
    },

    progressContainer: {
        flex: 1,
        height: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 5,
        marginHorizontal: theme.spacing.md,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: 5,
    },

    // ✅ đảm bảo counter không bị co giãn + nằm sát phải
    counterWrap: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        minWidth: 44, // optional: để khỏi nhảy layout khi 9/10 -> 10/10
    },
});

export default QuizHeader;
