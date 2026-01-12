import React from 'react';
import { View } from 'react-native';
import LoginView from '../../components/auth/LoginView';

const LoginScreen = () => {
    return (
        <View style={{ flex: 1 }}>
            <LoginView />
        </View>
    );
};

export default LoginScreen;