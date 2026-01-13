import NewPasswordView from '@/components/auth/NewPasswordView';
import React from 'react';
import { View } from 'react-native';

const NewPasswordScreen = () => {
    return (
        <View style={{ flex: 1 }}>
            <NewPasswordView />
        </View>
    );
};

export default NewPasswordScreen;