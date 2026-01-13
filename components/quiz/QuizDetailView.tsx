import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

// Import Components
import theme from '../../theme';
import { AppBanner } from '../core';
import DetailHeader from '../core/AppDetailHeader';
import ModeCard from './core/ModeCard';

const QuizDetailView = () => {
    const { id, title } = useLocalSearchParams();

    // Xử lý tiêu đề hiển thị
    const displayTitle = title ? (Array.isArray(title) ? title[0] : title) : 'Course Detail';
    const courseId = id ? (Array.isArray(id) ? id[0] : id) : 'default_id';

    const handleModeSelect = (mode: string) => {
        router.push({
            pathname: '/game/[id]',
            params: { id: courseId, mode: mode }
        });
        console.log(`Mode Selected: ${mode} for Course ID: ${courseId}`);
    };

    return (
        <View style={styles.container}>
            {/* Header xử lý quay lại và tiêu đề */}
            <DetailHeader
                title={displayTitle}
                subtitle="Choose your learning mode"
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* Danh sách các chế độ học tập */}
                <View style={styles.modesContainer}>
                    <ModeCard
                        title="Learning Mode"
                        description="Learn new words without pressure. See answers if needed."
                        icon="book-outline"
                        colors={['#4A90E2', '#9013FE']}
                        onPress={() => handleModeSelect('learning')}
                    />

                    <ModeCard
                        title="Review Mode"
                        description="Smart spaced repetition. Review words you're forgetting."
                        icon="sync-outline"
                        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                        onPress={() => handleModeSelect('review')}
                    />

                    <ModeCard
                        title="Random Challenge"
                        description="Test yourself with random vocabulary from any lesson."
                        icon="shuffle-outline"
                        colors={['#FF9966', '#FF5E62']}
                        onPress={() => handleModeSelect('random')}
                    />
                </View>

                {/* Banner hướng dẫn/mẹo */}
                <View style={styles.bannerContainer}>
                    <AppBanner
                        variant="info"
                        title="Tip: "
                        message="Use Learning Mode for new topics, Review Mode to strengthen memory, and Random Challenge to test your overall knowledge!"
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.md, // Margin chuẩn 16px
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.xl,
    },
    modesContainer: {
        marginTop: theme.spacing.xs,
    },
    bannerContainer: {
        marginTop: theme.spacing.md,
    }
});

export default QuizDetailView;