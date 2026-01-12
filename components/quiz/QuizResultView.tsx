import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

// Import Components
import theme from '../../theme';
import { AppBanner, AppButton } from '../core';
import ResultHeader from './core/QuizResultHeader';
import StatCard from './core/StatCard';

const QuizResultView = () => {
    // Nhận kết quả từ params
    const params = useLocalSearchParams();
    const correctCount = Number(params.correct) || 0;
    const totalCount = Number(params.total) || 5;
    const courseTitle = params.courseTitle || 'Course';

    // Tính toán logic
    const accuracy = Math.round((correctCount / totalCount) * 100);
    const isSuccess = accuracy >= 50;

    const title = isSuccess ? "Excellent Job!" : "Keep Practicing!";
    const subtitle = isSuccess
        ? `${courseTitle} completed successfully`
        : `${courseTitle} completed`;
    const message = isSuccess
        ? "You're doing great! Keep pushing your limits."
        : "Don't give up! Every attempt makes you better.";

    return (
        <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
        >
            {/* 1. Header Section */}
            <ResultHeader
                score={correctCount}
                total={totalCount}
                title={title}
                subtitle={subtitle}
                iconSource={null}
            />

            {/* 2. Stats Grid */}
            <View style={styles.statsContainer}>
                <StatCard
                    label="Accuracy"
                    value={`${accuracy}%`}
                    icon="radio-button-on"
                    iconColor={theme.colors.secondary} // Dùng màu từ theme thay cho #3B82F6
                />
                <StatCard
                    label="Correct"
                    value={`${correctCount}/${totalCount}`}
                    icon="trophy-outline"
                    iconColor={theme.colors.success} // Dùng màu success từ theme
                />
            </View>

            {/* 3. Motivational Banner */}
            <AppBanner
                message={message}
                variant={isSuccess ? "success" : "info"}
                icon={isSuccess ? "star" : "fitness"}
                containerStyle={styles.bannerMargin}
            />

            {/* 4. Action Buttons */}
            <View style={styles.actionsContainer}>
                <AppButton
                    title="Review Answers"
                    variant="outline"
                    onPress={() => router.push('/game/review')}
                    icon="eye-outline"
                    style={styles.reviewBtn}
                />

                <AppButton
                    title="Try Again"
                    variant="primary"
                    onPress={() => router.back()}
                    icon="refresh"
                    style={styles.actionMargin}
                />

                <AppButton
                    title="Back to Home"
                    variant="outline"
                    onPress={() => router.navigate('/tabs/quiz')}
                    icon="home-outline"
                    style={styles.homeBtn}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    content: {
        padding: theme.spacing.lg,
        paddingTop: theme.spacing.xxl, // Thay 40 bằng xxl
    },
    statsContainer: {
        flexDirection: 'row',
        marginTop: theme.spacing.lg,
        gap: theme.spacing.md, // Dùng gap để chia khoảng cách giữa 2 thẻ
    },
    bannerMargin: {
        marginTop: theme.spacing.lg,
    },
    actionsContainer: {
        marginTop: theme.spacing.xxl, // Thay 40 bằng xxl
    },
    actionMargin: {
        marginTop: theme.spacing.md,
    },
    reviewBtn: {
        borderColor: theme.colors.secondary,
        borderWidth: 1,
    },
    homeBtn: {
        marginTop: theme.spacing.md,
        borderColor: theme.colors.border,
        borderWidth: 1,
        backgroundColor: theme.colors.background,
    }
});

export default QuizResultView;