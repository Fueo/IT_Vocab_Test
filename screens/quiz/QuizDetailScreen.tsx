import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import QuizDetailView from '../../components/quiz/QuizDetailView';
import theme from '../../theme';

const QuizDetailScreen = () => {
    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <QuizDetailView />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
});

export default QuizDetailScreen;