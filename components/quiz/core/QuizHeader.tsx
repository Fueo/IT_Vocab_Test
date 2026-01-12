import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import theme from '../../../theme';
import { AppText } from '../../core';

interface QuizHeaderProps {
    current: number;
    total: number;
    onClose: () => void;
}

const QuizHeader: React.FC<QuizHeaderProps> = ({
    current,
    total,
    onClose,
}) => {
    // Tính phần trăm tiến độ
    const progressPercent = ((current + 1) / total) * 100;

    return (
        <View style={styles.container}>
            {/* Close Button */}
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
                <Ionicons name="close" size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
            </View>

            {/* Counter */}
            <AppText size="sm" color={theme.colors.text.secondary} weight="bold">
                {current + 1}/{total}
            </AppText>
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
    iconBtn: {
        padding: 4,
    },
    progressContainer: {
        flex: 1,
        height: 10,
        backgroundColor: '#F3F4F6', // Xám nhạt
        borderRadius: 5,
        marginHorizontal: theme.spacing.md,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: theme.colors.primary, // Xanh lá
        borderRadius: 5,
    },
});

export default QuizHeader;