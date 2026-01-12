import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, StatusBar as RNStatusBar, SafeAreaView, StyleSheet } from 'react-native';
import QuizGameView from '../../components/quiz/QuizGameView';
import theme from '../../theme';

const QuizGameScreen = () => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="dark" />
            <QuizGameView />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
    },
});

export default QuizGameScreen;