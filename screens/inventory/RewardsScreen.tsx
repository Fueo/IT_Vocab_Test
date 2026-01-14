import React from 'react';
import { StyleSheet } from 'react-native';

// Import Component đã tách
import RewardsView from '@/components/inventory/RewardsView';

const RewardsScreen = () => {
    return (
        <RewardsView />
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
    },
});

export default RewardsScreen;