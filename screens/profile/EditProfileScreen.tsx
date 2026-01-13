import React from 'react';
import { StyleSheet } from 'react-native';

// Import Component đã tách
import EditProfileView from '@/components/profile/EditProfileView';

const EditProfileScreen = () => {
    return (
        <EditProfileView />
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
    },
});

export default EditProfileScreen;