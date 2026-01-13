import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

// Import Components
import theme from '../../theme';
import { AppButton, AppText } from '../core';
import DetailHeader from '../core/AppDetailHeader';
import ReviewItem from './core/ReviewItem';
import ReviewStats from './core/ReviewStats';

// Dữ liệu giả lập
const ALL_QUESTIONS = Array.from({ length: 12 }).map((_, i) => ({
    id: i.toString(),
    term: i % 2 === 0 ? 'Variable' : 'Function',
    question: i % 2 === 0 ? 'What is a variable?' : 'What is a function?',
    correctAnswer: 'Correct Answer String',
    explanation: 'This is a detailed explanation of why the answer is correct.',
    example: 'let x = 10;',
    userAnswer: i % 3 === 0 ? 'Wrong Answer String' : 'Correct Answer String'
}));

const ITEMS_PER_PAGE = 5;

const ReviewAnswersView = () => {
    const [currentPage, setCurrentPage] = useState(1);

    // Logic xử lý dữ liệu
    const totalItems = ALL_QUESTIONS.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentQuestions = ALL_QUESTIONS.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const correctCount = ALL_QUESTIONS.filter(q => q.userAnswer === q.correctAnswer).length;
    const incorrectCount = totalItems - correctCount;

    return (
        <View style={styles.container}>
            <DetailHeader
                title="Review Answers"
                subtitle={`${correctCount} correct, ${incorrectCount} incorrect`}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* 1. Stats Overview */}
                <ReviewStats correct={correctCount} incorrect={incorrectCount} />

                {/* 2. List Questions */}
                <View style={styles.listContainer}>
                    {currentQuestions.map((q, index) => (
                        <ReviewItem
                            key={q.id}
                            index={startIndex + index}
                            question={q}
                            userAnswer={q.userAnswer}
                        />
                    ))}
                </View>

                {/* 3. PHẦN PHÂN TRANG ĐÃ SỬA LỖI CĂN LỀ */}
                {totalPages > 1 && (
                    <View style={styles.paginationWrapper}>
                        <AppButton
                            title="Prev"
                            variant="outline"
                            onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            icon="chevron-back"
                            // style dùng flex để nội dung bên trong nút có thể căn giữa
                            style={StyleSheet.flatten([styles.pageBtn, { width: 'auto' }])}
                        />

                        <View style={styles.pageIndicator}>
                            <AppText size="sm" weight="bold" color={theme.colors.text.secondary}>
                                {currentPage} / {totalPages}
                            </AppText>
                        </View>

                        <AppButton
                            title="Next"
                            variant="outline"
                            onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            icon="chevron-forward"
                            // QUAN TRỌNG: Thêm prop iconRight để đẩy icon sang bên phải chữ
                            iconRight={true}
                            style={StyleSheet.flatten([styles.pageBtn, { width: 'auto' }])}
                        />
                    </View>
                )}

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: theme.spacing.md,
    },
    listContainer: {
        marginTop: theme.spacing.md,
    },
    paginationWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing.lg,
        paddingHorizontal: theme.spacing.xs,
    },
    pageBtn: {
        flex: 0.38,
        height: 42,
        marginBottom: 0,
        paddingVertical: 0,
        // Đảm bảo nội dung bên trong AppButton (icon và text) luôn căn giữa
        justifyContent: 'center',
        alignItems: 'center',
    },
    pageIndicator: {
        flex: 0.24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomSpacer: {
        height: theme.spacing.xxl,
    }
});

export default ReviewAnswersView;