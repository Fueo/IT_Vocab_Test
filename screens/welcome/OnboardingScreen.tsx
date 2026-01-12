import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import OnboardingView from '../../components/welcome/OnboardingView';
import theme from '../../theme';

const OnboardingScreen = () => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="dark" />
            <OnboardingView />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: theme.spacing.lg, // Sử dụng khoảng cách top từ theme
    },
});

export default OnboardingScreen;