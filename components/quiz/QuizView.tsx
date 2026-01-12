import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

// Import các thành phần từ Design System và UI
import theme from '../../theme';
import { AppHeader, AppText } from '../core';
import CategorySelector from '../core/CategorySelector';
import HomeLevelCard from './core/HomeLevelCard';
import HomeStreakBadge from './core/HomeStreakBadge';
import QuizCard from './core/QuizCard';

// Dữ liệu giả lập (Sau này có thể thay thế bằng dữ liệu từ API)
const COURSES_DATA = [
    { id: '1', title: 'Programming Basics', icon: 'laptop-outline', percent: 75, xp: 50, category: 'Coding' },
    { id: '2', title: 'Database SQL', icon: 'server-outline', percent: 30, xp: 40, colors: ['#FF9966', '#FF5E62'], category: 'Database' },
    { id: '3', title: 'Networking', icon: 'globe-outline', percent: 10, xp: 60, category: 'Network' },
    { id: '4', title: 'Algorithm', icon: 'git-network-outline', percent: 0, xp: 100, category: 'Coding' },
    { id: '5', title: 'Cyber Security', icon: 'shield-checkmark-outline', percent: 0, xp: 80, colors: ['#4A00E0', '#8E2DE2'], category: 'Security' },
    { id: '6', title: 'Cloud Computing', icon: 'cloud-outline', percent: 0, xp: 120, category: 'Network' },
];

const CATEGORIES = ['All', 'Coding', 'Database', 'Network', 'Security'];

const QuizView = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const userName = "Liêu Thiên Hạo"; // Giả định lấy từ Auth Context
    const streakDays = 7;

    // --- LOGIC ---
    const handlePressCourse = (id: string, title: string) => {
        router.push({
            pathname: `/course/[id]`,
            params: { id: id, title: title }
        });
        console.log(`Navigating to Course ID: ${id}, Title: ${title}`);
    };

    // Logic lọc dữ liệu dựa trên danh mục đã chọn
    const filteredCourses = selectedCategory === 'All'
        ? COURSES_DATA
        : COURSES_DATA.filter(course => course.category === selectedCategory);

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredCourses}
                keyExtractor={item => item.id}
                numColumns={2}

                // --- HEADER SECTION ---
                ListHeaderComponent={
                    <>
                        <AppHeader
                            title={`Hi, ${userName}!`}
                            subtitle="Keep up the great work!"
                            rightComponent={<HomeStreakBadge streakDays={streakDays} />}
                            bottomContent={<HomeLevelCard />}
                            height={260}
                            containerStyle={styles.headerMargin}
                        />

                        <CategorySelector
                            categories={CATEGORIES}
                            selectedCategory={selectedCategory}
                            onSelect={setSelectedCategory}
                        />
                    </>
                }

                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}

                // --- EMPTY STATE ---
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <AppText color={theme.colors.text.secondary}>
                            No courses found in this category
                        </AppText>
                    </View>
                }

                // --- ITEM RENDER ---
                renderItem={({ item }) => (
                    <QuizCard
                        title={item.title}
                        icon={item.icon as any}
                        percentage={item.percent}
                        xp={item.xp}
                        colors={item.colors as any}
                        onPress={() => handlePressCourse(item.id, item.title)}
                    />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    headerMargin: {
        marginBottom: theme.spacing.md,
    },
    listContent: {
        paddingBottom: theme.spacing.xl,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.md, // Margin chuẩn 16px từ spacing.ts
    },
    emptyContainer: {
        padding: theme.spacing.lg,
        alignItems: 'center',
        marginTop: theme.spacing.xxl,
    }
});

export default QuizView;