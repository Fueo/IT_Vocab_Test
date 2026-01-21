import React from 'react';
import { StyleSheet } from 'react-native';

// Import Component đã tách
import FeedbackView from '@/components/feedback/FeedbackView';

const FeedbackScreen = () => {
    return (
        <FeedbackView />
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
    },
});

export default FeedbackScreen;