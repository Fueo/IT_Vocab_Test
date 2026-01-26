import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

// Imports từ Design System
import { firstLaunchStore } from '@/storage/firstLaunch';
import theme from '../../theme';
import { AppButton, AppText } from '../core';
import OnboardingItem from './OnboardingItem';
import Paginator from './Paginator';

const { width } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        title: 'Learn IT Vocabulary',
        description: 'Master technical English terms used in programming, databases, networks and more',
        icon: 'code-slash' as keyof typeof Ionicons.glyphMap,
        colors: [theme.colors.gradientStart, theme.colors.gradientEnd], // Sử dụng màu từ theme
    },
    {
        id: '2',
        title: 'Track Your Progress',
        description: 'Monitor your learning journey with daily statistics and practice quizzes.',
        icon: 'stats-chart' as keyof typeof Ionicons.glyphMap,
        colors: ['#FF9500', '#FFCC00'],
    },
    {
        id: '3',
        title: 'Join FPT Poly Students',
        description: 'Designed specifically for IT students at FPT Polytechnic College',
        icon: 'people' as keyof typeof Ionicons.glyphMap,
        colors: ['#9C27B0', '#E91E63'],
    }
];

async function handleDone() {
    await firstLaunchStore.markSeenWelcome();
    router.replace("/auth/login");
}

const OnboardingView = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            handleDone();
        }
    };

    const handleSkip = () => {
        flatListRef.current?.scrollToIndex({ index: slides.length - 1 });
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / width);
        setCurrentIndex(index);
    };

    return (
        <View style={styles.container}>
            {/* Header: Skip Button */}
            <View style={styles.header}>
                {currentIndex < slides.length - 1 ? (
                    <TouchableOpacity onPress={handleSkip}>
                        <AppText size="sm" color={theme.colors.text.secondary}>
                            Skip
                        </AppText>
                    </TouchableOpacity>
                ) : (
                    <View style={{ height: theme.spacing.lg }} />
                )}
            </View>

            {/* List Slide */}
            <View style={{ flex: 3 }}>
                <FlatList
                    ref={flatListRef}
                    data={slides}
                    renderItem={({ item }) => <OnboardingItem item={item} />}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={handleScroll}
                    bounces={false}
                />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Paginator
                    data={slides}
                    currentIndex={currentIndex}
                    activeColor={theme.colors.primary}
                />

                <AppButton
                    title={currentIndex === slides.length - 1 ? "Get Started" : "Next  ›"}
                    onPress={handleNext}
                    style={styles.nextButton}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'flex-end',
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.md,
        height: 50,
    },
    footer: {
        flex: 1,
        paddingHorizontal: theme.spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: 30,
        marginTop: theme.spacing.lg,
        width: '100%',
        height: 54, // Tăng nhẹ chiều cao cho cân đối
    },
});

export default OnboardingView;