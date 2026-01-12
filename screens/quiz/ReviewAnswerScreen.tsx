import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import ReviewAnswersView from '../../components/quiz/ReviewAnswersView';
import theme from '../../theme';

const ReviewAnswersScreen = () => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="dark" />
            <ReviewAnswersView />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
});

export default ReviewAnswersScreen;