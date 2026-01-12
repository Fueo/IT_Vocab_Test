import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { AppText } from '../../components/core'; // Component Text của bạn
import theme from '../../theme';

export default function LearnScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <AppText size="title" weight="bold" color={theme.colors.text.primary}>
                    Learn Screen
                </AppText>
                <AppText size="md" color={theme.colors.text.secondary}>
                    Welcome to your learning journey!
                </AppText>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});