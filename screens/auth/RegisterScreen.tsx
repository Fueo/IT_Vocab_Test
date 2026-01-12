import React from 'react';
import { View } from 'react-native';
import RegisterView from '../../components/auth/RegisterView';

const RegisterScreen = () => {
    return (
        <View style={{ flex: 1 }}>
            <RegisterView />
        </View>
    );
};

export default RegisterScreen;