import React from 'react';
import { StyleSheet } from 'react-native';

// Import Component đã tách
import LeaderboardView from '@/components/leaderboard/LeaderboardView';

const LeaderboardScreen = () => {
    return (
        <LeaderboardView />
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
    },
});

export default LeaderboardScreen;