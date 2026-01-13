import React from 'react';
import { StyleSheet } from 'react-native';

// Import Component đã tách
import SendFeedbackView from '@/components/profile/SendFeedbackView';

const SendFeedbackScreen = () => {
    return (
        <SendFeedbackView />
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
    },
});

export default SendFeedbackScreen;