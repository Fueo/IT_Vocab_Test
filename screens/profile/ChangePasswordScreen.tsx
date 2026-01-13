import React from 'react';
import { StyleSheet } from 'react-native';

// Import Component đã tách
import ChangePasswordView from '@/components/profile/ChangePasswordView';

const ChangePasswordScreen = () => {
    return (
        <ChangePasswordView />
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
    },
});

export default ChangePasswordScreen;