import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../core'; // Hoặc đường dẫn đúng tới AppText

interface HomeStreakBadgeProps {
    streakDays: number;
}

const HomeStreakBadge: React.FC<HomeStreakBadgeProps> = ({ streakDays }) => {
    return (
        <View style={styles.container}>
            {/* Icon Lửa */}
            <Ionicons name="flame" size={24} color="#FF9500" style={{ marginRight: 8 }} />

            {/* Số ngày và text */}
            <View>
                <AppText size="lg" weight="bold" color="white" style={{ lineHeight: 24 }}>
                    {streakDays}
                </AppText>
                <AppText size="xs" color="rgba(255,255,255,0.8)" style={{ lineHeight: 14 }}>
                    day streak
                </AppText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)', // Nền kính mờ
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)', // Viền mờ
    },
});

export default HomeStreakBadge;