import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

// Import Core & Theme
import theme from '../../../theme';
import { AppText } from '../../core';

const HomeLevelCard = () => {
    return (
        <View style={styles.levelCard}>
            <View style={styles.levelRow}>
                {/* Icon Level */}
                <View style={styles.iconCircle}>
                    <Ionicons name="star" size={20} color="white" />
                </View>

                {/* Text Info */}
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <AppText size="sm" color={theme.colors.text.primary} weight="bold">Level 10</AppText>
                    <AppText size="xs" color={theme.colors.text.secondary}>8500 / 10000 XP</AppText>
                </View>

                {/* XP Gained */}
                <View style={{ alignItems: 'flex-end' }}>
                    <AppText size="lg" color={theme.colors.primary} weight="bold">+1500</AppText>
                    <AppText size="xs" color={theme.colors.text.secondary}>to level up</AppText>
                </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '85%' }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    levelCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    levelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFC107',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 4,
        width: '100%',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#111827',
    }
});

export default HomeLevelCard;