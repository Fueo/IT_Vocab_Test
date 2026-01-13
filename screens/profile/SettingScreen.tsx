import React from 'react';
import { StyleSheet } from 'react-native';

// Import Component đã tách
import SettingView from '@/components/profile/SettingView';

const SettingScreen = () => {
    return (
        <SettingView />
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
    },
});

export default SettingScreen;