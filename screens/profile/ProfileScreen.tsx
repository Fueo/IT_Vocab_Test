import React from 'react';
import { StyleSheet } from 'react-native';

// Import Component đã tách
import ProfileView from '@/components/profile/ProfileView';

const ProfileScreen = () => {
    return (
        <ProfileView />
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
    },
});

export default ProfileScreen;