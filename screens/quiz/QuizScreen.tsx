import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import Component đã tách
import { StatusBar } from 'expo-status-bar';
import QuizView from '../../components/quiz/QuizView';
import theme from '../../theme';

const QuizScreen = () => {
    return (
        <SafeAreaView style={styles.screenContainer}>
            <StatusBar style="light" />
            <QuizView />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        // Sử dụng màu nền từ theme thay vì hardcode gradientStart nếu không cần thiết
        backgroundColor: theme.colors.gradientStart,
    },
});

export default QuizScreen;