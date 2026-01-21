import React from 'react';
import { StyleSheet } from 'react-native';

// Import Component đã tách
import FeedbackFormView from '@/components/feedback/FeedbackFormView';

const FeedbackFormScreen = () => {
    return (
        <FeedbackFormView />
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
    },
});

export default FeedbackFormScreen;