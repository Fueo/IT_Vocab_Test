import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import theme from '../../../theme';
import { AppText } from '../../core';

interface ReviewStatsProps {
    correct: number;
    incorrect: number;
}

const ReviewStats: React.FC<ReviewStatsProps> = ({ correct, incorrect }) => {
    return (
        <View style={styles.container}>
            {/* Correct Card */}
            <View style={[styles.card, styles.correctCard]}>
                <View style={styles.row}>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#15803D" />
                    {/* ✅ Dịch: Correct -> Đúng */}
                    <AppText size="sm" weight="bold" color="#15803D" style={{ marginLeft: 4 }}>Đúng</AppText>
                </View>
                <AppText size="title" weight="bold" color="#15803D">{correct}</AppText>
            </View>

            {/* Incorrect Card */}
            <View style={[styles.card, styles.incorrectCard]}>
                <View style={styles.row}>
                    <Ionicons name="close-circle-outline" size={20} color="#B91C1C" />
                    {/* ✅ Dịch: Incorrect -> Sai */}
                    <AppText size="sm" weight="bold" color="#B91C1C" style={{ marginLeft: 4 }}>Sai</AppText>
                </View>
                <AppText size="title" weight="bold" color="#B91C1C">{incorrect}</AppText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: theme.spacing.lg,
    },
    card: {
        flex: 1,
        padding: theme.spacing.md,
        borderRadius: 12,
        borderWidth: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    correctCard: {
        backgroundColor: '#DCFCE7', // Xanh lá nhạt
        borderColor: '#86EFAC',
    },
    incorrectCard: {
        backgroundColor: '#FEE2E2', // Đỏ nhạt
        borderColor: '#FCA5A5',
    }
});

export default ReviewStats;