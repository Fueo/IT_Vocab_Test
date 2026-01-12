import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import QuizResultView from '../../components/quiz/QuizResultView';
import theme from '../../theme';

const QuizResultScreen = () => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="dark" />
            <QuizResultView />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
});

export default QuizResultScreen;