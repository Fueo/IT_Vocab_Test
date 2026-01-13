import VerifyCodeView from '@/components/auth/VerifyCodeView';
import React from 'react';
import { View } from 'react-native';

const VerifyCodeScreen = () => {
    return (
        <View style={{ flex: 1 }}>
            <VerifyCodeView />
        </View>
    );
};

export default VerifyCodeScreen;